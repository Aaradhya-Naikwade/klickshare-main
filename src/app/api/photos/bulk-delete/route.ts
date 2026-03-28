import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";
import { deleteFromS3, extractS3KeyFromUrl } from "@/lib/s3";

import Photo from "@/models/Photo";
import GroupMember from "@/models/GroupMember";
import Group from "@/models/Group";
import User from "@/models/User";

export const runtime = "nodejs";

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

    const { photoIds } = await req.json();

    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { error: "Photo IDs required" },
        { status: 400 }
      );
    }

    const user = await User.findById(auth.userId).select("role");
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

    const photos = await Photo.find({
      _id: { $in: photoIds },
    });

    if (photos.length === 0) {
      return NextResponse.json(
        { error: "Photos not found" },
        { status: 404 }
      );
    }

    const groupIds = [
      ...new Set(photos.map((p: any) => p.groupId?.toString())),
    ].filter(Boolean);

    const memberships = await GroupMember.find({
      groupId: { $in: groupIds },
      userId: auth.userId,
      status: "approved",
    });

    const membershipByGroup = new Map(
      memberships.map((m: any) => [m.groupId.toString(), m])
    );

    const groups = await Group.find({ _id: { $in: groupIds } }).select(
      "ownerId"
    );
    const groupOwnerById = new Map(
      groups.map((g: any) => [g._id.toString(), g.ownerId.toString()])
    );

    const deleted: string[] = [];
    const failed: { id: string; reason: string }[] = [];

    for (const photo of photos) {
      const groupId = photo.groupId?.toString();
      if (!groupId || !membershipByGroup.has(groupId)) {
        failed.push({ id: photo._id.toString(), reason: "Access denied" });
        continue;
      }

      const ownerId = groupOwnerById.get(groupId);
      const isOwner = ownerId === auth.userId;
      const isUploader = photo.uploadedBy?.toString?.() === auth.userId;

      if (!isOwner && !isUploader) {
        failed.push({ id: photo._id.toString(), reason: "Delete not allowed" });
        continue;
      }

      const key = extractS3KeyFromUrl(photo.photoUrl);
      if (!key) {
        failed.push({ id: photo._id.toString(), reason: "Invalid photo URL" });
        continue;
      }

      try {
        await deleteFromS3(key);
        await photo.deleteOne();
        deleted.push(photo._id.toString());
      } catch {
        failed.push({ id: photo._id.toString(), reason: "Delete failed" });
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: deleted.length,
      deleted,
      failedCount: failed.length,
      failed,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Bulk delete failed" },
      { status: 500 }
    );
  }
}

