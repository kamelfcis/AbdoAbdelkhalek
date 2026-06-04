# Playwright E2E Report

**Date:** 2026-06-04  
**Command:** `npm run test:e2e`  
**Config:** [playwright.config.ts](../../playwright.config.ts)

---

## Summary (final run)

| Metric | Value |
|--------|-------|
| **Total tests** | 13 |
| **Passed** | 13 |
| **Failed** | 0 |
| **Skipped** | 0 |
| **Duration** | ~1.9 minutes |
| **Gate A** | **PASS** |

---

## Projects

| Project | Tests | Result |
|---------|-------|--------|
| `setup` | authenticate coach | PASS |
| `chromium` | 11 specs | PASS |
| `squash-landing` | squash home | PASS |

---

## Test list

| Spec | Test | Result |
|------|------|--------|
| `auth.setup.ts` | authenticate coach | PASS |
| `access.spec.ts` | fitness video grant/revoke API | PASS |
| `categories-crud.spec.ts` | create category | PASS |
| `categories-crud.spec.ts` | edit category (API + UI list) | PASS |
| `categories-crud.spec.ts` | delete category | PASS |
| `coach-login.spec.ts` | dashboard with stored session | PASS |
| `dashboard.spec.ts` | overview visible | PASS |
| `landing-fitness.spec.ts` | public home loads | PASS |
| `logout.spec.ts` | logout API | PASS |
| `squash-access.spec.ts` | squash video access API | PASS |
| `videos-packages-api.spec.ts` | video API CRUD | PASS |
| `videos-packages-api.spec.ts` | package API CRUD | PASS |
| `landing-squash.spec.ts` | squash home content | PASS |

---

## Environment

- **Frontend:** `http://localhost:3000` (CRA via Playwright `webServer`)
- **API:** `http://localhost:4000`
- **Coach:** `admin@gmail.com` (password in `e2e/helpers/auth.ts`, not committed)
- **Auth:** `e2e/.auth/coach.json` from setup project

---

## Fixes applied during validation

1. Playwright `auth.setup` + `storageState` to reduce login rate-limit noise  
2. Dev auth rate limit raised (non-production)  
3. E2E helpers: `loginViaApi`, `getCoachToken`, English via `websiteLanguage` localStorage  
4. Package POST default `level: 'beginner'` for REST fallback  
5. Fitness access test: parse video list + `me.user.id`  
6. Landing tests: `networkidle` + body text poll  

---

## Artifacts

| Artifact | Path |
|----------|------|
| HTML report | `playwright-report/` (after run) |
| Failure screenshots | `test-results/**/test-failed-1.png` |
| Traces | on-first-retry (config) |

**Note:** Earlier failed runs left screenshots under `test-results/`; final run was all green.

---

## How to reproduce

```powershell
cd abdelrhmanabdelkhalek-react
npx playwright install chromium
npm run test:e2e
```

Ensure port **3000** is not occupied by a non-SPA static server (CRA dev server required for `/login` routes).
