import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { hashResetToken } from "@/lib/password-reset";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = resetPasswordSchema.safeParse(body);

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

    const { token, password } = result.data;

    const tokenHash = hashResetToken(token);

    await connectDB();

    const resetToken = await PasswordResetToken.findOne({
      tokenHash,
    });

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired reset link",
        },
        {
          status: 400,
        },
      );
    }

    if (resetToken.expiresAt <= new Date()) {
      await PasswordResetToken.deleteOne({
        _id: resetToken._id,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired reset link",
        },
        {
          status: 400,
        },
      );
    }

    const user = await User.findById(resetToken.userId).select("+password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired reset link",
        },
        {
          status: 400,
        },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.sessionVersion = (user.sessionVersion ?? 0) + 1;

    await user.save();

    await PasswordResetToken.deleteOne({
      _id: resetToken._id,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

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
