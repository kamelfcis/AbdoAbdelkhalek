/**
 * Backfill registered_from = 'online_football' for fitness-dashboard trainees
 * who still have NULL or legacy 'fitness' (shown as قديم / آخر in UI).
 *
 * Scope matches fitnessTraineeUserIds() in fitness-reads.ts.
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

/** Same scope as fitnessTraineeUserIdsRest + mergeFitnessTraineeUserIds */
const FITNESS_TRAINEE_IDS_CTE = `
WITH squash_entitled AS (
  SELECT user_id AS id FROM squash_user_video_access
  UNION
  SELECT user_id AS id FROM squash_user_category_access
  UNION
  SELECT s.user_id AS id FROM subscriptions s
    WHERE s.package_id IN (SELECT id FROM squash_packages)
  UNION
  SELECT id FROM users WHERE is_coach = false AND registered_from = 'squash'
),
fitness_trainee_ids AS (
  SELECT user_id AS id FROM user_video_access
  UNION
  SELECT user_id AS id FROM user_category_access
  UNION
  SELECT s.user_id AS id FROM subscriptions s
    WHERE s.package_id IS NULL OR s.package_id IN (SELECT id FROM packages)
  UNION
  SELECT id FROM users
    WHERE is_coach = false AND registered_from IN ('online_football', 'fitness')
  UNION
  SELECT id FROM users
    WHERE is_coach = false AND registered_from IS NULL
    AND id NOT IN (SELECT id FROM squash_entitled)
)
`;

console.log('Project:', ref);

const beforeScope = await query(`
${FITNESS_TRAINEE_IDS_CTE}
SELECT
  COALESCE(u.registered_from, 'null') AS registered_from,
  COUNT(*)::int AS count
FROM users u
INNER JOIN fitness_trainee_ids f ON f.id = u.id
WHERE u.is_coach = false
GROUP BY u.registered_from
ORDER BY registered_from;
`);
console.log('BEFORE (fitness trainee scope by registered_from)', beforeScope.status, beforeScope.text);

const beforePending = await query(`
${FITNESS_TRAINEE_IDS_CTE}
SELECT COUNT(*)::int AS pending
FROM users u
INNER JOIN fitness_trainee_ids f ON f.id = u.id
WHERE u.is_coach = false
  AND (u.registered_from IS NULL OR u.registered_from = 'fitness');
`);
console.log('BEFORE (pending backfill)', beforePending.status, beforePending.text);

const update = await query(`
${FITNESS_TRAINEE_IDS_CTE}
UPDATE users u
SET registered_from = 'online_football'
FROM fitness_trainee_ids f
WHERE u.id = f.id
  AND u.is_coach = false
  AND (u.registered_from IS NULL OR u.registered_from = 'fitness');
`);
console.log('UPDATE', update.status, update.text);

const notify = await query(`NOTIFY pgrst, 'reload schema'`);
console.log('NOTIFY', notify.status, notify.text);

const afterScope = await query(`
${FITNESS_TRAINEE_IDS_CTE}
SELECT
  COALESCE(u.registered_from, 'null') AS registered_from,
  COUNT(*)::int AS count
FROM users u
INNER JOIN fitness_trainee_ids f ON f.id = u.id
WHERE u.is_coach = false
GROUP BY u.registered_from
ORDER BY registered_from;
`);
console.log('AFTER (fitness trainee scope by registered_from)', afterScope.status, afterScope.text);

const afterPending = await query(`
${FITNESS_TRAINEE_IDS_CTE}
SELECT COUNT(*)::int AS pending
FROM users u
INNER JOIN fitness_trainee_ids f ON f.id = u.id
WHERE u.is_coach = false
  AND (u.registered_from IS NULL OR u.registered_from = 'fitness');
`);
console.log('AFTER (pending backfill — should be 0)', afterPending.status, afterPending.text);

process.exit(update.ok && notify.ok ? 0 : 1);
