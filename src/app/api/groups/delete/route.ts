// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import { verifyToken } from "@/lib/jwt";

// import Group from "@/models/Group";
// import GroupMember from "@/models/GroupMember";
// import Photo from "@/models/Photo";
// import User from "@/models/User";

// export async function DELETE(req: Request) {

//   try {

//     await connectDB();

//     const body = await req.json();

//     const {
//       token,
//       groupId,
//     } = body;

//     if (!token || !groupId) {

//       return NextResponse.json(
//         {
//           error: "Missing data",
//         },
//         { status: 400 }
//       );

//     }

//     const decoded: any =
//       verifyToken(token);

//     if (!decoded) {

//       return NextResponse.json(
//         {
//           error: "Invalid token",
//         },
//         { status: 401 }
//       );

//     }

//     const user =
//       await User.findById(
//         decoded.userId
//       );

//     if (!user) {

//       return NextResponse.json(
//         {
//           error: "User not found",
//         },
//         { status: 404 }
//       );

//     }

//     const group =
//       await Group.findById(
//         groupId
//       );

//     if (!group) {

//       return NextResponse.json(
//         {
//           error: "Group not found",
//         },
//         { status: 404 }
//       );

//     }

//     // Ownership check
//     if (
//       group.ownerId.toString() !==
//       user._id.toString()
//     ) {

//       return NextResponse.json(
//         {
//           error: "Not authorized",
//         },
//         { status: 403 }
//       );

//     }

//     // Delete photos
//     await Photo.deleteMany({
//       groupId,
//     });

//     // Delete members
//     await GroupMember.deleteMany({
//       groupId,
//     });

//     // Delete group
//     await Group.deleteOne({
//       _id: groupId,
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Group deleted successfully",
//     });

//   }
//   catch (error) {

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

import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import Photo from "@/models/Photo";
import User from "@/models/User";

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

    const body = await req.json();
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID required" },
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

    const group =
      await Group.findById(groupId);

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Ownership check
    if (
      group.ownerId.toString() !==
      user._id.toString()
    ) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    // Delete photos
    await Photo.deleteMany({
      groupId,
    });

    // Delete members
    await GroupMember.deleteMany({
      groupId,
    });

    // Delete group
    await Group.deleteOne({
      _id: groupId,
    });

    return NextResponse.json({
      success: true,
      message: "Group deleted successfully",
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
