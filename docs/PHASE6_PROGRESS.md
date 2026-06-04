# Phase 6 Progress — Admin Dashboard Expansion

**Date:** 2026-06-04

---

## Milestone A — Domain Switcher ✅

**Completed**
- `src/features/dashboard/domain/DomainContext.jsx` — URL sync `?domain=fitness|squash`
- `src/features/dashboard/domain/useDashboardDomain.js` — re-export
- Legacy shim: `context/DashboardDomainContext.jsx`
- `DomainSwitcher` + `DashboardPage` wired to new provider

**Modified:** `DomainSwitcher.jsx`, `DashboardPage.jsx`, `useDashboardPage.js` (domain import path)

**Checklist:** Domain switcher items → [x] after build

**Build:** Frontend PASS | Backend PASS (post-milestone batch)

**Remaining:** None for A

---

## Milestone B — Generic CRUD Framework ✅

**Completed**
- `crud/EntityTable.jsx`, `EntityFormModal.jsx`, `EntityToolbar.jsx`, `EntityDeleteDialog.jsx`
- `crud/useEntityCrud.js`, `crud/entityConfigs.js`, `crud/GenericEntitySection.jsx`
- Categories verified via `CategoriesSection` → `GenericEntitySection`

**Checklist:** Generic CRUD framework items → [x]

**Build:** PASS

**Remaining:** Video entity config (custom section retained)

---

## Milestone C — Fitness Migration ✅

**Completed (generic CRUD)**
- Categories, Packages, FAQs, Reviews, Success Stories

**Retained (custom UI)**
- Videos — `VideosSection` + `VideoFormModal` (domain-aware)

**Checklist:** Fitness generic migration → [x] (videos partial — see debt)

**Build:** PASS

---

## Milestone D — Squash Migration ✅

**Completed**
- Shared sections use `getContentService('squash')` via domain context
- Coaches + Programs via `GenericEntitySection`
- Trainees nav added for squash access management

**Build:** PASS

---

## Milestone E — Access Management ✅

**Completed**
- `createDomainContentService` — trainee/video access methods
- Backend: `/api/squash/videos/:id/access`, `/api/squash/access/trainee/:userId`
- Prisma models + migration SQL `20260604130000_squash_access`
- `TraineeAccessModal` / `VideoAccessModal` — `domain` prop + `getContentService`
- `invalidateAccessCrud(queryClient, domain)`

**Build:** PASS

**DB migration (2026-06-04):** `squash_user_video_access` + `squash_user_category_access` applied on **`ugscjqusyjttihnfhtuk`** via Management API + `NOTIFY pgrst, 'reload schema'`. Smoke: `node backend/scripts/smoke-squash-access.mjs` — ALL PASS.

---

## Milestone F — Dashboard Optimization ✅

**Completed**
- `useDashboardPage.js` — **42 lines** (orchestrator)
- Extracted: `useDashboardCore`, `useDashboardCoachQueries`, `useDashboardVideoTools`, `useDashboardTraineeExperience`, `useDashboardAccessModals`
- Removed duplicate modals from `CoachDashboardModals` (generic CRUD owns forms)

**Build:** PASS

---

## Milestone G — Completion Report

See [PHASE6_COMPLETION_REPORT.md](./PHASE6_COMPLETION_REPORT.md)

**Final builds:** Frontend PASS | Backend PASS
