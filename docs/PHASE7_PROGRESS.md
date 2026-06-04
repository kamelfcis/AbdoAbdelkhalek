# Phase 7 — Testing & CI Progress

**Started:** 2026-06-04

---

## Milestone A — Backend Test Infrastructure

| Field | Value |
|-------|-------|
| **Status** | Completed |
| **Files** | `backend/vitest.config.ts`, `backend/tests/setup.ts`, `backend/tests/health.test.ts`, `backend/package.json` |
| **Checklist** | Test setup (Jest/Vitest + supertest) |
| **Build** | `npm run backend:build` PASS |
| **Tests** | `npm run test --workspace=backend` — 4 unit/health tests PASS |
| **Remaining** | — |

---

## Milestone B — Backend Integration Tests

| Field | Value |
|-------|-------|
| **Status** | Completed |
| **Files** | `backend/tests/helpers/integration.ts`, `backend/tests/integration/*.test.ts` |
| **Checklist** | Auth, public GET (fitness/squash), access PUT, validation |
| **Build** | PASS |
| **Tests** | 24 PASS with `RUN_INTEGRATION_TESTS=true`; 5 PASS + 19 skipped without |
| **Remaining** | Coach CRUD POST/PATCH not covered (deferred to E2E) |

---

## Milestone C — Frontend Test Infrastructure

| Field | Value |
|-------|-------|
| **Status** | Completed |
| **Files** | `vitest.config.mjs`, `src/tests/setup.js`, `src/tests/test-utils.jsx`, `src/tests/sample.test.jsx`, `package.json` |
| **Checklist** | Test setup (RTL + Vitest) |
| **Build** | `npm run build` PASS |
| **Tests** | 29 PASS |
| **Remaining** | — |

---

## Milestone D — Frontend Component Tests

| Field | Value |
|-------|-------|
| **Status** | Completed |
| **Files** | `src/shared/ui/*.test.jsx`, `src/contexts/AuthContext.test.jsx`, `src/components/*Route.test.jsx`, `src/shared/hooks/useDomain.test.js`, `useAuthQuery.test.js` |
| **Checklist** | Button, Input, Modal, Table, AuthContext, routes, useDomain, useAuthQuery |
| **Build** | PASS |
| **Tests** | 29 PASS |
| **Remaining** | — |

---

## Milestone E — E2E Tests

| Field | Value |
|-------|-------|
| **Status** | Implemented (manual run required) |
| **Files** | `playwright.config.ts`, `e2e/**/*.spec.ts`, `e2e/helpers/auth.ts` |
| **Checklist** | 9 Playwright tests listed |
| **Build** | PASS |
| **Verification** | `npx playwright test --list` — 9 tests; run with `npx playwright install` + backend :4000 + frontend :3000 |
| **Remaining** | Squash landing test needs `REACT_APP_DOMAIN=squash` at server start |

---

## Milestone F — CI/CD

| Field | Value |
|-------|-------|
| **Status** | Completed |
| **Files** | `.github/workflows/ci.yml` |
| **Checklist** | GitHub Actions lint/build/test; E2E workflow_dispatch |
| **Build** | Local equivalent: build + test PASS |
| **Remaining** | Add repo secrets for full integration in CI |

---

## Milestone G — Coverage & Reports

| Field | Value |
|-------|-------|
| **Status** | Completed |
| **Files** | `docs/PHASE7_COMPLETION_REPORT.md` |
| **Checklist** | Phase 7 exit verification |
| **Build** | frontend + backend PASS |
| **Coverage** | Backend ~45% lines; Frontend ~3.9% lines (focused component tests) |
| **Remaining** | Expand coverage in Phase 8+ |
