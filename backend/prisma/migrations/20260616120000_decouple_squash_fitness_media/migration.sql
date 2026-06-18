-- Decouple squash categories/videos from fitness link columns.
-- Squash row data (names, images, etc.) is preserved; only FK links are removed.
--
-- PRODUCTION: Run this file on Supabase SQL editor after deploying the API
-- that no longer references source_category_id / source_video_id.

ALTER TABLE squash_videos DROP CONSTRAINT IF EXISTS squash_videos_source_video_id_fkey;
ALTER TABLE squash_categories DROP CONSTRAINT IF EXISTS squash_categories_source_category_id_fkey;

DROP INDEX IF EXISTS idx_squash_videos_source;
DROP INDEX IF EXISTS idx_squash_categories_source;

ALTER TABLE squash_videos DROP COLUMN IF EXISTS source_video_id;
ALTER TABLE squash_categories DROP COLUMN IF EXISTS source_category_id;
