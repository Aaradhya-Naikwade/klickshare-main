// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import { verifyToken } from "@/lib/jwt";

// import Group from "@/models/Group";

// export async function GET(req: Request) {

//   try {

//     await connectDB();

//     const { searchParams } =
//       new URL(req.url);

//     const eventId =
//       searchParams.get("eventId");

//     const token =
//       req.headers
//         .get("authorization")
//         ?.replace("Bearer ", "");

//     if (!eventId || !token) {
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

//     const groups =
//       await Group.find({
//         eventId,
//         isActive: true,
//       }).sort({
//         createdAt: -1,
//       });

//     return NextResponse.json({
//       success: true,
//       groups,
//     });

//   } catch {

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

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(req.url);

    const eventId =
      searchParams.get("eventId");

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

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID required" },
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

    const groups =
      await Group.find({
        eventId,
        isActive: true,
      }).sort({
        createdAt: -1,
      });

    // ✅ SAFE RESPONSE
    const safeGroups = groups.map(
      (group: any) => ({
        _id: group._id.toString(),
        name: group.name,
        eventId: group.eventId,
        createdAt: group.createdAt,
      })
    );

    return NextResponse.json({
      success: true,
      count: safeGroups.length,
      groups: safeGroups,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
