# TanStack Query Tuning — Phase 8

## Default client (`src/config/queryClient.js`)

| Option | Value | Rationale |
|--------|-------|-----------|
| `staleTime` | 10 min | Public landing data changes infrequently |
| `gcTime` | 30 min | Keep scroll-back instant on long sessions |
| `refetchOnWindowFocus` | false | Avoid surprise refetches during coach work |
| `refetchOnMount` | false | Prefer cache when navigating sections |

## Per-entity overrides

| Hook / scope | staleTime | gcTime | enabled strategy |
|--------------|-----------|--------|------------------|
| Public: categories, videos, packages, reviews, FAQs, stories | 10 min | 30 min | Always when mounted |
| Dashboard lists (categories, videos, packages, …) | 2 min | default | **Section-scoped** via `useDashboardCoachQueries` |
| Dashboard stats | 1 min | 5 min | Overview section only |
| Recent activities | 1 min | 5 min | Overview only; reuses cached dashboard lists when present |
| Trainees / subscriptions | 5 min | default | Trainees / subscriptions sections |
| Squash `useSquashContent` | 2 min (dashboard) / 10 min (public) | 30 min (public) | `scope` param |

## Prefetch (coach login / dashboard mount)

`src/shared/lib/prefetchDashboard.js` warms:

- `dashboard.stats`
- `dashboard.categories`
- `dashboard.videos`
- Dashboard JS chunk (`import()`)

Triggered from:

- `Login.js` after successful coach sign-in
- `useDashboardCore.js` when coach session is ready

## Activity feed optimization

`useRecentActivities` reads `queryClient.getQueryData()` for categories/videos/packages before issuing duplicate network calls when overview prefetches have run.

## Invalidation (unchanged)

- `invalidateContentCrud` — entity CRUD
- `invalidateAccessCrud` — subscriptions / trainee access
- `invalidateDashboardSession` — coach session bootstrap
