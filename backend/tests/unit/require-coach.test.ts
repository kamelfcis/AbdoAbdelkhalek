import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Response } from 'express';

vi.mock('../../src/domains/shared/auth/user.repository.js', () => ({
  findUserById: vi.fn(),
}));

import { findUserById } from '../../src/domains/shared/auth/user.repository.js';
import { requireCoach, type AuthRequest } from '../../src/common/middleware/auth.js';

function mockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe('requireCoach', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects when JWT says coach but the database flag is false', async () => {
    vi.mocked(findUserById).mockResolvedValue({
      id: 'user-1',
      email: 'ex@example.com',
      password: null,
      fullName: 'Ex',
      phone: null,
      isCoach: false,
    });
    const req = {
      user: { sub: 'user-1', email: 'ex@example.com', isCoach: true },
    } as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    await requireCoach(req, res, next);

    expect(findUserById).toHaveBeenCalledWith('user-1');
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows when JWT is stale but the database says coach', async () => {
    vi.mocked(findUserById).mockResolvedValue({
      id: 'coach-1',
      email: 'coach@example.com',
      password: null,
      fullName: 'Coach',
      phone: null,
      isCoach: true,
    });
    const req = {
      user: { sub: 'coach-1', email: 'coach@example.com', isCoach: false },
    } as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    await requireCoach(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user?.isCoach).toBe(true);
    expect(res.status).not.toHaveBeenCalled();
  });
});
