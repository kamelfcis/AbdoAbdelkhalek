import { resolveMediaUrl } from './cdn';

/** @typedef {'categories'|'videos'|'videoThumbnails'|'reviews'|'successStories'|'packages'|'faqs'|'coaches'|'programs'} MediaKind */

const FITNESS_MEDIA = {
  categories: 'categories',
  videos: 'videos',
  videoThumbnails: 'video-thumbnails',
  reviews: 'reviews',
  successStories: 'success-stories',
  packages: 'packages',
  faqs: 'faqs',
  coaches: 'coaches',
  programs: 'programs',
};

const SQUASH_MEDIA = {
  categories: 'squash/categories',
  videos: 'squash/videos',
  videoThumbnails: 'squash/video-thumbnails',
  reviews: 'squash/reviews',
  successStories: 'squash/success-stories',
  packages: 'squash/packages',
  faqs: 'squash/faqs',
  coaches: 'squash/coaches',
  programs: 'squash/programs',
};

/** Legacy fitness-style prefixes that may appear on squash rows migrated before squash/* keys. */
const LEGACY_FITNESS_PREFIX = {
  categories: 'categories/',
  videos: 'videos/',
  videoThumbnails: 'video-thumbnails/',
  reviews: 'reviews/',
  successStories: 'success-stories/',
};

/**
 * @param {'fitness'|'squash'|string} domain
 * @returns {typeof FITNESS_MEDIA}
 */
export function getMediaBuckets(domain = 'fitness') {
  return domain === 'squash' ? SQUASH_MEDIA : FITNESS_MEDIA;
}

/**
 * Resolve a public media URL for a domain bucket, with legacy path fallback on squash.
 * @param {string|null|undefined} url
 * @param {string|null|undefined} path
 * @param {'fitness'|'squash'|string} domain
 * @param {MediaKind} kind
 */
export function resolveDomainMediaUrl(url, path, domain, kind) {
  const buckets = getMediaBuckets(domain);
  const primary = buckets[kind];
  const candidate = (path || url || '').trim().replace(/^\/+/, '');
  if (!candidate && !url) return '';

  if (url && /^https?:\/\//.test(url)) return resolveMediaUrl(url, null, primary);
  if (path && /^https?:\/\//.test(path)) return resolveMediaUrl(path, null, primary);

  if (candidate.startsWith(primary)) {
    return resolveMediaUrl(null, candidate, primary);
  }

  if (domain === 'squash' && candidate.startsWith('squash/')) {
    return resolveMediaUrl(null, candidate, primary);
  }

  const legacyPrefix = LEGACY_FITNESS_PREFIX[kind];
  if (domain === 'squash' && legacyPrefix && candidate.startsWith(legacyPrefix)) {
    const legacyBucket = FITNESS_MEDIA[kind];
    return resolveMediaUrl(null, candidate, legacyBucket);
  }

  if (
    domain === 'squash' &&
    kind === 'successStories' &&
    (candidate.startsWith('before/') || candidate.startsWith('after/'))
  ) {
    return resolveMediaUrl(null, candidate, FITNESS_MEDIA.successStories);
  }

  return resolveMediaUrl(url, path, primary);
}

export { FITNESS_MEDIA, SQUASH_MEDIA };
