import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";
import { syncUserBillingState } from "@/lib/billing";

import Payment from "@/models/Payment";

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
    
    const payments = await Payment.find({
      userId: auth.userId,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(
      {
        success: true,
        keyId: process.env.RAZORPAY_KEY_ID || "",
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
          orderAmount: p.orderAmount || 0,
          orderCurrency: p.orderCurrency || p.currency,
          canceledAt: p.canceledAt || null,
          createdAt: p.createdAt,
        })),
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
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
