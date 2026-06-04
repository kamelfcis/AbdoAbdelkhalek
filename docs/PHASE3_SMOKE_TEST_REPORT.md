# Phase 3 Smoke Test Report

**Date:** 2026-06-04  
**Environment:** Windows 10, Node/npm (CRA 5 + Express backend)  
**Backend:** `http://localhost:4000/api` (already running via `npm run backend:dev`)  
**Frontend build:** `npm run build` from repo root  
**Coach credentials:** `admin@gmail.com` / `12345678`

---

## Build Verification

| Test | Method | Result | Notes |
|------|--------|--------|-------|
| `npm run build` | CLI | **PASS** | Exit 0; compiled with ESLint warnings (unused imports in dashboard sections, `TraineeDashboardView`, `useDashboardPage`) |
| `npm run backend:build` | CLI (`tsc`) | **PASS** | Exit 0; no TypeScript errors |

---

## Public Routes / API

| Test | Method | Result | Notes |
|------|--------|--------|-------|
| GET `/api/health` | `Invoke-WebRequest` | **PASS** | `200` — `{"ok":true,"service":"abdelrhmanabdelkhalek-api"}` |
| GET `/api/categories` | curl-equivalent | **PASS** | `200` — JSON array returned |
| GET `/api/videos` | curl-equivalent | **PASS** | `200` |
| GET `/api/packages` | curl-equivalent | **PASS** | `200` |
| GET `/api/reviews` | curl-equivalent | **PASS** | `200` |
| GET `/api/success-stories` | curl-equivalent | **PASS** | `200` |
| GET `/api/faqs` | curl-equivalent | **PASS** | `200` |

---

## Authentication

| Test | Method | Result | Notes |
|------|--------|--------|-------|
| POST `/api/auth/login` (coach) | JSON body | **PASS** | `200`; `accessToken` length 243; `isCoach=true` |
| GET `/api/auth/me` with Bearer token | Header auth | **PASS** | `200`; `email=admin@gmail.com` |
| GET `/api/auth/me` without token | No header | **PASS** | `401` as expected |
| POST `/api/categories` without token | No header | **PASS** | `401` as expected |
| POST `/api/auth/refresh` without cookie | POST | **PASS** | `401` — `No refresh token` |
| POST `/api/auth/refresh` with login cookie | WebSession | **PASS** | `200`; new `accessToken` in body |
| Token refresh behavior | Code + API | **PASS** | Login sets `httpOnly` `refreshToken` cookie (7d); `/api/auth/refresh` issues new access JWT (15m); `/api/auth/logout` clears cookie (`backend/src/modules/auth/routes.ts`) |
| Trainee login (preset accounts) | POST login | **N/A** | `trainee@gmail.com`, `user@gmail.com` — invalid credentials |
| Trainee signup + login | POST signup/login | **PASS** | Dynamic account `smoke-trainee-*@test.local`; `isCoach=false` |

---

## Coach CRUD

| Test | Method | Result | Notes |
|------|--------|--------|-------|
| Categories POST/PATCH/DELETE | Coach JWT | **PASS** | Created `SmokeTest *`, patched name, deleted; full cycle OK |
| Videos POST route exists | Coach JWT, `{}` body | **PASS** | Route mounted; `500` on empty body (validation/DB), not `404` |
| Packages POST route exists | Coach JWT | **PASS** | Same — auth accepted, write fails on invalid payload |
| Reviews POST route exists | Coach JWT | **PASS** | Same |
| Success-stories POST route exists | Coach JWT | **PASS** | Same |
| FAQs POST route exists | Coach JWT | **PASS** | Same |
| CRUD routes in codebase | Grep `routes.ts` | **PASS** | All entities have POST/PATCH/DELETE + `requireAuth` + `requireCoach` |

---

## Trainee

| Test | Method | Result | Notes |
|------|--------|--------|-------|
| Trainee API login | Signup smoke account | **PASS** | `isCoach=false` |
| CoachRoute blocks trainee from `/dashboard` | Static review `CoachRoute.js` | **PASS** | Non-coach authenticated users → `Navigate` to `/` with EN/AR message |
| Trainee dashboard view file exists | `TraineeDashboardView.jsx` | **PARTIAL** | Component exists but renders empty `<>...</>`; not reachable today because `CoachRoute` wraps `/dashboard` (coach-only) |
| Trainee dashboard content | `TraineeDashboardContent.jsx` | **FAIL** (non-blocking) | Orphaned file with invalid export name (`TraineeDashboardContenc.t`) and broken JSX props; not imported — does not affect build |
| Trainee flow end-to-end | Browser | **MANUAL REQUIRED** | Login as trainee → expect redirect to `/` with welcome message (see Login.js) |

---

## Media / CDN

