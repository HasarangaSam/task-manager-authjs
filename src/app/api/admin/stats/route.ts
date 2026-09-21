import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Task from "@/models/Task";

export async function GET() {
  try {
    await requireAdmin();

    await connectDB();

    const [totalUsers, totalTasks, completedTasks, tasksByUser] =
      await Promise.all([
        User.countDocuments(),
        Task.countDocuments(),
        Task.countDocuments({ status: "COMPLETED" }),
        Task.aggregate([
          { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]),
      ]);

    const activeUsers = tasksByUser.length;

    const todoTasks = await Task.countDocuments({ status: "TODO" });
    const inProgressTasks = await Task.countDocuments({
      status: "IN_PROGRESS",
    });

    const completionRate =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalTasks,
        completedTasks,
        todoTasks,
        inProgressTasks,
        activeUsers,
        completionRate,
      },
    });
  } catch (error) {
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

    console.error("Admin stats error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
