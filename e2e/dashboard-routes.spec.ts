import { test, expect } from '@playwright/test';

test.describe('Dashboard path routing', () => {
  test('legacy /dashboard redirects to domain overview', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard\/(fitness|squash)\/overview/, { timeout: 60_000 });
  });

  test('legacy query params redirect to canonical path', async ({ page }) => {
    await page.goto('/dashboard?domain=squash&section=videos', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard\/squash\/videos/, { timeout: 60_000 });
  });

  test('domain-only path redirects to overview', async ({ page }) => {
    await page.goto('/dashboard/fitness', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard\/fitness\/overview/, { timeout: 60_000 });
  });
});
