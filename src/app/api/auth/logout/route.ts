import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    const auth = await requireApiAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
