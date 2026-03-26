import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId:
      process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
) {
  const uniqueName = `${process.env.AWS_BASE_FOLDER}/${uuidv4()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: uniqueName,
    Body: file,
    ContentType: contentType,
  });

  await s3.send(command);

  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueName}`;

  return url;
}

export function extractS3KeyFromUrl(
  photoUrl: string
): string | null {
  if (!photoUrl) return null;

  try {
    if (photoUrl.startsWith("http")) {
      const url = new URL(photoUrl);
      const rawKey = url.pathname.replace(/^\/+/, "");
      const key = decodeURIComponent(rawKey);
      return key || null;
    }

    const rawKey = photoUrl.replace(/^\/+/, "");
    return decodeURIComponent(rawKey);
  } catch {
    return null;
  }
}

export async function getSignedDownloadUrl(
  key: string,
  filename?: string
) {
  const downloadName =
    filename || key.split("/").pop() || "photo.jpg";

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${downloadName}"`,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 60 * 5,
  });

  return url;
}

export async function getS3ObjectStream(
  key: string
) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });

  const response = await s3.send(command);

  return response.Body;
}
