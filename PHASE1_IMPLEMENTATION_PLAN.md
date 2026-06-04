# Phase 1 Implementation Plan

**Scope:** Architecture Cleanup (2–3 weeks)  
**This document:** Full Phase 1 file map (Priorities A–D).  
**Status:** **Phase 1 complete** (2026-06-04) — all priorities A–D implemented and verified.

Progress detail: [docs/progress/PHASE1_PROGRESS.md](./docs/progress/PHASE1_PROGRESS.md)

---

## Priority A — TanStack Query (THIS RUN)

### Audit summary (pre-implementation)

| Hook file | Query key (actual) | Dashboard.js invalidates (wrong) |
|-----------|-------------------|----------------------------------|
| `useCategories.js` | `['categories']` | — |
| `useDashboardCategories.js` | `['dashboard', 'categories']` | `['dashboardCategories']` |
| `useVideos.js` | `['videos']` | — |
| `useDashboardVideos.js` | `['dashboard', 'videos']` | `['dashboardVideos']` |
| `usePackages.js` | `['packages']` | — |
| `useDashboardPackages.js` | `['dashboard', 'packages']` | `['dashboardPackages']` |
| `useReviews.js` | `['reviews']` | — |
| `useDashboardReviews.js` | `['dashboard', 'reviews']` | `['dashboardReviews']` |
| `useSuccessStories.js` | `['success_stories']` | — |
| `useDashboardSuccessStories.js` | `['dashboard', 'success_stories']` | `['dashboardSuccessStories']` |
| `useFAQs.js` | `['faqs']` | — |
| `useDashboardFAQs.js` | `['dashboard', 'faqs']` | `['dashboardFAQs']` |
| `useDashboardStats.js` | `['dashboard', 'stats']` | `['dashboardStats']` |
| `useRecentActivities` | `['recentActivities', language]` | `['recentActivities']` (prefix OK) |
| `useTrainees.js` | `['trainees']` | `['trainees']` ✓ |
| `useSubscriptions.js` | `['subscriptions']` | `['subscriptions']` ✓ |
| `useTraineeVideos.js` | `['trainee', 'videos']` | not invalidated on access change |

**Root cause:** Hooks use hierarchical keys (`['dashboard', 'entity']`); `Dashboard.js` uses legacy flat camelCase keys (`dashboardCategories`, etc.) that never match cached queries → CRUD does not refresh lists.

**Dashboard modals:** No direct `invalidateQueries` in `src/pages/dashboard/*` — all invalidation is in `Dashboard.js` `onSaved` / delete handlers.

### Canonical key convention

```
Public (landing):     ['categories'] | ['videos'] | ['packages'] | ['reviews']
                      | ['success_stories'] | ['faqs']

Dashboard (coach):    ['dashboard', 'categories'] | ['dashboard', 'videos'] | ...

Dashboard meta:       ['dashboard', 'stats']
Activity feed:        ['recentActivities', language]

Trainees/access:      ['trainees'] | ['subscriptions'] | ['trainee', 'videos']

Prefix invalidation:  ['dashboard'] → all dashboard queries
                      ['recentActivities'] → all language variants
```

### Files to create

| File | Why |
|------|-----|
| `src/lib/queryKeys.js` | Single registry for query keys + shared invalidation helpers |

### Files to modify

