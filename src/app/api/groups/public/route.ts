// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";
// import Group from "@/models/Group";
// import Event from "@/models/Event";

// export async function GET() {
//   try {

//     await connectDB();

//     const groups =
//       await Group.find({
//         visibility: "public",
//         isActive: true,
//       })
//         .populate(
//           "eventId",
//           "title"
//         )
//         .sort({
//           createdAt: -1,
//         });

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
import Group from "@/models/Group";
import Event from "@/models/Event";

export async function GET() {
  try {
    await connectDB();

    const groups =
      await Group.find({
        visibility: "public",
        isActive: true,
      })
        .populate(
          "eventId",
          "title"
        )
        .sort({
          createdAt: -1,
        });

    // ✅ SAFE RESPONSE
    const safeGroups = groups.map(
      (group: any) => ({
        _id: group._id.toString(),
        name: group.name,
        description:
          group.description || "",
        visibility: group.visibility,
        inviteCode: group.inviteCode,
        qrCodeUrl: group.qrCodeUrl,
        createdAt: group.createdAt,

        event: group.eventId
          ? {
              _id:
                group.eventId._id.toString(),
              title:
                group.eventId.title,
            }
          : null,
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
