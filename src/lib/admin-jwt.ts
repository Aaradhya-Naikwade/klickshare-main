import jwt from "jsonwebtoken";

function getAdminJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_JWT_SECRET is not set"
    );
  }
  return secret;
}

export type AdminTokenPayload = {
  admin: true;
  email: string;
};

export function signAdminToken(
  email: string
) {
  const payload: AdminTokenPayload = {
    admin: true,
    email,
  };
  const secret = getAdminJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
}

export function verifyAdminToken(
  token: string
): AdminTokenPayload | null {
  try {
    const secret = getAdminJwtSecret();
    const decoded = jwt.verify(token, secret);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "admin" in decoded &&
      (decoded as any).admin === true &&
      "email" in decoded
    ) {
      return decoded as AdminTokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}
