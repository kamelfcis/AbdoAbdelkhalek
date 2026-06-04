# Phase 5 Progress — Squash Module

**Last updated:** 2026-06-04

## Milestone A — Database

| Item | Status |
|------|--------|
| Prisma models (`squash_*` @@map) | ✅ `backend/prisma/schema.prisma` |
| Migration SQL file | ✅ `backend/prisma/migrations/20260604120000_squash_module/migration.sql` |
| Apply on **production Supabase** (`ugscjqusyjttihnfhtuk`) | ✅ Applied via Supabase Management API (`POST /v1/projects/{ref}/database/query`) |
| PostgREST reload | ✅ `NOTIFY pgrst, 'reload schema';` |
| Seed demo data | ✅ 1 row per table (see counts below) |
| Subscription model decision | ✅ Deferred — no `squash_subscriptions`; use fitness `subscriptions` until Phase 6 |

### Supabase migration notes

1. **Backend project ref:** `ugscjqusyjttihnfhtuk` (from `backend/.env` `SUPABASE_URL`). Region: North EU (Stockholm).
2. **Applied 2026-06-04:** Migration SQL executed with `SUPABASE_ACCESS_TOKEN` (repo root `.env`) and Management API — not MCP (MCP only links `rroxljxrlaaiwerygwlw`).
3. **Prisma CLI:** `migrate deploy` / `db push` still fail from this dev host (direct `db.*:5432` blocked; pooler returns tenant-not-found for Prisma engine). Use Dashboard SQL Editor or Management API when CLI is blocked.
4. **Seed:**
   - Preferred: `npm run seed:squash --workspace=backend` (requires working Prisma DB URL).
   - Fallback (pooler blocked): `SUPABASE_ACCESS_TOKEN=... npm run seed:squash:api --workspace=backend` → runs `backend/scripts/seed-squash.sql`.
5. **Wrong project:** Tables on `rroxljxrlaaiwerygwlw` (MCP mistake) are unrelated — ignore.

### Seed row counts (after apply)

| Table | Rows |
|-------|------|
| squash_categories | 1 |
| squash_videos | 1 |
| squash_packages | 1 |
| squash_reviews | 1 |
| squash_success_stories | 1 |
| squash_faqs | 1 |
| squash_coaches | 1 |
| squash_programs | 1 |

---

## Milestone B — Backend API

| Item | Status |
|------|--------|
| `squash-reads.ts` / `squash-writes.ts` | ✅ |
| `squash.service.ts` / `squash.repository.ts` | ✅ |
| `routes.ts` — public GET + coach CRUD | ✅ |
| Zod `squash-schemas.ts` (+ coach/program) | ✅ |
| Mounted `/api/squash` in `server.ts` | ✅ (pre-existing mount) |
| REST fallback table names | ✅ `squash_*` |
| **Build** | ✅ `npm run backend:build` |

---

## Milestone C — Uploads

| Item | Status |
|------|--------|
| Allowlist `squash/categories/`, `squash/videos/`, … | ✅ `allowlist.ts` |
| CDN middleware on squash routes | ✅ `cdnUrlResponseMiddleware` |

---

## Milestone D — Frontend Public Site

| Item | Status |
|------|--------|
| Sections: Hero, About, Categories, Videos, Packages, Reviews, Stories, FAQ, Coaches, Programs, Contact | ✅ `src/features/squash/` |
| `squashService` + `createDomainContentService` | ✅ |
| `useSquashContent` hook | ✅ |
| **Build** | ✅ `npm run build` |

---

## Milestone E — Domain Routing

| Item | Status |
|------|--------|
| `useDomain()` + `REACT_APP_DOMAIN` | ✅ (pre-existing) |
| `DomainHome` in `router.jsx` | ✅ |
| Single app entry | ✅ |

---

## Milestone F — Dashboard

| Item | Status |
|------|--------|
| Domain switcher (Fitness \| Squash) | ✅ `DomainSwitcher.jsx` |
| Entity registry | ✅ `entityRegistry.js` |
| Domain-aware hooks + `getContentService` | ✅ |
| Squash coaches/programs list sections | ✅ (read-only; full modals Phase 6) |
| Shared CRUD sections for categories/videos/… when Squash selected | ✅ via dynamic `contentService` |

---

## Milestone G — Verification

| Test | Result |
|------|--------|
| `npm run backend:build` | ✅ PASS |
| `npm run build` | ✅ PASS |
| curl squash public GETs (localhost:4000) | ✅ PASS — 8/8 return 200 + ≥1 row |
| curl squash category CRUD (`admin@gmail.com`) | ✅ PASS — POST/PATCH/DELETE cycle |
| CDN URLs on squash responses | ⏳ No media paths in seed rows yet |
| Manual domain switch | 📋 Documented below |

### Smoke test summary (2026-06-04)

| Endpoint | HTTP | Rows | Result |
|----------|------|------|--------|
| GET `/api/squash/categories` | 200 | 1 | PASS |
| GET `/api/squash/videos` | 200 | 1 | PASS |
| GET `/api/squash/packages` | 200 | 1 | PASS |
| GET `/api/squash/reviews` | 200 | 1 | PASS |
| GET `/api/squash/success-stories` | 200 | 1 | PASS |
| GET `/api/squash/faqs` | 200 | 1 | PASS |
| GET `/api/squash/coaches` | 200 | 1 | PASS |
| GET `/api/squash/programs` | 200 | 1 | PASS |
| POST/PATCH/DELETE `/api/squash/categories` | 200 | — | PASS |

Re-run: `backend/scripts/squash-smoke.ps1` (backend on `:4000`).

### Manual domain switch test

1. Fitness: `http://localhost:3000/` (default).
2. Squash: set `REACT_APP_DOMAIN=squash` in root `.env` or add `127.0.0.1 squash.local` and open `http://squash.local:3000`.
3. Dashboard: login as coach → sidebar **Fitness | Squash** toggle → overview resets; API prefix switches to `/api/squash`.

---

## Modified files (summary)

**Backend:** `schema.prisma`, migration SQL, `squash-reads.ts`, `squash-writes.ts`, `squash.service.ts`, `squash.repository.ts`, `routes.ts`, `squash-schemas.ts`, `allowlist.ts`, `scripts/seed-squash.ts`, `scripts/seed-squash.sql`, `scripts/run-seed-squash-api.mjs`, `scripts/squash-smoke.ps1`, `package.json`

**Frontend:** `createDomainContentService.ts`, `squashService.ts`, `getContentService.js`, `useSquashContent.js`, squash sections/pages, `entityRegistry.js`, `DashboardDomainContext.jsx`, `DomainSwitcher.jsx`, dashboard hook/view updates, `queryKeys.js`, `DashboardShell.jsx`

**Docs:** this file, `PHASE5_COMPLETION_REPORT.md` (final)

---

## Remaining before Phase 6

1. Optional: upload squash media and verify CDN rewrite on API responses.
2. Optional: fix Prisma pooler URL for local `seed:squash` / migrations (set `DATABASE_POOLER_URL` from Dashboard if needed).
3. Phase 6: coach/program modals, generic entity framework, squash subscriptions if required.
