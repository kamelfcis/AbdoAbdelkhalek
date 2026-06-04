/** Allowed R2 bucket prefixes for fitness media uploads. */
const FITNESS_BUCKETS = new Set([
  'categories',
  'videos',
  'video-thumbnails',
  'packages',
  'reviews',
  'success-stories',
  'faqs',
  'profile',
]);

/** Squash media keys: squash/{entity}/... */
const SQUASH_ENTITY_PREFIXES = [
  'squash/categories/',
  'squash/videos/',
  'squash/video-thumbnails/',
  'squash/packages/',
  'squash/reviews/',
  'squash/success-stories/',
  'squash/faqs/',
  'squash/coaches/',
  'squash/programs/',
];

function resolveObjectKey(bucket: string, path: string): string {
  const normalized = path.trim().replace(/^\/+/, '');
  return normalized.includes('/') ? normalized : `${bucket}/${normalized}`;
}

export function isAllowedUploadPath(bucket: string, path: string): boolean {
  const normalized = path.trim().replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) return false;

  const key = resolveObjectKey(bucket, path);
  if (SQUASH_ENTITY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
    return true;
  }

  if (!FITNESS_BUCKETS.has(bucket)) return false;
  return true;
}

export function assertAllowedUploadPath(bucket: string, path: string): void {
  if (!isAllowedUploadPath(bucket, path)) {
    throw new Error(`Upload path not allowed: bucket=${bucket} path=${path}`);
  }
}
