import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";
import { syncUserBillingState } from "@/lib/billing";
import { getPlanStatus } from "@/lib/subscription";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: Request
) {
  try {
    await connectDB();

    const auth = await requireApiAuth(
      req
    );
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await syncUserBillingState(auth.userId);

    const status = await getPlanStatus(
      auth.userId
    );

    return NextResponse.json(
      {
        success: true,
        status,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
