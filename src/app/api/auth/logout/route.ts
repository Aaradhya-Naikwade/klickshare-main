import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { requireApiAuth } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const auth = await requireApiAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await Session.updateOne(
      { token: auth.token },
      { isActive: false }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
