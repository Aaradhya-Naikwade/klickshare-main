// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import { verifyToken } from "@/lib/jwt";

// import GroupMember from "@/models/GroupMember";

// export async function DELETE(req: Request) {

//   try {

//     await connectDB();

//     const body =
//       await req.json();

//     const { token, groupId } =
//       body;

//     if (!token || !groupId) {
//       return NextResponse.json(
//         { error: "Missing data" },
//         { status: 400 }
//       );
//     }

//     const decoded: any =
//       verifyToken(token);

//     if (!decoded) {
//       return NextResponse.json(
//         { error: "Invalid token" },
//         { status: 401 }
//       );
//     }

//     const membership =
//       await GroupMember.findOne({
//         groupId,
//         userId:
//           decoded.userId,
//       });

//     if (!membership) {
//       return NextResponse.json(
//         {
//           error:
//             "Not a member",
//         },
//         { status: 404 }
//       );
//     }

//     // Owner cannot leave
//     if (
//       membership.role ===
//       "owner"
//     ) {
//       return NextResponse.json(
//         {
//           error:
//             "Owner cannot leave group",
//         },
//         { status: 403 }
//       );
//     }

//     await membership.deleteOne();

//     return NextResponse.json({
//       success: true,
//     });

//   } catch {

//     return NextResponse.json(
//       {
//         error: "Server error",
//       },
//       { status: 500 }
//     );

//   }

// }








import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { verifyAuth } from "@/lib/auth-verify";

import GroupMember from "@/models/GroupMember";

export async function DELETE(req: Request) {
  try {
    await connectDB();

    // 🔐 Get token from header
    const token =
      req.headers
        .get("authorization")
        ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ NEW AUTH SYSTEM
    const decoded: any =
      await verifyAuth(token);

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body =
      await req.json();

    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID required" },
        { status: 400 }
      );
    }

    const membership =
      await GroupMember.findOne({
        groupId,
        userId:
          decoded.userId,
      });

    if (!membership) {
      return NextResponse.json(
        {
          error:
            "Not a member",
        },
        { status: 404 }
      );
    }

    // Owner cannot leave
    if (
      membership.role ===
      "owner"
    ) {
      return NextResponse.json(
        {
          error:
            "Owner cannot leave group",
        },
        { status: 403 }
      );
    }

    await membership.deleteOne();

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Server error",
      },
      { status: 500 }
    );
  }
}
