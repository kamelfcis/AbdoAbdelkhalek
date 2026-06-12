import { mediaThumbUrl, resolveMediaUrl } from './cdn';
import { resolveDomainMediaUrl, getMediaBuckets } from './mediaBuckets';

const TABLE_THUMB = { width: 40, height: 40, fetchWidth: 80 };
const CARD_THUMB = { width: 480, height: 270, fetchWidth: 480 };

function sanitizeVideoStorageValue(value) {
  if (typeof value !== 'string') return null;
  return value.trim().replace(/^['"]|['"]$/g, '') || null;
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
  const path = sanitizeVideoStorageValue(video.thumbnail_path || video.thumbnailPath);
  if (url === 'pending') return { src: null, fallbackSrc: null };

  const bucket = getMediaBuckets(domain).videoThumbnails;
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
