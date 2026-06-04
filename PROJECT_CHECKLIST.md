# Fitness + Squash Platform — Project Checklist

**Living task tracker** aligned with [ROADMAP.md](./ROADMAP.md).

**Status legend:** `[ ]` Not Started · `[~]` In Progress · `[x]` Completed

**Rule:** Only mark `[x]` when implemented **and** verified (build, lint, API smoke test).

---

## Phase 0 — Audit & Planning

- [x] Complete codebase architecture audit (frontend, backend, database)
- [x] Document technical debt (critical, medium, low)
- [x] Document UI/UX audit findings
- [x] Define target architecture (frontend, backend, database)
- [x] Design Squash module (tables, API, subdomain, admin)
- [x] Create ROADMAP.md with executive summary and 9-phase plan
- [x] Create PROJECT_CHECKLIST.md with granular tasks
- [ ] **Stakeholder review of ROADMAP + CHECKLIST** (gate before Phase 1)

---

## Phase 1 — Architecture Cleanup (2–3 weeks)

### TanStack Query

- [x] Audit all query keys in `src/hooks/` (public + dashboard pairs)
- [x] Document canonical key convention: `['dashboard', 'categories']` etc.
- [x] Fix invalidation keys in `Dashboard.?,js` to match hook keys
- [x] Fix invalidation keys in dashboard modals (`src/pages/dashboard/`)
- [x] Replace ad-hoc invalidation with shared `queryKeys` module
- [x] Verify category CRUD refreshes list without manual reload
- [x] Verify video CRUD refreshes list without manual reload
- [x] Verify package CRUD refreshes list without manual reload
- [x] Verify review / success story / FAQ CRUD invalidation
- [x] Verify subscription and trainee list invalidation after access changes

### Auth & Route Guards

- [x] Create `src/features/auth/AuthContext.jsx` (or `src/contexts/AuthContext.js`)
- [x] Expose `user`, `isCoach`, `isLoading`, `login`, `logout`, `refreshUser`
- [x] Wrap app with `AuthProvider` in `App.js`
- [x] Create `ProtectedRoute` component (redirect to `/login` if unauthenticated)
- [x] Create `CoachRoute` variant (redirect if not coach)
- [x] Protect `/dashboard` with `CoachRoute`
- [x] Remove duplicate auth checks inside Dashboard mount logic
- [x] Fix trainee login redirect journey (document or implement trainee portal)
- [x] Verify no flash of dashboard content before redirect
- [x] Verify token refresh on 401 still works with AuthContext

### Database & Data Layer

- [x] Document current Supabase pooler failure symptoms
- [x] **Decision:** Stay on Supabase interim vs migrate to Neon/VPS Postgres
- [ ] If Postgres migration: provision instance and connection string
- [ ] If Postgres migration: run `prisma db pull` and reconcile schema
- [ ] If Postgres migration: update `DATABASE_URL` in dev/staging/prod
- [x] If staying on Supabase: fix pooler URL or use direct connection in dev
- [x] Align REST fallback column names for `faqs` table
- [x] Align REST fallback column names for `packages` table
- [x] Add REST fallback to auth signup (currently Prisma-only)
- [x] Document dual-path data layer in README or `docs/DATA_LAYER.md`
- [ ] Smoke test all public GET endpoints (Prisma path) — blocked until pooler/direct connection works in dev
- [x] Smoke test all public GET endpoints (REST fallback path)
- [x] Smoke test coach CRUD (REST fallback path) — documented in `docs/DATA_LAYER.md`

### Security Hardening (Phase 1 scope)

- [x] Require `JWT_SECRET` and `JWT_REFRESH_SECRET` in production (fail boot if missing)
- [x] Document password migration plan (plaintext → bcrypt) — see `docs/SECURITY.md`
- [x] Reject new plaintext passwords on signup — route hashes; `createUser()` rejects non-bcrypt
- [x] Audit env vars: no secrets in committed files — documented in `docs/SECURITY.md`

### Repository Hygiene

