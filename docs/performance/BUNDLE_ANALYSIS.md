# Bundle Analysis — Phase 8

**Captured:** 2026-06-04 (Milestone A baseline, before optimizations)  
**Build:** `npm run build` (Create React App production)

## Baseline summary (before Phase 8)

| Metric | Value |
|--------|-------|
| **Main chunk (gzip)** | **140.21 kB** |
| **Main chunk (raw)** | 463.58 kB |
| **Total JS (raw, all chunks)** | ~674 kB |
| **Total JS (est. gzip)** | ~207 kB |
| **CSS main (gzip)** | 14.63 kB |

## Chunk inventory (raw → est. gzip ~30%)

| File | Raw (KB) | CRA gzip (KB) | Role |
|------|----------|---------------|------|
| `main.*.js` | 463.58 | **140.21** | App shell, router, React Query, Hero (Splide), providers |
| `dashboard.*.chunk.js` | 106.77 | 24.88 | Coach/trainee dashboard |
| `content-components.*.chunk.js` | 37.54 | 9.84 | Categories, Videos, Packages |
| `social-components.*.chunk.js` | 27.10 | 6.68 | SuccessStories, Reviews (Splide) |
| `about-components.*.chunk.js` | 24.18 | 5.97 | About, AboutCoach, WhyChooseMe |
| `support-components.*.chunk.js` | 10.82 | 3.55 | FAQ, Contact |
| `453.*.chunk.js` | 4.40 | 1.77 | Web vitals / runtime |

## Largest contributors (main bundle)

1. **React + react-dom + react-router-dom** — framework baseline (~不可避)
2. **@splidejs/react-splide** — imported synchronously in `Hero.js` (above-the-fold)
3. **@tanstack/react-query** + devtools wiring in providers
4. **sweetalert2** — notifications/alerts
5. **`three` npm package** — listed in `package.json` but **not imported in src** (Three.js loaded via CDN in `threeLoader.js`); candidate for dependency removal in a later cleanup

## Optimization opportunities (Phase 8 plan)

| Priority | Opportunity | Expected impact |
|----------|-------------|-----------------|
| High | Lazy-load `FitnessHomePage` / `SquashHomePage` / `Login` in router | Smaller initial route for `/login`, `/dashboard` |
| High | Dynamic-import Splide (`LazySplide`) in Hero + social sections | Move ~30–50 KB gzip out of main |
| High | Lazy-load dashboard sections in `CoachDashboardView` | Defer 24.88 KB dashboard until navigated |
| Medium | Lazy Hero shell in fitness landing | Defer canvas/Splide until paint |
| Medium | Section-scoped TanStack Query `enabled` | Fewer parallel API calls on dashboard mount |
| Medium | Prefetch dashboard stats/categories on coach login | Faster perceived dashboard load |
| Low | Remove unused `three` dependency | Install size only |

## After metrics (Milestone G — 2026-06-04)

| Metric | Before | After | Δ |
|--------|--------|-------|---|
| **Main chunk (gzip)** | 140.21 kB | **97.48 kB** | **−30.5%** |
| **Main chunk (raw)** | 463.58 kB | ~318 kB | −31% |
| **Splide** | in main | `splide.*.chunk.js` 14.02 kB gzip | Split |
| **Fitness landing** | partial in main | `fitness-home` 13.28 + `hero` 3.36 kB gzip | Split |
| **Login** | in main | `login` 3.47 kB gzip | Split |
| **Dashboard** | 24.88 kB | 22.33 kB + per-section micro-chunks | Finer splits |

**Critical path `/login`:** ~101 kB gzip (main + login) vs ~140 kB main-only before.

**Critical path `/`:** main + fitness-home + hero + splide ≈ 128 kB gzip (parallel chunks) vs 140 kB monolithic main.

See [PHASE8_COMPLETION_REPORT.md](../PHASE8_COMPLETION_REPORT.md) for full verification.

---

## Related docs

- [QUERY_TUNING.md](./QUERY_TUNING.md) — TanStack Query stale/gc times
- [BACKEND_PERFORMANCE.md](./BACKEND_PERFORMANCE.md) — compression, pagination, indexes
- [CDN_OPTIMIZATION.md](./CDN_OPTIMIZATION.md) — Cloudflare / R2 cache strategy
