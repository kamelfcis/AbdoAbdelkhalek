import { test, expect } from '@playwright/test';
import { getCoachToken } from './helpers/api-auth';

const apiBase = process.env.PLAYWRIGHT_API_URL || 'http://localhost:4000';

test.describe('Fitness Video & Package API CRUD', () => {
  test('coach can create and delete a fitness video via API', async ({ request }) => {
    const token = await getCoachToken(request);

    const catsRes = await request.get(`${apiBase}/api/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const categories = await catsRes.json();
    const categoryId = (Array.isArray(categories) ? categories : categories.data)?.[0]?.id;
    test.skip(!categoryId, 'No categories seeded');

    const title = `E2E Video ${Date.now()}`;
    const create = await request.post(`${apiBase}/api/videos`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        titleEn: title,
        titleAr: title,
        categoryId,
        videoUrl: 'https://example.com/e2e.mp4',
        isPublic: true,
      },
    });
    expect(create.status()).toBeLessThan(300);
    const created = await create.json();
    const videoId = created.id ?? created.data?.id;
    expect(videoId).toBeTruthy();

    const del = await request.delete(`${apiBase}/api/videos/${videoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(del.status()).toBeLessThan(300);
  });

  test('coach can create and delete a fitness package via API', async ({ request }) => {
    const token = await getCoachToken(request);

    const name = `E2E Pkg ${Date.now()}`;
    const create = await request.post(`${apiBase}/api/packages`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        nameEn: name,
        nameAr: name,
        priceEgp: 99,
        durationDays: 30,
        type: 'combined',
        descriptionEn: 'E2E test package',
        descriptionAr: 'حزمة اختبار',
        level: 'beginner',
      },
    });
    expect(create.status()).toBeLessThan(300);
    const created = await create.json();
    const packageId = created.id ?? created.data?.id;
    expect(packageId).toBeTruthy();

    const del = await request.delete(`${apiBase}/api/packages/${packageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(del.status()).toBeLessThan(300);
  });
});
