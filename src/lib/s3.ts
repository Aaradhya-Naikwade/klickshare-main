import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { v4 as uuidv4 } from "uuid";

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
