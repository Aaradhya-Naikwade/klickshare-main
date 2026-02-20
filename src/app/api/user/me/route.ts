import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";

import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();

    const auth = await requireApiAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(auth.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      role: user.role,
      companyName: user.companyName || "",
      profilePhoto: user.profilePhoto || "",
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
