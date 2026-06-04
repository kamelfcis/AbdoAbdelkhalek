# Squash UI — Completion Report (Fitness Parity + Light Green)

**Date:** 2026-06-03  
**Scope:** Squash public landing mirrors Fitness layout; squash API data only; light green brand aligned with dashboard accents.

## Delivered

1. **Fitness-parity shell** — `SquashHomePage` with `App.css`, white background, `SquashNavbar`, `SquashSidebar`, `SquashFooter`, `SquashScrollToTop`, `ErrorBoundary` + lazy sections.
2. **Section forks** — `SquashHero.js` through `SquashContact.js` with Three.js (`useSquashThreeBackground`), Splide carousels, `useSquashContent`, `useSquashI18n`.
3. **Light green theme** — `squashTheme.light` uses light surfaces; default mode is light; `[data-theme="squash"]` gradient-text override in `App.css`.
4. **Dashboard** — Light green `[data-squash-dashboard]` styles; `squashDashboard` i18n unchanged.

## Removed

- Dark premium `*Section.jsx` components and glass/framer-motion hero.

## Verify

```bash
npm run start:squash
npm run build
REACT_APP_DOMAIN=squash npx playwright test e2e/landing-squash.spec.ts
```

## Section IDs (nav)

`home`, `about-me`, `why-choose`, `success-stories`, `reviews`, `categories`, `videos`, `packages`, `coaches`, `programs`, `faq`, `contact`
