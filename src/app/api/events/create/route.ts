import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";

import Event from "@/models/Event";
import User from "@/models/User";

export async function POST(req: Request) {
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
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title required" },
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

    if (user.role !== "photographer") {
      return NextResponse.json(
        {
          error: "Only photographers can create events",
        },
        { status: 403 }
      );
    }

    const event = await Event.create({
      title,
      description,
      ownerId: user._id,
    });

    return NextResponse.json({
      success: true,
      event: {
        _id: event._id.toString(),
        title: event.title,
        description: event.description || "",
        ownerId: event.ownerId,
        createdAt: event.createdAt,
      },
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
