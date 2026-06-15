-- Link squash category/video mirrors to fitness canonical rows (shared storage paths)

ALTER TABLE squash_categories
  ADD COLUMN IF NOT EXISTS source_category_id UUID UNIQUE REFERENCES categories(id) ON DELETE CASCADE;

ALTER TABLE squash_videos
  ADD COLUMN IF NOT EXISTS source_video_id UUID UNIQUE REFERENCES videos(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_squash_categories_source ON squash_categories(source_category_id);
CREATE INDEX IF NOT EXISTS idx_squash_videos_source ON squash_videos(source_video_id);
