import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import PQueue from 'p-queue';
import { resolve } from 'path';
import { env } from '../lib/env.js';
import { writeJson, readJson } from '../lib/fs-utils.js';
import { withRetry } from '../lib/retry.js';
import { log, error } from '../lib/logger.js';

function getR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${env.r2.accountId()}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.r2.accessKeyId(),
      secretAccessKey: env.r2.secretAccessKey(),
    },
  });
}

async function supabaseFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${env.supabaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.supabaseServiceKey()}`,
      apikey: env.supabaseServiceKey(),
      ...(init?.headers || {}),
    },
  });
}

async function listBuckets(): Promise<{ name: string }[]> {
  const res = await withRetry(() => supabaseFetch('/storage/v1/bucket'));
  if (!res.ok) throw new Error(`list buckets: ${res.status}`);
  return res.json();
}

interface StorageObject {
  name: string;
  metadata?: { mimetype?: string };
}

async function listObjects(bucket: string, prefix = ''): Promise<StorageObject[]> {
  const res = await withRetry(
    () =>
      supabaseFetch(`/storage/v1/object/list/${bucket}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, limit: 1000, offset: 0 }),
      }),
    { label: `list ${bucket}` }
  );
  if (!res.ok) throw new Error(`list ${bucket}: ${res.status}`);
  const items: StorageObject[] = await res.json();
  const files: StorageObject[] = [];
  for (const item of items) {
    if (!item.name || item.name === '.emptyFolderPlaceholder') continue;
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (!/\.[a-zA-Z0-9]+$/.test(item.name)) {
      files.push(...(await listObjects(bucket, fullPath)));
    } else {
      files.push({ ...item, name: fullPath });
    }
  }
  return files;
}

export async function uploadToR2Stream(): Promise<void> {
  const client = getR2Client();
  const r2Bucket = env.r2.bucketName;
  const checkpointPath = resolve(env.rootDir, 'r2-stream-checkpoint.json');
  const completed = new Set<string>(
    (await readJson<{ completed: string[] }>(checkpointPath))?.completed || []
  );
  const urlMappings: { old_url: string; new_url: string }[] = [];
  const queue = new PQueue({ concurrency: Math.min(env.r2UploadConcurrency, 4) });

  for (const b of await listBuckets()) {
    const objects = await listObjects(b.name);
    log(`Stream ${b.name}: ${objects.length} objects`);
    for (const obj of objects) {
      const key = `${b.name}/${obj.name}`;
      if (completed.has(key)) {
        urlMappings.push({
          old_url: `${env.supabaseUrl}/storage/v1/object/public/${key}`,
          new_url: `${env.cdnBaseUrl}/${key}`,
        });
        continue;
      }
      await queue.add(async () => {
        try {
          const encoded = obj.name.split('/').map(encodeURIComponent).join('/');
          const res = await withRetry(() => supabaseFetch(`/storage/v1/object/${b.name}/${encoded}`));
          if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
          const body = Readable.fromWeb(res.body as import('stream/web').ReadableStream);
          await new Upload({
            client,
            params: {
              Bucket: r2Bucket,
              Key: key,
              Body: body,
              ContentType: obj.metadata?.mimetype || 'application/octet-stream',
            },
            partSize: 10 * 1024 * 1024,
          }).done();
          urlMappings.push({
            old_url: `${env.supabaseUrl}/storage/v1/object/public/${key}`,
            new_url: `${env.cdnBaseUrl}/${key}`,
          });
          completed.add(key);
          if (completed.size % 25 === 0) {
            await writeJson(checkpointPath, { completed: [...completed] });
            log(`Uploaded ${completed.size}`);
          }
        } catch (e) {
          error(`Failed stream ${key}`, e);
        }
      });
    }
  }
  await queue.onIdle();
  await writeJson(checkpointPath, { completed: [...completed] });
  await writeJson(resolve(env.rootDir, 'url_mapping.json'), urlMappings);
  await writeJson(resolve(env.rootDir, 'cloudflare_r2_manifest.json'), {
    exportedAt: new Date().toISOString(),
    method: 'stream',
    totalUploaded: completed.size,
  });
  log(`R2 stream upload done: ${completed.size}`);
}
