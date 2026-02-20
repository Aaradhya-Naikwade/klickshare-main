// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import { verifyToken } from "@/lib/jwt";

// import Photo from "@/models/Photo";
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

//     if (!groupId || !token) {
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

//     // Check membership
//     const membership =
//       await GroupMember.findOne({
//         groupId,
//         userId:
//           decoded.userId,
//         status: "approved",
//       });

//     if (!membership) {
//       return NextResponse.json(
//         {
//           error:
//             "Access denied",
//         },
//         { status: 403 }
//       );
//     }

//     let photos;

//     // FULL ACCESS
//     if (
//       membership.role ===
//         "owner" ||
//       membership.role ===
//         "contributor" ||
//       membership.accessLevel ===
//         "full"
//     ) {

//       photos =
//         await Photo.find({
//           groupId,
//         }).sort({
//           createdAt: -1,
//         });

//     }
//     else {

//       // PARTIAL ACCESS → only own photos
//       photos =
//         await Photo.find({
//           groupId,
//           uploadedBy:
//             decoded.userId,
//         }).sort({
//           createdAt: -1,
//         });

//     }

//     return NextResponse.json({
//       success: true,
//       photos,
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

import Photo from "@/models/Photo";
import GroupMember from "@/models/GroupMember";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(req.url);

    const groupId =
      searchParams.get("groupId");

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

    // Check membership
    const membership =
      await GroupMember.findOne({
        groupId,
        userId: decoded.userId,
        status: "approved",
      });

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    let photos;

    // FULL ACCESS
    if (
      membership.role === "owner" ||
      membership.role === "contributor" ||
      membership.accessLevel === "full"
    ) {
      photos = await Photo.find({
        groupId,
      }).sort({
        createdAt: -1,
      });
    } else {
      // PARTIAL ACCESS → only own photos
      photos = await Photo.find({
        groupId,
        uploadedBy: decoded.userId,
      }).sort({
        createdAt: -1,
      });
    }

    // ✅ SAFE RESPONSE
    const safePhotos = photos.map(
      (p: any) => ({
        _id: p._id.toString(),
        photoUrl: p.photoUrl,
        groupId: p.groupId,
        uploadedBy: p.uploadedBy,
        createdAt: p.createdAt,
      })
    );

    return NextResponse.json({
      success: true,
      count: safePhotos.length,
      photos: safePhotos,
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
