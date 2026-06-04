# Phase 3 — Frontend Refactor Progress



**Date:** 2026-06-04  

**Status:** **FULLY COMPLETE** (smoke test PASS — see [PHASE3_SMOKE_TEST_REPORT.md](./PHASE3_SMOKE_TEST_REPORT.md))  

**Phase 4:** Plan ready — [PHASE4_IMPLEMENTATION_PLAN.md](./PHASE4_IMPLEMENTATION_PLAN.md) (not implemented)



---



## Milestone Summary



| Priority | Status | Build |

|----------|--------|-------|

| A — Folder architecture | ✅ Complete | PASS |

| B — Split Dashboard | ✅ Complete | PASS |

| C — Fitness landing sections | ✅ Complete | PASS |

| D — Squash scaffold | ✅ Complete | PASS |

| E — Centralized routing | ✅ Complete | PASS |

| F — Centralized providers | ✅ Complete | PASS |

| G — Shared API layer | ✅ Complete | PASS |

| H — Shared hooks | ✅ Complete | PASS |

| I — Shared utilities | ✅ Complete | PASS |

| J — TypeScript migration (services) | ✅ Complete | PASS |



**Commands:** `npm run build` ✅ · `npm run backend:build` ✅ (2026-06-04 smoke)



---



## Smoke Test (2026-06-04)



| Area | Result |

|------|--------|

| Frontend + backend build | PASS |

| Public API GET matrix | PASS |

| Coach auth + refresh cookie | PASS |

| Categories CRUD cycle | PASS |

| CDN / R2 URLs in API | PASS |

| Routing / section IDs | PASS (code) |

| Browser UX | MANUAL — checklist in smoke report |



---



## Dashboard Line Counts



| File | Lines | Role |

|------|-------|------|

| `src/pages/Dashboard.js` | **4** | Re-export orchestrator |

| `src/features/dashboard/DashboardPage.jsx` | **30** | Provider + coach/trainee switch |

| `src/features/dashboard/hooks/useDashboardPage.js` | **991** | State, queries, handlers |



Target met: `pages/Dashboard.js` &lt; 300 lines (orchestrator only).



---



## Key Structure Created



```

src/

├── app/                    router.jsx, providers.jsx, ErrorBoundary.jsx

├── features/

│   ├── fitness/sections/   Hero, Categories, Videos, …

│   ├── fitness/pages/      FitnessHomePage.jsx

│   ├── squash/             placeholder landing + README

│   ├── dashboard/          sections/, components/, hooks/, context/

│   └── auth/               barrel re-exports

├── domains/fitness|squash/ config.js (API prefix scaffold)

├── shared/api/             *.ts services + index

├── shared/hooks/           useContentEntity, useDomain, …

├── shared/lib/             cdn, queryKeys, notifications, …

└── types/                  entities.ts

```



Backward compatibility: `src/components/*`, `src/services/*`, `src/hooks/*`, `src/utils/*`, `src/pages/dashboard/*` re-export from new paths.



---



## Post–Phase 3 polish (non-blocking)



- [ ] `useMutation` for dashboard CRUD (still imperative in modals)

- [ ] Merge Login/Dashboard inline i18n into `shared/i18n` fully

- [ ] Convert `useAuthQuery` and more hooks to `.ts`

- [ ] Overview section token cleanup (Phase 2 debt)

- [ ] Optional: shrink `useDashboardPage.js` further (handlers → `utils/`)

- [ ] Fix or remove orphaned `TraineeDashboardContent.jsx`; wire `TraineeDashboardView` when trainee portal route exists

- [ ] Remove `DashboardPage.full.js` backup when no longer needed

- [ ] Browser manual steps in smoke report



---



## Phase 4 Readiness



**Ready to start backend domain refactor** — frontend routes and fitness API paths unchanged; squash scaffold uses `REACT_APP_DOMAIN` / hostname only.



**Blockers:** None.


