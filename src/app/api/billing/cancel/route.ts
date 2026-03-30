import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";
import Payment from "@/models/Payment";

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

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    const payment = await Payment.findOne({
      razorpayOrderId: orderId,
      userId: auth.userId,
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    if (payment.status === "paid") {
      return NextResponse.json(
        { error: "Payment already paid" },
        { status: 400 }
      );
    }

    if (payment.status !== "canceled") {
      payment.status = "canceled";
      payment.canceledAt = new Date();
      (payment.statusHistory ||= []).push({
        status: "canceled",
        source: "cancel",
        at: new Date(),
      });
      await payment.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Cancel failed" },
      { status: 500 }
    );
  }
}
