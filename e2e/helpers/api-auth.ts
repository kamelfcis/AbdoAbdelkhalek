import type { APIRequestContext } from '@playwright/test';
import { COACH_EMAIL, COACH_PASSWORD } from './auth';

const apiBase = process.env.PLAYWRIGHT_API_URL || 'http://localhost:4000';

export async function getCoachToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${apiBase}/api/auth/login`, {
    data: { email: COACH_EMAIL, password: COACH_PASSWORD },
  });
  if (!res.ok()) {
    throw new Error(`Coach API login failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  const token = body.accessToken as string | undefined;
  if (!token) throw new Error('Coach API login: missing accessToken');
  return token;
}