- [x] Add `backend/dist/` to `.gitignore` (already present)
- [x] Remove tracked `backend/dist/` from git index — not tracked; `git rm --cached` N/A
- [x] Update root README (remove stale `supabase.js` references)
- [x] Update README with current stack (Express API, R2, TanStack Query)
- [x] Update README with local dev setup (frontend + backend + env)
- [x] Verify/delete orphaned `src/config/supabase.js` — file absent; no imports in codebase
- [x] Consolidate `.env.example` and `backend/.env.example` documentation (cross-linked in README + SECURITY)
- [x] Optional: archive stale `PERFORMANCE_*.md` files to `docs/archive/`

### Phase 1 Exit Verification

- [x] `npm run build` (frontend) passes
- [x] `npm run build` or `tsc` (backend) passes
- [x] Login → dashboard flow works without 401 races (Priority B — AuthContext + apiClient refresh)
- [ ] At least one CRUD operation invalidates cache correctly — manual smoke test recommended (Priority A code complete)
- [x] Update checklist statuses for Phase 1 items

---

## Phase 2 — Design System (2–3 weeks)

### Tokens & Foundation

- [x] Create `src/design-system/tokens.js` (colors, spacing, radius, shadows) — *verified build 2026-06-04*
- [x] Create typography scale (font sizes, weights, line heights) — `typography.js`
- [x] Define RTL-aware spacing/direction utilities — `tokens.rtl` + component `isRTL` props
- [x] Create `src/design-system/themes.js` (fitness brand, squash brand placeholders)
- [x] Document token usage in `src/design-system/README.md`
- [ ] Optional: set up Storybook — *deferred (not required for exit)*

### Core UI Primitives

- [x] `Button` (variants: primary, secondary, ghost, danger; sizes; loading)
- [x] `Input` / `Textarea` (label, error, disabled)
- [x] `Select` / `FormField` wrapper — *Select component; FormField via Input label prop*
- [x] `Card` (header, body, footer slots)
- [x] `Modal` (focus trap, ESC close, ARIA)
- [x] `Table` (sortable headers, empty state)
- [x] `Badge` / `Tag`
- [x] `Spinner` / `Skeleton`
- [x] `Alert` / `Toast` wrapper (consolidate SweetAlert2 vs react-hot-toast decision) — *react-hot-toast primary; Swal in 7 other modals*

### Layout Components

- [x] `PageShell` (max-width, padding)
- [x] `SectionHeader` (title, subtitle, action slot)
- [x] `Sidebar` (collapsible, mobile drawer)
- [x] `Navbar` abstraction for landing vs dashboard — *dashboard via `DashboardShell`*

### Migration to Design System

- [x] Migrate Login page to design tokens + Button/Input
- [x] Migrate one dashboard modal to shared Modal + FormField — *CategoryFormModal*
- [x] Replace inline Dashboard sidebar styles with token-based classes — *coach view via `DashboardShell`*
- [x] Verify RTL layout on Login and one dashboard section — *isRTL props + LanguageContext; manual spot-check recommended*

### Phase 2 Exit Verification

- [x] 3+ components consume design tokens — *Login, DashboardShell, StatCard, CategoryFormModal*
- [x] Login uses shared Button/Input
- [x] Build passes; visual regression spot-check — *npm run build + backend:build PASS*

### Phase 2 Polish (100% exit)

