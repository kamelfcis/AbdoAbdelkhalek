import { test, expect } from '@playwright/test';
import { getCoachToken } from './helpers/api-auth';

const uniqueName = () => `E2E Cat ${Date.now()}`;
const apiBase = process.env.PLAYWRIGHT_API_URL || 'http://localhost:4000';

test.describe('Category CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard?section=categories', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('heading', { name: /Categories Management|إدارة التصنيفات/ }).first()
    ).toBeVisible({ timeout: 90_000 });
  });

  test('create category appears in list', async ({ page }) => {
    const nameEn = uniqueName();
    const nameAr = `تصنيف ${Date.now()}`;

    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.getByLabel('Name (EN)').fill(nameEn);
    await page.getByLabel('Name (AR)').fill(nameAr);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText(nameEn)).toBeVisible({ timeout: 20_000 });
  });

  test('edit category updates list', async ({ page, request }) => {
    const token = await getCoachToken(request);
    const nameEn = uniqueName();
    const nameAr = `تصنيف ${Date.now()}`;
    const updated = `${nameEn} Updated`;

    const create = await request.post(`${apiBase}/api/categories`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { nameEn, nameAr, isPublic: true },
    });
    expect(create.status()).toBe(201);
    const catId = (await create.json()).id;

    await page.reload();
    await expect(page.getByText(nameEn)).toBeVisible({ timeout: 45_000 });

    const patch = await request.patch(`${apiBase}/api/categories/${catId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { nameEn: updated, nameAr: updated },
    });
    expect(patch.status()).toBeLessThan(300);

    await page.reload();
    await expect(page.getByText(updated)).toBeVisible({ timeout: 45_000 });

    await request.delete(`${apiBase}/api/categories/${catId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  test('delete category removes from list', async ({ page }) => {
    const nameEn = uniqueName();
    const nameAr = `تصنيف ${Date.now()}`;

    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.getByLabel('Name (EN)').fill(nameEn);
    await page.getByLabel('Name (AR)').fill(nameAr);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText(nameEn)).toBeVisible({ timeout: 20_000 });

    const row = page.getByRole('row').filter({ hasText: nameEn });
    await row.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Yes, delete' }).click();
    await expect(page.getByText(nameEn)).not.toBeVisible({ timeout: 20_000 });
  });
});
