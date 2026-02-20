import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";

import User from "@/models/User";
import Event from "@/models/Event";
import Group from "@/models/Group";

export async function GET(req: Request) {
  try {
    await connectDB();

    const auth = await requireApiAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const user = await User.findById(auth.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "photographer") {
      return NextResponse.json(
        {
          error: "Only photographers have events",
        },
        { status: 403 }
      );
    }

    const events = await Event.find({
      ownerId: user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    const eventsWithGroupCount = await Promise.all(
      events.map(async (event) => {
        const groupCount = await Group.countDocuments({
          eventId: event._id,
        });

        return {
          _id: event._id.toString(),
          title: event.title,
          description: event.description || "",
          ownerId: event.ownerId,
          createdAt: event.createdAt,
          groupCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: eventsWithGroupCount.length,
      events: eventsWithGroupCount,
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
