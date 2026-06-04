import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { AppError } from './AppError.js';
import { logger } from '../../infrastructure/logging/logger.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = (req as Request & { requestId?: string }).requestId;

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.flatten().fieldErrors,
      requestId,
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn({ requestId, status: err.statusCode, message: err.message });
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
      requestId,
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    res.status(status).json({ error: err.message, requestId });
    return;
  }

  logger.error({ requestId, err });
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ error: message, requestId });
}
