import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { phone, otp } =
      await req.json();

    const normalizedPhone = String(phone).trim();
    const normalizedOtp = String(otp).trim();

    const user = await User.findOne({
      phone: normalizedPhone,
    });

    if (!user) {
      return NextResponse.json({
        exists: false,
      });
    }

    const otpRecord = await Otp.findOne({
      phone: normalizedPhone,
      consumedAt: null,
    }).sort({ createdAt: -1 });

    if (
      !otpRecord ||
      otpRecord.expiresAt < new Date() ||
      otpRecord.otp !== normalizedOtp
    ) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    otpRecord.consumedAt = new Date();
    await otpRecord.save();

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
    });

    return NextResponse.json({
      exists: true,
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}


