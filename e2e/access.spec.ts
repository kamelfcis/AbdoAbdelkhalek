import { test, expect } from '@playwright/test';
import { getCoachToken } from './helpers/api-auth';
import { getAccessTargetUserId } from './helpers/access-user';

const apiBase = process.env.PLAYWRIGHT_API_URL || 'http://localhost:4000';

test.describe('Grant / Revoke Access', () => {
  test('coach can grant and revoke fitness video access via API', async ({ request }) => {
    const token = await getCoachToken(request);
    const targetUserId = await getAccessTargetUserId(request, token);

    const videosRes = await request.get(`${apiBase}/api/videos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(videosRes.ok()).toBeTruthy();
    const videos = await videosRes.json();
    const videoList = Array.isArray(videos) ? videos : videos.data;
    const videoId = videoList?.[0]?.id;
    test.skip(!videoId, 'No fitness videos seeded');

    const grant = await request.put(`${apiBase}/api/videos/${videoId}/access`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userIds: [targetUserId] },
    });
    expect(grant.status()).toBe(200);

    const verify = await request.get(`${apiBase}/api/videos/${videoId}/access`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const ids = await verify.json();
    expect(Array.isArray(ids) ? ids : ids.userIds).toContain(targetUserId);

    const revoke = await request.put(`${apiBase}/api/videos/${videoId}/access`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userIds: [] },
    });
    expect(revoke.status()).toBe(200);

    await expect
      .poll(async () => {
        const after = await request.get(`${apiBase}/api/videos/${videoId}/access`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const afterIds = await after.json();
        const list = Array.isArray(afterIds) ? afterIds : afterIds.userIds || [];
        return list.includes(targetUserId);
      })
      .toBe(false);
  });
});
