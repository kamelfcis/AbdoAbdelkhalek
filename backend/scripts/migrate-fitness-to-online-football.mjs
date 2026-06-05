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
  console.error('Missing SUPABASE_ACCESS_TOKEN in root .env');
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

console.log('Project:', ref);

const before = await query(
  `SELECT registered_from, COUNT(*)::int AS count FROM users WHERE registered_from IN ('fitness', 'online_football') GROUP BY registered_from`
);
console.log('BEFORE', before.status, before.text);

const migrate = await query(
  `UPDATE users SET registered_from = 'online_football' WHERE registered_from = 'fitness'`
);
console.log('MIGRATE', migrate.status, migrate.text);

const notify = await query(`NOTIFY pgrst, 'reload schema'`);
console.log('NOTIFY', notify.status, notify.text);

const after = await query(
  `SELECT registered_from, COUNT(*)::int AS count FROM users WHERE registered_from IN ('fitness', 'online_football') GROUP BY registered_from`
);
console.log('AFTER', after.status, after.text);

process.exit(migrate.ok && notify.ok ? 0 : 1);
