import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";

import Event from "@/models/Event";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import Photo from "@/models/Photo";
import User from "@/models/User";

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const auth = await requireApiAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID required" },
        { status: 400 }
      );
    }

    const user = await User.findById(auth.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.ownerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    const groups = await Group.find({ eventId }).select("_id");
    const groupIds = groups.map((g) => g._id);

    await Photo.deleteMany({
      groupId: { $in: groupIds },
    });

    await GroupMember.deleteMany({
      groupId: { $in: groupIds },
    });

    await Group.deleteMany({ eventId });
    await Event.deleteOne({ _id: eventId });

    return NextResponse.json({
      success: true,
      message:
        "Event and all related data deleted successfully",
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
