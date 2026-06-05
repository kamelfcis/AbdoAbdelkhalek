import crypto from 'crypto';
import { describe, it, expect } from 'vitest';
import { createTestAgent } from '../helpers/integration.js';
import { hashResetToken } from '../../src/domains/shared/auth/user.repository.js';

describe('hashResetToken', () => {
  it('returns a stable SHA-256 hex digest', () => {
    const raw = 'abc123token';
    expect(hashResetToken(raw)).toBe(hashResetToken(raw));
    expect(hashResetToken(raw)).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces different hashes for different tokens', () => {
    expect(hashResetToken('token-a')).not.toBe(hashResetToken('token-b'));
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('returns 200 with generic message for any email', async () => {
    const res = await createTestAgent()
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('If an account exists');
  });

  it('returns 400 for invalid email', async () => {
    const res = await createTestAgent()
      .post('/api/auth/forgot-password')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/reset-password', () => {
  it('returns 400 for invalid token', async () => {
    const res = await createTestAgent()
      .post('/api/auth/reset-password')
      .send({ token: crypto.randomBytes(32).toString('hex'), password: 'newpass12' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid|expired/i);
  });

  it('returns 400 when password is too short', async () => {
    const res = await createTestAgent()
      .post('/api/auth/reset-password')
      .send({ token: crypto.randomBytes(32).toString('hex'), password: '123' });

    expect(res.status).toBe(400);
  });
});
