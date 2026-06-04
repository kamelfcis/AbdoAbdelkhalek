import { test, expect } from '@playwright/test';
test.describe('Dashboard Loads', () => {
  test('dashboard overview is visible after login', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('heading', { name: /dashboard|لوحة التحكم/i }).or(
        page.getByText(/overview|trainees|videos|categories/i)
      ).first()
    ).toBeVisible({ timeout: 60_000 });
  });
});
