import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getRazorpay } from "@/lib/razorpay";
import { finalizePaidPayment } from "@/lib/billing";

import Payment from "@/models/Payment";

export const runtime = "nodejs";

type RazorpayPaymentSummary = {
  id?: string;
  status?: string;
};

export async function POST(req: Request) {
  try {
    await connectDB();

    const admin = await requireAdminAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { days } = await req.json().catch(() => ({
      days: 7,
    }));

    const lookbackDays =
      typeof days === "number" && days > 0
        ? Math.min(days, 30)
        : 7;

    const since = new Date(
      Date.now() - lookbackDays * 24 * 60 * 60 * 1000
    );

    const pending = await Payment.find({
      status: "pending",
      createdAt: { $gte: since },
    }).limit(200);

    const razorpay = getRazorpay();
    let reconciled = 0;
    let checked = 0;

    for (const payment of pending) {
      checked += 1;
      try {
        const list = await razorpay.orders.fetchPayments(
          payment.razorpayOrderId
        );
        const items = list?.items || [];
        const captured = items.find(
          (p: RazorpayPaymentSummary) =>
            p.status === "captured"
        );

        if (!captured) continue;

        payment.lastWebhookEvent = "reconcile";
        payment.lastWebhookAt = new Date();
        await payment.save();

        await finalizePaidPayment({
          payment,
          source: "reconcile",
          razorpayPaymentId:
            captured.id || "",
        });

        reconciled += 1;
      } catch (err) {
        console.error("Reconcile error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      checked,
      reconciled,
      lookbackDays,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
