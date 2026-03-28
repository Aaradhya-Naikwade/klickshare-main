import { addYears } from "@/lib/time";
import UserPlan from "@/models/UserPlan";
import Photo from "@/models/Photo";
import {
  getPlan,
  getPlanByKey,
  isPlanKey,
  PlanKey,
} from "@/lib/plans";

export type PlanStatus = {
  planKey: PlanKey;
  planStart: Date;
  planEnd: Date;
  quota: number;
  used: number;
  remaining: number;
  priceInr: number;
};

export async function ensureActivePlan(
  userId: string
) {
  const now = new Date();

  let activePlan = await UserPlan.findOne({
    userId,
    status: "active",
    planEnd: { $gt: now },
  }).sort({ planEnd: -1 });

  if (activePlan) {
    if (!isPlanKey(activePlan.planKey)) {
      activePlan.planKey = "free";
      await activePlan.save();
    }
    return activePlan;
  }

  const planStart = now;
  const planEnd = addYears(planStart, 1);
  const freePlanDoc = await getPlanByKey("free");
  const freePrice =
    freePlanDoc?.priceInr ??
    getPlan("free").priceInr;
  const freeQuota =
    freePlanDoc?.quota ?? getPlan("free").quota;

  activePlan = await UserPlan.create({
    userId,
    planKey: "free",
    planStart,
    planEnd,
    status: "active",
    priceInr: freePrice,
    planQuota: freeQuota,
  });

  return activePlan;
}

export async function getPlanUsage(
  userId: string,
  planStart: Date,
  planEnd: Date
) {
  return Photo.countDocuments({
    uploadedBy: userId,
    createdAt: {
      $gte: planStart,
      $lt: planEnd,
    },
  });
}

export async function getPlanStatus(
  userId: string
): Promise<PlanStatus> {
  const activePlan =
    await ensureActivePlan(userId);

  const planKey = isPlanKey(
    activePlan.planKey
  )
    ? activePlan.planKey
    : "free";

  const planDoc = await getPlanByKey(planKey);
  const planDef = planDoc
    ? {
        key: planDoc.key as PlanKey,
        label: planDoc.label,
        priceInr: planDoc.priceInr,
        quota: planDoc.quota,
      }
    : getPlan(planKey);
  const used = await getPlanUsage(
    userId,
    activePlan.planStart,
    activePlan.planEnd
  );

  const effectiveQuota =
    typeof activePlan.planQuota === "number" &&
    activePlan.planQuota > 0
      ? activePlan.planQuota
      : planDef.quota;

  const remaining = Math.max(
    0,
    effectiveQuota - used
  );

  return {
    planKey,
    planStart: activePlan.planStart,
    planEnd: activePlan.planEnd,
    quota: effectiveQuota,
    used,
    remaining,
    priceInr:
      typeof activePlan.priceInr === "number" &&
      (activePlan.priceInr > 0 ||
        planKey === "free")
        ? activePlan.priceInr
        : planDef.priceInr,
  };
}

export async function assertQuota(
  userId: string,
  needed: number
) {
  const status = await getPlanStatus(
    userId
  );

  const allowed =
    status.used + needed <=
    status.quota;

  return {
    allowed,
    status,
  };
}

export async function activatePaidPlan(
  userId: string,
  planKey: PlanKey,
  priceInr: number,
  planQuota?: number
) {
  const now = new Date();

  await UserPlan.updateMany(
    {
      userId,
      status: "active",
    },
    {
      status: "expired",
      planEnd: now,
    }
  );

  const planStart = now;
  const planEnd = addYears(planStart, 1);

  const newPlan = await UserPlan.create({
    userId,
    planKey,
    planStart,
    planEnd,
    status: "active",
    priceInr,
    planQuota:
      typeof planQuota === "number"
        ? planQuota
        : 0,
  });

  return newPlan;
}
