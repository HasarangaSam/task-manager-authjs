import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Task from "@/models/Task";

const updateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

function handleAdminError(error: unknown) {
  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  if (error instanceof Error && error.message === "Forbidden") {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  return null;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(url.searchParams.get("limit") || "20")),
    );
    const skip = (page - 1) * limit;

    await connectDB();

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select("_id name email image role createdAt emailVerified")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    // Get task counts for each user
    const userIds = users.map((u) => u._id);
    const taskCounts = await Task.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);

    const taskCountMap: Record<string, number> = {};
    for (const entry of taskCounts) {
      taskCountMap[entry._id.toString()] = entry.count;
    }

    const usersWithTaskCount = users.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      createdAt: u.createdAt,
      emailVerified: u.emailVerified,
      taskCount: taskCountMap[u._id.toString()] || 0,
    }));

    return NextResponse.json({
      success: true,
      users: usersWithTaskCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const errResponse = handleAdminError(error);
    if (errResponse) return errResponse;

    console.error("Admin get users error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const adminUser = await requireAdmin();

    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { role: result.data.role } },
      { new: true, runValidators: true },
    ).select("_id name email role");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Prevent demoting yourself
    if (
      userId === adminUser._id.toString() &&
      result.data.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, message: "You cannot change your own role" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    const errResponse = handleAdminError(error);
    if (errResponse) return errResponse;

    console.error("Admin update user error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const adminUser = await requireAdmin();

    const url = new URL(request.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    // Prevent deleting yourself
    if (userId === adminUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own account" },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Also delete all of this user's tasks
    await Task.deleteMany({ userId });

    return NextResponse.json({
      success: true,
      message: "User and their tasks deleted successfully",
    });
  } catch (error) {
    const errResponse = handleAdminError(error);
    if (errResponse) return errResponse;

    console.error("Admin delete user error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
