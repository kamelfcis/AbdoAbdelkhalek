import { env } from '../../config/env.js';

const SUPABASE_STORAGE_PREFIX =
  /https?:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//;

const R2_PUBLIC_PREFIX = /https?:\/\/pub-[^/]+\.r2\.dev\//;

function cdnUrlToSupabase(url: string): string {
  const prefix = `${env.cdnBaseUrl}/`;
  if (!url.startsWith(prefix)) return url;
  const pathPart = url.slice(prefix.length);
  const slash = pathPart.indexOf('/');
  if (slash === -1) return url;
  const bucket = pathPart.slice(0, slash);
  const objectPath = pathPart.slice(slash + 1);
  return `${env.supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
}

export function supabasePublicUrl(bucket: string, path: string): string {
  let normalized = path.trim().replace(/^\/+/, '');
  if (!normalized.startsWith(`${bucket}/`)) {
    normalized = `${bucket}/${normalized}`;
  }
  return `${env.supabaseUrl}/storage/v1/object/public/${normalized}`;
}

export function buildMediaUrl(bucket: string, path: string): string {
  const normalized = path.trim().replace(/^\/+/, '');
  const key = normalized.startsWith(bucket) ? normalized : `${bucket}/${normalized}`;
  if (env.useCdn || env.mediaBaseUrl) {
    const base = env.mediaBaseUrl || env.cdnBaseUrl;
    return `${base}/${key}`;
  }
  return supabasePublicUrl(bucket, normalized);
}

export function rewriteStorageUrl(url: string | null | undefined): string | null | undefined {
  if (!url || typeof url !== 'string') return url;

  if (env.useCdn) {
    const base = env.mediaBaseUrl || env.cdnBaseUrl;
    if (SUPABASE_STORAGE_PREFIX.test(url)) {
      return url.replace(SUPABASE_STORAGE_PREFIX, `${base}/`);
    }
    if (R2_PUBLIC_PREFIX.test(url)) {
      return url.replace(R2_PUBLIC_PREFIX, `${base}/`);
    }
    if (env.r2PublicUrl && url.startsWith(`${env.r2PublicUrl}/`)) {
      return `${base}/${url.slice(env.r2PublicUrl.length + 1)}`;
    }
    if (env.mediaBaseUrl && url.startsWith(`${env.cdnBaseUrl}/`)) {
      return `${env.mediaBaseUrl}/${url.slice(env.cdnBaseUrl.length + 1)}`;
    }
    return url;
  }

  if (!env.useCdn && url.startsWith(`${env.cdnBaseUrl}/`)) {
    return cdnUrlToSupabase(url);
  }
  return url;
}

export function rewriteMediaUrls<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') return rewriteStorageUrl(data) as T;
  if (data instanceof Date) return data;
  if (Array.isArray(data)) return data.map((item) => rewriteMediaUrls(item)) as T;
  if (typeof data === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      out[key] = rewriteMediaUrls(value);
    }
    return out as T;
  }
  return data;
}
