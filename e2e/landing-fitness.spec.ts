import { test, expect } from '@playwright/test';

test.describe('Fitness Landing', () => {
  test('public fitness home loads hero section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect
      .poll(async () => (await page.locator('body').innerText()).length)
      .toBeGreaterThan(100);
  });
});
