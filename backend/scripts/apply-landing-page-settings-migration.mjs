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
  'backend/prisma/migrations/20260611120000_landing_page_settings/migration.sql'
);
const migrationSql = fs.readFileSync(migPath, 'utf8');

console.log('Project:', ref);

const before = await query(
  `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='landing_page_settings'`
);
console.log('BEFORE', before.status, before.text);

const mig = await query(migrationSql);
console.log('MIGRATE', mig.status, mig.text);

const prismaRecord = await query(`
  INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
  SELECT gen_random_uuid()::text, '', NOW(), '20260611120000_landing_page_settings', NULL, NULL, NOW(), 1
  WHERE NOT EXISTS (
    SELECT 1 FROM _prisma_migrations WHERE migration_name = '20260611120000_landing_page_settings'
  )
`);
console.log('PRISMA_RECORD', prismaRecord.status, prismaRecord.text);

const notify = await query(`NOTIFY pgrst, 'reload schema'`);
console.log('NOTIFY', notify.status, notify.text);

const after = await query(
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='landing_page_settings' ORDER BY ordinal_position`
);
console.log('AFTER', after.status, after.text);

process.exit(mig.ok ? 0 : 1);
