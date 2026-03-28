import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { verifyAuth } from "@/lib/auth-verify";
import { uploadToS3 } from "@/lib/s3";
import { FACE_API_URL } from "@/lib/faceApi";

import Event from "@/models/Event";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import Photo from "@/models/Photo";
import User from "@/models/User";

import crypto from "crypto";
import { assertQuota } from "@/lib/subscription";

type GroupInfo = {
  _id: string;
  name: string;
  inviteCode: string;
  qrCodeUrl: string;
};

function getGroupNameFromPath(rawPath: string) {
  const normalized = (rawPath || "").replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length >= 3) {
    return segments[1].trim() || "General";
  }

  return "General";
}

export async function POST(req: Request) {
  try {
    await connectDB();

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
    
    const decoded: any =
      await verifyAuth(token);

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const eventId = formData.get("eventId") as string;
    const visibility =
      (formData.get("visibility") as string) ||
      "private";
    const files =
      formData.getAll("file") as File[];

    if (!eventId || !files || files.length === 0) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const quotaCheck = await assertQuota(
      decoded.userId,
      files.length
    );

    
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          remaining: quotaCheck.status.remaining,
          quota: quotaCheck.status.quota,
        },
        { status: 403 }
      );
    }

    const user =
      await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "photographer") {
      return NextResponse.json(
        {
          error:
            "Only photographers can upload folders",
        },
        { status: 403 }
      );
    }

    const event =
      await Event.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

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

    const groupNames = new Set<string>();
    files.forEach((file) => {
      groupNames.add(
        getGroupNameFromPath(file.name)
      );
    });

    const groupMap =
      new Map<string, GroupInfo>();

    for (const name of groupNames) {
      const inviteCode = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

      const qrCodeUrl =
        `INVITE:${inviteCode}`;

      const group = await Group.create({
        eventId,
        name,
        description: "",
        visibility,
        inviteCode,
        qrCodeUrl,
        ownerId: user._id,
      });

      await GroupMember.create({
        groupId: group._id,
        userId: user._id,
        role: "owner",
        accessLevel: "full",
        status: "approved",
      });

      groupMap.set(name, {
        _id: group._id.toString(),
        name: group.name,
        inviteCode: group.inviteCode,
        qrCodeUrl: group.qrCodeUrl,
      });
    }

    const uploadedPhotos = [];

    for (const file of files) {
      const groupName =
        getGroupNameFromPath(file.name);
      const groupInfo =
        groupMap.get(groupName);

      if (!groupInfo) {
        return NextResponse.json(
          { error: "Group mapping failed" },
          { status: 500 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const photoUrl = await uploadToS3(
        buffer,
        file.name,
        file.type
      );

      const photo = await Photo.create({
        groupId: groupInfo._id,
        eventId: eventId,
        uploadedBy: decoded.userId,
        photoUrl,
        facesIndexed: false,
      });

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
              group_id: groupInfo._id,
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
        console.error(
          "Face indexing failed:",
          err
        );
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
      groupCount: groupMap.size,
      groups: Array.from(groupMap.values()),
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
