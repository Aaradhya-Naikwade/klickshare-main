import { NextResponse } from "next/server";
import archiver from "archiver";
import { PassThrough, Readable } from "stream";

import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/api-auth";
import {
  extractS3KeyFromUrl,
  getS3ObjectStream,
} from "@/lib/s3";
import { FACE_API_URL } from "@/lib/faceApi";

import Photo from "@/models/Photo";
import GroupMember from "@/models/GroupMember";
import User from "@/models/User";

export const runtime = "nodejs";

function toNodeStream(body: any) {
  if (!body) return null;
  if (typeof body.pipe === "function") return body;
  if (typeof (Readable as any).fromWeb === "function") {
    return (Readable as any).fromWeb(body);
  }
  return Readable.from(body);
}

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
      memberships.map((m: any) => [
        m.groupId.toString(),
        m,
      ])
    );

    const user = await User.findById(
      auth.userId
    ).select("role");

    let matchedUrls: Set<string> | null = null;

    async function ensureMatchedUrls() {
      if (matchedUrls) return matchedUrls;
      matchedUrls = new Set<string>();

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
          matchedUrls = new Set(
            (data.matches || []).map(
              (m: any) => m.image_url
            )
          );
        }
      } catch {
        matchedUrls = new Set<string>();
      }

      return matchedUrls;
    }

    const allowedPhotos = [];

    for (const p of photos) {
      const membership = membershipByGroup.get(
        p.groupId?.toString()
      );

      if (!membership) {
        continue;
      }

      const hasFullAccess =
        membership.role === "owner" ||
        membership.role === "contributor" ||
        membership.accessLevel === "full";

      if (hasFullAccess) {
        allowedPhotos.push(p);
        continue;
      }

      const uploader =
        p.uploadedBy?.toString?.() ||
        String(p.uploadedBy);

      if (uploader === auth.userId) {
        allowedPhotos.push(p);
        continue;
      }

      if (user?.role === "viewer") {
        const urls = await ensureMatchedUrls();
        if (urls.has(p.photoUrl)) {
          allowedPhotos.push(p);
        }
      }
    }

    if (allowedPhotos.length === 0) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const stream = new PassThrough();
    archive.pipe(stream);

    archive.on("warning", (err) => {
      console.warn("Zip warning:", err);
    });

    archive.on("error", (err) => {
      console.error("Zip error:", err);
      stream.destroy(err);
    });

    for (let i = 0; i < allowedPhotos.length; i++) {
      const photo = allowedPhotos[i];
      const key = extractS3KeyFromUrl(photo.photoUrl);
      if (!key) continue;

      const body = await getS3ObjectStream(key);
      const nodeStream = toNodeStream(body);
      if (!nodeStream) continue;

      const baseName = key.split("/").pop() || "photo.jpg";
      const filename = `${i + 1}-${baseName}`;

      archive.append(nodeStream, { name: filename });
    }

    void archive.finalize();

    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          'attachment; filename="photos.zip"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Bulk download failed" },
      { status: 500 }
    );
  }
}
