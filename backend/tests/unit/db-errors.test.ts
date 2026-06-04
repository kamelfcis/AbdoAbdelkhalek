import { describe, expect, it } from 'vitest';
import { isPoolerError } from '../../src/infrastructure/prisma/db-errors.js';

describe('isPoolerError', () => {
  it('treats PrismaClientInitializationError as pooler error', () => {
    const err = new Error('connection failed');
    err.name = 'PrismaClientInitializationError';
    expect(isPoolerError(err)).toBe(true);
  });
});
