import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";

const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(100, "Title must be 100 characters or less")
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000, "Description must be 1000 characters or less")
      .optional(),

    status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),

    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
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
    const status = url.searchParams.get("status") || "";
    const priority = url.searchParams.get("priority") || "";
    const userId = url.searchParams.get("userId") || "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("limit") || "30")),
    );
    const skip = (page - 1) * limit;

    await connectDB();

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (status && ["TODO", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      query.status = status;
    }

    if (priority && ["LOW", "MEDIUM", "HIGH"].includes(priority)) {
      query.priority = priority;
    }

    if (userId) {
      query.userId = userId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("userId", "_id name email image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query),
    ]);

    // Serialize the populated tasks
    const serializedTasks = tasks.map((task) => {
      const t = task.toObject();
      const user = t.userId as unknown as {
        _id: { toString(): string };
        name: string;
        email: string;
        image?: string;
      } | null;

      return {
        _id: t._id.toString(),
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        user: user
          ? {
              _id: user._id.toString(),
              name: user.name,
              email: user.email,
              image: user.image,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      tasks: serializedTasks,
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

    console.error("Admin get tasks error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const taskId = url.searchParams.get("id");

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: "Task ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const result = updateTaskSchema.safeParse(body);

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

    const task = await Task.findByIdAndUpdate(
      taskId,
      { $set: result.data },
      { new: true, runValidators: true },
    ).populate("userId", "_id name email image");

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    const errResponse = handleAdminError(error);
    if (errResponse) return errResponse;

    console.error("Admin update task error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const taskId = url.searchParams.get("id");

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: "Task ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    const errResponse = handleAdminError(error);
    if (errResponse) return errResponse;

    console.error("Admin delete task error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
