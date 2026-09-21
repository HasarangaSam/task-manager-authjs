import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { generateResetToken, hashResetToken } from "@/lib/password-reset";
import { transporter } from "@/lib/mailer";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address",
        },
        {
          status: 400,
        },
      );
    }

    const { email } = result.data;

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists for this email, a password reset link has been sent.",
      });
    }

    const resetToken = generateResetToken();

    const tokenHash = hashResetToken(resetToken);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordResetToken.deleteMany({
      userId: user._id,
    });

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Reset your Task Manager password",

      text: `
You requested a password reset.

Use the following link to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request this password reset, you can safely ignore this email.
      `.trim(),
    });

    return NextResponse.json({
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

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
