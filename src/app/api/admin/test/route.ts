import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await requireAdmin();

    return NextResponse.json({
      success: true,
      message: "You have admin access",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
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

    return NextResponse.json(
      {
        success: false,
        message: "Forbidden",
      },
      {
        status: 403,
      },
    );
  }
}