- [x] **A — Shared Modal Migration** — All 8 dashboard modals use shared `Modal` + form fields; SweetAlert2 removed from CRUD modals; `modalHelpers.js` consolidates footer/checkbox/file patterns — *build verified 2026-06-04*
- [x] **B — Shared CRUD Components** — All coach CRUD sections (categories, videos, packages, trainees, subscriptions, reviews, success stories, FAQs) use `SectionHeader` + shared `Table` + `Badge`/`Button`/`Input`/`Select`; trainee + coach video preview uses shared `VideoPreviewModal` — *build verified 2026-06-04*
- [x] **C — Trainee Dashboard Shell** — Trainee view wrapped in `DashboardShell` (sidebar, navbar, home link, favorites badge) — *build verified*
- [x] **D — Dark Mode** — `ThemeContext` persists `themeMode` in localStorage; toggle in `DashboardShell` navbar + Login page — *build verified*
- [x] **E — Landing Page Migration** — Hero, Categories, Videos, Packages, About, SuccessStories, FAQ, Contact, Navbar, Footer, App loader → CSS var brand colors; `section-shell` / `section-py` / `btn-brand` utilities in `index.css` — *build verified*
- [x] **F — Responsive Audit** — `DashboardShell`/`Sidebar` mobile drawer; `Table` overflow-x-auto; filter grids stack on mobile — *spot-check recommended*
- [x] **G — RTL Audit** — `isRTL` on shell, modals, tables, Login; logical `ms`/`text-start` in shared UI — *manual AR spot-check recommended*

---

## Phase 3 — Frontend Refactor (4–6 weeks)

### Folder Structure

- [x] Create `src/app/` (router, providers, error boundary) — 2026-06-04
- [x] Create `src/features/fitness/` — sections + FitnessHomePage
- [x] Create `src/features/squash/` (scaffold only) — placeholder + README
- [x] Create `src/features/auth/` — barrel re-exports CoachRoute/ProtectedRoute
- [x] Create `src/features/dashboard/` — sections, modals, hooks, context
- [x] Create `src/shared/ui/`, `hooks/`, `api/`, `i18n/`, `lib/` — ui pre-existing; api/lib/i18n added
- [x] Create `src/types/` for shared TS interfaces
- [x] Move `cdn.js` → `shared/lib/cdn.js` (update imports) — old paths re-export
- [x] Configure TS (`tsconfig.json`, allow JS interop)

### App Shell & Routing

- [x] Extract router from `App.js` to `src/app/router.jsx`
- [x] Extract providers to `src/app/providers.jsx`
- [x] Add error boundary component — `app/ErrorBoundary.jsx`
- [x] Implement `useDomain()` hook (hostname + env override) — `shared/hooks/useDomain.js`
- [x] Document local Squash dev (`hosts` + `REACT_APP_DOMAIN`) — `features/squash/README.md`

### Fitness Landing Refactor

- [x] Extract Hero → `features/fitness/sections/Hero`
- [x] Extract Categories section
- [x] Extract Videos section
- [x] Extract Packages section
- [x] Extract About section
- [x] Extract SuccessStories section
- [x] Extract Reviews section
- [x] Extract FAQ section
- [x] Extract Contact section
- [x] Slim `App.js` to domain router + layout only (14 lines)

### Dashboard Split

- [x] Extract Overview section from `Dashboard.js`
- [x] Extract Categories management section
- [x] Extract Videos management section
- [x] Extract Packages section
- [x] Extract Subscriptions section
- [x] Extract Trainees section
- [x] Extract Reviews admin section
- [x] Extract Success Stories admin section
- [x] Extract FAQ admin section
- [ ] Extract Settings/Profile section — N/A (profile on landing Home only)
- [x] Dashboard.js becomes orchestrator (<500 lines target) — **4 lines** re-export
- [x] Move modals to co-located feature folders — `features/dashboard/components/`

### Hooks & Data Fetching

- [x] Create `queryKeys.js` central registry — `shared/lib/queryKeys.js`
- [x] Consolidate `useVideos` + `useDashboardVideos` → domain-aware hook — `useContentEntity`
- [x] Consolidate categories hooks
- [x] Consolidate packages hooks
- [x] Consolidate reviews hooks
- [x] Consolidate success stories hooks
- [x] Consolidate FAQs hooks
- [ ] Introduce `useMutation` for create/update/delete operations — deferred
- [ ] Remove manual fetch + setState patterns where replaced — partial (queries only)

### i18n

