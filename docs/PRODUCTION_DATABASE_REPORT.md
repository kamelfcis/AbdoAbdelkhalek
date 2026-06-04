# Production Database Report

**Date:** 2026-06-04  
**Supabase project ref (source):** `ugscjqusyjttihnfhtuk`  
**ORM:** Prisma (`backend/prisma/schema.prisma`)

---

## 1. Schema audit

### Fitness domain (legacy Supabase tables)

| Model | Table | Purpose |
|-------|-------|---------|
| User | `users` | Auth, `is_coach` flag |
| Category | `categories` | Fitness categories |
| Video | `videos` | Fitness videos |
| Package | `packages` | Subscription packages |
| Subscription | `subscriptions` | User ↔ package |
| Review | `reviews` | Testimonial images |
| SuccessStory | `success_stories` | Stories |
| Faq | `faqs` | FAQ |
| UserVideoAccess | `user_video_access` | Per-user video grants |
| UserCategoryAccess | `user_category_access` | Per-user category grants |
| RefreshToken | `refresh_tokens` | JWT refresh storage |

### Squash domain (Phase 5 migrations)

| Model | Table | Migration |
|-------|-------|-----------|
| SquashCategory | `squash_categories` | `20260604120000_squash_module` |
| SquashVideo | `squash_videos` | same |
| SquashPackage | `squash_packages` | same |
| SquashReview | `squash_reviews` | same |
| SquashSuccessStory | `squash_success_stories` | same |
| SquashFaq | `squash_faqs` | same |
| SquashCoach | `squash_coaches` | same |
| SquashProgram | `squash_programs` | same |
| SquashUserVideoAccess | `squash_user_video_access` | `20260604130000_squash_access` |
| SquashUserCategoryAccess | `squash_user_category_access` | same |

**Note:** Fitness tables were restored from Supabase export; only squash additive changes live under `backend/prisma/migrations/`. Before a greenfield prod DB, run `npx prisma migrate deploy` in `backend/` (or restore from `backup/` then apply pending migrations).

---

## 2. Migrations inventory

```
backend/prisma/migrations/
├── 20260604120000_squash_module/migration.sql   # squash_* content tables
└── 20260604130000_squash_access/migration.sql # squash_user_*_access + FKs to users
```

**Apply on production:**

```powershell
cd backend
npx prisma migrate deploy
npx prisma generate
```

---

## 3. Index recommendations

Prisma schema does not declare `@@index` beyond PKs/unique email. Recommended for production load:

| Table | Index | Rationale |
|-------|-------|-----------|
| `videos` | `(category_id)` | List videos by category |
| `videos` | `(is_public, created_at DESC)` | Public catalog |
| `squash_videos` | `(category_id)` | Squash catalog |
| `squash_videos` | `(is_public, created_at DESC)` | Public squash videos |
| `subscriptions` | `(user_id, status)` | Dashboard subscriptions |
| `refresh_tokens` | `(user_id)` | Logout / revoke |
| `refresh_tokens` | `(expires_at)` | Cleanup job |
| `faqs` / `squash_faqs` | `(is_active, order_index)` | Ordered public FAQs |
| `reviews` / `squash_reviews` | `(is_public, display_order)` | Landing carousels |

**SQL example (run once on prod after review):**

```sql
CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_public_created ON videos(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_squash_videos_category_id ON squash_videos(category_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

---

## 4. Access control tables

| Fitness | Squash |
|---------|--------|
| `user_video_access` | `squash_user_video_access` |
| `user_category_access` | `squash_user_category_access` |

Composite PKs `(user_id, video_id)` / `(user_id, category_id)`. Squash access migration adds `ON DELETE CASCADE` to `users` and squash entities.

---

## 5. Backup references

| Resource | Path |
|----------|------|
| Backup folder | `backups/` |
| Prisma snapshot | `backups/schema.prisma` |
| Restore guide | `docs/BACKUP_AND_RESTORE_REPORT.md` |
| Cutover steps | `docs/CUTOVER_CHECKLIST.md` |
| Toolkit | `migration-toolkit/` (`npm run backup-all`, `export-db`) |

**Operator before go-live:** Final `npm run backup-all` or Supabase dashboard backup; store `DATABASE_URL` in secret manager only.

---

## 6. Verification (this session)

| Check | Result |
|-------|--------|
| Schema file review | **PASS** — fitness + squash + access models present |
| Migration SQL review | **PASS** — 2 migrations, idempotent `IF NOT EXISTS` |
| Live API reads | **PASS** — `GET /api/videos`, categories via local backend |
| Management API table list | **Not run** — optional; project `ugscjqusyjttihnfhtuk` |
| Full `pg_dump` size | **Not run** — operator task |

---

## 7. Production database checklist

- [ ] Provision dedicated Postgres (Neon, Railway Postgres, VPS)
- [ ] Restore or migrate data from `backup/`
- [ ] `npx prisma migrate deploy`
- [ ] Apply recommended indexes (§3)
- [ ] `npm run migrate-auth-users` if auth IDs change
- [ ] Smoke: health, coach login, public GETs, access grant/revoke
