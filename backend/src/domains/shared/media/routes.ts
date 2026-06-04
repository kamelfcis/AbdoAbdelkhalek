import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { getPresignedUploadUrl, uploadObject } from '../../../infrastructure/r2/client.js';
import {
  generateUploadThumbnails,
  isImageUpload,
  thumbKeyForUpload,
} from '../../../infrastructure/media/image-thumbnails.js';
import { requireAuth, requireCoach } from '../../../common/middleware/auth.js';
import type { AuthRequest } from '../../../common/middleware/auth.js';
import { validateBody } from '../../../common/middleware/validate.js';
import { assertAllowedUploadPath } from './allowlist.js';
import { ValidationError } from '../../../common/errors/AppError.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

const presignSchema = z.object({
  bucket: z.string().min(1),
  path: z.string().min(1),
  contentType: z.string().min(1),
});

const proxyFieldsSchema = z.object({
  bucket: z.string().min(1),
  path: z.string().min(1),
});

function resolveKey(bucket: string, path: string): string {
  return path.includes('/') ? path : `${bucket}/${path}`;
}

router.post(
  '/presign',
  requireAuth,
  requireCoach,
  validateBody(presignSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { bucket, path, contentType } = req.body;
      try {
        assertAllowedUploadPath(bucket, path);
      } catch (e) {
        throw new ValidationError(e instanceof Error ? e.message : 'Invalid upload path');
      }
      const key = resolveKey(bucket, path);
      const result = await getPresignedUploadUrl(key, contentType);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/proxy',
  requireAuth,
  requireCoach,
  upload.single('file') as unknown as RequestHandler,
  async (req: AuthRequest, res, next) => {
    try {
      const { bucket, path } = proxyFieldsSchema.parse(req.body);
      try {
        assertAllowedUploadPath(bucket, path);
      } catch (e) {
        throw new ValidationError(e instanceof Error ? e.message : 'Invalid upload path');
      }
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'Missing file' });
        return;
      }

      const key = resolveKey(bucket, path);
      const contentType = file.mimetype || 'application/octet-stream';
      const { publicUrl, key: storedKey } = await uploadObject(key, file.buffer, contentType);

      const objectPath = storedKey.replace(`${bucket}/`, '');

      let thumbnailPath: string | undefined;
      let cardThumbnailPath: string | undefined;

      if (isImageUpload(contentType)) {
        const thumbs = await generateUploadThumbnails(file.buffer, storedKey);
        if (thumbs) {
          const tableKey = thumbKeyForUpload(bucket, objectPath, thumbs.thumbnailPath);
          const cardKey = thumbKeyForUpload(bucket, objectPath, thumbs.cardThumbnailPath);
          await Promise.all([
            uploadObject(tableKey, thumbs.table, 'image/webp'),
            uploadObject(cardKey, thumbs.card, 'image/webp'),
          ]);
          thumbnailPath = thumbs.thumbnailPath;
          cardThumbnailPath = thumbs.cardThumbnailPath;
        }
      }

      res.json({
        publicUrl,
        key: storedKey,
        path: objectPath,
        ...(thumbnailPath ? { thumbnailPath, cardThumbnailPath } : {}),
      });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
