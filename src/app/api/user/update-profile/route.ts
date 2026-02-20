import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireApiAuth } from "@/lib/api-auth";

export async function PUT(req: Request) {
  try {
    await connectDB();

    const auth = await requireApiAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, companyName } = body;

    const user = await User.findById(auth.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (user.role === "photographer" && companyName !== undefined) {
      user.companyName = companyName;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        role: user.role,
        companyName: user.companyName || "",
        profilePhoto: user.profilePhoto || "",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
