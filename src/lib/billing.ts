import { getPlanByKey, isPlanKey } from "@/lib/plans";
import { getRazorpay } from "@/lib/razorpay";
import Payment from "@/models/Payment";
import UserPlan from "@/models/UserPlan";

type PaymentLike = {
  _id: {
    toString(): string;
  };
  userId: {
    toString(): string;
  };
  planKey: string;
  amount: number;
  planQuota: number;
  orderAmount: number;
  orderCurrency: string;
  razorpayOrderId: string;
  statusHistory?: Array<{
    status: string;
    at?: Date | string | null;
  }>;
  paidAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  planActivatedAt?: Date | null;
};

type RazorpayPaymentSummary = {
  id?: string;
  status?: string;
};

type FinalizePaidPaymentArgs = {
  payment: PaymentLike;
  source: "verify" | "webhook" | "reconcile";
  razorpayPaymentId: string;
  razorpaySignature?: string;
  skipCaptureCheck?: boolean;
};

export async function verifyOrderSnapshot(
  payment: PaymentLike,
  options?: {
    requireCaptured?: boolean;
  }
) {
  const shouldVerifyOrder =
    process.env.RAZORPAY_VERIFY_ORDER !== "0";

  if (!shouldVerifyOrder) {
    return null;
  }

  const razorpay = getRazorpay();
  const order = await razorpay.orders.fetch(
    payment.razorpayOrderId
  );

  if (
    typeof order?.amount === "number" &&
    payment.orderAmount > 0 &&
    order.amount !== payment.orderAmount
  ) {
    throw new Error("Order amount mismatch");
  }

  if (
    order?.currency &&
    payment.orderCurrency &&
    order.currency !== payment.orderCurrency
  ) {
    throw new Error("Order currency mismatch");
  }

  if (
    options?.requireCaptured &&
    typeof order?.amount_paid === "number" &&
    typeof order?.amount === "number" &&
    order.amount_paid < order.amount
  ) {
    throw new Error("Payment not captured");
  }

  return order;
}

export async function finalizePaidPayment(
  args: FinalizePaidPaymentArgs
) {
  const {
    payment,
    source,
    razorpayPaymentId,
    razorpaySignature = "",
    skipCaptureCheck = false,
  } = args;

  if (!isPlanKey(payment.planKey)) {
    throw new Error("Invalid plan");
  }

  await verifyOrderSnapshot(payment, {
    requireCaptured: !skipCaptureCheck,
  });

  const now = new Date();

  const updatedPayment =
    await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        status: {
          $nin: ["paid", "failed", "canceled"],
        },
      },
      {
        $set: {
          status: "paid",
          paidAt: now,
          razorpayPaymentId,
          ...(razorpaySignature
            ? {
                razorpaySignature,
              }
            : {}),
          ...(source === "webhook"
            ? {
                lastWebhookEvent:
                  "payment.captured",
                lastWebhookAt: now,
              }
            : {}),
        },
        $push: {
          statusHistory: {
            status: "paid",
            source,
            at: now,
          },
        },
      },
      { returnDocument: "after" }
    );

  const currentPayment =
    updatedPayment ||
    (await Payment.findById(payment._id));

  if (!currentPayment) {
    throw new Error("Payment not found");
  }

  if (currentPayment.status === "canceled") {
    throw new Error("Payment canceled");
  }

  if (currentPayment.status === "failed") {
    throw new Error("Payment failed");
  }

  if (
    !currentPayment.paidAt &&
    currentPayment.status === "paid"
  ) {
    await Payment.updateOne(
      {
        _id: currentPayment._id,
        paidAt: null,
      },
      {
        $set: {
          paidAt: now,
        },
      }
    );
  }

  await syncLatestPaidPlan(
    currentPayment.userId.toString()
  );

  return updatedPayment
    ? { payment: updatedPayment, wasAlreadyPaid: false }
    : { payment: currentPayment, wasAlreadyPaid: true };
}

function toTimestamp(
  value?: Date | string | null
) {
  if (!value) return 0;
  const date = new Date(value);
  const time = date.getTime();
  return Number.isFinite(time) ? time : 0;
}

function getEffectivePaidAt(
  payment: PaymentLike
) {
  const fromField = toTimestamp(payment.paidAt);
  if (fromField > 0) {
    return fromField;
  }

  const paidHistory =
    payment.statusHistory
      ?.filter(
        (entry) => entry.status === "paid"
      )
      .map((entry) => toTimestamp(entry.at))
      .filter((value) => value > 0) || [];

  if (paidHistory.length > 0) {
    return Math.max(...paidHistory);
  }

  return toTimestamp(payment.createdAt);
}

