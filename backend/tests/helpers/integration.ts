import request, { type Agent } from 'supertest';
import { createApp } from '../../src/app/server.js';

export const COACH_EMAIL = 'admin@gmail.com';
export const COACH_PASSWORD = '12345678';

/** Run live DB integration tests when explicitly enabled and credentials exist. */
export function shouldRunIntegration(): boolean {
  if (process.env.RUN_INTEGRATION_TESTS !== 'true') return false;
  return Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.DATABASE_URL ||
      process.env.DATABASE_POOLER_URL
  );
}

export function createTestAgent(): Agent {
  return request(createApp());
}

export async function loginCoach(agent: Agent): Promise<{
  accessToken: string;
  userId: string;
  refreshCookie?: string;
}> {
  const res = await agent
    .post('/api/auth/login')
    .send({ email: COACH_EMAIL, password: COACH_PASSWORD });

  if (res.status !== 200) {
    throw new Error(`Coach login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  const setCookie = res.headers['set-cookie'];
  const refreshCookie = Array.isArray(setCookie)
    ? setCookie.find((c) => c.startsWith('refreshToken='))
    : undefined;

  return {
    accessToken: res.body.accessToken as string,
    userId: res.body.user.id as string,
    refreshCookie,
  };
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export function firstId(list: unknown): string | undefined {
  if (!Array.isArray(list) || list.length === 0) return undefined;
  const row = list[0] as { id?: string };
  return row?.id;
}
