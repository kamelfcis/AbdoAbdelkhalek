import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/domains/shared/auth/user.repository.js', () => ({
  findUserById: vi.fn(),
  updatePassword: vi.fn(),
  invalidatePasswordResetTokens: vi.fn(),
}));

import {
  findUserById,
  invalidatePasswordResetTokens,
  updatePassword,
} from '../../src/domains/shared/auth/user.repository.js';
import { resetTraineePassword } from '../../src/domains/shared/auth/reset-trainee-password.js';
import { signAccessToken } from '../../src/domains/shared/auth/jwt.js';
import { requireAuth, requireCoach } from '../../src/common/middleware/auth.js';
import { validateBody } from '../../src/common/middleware/validate.js';
import { adminResetTraineePasswordSchema } from '../../src/common/validation/auth-schemas.js';
import { errorHandler } from '../../src/common/errors/handler.js';

const coachUser = {
  id: 'coach-1',
  email: 'coach@example.com',
  password: null,
  fullName: 'Coach',
  phone: null,
  isCoach: true,
};

const traineeUser = {
  id: 'trainee-1',
  email: 'trainee@example.com',
  password: '$2b$12$existing',
  fullName: 'Trainee',
  phone: null,
  isCoach: false,
};

const otherCoach = {
  id: 'coach-target',
  email: 'other-coach@example.com',
  password: null,
  fullName: 'Other Coach',
  phone: null,
  isCoach: true,
};

function mockUsers() {
  vi.mocked(findUserById).mockImplementation(async (id: string) => {
    if (id === coachUser.id) return coachUser;
    if (id === traineeUser.id) return traineeUser;
    if (id === otherCoach.id) return otherCoach;
    return null;
  });
  vi.mocked(updatePassword).mockResolvedValue(undefined);
  vi.mocked(invalidatePasswordResetTokens).mockResolvedValue(undefined);
}

function coachToken() {
  return signAccessToken({
    sub: coachUser.id,
    email: coachUser.email,
    isCoach: true,
  });
}

function createResetApp() {
  const app = express();
  app.use(express.json());
  app.post(
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
  app.use(errorHandler);
  return app;
}

describe('resetTraineePassword helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsers();
  });

  it('hashes and saves a trainee password', async () => {
    await resetTraineePassword(traineeUser.id, 'secret1');

    expect(updatePassword).toHaveBeenCalledWith(
      traineeUser.id,
      expect.stringMatching(/^\$2[aby]\$12\$/)
    );
    expect(invalidatePasswordResetTokens).toHaveBeenCalledWith(traineeUser.id);
    expect(vi.mocked(updatePassword).mock.calls[0][1]).not.toBe('secret1');
  });

  it('returns 403 when the target is a coach', async () => {
    await expect(resetTraineePassword(otherCoach.id, 'secret1')).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it('returns 404 when the user is missing', async () => {
    await expect(resetTraineePassword('missing-id', 'secret1')).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(updatePassword).not.toHaveBeenCalled();
  });
});

describe('POST /trainees/:id/password', () => {
  const agent = request(createResetApp());

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsers();
  });

  it('allows a coach to reset a trainee password', async () => {
    const res = await agent
      .post(`/trainees/${traineeUser.id}/password`)
      .set('Authorization', `Bearer ${coachToken()}`)
      .send({ password: 'secret1' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(JSON.stringify(res.body)).not.toContain('secret1');
    expect(updatePassword).toHaveBeenCalledWith(
      traineeUser.id,
      expect.stringMatching(/^\$2[aby]\$12\$/)
    );
  });

  it('returns 403 when the target is a coach', async () => {
    const res = await agent
      .post(`/trainees/${otherCoach.id}/password`)
      .set('Authorization', `Bearer ${coachToken()}`)
      .send({ password: 'secret1' });

    expect(res.status).toBe(403);
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it('returns 401 without auth', async () => {
    const res = await agent
      .post(`/trainees/${traineeUser.id}/password`)
      .send({ password: 'secret1' });

    expect(res.status).toBe(401);
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown trainee', async () => {
    const res = await agent
      .post(`/trainees/missing-id/password`)
      .set('Authorization', `Bearer ${coachToken()}`)
      .send({ password: 'secret1' });

    expect(res.status).toBe(404);
    expect(updatePassword).not.toHaveBeenCalled();
  });
});
