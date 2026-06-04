# Pre-Production Validation Plan

**Date:** 2026-06-04  
**Scope:** Phases 1–8 complete; validate before Phase 9 (production readiness).  
**Constraint:** No production deploy; no production data mutation except test accounts/uploads.

**Supabase project:** `ugscjqusyjttihnfhtuk`  
**Coach smoke account:** `admin@gmail.com` (password in env only — never in reports)

---

## Objectives

1. Prove critical user journeys via Playwright (gate for Phase 9).
2. Audit Fitness and Squash APIs + CDN URL policy.
3. Verify access control (fitness + squash) with automated smoke + curl.
4. Validate upload proxy and R2/CDN paths.
5. Validate new coach signup → JWT → dashboard CRUD (credentials redacted in docs).
6. Document backup/restore procedure without wiping production DB.
7. Produce executive readiness report with `READY_FOR_PHASE_9` decision.

---

## Environment requirements

| Service | URL | Notes |
|---------|-----|-------|
| Backend API | `http://localhost:4000` | `npm run backend:dev` or Playwright `webServer` |
| Frontend CRA | `http://localhost:3000` | `npm start`; squash landing needs `REACT_APP_DOMAIN=squash` |
| Database | Supabase Postgres | `DATABASE_URL` or REST fallback per `docs/DATA_LAYER.md` |
| CDN (dev) | `pub-*.r2.dev` | `cdn.abdelrhmanabdelkhalek.com` may not resolve pre-DNS |

**Env files:** Root `.env`, `backend/.env` — never copy secret values into reports.

---

## Tools

| Phase | Tools |
|-------|-------|
| A | Playwright (`npm run test:e2e`), `npx playwright install` |
| B–C | `curl`, code audit, `docs/API_ROUTE_MAP.md` |
| D | `npm run smoke:squash-access --workspace=backend`, curl access endpoints |
| E | `curl` multipart to `/api/uploads/proxy` |
| F | Signup API + login + category CRUD |
| G | `migration-toolkit` scripts, Prisma schema copy, `backups/` folder |
| All | `npm run build`, `npm run backend:build`, `npm run backend:test`, `npm test` |

---

## Phases A–G

### Phase A — Playwright full validation

- Install browsers if missing.
- Ensure backend `:4000` + frontend `:3000` (reuse running backend; Playwright starts frontend via `webServer` unless `PLAYWRIGHT_SKIP_WEBSERVER=1`).
- Run all E2E specs; extend coverage for video/package CRUD, squash access, logout if gaps exist.
- **Pass criteria:** 100% tests passed (no skipped tests counted as pass for gate).
- **Artifact:** `docs/playwright-report-summary.md`

### Phase B — Fitness complete QA

- Public GET smoke: categories, videos, packages, reviews, success-stories, faqs.
- Coach CRUD via API for all 6 content entities + subscriptions/trainees/stats.
- CDN audit: no `supabase.co/storage` in sample responses.
- Mobile/RTL: code review; manual verification noted.
- **Artifact:** `docs/testing/FITNESS_AUDIT.md`

### Phase C — Squash complete QA

- Public GET `/api/squash/*` (categories, videos, packages, reviews, success-stories, faqs, coaches, programs).
- Coach CRUD for squash dashboard entities.
- Domain switcher + `REACT_APP_DOMAIN=squash` theme (code + conditional E2E).
- **Artifact:** `docs/testing/SQUASH_AUDIT.md`

### Phase D — Access control QA

- Fitness + squash: grant/revoke video + category access.
- `npm run smoke:squash-access --workspace=backend`
- Fitness access curl; optional Supabase Management API SELECT for verification.
- **Artifact:** `docs/testing/ACCESS_MANAGEMENT_REPORT.md`

### Phase E — Upload + CDN QA

- `POST /api/uploads/proxy` with small image (coach auth).
- Fitness + squash bucket allowlist paths documented.
- CDN hostname status (`cdn.*` vs `pub-*.r2.dev`).
- **Artifact:** `docs/testing/CDN_UPLOAD_REPORT.md`

### Phase F — Admin user validation

- Create **new** coach via signup (strong random password — not in docs).
- Verify login, JWT, refresh cookie, dashboard, category CRUD.
- **Artifact:** `docs/ADMIN_VALIDATION_REPORT.md`

### Phase G — Full database backup

- `backups/` folder: schema reference, data export approach, Prisma schema copy, env checklist (no secrets).
- Restore procedure documented only (no live restore).
- **Artifact:** `docs/BACKUP_AND_RESTORE_REPORT.md`

---

## Final deliverables

| Document | When |
|----------|------|
| `docs/PRE_PRODUCTION_REPORT.md` | Always — executive summary |
| `docs/PHASE9_READINESS_REPORT.md` | Always — score /100, `READY_FOR_PHASE_9` |
| `docs/PHASE9_DEPLOYMENT_PLAN.md` | Only if `READY_FOR_PHASE_9=YES` |
| `PROJECT_CHECKLIST.md` | Update pre-production section |

---

## Pass criteria for Phase 9 gate

| Criterion | Required |
|-----------|----------|
| Playwright | 100% pass (all non-skipped) |
| Frontend + backend build | PASS |
| Backend unit tests | PASS (integration optional if no DB in CI) |
| Fitness public GETs | All 200 with valid JSON |
| Squash public GETs | All 200 |
| Access smoke (squash script + fitness curl) | PASS |
| Upload proxy | 200 with CDN/R2 URL in response |
| Admin signup flow | PASS (new user) |
| Backup documentation | Complete |
| No blocker severity defects | — |

**Score:** Weighted checklist in `PHASE9_READINESS_REPORT.md` (Playwright 25%, API/CRUD 25%, access 15%, CDN/upload 10%, admin 10%, backup 10%, builds/tests 5%).

---

## Execution log

Updates recorded in `docs/PRE_PRODUCTION_CHECKLIST.md` with `[ ]` / `[~]` / `[x]` per item. Items marked `[x]` only after verified command output or test run.
