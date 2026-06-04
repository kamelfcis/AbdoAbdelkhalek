import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const dir = dirname(fileURLToPath(import.meta.url));
const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF || 'ugscjqusyjttihnfhtuk';

if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

const sql = fs.readFileSync(join(dir, 'seed-squash.sql'), 'utf8');
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
console.log(text);
console.log('HTTP', res.status);

if (res.ok) {
  const counts = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `SELECT 'squash_categories' AS t, COUNT(*)::int AS n FROM squash_categories
        UNION ALL SELECT 'squash_videos', COUNT(*)::int FROM squash_videos
        UNION ALL SELECT 'squash_packages', COUNT(*)::int FROM squash_packages
        UNION ALL SELECT 'squash_reviews', COUNT(*)::int FROM squash_reviews
        UNION ALL SELECT 'squash_success_stories', COUNT(*)::int FROM squash_success_stories
        UNION ALL SELECT 'squash_faqs', COUNT(*)::int FROM squash_faqs
        UNION ALL SELECT 'squash_coaches', COUNT(*)::int FROM squash_coaches
        UNION ALL SELECT 'squash_programs', COUNT(*)::int FROM squash_programs`,
    }),
  });
  console.log(await counts.text());
}

process.exit(res.ok ? 0 : 1);