async function ensureStablePaidAt(
  payment: PaymentLike
) {
  const effectivePaidAt =
    getEffectivePaidAt(payment);

  if (
    effectivePaidAt > 0 &&
    !payment.paidAt
  ) {
    await Payment.updateOne(
      { _id: payment._id, paidAt: null },
      {
        $set: {
          paidAt: new Date(
            effectivePaidAt
          ),
        },
      }
    );
  }

  return effectivePaidAt;
}

async function getLatestPaidPayment(
  userId: string
) {
  const paidPayments = await Payment.find({
    userId,
    status: "paid",
  }).select(
    "_id userId planKey amount planQuota orderAmount orderCurrency razorpayOrderId statusHistory paidAt createdAt updatedAt planActivatedAt"
  );

  if (paidPayments.length === 0) {
    return null;
  }

  const paymentsWithPaidAt =
    await Promise.all(
      paidPayments.map(async (payment) => ({
        payment,
        effectivePaidAt:
          await ensureStablePaidAt(payment),
      }))
    );

  return paymentsWithPaidAt.reduce(
    (latest, current) => {
      if (!latest) return current;

      return current.effectivePaidAt >
        latest.effectivePaidAt
        ? current
        : latest;
    },
    paymentsWithPaidAt[0]
  ).payment;
}

export async function reconcilePendingPayments(
  userId: string
) {
  const pendingPayments = await Payment.find({
    userId,
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .limit(10);

  if (pendingPayments.length === 0) {
    return 0;
  }

  const razorpay = getRazorpay();
  let reconciled = 0;

  for (const payment of pendingPayments) {
    try {
      const list =
        await razorpay.orders.fetchPayments(
          payment.razorpayOrderId
        );
      const items =
        (list?.items ||
          []) as RazorpayPaymentSummary[];
      const captured = items.find(
        (item) =>
          item.status === "captured"
      );

      if (!captured?.id) {
        continue;
      }

      await finalizePaidPayment({
        payment,
        source: "reconcile",
        razorpayPaymentId: captured.id,
      });
      reconciled += 1;
    } catch (error) {
      console.error(
        "Pending payment reconcile failed:",
        error
      );
    }
  }

  return reconciled;
}

export async function syncLatestPaidPlan(
  userId: string
) {
  const latestPaidPayment =
    await getLatestPaidPayment(userId);

  if (!latestPaidPayment) {
    return null;
  }

  if (!isPlanKey(latestPaidPayment.planKey)) {
    return null;
  }

  const now = new Date();

  const activePlan = await UserPlan.findOne({
    userId,
    status: "active",
    planEnd: { $gt: now },
  }).sort({ planEnd: -1 });

  if (
    activePlan?.sourcePaymentId?.toString() ===
      latestPaidPayment._id.toString() &&
    activePlan.planKey ===
      latestPaidPayment.planKey
  ) {
    return activePlan;
  }

  const planDoc = await getPlanByKey(
    latestPaidPayment.planKey
  );
  const planQuota =
    latestPaidPayment.planQuota > 0
      ? latestPaidPayment.planQuota
      : planDoc?.quota;
  let syncedPlan;

  if (activePlan) {
    syncedPlan =
      await UserPlan.collection.findOneAndUpdate(
        {
          _id: activePlan._id,
        },
        {
          $set: {
            planKey: latestPaidPayment.planKey,
            priceInr: latestPaidPayment.amount,
            planQuota,
            sourcePaymentId:
              latestPaidPayment._id,
            updatedAt: now,
          },
        },
        {
          returnDocument: "after",
        }
      );

    await UserPlan.collection.updateMany(
      {
        userId: latestPaidPayment.userId,
        status: "active",
        _id: { $ne: activePlan._id },
      },
      {
        $set: {
          status: "expired",
          planEnd: now,
          updatedAt: now,
        },
      }
    );
  } else {
    const planStart = now;
    const planEnd = new Date(
      now.getTime() +
        365 * 24 * 60 * 60 * 1000
    );

    syncedPlan =
      await UserPlan.collection.findOneAndUpdate(
        {
          sourcePaymentId:
            latestPaidPayment._id,
        },
        {
          $set: {
            userId: latestPaidPayment.userId,
            planKey: latestPaidPayment.planKey,
            planStart,
            planEnd,
            status: "active",
            priceInr: latestPaidPayment.amount,
            planQuota,
            sourcePaymentId:
              latestPaidPayment._id,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        }
      );
  }

  await Payment.updateOne(
    {
      _id: latestPaidPayment._id,
    },
    {
      $set: {
        paidAt:
          latestPaidPayment.paidAt ||
          new Date(
            getEffectivePaidAt(
              latestPaidPayment
            )
          ),
        planActivatedAt: now,
        planActivatedSource:
          "status-sync",
      },
    }
  );

  return syncedPlan;
}

export async function syncUserBillingState(
  userId: string
) {
  if (
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET
  ) {
    await reconcilePendingPayments(userId);
  }

  return syncLatestPaidPlan(userId);
}
