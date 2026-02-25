

// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import { verifyAuth } from "@/lib/auth-verify";

// import Photo from "@/models/Photo";
// import GroupMember from "@/models/GroupMember";
// import Group from "@/models/Group";

// import { uploadToS3 } from "@/lib/s3";
// import { FACE_API_URL } from "@/lib/faceApi";

// export async function POST(req: Request) {
//   try {
//     await connectDB();

//     // Get token from header
//     const token =
//       req.headers
//         .get("authorization")
//         ?.replace("Bearer ", "");

//     if (!token) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // NEW AUTH SYSTEM
//     const decoded: any =
//       await verifyAuth(token);

//     if (!decoded?.userId) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const formData =
//       await req.formData();

//     const file =
//       formData.get("file") as File;

//     const groupId =
//       formData.get("groupId") as string;

//     if (!file || !groupId) {
//       return NextResponse.json(
//         { error: "Missing data" },
//         { status: 400 }
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

//     // Save photo
//     const photo =
//       await Photo.create({
//         groupId,
//         eventId: group.eventId,
//         uploadedBy: decoded.userId,
//         photoUrl,
//         facesIndexed: false,
//       });

//     // Face indexing
//     try {
//       const response = await fetch(
//         `${FACE_API_URL}/index-group-photo`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type":
//               "application/json",
//           },
//           body: JSON.stringify({
//             photo_id:
//               photo._id.toString(),
//             photo_url: photoUrl,
//             group_id: groupId,
//           }),
//         }
//       );

//       if (response.ok) {
//         await Photo.findByIdAndUpdate(
//           photo._id,
//           {
//             facesIndexed: true,
//           }
//         );
//       } else {
//         const text =
//           await response.text();
//         console.error(
//           "Face indexing API error:",
//           text
//         );
//       }

//     } catch (err) {
//       console.error(
//         "Face indexing failed:",
//         err
//       );
//     }

//     // SAFE RESPONSE
//     return NextResponse.json({
//       success: true,
//       photo: {
//         _id: photo._id.toString(),
//         photoUrl: photo.photoUrl,
//         groupId: photo.groupId,
//         uploadedBy: photo.uploadedBy,
//         createdAt: photo.createdAt,
//         facesIndexed: photo.facesIndexed,
//       },
//     });

//   } catch (error) {
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

    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = await verifyAuth(token);

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    // ✅ CHANGE HERE
    const files = formData.getAll("file") as File[];
    const groupId = formData.get("groupId") as string;

    if (!files || files.length === 0 || !groupId) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    // Check membership
    const membership = await GroupMember.findOne({
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

    if (
      membership.role !== "owner" &&
      membership.role !== "contributor"
    ) {
      return NextResponse.json(
        { error: "Upload not allowed" },
        { status: 403 }
      );
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // ✅ MULTIPLE UPLOAD LOOP
    const uploadedPhotos = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const photoUrl = await uploadToS3(
        buffer,
        file.name,
        file.type
      );

      const photo = await Photo.create({
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
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              photo_id: photo._id.toString(),
              photo_url: photoUrl,
              group_id: groupId,
            }),
          }
        );

        if (response.ok) {
          await Photo.findByIdAndUpdate(
            photo._id,
            { facesIndexed: true }
          );
        } else {
          const text = await response.text();
          console.error("Face API error:", text);
        }
      } catch (err) {
        console.error("Face indexing failed:", err);
      }

      uploadedPhotos.push({
        _id: photo._id.toString(),
        photoUrl: photo.photoUrl,
        groupId: photo.groupId,
        uploadedBy: photo.uploadedBy,
        createdAt: photo.createdAt,
        facesIndexed: photo.facesIndexed,
      });
    }
    
    return NextResponse.json({
      success: true,
      count: uploadedPhotos.length,
      photos: uploadedPhotos,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}