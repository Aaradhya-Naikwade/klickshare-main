import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";
import {
  deleteFromS3,
  extractS3KeyFromUrl,
} from "@/lib/s3";

import Photo from "@/models/Photo";
import GroupMember from "@/models/GroupMember";
import Group from "@/models/Group";
import User from "@/models/User";

export const runtime = "nodejs";

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

    const { photoId } = await req.json();

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID required" },
        { status: 400 }
      );
    }

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(auth.userId).select(
      "role"
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "photographer") {
      return NextResponse.json(
        { error: "Delete not allowed" },
        { status: 403 }
      );
    }

    const membership =
      await GroupMember.findOne({
        groupId: photo.groupId,
        userId: auth.userId,
        status: "approved",
      });

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const group = await Group.findById(
      photo.groupId
    ).select("ownerId");

    const isOwner =
      group?.ownerId?.toString?.() ===
      auth.userId;

    const isUploader =
      photo.uploadedBy?.toString?.() ===
      auth.userId;

    const canDelete =
      isOwner || isUploader;

    if (!canDelete) {
      return NextResponse.json(
        { error: "Delete not allowed" },
        { status: 403 }
      );
    }

    const key = extractS3KeyFromUrl(
      photo.photoUrl
    );
    if (!key) {
      return NextResponse.json(
        { error: "Invalid photo URL" },
        { status: 500 }
      );
    }

    await deleteFromS3(key);
    await photo.deleteOne();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
