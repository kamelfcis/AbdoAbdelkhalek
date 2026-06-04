# Phase 4 — Backend Refactor Progress

**Date:** 2026-06-04  
**Status:** Complete (milestones A–G)

---

## Milestone A — Domain Structure

**Completed:** Yes

**Modified files:**
- `backend/src/app/server.ts` (new)
- `backend/src/index.ts`
- `backend/src/domains/fitness/routes.ts`, `fitness.service.ts`, `fitness.repository.ts`
- `backend/src/domains/shared/auth/routes.ts`, `user.repository.ts`, `jwt.ts`
- `backend/src/domains/shared/media/routes.ts`, `allowlist.ts`
- `backend/src/domains/squash/routes.ts`, `README.md`
- Removed `backend/src/modules/*/routes.ts`

**Checklist:** Domain structure + fitness/shared mounts marked done.

**Build:** PASS

**Remaining work:** None for A.

---

## Milestone B — Repository Pattern

**Completed:** Yes

**Modified files:**
- `backend/src/infrastructure/prisma/fitness-reads.ts` (from `prisma-data.ts`)
- `backend/src/infrastructure/prisma/fitness-writes.ts` (from `prisma-writes.ts`)
- `backend/src/domains/fitness/fitness.repository.ts` (unified re-export)
- `backend/src/domains/fitness/fitness.service.ts` (business logic)
- `backend/src/domains/fitness/routes.ts` (thin handlers)

**Checklist:** Fitness migration items done.

**Build:** PASS

**Remaining work:** None for B.

---

## Milestone C — Validation

**Completed:** Yes

**Modified files:**
- `backend/src/common/validation/fitness-schemas.ts`
- `backend/src/common/validation/auth-schemas.ts`
- `backend/src/common/validation/snake-camel.ts`
- `backend/src/common/middleware/validate.ts`
- Validation on all fitness POST/PATCH + auth login/signup

**Checklist:** All Zod schema items + middleware done.

**Build:** PASS

**Smoke:** `POST /api/videos` with `{}` → **400** (was 500).

**Remaining work:** None for C.

---

## Milestone D — Infrastructure

**Completed:** Yes

**Modified files:**
- `backend/src/infrastructure/prisma/client.ts`, `database-url.ts`, `db-errors.ts`, `index.ts`
- `backend/src/infrastructure/supabase-rest/client.ts`
- `backend/src/infrastructure/r2/client.ts`
- `backend/src/infrastructure/logging/logger.ts`, `request-logger.ts`
- `backend/src/common/utils/cdn-url.ts`, `case-map.ts`
- `backend/src/lib/*` → thin re-exports

**Checklist:** Infrastructure folders done.

**Build:** PASS

**Remaining work:** None for D.

---

## Milestone E — Security

**Completed:** Yes

**Modified files:**
- `backend/src/app/server.ts` — Helmet
- `backend/src/domains/shared/auth/routes.ts` — rate limit login/signup
- `backend/src/infrastructure/logging/request-logger.ts` — request ID + access log
- `backend/src/common/errors/AppError.ts`, `handler.ts`
- `backend/src/domains/shared/media/allowlist.ts`

**Checklist:** Helmet, rate limit, logging, allowlist, error handler done.

**Build:** PASS

**Smoke:** Invalid upload bucket `evil` → **400**.

**Remaining work:** None for E.

---

## Milestone F — Build Cleanup

**Completed:** Yes

**Modified files:**
- All TypeScript errors resolved (`express-rate-limit` cast)
- Legacy `modules/` routes removed
- `backend/dist/` remains in `.gitignore`
- Dependencies: `helmet`, `express-rate-limit` added to `backend/package.json`

**RefreshToken decision:** Keep Prisma `RefreshToken` model and `refresh_tokens` table unchanged. Auth uses **httpOnly cookie + JWT refresh** only (no DB rotation). Model documented as unused until a future security pass; removing it would require a migration and is out of Phase 4 scope.

**Build:** PASS

**Remaining work:** Optional: remove unused `RefreshToken` model in a dedicated migration PR.

---

## Milestone G — Verification

**Completed:** Yes

| Test | Result |
|------|--------|
| `npm run backend:build` | **PASS** |
| GET `/api/health` | **PASS** |
| GET `/api/categories` | **PASS** (7 rows) |
| POST `/api/auth/login` | **PASS** |
| GET `/api/auth/me` | **PASS** |
| Categories POST/PATCH/DELETE | **PASS** |
| POST `/api/videos` `{}` | **400** |
| POST `/api/uploads/presign` invalid bucket | **400** |
| GET `/api/squash/health` | **PASS** (scaffold) |

**Build:** PASS

**Remaining work:** Restart production deploy after merge; browser smoke unchanged (frontend not modified).

---

## Docs added

- `docs/API_ROUTE_MAP.md`
- `backend/README.md`
- `docs/PHASE4_COMPLETION_REPORT.md`
