-- Performance indexes (docs/PRODUCTION_DATABASE_REPORT.md §3)
-- Safe to re-run: IF NOT EXISTS throughout.

CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_public_created ON videos(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_squash_videos_category_id ON squash_videos(category_id);
CREATE INDEX IF NOT EXISTS idx_squash_videos_public_created ON squash_videos(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_faqs_active_order ON faqs(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_squash_faqs_active_order ON squash_faqs(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_reviews_public_order ON reviews(is_public, display_order);
CREATE INDEX IF NOT EXISTS idx_squash_reviews_public_order ON squash_reviews(is_public, display_order);

-- Trainee video favorites (fitness + squash). No FK to video tables:
-- IDs live in videos vs squash_videos and must not be mixed.
CREATE TABLE IF NOT EXISTS user_video_favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, video_id, domain),
  CONSTRAINT user_video_favorites_domain_check CHECK (domain IN ('fitness', 'squash'))
);

CREATE INDEX IF NOT EXISTS idx_user_video_favorites_user_domain
  ON user_video_favorites(user_id, domain);

ALTER TABLE user_video_favorites ENABLE ROW LEVEL SECURITY;

-- Backend uses Prisma (postgres) and service_role REST; no anon/authenticated policies.
NOTIFY pgrst, 'reload schema';
