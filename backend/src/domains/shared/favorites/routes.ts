import { Router } from 'express';
import type { AuthRequest } from '../../../common/middleware/auth.js';
import { requireAuth } from '../../../common/middleware/auth.js';
import { validateBody } from '../../../common/middleware/validate.js';
import {
  favoriteDomainSchema,
  favoriteSyncSchema,
  favoriteToggleSchema,
} from '../../../common/validation/favorites-schemas.js';
import * as favorites from './favorites.service.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const parsed = favoriteDomainSchema.safeParse(req.query.domain ?? 'fitness');
    const domain = parsed.success ? parsed.data : 'fitness';
    res.json(await favorites.listFavorites(req.user!.sub, domain));
  } catch (e) {
    next(e);
  }
});

router.post(
  '/toggle',
  requireAuth,
  validateBody(favoriteToggleSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { domain, videoId } = req.body as { domain: 'fitness' | 'squash'; videoId: string };
      res.json(await favorites.toggleFavorite(req.user!.sub, domain, videoId));
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/sync',
  requireAuth,
  validateBody(favoriteSyncSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { domain, videoIds } = req.body as {
        domain: 'fitness' | 'squash';
        videoIds: string[];
      };
      res.json(await favorites.syncFavorites(req.user!.sub, domain, videoIds));
    } catch (e) {
      next(e);
    }
  }
);

export default router;
