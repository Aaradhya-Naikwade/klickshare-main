function normalizePhone(phone: string) {
  return String(phone || "").trim();
}

export function getAdminPhones(): string[] {
  const raw = process.env.ADMIN_PHONES || "";
  return raw
    .split(",")
    .map((p) => normalizePhone(p))
    .filter(Boolean);
}

export function isAdminPhone(phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) return false;
  const allowlist = getAdminPhones();
  return allowlist.includes(normalized);
}

