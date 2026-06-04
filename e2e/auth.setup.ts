import { test as setup } from '@playwright/test';
import { loginAsCoach } from './helpers/auth';

const authFile = 'e2e/.auth/coach.json';

setup('authenticate coach', async ({ page, request }) => {
  await loginAsCoach(page, request);
  await page.context().storageState({ path: authFile });
});
