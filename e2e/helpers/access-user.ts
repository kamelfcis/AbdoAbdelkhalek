import type { APIRequestContext } from '@playwright/test';

const apiBase = () => process.env.PLAYWRIGHT_API_URL || 'http://localhost:4000';

/** Prefer a trainee for video access grants; fall back to coach when list is empty. */
export async function getAccessTargetUserId(
  request: APIRequestContext,
  token: string
): Promise<string> {
  const meRes = await request.get(`${apiBase()}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const me = await meRes.json();
  const coachId = (me.user?.id ?? me.id) as string;

  const traineesRes = await request.get(`${apiBase()}/api/trainees`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (traineesRes.ok()) {
    const trainees = await traineesRes.json();
    const list = Array.isArray(trainees) ? trainees : trainees.data;
    const traineeId = list?.[0]?.id as string | undefined;
    if (traineeId) return traineeId;
  }

  return coachId;
}
