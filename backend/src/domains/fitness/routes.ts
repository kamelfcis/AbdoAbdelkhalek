import { Router } from 'express';
import type { AuthRequest } from '../../common/middleware/auth.js';
import {
  optionalAuth,
  requireAuth,
  requireCoach,
  allowSelfOrCoachSubscription,
} from '../../common/middleware/auth.js';
import { cdnUrlResponseMiddleware } from '../../common/middleware/cdn-urls.js';
import { validateBody } from '../../common/middleware/validate.js';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  videoCreateSchema,
  videoUpdateSchema,
  packageCreateSchema,
  packageUpdateSchema,
  reviewCreateSchema,
  reviewUpdateSchema,
  successStoryCreateSchema,
  successStoryUpdateSchema,
  faqCreateSchema,
  faqUpdateSchema,
  faqBulkDeleteSchema,
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
  videoAccessSchema,
  traineeAccessSchema,
} from '../../common/validation/fitness-schemas.js';
import { adminResetTraineePasswordSchema } from '../../common/validation/auth-schemas.js';
import { resetTraineePassword } from '../shared/auth/reset-trainee-password.js';
import * as fitness from './fitness.service.js';
import * as landingSettings from '../shared/landing-settings/landing-settings.service.js';
import { parseListFilters, parsePagination } from '../../common/utils/pagination.js';

const router = Router();
router.use(cdnUrlResponseMiddleware);

router.get('/categories', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await fitness.listCategories(req.user, parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/videos', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await fitness.listVideos(req.user, parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/videos/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const result = await fitness.getVideo(req.params.id, req.user);
    if (result.kind === 'not_found') {
      res.status(404).json({ error: 'Video not found' });
      return;
    }
    if (result.kind === 'requires_auth') {
      res.status(401).json({ requiresAuth: true });
      return;
    }
    if (result.kind === 'forbidden') {
      res.status(403).json(result.body);
      return;
    }
    res.json(result.body);
  } catch (e) {
    next(e);
  }
});

router.get('/packages', async (req, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await fitness.listPackages(parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/reviews', async (req, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await fitness.listReviews(parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/success-stories', async (req, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await fitness.listSuccessStories(parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/faqs', async (req, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await fitness.listFaqs(parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.patch(
  '/subscriptions/:id',
  requireAuth,
  requireCoach,
  validateBody(subscriptionUpdateSchema),
  async (req, res, next) => {
    try {
      res.json(await fitness.updateSubscription(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/subscriptions/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await fitness.deleteSubscription(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.post(
  '/subscriptions',
  requireAuth,
  validateBody(subscriptionCreateSchema),
  allowSelfOrCoachSubscription,
  async (req, res, next) => {
    try {
      res.status(201).json(await fitness.createSubscription(req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.get('/subscriptions', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(
      await fitness.listSubscriptions(req.user!, parsePagination(q), parseListFilters(q))
    );
  } catch (e) {
    next(e);
  }
});

router.get('/trainees', requireAuth, requireCoach, async (req, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await fitness.listTrainees(parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.delete('/trainees/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    await fitness.deleteTrainee(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.post(
  '/trainees/:id/password',
  requireAuth,
  requireCoach,
  validateBody(adminResetTraineePasswordSchema),
  async (req, res, next) => {
    try {
      await resetTraineePassword(req.params.id, req.body.password);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/categories',
  requireAuth,
  requireCoach,
  validateBody(categoryCreateSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await fitness.createCategory(req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/categories/:id',
  requireAuth,
  requireCoach,
  validateBody(categoryUpdateSchema),
  async (req, res, next) => {
    try {
      res.json(await fitness.updateCategory(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/categories/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await fitness.deleteCategory(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.post(
  '/videos',
  requireAuth,
  requireCoach,
  validateBody(videoCreateSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await fitness.createVideo(req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/videos/:id',
  requireAuth,
  requireCoach,
  validateBody(videoUpdateSchema),
  async (req, res, next) => {
    try {
      res.json(await fitness.updateVideo(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/videos/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await fitness.deleteVideo(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.post(
  '/packages',
  requireAuth,
  requireCoach,
  validateBody(packageCreateSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await fitness.createPackage(req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/packages/:id',
  requireAuth,
  requireCoach,
  validateBody(packageUpdateSchema),
  async (req, res, next) => {
    try {
      res.json(await fitness.updatePackage(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/packages/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await fitness.deletePackage(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.post(
  '/reviews',
  requireAuth,
  requireCoach,
  validateBody(reviewCreateSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await fitness.createReview(req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/reviews/:id',
  requireAuth,
  requireCoach,
  validateBody(reviewUpdateSchema),
  async (req, res, next) => {
    try {
      res.json(await fitness.updateReview(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/reviews/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await fitness.deleteReview(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.post(
  '/success-stories',
  requireAuth,
  requireCoach,
  validateBody(successStoryCreateSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await fitness.createSuccessStory(req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/success-stories/:id',
  requireAuth,
  requireCoach,
  validateBody(successStoryUpdateSchema),
  async (req, res, next) => {
    try {
      res.json(await fitness.updateSuccessStory(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/success-stories/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await fitness.deleteSuccessStory(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.post(
  '/faqs',
  requireAuth,
  requireCoach,
  validateBody(faqCreateSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await fitness.createFaq(req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/faqs/:id',
  requireAuth,
  requireCoach,
  validateBody(faqUpdateSchema),
  async (req, res, next) => {
    try {
      res.json(await fitness.updateFaq(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  '/faqs/bulk',
  requireAuth,
  requireCoach,
  validateBody(faqBulkDeleteSchema),
  async (req, res, next) => {
    try {
      res.json(await fitness.deleteFaqsBulk(req.body.ids));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/faqs/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await fitness.deleteFaq(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.get('/videos/:videoId/access', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await fitness.getVideoAccessUserIds(req.params.videoId));
  } catch (e) {
    next(e);
  }
});

router.put(
  '/videos/:videoId/access',
  requireAuth,
  requireCoach,
  validateBody(videoAccessSchema),
  async (req, res, next) => {
    try {
      res.json(await fitness.setVideoAccessUserIds(req.params.videoId, req.body.userIds));
    } catch (e) {
      next(e);
    }
  }
);

router.get('/access/trainee/:userId', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await fitness.getTraineeAccess(req.params.userId));
  } catch (e) {
    next(e);
  }
});

router.put(
  '/access/trainee/:userId',
  requireAuth,
  requireCoach,
  validateBody(traineeAccessSchema),
  async (req, res, next) => {
    try {
      res.json(
        await fitness.setTraineeAccess(
          req.params.userId,
          req.body.categoryIds,
          req.body.videoIds
        )
      );
    } catch (e) {
      next(e);
    }
  }
);

router.get('/profile', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    res.json(await fitness.getProfile(req.user!.sub));
  } catch (e) {
    next(e);
  }
});

router.get('/stats', requireAuth, requireCoach, async (_req, res, next) => {
  try {
    res.json(await fitness.getDashboardStats());
  } catch (e) {
    next(e);
  }
});

router.get('/landing-sections', async (_req, res, next) => {
  try {
    res.json(await landingSettings.getLandingSections('fitness'));
  } catch (e) {
    next(e);
  }
});

router.put('/landing-sections/:key', requireAuth, requireCoach, async (req, res, next) => {
  try {
    const visible = req.body?.visible;
    if (typeof visible !== 'boolean') {
      res.status(400).json({ error: 'visible must be a boolean' });
      return;
    }
    res.json(await landingSettings.updateLandingSection('fitness', req.params.key, visible));
  } catch (e) {
    next(e);
  }
});

export default router;
