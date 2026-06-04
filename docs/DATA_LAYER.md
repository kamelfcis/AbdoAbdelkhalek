# Data Layer — Prisma + Supabase REST Fallback

**Phase 1 Priority C** · Last updated: 2026-06-04

---

## Overview

The backend uses a **dual-path data layer**:

1. **Primary:** Prisma → PostgreSQL (via Supabase pooler or direct connection)
2. **Fallback:** Supabase PostgREST (`backend/src/lib/supabase-data.ts`) when the pooler is unreachable

Every read/write in `prisma-data.ts`, `prisma-writes.ts`, and `auth-data.ts` follows the same pattern:

```typescript
try {
  return await prisma.<model>.<operation>(...);
} catch (e) {
  if (!isPoolerError(e)) throw e;
  return rest.restList(...) // or restCreate / restPatch / restDelete
}
```

Pooler detection lives in `backend/src/lib/db-errors.ts` (`isPoolerError`).

---

## Supabase Pooler Failure Symptoms

When the session/transaction pooler is unreachable from a dev machine or CI, Prisma throws errors such as:

| Symptom | Example message |
|---------|-----------------|
| DNS failure | `ENOTFOUND aws-0-eu-north-1.pooler.supabase.com` |
| Tenant/user auth | `FATAL: Tenant or user not found` |
| Connection refused | `ECONNREFUSED` |
| Generic unreachable | `Can't reach database server` |

**Observed behavior:**

- Backend boots successfully (Prisma connects lazily on first query).
- First Prisma query fails → `isPoolerError` matches → REST fallback runs.
- API responses return **snake_case** fields (raw PostgREST shape) instead of Prisma camelCase.
- Signup previously failed (Prisma-only) — now uses REST fallback via `createUser()` in `auth-data.ts`.

---

## Hosting Decision (Phase 1)

| Option | Verdict |
|--------|---------|
| **Stay on Supabase (interim)** | **Selected for now** — keep REST fallback until connectivity is stable |
| Migrate to Neon / VPS Postgres | **Recommended in ROADMAP Phase 1–2** — eliminates dual-path complexity |

**Rationale:** The platform already runs on Supabase Postgres with working PostgREST fallback. Migrating to dedicated Postgres (Neon serverless or VPS) is the long-term fix but is **out of scope for Priority C**. Proceed with:

- Documented connection options (below)
- Aligned REST column names for known drift tables (`faqs`, `packages`)
- Signup REST fallback
- Plan Neon/VPS cutover in Phase 2+ per [ROADMAP.md](../ROADMAP.md)

---

## Connection URL Options

Configured in `backend/src/lib/database-url.ts`. Resolution order:

1. `DATABASE_POOLER_URL` — explicit pooler URL (highest priority)
2. `DATABASE_USE_DIRECT=true` — force `DATABASE_URL` direct host (`db.*.supabase.co:5432`)
3. Auto-rewrite: if `DATABASE_URL` host is `db.*.supabase.co`, rewrite to session pooler (`aws-0-{region}.pooler.supabase.com:5432`, user `postgres.{project_ref}`)
4. Otherwise use `DATABASE_URL` as-is

### Dev troubleshooting

| Goal | Setting |
|------|---------|
| Bypass broken pooler in local dev | `DATABASE_USE_DIRECT=true` + direct `DATABASE_URL` |
| Pin a working pooler URL | Set `DATABASE_POOLER_URL` from Supabase Dashboard → Database → Connection string → **Session pooler** |
| Transaction pooler (serverless) | Port `6543`, add `?pgbouncer=true` — use only if session pooler fails; Prisma migrations need direct connection |

See `.env.example` and `backend/.env.example` for annotated variables.

---

## Schema Drift (Live Supabase vs Prisma)

Prisma schema was partially generated; live Supabase tables differ in places.

### `faqs` — aligned (Priority C)

| Live column | Prisma field | Notes |
|-------------|--------------|-------|
| `order_index` | `orderIndex` | Was incorrectly mapped to `display_order` |
| `is_active` | `isActive` | Was incorrectly mapped to `is_public` |
| `updated_at` | `updatedAt` | Optional timestamp |

