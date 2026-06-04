# Backend Performance — Phase 8

## Response compression

**Enabled** in `backend/src/app/server.ts` via `compression` middleware (gzip/deflate). Applies to JSON API responses above the threshold (~1 KB). No API contract changes.

## Pagination (backward compatible)

Optional query parameters on large list endpoints:

| Endpoint | Params | Default (omit params) |
|----------|--------|------------------------|
| `GET /api/videos` | `limit`, `offset` | Full list (unchanged) |
| `GET /api/trainees` | `limit`, `offset` | Full list |
| `GET /api/squash/videos` | `limit`, `offset` | Full list |

- `limit`: 1–500 (capped)
- `offset`: ≥ 0
- Implemented in `backend/src/common/utils/pagination.ts` + Prisma `take`/`skip` + Supabase REST `limit`/`offset`

Frontend clients that do not send these params behave exactly as before.

## Query audit notes

| Area | Observation | Recommendation |
|------|-------------|----------------|
| Video lists | `include: { category: true }` on every row | Acceptable at current scale; add pagination client-side in Phase 9 if lists grow |
| Trainees | Full user scan for coaches | Use `?limit=&offset=` from dashboard when lists exceed ~100 |
| Dashboard stats | Aggregated counts | Already single round-trip |
| Squash reads | Mirror fitness patterns | Same pagination helper |

## Index recommendations (document only — apply via Supabase SQL editor / migration)

| Table | Column(s) | Use |
|-------|-----------|-----|
| `videos` | `is_public`, `created_at DESC` | Public landing |
| `categories` | `is_public`, `created_at DESC` | Public landing |
| `users` | `is_coach`, `created_at DESC` | Trainee list |
| `subscriptions` | `user_id`, `status` | Trainee dashboard |
| `reviews` | `is_public`, `display_order` | Reviews carousel |
| `faqs` | `is_active`, `order_index` | FAQ section |
| Squash `squash_videos` | `is_public`, `created_at DESC` | Squash landing |

## CDN URL middleware

`cdnUrlResponseMiddleware` remains active on fitness and squash routers — no regression; media fields still rewritten to R2/CDN URLs when `USE_CDN=true`.
