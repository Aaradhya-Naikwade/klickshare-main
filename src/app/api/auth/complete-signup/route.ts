
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
  try {
    await connectDB();

    const {
      phone,
      role,
      name,
      companyName,
      otp,
    } = await req.json();

    const normalizedPhone = String(phone).trim();
    const normalizedOtp = String(otp).trim();

    const existingUser = await User.findOne({
      phone: normalizedPhone,
    }).select("_id");

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
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
    
    const newUser =
      await User.create({
        phone: normalizedPhone,
        role,
        name,
        companyName:
          role === "photographer"
            ? companyName
            : "",
        lastLoginAt: new Date(),
      });

    const token = signToken({
      userId: newUser._id.toString(),
    });

    return NextResponse.json({
      token,  
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
