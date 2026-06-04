import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const envPath = join(root, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF || 'ugscjqusyjttihnfhtuk';

if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  return { status: res.status, text, ok: res.ok };
}

const migPath = join(
  root,
  'backend/prisma/migrations/20260604130000_squash_access/migration.sql'
);
const migrationSql = fs.readFileSync(migPath, 'utf8');

console.log('Project:', ref);

const before = await query(
  `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('squash_user_video_access','squash_user_category_access') ORDER BY 1`
);
console.log('BEFORE', before.status, before.text);

const mig = await query(migrationSql);
console.log('MIGRATE', mig.status, mig.text);

const notify = await query(`NOTIFY pgrst, 'reload schema'`);
console.log('NOTIFY', notify.status, notify.text);

const after = await query(
  `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('squash_user_video_access','squash_user_category_access') ORDER BY 1`
);
console.log('AFTER', after.status, after.text);

process.exit(mig.ok && notify.ok ? 0 : 1);
