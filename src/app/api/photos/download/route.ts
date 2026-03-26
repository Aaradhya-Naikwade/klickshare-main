import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";
import {
  extractS3KeyFromUrl,
  getSignedDownloadUrl,
} from "@/lib/s3";
import { FACE_API_URL } from "@/lib/faceApi";

import Photo from "@/models/Photo";
import GroupMember from "@/models/GroupMember";
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

    const membership = await GroupMember.findOne({
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

    const hasFullAccess =
      membership.role === "owner" ||
      membership.role === "contributor" ||
      membership.accessLevel === "full";

    if (!hasFullAccess) {
      const uploader =
        photo.uploadedBy?.toString?.() ||
        String(photo.uploadedBy);

      if (uploader !== auth.userId) {
        const user = await User.findById(
          auth.userId
        ).select("role");

        if (!user || user.role !== "viewer") {
          return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
          );
        }

        let isMatched = false;
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
                user_id: auth.userId,
              }),
            }
          );

          if (response.ok) {
            const data =
              await response.json();
            const matchedUrls = new Set(
              (data.matches || []).map(
                (m: any) => m.image_url
              )
            );
            isMatched = matchedUrls.has(
              photo.photoUrl
            );
          }
        } catch {
          isMatched = false;
        }

        if (!isMatched) {
          return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
          );
        }
      }
    }

    const key = extractS3KeyFromUrl(photo.photoUrl);

    if (!key) {
      return NextResponse.json(
        { error: "Invalid photo URL" },
        { status: 500 }
      );
    }

    const filename =
      key.split("/").pop() || "photo.jpg";

    const url = await getSignedDownloadUrl(
      key,
      filename
    );

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}