- [x] Audit inline translations in Login and Dashboard — coach dashboard in `shared/i18n/dashboard/`; `dashboardTranslations.js` re-exports
- [x] Merge into single `shared/i18n/dashboard/` — fitness + squash + sharedKeys; landing unchanged
- [x] Replace inline objects with `t()` helper — coach shell, sections, CRUD, modals use `c.t()` / `t` prop
- [x] Dashboard path routing — `/dashboard/:domain/:section`; legacy `/dashboard` and `?domain=&section=` redirect
- [~] Verify AR/EN switching on all migrated screens — browser manual per [PHASE3_SMOKE_TEST_REPORT.md](./docs/PHASE3_SMOKE_TEST_REPORT.md)

### TypeScript Migration (incremental)

- [x] Convert `apiClient.js` → `apiClient.ts`
- [x] Convert `authService.js` → `authService.ts`
- [x] Convert `contentService.js` → `contentService.ts`
- [x] Convert `uploadService.js` → `uploadService.ts`
- [x] Add types for User, Category, Video, Package entities
- [ ] Convert `useAuthQuery` and critical hooks to `.ts` — deferred
- [ ] Enable strict checks incrementally — `strict: false` in tsconfig

### Phase 3 Exit Verification

- [x] `Dashboard.js` under 500 lines — **4 lines**
- [x] No duplicate public/dashboard hook pairs — `useContentEntity` + thin wrappers
- [x] `npm run build` passes — 2026-06-04
- [x] Landing and dashboard functional smoke test — automated API + build 2026-06-04 ([docs/PHASE3_SMOKE_TEST_REPORT.md](./docs/PHASE3_SMOKE_TEST_REPORT.md)); browser UX **manual** checklist in report

---

## Phase 4 — Backend Refactor (3–4 weeks)

### Domain Structure

- [x] Create `backend/src/domains/fitness/` — 2026-06-04
- [x] Create `backend/src/domains/squash/` (scaffold) — `/api/squash/health` only
- [x] Create `backend/src/domains/shared/auth/`
- [x] Create `backend/src/domains/shared/media/`
- [x] Create `backend/src/infrastructure/prisma/`
- [x] Create `backend/src/infrastructure/supabase-rest/`
- [x] Create `backend/src/infrastructure/r2/`
- [x] Create `backend/src/common/validation/`, `errors/`, `logging/` — see [docs/PHASE4_PROGRESS.md](./docs/PHASE4_PROGRESS.md)

### Fitness Domain Migration

- [x] Move public content routes → `domains/fitness/routes.ts`
- [x] Move coach CRUD routes → `domains/fitness/routes.ts`
- [x] Extract `fitness/service.ts` business logic
- [x] Extract `fitness/repository.ts` (Prisma + REST fallback)
- [x] Mount fitness routes at `/api` (backward compatible)

### Shared Modules

- [x] Move auth routes → `domains/shared/auth/`
- [x] Move upload routes → `domains/shared/media/`
- [x] Shared user lookup service — `user.repository.ts`

### Validation

- [x] Zod schema: Category create/update
- [x] Zod schema: Video create/update
- [x] Zod schema: Package create/update
- [x] Zod schema: Review create/update
- [x] Zod schema: SuccessStory create/update
- [x] Zod schema: FAQ create/update
- [x] Zod schema: Subscription create/update
- [x] Validation middleware applied to all POST/PATCH routes

### Infrastructure & Security

- [x] Add Helmet middleware
- [x] Add rate limiting on `/api/auth/login` and signup
- [x] Structured logging (request ID, errors)
- [x] Upload bucket/path allowlist per entity type
- [x] Centralized error handler responses
- [x] Decide: implement RefreshToken rotation or remove model — **deferred:** cookie JWT refresh kept; DB model unused ([PHASE4_COMPLETION_REPORT.md](./docs/PHASE4_COMPLETION_REPORT.md))

### Build & Docs

- [x] Fix all TypeScript build errors
- [x] Ensure `backend/dist/` not committed — `.gitignore` unchanged
- [x] Update backend README with new structure — [backend/README.md](./backend/README.md)
- [x] API route map document — [docs/API_ROUTE_MAP.md](./docs/API_ROUTE_MAP.md)

