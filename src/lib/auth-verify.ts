import { verifyToken } from "./jwt";
import Session from "@/models/Session";

export async function verifyAuth(
  token: string
) {
  const decoded = verifyToken(token);

  if (!decoded) return null;

  const session =
    await Session.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

  if (!session) return null;

  return decoded;
}
