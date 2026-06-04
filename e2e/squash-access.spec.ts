import { test, expect } from '@playwright/test';
import { getCoachToken } from './helpers/api-auth';
import { getAccessTargetUserId } from './helpers/access-user';

const apiBase = process.env.PLAYWRIGHT_API_URL || 'http://localhost:4000';

test.describe('Squash Access API', () => {
  test('coach can grant and revoke squash video access via API', async ({ request }) => {
    const token = await getCoachToken(request);
    const targetUserId = await getAccessTargetUserId(request, token);

    const videosRes = await request.get(`${apiBase}/api/squash/videos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(videosRes.ok()).toBeTruthy();
    const videos = await videosRes.json();
    const list = Array.isArray(videos) ? videos : videos.data;
    const videoId = list?.[0]?.id;
    test.skip(!videoId, 'No squash videos seeded');

    const grant = await request.put(`${apiBase}/api/squash/videos/${videoId}/access`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userIds: [targetUserId] },
    });
    expect(grant.status()).toBe(200);

    const revoke = await request.put(`${apiBase}/api/squash/videos/${videoId}/access`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userIds: [] },
    });
    expect(revoke.status()).toBe(200);
  });
});
