import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/db";
import { finalizePaidPayment } from "@/lib/billing";
import PaymentEvent from "@/models/PaymentEvent";

import Payment from "@/models/Payment";

export const runtime = "nodejs";

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
      };
    };
    order?: {
      entity?: {
        id?: string;
      };
    };
  };
};

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

    let event: RazorpayWebhookEvent | null =
      null;
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

    payment.lastWebhookEvent =
      eventType || "";
    payment.lastWebhookAt = new Date();

    const wasPaid = payment.status === "paid";
    const wasClosed =
      payment.status === "failed" ||
      payment.status === "canceled";

    if (eventType === "payment.failed") {
      if (!wasPaid && !wasClosed) {
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

    await payment.save();

    await finalizePaidPayment({
      payment,
      source: "webhook",
      razorpayPaymentId: paymentId,
      skipCaptureCheck: true,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error
        ? error.message
        : "Webhook failed";
    return NextResponse.json(
      { error: message },
      { status: getErrorStatus(message) }
    );
  }
}
