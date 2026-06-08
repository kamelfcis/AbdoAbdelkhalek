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
  coachCreateSchema,
  coachUpdateSchema,
  programCreateSchema,
  programUpdateSchema,
} from '../../common/validation/squash-schemas.js';
import {
  videoAccessSchema,
  traineeAccessSchema,
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
} from '../../common/validation/fitness-schemas.js';
import * as squash from './squash.service.js';
import * as fitness from '../fitness/fitness.service.js';
import { parseListFilters, parsePagination } from '../../common/utils/pagination.js';

const router = Router();
router.use(cdnUrlResponseMiddleware);

router.get('/health', (_req, res) => {
  res.json({ ok: true, domain: 'squash' });
});

router.get('/categories', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await squash.listCategories(req.user, parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/videos', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await squash.listVideos(req.user, parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/packages', async (req, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await squash.listPackages(parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/reviews', async (req, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await squash.listReviews(parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/success-stories', async (req, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await squash.listSuccessStories(parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/faqs', async (req, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await squash.listFaqs(parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/coaches', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await squash.listCoaches(req.user, parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/programs', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await squash.listPrograms(req.user, parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.get('/stats', requireAuth, requireCoach, async (_req, res, next) => {
  try {
    res.json(await squash.getDashboardStats());
  } catch (e) {
    next(e);
  }
});

router.get('/subscriptions', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(
      await squash.listSubscriptions(req.user!, parsePagination(q), parseListFilters(q))
    );
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

router.get('/trainees', requireAuth, requireCoach, async (req, res, next) => {
  try {
    const q = req.query as Record<string, unknown>;
    res.json(await squash.listTrainees(parsePagination(q), parseListFilters(q)));
  } catch (e) {
    next(e);
  }
});

router.post(
  '/categories',
  requireAuth,
  requireCoach,
  validateBody(categoryCreateSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await squash.createCategory(req.body));
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
      res.json(await squash.updateCategory(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/categories/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await squash.deleteCategory(req.params.id));
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
      res.status(201).json(await squash.createVideo(req.body));
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
      res.json(await squash.updateVideo(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/videos/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await squash.deleteVideo(req.params.id));
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
      res.status(201).json(await squash.createPackage(req.body));
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
      res.json(await squash.updatePackage(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/packages/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await squash.deletePackage(req.params.id));
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
      res.status(201).json(await squash.createReview(req.body));
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
      res.json(await squash.updateReview(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/reviews/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await squash.deleteReview(req.params.id));
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
      res.status(201).json(await squash.createSuccessStory(req.body));
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
      res.json(await squash.updateSuccessStory(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/success-stories/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await squash.deleteSuccessStory(req.params.id));
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
      res.status(201).json(await squash.createFaq(req.body));
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
      res.json(await squash.updateFaq(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/faqs/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await squash.deleteFaq(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.post(
  '/coaches',
  requireAuth,
  requireCoach,
  validateBody(coachCreateSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await squash.createCoach(req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/coaches/:id',
  requireAuth,
  requireCoach,
  validateBody(coachUpdateSchema),
  async (req, res, next) => {
    try {
      res.json(await squash.updateCoach(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/coaches/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await squash.deleteCoach(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.post(
  '/programs',
  requireAuth,
  requireCoach,
  validateBody(programCreateSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await squash.createProgram(req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/programs/:id',
  requireAuth,
  requireCoach,
  validateBody(programUpdateSchema),
  async (req, res, next) => {
    try {
      res.json(await squash.updateProgram(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/programs/:id', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await squash.deleteProgram(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.get('/videos/:videoId/access', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await squash.getVideoAccessUserIds(req.params.videoId));
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
      res.json(await squash.setVideoAccessUserIds(req.params.videoId, req.body.userIds));
    } catch (e) {
      next(e);
    }
  }
);

router.get('/access/trainee/:userId', requireAuth, requireCoach, async (req, res, next) => {
  try {
    res.json(await squash.getTraineeAccess(req.params.userId));
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
        await squash.setTraineeAccess(
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

export default router;
