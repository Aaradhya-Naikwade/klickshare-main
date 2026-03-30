import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";
import { isPlanKey } from "@/lib/plans";
import { finalizePaidPayment } from "@/lib/billing";

import Payment from "@/models/Payment";

export const runtime = "nodejs";

function getErrorStatus(message: string) {
  if (
    message === "Payment not found"
  ) {
    return 404;
  }

  if (
    message === "Invalid plan" ||
    message === "Order amount mismatch" ||
    message === "Order currency mismatch" ||
    message === "Payment not captured" ||
    message === "Payment canceled" ||
    message === "Payment failed"
  ) {
    return 400;
  }

  return 500;
}

function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const keySecret =
    process.env.RAZORPAY_KEY_SECRET ||
    "";

  const hmac = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return hmac === signature;
}

export async function POST(
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

    const {
      planKey,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (
      !planKey ||
      !isPlanKey(planKey) ||
      planKey === "free"
    ) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Invalid payment data" },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 500 }
      );
    }

    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const payment =
      await Payment.findOne({
        razorpayOrderId:
          razorpay_order_id,
        userId: auth.userId,
      });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    if (payment.planKey !== planKey) {
      return NextResponse.json(
        { error: "Plan mismatch" },
        { status: 400 }
      );
    }

    await finalizePaidPayment({
      payment,
      source: "verify",
      razorpayPaymentId:
        razorpay_payment_id,
      razorpaySignature:
        razorpay_signature,
    });

    return NextResponse.json({
      success: true,
      status: "paid",
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error
        ? error.message
        : "Verification failed";
    return NextResponse.json(
      { error: message },
      { status: getErrorStatus(message) }
    );
  }
}
