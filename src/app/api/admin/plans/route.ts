import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getPlanCatalog, isPlanKey } from "@/lib/plans";
import Plan from "@/models/Plan";

export async function GET(req: Request) {
  try {
    await connectDB();

    const admin = await requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const plans = await getPlanCatalog();
    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    const admin = await requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { key, priceInr, quota, label, isActive } = body;

    if (!key || !isPlanKey(String(key))) {
      return NextResponse.json(
        { error: "Invalid plan key" },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (priceInr !== undefined) {
      const n = Number(priceInr);
      if (Number.isNaN(n) || n < 0) {
        return NextResponse.json(
          { error: "Invalid price" },
          { status: 400 }
        );
      }
      updates.priceInr = n;
    }
    if (quota !== undefined) {
      const n = Number(quota);
      if (Number.isNaN(n) || n < 0) {
        return NextResponse.json(
          { error: "Invalid quota" },
          { status: 400 }
        );
      }
      updates.quota = n;
    }
    if (label !== undefined) {
      updates.label = String(label).trim();
    }
    if (isActive !== undefined) {
      updates.isActive = Boolean(isActive);
    }

    const updated = await Plan.findOneAndUpdate(
      { key },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    const plans = await getPlanCatalog();
    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

