import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { resolve, dirname } from 'path';
import { Readable } from 'stream';
import PQueue from 'p-queue';
import { env, paths } from '../lib/env.js';
import { ensureDir, writeJson, fileExists } from '../lib/fs-utils.js';
import { withRetry } from '../lib/retry.js';
import { log, error } from '../lib/logger.js';

export interface StorageManifestEntry {
  bucket: string;
  path: string;
  mimeType: string | null;
  size: number;
  createdAt: string | null;
  originalUrl: string;
  localPath: string;
  downloaded: boolean;
}

interface StorageObject {
  name: string;
  id?: string;
  metadata?: { mimetype?: string; size?: number };
  created_at?: string;
}

async function supabaseFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = `${env.supabaseUrl}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.supabaseServiceKey()}`,
      apikey: env.supabaseServiceKey(),
      ...(init?.headers || {}),
    },
  });
}

async function listBuckets(): Promise<{ id: string; name: string; public: boolean }[]> {
  const res = await withRetry(() => supabaseFetch('/storage/v1/bucket'), { label: 'list buckets' });
  if (!res.ok) throw new Error(`list buckets failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function listObjects(bucket: string, prefix = ''): Promise<StorageObject[]> {
  const body = {
    prefix,
    limit: 1000,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  };
  const res = await withRetry(
    () =>
      supabaseFetch(`/storage/v1/object/list/${bucket}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    { label: `list ${bucket}/${prefix}` }
  );
  if (!res.ok) throw new Error(`list objects failed: ${res.status}`);
  const items: StorageObject[] = await res.json();
  const files: StorageObject[] = [];
  const folders: string[] = [];

  for (const item of items) {
    if (!item.name || item.name === '.emptyFolderPlaceholder') continue;
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null || item.id === undefined) {
      const hasExtension = /\.[a-zA-Z0-9]+$/.test(item.name);
      if (!hasExtension && !item.metadata) {
        folders.push(fullPath);
      } else {
        files.push({ ...item, name: fullPath });
      }
    } else {
      files.push({ ...item, name: fullPath });
    }
  }

  for (const folder of folders) {
    const nested = await listObjects(bucket, folder);
    files.push(...nested);
  }

  return files;
}

async function downloadFile(bucket: string, objectPath: string, destPath: string): Promise<void> {
  if (await fileExists(destPath)) return;

  await ensureDir(dirname(destPath));
  const encoded = objectPath.split('/').map(encodeURIComponent).join('/');
  const res = await withRetry(
    () => supabaseFetch(`/storage/v1/object/${bucket}/${encoded}`),
    { label: `download ${bucket}/${objectPath}` }
  );
  if (!res.ok) throw new Error(`download failed ${res.status}: ${bucket}/${objectPath}`);
  if (!res.body) throw new Error('empty body');

  const nodeStream = Readable.fromWeb(res.body as import('stream/web').ReadableStream);
  await pipeline(nodeStream, createWriteStream(destPath));
}

export async function exportStorage(): Promise<void> {
  await ensureDir(paths.storage);

  const buckets = await listBuckets();
  log(`Found ${buckets.length} storage buckets`);

  const manifest: StorageManifestEntry[] = [];
  const checkpointPath = resolve(paths.storage, '.download-checkpoint.json');
  let completed = new Set<string>();
  const existing = await import('../lib/fs-utils.js').then((m) => m.readJson<{ completed: string[] }>(checkpointPath));
  if (existing?.completed) completed = new Set(existing.completed);

  const queue = new PQueue({ concurrency: env.storageDownloadConcurrency });

  for (const bucket of buckets) {
    log(`Listing bucket: ${bucket.name}`);
    const objects = await listObjects(bucket.name);
    log(`  ${objects.length} objects in ${bucket.name}`);

    for (const obj of objects) {
      const key = `${bucket.name}/${obj.name}`;
      if (completed.has(key)) continue;

      const localPath = resolve(paths.storage, bucket.name, obj.name);
      const publicUrl = `${env.supabaseUrl}/storage/v1/object/public/${bucket.name}/${obj.name}`;

      await queue.add(async () => {
        try {
          await downloadFile(bucket.name, obj.name, localPath);
          manifest.push({
            bucket: bucket.name,
            path: obj.name,
            mimeType: obj.metadata?.mimetype ?? null,
            size: obj.metadata?.size ?? 0,
            createdAt: obj.created_at ?? null,
            originalUrl: publicUrl,
            localPath,
            downloaded: true,
          });
          completed.add(key);
          if (completed.size % 50 === 0) {
            await writeJson(checkpointPath, { completed: [...completed] });
          }
        } catch (e) {
          error(`Failed ${key}`, e);
          manifest.push({
            bucket: bucket.name,
            path: obj.name,
            mimeType: null,
            size: 0,
            createdAt: null,
            originalUrl: publicUrl,
            localPath,
            downloaded: false,
          });
        }
      });
    }
  }

  await queue.onIdle();
  await writeJson(checkpointPath, { completed: [...completed] });
  await writeJson(resolve(env.rootDir, 'storage_manifest.json'), {
    exportedAt: new Date().toISOString(),
    totalFiles: manifest.length,
    downloaded: manifest.filter((m) => m.downloaded).length,
    files: manifest,
  });
  log(`Storage export done: ${manifest.filter((m) => m.downloaded).length}/${manifest.length} files`);
}
