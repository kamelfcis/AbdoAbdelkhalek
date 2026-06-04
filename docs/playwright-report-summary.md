# Playwright E2E Report Summary

**Date:** 2026-06-04  
**Environment:** Windows dev — backend `:4000`, production build served on `:3000` (Playwright `webServer`)

## Inventory

| Spec | Tests |
|------|-------|
| `auth.setup.ts` | 1 (storage state) |
| `access.spec.ts` | 1 (API) |
| `categories-crud.spec.ts` | 3 (UI + API edit) |
| `coach-login.spec.ts` | 1 |
| `dashboard.spec.ts` | 1 |
| `landing-fitness.spec.ts` | 1 |
| `landing-squash.spec.ts` | 1 (squash project) |
| `logout.spec.ts` | 1 (API) |
| `squash-access.spec.ts` | 1 (API) |
| `videos-packages-api.spec.ts` | 2 (API) |
| **Total user journeys** | **13** |

## Phase A gate — PASS

| Run | Project | Passed | Failed |
|-----|---------|--------|--------|
| 1 | `chromium` | **12/12** | 0 |
| 2 | `chromium` (confirm) | **12/12** | 0 |
| 3 | `squash-landing` | **1/1** | 0 |

**Chromium** = setup + 11 specs (squash landing excluded; run separately).  
**Full coverage** = **13/13** when squash project is included.

```powershell
npm run test:e2e:gate
# Squash landing (separate build — REACT_APP_DOMAIN baked at build time):
$env:REACT_APP_DOMAIN='squash'
npm run test:e2e:squash
```

**Duration:** ~2 min chromium (includes `npm run build` + `serve`); ~35s squash.

## Stabilization changes

| Area | Change |
|------|--------|
| `playwright.config.ts` | Production `build` + `serve` instead of CRA dev server; `DISABLE_ESLINT_PLUGIN`; 120s test timeout; `globalSetup` health wait when `PLAYWRIGHT_SKIP_WEBSERVER` |
| `e2e/auth.setup.ts` | API login via `loginAsCoach(page, request)` |
| `e2e/helpers/access-user.ts` | Trainee-first target for video access grants |
| `e2e/landing-squash.spec.ts` | `main` text poll + heading visibility |
| `e2e/landing-fitness.spec.ts` | `domcontentloaded` (no `networkidle`) |
| Dashboard/login specs | Bilingual heading selectors, longer timeouts |
| `package.json` | `test:e2e:gate`, `test:e2e:squash` scripts |

## Optional dev-server mode

For local debugging with hot reload:

```powershell
$env:PLAYWRIGHT_DEV_SERVER='1'
npx playwright test --project=chromium
```

## Gate status (Phase A)

**100% pass on single chromium invocation:** **MET** (12/12, two consecutive runs).  
**Squash landing:** **MET** (1/1 with `REACT_APP_DOMAIN=squash`).  
**Functional coverage:** **13/13 (100%)**.

HTML report: `npx playwright show-report`
