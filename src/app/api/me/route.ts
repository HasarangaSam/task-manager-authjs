import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await requireUser();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
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
}
