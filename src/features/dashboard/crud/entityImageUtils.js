import {
  mediaThumbUrl,
  resolveMediaUrl,
  deriveThumbStoragePath,
  deriveCardThumbStoragePath,
} from '../../../shared/lib/cdn';
import { resolveDomainMediaUrl, getMediaBuckets } from '../../../shared/lib/mediaBuckets';
import { getVideoThumbSrc, TABLE_THUMB, CARD_THUMB } from '../../../shared/lib/videoThumb';

export { getVideoThumbSrc, TABLE_THUMB, CARD_THUMB };

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

