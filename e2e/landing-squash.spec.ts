import { test, expect } from '@playwright/test';

/**
 * Squash public site requires REACT_APP_DOMAIN=squash at dev-server start,
 * or hostname squash.abdelrhmanabdelkhalek.com.
 */
test.describe('Squash Landing', () => {
  test.skip(
    () =>
      process.env.REACT_APP_DOMAIN !== 'squash' &&
      test.info().project.name !== 'squash-landing',
    'Set REACT_APP_DOMAIN=squash on dev server or run --project=squash-landing with squash env'
  );

  test('squash home page renders fitness-style layout and nav anchors', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.locator('#about-me')).toBeAttached();
    await expect(page.locator('#categories')).toBeAttached();
    await expect(page.locator('#programs')).toBeAttached();
    await expect(page.locator('#contact')).toBeAttached();
    await expect
      .poll(async () => (await page.locator('main').innerText()).length)
      .toBeGreaterThan(50);
  });
});