| File | Why |
|------|-----|
| `src/hooks/useCategories.js` | Use `queryKeys.categories()` |
| `src/hooks/useDashboardCategories.js` | Use `queryKeys.dashboard.categories()` |
| `src/hooks/useVideos.js` | Use `queryKeys.videos()` |
| `src/hooks/useDashboardVideos.js` | Use `queryKeys.dashboard.videos()` |
| `src/hooks/usePackages.js` | Use `queryKeys.packages()` |
| `src/hooks/useDashboardPackages.js` | Use `queryKeys.dashboard.packages()` |
| `src/hooks/useReviews.js` | Use `queryKeys.reviews()` |
| `src/hooks/useDashboardReviews.js` | Use `queryKeys.dashboard.reviews()` |
| `src/hooks/useSuccessStories.js` | Use `queryKeys.successStories()` |
| `src/hooks/useDashboardSuccessStories.js` | Use `queryKeys.dashboard.successStories()` |
| `src/hooks/useFAQs.js` | Use `queryKeys.faqs()` |
| `src/hooks/useDashboardFAQs.js` | Use `queryKeys.dashboard.faqs()` |
| `src/hooks/useDashboardStats.js` | Use `queryKeys.dashboard.stats()` + `queryKeys.recentActivities()` |
| `src/hooks/useTrainees.js` | Use `queryKeys.trainees()` |
| `src/hooks/useSubscriptions.js` | Use `queryKeys.subscriptions()` |
| `src/hooks/useTraineeVideos.js` | Use `queryKeys.trainee.videos()` |
| `src/pages/Dashboard.js` | Replace all ad-hoc keys with `queryKeys` + helpers |
| `src/components/Packages.js` | Use `queryKeys.packages()` for invalidation |
| `PROJECT_CHECKLIST.md` | Mark Priority A items complete after verification |
| `docs/progress/PHASE1_PROGRESS.md` | Track milestone status |

---

## Priority B — Auth & Route Guards (THIS RUN — complete)

| File | Why |
|------|-----|
| `src/contexts/AuthContext.js` (new) | Central auth state: user, isCoach, login, logout, refreshUser |
| `src/components/ProtectedRoute.js` (new) | Redirect unauthenticated users to `/login` |
| `src/components/CoachRoute.js` (new) | Redirect non-coaches away from dashboard |
| `src/components/RouteGuardLoader.js` (new) | Shared loading UI while auth resolves (prevents route flash) |
| `src/App.js` | Wrap with `AuthProvider`; protect `/dashboard` with `CoachRoute` |
| `src/pages/Dashboard.js` | Remove duplicate mount-time auth checks; use `useAuth()` |
| `src/pages/Login.js` | Use AuthContext login; fix trainee redirect journey |
| `src/services/apiClient.js` | 401 refresh notifies AuthContext via `setAuthTokenChangeHandler` |
| `src/hooks/useAuthQuery.js` | Gate dashboard queries on AuthContext instead of raw token |

**Note:** Plan originally listed `.jsx` route files; implementation uses `.js` to match existing codebase conventions.

---

## Priority C — Database & Data Layer (NOT THIS RUN)

| File | Why |
|------|-----|
| `backend/src/lib/prisma.ts` | Document/fix pooler connection behavior |
| `backend/src/lib/supabase-data.ts` | Align REST fallback column names (faqs, packages) |
| `backend/src/modules/auth/routes.ts` | Add REST fallback for signup |
| `backend/src/modules/content/routes.ts` | Verify dual-path responses |
| `docs/DATA_LAYER.md` (new) | Document Prisma + REST fallback strategy |
| `README.md` | Database setup and troubleshooting |
| `.env.example`, `backend/.env.example` | Connection string documentation |

---

## Priority D — Security & Repo Hygiene (COMPLETE)

| File | Change |
|------|--------|
| `backend/src/config/env.ts` | Require JWT secrets in production |
| `backend/src/lib/auth-data.ts` | Reject plaintext passwords in `createUser()` |
| `docs/SECURITY.md` | Password migration + env audit |
| `.gitignore` | `backend/dist/` (already present) |
| `README.md` | Update stack, remove stale supabase.js references |
| `src/config/supabase.js` | Already absent (orphan removed earlier) |
| `docs/archive/` | `PERFORMANCE_*.md` archived |

---

## Verification (Phase 1 exit)

- [x] `npm run build` (frontend) passes
- [x] `npm run backend:build` (backend workspace) passes
- [x] All hook keys match `queryKeys` registry
- [x] All `Dashboard.js` invalidations use canonical keys
- [x] No remaining `dashboardCategories`-style keys in codebase
- [ ] Manual: one dashboard CRUD refresh without page reload (recommended before Phase 2)

---

*Created: Phase 1 kickoff — Priority A implementation.*
