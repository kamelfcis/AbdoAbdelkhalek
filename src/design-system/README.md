# Design System

Shared tokens, themes, and typography for the Fitness + Squash platform.

## Usage

```javascript
import { applyThemeVariables, themeIds, tokens, typography } from '../design-system';
import { Button, Input, Card } from '../shared/ui';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { useDomain } from '../shared/hooks/useDomain';
```

## CSS variables

Themes inject variables on `document.documentElement`:

| Variable | Purpose |
|----------|---------|
| `--color-primary` | Brand primary |
| `--color-bg` | Page background |
| `--color-surface` | Cards, inputs |
| `--color-text` | Body text |
| `--gradient-primary` | CTA gradients |
| `--sidebar-width` | Dashboard sidebar |

Use in Tailwind: `bg-[var(--color-primary)]` or via extended theme in `tailwind.config.js`.

## Themes

- **fitness** — current `#0074b7` branding (default)
- **squash** — green/gold placeholder for `squash.*` subdomain

Domain resolution: `useDomain()` reads `REACT_APP_DOMAIN` or hostname prefix `squash.`.

## RTL

Set `dir` on containers; use `Input` `isRTL` prop for icon padding. `LanguageContext` sets document `dir`.

See [PHASE2_DESIGN_SYSTEM_PLAN.md](../../docs/PHASE2_DESIGN_SYSTEM_PLAN.md) for migration notes.
