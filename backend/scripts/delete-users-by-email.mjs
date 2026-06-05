/**
 * Delete users (and related rows) by email via Supabase Management API.
 *
 * Usage:
 *   node backend/scripts/delete-users-by-email.mjs email1@example.com email2@example.com
 */
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

const emails = process.argv.slice(2);
if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN in root .env');
  process.exit(1);
}
if (emails.length === 0) {
  console.error('Usage: node delete-users-by-email.mjs <email> [email...]');
  process.exit(1);
}

/** Tables with user_id FK — delete child rows before users. */
const CHILD_TABLES = [
  'password_reset_tokens',
  'refresh_tokens',
  'user_video_access',
  'user_category_access',
  'squash_user_video_access',
  'squash_user_category_access',
  'subscriptions',
];

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
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data, ok: res.ok, text };
}

function esc(value) {
  return String(value).replace(/'/g, "''");
}

function emailList() {
  return emails.map((e) => `'${esc(e)}'`).join(', ');
}

async function findUsers() {
  const result = await query(`
    SELECT id, email, is_coach, full_name, registered_from, created_at
    FROM users
    WHERE email IN (${emailList()})
    ORDER BY email;
  `);
  return result;
}

async function countChildRows(userId) {
  const counts = {};
  for (const table of CHILD_TABLES) {
    const result = await query(
      `SELECT COUNT(*)::int AS count FROM ${table} WHERE user_id = '${esc(userId)}';`
    );
    const row = Array.isArray(result.data) ? result.data[0] : null;
    counts[table] = row?.count ?? 0;
  }
  return counts;
}

async function deleteChildRows(userId) {
  const deleted = {};
  for (const table of CHILD_TABLES) {
    const before = await query(
      `SELECT COUNT(*)::int AS count FROM ${table} WHERE user_id = '${esc(userId)}';`
    );
    const beforeCount = Array.isArray(before.data) ? before.data[0]?.count ?? 0 : 0;

    if (beforeCount > 0) {
      const del = await query(`DELETE FROM ${table} WHERE user_id = '${esc(userId)}';`);
      if (!del.ok) {
        throw new Error(`Failed to delete from ${table} for user ${userId}: ${del.text}`);
      }
    }
    deleted[table] = beforeCount;
  }
  return deleted;
}

async function deleteUser(userId) {
  return query(`DELETE FROM users WHERE id = '${esc(userId)}';`);
}

console.log('Project:', ref);
console.log('Emails:', emails.join(', '));

console.log('\n=== BEFORE ===');
const before = await findUsers();
console.log('Status:', before.status);
console.log('Users found:', JSON.stringify(before.data, null, 2));

if (!before.ok) {
  console.error('Failed to query users:', before.text);
  process.exit(1);
}

const users = Array.isArray(before.data) ? before.data : [];
if (users.length === 0) {
  console.log('No matching users — nothing to delete.');
  process.exit(0);
}

if (users.length !== emails.length) {
  const found = new Set(users.map((u) => u.email));
  const missing = emails.filter((e) => !found.has(e));
  console.warn('Warning: some emails not found:', missing.join(', '));
}

for (const user of users) {
  console.log(`\n--- User: ${user.email} (${user.id}) is_coach=${user.is_coach} ---`);
  const counts = await countChildRows(user.id);
  console.log('Child row counts BEFORE delete:', JSON.stringify(counts, null, 2));

  const deleted = await deleteChildRows(user.id);
  console.log('Deleted from child tables:', JSON.stringify(deleted, null, 2));

  const userDel = await deleteUser(user.id);
  console.log('Delete user status:', userDel.status, userDel.text || userDel.data);
  if (!userDel.ok) {
    console.error('Failed to delete user:', user.email);
    process.exit(1);
  }
}

const notify = await query(`NOTIFY pgrst, 'reload schema'`);
console.log('\nNOTIFY pgrst:', notify.status, notify.text || notify.data);

console.log('\n=== AFTER (verification) ===');
const after = await findUsers();
console.log('Status:', after.status);
console.log('Users remaining (should be empty):', JSON.stringify(after.data, null, 2));

const remaining = Array.isArray(after.data) ? after.data.length : -1;
process.exit(remaining === 0 ? 0 : 1);
