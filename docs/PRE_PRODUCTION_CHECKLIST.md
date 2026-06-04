# Pre-Production Validation Checklist

**Completed:** 2026-06-04  
**Legend:** `[x]` Verified · `[~]` Partial · `[ ]` Not met

---

## Planning

- [x] `docs/PRE_PRODUCTION_VALIDATION_PLAN.md`
- [x] `docs/PRE_PRODUCTION_CHECKLIST.md`

---

## Phase A — Playwright

- [x] Playwright browsers installed
- [x] Backend `:4000`
- [x] Frontend `:3000` (webServer)
- [x] Coach login E2E
- [x] Dashboard load E2E
- [x] Category create/delete E2E
- [x] Category edit E2E (API create/patch + UI list verify)
- [x] Fitness landing E2E
- [x] Squash landing (`REACT_APP_DOMAIN=squash` project)
- [x] Access grant/revoke E2E (API)
- [x] Video API CRUD E2E
- [x] Package API CRUD E2E (after `type` default fix)
- [x] Squash access E2E
- [x] Logout E2E (refresh cookie)
- [x] **100% E2E single-run gate** — 12/12 chromium (×2) + 1/1 squash
- [x] `docs/playwright-report-summary.md`
- [x] `npm run build` after Phase A

---

## Phase B — Fitness

- [x] Public GETs (all 200)
- [~] Landing sections — API + partial E2E; manual Hero/Contact
- [x] Coach category CRUD API
- [x] CDN samples clean
- [~] Mobile/RTL — code review; manual required
- [x] `docs/testing/FITNESS_AUDIT.md`
- [x] `npm run backend:build`

---

## Phase C — Squash

- [x] All public GETs 200
- [x] Domain switcher (code)
- [x] Squash theme env documented
- [x] `docs/testing/SQUASH_AUDIT.md`

---

## Phase D — Access

- [x] Fitness video access curl/script
- [x] `smoke:squash-access` ALL PASS
- [x] `docs/testing/ACCESS_MANAGEMENT_REPORT.md`

---

## Phase E — Upload + CDN

- [x] Upload proxy 200
- [x] Allowlist documented
- [x] CDN hostname notes
- [x] `docs/testing/CDN_UPLOAD_REPORT.md`

---

## Phase F — Admin

- [x] New signup 201 (trainee)
- [x] Login JWT for new user
- [x] Existing coach dashboard + CRUD
- [x] `docs/ADMIN_VALIDATION_REPORT.md` (redacted)

---

## Phase G — Backup

- [x] `backups/` folder
- [x] Schema reference + Prisma copy
- [x] Export approach documented
- [x] Restore dry-run docs
- [x] `docs/BACKUP_AND_RESTORE_REPORT.md`

---

## Final

- [x] `docs/PRE_PRODUCTION_REPORT.md`
- [x] `docs/PHASE9_READINESS_REPORT.md` — **YES**
- [x] `docs/PHASE9_DEPLOYMENT_PLAN.md` (expanded)
- [x] `PROJECT_CHECKLIST.md` updated
- [x] Final builds/tests PASS
