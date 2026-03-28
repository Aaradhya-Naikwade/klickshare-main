


// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import { verifyToken } from "@/lib/jwt";

// import Group from "@/models/Group";
// import GroupMember from "@/models/GroupMember";

// export async function GET(req: Request) {

//   try {

//     await connectDB();

//     const { searchParams } =
//       new URL(req.url);

//     const groupId =
//       searchParams.get("groupId");

//     const token =
//       req.headers
//         .get("authorization")
//         ?.replace("Bearer ", "");

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

//     const group =
//       await Group.findById(groupId);

//     if (!group) {

//       return NextResponse.json(
//         { error: "Group not found" },
//         { status: 404 }
//       );

//     }

//     // ✅ FIXED: include blocked members
//     const members =
//       await GroupMember.find({
//         groupId,
//         status: {
//           $in: [
//             "approved",
//             "blocked",
//             "pending"
//           ]
//         }
//       })
//         .populate(
//           "userId",
//           "name phone profilePhoto"
//         )
//         .sort({
//           joinedAt: -1,
//         });

//     return NextResponse.json({

//       success: true,

//       group,

//       members,

//     });

//   }
//   catch {

//     return NextResponse.json(
//       { error: "Server error" },
//       { status: 500 }
//     );

//   }

// }






import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { verifyAuth } from "@/lib/auth-verify";

import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(req.url);

    const groupId =
      searchParams.get("groupId");

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

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID required" },
        { status: 400 }
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

    const group =
      await Group.findById(groupId);

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const membership =
      await GroupMember.findOne({
        groupId,
        userId: decoded.userId,
        status: "approved",
      });

    const isOwner =
      group.ownerId.toString() ===
      decoded.userId;

    if (!membership && !isOwner) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // ✅ Members (including blocked/pending/approved)
    const members =
      await GroupMember.find({
        groupId,
        status: {
          $in: [
            "approved",
            "blocked",
            "pending",
          ],
        },
      })
        .populate(
          "userId",
          "name phone profilePhoto"
        )
        .sort({
          joinedAt: -1,
        });

    // ✅ SAFE RESPONSE

    const safeGroup = {
      _id: group._id.toString(),
      name: group.name,
      description: group.description || "",
      visibility: group.visibility,
      inviteCode: isOwner
        ? group.inviteCode
        : undefined,
      qrCodeUrl: isOwner
        ? group.qrCodeUrl
        : undefined,
      eventId: group.eventId,
      ownerId: group.ownerId,
      createdAt: group.createdAt,
    };

    const safeMembers = members.map(
      (member: any) => ({
        _id: member._id.toString(),
        role: member.role,
        accessLevel: member.accessLevel,
        status: member.status,
        joinedAt: member.joinedAt,
        user: member.userId
          ? {
              _id: member.userId._id.toString(),
              name: member.userId.name,
              phone: member.userId.phone,
              profilePhoto:
                member.userId.profilePhoto ||
                "",
            }
          : null,
      })
    );

    return NextResponse.json({
      success: true,
      group: safeGroup,
      members: safeMembers,
      count: safeMembers.length,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
