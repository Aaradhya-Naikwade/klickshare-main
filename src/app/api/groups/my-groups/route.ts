// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import { verifyToken } from "@/lib/jwt";

// import "@/models"; // ⭐ IMPORTANT

// import User from "@/models/User";
// import GroupMember from "@/models/GroupMember";

// export async function GET(req: Request) {
//   try {
//     await connectDB();

//     // Get token
//     const token =
//       req.headers
//         .get("authorization")
//         ?.replace("Bearer ", "");

//     if (!token) {
//       return NextResponse.json(
//         { error: "Token required" },
//         { status: 401 }
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

//     const user = await User.findById(
//       decoded.userId
//     );

//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Find approved memberships
//     const memberships =
//       await GroupMember.find({
//         userId: user._id,
//         status: "approved",
//       })
//         .populate({
//           path: "groupId",
//           select:
//             "name description visibility inviteCode eventId ownerId createdAt",
//         })
//         .sort({
//           joinedAt: -1,
//         });

//     // Format response
//     const groups =
//       memberships.map(
//         (m: any) => ({
//           membershipId: m._id,

//           role: m.role,
//           accessLevel:
//             m.accessLevel,

//           joinedAt:
//             m.joinedAt,

//           group: m.groupId,
//         })
//       );

//     return NextResponse.json({
//       success: true,
//       count: groups.length,
//       groups,
//     });
//   } catch (error) {
//     console.error(error);

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

import "@/models"; // ⭐ IMPORTANT

import User from "@/models/User";
import GroupMember from "@/models/GroupMember";

export async function GET(req: Request) {
  try {
    await connectDB();

    // 🔐 Get token
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

    const user = await User.findById(
      decoded.userId
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find approved memberships
    const memberships =
      await GroupMember.find({
        userId: user._id,
        status: "approved",
      })
        .populate({
          path: "groupId",
          select:
            "name description visibility inviteCode eventId ownerId createdAt",
        })
        .sort({
          joinedAt: -1,
        });

    // ✅ SAFE RESPONSE
    const groups =
      memberships.map((m: any) => ({
        membershipId: m._id.toString(),
        role: m.role,
        accessLevel: m.accessLevel,
        joinedAt: m.joinedAt,

        group: m.groupId
          ? {
              _id: m.groupId._id.toString(),
              name: m.groupId.name,
              description:
                m.groupId.description || "",
              visibility:
                m.groupId.visibility,
              inviteCode:
                m.groupId.inviteCode,
              eventId:
                m.groupId.eventId,
              ownerId:
                m.groupId.ownerId,
              createdAt:
                m.groupId.createdAt,
            }
          : null,
      }));

    return NextResponse.json({
      success: true,
      count: groups.length,
      groups,
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
