CREATE TABLE IF NOT EXISTS squash_user_video_access (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES squash_videos(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, video_id)
);

CREATE TABLE IF NOT EXISTS squash_user_category_access (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES squash_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, category_id)
);