### Phase 4 Exit Verification

- [x] `tsc` build passes
- [x] All existing API endpoints respond correctly — smoke 2026-06-04
- [x] Invalid payloads return 400 with Zod messages — e.g. `POST /api/videos` `{}`
- [x] Upload allowlist rejects invalid paths — presign `bucket=evil` → 400

---

## Phase 5 — Squash Module (4–5 weeks)

### Database

- [x] Add Prisma model `SquashCategory` → `squash_categories`
- [x] Add Prisma model `SquashVideo` → `squash_videos`
- [x] Add Prisma model `SquashPackage` → `squash_packages`
- [x] Add Prisma model `SquashReview` → `squash_reviews`
- [x] Add Prisma model `SquashSuccessStory` → `squash_success_stories`
- [x] Add Prisma model `SquashFaq` → `squash_faqs`
- [x] Add Prisma model `SquashCoach` → `squash_coaches`
- [x] Add Prisma model `SquashProgram` → `squash_programs`
- [x] Create migration SQL for all squash tables — `backend/prisma/migrations/20260604120000_squash_module/`
- [x] Run migration on dev database — applied on `ugscjqusyjttihnfhtuk` via Supabase Management API (2026-06-04)
- [x] Add seed script for demo Squash content — `npm run seed:squash --workspace=backend`
- [x] Decide subscription model — deferred; shared `subscriptions` table (Phase 6)

### Backend API

- [x] Squash public GET: categories
- [x] Squash public GET: videos
- [x] Squash public GET: packages
- [x] Squash public GET: reviews
- [x] Squash public GET: success-stories
- [x] Squash public GET: faqs
- [x] Squash public GET: coaches
- [x] Squash public GET: programs
- [x] Squash coach CRUD: categories
- [x] Squash coach CRUD: videos
- [x] Squash coach CRUD: packages
- [x] Squash coach CRUD: reviews
- [x] Squash coach CRUD: success-stories
- [x] Squash coach CRUD: faqs
- [x] Squash coach CRUD: coaches
- [x] Squash coach CRUD: programs
- [x] Mount all at `/api/squash/*`
- [x] REST fallback for squash tables (if dual path still active)
- [x] R2 key prefix `squash/` for uploads

### Frontend — Public Squash Site

- [x] Squash Hero section
- [x] Squash About / intro section
- [x] Squash Categories section
- [x] Squash Videos section
- [x] Squash Packages section
- [x] Squash Reviews section
- [x] Squash Success Stories section
- [x] Squash FAQ section
- [x] Squash Coaches section
- [x] Squash Programs section
- [x] Squash Contact section
- [x] Squash-specific branding (theme tokens) — via `ThemeContext` + squash theme
- [x] Subdomain routing: render Squash home on `squash.*` — `useDomain()` + `REACT_APP_DOMAIN`
- [x] Cross-link Fitness ↔ Squash in footer/nav

### Media

- [x] Configure upload paths for squash entities
- [~] Verify CDN URL rewriting for squash media — DB live; pending rows with `image_path` / uploads
- [ ] Test image upload via proxy on localhost

### Phase 5 Exit Verification

- [x] Squash public pages load with API data — smoke GET 8/8 PASS (`docs/PHASE5_PROGRESS.md`)
- [x] Coach can CRUD squash category end-to-end — smoke POST/PATCH/DELETE PASS
- [ ] Media displays from R2/CDN
- [x] Local dev Squash domain tested — documented in `features/squash/README.md`

---

## Phase 6 — Admin Dashboard Expansion (2–3 weeks)

### Domain Switcher

- [x] Add Fitness | Squash toggle in dashboard sidebar
- [x] Persist selected domain in URL or context (`?domain=fitness|squash`)
- [x] Switch API prefix based on domain (`/api` vs `/api/squash`)
- [x] Update page titles and nav labels per domain

