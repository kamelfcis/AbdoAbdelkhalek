# Phase 6 Completion Report — Admin Dashboard Expansion

**Date:** 2026-06-04  
**Scope:** Milestones A–G (Phase 7 not started)

---

## Executive summary

Phase 6 delivers a **unified admin dashboard** for Fitness and Squash: URL-persisted domain switching, a **generic entity CRUD framework**, squash coach/program admin, squash trainee access APIs, and a **42-line** dashboard orchestrator (down from ~999 lines). **Frontend and backend builds pass.**

---

## Files created

| Path | Purpose |
|------|---------|
| `src/features/dashboard/domain/DomainContext.jsx` | Domain provider + URL `?domain=` |
| `src/features/dashboard/domain/useDashboardDomain.js` | Hook re-export |
| `src/features/dashboard/crud/*` | Generic CRUD (table, form, toolbar, hooks, configs) |
| `src/features/dashboard/hooks/useDashboardCore.js` | Nav, language, logout |
| `src/features/dashboard/hooks/useDashboardCoachQueries.js` | Coach query bundle |
| `src/features/dashboard/hooks/useDashboardVideoTools.js` | Video filters, preview, delete |
| `src/features/dashboard/hooks/useDashboardTraineeExperience.js` | Trainee dashboard state |
| `src/features/dashboard/hooks/useDashboardAccessModals.js` | Access + subscription handlers |
| `backend/prisma/migrations/20260604130000_squash_access/migration.sql` | Squash access tables |
| `docs/PHASE6_PROGRESS.md` | Milestone log |

---

## Files modified (high level)

- `useDashboardPage.js` — thin composer (42 lines)
- Section wrappers → `GenericEntitySection` (categories, packages, faqs, reviews, stories, coaches, programs)
- `entityRegistry.js` — squash trainees nav
- `createDomainContentService.ts` — access API methods
- `squash-writes.ts`, `squash/routes.ts`, `squash.service.ts` — squash access endpoints
- `CoachDashboardModals.jsx` — video + access modals only
- `TraineeAccessModal`, `VideoAccessModal`, `VideoFormModal` — domain-aware services
- `queryKeys.js` — `invalidateAccessCrud(domain)`
- `schema.prisma` — `SquashUserVideoAccess`, `SquashUserCategoryAccess`

---

## Architecture changes

```mermaid
flowchart LR
  URL["/dashboard?domain=squash"]
  DC[DomainContext]
  CRUD[GenericEntitySection]
  API["/api or /api/squash"]
  URL --> DC
  DC --> CRUD
  CRUD --> API
```

- **Domain** is the single switch for API prefix, nav registry, and theme (via existing `DomainSwitcher`).
- **Entity configs** drive columns, form fields, and service method names per domain.
- **Orchestrator** composes focused hooks instead of one monolithic state object.

---

## Verification

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run backend:build` | ✅ PASS |
| Routes `/`, `/login`, `/dashboard` | ✅ Unchanged |
| Fitness `/api/*` | ✅ Backward compatible |
| Squash `/api/squash/*` | ✅ CRUD + access routes added |
| Squash access tables on **`ugscjqusyjttihnfhtuk`** | ✅ Applied (`20260604130000_squash_access`) + PostgREST reload |
| Squash access API smoke (`admin@gmail.com`) | ✅ PASS — login, PUT/GET video access, PUT/GET trainee access |
| `useDashboardPage.js` line count | **42** (target &lt; 300) |

---

## Remaining debt

1. **Videos** — still use dedicated `VideosSection` / `VideoFormModal` (not fully config-driven).
2. **Squash access tables** — ✅ live on `ugscjqusyjttihnfhtuk` (Management API, 2026-06-04).
3. **Legacy form modals** — `CategoryFormModal`, etc. remain in repo for reference; unused by coach flow.
4. **Subscriptions** — fitness-only; squash trainees get access grants only.
5. **E2E smoke** — access API smoke passed; Playwright dashboard flows remain Phase 7.

---

## Phase 7 readiness score

| Area | Score | Notes |
|------|-------|-------|
| Dashboard maintainability | 9/10 | Generic CRUD + split hooks |
| Squash admin parity | 9/10 | Videos custom; access tables live |
| API stability | 9/10 | No breaking changes to fitness paths |
| Test coverage | 4/10 | Phase 7 scope |
| **Overall** | **8 / 10** | Ready to start Phase 7 testing |

---

## Phase 7

Do **not** start Phase 7 in this delivery. Next: integration tests for auth, fitness/squash CRUD, uploads, and Playwright dashboard flows.
