import { type APIRequestContext, type Page, expect } from '@playwright/test';

export const COACH_EMAIL = process.env.E2E_COACH_EMAIL || 'admin@gmail.com';
export const COACH_PASSWORD = process.env.E2E_COACH_PASSWORD || '12345678';

const apiBase = () => process.env.PLAYWRIGHT_API_URL || 'http://localhost:4000';

export async function loginViaApi(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${apiBase()}/api/auth/login`, {
    data: { email: COACH_EMAIL, password: COACH_PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  const token = body.accessToken as string;
  if (!token) throw new Error('Login API did not return accessToken');
  return token;
}

export async function seedCoachSession(page: Page, token: string) {
  await page.addInitScript(
    ([t]) => {
      localStorage.setItem('abk_access_token', t);
      localStorage.setItem('websiteLanguage', 'en');
    },
    [token]
  );
}

export async function loginAsCoach(page: Page, request?: APIRequestContext) {
  if (request) {
    const token = await loginViaApi(request);
    await page.goto('/');
    await seedCoachSession(page, token);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });
    return;
  }
  await page.addInitScript(() => {
    localStorage.setItem('websiteLanguage', 'en');
  });
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').waitFor({ state: 'visible', timeout: 90_000 });
  await page.locator('#email').fill(COACH_EMAIL);
  await page.locator('#password').fill(COACH_PASSWORD);
  await page
    .locator('#login-form')
    .getByRole('button', { name: /sign in|تسجيل الدخول/i })
    .click();
  await page.waitForURL(/\/dashboard/, { timeout: 90_000 });
  await expect(page).toHaveURL(/\/dashboard/);
}

export async function getAccessToken(page: Page): Promise<string> {
  const token = await page.evaluate(() => localStorage.getItem('abk_access_token'));
  if (!token) throw new Error('No access token in localStorage after login');
  return token;
}
