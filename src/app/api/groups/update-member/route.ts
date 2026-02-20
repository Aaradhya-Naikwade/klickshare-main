// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import { verifyToken } from "@/lib/jwt";

// import Group from "@/models/Group";
// import GroupMember from "@/models/GroupMember";
// import User from "@/models/User";

// import { createNotification } from "@/lib/notify";

// export async function PUT(req: Request) {

//     try {

//         await connectDB();

//         const body =
//             await req.json();

//         const {
//             token,
//             groupId,
//             memberId,
//             action,
//         } = body;

//         // Validate input
//         if (
//             !token ||
//             !groupId ||
//             !memberId ||
//             !action
//         ) {

//             return NextResponse.json(
//                 {
//                     error:
//                         "Missing data",
//                 },
//                 { status: 400 }
//             );

//         }

//         // Verify token
//         const decoded: any =
//             verifyToken(token);

//         if (!decoded) {

//             return NextResponse.json(
//                 {
//                     error:
//                         "Invalid token",
//                 },
//                 { status: 401 }
//             );

//         }

//         // Get group
//         const group =
//             await Group.findById(
//                 groupId
//             );

//         if (!group) {

//             return NextResponse.json(
//                 {
//                     error:
//                         "Group not found",
//                 },
//                 { status: 404 }
//             );

//         }

//         // Only owner allowed
//         if (
//             group.ownerId.toString() !==
//             decoded.userId
//         ) {

//             return NextResponse.json(
//                 {
//                     error:
//                         "Only owner can manage members",
//                 },
//                 { status: 403 }
//             );

//         }

//         // Get member
//         const member =
//             await GroupMember.findById(
//                 memberId
//             );

//         if (!member) {

//             return NextResponse.json(
//                 {
//                     error:
//                         "Member not found",
//                 },
//                 { status: 404 }
//             );

//         }

//         // Get user info for notification message
//         const user =
//             await User.findById(
//                 member.userId
//             );

//         if (!user) {

//             return NextResponse.json(
//                 {
//                     error:
//                         "User not found",
//                 },
//                 { status: 404 }
//             );

//         }

//         // ACTION HANDLER

//         if (action === "approve") {

//             member.status =
//                 "approved";

//             await member.save();

//             await createNotification({

//                 userId:
//                     user._id.toString(),

//                 type:
//                     "join_approved",

//                 message:
//                     `Your join request was approved in group "${group.name}"`,

//                 groupId:
//                     group._id.toString(),

//             });

//         }

//         else if (action === "reject") {

//             member.status =
//                 "rejected";

//             await member.save();

//             await createNotification({

//                 userId:
//                     user._id.toString(),

//                 type:
//                     "join_rejected",

//                 message:
//                     `Your join request was rejected in group "${group.name}"`,

//                 groupId:
//                     group._id.toString(),

//             });

//         }

//         else if (action === "upgradeAccess") {

//             member.accessLevel =
//                 "full";

//             await member.save();

//             await createNotification({

//                 userId:
//                     user._id.toString(),

//                 type:
//                     "access_upgraded",

//                 message:
//                     `Your access upgraded to FULL in group "${group.name}"`,

//                 groupId:
//                     group._id.toString(),

//             });

//         }

//         else if (action === "downgradeAccess") {

//             member.accessLevel = "partial";

//             await member.save();

//             await createNotification({

//                 userId:
//                     user._id.toString(),

//                 type:
//                     "access_upgraded",

//                 message:
//                     `Your access changed to PARTIAL in group "${group.name}"`,

//                 groupId:
//                     group._id.toString(),

//             });

//         }


//         else if (action === "makeContributor") {

//             member.role =
//                 "contributor";

//             await member.save();

//             await createNotification({

//                 userId:
//                     user._id.toString(),

//                 type:
//                     "made_contributor",

//                 message:
//                     `You are now a CONTRIBUTOR in group "${group.name}"`,

//                 groupId:
//                     group._id.toString(),
                
//             });

//         }

//         else if (action === "makeViewer") {

//             member.role =
//                 "viewer";

//             await member.save();

//             await createNotification({

//                 userId:
//                     user._id.toString(),

//                 type:
//                     "access_upgraded",

//                 message:
//                     `Your role changed to VIEWER in group "${group.name}"`,

//                 groupId:
//                     group._id.toString(),

//             });

//         }

//         else if (action === "block") {

