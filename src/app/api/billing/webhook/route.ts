import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/db";
import { activatePaidPlan } from "@/lib/subscription";
import { getPlanByKey, isPlanKey } from "@/lib/plans";
import { getRazorpay } from "@/lib/razorpay";
import PaymentEvent from "@/models/PaymentEvent";

import Payment from "@/models/Payment";

export const runtime = "nodejs";

function verifyWebhookSignature(
  body: string,
  signature: string
) {
  const secret =
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    "";

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expected === signature;
}

export async function POST(
  req: Request
) {
  try {
    await connectDB();

    const signature =
      req.headers.get(
        "x-razorpay-signature"
      ) || "";

    const rawBody = await req.text();

    const headersObj: Record<string, string> =
      {};
    req.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    let event: any = null;
    try {
      event = JSON.parse(rawBody);
    } catch {
      event = null;
    }

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 500 }
      );
    }

    const signatureValid = verifyWebhookSignature(
      rawBody,
      signature
    );

    const paymentEntityForLog =
      event?.payload?.payment?.entity;
    const logOrderId =
      paymentEntityForLog?.order_id ||
      event?.payload?.order?.entity?.id ||
      "unknown";
    const logPaymentId =
      paymentEntityForLog?.id || "";

    await PaymentEvent.create({
      razorpayOrderId: logOrderId,
      razorpayPaymentId: logPaymentId,
      event: event?.event || "unknown",
      signatureValid,
      payload: event || { raw: rawBody },
      headers: headersObj,
    });

    if (!signatureValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const eventType = event?.event || "";

    if (
      eventType !== "payment.captured" &&
      eventType !== "payment.failed"
    ) {
      return NextResponse.json({
        ok: true,
      });
    }

    const paymentEntity =
      event?.payload?.payment
        ?.entity;

    const orderId =
      paymentEntity?.order_id;
    const paymentId =
      paymentEntity?.id;

    if (!orderId || !paymentId) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const payment =
      await Payment.findOne({
        razorpayOrderId: orderId,
      });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const shouldVerifyOrder =
      process.env.RAZORPAY_VERIFY_ORDER !==
      "0";

    payment.lastWebhookEvent =
      eventType || "";
    payment.lastWebhookAt = new Date();

    const wasPaid = payment.status === "paid";
    const wasFailed = payment.status === "failed";

    if (eventType === "payment.failed") {
      if (!wasPaid && !wasFailed) {
        payment.status = "failed";
        (payment.statusHistory ||= []).push({
          status: "failed",
          source: "webhook",
          at: new Date(),
        });
      }
      await payment.save();
      return NextResponse.json({ success: true });
    }

    if (shouldVerifyOrder) {
      const razorpay = getRazorpay();
      const order = await razorpay.orders.fetch(
        orderId
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
    }

    if (!wasPaid) {
      payment.status = "paid";
      payment.razorpayPaymentId =
        paymentId;
      (payment.statusHistory ||= []).push({
        status: "paid",
        source: "webhook",
        at: new Date(),
      });
    }

    await payment.save();

    if (!wasPaid) {
      if (!isPlanKey(payment.planKey)) {
        return NextResponse.json(
          { error: "Invalid plan" },
          { status: 400 }
        );
      }

      const planDoc = await getPlanByKey(
        payment.planKey
      );
      const planQuota =
        payment.planQuota > 0
          ? payment.planQuota
          : planDoc?.quota;

      await activatePaidPlan(
        payment.userId.toString(),
        payment.planKey,
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
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}
