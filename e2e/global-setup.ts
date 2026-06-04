import type { FullConfig } from '@playwright/test';

const apiURL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:4000';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

async function waitForOk(url: string, label: string, ms = 120_000) {
  const deadline = Date.now() + ms;
  let lastError = '';
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
      if (res.ok) return;
      lastError = `${res.status}`;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error(`${label} not ready at ${url} (${lastError})`);
}

export default async function globalSetup(_config: FullConfig) {
  if (process.env.PLAYWRIGHT_SKIP_WEBSERVER) {
    await waitForOk(`${apiURL}/api/health`, 'API');
    await waitForOk(baseURL, 'Frontend');
  }
}
