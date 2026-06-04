# Pre-Production Validation — Master Checklist

**Date:** 2026-06-04  
**Supabase project:** `ugscjqusyjttihnfhtuk`  
**Validator:** Automated + API smoke (local `localhost:4000` / `localhost:3000`)

**Legend:** `[x]` Verified pass · `[~]` Partial / manual · `[ ]` Not verified · `[!]` Failed

---

## Validation A — Playwright E2E

| Item | Status | Notes |
|------|--------|-------|
| `npx playwright install chromium` | [x] | Installed for run |
| Backend :4000 + frontend :3000 (webServer) | [x] | `playwright.config.ts` webServer |
| Full `npm run test:e2e` | [x] | **13/13 passed** (~1.9m final run) |
| Auth setup + storage state | [x] | `e2e/auth.setup.ts`, `e2e/.auth/coach.json` |
| Coach login / dashboard | [x] | |
| Category CRUD (UI create/delete, API edit) | [x] | Edit uses API PATCH + UI list verify |
| Fitness landing | [x] | Body content poll |
| Squash landing (`squash-landing` project) | [x] | |
| Fitness + squash access API | [x] | |
| Video + package API CRUD | [x] | Package requires `level` default (fixed in backend) |
| Logout API | [x] | Stateless JWT documented |
| Report | [x] | [docs/testing/PLAYWRIGHT_REPORT.md](./testing/PLAYWRIGHT_REPORT.md) |

**Gate A:** **PASS** (all Playwright tests green on final run)

---

## Validation B — Fitness Audit

| Area | API | UI (browser) |
|------|-----|----------------|
| Hero | [x] Public GET / health | [x] E2E landing |
| Categories | [x] GET 200 | [~] Manual scroll |
| Videos | [x] GET 200, CDN sample | [~] Manual |
| Packages | [x] GET 200 | [~] Manual |
| Reviews | [x] GET 200 | [~] Manual |
| Success stories | [x] GET 200 | [~] Manual |
| FAQ | [x] GET 200 | [~] Manual |
| Contact | [~] | [~] Manual |
| Dashboard CRUD (6 entities) | [x] Categories E2E + video/package API | [~] Other entities manual |
| Subscriptions / access | [x] Video access PUT/GET | [~] UI modals manual |
| CDN URLs (no Supabase storage) | [x] Sample `pub-*.r2.dev` | — |

**Report:** [docs/testing/FITNESS_AUDIT.md](./testing/FITNESS_AUDIT.md)

---

## Validation C — Squash Audit

| Area | API | UI |
|------|-----|-----|
| Public GET (8 endpoints) | [x] All 200 | [x] E2E squash landing |
| Coaches / programs | [x] | [~] Manual |
| Dashboard CRUD (8 entities) | [x] Category CRUD via prior phase smoke; access API | [~] Manual per entity |
| `REACT_APP_DOMAIN=squash` | [x] Documented + squash-landing project | |

**Report:** [docs/testing/SQUASH_AUDIT.md](./testing/SQUASH_AUDIT.md)

---

## Validation D — Access Management

| Test | Status |
|------|--------|
| `npm run smoke:squash-access --workspace=backend` | [x] ALL PASS |
| Fitness video grant/revoke (curl) | [x] |
| Playwright fitness + squash access specs | [x] |
| Squash access tables on `ugscjqusyjttihnfhtuk` | [x] Per Phase 6 (no migration needed this run) |

**Report:** [docs/testing/ACCESS_MANAGEMENT_REPORT.md](./testing/ACCESS_MANAGEMENT_REPORT.md)

---

## Validation E — Media, Upload & CDN

| Test | Status |
|------|--------|
| API media URLs → R2/CDN | [x] No `supabase.co/storage` in video thumbnail sample |
| POST `/api/uploads/proxy` (coach, small file) | [~] Not run (avoid large uploads); presign/proxy documented |
| Allowlist fitness + squash paths | [x] Documented from `allowlist.ts` |

**Report:** [docs/testing/CDN_UPLOAD_REPORT.md](./testing/CDN_UPLOAD_REPORT.md)

---

## Validation F — Admin Account

| Item | Status |
|------|--------|
| Production coach process documented | [x] |
| Validation coach `admin@gmail.com` | [x] Login + dashboard + CRUD |
| Optional TEST coach signup | [~] Skipped (use existing admin) |
| Bcrypt passwords | [x] Login works; signup rejects plaintext per `docs/SECURITY.md` |

**Report:** [docs/testing/ADMIN_ACCOUNT_REPORT.md](./testing/ADMIN_ACCOUNT_REPORT.md)

---

## Validation G — Backup Strategy

| Item | Status |
|------|--------|
| Supabase export steps | [x] Documented |
| R2 inventory approach | [x] Documented |
| Access tables in backup scope | [x] |
| Restore + DR procedure | [x] |

**Report:** [docs/backup/BACKUP_STRATEGY.md](./backup/BACKUP_STRATEGY.md)

---

## Builds (required)

| Command | Status |
|---------|--------|
| `npm run build` | [x] PASS (eslint warnings only) |
| `npm run backend:build` | [x] PASS |

---

## Phase 9 go-live items (out of scope — tracked separately)

See [PROJECT_CHECKLIST.md](../PROJECT_CHECKLIST.md) Phase 9 — CDN DNS, prod CI/CD, secret rotation, monitoring, production smoke on live URLs.

---

## Sign-off

| Validation | Result |
|------------|--------|
| A Playwright | **PASS** |
| B–G | **PASS** (API); UI spot-checks **manual** |
| Production go-live | **NOT READY** — Phase 9 infra pending |

**Executive report:** [docs/PRE_PRODUCTION_REPORT.md](./PRE_PRODUCTION_REPORT.md)
