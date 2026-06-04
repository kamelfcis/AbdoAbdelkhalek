# Phase 1 Progress



**Last updated:** 2026-06-04  

**Status:** **Phase 1 complete** (Priorities A–D)



---



## Phase 1 Summary



Architecture cleanup milestone delivered:



| Priority | Scope | Status |

|----------|-------|--------|

| **A** | TanStack Query — canonical `queryKeys`, invalidation fixes | ✓ |

| **B** | AuthContext, ProtectedRoute, CoachRoute, 401 refresh | ✓ |

| **C** | DATA_LAYER.md, FAQ/package REST fixes, signup fallback, DB decision | ✓ |

| **D** | JWT production guards, password policy, README/env docs, repo hygiene | ✓ |



**Gate:** Ready for **Phase 2 — Design System** (one manual verification item remains — see below).



---



## Priority D — Security & Repo Hygiene (final)



- [x] Production boot requires `JWT_SECRET` + `JWT_REFRESH_SECRET` (`backend/src/config/env.ts`)

- [x] Password migration plan documented in `docs/SECURITY.md`

- [x] Signup hashes bcrypt; `createUser()` rejects plaintext passwords

- [x] Env secrets audit — no keys in committed files; `.env` gitignored

- [x] `backend/dist/` in `.gitignore`; never tracked in git

- [x] README rewritten — Express API, R2, TanStack Query, local dev setup

- [x] Orphan `src/config/supabase.js` — already removed; README references cleaned

- [x] `.env.example` ↔ `backend/.env.example` cross-linked (README + SECURITY)

- [x] `PERFORMANCE_*.md` archived to `docs/archive/`

- [x] Fixed typo in `backend/.env.example` (concatenated JWT line)



### Priority C — Database & Data Layer



- [x] Documented Supabase pooler failure symptoms in `docs/DATA_LAYER.md`

- [x] **Decision:** Stay on Supabase interim; migrate to Neon/VPS Postgres in Phase 2+ (documented)

- [x] Aligned FAQ columns: Prisma schema + queries use `order_index` / `is_active` (live DB); REST fallback confirmed

- [x] Aligned packages list: removed nonexistent `is_active` filter; REST uses `order=created_at.desc`

- [x] Added `createUser()` REST fallback in `auth-data.ts`; signup route uses dual-path

- [x] Documented dual-path architecture, connection options, schema drift, smoke tests in `docs/DATA_LAYER.md`

- [x] Updated `.env.example` and `backend/.env.example` with DATABASE_URL option comments

- [x] Smoke tested public GET endpoints (REST fallback active — snake_case responses)

- [x] Documented coach CRUD smoke test commands (requires coach JWT)



### Priority B — Auth & Route Guards



- [x] Created `src/contexts/AuthContext.js` with `user`, `isCoach`, `isLoading`, `login`, `logout`, `refreshUser`

- [x] Created `ProtectedRoute` and `CoachRoute` with shared `RouteGuardLoader` (blocks render until auth resolves)

- [x] Wrapped app with `AuthProvider` in `App.js`; `/dashboard` protected by `CoachRoute`

- [x] Removed `checkAuth` / `authReady` mount logic from `Dashboard.js`; uses `useAuth()` instead

- [x] Updated `Login.js` to use AuthContext; coaches → `/dashboard`, trainees → `/` with welcome message

- [x] Integrated `apiClient` 401 refresh with AuthContext via `setAuthTokenChangeHandler`

- [x] Migrated `useAuthQuery.js` to gate on AuthContext (`isAuthenticated` + `!isLoading`)

- [x] Home page reads `location.state.authMessage` for trainee redirects from login or `/dashboard`



### Trainee portal (deferred)



Trainees no longer access `/dashboard` (coach-only). Sidebar links to “My Videos” / “My Favorites” still point at `/dashboard` and will redirect home with an informational message until a dedicated trainee portal route is built in a later phase.



### Priority A — TanStack Query



- [x] Audited all 16 hook files in `src/hooks/` for query key usage

- [x] Documented canonical key convention in `src/lib/queryKeys.js`

- [x] Created central `queryKeys` registry with invalidation helpers

- [x] Updated all hooks and `Dashboard.js` to use canonical keys

- [x] Updated `Packages.js` landing invalidation to use `queryKeys.packages()`



---



## Modified Files (Priority D)



| File | Change |

|------|--------|

| `backend/src/config/env.ts` | Require JWT secrets when `NODE_ENV=production` |

| `backend/src/lib/auth-data.ts` | `isBcryptHash()`, reject plaintext in `createUser()` |

| `docs/SECURITY.md` | **New** — password migration, env audit, JWT policy |

| `README.md` | Current stack, local dev, env setup, project structure |

| `.env.example` | Cross-link to `backend/.env.example` |

| `backend/.env.example` | Fixed JWT typo; cross-link to root `.env.example` |

| `docs/archive/PERFORMANCE_*.md` | Archived from repo root |

| `PROJECT_CHECKLIST.md` | Phase 1 Priority D + exit items |

| `docs/progress/PHASE1_PROGRESS.md` | This file |

| `PHASE1_IMPLEMENTATION_PLAN.md` | Phase 1 status updated |



---



## Build Status (Phase 1 exit)



| Target | Command | Result |

|--------|---------|--------|

| Backend | `npm run backend:build` (`tsc`) | **PASS** (2026-06-04) |

| Frontend | `npm run build` | **PASS** (2026-06-04) |



---



## Remaining Phase 1 Items (not blocking Phase 2)



| Item | Reason |

|------|--------|

| CRUD cache invalidation manual smoke test | Code complete (Priority A); verify in browser: edit category → list refreshes without reload |

| Public GET smoke test (Prisma path) | Blocked until pooler/direct connection stable in dev; REST path verified |

| Postgres migration sub-tasks | Deferred — interim decision: stay on Supabase |

| Phase 0 stakeholder review | Process gate outside implementation scope |



---



## Risks



| Risk | Mitigation |

|------|------------|

| Legacy plaintext passwords in DB | Login still accepts; migration plan in `docs/SECURITY.md` |

| `packages` Prisma schema drift from live DB | Documented in DATA_LAYER.md; reconcile on Postgres migration |

| Pooler unreachable in dev | REST fallback active; `DATABASE_USE_DIRECT=true` documented |

| Coach CRUD not live-tested in agent session | Commands documented in DATA_LAYER.md |



---



## Key Convention Reference



```

Public:     queryKeys.categories()  → ['categories']

Dashboard:  queryKeys.dashboard.categories() → ['dashboard', 'categories']

Stats:      queryKeys.dashboard.stats() → ['dashboard', 'stats']

Activities: queryKeys.recentActivities.byLanguage('en') → ['recentActivities', 'en']

Access:     queryKeys.subscriptions() | queryKeys.trainees() | queryKeys.trainee.videos()

```



---



## Data Layer Decision Summary



**Interim:** Supabase Postgres + PostgREST fallback  

**Target (Phase 2+):** Dedicated Postgres (Neon or VPS) per ROADMAP  

**See:** [docs/DATA_LAYER.md](../DATA_LAYER.md) · [docs/SECURITY.md](../SECURITY.md)


