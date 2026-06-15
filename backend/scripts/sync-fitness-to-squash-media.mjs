/**
 * One-time backfill: mirror fitness categories/videos into squash tables with identical paths.
 * Run after applying migration 20260615120000_squash_fitness_media_links.
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

console.log('Project:', ref);

const beforeCats = await query(`
SELECT
  (SELECT COUNT(*)::int FROM categories) AS fitness_categories,
  (SELECT COUNT(*)::int FROM squash_categories) AS squash_categories,
  (SELECT COUNT(*)::int FROM squash_categories WHERE source_category_id IS NOT NULL) AS linked_categories;
`);
console.log('BEFORE categories', beforeCats.status, beforeCats.text);

const upsertCategories = await query(`
INSERT INTO squash_categories (
  name_en, name_ar, description_en, description_ar, image_path, is_public, source_category_id
)
SELECT
  c.name_en, c.name_ar, c.description_en, c.description_ar, c.image_path, c.is_public, c.id
FROM categories c
ON CONFLICT (source_category_id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  image_path = EXCLUDED.image_path,
  is_public = EXCLUDED.is_public;
`);
console.log('UPSERT categories', upsertCategories.status, upsertCategories.text);

const upsertVideos = await query(`
INSERT INTO squash_videos (
  title_en, title_ar, description_en, description_ar,
  category_id, video_url, video_path, thumbnail_url, thumbnail_path,
  duration_seconds, is_public, source_video_id
)
SELECT
  v.title_en, v.title_ar, v.description_en, v.description_ar,
  sc.id,
  v.video_url, v.video_path, v.thumbnail_url, v.thumbnail_path,
  v.duration_seconds, v.is_public, v.id
FROM videos v
LEFT JOIN squash_categories sc ON sc.source_category_id = v.category_id
ON CONFLICT (source_video_id) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_ar = EXCLUDED.title_ar,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  category_id = EXCLUDED.category_id,
  video_url = EXCLUDED.video_url,
  video_path = EXCLUDED.video_path,
  thumbnail_url = EXCLUDED.thumbnail_url,
  thumbnail_path = EXCLUDED.thumbnail_path,
  duration_seconds = EXCLUDED.duration_seconds,
  is_public = EXCLUDED.is_public;
`);
console.log('UPSERT videos', upsertVideos.status, upsertVideos.text);

const afterCounts = await query(`
SELECT
  (SELECT COUNT(*)::int FROM categories) AS fitness_categories,
  (SELECT COUNT(*)::int FROM videos) AS fitness_videos,
  (SELECT COUNT(*)::int FROM squash_categories WHERE source_category_id IS NOT NULL) AS linked_categories,
  (SELECT COUNT(*)::int FROM squash_videos WHERE source_video_id IS NOT NULL) AS linked_videos,
  (SELECT COUNT(*)::int FROM squash_categories WHERE source_category_id IS NULL) AS orphan_squash_categories,
  (SELECT COUNT(*)::int FROM squash_videos WHERE source_video_id IS NULL) AS orphan_squash_videos;
`);
console.log('AFTER counts', afterCounts.status, afterCounts.text);

const orphanCats = await query(`
SELECT id, name_en FROM squash_categories WHERE source_category_id IS NULL LIMIT 20;
`);
console.log('ORPHAN squash categories (sample)', orphanCats.status, orphanCats.text);

const orphanVids = await query(`
SELECT id, title_en FROM squash_videos WHERE source_video_id IS NULL LIMIT 20;
`);
console.log('ORPHAN squash videos (sample)', orphanVids.status, orphanVids.text);

const notify = await query(`NOTIFY pgrst, 'reload schema'`);
console.log('NOTIFY', notify.status, notify.text);

process.exit(upsertCategories.ok && upsertVideos.ok && notify.ok ? 0 : 1);
