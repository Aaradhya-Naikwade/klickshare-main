import { verifyToken } from "./jwt";

export async function verifyAuth(
  token: string
) {
  const decoded = verifyToken(token);

  if (!decoded) return null;

  return decoded;
}
