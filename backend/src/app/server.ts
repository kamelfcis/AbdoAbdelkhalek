import express, { type RequestHandler } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { env } from '../config/env.js';
import authRoutes from '../domains/shared/auth/routes.js';
import fitnessRoutes from '../domains/fitness/routes.js';
import mediaRoutes from '../domains/shared/media/routes.js';
import squashRoutes from '../domains/squash/routes.js';
import { errorHandler } from '../common/errors/handler.js';
import {
  requestIdMiddleware,
  requestLoggerMiddleware,
} from '../infrastructure/logging/request-logger.js';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(compression() as unknown as RequestHandler);
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser() as unknown as RequestHandler);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'abdelrhmanabdelkhalek-api' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api', fitnessRoutes);
  app.use('/api/uploads', mediaRoutes);
  app.use('/api/squash', squashRoutes);

  app.use(errorHandler);

  return app;
}
