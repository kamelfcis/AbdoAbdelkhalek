const SUPABASE_URL = (
  process.env.REACT_APP_SUPABASE_URL || 'https://ugscjqusyjttihnfhtuk.supabase.co'
).replace(/\/$/, '');

const CDN_HOST = (
  process.env.REACT_APP_CDN_URL || 'https://cdn.abdelrhmanabdelkhalek.com'
).replace(/\/$/, '');

const SUPABASE_STORAGE_PREFIX =
  /https?:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//;

/** Serve media from Cloudflare (R2 public URL or custom CDN), not Supabase. */
export function isCdnEnabled() {
  return process.env.REACT_APP_USE_CDN === 'true';
}

function trimBase(url) {
  return (url || '').replace(/\/$/, '');
}

function r2PublicBase() {
  return trimBase(
    process.env.REACT_APP_R2_PUBLIC_URL || process.env.REACT_APP_MEDIA_BASE_URL || ''
  );
}

/** Cloudflare media origin: r2.dev (or MEDIA_BASE) first, then custom CDN host. */
export function getMediaBase() {
  const r2 = r2PublicBase();
  if (isCdnEnabled()) {
    if (r2) return r2;
    return CDN_HOST;
  }
  return r2 || null;
}

export function supabasePublicUrl(bucket, path) {
  if (!path) return null;
  let normalized = String(path).trim().replace(/^\/+/, '');
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return toMediaUrl(normalized);
  }
  if (!normalized.startsWith(`${bucket}/`)) {
    normalized = `${bucket}/${normalized}`;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${normalized}`;
}

function cdnUrlToSupabase(url) {
  if (!url.startsWith(`${CDN_HOST}/`)) return url;
  const pathPart = url.slice(CDN_HOST.length + 1);
  const slash = pathPart.indexOf('/');
  if (slash === -1) return url;
  const bucket = pathPart.slice(0, slash);
  const objectPath = pathPart.slice(slash + 1);
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectPath}`;
}

/** Rewrite legacy Supabase storage URLs to the active media base (CDN when enabled). */
export function toMediaUrl(url) {
  if (!url || typeof url !== 'string') return url;

  if (isCdnEnabled()) {
    const base = getMediaBase();
    if (SUPABASE_STORAGE_PREFIX.test(url)) {
      return url.replace(SUPABASE_STORAGE_PREFIX, `${base}/`);
    }
    if (base && url.startsWith(`${CDN_HOST}/`)) {
      return `${base}/${url.slice(CDN_HOST.length + 1)}`;
    }
    return url;
  }

  if (url.startsWith(`${CDN_HOST}/`)) {
    return cdnUrlToSupabase(url);
  }
  return url;
}

/** @deprecated alias */
export const toCdnUrl = toMediaUrl;

export function mediaUrl(bucket, path) {
  if (!path) return null;
  if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
    return toMediaUrl(path);
  }
  const base = getMediaBase();
  const normalized = String(path).trim().replace(/^\/+/, '');
  const key = normalized.startsWith(bucket) ? normalized : `${bucket}/${normalized}`;
  if (base) return `${base}/${key}`;
  return supabasePublicUrl(bucket, normalized);
}

/** @deprecated alias */
export const cdnUrl = mediaUrl;

/** Resolve image_url and/or image_path to a full https URL. */
export function resolveMediaUrl(url, path, bucket) {
  if (path && /^https?:\/\//.test(path)) return toMediaUrl(path);
  if (url && /^https?:\/\//.test(url)) return toMediaUrl(url);
  if (path) return mediaUrl(bucket, path) || '';
  if (url) return mediaUrl(bucket, url);
  return '';
}

/** Deep-rewrite Supabase storage URLs in API payloads (snake_case or camelCase). */
export function rewriteMediaUrls(data) {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') return toMediaUrl(data);
  if (data instanceof Date) return data;
  if (Array.isArray(data)) return data.map(rewriteMediaUrls);
  if (typeof data === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(data)) {
      out[key] = rewriteMediaUrls(value);
    }
    return out;
  }
  return data;
}

/** Public media origin for Dashboard (CDN, R2 public, or Supabase storage root). */
export const CDN_BASE =
  getMediaBase() || `${SUPABASE_URL}/storage/v1/object/public`;

/** Cloudflare Image Resizing via /cdn-cgi/image/ (custom domain only). */
export function isCloudflareImageResizingEnabled() {
  return process.env.REACT_APP_CF_IMAGE_RESIZING === 'true';
}

/**
 * Derive stored thumb path: categories/foo.jpg → categories/thumbs/foo.webp
 */
export function deriveThumbStoragePath(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return null;
  const trimmed = imagePath.trim().replace(/^\/+/, '');
  if (!trimmed || trimmed.includes('..')) return null;
  const slash = trimmed.lastIndexOf('/');
  const dir = slash >= 0 ? trimmed.slice(0, slash) : '';
  const file = slash >= 0 ? trimmed.slice(slash + 1) : trimmed;
  const stem = file.replace(/\.[^.]+$/, '');
  if (!stem) return null;
  return dir ? `${dir}/thumbs/${stem}.webp` : `thumbs/${stem}.webp`;
}

/** Card hero variant: categories/foo.jpg → categories/thumbs/foo-480.webp */
export function deriveCardThumbStoragePath(imagePath) {
  const base = deriveThumbStoragePath(imagePath);
  if (!base) return null;
  return base.replace(/\/thumbs\/([^/]+)\.webp$/, '/thumbs/$1-480.webp');
}

function buildCloudflareImageUrl(baseUrl, { width = 80, quality = 75, format = 'auto' } = {}) {
  if (!baseUrl || !/^https?:\/\//.test(baseUrl)) return baseUrl;
  try {
    const parsed = new URL(baseUrl);
    const host = parsed.host;
    const cdnHost = CDN_HOST.replace(/^https?:\/\//, '');
    const r2Host = r2PublicBase() ? new URL(r2PublicBase()).host : null;
    const isTransformHost =
      host === cdnHost || (r2Host && host === r2Host) || host.endsWith('.r2.dev');
    if (!isTransformHost || parsed.pathname.includes('/cdn-cgi/image/')) {
      return baseUrl;
    }
    const opts = [`width=${width}`, `quality=${quality}`, `format=${format}`].join(',');
    return `${parsed.origin}/cdn-cgi/image/${opts}${parsed.pathname}${parsed.search}`;
  } catch {
    return baseUrl;
  }
}

/**
 * Resolve a dashboard list thumbnail URL (prefers stored/convention thumb, then CF resize, else full).
 */
export function mediaThumbUrl(url, path, bucket, options = {}) {
  const { width = 80, quality = 75, format = 'auto', thumbPath } = options;
  const full = resolveMediaUrl(url, path, bucket);
  if (!full) return '';

  const storedThumb = thumbPath || deriveThumbStoragePath(path || url);
  if (storedThumb && !/^https?:\/\//.test(storedThumb)) {
    const thumbFull = mediaUrl(bucket, storedThumb);
    if (thumbFull) return thumbFull;
  }

  if (isCloudflareImageResizingEnabled()) {
    return buildCloudflareImageUrl(full, { width, quality, format });
  }

  return full;
}
