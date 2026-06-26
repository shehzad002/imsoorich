import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  getCloudflareAccountId,
  getR2BucketName,
} from "@/lib/cloudflare/config";

let client: S3Client | null = null;

function getR2Client() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${getCloudflareAccountId()}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

const PRESIGN_TTL_SECONDS = 7200;

export async function createR2UploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getR2Client(), command, {
    expiresIn: PRESIGN_TTL_SECONDS,
  });
}

export async function createR2DownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
  });
  return getSignedUrl(getR2Client(), command, {
    expiresIn: PRESIGN_TTL_SECONDS,
  });
}

export async function r2ObjectExists(key: string) {
  try {
    await getR2Client().send(
      new HeadObjectCommand({ Bucket: getR2BucketName(), Key: key })
    );
    return true;
  } catch {
    return false;
  }
}

export async function uploadToR2(key: string, body: Buffer, contentType: string) {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function downloadFromR2(key: string): Promise<Buffer | null> {
  try {
    const res = await getR2Client().send(
      new GetObjectCommand({ Bucket: getR2BucketName(), Key: key })
    );
    if (!res.Body) return null;
    return Buffer.from(await res.Body.transformToByteArray());
  } catch {
    return null;
  }
}

export async function deleteR2Prefix(prefix: string) {
  const bucket = getR2BucketName();
  const s3 = getR2Client();
  let token: string | undefined;

  do {
    const listed = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: token,
      })
    );

    const keys = (listed.Contents ?? [])
      .map((o) => o.Key)
      .filter((k): k is string => Boolean(k));

    if (keys.length) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: keys.map((Key) => ({ Key })) },
        })
      );
    }

    token = listed.IsTruncated ? listed.NextContinuationToken : undefined;
  } while (token);
}

export async function deleteR2Objects(keys: string[]) {
  if (!keys.length) return;
  await getR2Client().send(
    new DeleteObjectsCommand({
      Bucket: getR2BucketName(),
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    })
  );
}

export async function deleteR2Object(key: string) {
  await getR2Client().send(
    new DeleteObjectCommand({ Bucket: getR2BucketName(), Key: key })
  );
}
