import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";
import { getRazorpay } from "@/lib/razorpay";
import { getPlanByKey, isPlanKey } from "@/lib/plans";
import { getPlanStatus } from "@/lib/subscription";

import Payment from "@/models/Payment";
import User from "@/models/User";

export const runtime = "nodejs";

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

    const user = await User.findById(auth.userId).select(
      "role"
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "photographer") {
      return NextResponse.json(
        { error: "Only photographers can buy plans" },
        { status: 403 }
      );
    }

    const { planKey } = await req.json();

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

    const plan = await getPlanByKey(planKey);

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    const currentStatus =
      await getPlanStatus(auth.userId);

    if (currentStatus.planKey === planKey) {
      return NextResponse.json(
        {
          error:
            "This plan is already active on your account",
        },
        { status: 400 }
      );
    }

    const existingPendingPayment =
      await Payment.findOne({
        userId: auth.userId,
        planKey,
        status: "pending",
      }).sort({ createdAt: -1 });

    if (existingPendingPayment) {
      return NextResponse.json({
        orderId:
          existingPendingPayment.razorpayOrderId,
        amount:
          existingPendingPayment.orderAmount,
        currency:
          existingPendingPayment.orderCurrency ||
          "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 500 }
      );
    }

    const razorpay = getRazorpay();

    const shortUser =
      String(auth.userId).slice(0, 8);
    const shortTime =
      Date.now().toString(36);
    const receipt = `p_${planKey}_${shortUser}_${shortTime}`.slice(
      0,
      40
    );

    const order = await razorpay.orders.create({
      amount: plan.priceInr * 100,
      currency: "INR",
      receipt,
      notes: {
        planKey: planKey,
        userId: auth.userId,
      },
    });

    const createdPayment = await Payment.create({
      userId: auth.userId,
      planKey,
      amount: plan.priceInr,
      planQuota: plan.quota,
      orderAmount: order.amount,
      orderCurrency: order.currency,
      currency: "INR",
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          source: "create-order",
          at: new Date(),
        },
      ],
      razorpayOrderId: order.id,
    });

    await Payment.updateMany(
      {
        userId: auth.userId,
        status: "pending",
        _id: { $ne: createdPayment._id },
      },
      {
        $set: {
          status: "canceled",
          canceledAt: new Date(),
        },
        $push: {
          statusHistory: {
            status: "canceled",
            source: "superseded",
            at: new Date(),
          },
        },
      }
    );

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
