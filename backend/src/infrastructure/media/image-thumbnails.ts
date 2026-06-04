/**
 * Generate WebP thumbnails for dashboard list views on image upload.
 */

export function deriveThumbStoragePath(imagePath: string): string | null {
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

export function deriveCardThumbStoragePath(imagePath: string): string | null {
  const base = deriveThumbStoragePath(imagePath);
  if (!base) return null;
  return base.replace(/\/thumbs\/([^/]+)\.webp$/, '/thumbs/$1-480.webp');
}

const IMAGE_MIME = /^image\//;

export function isImageUpload(contentType: string): boolean {
  return IMAGE_MIME.test(contentType || '');
}

export type GeneratedThumbnails = {
  thumbnailPath: string;
  cardThumbnailPath?: string;
};

export async function generateUploadThumbnails(
  buffer: Buffer,
  objectPath: string
): Promise<{ table: Buffer; card: Buffer; thumbnailPath: string; cardThumbnailPath: string } | null> {
  const thumbnailPath = deriveThumbStoragePath(objectPath);
  if (!thumbnailPath) return null;

  const cardThumbnailPath = deriveCardThumbStoragePath(objectPath);
  if (!cardThumbnailPath) return null;

  let sharp: typeof import('sharp');
  try {
    sharp = (await import('sharp')).default;
  } catch {
    return null;
  }

  const pipeline = sharp(buffer, { failOn: 'none' }).rotate();

  const [table, card] = await Promise.all([
    pipeline
      .clone()
      .resize(128, 128, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer(),
    pipeline
      .clone()
      .resize(480, 270, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer(),
  ]);

  return { table, card, thumbnailPath, cardThumbnailPath };
}

function resolveObjectKey(bucket: string, path: string): string {
  const normalized = path.trim().replace(/^\/+/, '');
  return normalized.includes('/') ? normalized : `${bucket}/${normalized}`;
}

/** Build full R2 key for a thumb path relative to bucket. */
export function thumbKeyForUpload(bucket: string, objectPath: string, thumbPath: string): string {
  if (thumbPath.startsWith('squash/') || thumbPath.startsWith(`${bucket}/`)) {
    return thumbPath;
  }
  return resolveObjectKey(bucket, thumbPath);
}
