import { NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/admin-auth";

export async function GET(req: Request) {
  try {
    const admin = await requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        email: admin.email,
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
