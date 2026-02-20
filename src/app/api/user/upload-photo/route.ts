import { NextResponse } from "next/server";

import { uploadToS3 } from "@/lib/s3";
import { connectDB } from "@/lib/db";
import { FACE_API_URL } from "@/lib/faceApi";
import { requireApiAuth } from "@/lib/api-auth";

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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "File missing" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const url = await uploadToS3(
      buffer,
      file.name,
      file.type
    );

    await User.findByIdAndUpdate(auth.userId, {
      profilePhoto: url,
    });

    try {
      const response = await fetch(
        `${FACE_API_URL}/register-face`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: auth.userId,
            image_url: url,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Face API error:", text);
      }
    } catch (err) {
      console.error("Face register failed:", err);
    }

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
