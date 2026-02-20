// import jwt from "jsonwebtoken";

// const JWT_SECRET =
//   process.env.JWT_SECRET ||
//   "SECRET123";

// /**
//  * Sign JWT token
//  */
// export function signToken(
//   payload: {
//     userId: string;
//   }
// ): string {

//   return jwt.sign(
//     payload,
//     JWT_SECRET,
//     {
//       expiresIn: "7d",
//     }
//   );

// }

// /**
//  * Verify JWT token safely
//  */
// export function verifyToken(
//   token: string
// ): { userId: string } | null {

//   try {

//     const decoded =
//       jwt.verify(
//         token,
//         JWT_SECRET
//       );

//     // Ensure object and has userId
//     if (
//       typeof decoded === "object" &&
//       decoded !== null &&
//       "userId" in decoded
//     ) {

//       return decoded as {
//         userId: string;
//       };

//     }

//     return null;

//   } catch (error) {

//     console.error(
//       "JWT verify error:",
//       error
//     );

//     return null;

//   }

// }





import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "SECRET123";

export function signToken(payload: {
  userId: string;
}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(
  token: string
): { userId: string } | null {
  try {
    const decoded =
      jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded
    ) {
      return decoded as {
        userId: string;
      };
    }

    return null;
  } catch {
    return null;
  }
}
