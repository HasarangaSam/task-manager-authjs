import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";

const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),

  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),

  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

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

function getTaskId(request: Request) {
  const url = new URL(request.url);

  return url.searchParams.get("id");
}

export async function GET(request: Request) {
  try {
    const user = await requireUser();

    await connectDB();

    const tasks = await Task.find({
      userId: user._id,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    console.error("Get tasks error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const body = await request.json();

    const result = createTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: result.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    await connectDB();

    const task = await Task.create({
      ...result.data,
      userId: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    console.error("Create task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();

    const taskId = getTaskId(request);

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          message: "Task ID is required",
        },
        {
          status: 400,
        },
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
        {
          status: 400,
        },
      );
    }

    await connectDB();

    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        userId: user._id,
      },
      {
        $set: result.data,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    console.error("Update task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();

    const taskId = getTaskId(request);

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          message: "Task ID is required",
        },
        {
          status: 400,
        },
      );
    }

    await connectDB();

    const task = await Task.findOneAndDelete({
      _id: taskId,
      userId: user._id,
    });

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    console.error("Delete task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
