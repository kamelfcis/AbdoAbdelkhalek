import { mediaThumbUrl, resolveMediaUrl } from './cdn';
import { resolveDomainMediaUrl, getSharedContentMediaBuckets } from './mediaBuckets';

const TABLE_THUMB = { width: 40, height: 40, fetchWidth: 80 };
const CARD_THUMB = { width: 480, height: 270, fetchWidth: 480 };

function sanitizeVideoStorageValue(value) {
  if (typeof value !== 'string') return null;
  return value.trim().replace(/^['"]|['"]$/g, '') || null;
}

/**
 * When thumbnail_path was stored with a `.webp` extension but the actual source
 * file in R2 is a `.png` or `.jpeg`, CF Image Resizing will 404 trying to fetch
 * the non-existent `.webp` source. Recover the real extension from thumbnail_url
 * (which may carry the original extension), or default to `.png`.
 */
function normalizeThumbPath(path, url) {
  if (!path || typeof path !== 'string') return path;
  if (!path.endsWith('.webp')) return path;
  if (url && typeof url === 'string') {
    const m = url.match(/\.(png|jpe?g)(?:\?|$)/i);
    if (m) return path.slice(0, -5) + '.' + m[1].toLowerCase();
  }
  return path.slice(0, -5) + '.png';
}

/**
 * Resolve CDN-optimized video card/table thumbnail URLs (CF resize when enabled).
 * @param {object} video
 * @param {'fitness'|'squash'|string} domain
 * @param {'card'|'table'} [variant='card']
 */
export function getVideoThumbSrc(video, domain, variant = 'card') {
  if (!video) return { src: null, fallbackSrc: null };

  const url = sanitizeVideoStorageValue(video.thumbnail_url || video.thumbnailUrl);
  const rawPath = sanitizeVideoStorageValue(video.thumbnail_path || video.thumbnailPath);
  const path = normalizeThumbPath(rawPath, url);
  if (url === 'pending') return { src: null, fallbackSrc: null };

  const bucket = getSharedContentMediaBuckets(domain, 'videoThumbnails').videoThumbnails;
  const full = resolveDomainMediaUrl(url, path, domain, 'videoThumbnails');
  if (!full && !path && !url) return { src: null, fallbackSrc: null };

  const size = variant === 'card' ? CARD_THUMB : TABLE_THUMB;
  const fallbackSrc = full || resolveMediaUrl(url, path, bucket);
  const src = mediaThumbUrl(url, path, bucket, {
    width: size.fetchWidth || size.width,
    quality: 75,
    format: variant === 'card' ? 'webp' : 'auto',
    thumbPath: fallbackSrc,
  });

  return { src: src || fallbackSrc, fallbackSrc };
}

export { TABLE_THUMB, CARD_THUMB };
