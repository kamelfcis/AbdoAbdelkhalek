-- One-time backfill: mirror fitness categories/videos into squash (same storage paths)
-- Run after migration 20260615120000_squash_fitness_media_links

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
