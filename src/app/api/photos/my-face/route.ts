

// import { NextResponse } from "next/server";
// import { verifyToken } from "@/lib/jwt";
// import { connectDB } from "@/lib/db";

// import Photo from "@/models/Photo";
// import GroupMember from "@/models/GroupMember";

// import { FACE_API_URL } from "@/lib/faceApi";

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
//         { error: "Unauthorized" },
//         { status: 401 }
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

//     const userId = decoded.userId;

//     // Call Face Recognition API safely
//     let matchedUrls: string[] = [];

//     try {

//       const response =
//         await fetch(
//           `${FACE_API_URL}/find-matches`,
//           {
//             method: "POST",

//             headers: {
//               "Content-Type":
//                 "application/json",
//             },

//             body: JSON.stringify({
//               user_id: userId,
//             }),

//           }
//         );

//       if (!response.ok) {

//         const text =
//           await response.text();

//         console.error(
//           "Face API error:",
//           text
//         );

//         return NextResponse.json({
//           success: true,
//           matches: [],
//         });

//       }

//       const data =
//         await response.json();

//       matchedUrls =
//         (data.matches || []).map(
//           (m: any) => m.image_url
//         );

//     }
//     catch (err) {

//       console.error(
//         "Face API unreachable:",
//         err
//       );

//       return NextResponse.json({
//         success: true,
//         matches: [],
//       });

//     }

//     if (matchedUrls.length === 0) {

//       return NextResponse.json({
//         success: true,
//         matches: [],
//       });

//     }

//     // Get groups user is member of
//     const memberships =
//       await GroupMember.find({
//         userId,
//         status: "approved",
//       });

//     const allowedGroupIds =
//       memberships.map(
//         (m: any) => m.groupId
//       );

//     if (allowedGroupIds.length === 0) {

//       return NextResponse.json({
//         success: true,
//         matches: [],
//       });

//     }

//     // Fetch only allowed photos
//     // const allowedPhotos =
//     //   await Photo.find({
//     //     photoUrl: {
//     //       $in: matchedUrls,
//     //     },
//     //     groupId: {
//     //       $in: allowedGroupIds,
//     //     },
//     //   })
//     //   .sort({
//     //     createdAt: -1,
//     //   });


//     const allowedPhotos =
//   await Photo.find({
//     photoUrl: {
//       $in: matchedUrls,
//     },
//     groupId: {
//       $in: allowedGroupIds,
//     },
//   })
//     .populate("groupId", "name") 
//     .sort({
//       createdAt: -1,
//     });


//     return NextResponse.json({

//       success: true,

//       matches: allowedPhotos,

//     });

//   }
//   catch (error) {

//     console.error(
//       "My face route error:",
//       error
//     );

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
import "@/models/Group";

import { FACE_API_URL } from "@/lib/faceApi";

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

    const userId = decoded.userId;

    // 🎯 Call Face Recognition API
    let matchedUrls: string[] = [];

    try {
      const response = await fetch(
        `${FACE_API_URL}/find-matches`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        const text =
          await response.text();

        console.error(
          "Face API error:",
          text
        );

        return NextResponse.json({
          success: true,
          matches: [],
        });
      }

      const data =
        await response.json();

      matchedUrls =
        (data.matches || []).map(
          (m: any) => m.image_url
        );

    } catch (err) {
      console.error(
        "Face API unreachable:",
        err
      );

      return NextResponse.json({
        success: true,
        matches: [],
      });
    }

    if (matchedUrls.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
      });
    }

    // ✅ Get allowed groups
    const memberships =
      await GroupMember.find({
        userId,
        status: "approved",
      });

    const allowedGroupIds =
      memberships.map(
        (m: any) => m.groupId
      );

    if (allowedGroupIds.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
      });
    }

    // ✅ Fetch allowed photos
    const photos =
      await Photo.find({
        photoUrl: {
          $in: matchedUrls,
        },
        groupId: {
          $in: allowedGroupIds,
        },
      })
        .populate("groupId", "name")
        .sort({
          createdAt: -1,
        });

    // ✅ SAFE RESPONSE
    const safePhotos = photos.map(
      (p: any) => ({
        _id: p._id.toString(),
        photoUrl: p.photoUrl,
        group: p.groupId
          ? {
              _id:
                p.groupId._id.toString(),
              name:
                p.groupId.name,
            }
          : null,
        createdAt: p.createdAt,
      })
    );

    return NextResponse.json({
      success: true,
      count: safePhotos.length,
      matches: safePhotos,
    });

  } catch (error) {
    console.error(
      "My face route error:",
      error
    );

    return NextResponse.json(
      {
        error: "Server error",
      },
      { status: 500 }
    );
  }
}
