import { describe, it, expect, vi } from 'vitest';
import type { Response } from 'express';
import { allowSelfOrCoachSubscription, type AuthRequest } from '../../src/common/middleware/auth.js';

function mockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe('allowSelfOrCoachSubscription', () => {
  it('allows coaches to subscribe any user', () => {
    const req = {
      user: { sub: 'coach-id', isCoach: true },
      body: { userId: 'trainee-id', packageId: 'pkg-1' },
    } as unknown as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    allowSelfOrCoachSubscription(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body.userId).toBe('trainee-id');
  });

  it('forces trainee userId to self when omitted', () => {
    const req = {
      user: { sub: 'trainee-id', isCoach: false },
      body: { packageId: 'pkg-1' },
    } as unknown as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    allowSelfOrCoachSubscription(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.userId).toBe('trainee-id');
    expect(req.body.user_id).toBe('trainee-id');
  });

  it('allows trainee when userId matches self', () => {
    const req = {
      user: { sub: 'trainee-id', isCoach: false },
      body: { userId: 'trainee-id', packageId: 'pkg-1' },
    } as unknown as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    allowSelfOrCoachSubscription(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('rejects trainee subscribing another user', () => {
    const req = {
      user: { sub: 'trainee-id', isCoach: false },
      body: { userId: 'other-id', packageId: 'pkg-1' },
    } as unknown as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    allowSelfOrCoachSubscription(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'You can only subscribe your own account' });
  });
});
