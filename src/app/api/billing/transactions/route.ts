import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";

import Payment from "@/models/Payment";

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

    const payments = await Payment.find({
      userId: auth.userId,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      payments: payments.map((p) => ({
        _id: p._id.toString(),
        planKey: p.planKey,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        razorpayOrderId:
          p.razorpayOrderId,
        razorpayPaymentId:
          p.razorpayPaymentId,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
