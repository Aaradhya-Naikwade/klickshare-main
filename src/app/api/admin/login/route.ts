import { NextResponse } from "next/server";
import { signAdminToken } from "@/lib/admin-jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const adminEmail =
      process.env.ADMIN_EMAIL || "";
    const adminPassword =
      process.env.ADMIN_PASSWORD || "";
    const adminJwtSecret =
      process.env.ADMIN_JWT_SECRET || "";

    if (
      !adminEmail ||
      !adminPassword ||
      !adminJwtSecret
    ) {
      return NextResponse.json(
        {
          error:
            "Admin credentials or JWT secret not set",
        },
        { status: 500 }
      );
    }

    if (
      String(email || "").trim() !==
        adminEmail ||
      String(password || "") !== adminPassword
    ) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signAdminToken(adminEmail);

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
