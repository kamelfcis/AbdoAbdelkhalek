import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/env.js';
import { buildMediaUrl } from '../../common/utils/cdn-url.js';

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.r2.accessKeyId,
        secretAccessKey: env.r2.secretAccessKey,
      },
    });
  }
  return client;
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: env.r2.bucketName,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 3600 });
  const publicUrl = buildMediaUrl(bucketFromKey(key), key);
  return { uploadUrl, publicUrl, key };
}

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<{ publicUrl: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: env.r2.bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  });
  await getClient().send(command);
  const publicUrl = buildMediaUrl(bucketFromKey(key), key);
  return { publicUrl, key };
}

function bucketFromKey(key: string): string {
  const slash = key.indexOf('/');
  return slash === -1 ? key : key.slice(0, slash);
}

export function buildCdnUrl(bucket: string, path: string): string {
  return buildMediaUrl(bucket, path);
}
