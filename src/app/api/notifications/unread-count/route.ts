import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";

import Notification from "@/models/Notification";

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

    const count = await Notification.countDocuments({
      userId: auth.userId,
      read: false,
    });

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
