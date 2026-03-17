import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Otp from "@/models/Otp";
import SendSMS from "@/lib/sendSMS";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { phone } = await req.json();

    if (!phone)
      return NextResponse.json(
        { error: "Phone required" },
        { status: 400 }
      );

    const normalizedPhone = String(phone).trim();

    if (!/^\d{10}$/.test(normalizedPhone))
      return NextResponse.json(
        { error: "Enter valid 10 digit phone" },
        { status: 400 }
      );

    const existingUser = await User.findOne({
      phone: normalizedPhone,
    }).select("_id");

    const OTP = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await Otp.create({
      phone: normalizedPhone,
      otp: OTP,
      expiresAt,
    });

    const OTPTEMP01 =
      process.env.OTPTEMP01 ||
      "1707171212151951543";

    const smsResult = await SendSMS.Send(
      normalizedPhone,
      "Dear User, Your OTP for Login Haltn is " +
        OTP +
        ". Please do not share it. With Regards Haltn",
      OTPTEMP01
    );

    if (
      !smsResult ||
      smsResult.startsWith("ERROR:")
    ) {
      await Otp.deleteOne({
        phone: normalizedPhone,
        otp: OTP,
      });
      console.error(
        "SMS send failed:",
        smsResult
      );
      return NextResponse.json(
        {
          error: "SMS send failed",
          gatewayResponse: smsResult,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      exists: Boolean(existingUser),
      gatewayResponse: smsResult,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
