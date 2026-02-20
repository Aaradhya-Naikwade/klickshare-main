// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import { verifyToken } from "@/lib/jwt";

// import User from "@/models/User";
// import Group from "@/models/Group";
// import GroupMember from "@/models/GroupMember";

// import { createNotification } from "@/lib/notify";

// export async function POST(req: Request) {

//   try {

//     await connectDB();

//     const body =
//       await req.json();

//     const {
//       token,
//       inviteCode,
//       groupId,
//     } = body;

//     // Validate token
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

//     const user =
//       await User.findById(
//         decoded.userId
//       );

//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Find group
//     let group = null;

//     if (inviteCode) {

//       group =
//         await Group.findOne({
//           inviteCode,
//         });

//     }

//     if (groupId) {

//       group =
//         await Group.findById(
//           groupId
//         );

//     }

//     if (!group) {

//       return NextResponse.json(
//         { error: "Group not found" },
//         { status: 404 }
//       );

//     }

//     // Check existing membership
//     const existing =
//       await GroupMember.findOne({
//         groupId: group._id,
//         userId: user._id,
//       });

//     if (existing) {

//       if (
//         existing.status ===
//         "blocked"
//       ) {

//         return NextResponse.json(
//           {
//             error:
//               "You are blocked from this group",
//           },
//           { status: 403 }
//         );

//       }

//       if (
//         existing.status ===
//         "pending"
//       ) {

//         return NextResponse.json(
//           {
//             message:
//               "Join request already pending",
//           }
//         );

//       }

//       if (
//         existing.status ===
//         "approved"
//       ) {

//         return NextResponse.json(
//           {
//             message:
//               "Already joined",
//           }
//         );

//       }

//       if (
//         existing.status ===
//         "rejected"
//       ) {

//         return NextResponse.json(
//           {
//             error:
//               "Join request rejected",
//           },
//           { status: 403 }
//         );

//       }

//     }

//     // Determine approval
//     let status: any =
//       "pending";

//     if (
//       group.visibility ===
//       "public"
//     ) {

//       status =
//         "approved";

//     }

//     // Create membership
//     const membership =
//       await GroupMember.create({

//         groupId:
//           group._id,

//         userId:
//           user._id,

//         role:
//           "viewer",

//         accessLevel:
//           "partial",

//         status,

//       });

//     // SEND NOTIFICATIONS

//     if (status === "pending") {

//       // Notify photographer (group owner)
//       await createNotification({

//         userId:
//           group.ownerId.toString(),

//         type:
//           "join_request",

//         message:
//           `${user.name} requested to join your group "${group.name}"`,

//         groupId:
//           group._id.toString(),

//       });

//     }

//     if (status === "approved") {

//       // Notify viewer
//       await createNotification({

//         userId:
//           user._id.toString(),

//         type:
//           "join_approved",

//         message:
//           `You joined group "${group.name}" successfully`,

//         groupId:
//           group._id.toString(),

//       });

//     }

//     return NextResponse.json({

//       success: true,

//       status,

//       membership,

//     });

//   } catch (error) {

//     console.error(error);

//     return NextResponse.json(
//       {
//         error:
//           "Server error",
//       },
//       { status: 500 }
//     );

//   }

// }







import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { verifyAuth } from "@/lib/auth-verify";

import User from "@/models/User";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";

import { createNotification } from "@/lib/notify";

export async function POST(req: Request) {
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

    const body = await req.json();

    const { inviteCode, groupId } = body;

    if (!inviteCode && !groupId) {
      return NextResponse.json(
        {
          error:
            "Invite code or groupId required",
        },
        { status: 400 }
      );
    }

    const user =
      await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find group
    let group = null;

    if (inviteCode) {
      group = await Group.findOne({
        inviteCode,
      });
    }

    if (!group && groupId) {
      group = await Group.findById(
        groupId
      );
    }

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Check existing membership
    const existing =
      await GroupMember.findOne({
        groupId: group._id,
        userId: user._id,
      });

    if (existing) {
      if (existing.status === "blocked") {
        return NextResponse.json(
          {
            error:
              "You are blocked from this group",
          },
          { status: 403 }
        );
      }

      if (existing.status === "pending") {
        return NextResponse.json({
          message:
            "Join request already pending",
        });
      }

      if (existing.status === "approved") {
        return NextResponse.json({
          message: "Already joined",
        });
      }

      if (existing.status === "rejected") {
        return NextResponse.json(
          {
            error:
              "Join request rejected",
          },
          { status: 403 }
        );
      }
    }

    // Determine approval
    let status: any = "pending";

    if (group.visibility === "public") {
      status = "approved";
    }

    // Create membership
    const membership =
      await GroupMember.create({
        groupId: group._id,
        userId: user._id,
        role: "viewer",
        accessLevel: "partial",
        status,
      });

    // 🔔 Notifications

    if (status === "pending") {
      // Notify group owner
      await createNotification({
        userId:
          group.ownerId.toString(),
        type: "join_request",
        message: `${user.name} requested to join your group "${group.name}"`,
        groupId: group._id.toString(),
      });
    }

    if (status === "approved") {
      // Notify user
      await createNotification({
        userId: user._id.toString(),
        type: "join_approved",
        message: `You joined group "${group.name}" successfully`,
        groupId: group._id.toString(),
      });
    }

    // ✅ SAFE RESPONSE
    return NextResponse.json({
      success: true,
      status,
      membership: {
        _id: membership._id.toString(),
        groupId: membership.groupId,
        userId: membership.userId,
        role: membership.role,
        accessLevel: membership.accessLevel,
        status: membership.status,
        createdAt: membership.createdAt,
      },
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
