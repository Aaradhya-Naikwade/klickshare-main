import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import Payment from "@/models/Payment";
import User from "@/models/User";

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
    const status = searchParams.get("status");
    const limitParam = Number(
      searchParams.get("limit") || "50"
    );
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(limitParam, 200)
        : 50;

    const query: Record<string, string> = {};
    if (
      status === "pending" ||
      status === "paid" ||
      status === "failed" ||
      status === "canceled"
    ) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    const userIds = [
      ...new Set(
        payments.map((p) => p.userId?.toString())
      ),
    ];

    const users = await User.find({
      _id: { $in: userIds },
    }).select("name phone role");

    const userMap = new Map(
      users.map((u) => [u._id.toString(), u])
    );

    return NextResponse.json({
      success: true,
      count: payments.length,
      payments: payments.map((p) => {
        const u = userMap.get(
          p.userId?.toString?.() || ""
        );
        return {
          _id: p._id.toString(),
          userId: p.userId,
          user: u
            ? {
                _id: u._id.toString(),
                name: u.name,
                phone: u.phone,
                role: u.role,
              }
            : null,
          planKey: p.planKey,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          razorpayOrderId: p.razorpayOrderId,
          razorpayPaymentId: p.razorpayPaymentId,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          statusHistory: p.statusHistory || [],
        };
      }),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
