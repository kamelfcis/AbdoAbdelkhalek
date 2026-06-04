import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';
import { env } from '../lib/env.js';
import { log } from '../lib/logger.js';

/**
 * Fetches the bucket's r2.dev public URL from Cloudflare API.
 * Requires CLOUDFLARE_API_TOKEN (Account → R2 → Read, or custom with R2 read).
 */
async function main() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = env.r2.accountId();
  const bucket = env.r2.bucketName;

  if (!token) {
    log('Missing CLOUDFLARE_API_TOKEN in .env');
    log('');
    log('Option 1 (no API token): copy pub URL from R2 bucket Settings, then run:');
    log('  npm run set-r2-public -- https://pub-xxxxxxxx.r2.dev');
    log('');
    log('Option 2: add CLOUDFLARE_API_TOKEN (Account → R2 → Read), then re-run:');
    log('  npm run discover-r2-public');
    process.exit(1);
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/domains/managed`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await res.json()) as {
    success?: boolean;
    errors?: { message: string }[];
    result?: { domain?: string; enabled?: boolean };
  };

  if (!res.ok || !body.success) {
    log(`API error ${res.status}: ${JSON.stringify(body.errors || body)}`);
    process.exit(1);
  }

  const { domain, enabled } = body.result || {};
  if (!domain) {
    log('No r2.dev domain returned. Enable Public Development URL on the bucket in Cloudflare.');
    process.exit(1);
  }

  const publicBase = `https://${domain}`;
  log(`R2 public URL: ${publicBase} (enabled: ${enabled})`);

  if (!enabled) {
    log('Public access is disabled. Enabling via API...');
    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enabled: true }),
    });
    const putBody = (await putRes.json()) as { success?: boolean; errors?: unknown };
    if (!putRes.ok || !putBody.success) {
      log(`Enable failed: ${JSON.stringify(putBody)}`);
      log('Enable manually in R2 → Settings → Public Development URL');
      process.exit(1);
    }
    log('Public Development URL enabled.');
  }

  const rootEnv = resolve(env.rootDir, '.env');
  let content = await readFile(rootEnv, 'utf8');
  const lines = [
    `R2_PUBLIC_URL=${publicBase}`,
    `REACT_APP_R2_PUBLIC_URL=${publicBase}`,
    'USE_CDN=true',
    'REACT_APP_USE_CDN=true',
  ];
  for (const line of lines) {
    const key = line.split('=')[0];
    const re = new RegExp(`^${key}=.*$`, 'm');
    content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
  }
  await writeFile(rootEnv, content, 'utf8');
  log(`Updated ${rootEnv}`);

  const backendEnv = resolve(env.rootDir, 'backend/.env');
  try {
    let be = await readFile(backendEnv, 'utf8');
    for (const line of [`R2_PUBLIC_URL=${publicBase}`, 'USE_CDN=true']) {
      const key = line.split('=')[0];
      const re = new RegExp(`^${key}=.*$`, 'm');
      be = re.test(be) ? be.replace(re, line) : `${be.trimEnd()}\n${line}\n`;
    }
    await writeFile(backendEnv, be, 'utf8');
    log(`Updated ${backendEnv}`);
  } catch {
    log('backend/.env not found — copy R2_PUBLIC_URL and USE_CDN=true manually');
  }

  const testKey = 'categories/categories/e4ffcdc1-5b2e-4a3a-9e6f-c07becde1afa.jpeg';
  const testUrl = `${publicBase}/${testKey}`;
  const head = await fetch(testUrl, { method: 'HEAD' });
  log(`Sample HEAD ${testUrl}: ${head.status}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
