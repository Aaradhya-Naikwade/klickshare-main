// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";

// import Group from "@/models/Group";
// import Event from "@/models/Event";
// import User from "@/models/User";
// import GroupMember from "@/models/GroupMember";

// import { verifyToken } from "@/lib/jwt";

// import crypto from "crypto";

// export async function POST(req: Request) {
//   try {
//     await connectDB();

//     const body = await req.json();

//     const {
//       token,
//       eventId,
//       name,
//       description,
//       visibility,
//     } = body;

//     // Validate required fields
//     if (
//       !token ||
//       !eventId ||
//       !name ||
//       !visibility
//     ) {
//       return NextResponse.json(
//         {
//           error:
//             "Missing required fields",
//         },
//         { status: 400 }
//       );
//     }

//     // Verify token
//     const decoded: any =
//       verifyToken(token);

//     if (!decoded) {
//       return NextResponse.json(
//         { error: "Invalid token" },
//         { status: 401 }
//       );
//     }

//     // Get user
//     const user = await User.findById(
//       decoded.userId
//     );

//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Only photographer can create group
//     if (user.role !== "photographer") {
//       return NextResponse.json(
//         {
//           error:
//             "Only photographers can create groups",
//         },
//         { status: 403 }
//       );
//     }

//     // Verify event exists
//     const event = await Event.findById(
//       eventId
//     );

//     if (!event) {
//       return NextResponse.json(
//         { error: "Event not found" },
//         { status: 404 }
//       );
//     }

//     // Verify ownership
//     if (
//       event.ownerId.toString() !==
//       user._id.toString()
//     ) {
//       return NextResponse.json(
//         {
//           error:
//             "You do not own this event",
//         },
//         { status: 403 }
//       );
//     }

//     // Generate invite code
//     const inviteCode =
//       crypto
//         .randomBytes(4)
//         .toString("hex")
//         .toUpperCase();

//     // Create QR placeholder
//     const qrCodeUrl = `INVITE:${inviteCode}`;

//     // Create group
//     const group =
//       await Group.create({
//         eventId,
//         name,
//         description,
//         visibility,
//         inviteCode,
//         qrCodeUrl,
//         ownerId: user._id,
//       });

//     // Add owner as member
//     await GroupMember.create({
//       groupId: group._id,
//       userId: user._id,

//       role: "owner",
//       accessLevel: "full",
//       status: "approved",
//     });

//     return NextResponse.json({
//       success: true,
//       group,
//     });
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       { error: "Server error" },
//       { status: 500 }
//     );
//   }
// }









import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

import Group from "@/models/Group";
import Event from "@/models/Event";
import User from "@/models/User";
import GroupMember from "@/models/GroupMember";

import { verifyAuth } from "@/lib/auth-verify";

import crypto from "crypto";

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

    const {
      eventId,
      name,
      description,
      visibility,
    } = body;

    // Validate required fields
    if (!eventId || !name || !visibility) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findById(
      decoded.userId
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Only photographer can create group
    if (user.role !== "photographer") {
      return NextResponse.json(
        {
          error:
            "Only photographers can create groups",
        },
        { status: 403 }
      );
    }

    // Verify event exists
    const event = await Event.findById(
      eventId
    );

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (
      event.ownerId.toString() !==
      user._id.toString()
    ) {
      return NextResponse.json(
        {
          error:
            "You do not own this event",
        },
        { status: 403 }
      );
    }

    // Generate invite code
    const inviteCode = crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase();

    // Create QR placeholder
    const qrCodeUrl = `INVITE:${inviteCode}`;

    // Create group
    const group = await Group.create({
      eventId,
      name,
      description,
      visibility,
      inviteCode,
      qrCodeUrl,
      ownerId: user._id,
    });

    // Add owner as member
    await GroupMember.create({
      groupId: group._id,
      userId: user._id,
      role: "owner",
      accessLevel: "full",
      status: "approved",
    });

    // ✅ SAFE RESPONSE
    return NextResponse.json({
      success: true,
      group: {
        _id: group._id.toString(),
        name: group.name,
        description: group.description || "",
        visibility: group.visibility,
        inviteCode: group.inviteCode,
        qrCodeUrl: group.qrCodeUrl,
        eventId: group.eventId,
        createdAt: group.createdAt,
      },
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
