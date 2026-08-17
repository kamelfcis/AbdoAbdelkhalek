# Production runbook

## Apply pending SQL (Supabase SQL Editor)

Vercel does **not** run `prisma migrate deploy` on build. After each backend deploy that includes a new file under `backend/prisma/migrations/`, paste and run that migration’s `migration.sql` in:

**Supabase Dashboard → Project → SQL Editor → New query → Run**

Latest additive migration (indexes + favorites):

[`backend/prisma/migrations/20260817120000_performance_indexes_and_favorites/migration.sql`](../backend/prisma/migrations/20260817120000_performance_indexes_and_favorites/migration.sql)

Also confirm these are applied if they were never run:

- [`20260616120000_decouple_squash_fitness_media/migration.sql`](../backend/prisma/migrations/20260616120000_decouple_squash_fitness_media/migration.sql)
- [`20260617120000_squash_package_fitness_parity/migration.sql`](../backend/prisma/migrations/20260617120000_squash_package_fitness_parity/migration.sql)

Optional local/CI equivalent (uses `DATABASE_URL` from `backend/.env` — never paste that URL into chat):

```powershell
cd backend
npx prisma migrate deploy
npx prisma generate
```

### SQL to run now (copy into SQL Editor)

```sql
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

NOTIFY pgrst, 'reload schema';
```

Until this SQL runs, list/toggle favorites fall back to browser `localStorage` only, and catalog queries stay correct but unindexed.

## Health check

`GET /api/health` should return `{ "ok": true, "service": "abdelrhmanabdelkhalek-api" }`.

Optional: a Vercel cron hitting `/api/health` can warm the serverless function.

## Prisma → REST fallback

If the Supabase pooler errors, reads/writes fall back to PostgREST. Logs include `event: "prisma_rest_fallback"` at **warn**. Fallback stays enabled; treat repeated warnings as a pooler/connection issue.

## Secrets

Never commit or paste `DATABASE_URL`, `sbp_` access tokens, or service-role keys. See [SECURITY.md](./SECURITY.md).
