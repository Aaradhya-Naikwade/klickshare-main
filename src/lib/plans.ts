import Plan from "@/models/Plan";

export type PlanKey =
  | "free"
  | "p5000"
  | "p10000"
  | "p30000";

export type PlanDefinition = {
  key: PlanKey;
  label: string;
  priceInr: number;
  quota: number;
};

export const PLANS: Record<
  PlanKey,
  PlanDefinition
> = {
  free: {
    key: "free",
    label: "Free",
    priceInr: 0,
    quota: 1000,
  },
  p5000: {
    key: "p5000",
    label: "Yearly 5,000",
    priceInr: 700,
    quota: 5000,
  },
  p10000: {
    key: "p10000",
    label: "Yearly 10,000",
    priceInr: 1400,
    quota: 10000,
  },
  p30000: {
    key: "p30000",
    label: "Yearly 30,000",
    priceInr: 2400,
    quota: 30000,
  },
};

export function getPlan(key: PlanKey) {
  return PLANS[key];
}

export function isPlanKey(
  key: string
): key is PlanKey {
  return (
    key === "free" ||
    key === "p5000" ||
    key === "p10000" ||
    key === "p30000"
  );
}

export async function ensureDefaultPlans() {
  const existing = await Plan.countDocuments();
  if (existing > 0) return;

  const seed = Object.values(PLANS).map((p) => ({
    key: p.key,
    label: p.label,
    priceInr: p.priceInr,
    quota: p.quota,
    isActive: true,
  }));

  await Plan.insertMany(seed);
}

export async function getPlanCatalog() {
  await ensureDefaultPlans();
  const plans = await Plan.find({ isActive: true }).sort({
    priceInr: 1,
  });

  return plans.map((p) => ({
    key: p.key as PlanKey,
    label: p.label,
    priceInr: p.priceInr,
    quota: p.quota,
  }));
}

export async function getPlanByKey(
  key: PlanKey
) {
  await ensureDefaultPlans();
  return Plan.findOne({ key, isActive: true });
}
