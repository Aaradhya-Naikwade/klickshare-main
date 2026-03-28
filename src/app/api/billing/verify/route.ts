import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";
import { getPlanByKey, isPlanKey } from "@/lib/plans";
import { activatePaidPlan } from "@/lib/subscription";
import { getRazorpay } from "@/lib/razorpay";

import Payment from "@/models/Payment";

export const runtime = "nodejs";

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

    const shouldVerifyOrder =
      process.env.RAZORPAY_VERIFY_ORDER !==
      "0";

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

    if (shouldVerifyOrder) {
      const razorpay = getRazorpay();
      const order = await razorpay.orders.fetch(
        razorpay_order_id
      );

      if (
        typeof order?.amount === "number" &&
        payment.orderAmount > 0 &&
        order.amount !== payment.orderAmount
      ) {
        return NextResponse.json(
          { error: "Order amount mismatch" },
          { status: 400 }
        );
      }

      if (
        order?.currency &&
        payment.orderCurrency &&
        order.currency !== payment.orderCurrency
      ) {
        return NextResponse.json(
          { error: "Order currency mismatch" },
          { status: 400 }
        );
      }

      if (
        typeof order?.amount_paid ===
          "number" &&
        typeof order?.amount ===
          "number" &&
        order.amount_paid < order.amount
      ) {
        return NextResponse.json(
          { error: "Payment not captured" },
          { status: 400 }
        );
      }
    }

    if (payment.status !== "paid") {
      payment.razorpayPaymentId =
        razorpay_payment_id;
      payment.razorpaySignature =
        razorpay_signature;
      payment.status = "paid";
      (payment.statusHistory ||= []).push({
        status: "paid",
        source: "verify",
        at: new Date(),
      });
      await payment.save();

      const planDoc = await getPlanByKey(planKey);
      const planQuota =
        payment.planQuota > 0
          ? payment.planQuota
          : planDoc?.quota;

      await activatePaidPlan(
        auth.userId,
        planKey,
        payment.amount,
        planQuota
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
