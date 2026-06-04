import { resolve } from 'path';
import { env, paths } from '../lib/env.js';
import { ensureDir, writeJson } from '../lib/fs-utils.js';
import { log } from '../lib/logger.js';

export async function exportAuthViaRest(): Promise<void> {
  await ensureDir(paths.auth);
  const key = env.supabaseServiceKey();
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };

  const users: unknown[] = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const url = `${env.supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Auth admin API failed ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as { users?: unknown[] };
    const batch = data.users || [];
    users.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  await writeJson(resolve(paths.auth, 'users.json'), {
    exportedAt: new Date().toISOString(),
    method: 'supabase-auth-admin-api',
    note: 'Password hashes are NOT exported.',
    count: users.length,
    users,
  });

  const publicUsers = await fetch(`${env.supabaseUrl}/rest/v1/users?select=id,email,full_name,phone,is_coach,created_at`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
  if (publicUsers.ok) {
    const rows = await publicUsers.json();
    await writeJson(resolve(paths.auth, 'public_users.json'), {
      exportedAt: new Date().toISOString(),
      count: Array.isArray(rows) ? rows.length : 0,
      users: rows,
    });
  }

  log(`Auth REST export: ${users.length} auth users`);
}
