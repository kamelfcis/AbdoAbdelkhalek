import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Response } from 'express';
import { logger } from '../../src/infrastructure/logging/logger.js';
import { isPoolerError } from '../../src/infrastructure/prisma/db-errors.js';

describe('isPoolerError', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('treats PrismaClientInitializationError as pooler error', () => {
    const spy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const err = new Error('connection failed');
    err.name = 'PrismaClientInitializationError';
    expect(isPoolerError(err)).toBe(true);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'prisma_rest_fallback' })
    );
  });

  it('does not log when the error is not a pooler failure', () => {
    const spy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    expect(isPoolerError(new Error('Unique constraint failed'))).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });
});