//             member.status =
//                 "blocked";

//             await member.save();

//             await createNotification({

//                 userId:
//                     user._id.toString(),

//                 type:
//                     "blocked",

//                 message:
//                     `You were BLOCKED from group "${group.name}"`,

//                 groupId:
//                     group._id.toString(),

//             });

//         }

//         else if (action === "unblock") {

//     member.status =
//         "approved";

//     await member.save();

//     await createNotification({

//         userId:
//             user._id.toString(),

//         type:
//             "unblocked",

//         message:
//             `You were UNBLOCKED in group "${group.name}"`,

//         groupId:
//             group._id.toString(),

//     });

// }


//         else {

//             return NextResponse.json(
//                 {
//                     error:
//                         "Invalid action",
//                 },
//                 { status: 400 }
//             );

//         }

//         return NextResponse.json({

//             success: true,

//             member,

//         });

//     } catch (error) {

//         console.error(error);

//         return NextResponse.json(
//             {
//                 error:
//                     "Server error",
//             },
//             { status: 500 }
//         );

//     }

// }






import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { verifyAuth } from "@/lib/auth-verify";

import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import User from "@/models/User";

import { createNotification } from "@/lib/notify";

export async function PUT(req: Request) {
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

    const { groupId, memberId, action } = body;

    if (!groupId || !memberId || !action) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    // Get group
    const group =
      await Group.findById(groupId);

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Only owner allowed
    if (
      group.ownerId.toString() !==
      decoded.userId
    ) {
      return NextResponse.json(
        {
          error:
            "Only owner can manage members",
        },
        { status: 403 }
      );
    }

    // Get member
    const member =
      await GroupMember.findById(
        memberId
      );

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Get user (for notification)
    const user =
      await User.findById(
        member.userId
      );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 🔁 ACTION HANDLER

    if (action === "approve") {
      member.status = "approved";

      await member.save();

      await createNotification({
        userId: user._id.toString(),
        type: "join_approved",
        message: `Your join request was approved in group "${group.name}"`,
        groupId: group._id.toString(),
      });
    }

    else if (action === "reject") {
      member.status = "rejected";

      await member.save();

      await createNotification({
        userId: user._id.toString(),
        type: "join_rejected",
        message: `Your join request was rejected in group "${group.name}"`,
        groupId: group._id.toString(),
      });
    }

    else if (action === "upgradeAccess") {
      member.accessLevel = "full";

      await member.save();

      await createNotification({
        userId: user._id.toString(),
        type: "access_upgraded",
        message: `Your access upgraded to FULL in group "${group.name}"`,
        groupId: group._id.toString(),
      });
    }

    else if (action === "downgradeAccess") {
      member.accessLevel = "partial";

      await member.save();

      await createNotification({
        userId: user._id.toString(),
        type: "access_downgraded", // ✅ FIXED TYPE
        message: `Your access changed to PARTIAL in group "${group.name}"`,
        groupId: group._id.toString(),
      });
    }

    else if (action === "makeContributor") {
      member.role = "contributor";

      await member.save();

      await createNotification({
        userId: user._id.toString(),
        type: "made_contributor",
        message: `You are now a CONTRIBUTOR in group "${group.name}"`,
        groupId: group._id.toString(),
      });
    }

    else if (action === "makeViewer") {
      member.role = "viewer";

      await member.save();

      await createNotification({
        userId: user._id.toString(),
        type: "role_changed", // ✅ FIXED TYPE
        message: `Your role changed to VIEWER in group "${group.name}"`,
        groupId: group._id.toString(),
      });
    }

    else if (action === "block") {
      member.status = "blocked";

      await member.save();

      await createNotification({
        userId: user._id.toString(),
        type: "blocked",
        message: `You were BLOCKED from group "${group.name}"`,
        groupId: group._id.toString(),
      });
    }

    else if (action === "unblock") {
      member.status = "approved";

      await member.save();

      await createNotification({
        userId: user._id.toString(),
        type: "unblocked",
        message: `You were UNBLOCKED in group "${group.name}"`,
        groupId: group._id.toString(),
      });
    }

    else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // ✅ SAFE RESPONSE
    return NextResponse.json({
      success: true,
      member: {
        _id: member._id.toString(),
        groupId: member.groupId,
        userId: member.userId,
        role: member.role,
        accessLevel: member.accessLevel,
        status: member.status,
        updatedAt: member.updatedAt,
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
