# Squash UI — Design direction

**Current:** Fitness-parity landing with **light green** brand (not dark luxury).

## Brand

- Primary: `#6BB800` / light `#D7FF3F` / `#9BEA00`
- Background: white / `gray-100` (same rhythm as fitness)
- Gradients: `var(--gradient-brand)` on `[data-theme="squash"]`

## Structure

Mirrors [`FitnessHomePage.jsx`](../src/features/fitness/pages/FitnessHomePage.jsx):

- Shell: `SquashNavbar`, `SquashSidebar`, `SquashFooter`, `ScrollToTop`
- Sections: `SquashHero.js` … `SquashContact.js` under [`src/features/squash/sections/`](../src/features/squash/sections/)
- Data: [`useSquashContent`](../src/shared/hooks/useSquashContent.js) only on public squash home
- Motion: Three.js via [`useSquashThreeBackground`](../src/features/squash/hooks/useSquashThreeBackground.js)

## Dashboard

Light green when `?domain=squash` — [`squash-premium.css`](../src/features/squash/styles/squash-premium.css) `[data-squash-dashboard]`.

## i18n

[`squash.en.js`](../src/shared/i18n/squash.en.js) / [`squash.ar.js`](../src/shared/i18n/squash.ar.js) via `useSquashI18n()`.