| Test | Method | Result | Notes |
|------|--------|--------|-------|
| Frontend hardcoded Supabase storage URLs | `rg supabase.co/storage` in `src/` | **PASS** | Only rewrite regex in `src/shared/lib/cdn.js` |
| Frontend uses `cdnUrl` / `toMediaUrl` | Grep `features/` | **PASS** | Landing + dashboard resolve via `shared/lib/cdn.js` |
| API sample URLs | GET `/reviews`, `/videos` | **PASS** | e.g. `https://pub-353c1e27968842789935db96cbbff77b.r2.dev/reviews/...`; 0 Supabase storage URLs in samples |
| Backend response rewrite | `cdn-urls.ts` middleware | **PASS** | `rewriteMediaUrls` applied on `res.json` |
| `REACT_APP_USE_CDN` | `.env.example` | **PASS** | Documented; dev uses R2 public URL via `REACT_APP_R2_PUBLIC_URL` / backend rewrite |

---

## Routing

| Test | Method | Result | Notes |
|------|--------|--------|-------|
| `/` → fitness home | `router.jsx` + `useDomain` | **PASS** | `DomainHome` → `FitnessHomePage` when not squash |
| `/login` | `router.jsx` | **PASS** | `Login` page |
| `/dashboard` → CoachRoute | `router.jsx` | **PASS** | Lazy `Dashboard` behind `CoachRoute` + `ErrorBoundary` |
| Squash scaffold | `useDomain` + `SquashHomePage` | **PASS** | Same `/` route; squash when `REACT_APP_DOMAIN=squash` or hostname `squash.*` |
| Squash local dev docs | `features/squash/README.md` | **PASS** | `127.0.0.1 squash.local` hosts or `REACT_APP_DOMAIN=squash` |
| Catch-all | `router.jsx` | **PASS** | `*` → redirect `/` |
| Landing section IDs (hash nav) | Grep `features/fitness/sections` | **PASS** | `home`, `categories`, `videos`, `packages`, `about-me`, `about`, `why-choose-me`, `success`, `reviews`, `faq`, `contact` |

---

## Frontend Static Analysis

| Test | Method | Result | Notes |
|------|--------|--------|-------|
| `pages/Dashboard.js` thin orchestrator | Read file | **PASS** | 4 lines — re-export from `features/dashboard/DashboardPage` |
| Imports resolve | `npm run build` | **PASS** | Build succeeded |
| Dashboard split structure | Directory listing | **PASS** | `features/dashboard/sections/`, `components/`, `hooks/useDashboardPage.js`, `context/` |
| `useMutation` for CRUD | Checklist item | **DEFERRED** | Still imperative handlers (Phase 3 polish item) |

---

## Browser Manual Checklist (not automated)

| Step | Expected result | Status |
|------|-----------------|--------|
| Open `http://localhost:3000/` | Fitness landing loads; hash links scroll (`#categories`, `#videos`, etc.) | **MANUAL REQUIRED** |
| Set `REACT_APP_DOMAIN=squash`, restart dev server, open `/` | Squash placeholder (navbar + hero + footer) | **MANUAL REQUIRED** |
| Coach login at `/login` → `/dashboard` | Coach CRUD sidebar; tables load | **MANUAL REQUIRED** |
| Trainee login (signup or existing account) | Redirect to `/` with welcome/auth message, not dashboard | **MANUAL REQUIRED** |
| AR/EN toggle on login + dashboard | Copy switches; RTL layout sane | **MANUAL REQUIRED** |
| Upload image in category modal | Saves; preview uses R2/CDN URL | **MANUAL REQUIRED** |
| Dark mode toggle on login/dashboard | Persists in localStorage | **MANUAL REQUIRED** |

---

## Summary: **PASS** (with manual browser follow-up)

**Automated gate:** Builds pass; all public GET endpoints pass; coach auth + refresh pass; protected routes return 401 without token; categories full CRUD cycle passes; API media URLs use R2; routing and folder structure match Phase 3 exit criteria.

**Partial / manual:** Browser UX smoke; trainee dashboard UI stubbed and unreachable by design (`CoachRoute`); orphaned corrupt `TraineeDashboardContent.jsx` should be fixed or removed in a hygiene pass.

**Phase 4 plan:** Created — see [PHASE4_IMPLEMENTATION_PLAN.md](./PHASE4_IMPLEMENTATION_PLAN.md).

---

## Blockers

None for starting Phase 4 backend refactor.

**Recommended fixes (non-blocking):**

1. Wire or delete `TraineeDashboardContent.jsx`; restore `TraineeDashboardView` when a trainee portal route is added.
2. Clean ESLint unused imports in dashboard section files.
3. Add Zod validation on write endpoints (returns 500 today on `{}` body) — planned in Phase 4.
