// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import { signToken } from "@/lib/jwt";

// export async function POST(req: Request) {
//   await connectDB();

//   const { phone, role, name, companyName } =
//     await req.json();

//   const exists = await User.findOne({ phone });

//   if (exists)
//     return NextResponse.json(
//       { error: "Phone exists" },
//       { status: 400 }
//     );

//   const user = await User.create({
//     phone,
//     role,
//     name,
//     companyName,
//     lastLoginAt: new Date(),
//   });

//   const token = signToken({
//     userId: user._id,
//   });

//   return NextResponse.json({
//     token,
//     user,
//   });
// }






import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Session from "@/models/Session";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();

    const {
      phone,
      role,
      name,
      companyName,
    } = await req.json();

    const newUser =
      await User.create({
        phone,
        role,
        name,
        companyName:
          role === "photographer"
            ? companyName
            : "",
        lastLoginAt: new Date(),
      });

    const token = signToken({
      userId: newUser._id.toString(),
    });

    // 🔥 SINGLE DEVICE LOGIN
    await Session.updateMany(
      { userId: newUser._id },
      { isActive: false }
    );

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await Session.create({
      userId: newUser._id,
      token,
      expiresAt,
    });

    return NextResponse.json({
      token,
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
