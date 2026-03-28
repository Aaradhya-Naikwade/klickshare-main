import { verifyAdminToken } from "@/lib/admin-jwt";

export type AdminAuthContext = {
  email: string;
};

export async function requireAdminAuth(
  req: Request
): Promise<AdminAuthContext | null> {
  const authHeader =
    req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const decoded = verifyAdminToken(token);
  if (!decoded?.admin) return null;

  return { email: decoded.email };
}
