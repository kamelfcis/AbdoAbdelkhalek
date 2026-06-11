import {
  mediaThumbUrl,
  resolveMediaUrl,
  deriveThumbStoragePath,
  deriveCardThumbStoragePath,
} from '../../../shared/lib/cdn';
import { resolveDomainMediaUrl, getMediaBuckets } from '../../../shared/lib/mediaBuckets';

const TABLE_THUMB = { width: 40, height: 40, fetchWidth: 80 };
const CARD_THUMB = { width: 480, height: 270, fetchWidth: 480 };

function resolveMediaKind(col) {
  if (col?.mediaKind) return col.mediaKind;
  const bucket = col?.bucket || '';
  if (bucket.includes('categories')) return 'categories';
  if (bucket.includes('reviews')) return 'reviews';
  if (bucket.includes('success-stories')) return 'successStories';
  if (bucket.includes('coaches')) return 'coaches';
  if (bucket.includes('programs')) return 'programs';
  return 'categories';
}

export function resolveEntityImagePaths(row, col, domain = 'fitness') {
  const url = row.image_url || row.imageUrl;
  const path = row.image_path || row.imagePath;
  const thumbPath = row.thumbnail_path || row.thumbnailPath;
  const bucket = col?.bucket || 'categories';
  const kind = resolveMediaKind(col);

  const full = resolveDomainMediaUrl(url, path, domain, kind);
  return { url, path, thumbPath, bucket, full };
}

export function getEntityThumbSrc(row, col, domain, variant = 'table') {
  const { url, path, thumbPath, bucket, full } = resolveEntityImagePaths(row, col, domain);
  if (!full && !path && !url) return { src: null, fallbackSrc: null };

  const size = variant === 'card' ? CARD_THUMB : TABLE_THUMB;
  const storagePath = path || url || '';
  const derivedThumb =
    variant === 'card'
      ? deriveCardThumbStoragePath(storagePath)
      : deriveThumbStoragePath(storagePath);
  const effectiveThumbPath = thumbPath || derivedThumb;
  const src = mediaThumbUrl(url, path, bucket, {
    width: size.fetchWidth || size.width,
    quality: 75,
    thumbPath: effectiveThumbPath,
  });
  const fallbackSrc = full || resolveMediaUrl(url, path, bucket);

  return { src: src || fallbackSrc, fallbackSrc };
}

export function getSuccessStoryThumbSrc(row, side, domain, variant = 'table') {
  const prefix = side === 'after' ? 'after' : 'before';
  const url = row[`${prefix}_image_url`];
  const path = row[`${prefix}_image_path`];
  const buckets = getMediaBuckets(domain);
  const bucket = buckets.successStories;
  const full = resolveDomainMediaUrl(url, path, domain, 'successStories');
  if (!full && !path && !url) return { src: null, fallbackSrc: null };

  const size = variant === 'card' ? CARD_THUMB : TABLE_THUMB;
  const storagePath = path || url || '';
  const derivedThumb =
    variant === 'card'
      ? deriveCardThumbStoragePath(storagePath)
      : deriveThumbStoragePath(storagePath);
  const src = mediaThumbUrl(url, path, bucket, {
    width: size.fetchWidth || size.width,
    quality: 75,
    thumbPath: derivedThumb,
  });
  const fallbackSrc = full || resolveMediaUrl(url, path, bucket);
  return { src: src || fallbackSrc, fallbackSrc };
}

function sanitizeVideoStorageValue(value) {
  if (typeof value !== 'string') return null;
  return value.trim().replace(/^['"]|['"]$/g, '') || null;
}

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
  // thumbnail_path is the thumb file itself — CDN resize the resolved URL, not thumbs/ convention.
  const src = mediaThumbUrl(full || url, null, bucket, {
    width: size.fetchWidth || size.width,
    quality: 75,
  });

  return { src: src || fallbackSrc, fallbackSrc };
}

export { TABLE_THUMB, CARD_THUMB };