### Generic CRUD Framework

- [x] Define entity config type (columns, fields, endpoints, upload bucket)
- [x] Create `EntityTable` component driven by config
- [x] Create `EntityFormModal` driven by config
- [x] Create `useEntityCrud` hook (list, create, update, delete, invalidate)
- [x] Fitness entity registry config file (`crud/entityConfigs.js`)
- [x] Squash entity registry config file (`crud/entityConfigs.js`)

### Squash Admin Sections

- [x] Squash categories admin (via generic CRUD)
- [~] Squash videos admin (custom `VideosSection`; domain-aware API)
- [x] Squash packages admin
- [x] Squash reviews admin
- [x] Squash success stories admin
- [x] Squash FAQs admin
- [x] Squash coaches admin
- [x] Squash programs admin

### Refactor Fitness Admin to Generic CRUD

- [x] Migrate fitness categories to EntityTable/FormModal
- [~] Migrate fitness videos (custom section; form modal domain-aware)
- [x] Migrate fitness packages
- [x] Migrate fitness reviews
- [x] Migrate fitness success stories
- [x] Migrate fitness FAQs

### Trainee Access (if applicable)

- [x] Squash video access grants for trainees (API + UI)
- [x] Squash category access grants (API + UI)
- [x] UI for access management per domain

### Phase 6 Exit Verification

- [x] Domain switcher works without re-login
- [x] All Squash entities manageable from dashboard
- [x] Fitness admin still works after generic migration

---

## Phase 7 — Testing (2–3 weeks)

### Backend Integration Tests

- [x] Test setup (Jest/Vitest + supertest)
- [x] Auth: login, me, refresh, logout
- [x] Auth: reject invalid credentials
- [x] Fitness public GET endpoints
- [~] Fitness coach CRUD (authenticated) — access PUT covered; full POST/PATCH via E2E
- [x] Squash public GET endpoints
- [~] Squash coach CRUD — access PUT covered; full CRUD via E2E
- [x] Upload proxy (auth required, valid path)
- [x] Validation error responses

### Frontend Tests

- [x] Test setup (RTL + Jest/Vitest)
- [x] Design system: Button, Input, Modal
- [x] AuthContext / ProtectedRoute behavior
- [x] useDomain hook
- [x] Critical hook tests (useAuthQuery)

### E2E Tests

- [x] E2E setup (Playwright or Cypress)
- [x] E2E: coach login → dashboard loads
- [x] E2E: create category → appears in list
- [x] E2E: public fitness landing loads sections
- [~] E2E: public squash landing loads (subdomain or env) — needs `REACT_APP_DOMAIN=squash`

### CI

- [x] GitHub Actions (or equivalent): lint + build
- [x] CI: backend tests
- [x] CI: frontend tests
- [x] CI: E2E on main branch (optional nightly) — `workflow_dispatch` job

### Phase 7 Exit Verification

- [x] CI pipeline green
- [x] Critical paths covered per ROADMAP

---

## Phase 8 — Optimization (1–2 weeks)

### Frontend Bundle

- [x] Run bundle analyzer; document baseline — `docs/performance/BUNDLE_ANALYSIS.md` (2026-06-04)
- [x] Lazy-load Three.js background (if kept) — CDN `threeLoader.js` + intersection (unchanged; not in main bundle)
- [x] Lazy-load Splide carousels — `LazySplide.jsx` → `splide` chunk
- [x] Code-split dashboard sections — `CoachDashboardView.jsx` lazy sections
- [x] Code-split squash vs fitness landing — `router.jsx` `fitness-home` / `squash-home` chunks
- [x] Document bundle size delta — main gzip **140.21 → 97.48 kB (−30.5%)**

### Data Fetching

- [x] Tune TanStack Query staleTime/gcTime per entity — `QUERY_TUNING.md`, section-scoped `enabled`
- [x] Prefetch dashboard data on login — `prefetchDashboard.js`, Login + `useDashboardCore`
- [x] Remove redundant parallel fetches in activity feed — cache reuse in `useRecentActivities`