**REST fallback (reads):** `?is_active=eq.true&order=order_index.asc`  
**Frontend/dashboard:** sends `order_index`, `is_active` (snake_case)

### `packages` — partial drift (documented)

| Live column | Prisma schema | Status |
|-------------|---------------|--------|
| `price_egp`, `price_usd` | `price` (Decimal) | Drift — REST returns live columns; reconcile on Postgres migration |
| `level`, `type`, `includes_video_feedback`, `daily_support` | Not in schema | Extra live columns |
| `is_active` | `isActive` | **Column does not exist in live DB** — list query returns all packages |

**REST fallback (reads):** `?order=created_at.desc` (no `is_active` filter)

Full schema reconciliation: run `npx prisma db pull` after Postgres cutover.

---

## Module Map

| File | Role |
|------|------|
| `backend/src/infrastructure/prisma/client.ts` | Prisma client (uses resolved DB URL) |
| `backend/src/infrastructure/prisma/database-url.ts` | URL resolution (direct / pooler / explicit) |
| `backend/src/infrastructure/prisma/db-errors.ts` | Pooler error detection |
| `backend/src/infrastructure/supabase-rest/client.ts` | PostgREST HTTP client |
| `backend/src/common/utils/case-map.ts` | camelCase ↔ snake_case for REST bodies |
| `backend/src/infrastructure/prisma/fitness-reads.ts` | Fitness read operations + dashboard stats |
| `backend/src/infrastructure/prisma/fitness-writes.ts` | Fitness coach CRUD + access writes |
| `backend/src/domains/fitness/fitness.repository.ts` | Unified fitness data access export |
| `backend/src/domains/shared/auth/user.repository.ts` | Auth reads + `createUser` signup write |

Legacy `backend/src/lib/*` re-exports the paths above (Phase 4).

---

## Smoke Test Notes

Backend: `npm run backend:dev` → `http://localhost:4000`

### Public GET (verified 2026-06-04, REST fallback path active)

```powershell
Invoke-RestMethod http://localhost:4000/api/health
Invoke-RestMethod http://localhost:4000/api/categories   # 7 rows
Invoke-RestMethod http://localhost:4000/api/videos       # 7 rows (public filter when unauthenticated)
Invoke-RestMethod http://localhost:4000/api/packages     # 10 rows
Invoke-RestMethod http://localhost:4000/api/reviews      # 36 rows
Invoke-RestMethod http://localhost:4000/api/success-stories  # 20 rows
Invoke-RestMethod http://localhost:4000/api/faqs         # 19 rows, ordered by order_index
```

Responses use snake_case when REST fallback is active.

### Auth signup (REST fallback when pooler fails)

```powershell
$body = @{ email='test@example.com'; password='testpass123'; fullName='Test User' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:4000/api/auth/signup -Method POST -Body $body -ContentType 'application/json'
```

Uses `createUser()` in `auth-data.ts` — Prisma first, REST `POST /rest/v1/users` on pooler error.

### Coach CRUD (REST fallback path)

Requires coach JWT from `POST /api/auth/login`. Example:

```powershell
$login = @{ email='coach@example.com'; password='...' } | ConvertTo-Json
$auth = Invoke-RestMethod -Uri http://localhost:4000/api/auth/login -Method POST -Body $login -ContentType 'application/json'
$headers = @{ Authorization = "Bearer $($auth.accessToken)" }

# FAQ create (fields match live DB)
$faq = @{ question_en='Q'; question_ar='س'; answer_en='A'; answer_ar='ج'; order_index=99; is_active=$true } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:4000/api/faqs -Method POST -Headers $headers -Body $faq -ContentType 'application/json'
```

Writes go through `prisma-writes.ts` → `withWriteFallback`.

---

## Future: Postgres Migration Checklist

When moving to Neon/VPS (Phase 2+):

1. Provision Postgres; set `DATABASE_URL`
2. `npx prisma db pull` + reconcile `schema.prisma` (especially `packages`)
3. Run migrations / restore data
4. Verify Prisma path on all endpoints
5. Remove or gate REST fallback behind `SUPABASE_REST_FALLBACK=true`
6. Update production env in hosting provider
