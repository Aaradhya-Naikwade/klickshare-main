// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import { verifyToken } from "@/lib/jwt";

// import User from "@/models/User";
// import Group from "@/models/Group";
// import GroupMember from "@/models/GroupMember";

// export async function GET(req: Request) {
//   try {
//     await connectDB();

//     // Get token from headers
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

//     // Find groups owned by this user
//     const ownedGroups =
//       await Group.find({
//         ownerId: user._id,
//       }).select("_id name");

//     const groupIds =
//       ownedGroups.map(
//         (g) => g._id
//       );

//     // Find pending join requests
//     const requests =
//       await GroupMember.find({
//         groupId: {
//           $in: groupIds,
//         },
//         status: "pending",
//       })
//         .populate(
//           "userId",
//           "name phone profilePhoto"
//         )
//         .populate(
//           "groupId",
//           "name inviteCode"
//         )
//         .sort({
//           joinedAt: -1,
//         });

//     return NextResponse.json({
//       success: true,
//       count: requests.length,
//       requests,
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

import User from "@/models/User";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";

export async function GET(req: Request) {
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

    const user = await User.findById(
      decoded.userId
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find groups owned by this user
    const ownedGroups =
      await Group.find({
        ownerId: user._id,
      }).select("_id name");

    const groupIds =
      ownedGroups.map(
        (g) => g._id
      );

    // Find pending join requests
    const requests =
      await GroupMember.find({
        groupId: {
          $in: groupIds,
        },
        status: "pending",
      })
        .populate(
          "userId",
          "name phone profilePhoto"
        )
        .populate(
          "groupId",
          "name inviteCode"
        )
        .sort({
          joinedAt: -1,
        });

    // ✅ SAFE RESPONSE
    const safeRequests = requests.map(
      (req: any) => ({
        _id: req._id.toString(),
        status: req.status,
        joinedAt: req.joinedAt,
        user: req.userId
          ? {
              _id: req.userId._id.toString(),
              name: req.userId.name,
              phone: req.userId.phone,
              profilePhoto:
                req.userId.profilePhoto || "",
            }
          : null,
        group: req.groupId
          ? {
              _id: req.groupId._id.toString(),
              name: req.groupId.name,
              inviteCode:
                req.groupId.inviteCode,
            }
          : null,
      })
    );

    return NextResponse.json({
      success: true,
      count: safeRequests.length,
      requests: safeRequests,
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
