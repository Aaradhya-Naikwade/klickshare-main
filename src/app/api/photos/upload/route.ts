
// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import { verifyToken } from "@/lib/jwt";

// import Photo from "@/models/Photo";
// import GroupMember from "@/models/GroupMember";
// import Group from "@/models/Group";

// import { uploadToS3 } from "@/lib/s3";
// import { FACE_API_URL } from "@/lib/faceApi";

// export async function POST(req: Request) {

//   try {

//     await connectDB();

//     const formData =
//       await req.formData();

//     const file =
//       formData.get("file") as File;

//     const groupId =
//       formData.get("groupId") as string;

//     const token =
//       formData.get("token") as string;

//     if (!file || !groupId || !token) {

//       return NextResponse.json(
//         { error: "Missing data" },
//         { status: 400 }
//       );

//     }

//     const decoded: any =
//       verifyToken(token);

//     if (!decoded?.userId) {

//       return NextResponse.json(
//         { error: "Invalid token" },
//         { status: 401 }
//       );

//     }

//     // Check membership
//     const membership =
//       await GroupMember.findOne({
//         groupId,
//         userId: decoded.userId,
//         status: "approved",
//       });

//     if (!membership) {

//       return NextResponse.json(
//         { error: "Not a group member" },
//         { status: 403 }
//       );

//     }

//     // Check upload permission
//     if (
//       membership.role !== "owner" &&
//       membership.role !== "contributor"
//     ) {

//       return NextResponse.json(
//         { error: "Upload not allowed" },
//         { status: 403 }
//       );

//     }

//     // Get group
//     const group =
//       await Group.findById(groupId);

//     if (!group) {

//       return NextResponse.json(
//         { error: "Group not found" },
//         { status: 404 }
//       );

//     }

//     // Convert file to buffer
//     const bytes =
//       await file.arrayBuffer();

//     const buffer =
//       Buffer.from(bytes);

//     // Upload to S3
//     const photoUrl =
//       await uploadToS3(
//         buffer,
//         file.name,
//         file.type
//       );

//     // Save photo in MongoDB
//     const photo =
//       await Photo.create({

//         groupId,

//         eventId:
//           group.eventId,

//         uploadedBy:
//           decoded.userId,

//         photoUrl,

//         facesIndexed:
//           false,

//       });

//     // Call Face Recognition API to index faces
//     try {

//       const response =
//         await fetch(
//           `${FACE_API_URL}/index-group-photo`,
//           {
//             method: "POST",

//             headers: {
//               "Content-Type":
//                 "application/json",
//             },

//             body: JSON.stringify({

//               photo_id:
//                 photo._id.toString(),

//               photo_url:
//                 photoUrl,

//               group_id:
//                 groupId,

//             }),

//           }
//         );

//       if (!response.ok) {

//         const text =
//           await response.text();

//         console.error(
//           "Face indexing API error:",
//           text
//         );

//       }
//       else {

//         const result =
//           await response.json();

//         console.log(
//           "Face indexing success:",
//           result
//         );

//         // Mark indexed true
//         await Photo.findByIdAndUpdate(
//           photo._id,
//           {
//             facesIndexed: true,
//           }
//         );

//       }

//     }
//     catch (err) {

//       console.error(
//         "Face indexing failed:",
//         err
//       );

//     }

//     return NextResponse.json({

//       success: true,

//       photo,

//     });

//   }
//   catch (error) {

//     console.error(error);

//     return NextResponse.json(
//       { error: "Upload failed" },
//       { status: 500 }
//     );

//   }

// }









import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { verifyAuth } from "@/lib/auth-verify";

import Photo from "@/models/Photo";
import GroupMember from "@/models/GroupMember";
import Group from "@/models/Group";

import { uploadToS3 } from "@/lib/s3";
import { FACE_API_URL } from "@/lib/faceApi";

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

    const formData =
      await req.formData();

    const file =
      formData.get("file") as File;

    const groupId =
      formData.get("groupId") as string;

    if (!file || !groupId) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
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
        { error: "Not a group member" },
        { status: 403 }
      );
    }

    // Check upload permission
    if (
      membership.role !== "owner" &&
      membership.role !== "contributor"
    ) {
      return NextResponse.json(
        { error: "Upload not allowed" },
        { status: 403 }
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

    // Convert file to buffer
    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    // Upload to S3
    const photoUrl =
      await uploadToS3(
        buffer,
        file.name,
        file.type
      );

    // Save photo
    const photo =
      await Photo.create({
        groupId,
        eventId: group.eventId,
        uploadedBy: decoded.userId,
        photoUrl,
        facesIndexed: false,
      });

    // 🎯 Face indexing
    try {
      const response = await fetch(
        `${FACE_API_URL}/index-group-photo`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            photo_id:
              photo._id.toString(),
            photo_url: photoUrl,
            group_id: groupId,
          }),
        }
      );

      if (response.ok) {
        await Photo.findByIdAndUpdate(
          photo._id,
          {
            facesIndexed: true,
          }
        );
      } else {
        const text =
          await response.text();
        console.error(
          "Face indexing API error:",
          text
        );
      }

    } catch (err) {
      console.error(
        "Face indexing failed:",
        err
      );
    }

    // ✅ SAFE RESPONSE
    return NextResponse.json({
      success: true,
      photo: {
        _id: photo._id.toString(),
        photoUrl: photo.photoUrl,
        groupId: photo.groupId,
        uploadedBy: photo.uploadedBy,
        createdAt: photo.createdAt,
        facesIndexed: photo.facesIndexed,
      },
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
