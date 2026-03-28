import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import PaymentEvent from "@/models/PaymentEvent";

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

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const paymentId = searchParams.get("paymentId");

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { error: "orderId or paymentId required" },
        { status: 400 }
      );
    }

    const query: any = {};
    if (orderId) query.razorpayOrderId = orderId;
    if (paymentId) query.razorpayPaymentId = paymentId;

    const logs = await PaymentEvent.find(query)
      .sort({ receivedAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

