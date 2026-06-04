import { test, expect } from '@playwright/test';
test.describe('Coach Login', () => {
  test('coach can sign in and reach dashboard', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });
    await expect(
      page.getByRole('heading', { name: /dashboard|لوحة التحكم/i }).or(
        page.getByText(/overview|categories|trainees/i)
      ).first()
    ).toBeVisible({ timeout: 60_000 });
  });
});
