import { verifyAuth } from "@/lib/auth-verify";

export type ApiAuthContext = {
  token: string;
  userId: string;
};

export async function requireApiAuth(
  req: Request
): Promise<ApiAuthContext | null> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return null;
  }

  const decoded = await verifyAuth(token);

  if (!decoded?.userId) {
    return null;
  }

  return {
    token,
    userId: decoded.userId,
  };
}
