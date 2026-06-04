# Admin / Coach Account Report

**Date:** 2026-06-04

---

## Production coach account (process)

1. **Create or designate** a dedicated coach email (not shared with personal mail).  
2. **Signup** via `POST /api/auth/signup` with strong password (≥8 chars) — server stores **bcrypt** hash only (`docs/SECURITY.md`).  
3. Set `is_coach: true` in database (or use signup flow if coach flag supported).  
4. Store credentials in a **password manager** — never in git or docs.  
5. Rotate password after any exposure; run `npm run migrate-auth-users` only when importing legacy users.

---

## Validation account (this audit)

| Field | Value |
|-------|--------|
| Email | `admin@gmail.com` |
| Role | Coach (`isCoach: true`) |
| Usage | Local/staging validation only |
| Password | Documented in team runbooks — **not** in repository |

**Verified:**

- Login API → `accessToken` + user payload  
- Dashboard load (Playwright + storage state)  
- Category create/delete UI  
- Category PATCH/DELETE via API  
- Bcrypt: invalid password rejected; signup creates hashed passwords  

**Optional TEST coach:** Not created this run to avoid orphan production users.

---

## Bcrypt verification

| Check | Result |
|-------|--------|
| Login with known password | PASS |
| Wrong password → 401 | PASS (Phase 7 integration) |
| Plaintext rejection on signup | Enforced in `user.repository` |

---

## Recommendations

1. Create production coach via signup on staging, then promote `is_coach` before cutover.  
2. Rotate `JWT_SECRET` / `JWT_REFRESH_SECRET` for production (Phase 9).  
3. Disable or change `admin@gmail.com` password on production if it was ever used outside dev.
