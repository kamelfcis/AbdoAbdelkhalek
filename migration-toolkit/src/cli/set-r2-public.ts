import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { env } from '../lib/env.js';
import { log } from '../lib/logger.js';

function normalizeBase(input: string): string {
  let url = input.trim().replace(/\/$/, '');
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, '');
}

async function upsertEnvFile(filePath: string, lines: string[]): Promise<void> {
  let content = await readFile(filePath, 'utf8');
  for (const line of lines) {
    const key = line.split('=')[0];
    const re = new RegExp(`^${key}=.*$`, 'm');
    content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
  }
  await writeFile(filePath, content, 'utf8');
  log(`Updated ${filePath}`);
}

async function main() {
  const raw = process.argv[2];
  if (!raw) {
    log('Usage: npm run set-r2-public -- https://pub-xxxxxxxx.r2.dev');
    log('');
    log('Get the URL from Cloudflare:');
    log('  R2 → abdelrhmanabdelkhalek-assets → Settings → Public Development URL → Enable');
    log('  Copy the https://pub-….r2.dev URL shown there.');
    process.exit(1);
  }

  const publicBase = normalizeBase(raw);
  if (!publicBase.includes('.r2.dev') && !publicBase.includes('cdn.')) {
    log('Warning: URL does not look like pub-*.r2.dev or a custom CDN host.');
  }

  const lines = [
    `R2_PUBLIC_URL=${publicBase}`,
    `REACT_APP_R2_PUBLIC_URL=${publicBase}`,
    'USE_CDN=true',
    'REACT_APP_USE_CDN=true',
  ];

  await upsertEnvFile(resolve(env.rootDir, '.env'), lines);
  try {
    await upsertEnvFile(resolve(env.rootDir, 'backend/.env'), [
      `R2_PUBLIC_URL=${publicBase}`,
      'USE_CDN=true',
    ]);
  } catch {
    log('backend/.env not found — add R2_PUBLIC_URL and USE_CDN=true manually');
  }

  const testKey = 'categories/categories/e4ffcdc1-5b2e-4a3a-9e6f-c07becde1afa.jpeg';
  const testUrl = `${publicBase}/${testKey}`;
  try {
    const head = await fetch(testUrl, { method: 'HEAD' });
    log(`Sample HEAD ${testUrl}: ${head.status}`);
    if (!head.ok) {
      log('Object not found or public access disabled — check bucket Public Development URL.');
    }
  } catch (e) {
    log(`Could not reach ${publicBase}: ${e instanceof Error ? e.message : e}`);
  }

  log('Restart: npm run backend:dev and npm start');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
