import { describe, it, expect, beforeAll } from 'vitest';
import {
  createTestAgent,
  loginCoach,
  shouldRunIntegration,
  authHeader,
} from '../helpers/integration.js';

const run = shouldRunIntegration();
const describeIntegration = run ? describe : describe.skip;

describeIntegration('Auth integration', () => {
  if (!run) {
    it.skip('skipped — set RUN_INTEGRATION_TESTS=true and DB credentials', () => {});
    return;
  }

  const agent = createTestAgent();
  let accessToken = '';
  let refreshCookie = '';

  beforeAll(async () => {
    const login = await loginCoach(agent);
    accessToken = login.accessToken;
    refreshCookie = login.refreshCookie || '';
  });

  it('POST /api/auth/login rejects invalid credentials', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/auth/me returns coach profile', async () => {
    const res = await agent.get('/api/auth/me').set(authHeader(accessToken));
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('admin@gmail.com');
    expect(res.body.user.isCoach).toBe(true);
  });

  it('POST /api/auth/refresh returns new access token', async () => {
    const res = await agent
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    accessToken = res.body.accessToken;
  });

  it('POST /api/auth/logout clears session cookie', async () => {
    const res = await agent.post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