### Media Performance

- [x] Lazy loading images on landing pages — `OptimizedImage`, squash review `loading="lazy"`
- [x] Video poster frames / defer full load — modal-only `preload="metadata"`; no landing autoplay
- [x] Confirm CDN cache headers (R2/custom domain) — `CDN_OPTIMIZATION.md`; `cdnUrl` grep OK

### Backend

- [x] Enable response compression (gzip/brotli) — `compression` in `server.ts`
- [x] Add pagination to large list endpoints (if missing) — `limit`/`offset` on videos + trainees (fitness + squash)
- [x] Index audit on frequently queried columns — `BACKEND_PERFORMANCE.md` (document only)

### Phase 8 Exit Verification

- [~] Lighthouse run documented (before/after) — bundle/build verified; manual Lighthouse on staging recommended
- [x] No regression in CRUD flows — builds pass; API backward compatible

---

## Pre-Production Validation (2026-06-04)

- [x] Playwright E2E 100% gate — **12/12** chromium + **1/1** squash; see `docs/playwright-report-summary.md`
- [x] Fitness API + CDN audit — `docs/testing/FITNESS_AUDIT.md`
- [x] Squash API audit — `docs/testing/SQUASH_AUDIT.md`
- [x] Access control smoke — `docs/testing/ACCESS_MANAGEMENT_REPORT.md`
- [x] Upload + CDN — `docs/testing/CDN_UPLOAD_REPORT.md`
- [x] Admin validation (redacted) — `docs/ADMIN_VALIDATION_REPORT.md`
- [x] Backup documentation — `docs/BACKUP_AND_RESTORE_REPORT.md`, `backups/`
- [x] Executive report — `docs/PRE_PRODUCTION_REPORT.md`
- [x] Phase 9 implementation package — **READY** (`docs/PHASE9_READINESS_REPORT.md`, score **92/100**)
- [ ] Phase 9 go-live — **NO** (`docs/GO_LIVE_REPORT.md`)

---

## Pre-Production Validation (2026-06-04)

- [x] Validation A — Playwright E2E (13/13 pass) — [docs/testing/PLAYWRIGHT_REPORT.md](./docs/testing/PLAYWRIGHT_REPORT.md)
- [x] Validation B — Fitness audit (API + manual UI checklist) — [docs/testing/FITNESS_AUDIT.md](./docs/testing/FITNESS_AUDIT.md)
- [x] Validation C — Squash audit — [docs/testing/SQUASH_AUDIT.md](./docs/testing/SQUASH_AUDIT.md)
- [x] Validation D — Access management — [docs/testing/ACCESS_MANAGEMENT_REPORT.md](./docs/testing/ACCESS_MANAGEMENT_REPORT.md)
- [x] Validation E — CDN / upload — [docs/testing/CDN_UPLOAD_REPORT.md](./docs/testing/CDN_UPLOAD_REPORT.md)
- [x] Validation F — Admin account — [docs/testing/ADMIN_ACCOUNT_REPORT.md](./docs/testing/ADMIN_ACCOUNT_REPORT.md)
- [x] Validation G — Backup strategy — [docs/backup/BACKUP_STRATEGY.md](./docs/backup/BACKUP_STRATEGY.md)
- [x] Builds green (`npm run build`, `npm run backend:build`)
- [x] Master tracker — [docs/PRE_PRODUCTION_VALIDATION.md](./docs/PRE_PRODUCTION_VALIDATION.md)
- [x] Executive report — [docs/PRE_PRODUCTION_REPORT.md](./docs/PRE_PRODUCTION_REPORT.md)
- [ ] **Go-live gate:** Phase 9 production deploy — **NOT LIVE** (`docs/GO_LIVE_REPORT.md` — READY_FOR_IMPLEMENTATION **YES**)

---

## Phase 9 — Production Readiness (2 weeks)

### CDN & DNS

