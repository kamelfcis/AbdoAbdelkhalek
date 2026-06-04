# Phase 4 — Backend Refactor Implementation Plan

**Date:** 2026-06-04  
**Status:** Complete — see [PHASE4_COMPLETION_REPORT.md](./PHASE4_COMPLETION_REPORT.md)  
**Scope source:** [ROADMAP.md](../ROADMAP.md) Phase 4, [PROJECT_CHECKLIST.md](../PROJECT_CHECKLIST.md) Phase 4  
**Do not implement in this document** — planning only.

---

## Goal

Restructure the Express API into domain-driven modules with unified data access, Zod validation on all writes, structured logging, and security hardening — **without breaking** existing `/api/*` contracts used by the Phase 3 frontend.

---

## Dependencies on Phase 3

| Dependency | Status |
|------------|--------|
| Frontend uses stable `/api` paths | ✅ `shared/api/*` services unchanged |
| Coach dashboard CRUD via existing endpoints | ✅ Smoke-tested categories cycle |
| CDN/R2 URLs in API responses | ✅ `cdn-urls` middleware + R2 URLs |
| Auth: access JWT + refresh cookie | ✅ Documented and tested |
| Squash API prefix | Not required until Phase 5 — scaffold `domains/squash/` only |

---

## Target file map

```
backend/src/
├── index.ts                          # Mount domain routers (unchanged paths)
├── app.ts                            # Express app factory (optional extract)
├── domains/
│   ├── fitness/
│   │   ├── routes.ts                 # Public + coach CRUD (from modules/content)
│   │   ├── service.ts                # Business rules, access checks
│   │   ├── repository.ts             # Prisma + Supabase REST fallback
│   │   └── schemas.ts                # Zod create/update per entity
│   ├── squash/
│   │   ├── routes.ts                 # Scaffold — mount later at /api/squash
│   │   └── README.md
│   └── shared/
│       ├── auth/
│       │   ├── routes.ts             # From modules/auth
│       │   └── schemas.ts
│       └── media/
│           ├── routes.ts             # From modules/uploads
│           └── allowlist.ts          # Bucket/path rules
├── infrastructure/
│   ├── prisma/
│   │   └── client.ts                 # From lib/prisma.ts
│   ├── supabase-rest/
│   │   └── client.ts                 # From lib/supabase-data.ts
│   └── r2/
│       └── client.ts                 # From lib/r2.ts
└── common/
    ├── validation/
    │   └── validate.ts               # Zod middleware wrapper
    ├── errors/
    │   └── AppError.ts + handler     # From middleware/error.ts
    └── logging/
        └── logger.ts                 # pino or winston + request ID
```

**Migrate from (current):**

- `backend/src/modules/auth/routes.ts`
- `backend/src/modules/content/routes.ts`
- `backend/src/modules/uploads/routes.ts`
- `backend/src/lib/*` (prisma, auth-data, cdn-url, r2, case-map, …)

**Keep backward compatible mounts:**

- `/api/auth/*`
- `/api/health`, `/api/categories`, `/api/videos`, … (fitness)
- `/api/uploads/*`

---

## Priorities

### Priority A — Structure & mounts (week 1)

1. Create folder skeleton under `domains/`, `infrastructure/`, `common/`.
2. Move auth routes → `domains/shared/auth/`; re-export from `index.ts` at same paths.
3. Move content routes → `domains/fitness/routes.ts`; extract `repository.ts` calling existing `prisma-data` / `supabase-data` helpers.
4. Move uploads → `domains/shared/media/`.
5. Verify `npm run backend:build` and smoke GET/POST with coach JWT after each move.

### Priority B — Validation & errors (week 2)

1. Add Zod schemas per entity (Category, Video, Package, Review, SuccessStory, FAQ, Subscription).
2. `validate(schema)` middleware on all POST/PATCH; return **400** with field errors (replace 500 on `{}`).
3. Centralize `AppError` + error handler; map Prisma/REST errors to consistent JSON.

### Priority C — Security & observability (week 3)

1. Helmet middleware.
2. Rate limit `/api/auth/login` and `/api/auth/signup`.
3. Structured logging (request ID, duration, status).
4. Upload path allowlist (bucket + prefix per entity).
5. RefreshToken: implement rotation using Prisma model **or** remove dead model + document cookie-only flow.

### Priority D — Docs & hygiene (week 4)

1. Gitignore `backend/dist/`; remove tracked dist from repo if present.
2. Update `backend/README.md` + `docs/API_ROUTE_MAP.md`.
3. Integration smoke script (curl or vitest) mirroring Phase 3 smoke matrix.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking `/api` response shapes | Contract tests; keep `case-map` / `rewriteMediaUrls` behavior |
| Dual Prisma/REST path drift | Single `repository.ts` per domain; one fallback policy |
| Large `content/routes.ts` move | Incremental: read routes first, then writes with Zod |
| Upload allowlist too strict | Start with fitness buckets already in R2; log rejections |
| Refresh token security | Align with frontend `authService` refresh call (cookie credentials) |

---

## Exit criteria (from ROADMAP)

- [ ] Content routes split by domain (`fitness` live, `squash` scaffold)
- [ ] All writes validated (400 on invalid payload)
- [ ] `tsc` build passes; `dist/` not committed
- [ ] Phase 3 smoke matrix still passes (automated script recommended)
- [ ] Helmet + auth rate limits enabled in production config

---

## Out of scope (Phase 5+)

- Squash Prisma models and `/api/squash/*` CRUD
- Frontend trainee portal route
- Playwright E2E CI (Phase 7)
- Postgres hosting migration (Phase 1 decision follow-through)

---

## Suggested first PR (when implementing)

**Title:** `refactor(backend): extract fitness domain routes without path changes`

- Move files only; no behavior change.
- Run `docs/PHASE3_SMOKE_TEST_REPORT.md` API rows as regression check.
