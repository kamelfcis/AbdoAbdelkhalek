import { readFile, stat } from 'fs/promises';
import { createReadStream } from 'fs';
import { resolve, relative } from 'path';
import { readdir } from 'fs/promises';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import PQueue from 'p-queue';
import { env, paths } from '../lib/env.js';
import { writeJson, fileExists } from '../lib/fs-utils.js';
import { withRetry } from '../lib/retry.js';
import { log, error } from '../lib/logger.js';

export interface UrlMapping {
  old_url: string;
  new_url: string;
}

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

async function walkDir(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = resolve(dir, e.name);
    if (e.name.startsWith('.')) continue;
    if (e.isDirectory()) files.push(...(await walkDir(full)));
    else files.push(full);
  }
  return files;
}

export async function uploadToR2(): Promise<void> {
  const client = getR2Client();
  const bucket = env.r2.bucketName;
  const checkpointPath = resolve(paths.backup, 'r2-upload-checkpoint.json');
  const completed = new Set<string>(
    (await import('../lib/fs-utils.js').then((m) => m.readJson<{ completed: string[] }>(checkpointPath)))?.completed || []
  );

  const localFiles = await walkDir(paths.storage);
  log(`Uploading ${localFiles.length} files to R2 bucket: ${bucket}`);

  const urlMappings: UrlMapping[] = [];
  const r2Manifest: { key: string; size: number; cdnUrl: string; uploaded: boolean }[] = [];
  const queue = new PQueue({ concurrency: env.r2UploadConcurrency });

  for (const filePath of localFiles) {
    const relFromStorage = relative(paths.storage, filePath).replace(/\\/g, '/');
    const key = relFromStorage;

    if (completed.has(key)) {
      const cdnUrl = `${env.cdnBaseUrl}/${key}`;
      const oldUrl = `${env.supabaseUrl}/storage/v1/object/public/${relFromStorage}`;
      urlMappings.push({ old_url: oldUrl, new_url: cdnUrl });
      continue;
    }

    await queue.add(async () => {
      try {
        const fileStat = await stat(filePath);
        const body = createReadStream(filePath);

        await withRetry(
          async () => {
            const upload = new Upload({
              client,
              params: {
                Bucket: bucket,
                Key: key,
                Body: body,
              },
              queueSize: 4,
              partSize: 5 * 1024 * 1024,
              leavePartsOnError: false,
            });
            await upload.done();
          },
          { label: `upload ${key}` }
        );

        const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        if (head.ContentLength !== fileStat.size) {
          throw new Error(`Size mismatch for ${key}`);
        }

        const cdnUrl = `${env.cdnBaseUrl}/${key}`;
        const oldUrl = `${env.supabaseUrl}/storage/v1/object/public/${relFromStorage}`;
        urlMappings.push({ old_url: oldUrl, new_url: cdnUrl });
        r2Manifest.push({ key, size: fileStat.size, cdnUrl, uploaded: true });
        completed.add(key);

        if (completed.size % 25 === 0) {
          await writeJson(checkpointPath, { completed: [...completed] });
        }
      } catch (e) {
        error(`Upload failed: ${key}`, e);
        r2Manifest.push({ key, size: 0, cdnUrl: '', uploaded: false });
      }
    });
  }

  await queue.onIdle();
  await writeJson(checkpointPath, { completed: [...completed] });
  await writeJson(resolve(env.rootDir, 'url_mapping.json'), urlMappings);
  await writeJson(resolve(env.rootDir, 'cloudflare_r2_manifest.json'), {
    exportedAt: new Date().toISOString(),
    bucket,
    cdnBaseUrl: env.cdnBaseUrl,
    totalUploaded: r2Manifest.filter((m) => m.uploaded).length,
    files: r2Manifest,
  });
  log(`R2 upload complete: ${r2Manifest.filter((m) => m.uploaded).length} files`);
}