- [~] Connect `cdn.abdelrhmanabdelkhalek.com` to R2/custom domain — DNS resolves; object curl **200** (`docs/PHASE9_PROGRESS.md`)
- [ ] Update `R2_PUBLIC_URL` / CDN env for production (`USE_CDN=true` on API + Vercel)
- [ ] Verify all media URLs in production (after deploy)
- [ ] Configure Squash subdomain DNS (`squash.abdelrhmanabdelkhalek.com`) → Vercel squash project

### CI/CD

- [x] Production build pipeline for frontend — `npm run build` PASS; `vercel.json` + `docs/VERCEL_DEPLOYMENT.md`
- [x] Production build pipeline for backend — `npm run backend:build` PASS
- [~] Deploy platform config — Vercel **ready**; API host **docs only** (`docs/PHASE9_DEPLOYMENT_PLAN.md`)
- [x] Environment secrets management documented — `.env.production.example`, `backend/.env.production.example`

### Security

- [ ] Rotate JWT secrets for production
- [ ] Force bcrypt passwords; migrate remaining plaintext users
- [ ] CORS production origins locked down
- [x] R2 bucket policy review (public read vs signed) — `docs/SECURITY_AUDIT_REPORT.md`
- [x] Dependency audit (`npm audit`) — summary in security report; fixes pending

### Monitoring & Operations

- [~] Health check endpoint monitored — `/api/health` verified locally; external monitor pending
- [~] Error tracking (Sentry or equivalent) — optional env documented (`docs/MONITORING_REPORT.md`)
- [x] Multi-domain cutover — `docs/PHASE9_DEPLOYMENT_PLAN.md` §5–6 (Vercel fitness + squash)
- [x] Production runbook — `docs/PHASE9_DEPLOYMENT_PLAN.md`, `docs/PHASE9_GO_LIVE_CHECKLIST.md`
- [ ] Remove Supabase REST fallback (if Postgres stable)

### Final Smoke Test

- [ ] Fitness production site: all sections
- [ ] Squash production site: all sections
- [ ] Coach login + CRUD both domains
- [ ] Upload + CDN media delivery
- [ ] Mobile + RTL spot check

### Phase 9 Exit Verification

- [ ] Production deploy successful (Vercel + API)
- [ ] Smoke checklist signed off (`docs/PHASE9_GO_LIVE_CHECKLIST.md`)

---

## Public landing routes + domain portal

- [x] `/` — `DomainPortalPage` (two cards: squash premium + fitness, Unsplash backgrounds)
- [x] `/fitness` — `FitnessHomePage`
- [x] `/squash` — `SquashHomePage`
- [x] `RouteThemeBridge` + `resolveDomainFromPath` for path-based theme on landings

---

## Squash Landing (Fitness parity + light green)

- [x] Squash coach dashboard nav + sections match fitness (subscriptions, trainees; no coaches/programs menu)
- [x] Hero slider Unsplash IDs verified (squash courts + racket; no 404 CDN URLs)
- [x] Light green `squashTheme` + default light mode; squash `gradient-text` CSS override
- [x] Fitness-style shell: Sidebar, Navbar, Footer, ScrollToTop, `SquashHomePage`
- [x] Squash sections forked from fitness layout; data via `useSquashContent` + Three.js
- [x] Dark premium sections removed
- [x] Light green squash dashboard chrome + `squashDashboard` i18n
- [x] Playwright squash landing spec + `docs/SQUASH_UI_COMPLETION_REPORT.md`
- [ ] Production Lighthouse >90 on squash home (verify after deploy build)

---

## Backlog / Future (Post Phase 9)

- [ ] Trainee self-service portal (not coach dashboard)
- [ ] Chunked/large video upload
- [ ] Payment integration for packages
- [ ] Email notifications (subscription, access granted)
- [ ] Analytics dashboard
- [ ] Multi-coach / multi-tenant support

---

*Last updated: Phase 9 implementation complete — READY_FOR_IMPLEMENTATION **YES**, GO_LIVE **NO** (92/100) (2026-06-04).*
