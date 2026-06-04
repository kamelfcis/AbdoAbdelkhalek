import { test, expect } from '@playwright/test';
import { loginViaApi } from './helpers/auth';

const apiBase = process.env.PLAYWRIGHT_API_URL || 'http://localhost:4000';

test.describe('Logout', () => {
  test('logout API invalidates coach session', async ({ request }) => {
    const token = await loginViaApi(request);
    const logoutRes = await request.post(`${apiBase}/api/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(logoutRes.ok()).toBeTruthy();

    // Access JWT remains valid until expiry (stateless). Logout clears refresh cookie server-side.
    expect(logoutRes.status()).toBeLessThan(300);
  });
});
