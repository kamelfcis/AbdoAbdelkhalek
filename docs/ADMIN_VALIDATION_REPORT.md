# Admin User Validation Report

**Date:** 2026-06-04  
**Redaction:** No passwords in this document.

## Existing coach (smoke)

| Check | Result |
|-------|--------|
| Login `admin@gmail.com` | 200 — JWT `accessToken` returned |
| Refresh cookie | Set on login (HTTP-only) |
| `GET /api/auth/me` | 200 with coach profile |
| Dashboard load | Playwright **PASS** |
| Category CRUD | UI create/delete **PASS**; API edit **PASS** |

Password used only from local env / E2E defaults — **not recorded here**.

## New user signup (Phase F)

| Check | Result |
|-------|--------|
| `POST /api/auth/signup` random email | **201** |
| `POST /api/auth/login` same user | **200** |
| `is_coach` on new user | **false** (signup schema has no coach promotion) |
| `POST /api/categories` as new user | **403** (expected — trainee) |

**Credentials:** New test user email pattern `preprod.<timestamp>@example.com` — password delivered **secure channel only** (not committed).

## Coach promotion policy

- Production coaches should be created via DB `is_coach=true` or migration script `npm run migrate-auth-users` after cutover.
- Signup endpoint intentionally creates trainees only (`signupSchema`: email, password, fullName, phone).

## Recommendations before Phase 9

1. Document coach onboarding runbook (promote user + verify dashboard).
2. Optional: admin-only signup route for coaches (out of scope Phases 1–8).
