# Phase 2 — Design System Plan

**Date:** 2026-06-04  
**Scope:** Design tokens, shared UI library, layout system, dashboard visual redesign, fitness/squash themes  
**Out of scope:** Phase 3 feature-folder split, backend changes, Squash public pages

---

## Current UI Problems

| Area | Issue |
|------|-------|
| **Tokens** | Hard-coded hex values (`#0074b7`, `#bfd7ed`) and inline styles scattered across Login, Dashboard, landing |
| **Consistency** | Dashboard sidebar uses inline `style={{}}`; Login uses glassmorphism; landing uses different gradient patterns |
| **Duplication** | Coach and trainee dashboards each embed ~150 lines of nearly identical sidebar/topbar markup |
| **Components** | No shared Button/Input/Modal; modals re-implement overlay + form fields; SweetAlert2 still used in 8 dashboard modals |
| **RTL** | Per-page `isRTL` checks and manual `ml`/`mr` swapping instead of logical properties or shared helpers |
| **Themes** | Single fitness palette; no subdomain-aware theming for future `squash.*` |
| **Accessibility** | Modals lack focus trap; inconsistent ARIA on custom controls |
| **Dark mode** | Not supported; dashboard is light-only while Login is dark gradient |

---

## Proposed Design System Architecture

```
src/
├── design-system/
│   ├── tokens.js          # Raw token values (colors, spacing, shadows, z-index, breakpoints)
│   ├── themes.js          # fitness + squash theme maps → CSS variable names
│   ├── typography.js      # Font families, sizes, weights, line heights
│   └── index.js           # Public exports + applyThemeVariables()
├── contexts/
│   └── ThemeContext.js    # Domain theme + optional dark mode on <html>
├── shared/
│   ├── hooks/
│   │   └── useDomain.js   # hostname + REACT_APP_DOMAIN → 'fitness' | 'squash'
│   ├── lib/
│   │   └── cn.js          # className merge helper
│   ├── ui/                # Primitives: Button, Input, Card, Modal, Table, …
│   └── layout/            # PageShell, SectionHeader, Sidebar, Navbar, DashboardShell
```

**Token delivery:** CSS custom properties on `:root` / `[data-theme="fitness"]` / `[data-theme="squash"]`, consumed by Tailwind extended colors and component class strings.

**Toast strategy:** Primary wrapper uses **react-hot-toast** (already in `index.js` + `utils/notifications.js`). SweetAlert2 kept only where modals still call `Swal.fire` until Phase 3 migration.

---

## Component Inventory

### Design tokens (`design-system/`)

| File | Contents |
|------|----------|
| `tokens.js` | `colors`, `spacing`, `radius`, `shadows`, `zIndex`, `breakpoints`, `transitions` |
| `themes.js` | `fitnessTheme`, `squashTheme`, `toCssVariables()`, `themeIds` |
| `typography.js` | `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `textStyles` |
| `index.js` | Re-exports + `applyThemeVariables(themeId, mode)` |

### UI primitives (`shared/ui/`)

| Component | Variants / features |
|-----------|---------------------|
| `Button` | primary, secondary, ghost, danger; sm/md/lg; loading; fullWidth |
| `Input` | label, error, hint, disabled; icon slot; RTL padding |
| `Textarea` | Same as Input |
| `Select` | label, error, options array |
| `Card` | header, body, footer slots; elevated/outline variants |
| `Modal` | focus trap, ESC, overlay click, ARIA dialog |
| `Table` | sortable header hook, empty state slot |
| `Badge` | success, warning, danger, info, neutral |
| `Spinner` | sm/md/lg inline |
| `Skeleton` | text, circle, rect; pulse animation |
| `Alert` | success, error, warning, info |
| `Toast` | thin API over react-hot-toast + token colors |
| `StatCard` | Dashboard stat tile (icon, label, value, onClick) |
| `EmptyState` | icon, title, description, action |

### Layout (`shared/layout/`)

| Component | Role |
|-----------|------|
| `PageShell` | max-width container, responsive padding |
| `SectionHeader` | title, subtitle, actions slot |
| `Sidebar` | collapsible fixed sidebar; mobile overlay |
| `Navbar` | top bar abstraction (dashboard variant) |
| `DashboardShell` | Sidebar + topbar + main content orchestration |

---

## Migration Strategy

1. **Foundation (A)** — Add tokens, themes, typography; wire CSS variables in `index.css`; extend Tailwind config.
2. **Primitives (B)** — Build `shared/ui/*`; export barrel; verify isolated render via build.
3. **Layout (C)** — Build layout components; no page changes yet except imports test.
4. **Login + one modal (B/C)** — Migrate Login to Button/Input/Alert/Modal; migrate `CategoryFormModal` to shared Modal + form fields.
5. **Dashboard shell (D)** — Replace inline sidebar/topbar with `DashboardShell`; overview stats → `StatCard`; section headers → `SectionHeader`.
6. **Themes (E)** — Add `ThemeProvider` + `useDomain`; apply fitness/squash variables at app root.
7. **Verification (F)** — `npm run build` + `npm run backend:build` after each milestone.

**Incremental rule:** Do not change Dashboard business logic, query keys, or auth flow. Visual/layout only.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Dashboard regression (3,200+ lines) | Replace shell/layout only; keep section render functions intact |
| RTL breakage | Use `cn()` + `useLanguage`/`isRTL` helper; test AR on Login + dashboard overview |
| SweetAlert2 vs toast split | Document dual usage; CategoryFormModal uses toast for validation/success |
| CSS variable + Tailwind mismatch | Map token colors in `tailwind.config.js` to `var(--color-primary)` |
| Squash theme premature | Placeholder palette only; no squash routes yet |

---

## Estimated Impact

| Metric | Before | After (target) |
|--------|--------|----------------|
| Shared UI components | 0 | 14+ primitives + 5 layout |
| Token consumers | 0 | Login, Dashboard shell, CategoryFormModal, 3+ layout components |
| Dashboard sidebar duplication | 2 inline copies | 1 `DashboardShell` |
| Inline hex in migrated files | Many | Centralized in `tokens.js` / CSS vars |
| Build | Passing | Must remain passing |
| Bundle | Baseline | +~15–25 KB (shared UI); offset later by removing duplicate styles |

---

## Exit Criteria (Phase 2)

- [x] Plan documented (this file)
- [ ] `src/design-system/` with tokens, themes, typography
- [ ] 3+ components consume design tokens
- [ ] Login uses shared Button/Input
- [ ] Dashboard uses layout system + improved overview
- [ ] Fitness + Squash theme architecture via context/CSS vars
- [ ] Frontend + backend builds pass

---

*Next: implement milestones A → E in order; update [PROJECT_CHECKLIST.md](../PROJECT_CHECKLIST.md) and [progress/PHASE2_PROGRESS.md](./progress/PHASE2_PROGRESS.md) after each.*
