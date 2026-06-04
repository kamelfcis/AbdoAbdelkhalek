import { resolve } from 'path';
import { env, paths } from '../lib/env.js';
import { createPgClient } from '../lib/pg-client.js';
import { ensureDir, writeJson } from '../lib/fs-utils.js';
import { log } from '../lib/logger.js';

export async function exportAuth(): Promise<void> {
  await ensureDir(paths.auth);

  if (process.env.EXPORT_USE_REST === 'true') {
    const { exportAuthViaRest } = await import('./export-auth-rest.js');
    await exportAuthViaRest();
    return;
  }

  const client = createPgClient();
  try {
    await client.connect();
  } catch (connectErr) {
    const { log: logFn, error: logErr } = await import('../lib/logger.js');
    logErr('Postgres auth export failed — using REST', connectErr);
    const { exportAuthViaRest } = await import('./export-auth-rest.js');
    await exportAuthViaRest();
    return;
  }

  try {
    const users = await client.query(`
      SELECT id, email, created_at, updated_at, last_sign_in_at,
             email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
             role, aud, phone
      FROM auth.users
      ORDER BY created_at
    `);

    await writeJson(resolve(paths.auth, 'users.json'), {
      exportedAt: new Date().toISOString(),
      note: 'Password hashes are NOT exported. Users must reset passwords after migration.',
      count: users.rows.length,
      users: users.rows,
    });

    const publicUsers = await client.query(`
      SELECT id, email, full_name, phone, is_coach, created_at
      FROM public.users
      ORDER BY created_at
    `);

    await writeJson(resolve(paths.auth, 'public_users.json'), {
      exportedAt: new Date().toISOString(),
      note: 'password column excluded from export',
      count: publicUsers.rows.length,
      users: publicUsers.rows,
    });

    const roles = await client.query(`
      SELECT r.rolname, m.rolname AS member
      FROM pg_roles r
      LEFT JOIN pg_auth_members am ON r.oid = am.roleid
      LEFT JOIN pg_roles m ON am.member = m.oid
      WHERE r.rolname NOT LIKE 'pg_%'
      LIMIT 500
    `).catch(() => ({ rows: [] }));

    await writeJson(resolve(paths.auth, 'roles.json'), {
      exportedAt: new Date().toISOString(),
      roles: roles.rows,
    });

    log(`Auth export: ${users.rows.length} auth.users, ${publicUsers.rows.length} public.users`);
  } finally {
    await client.end();
  }
}
