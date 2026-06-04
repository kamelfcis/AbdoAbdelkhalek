# Security — Phase 1

**Last updated:** 2026-06-04

---

## JWT secrets (production)

The API **refuses to boot in production** without `JWT_SECRET` and `JWT_REFRESH_SECRET` (see `backend/src/config/env.ts`).

Development may use documented fallbacks; production must set strong random values (≥ 32 characters). Copy from `.env.example` / `backend/.env.example`.

---

## Password storage

### Current behavior

| Path | Behavior |
|------|----------|
| **Signup** (`POST /api/auth/signup`) | Plaintext from client → `bcrypt.hash(..., 12)` in route → `createUser()` |
| **createUser()** | Rejects non-bcrypt hashes (defense in depth) |
| **Login** (`verifyPassword`) | bcrypt compare if hash; legacy **plaintext compare** for migrated rows only |

Legacy plaintext rows may exist from the original Supabase app. Login still accepts them until migrated.

### Migration plan (plaintext → bcrypt)

**Goal:** Every `users.password` value is a bcrypt hash (`$2a$` / `$2b$` / `$2y$` prefix).

1. **New accounts** — Already enforced: signup always hashes; `createUser()` rejects plaintext.
2. **Cutover import** — `npm run migrate-auth-users --workspace=backend` sets bcrypt hashes for users imported from `backup/auth/users.json` (temporary password; admin reset required). See `backend/src/scripts/migrate-auth-users.ts`.
3. **Lazy migration (recommended post–Phase 1)** — On successful login when `verifyPassword` used plaintext compare, re-hash with bcrypt and update the row. Not implemented yet; safe to add in Phase 2+ without breaking login.
4. **Batch migration (optional)** — One-off script: `SELECT id, password FROM users WHERE password NOT LIKE '$2%'`, hash each, `UPDATE`. Run during maintenance window; force password reset for any ambiguous rows.
5. **Remove plaintext fallback** — After audit confirms zero plaintext rows, delete the plaintext branch in `verifyPassword()`.

**Verification query (run against Postgres):**

```sql
SELECT COUNT(*) FROM users
WHERE password IS NOT NULL
  AND password NOT LIKE '$2a$%'
  AND password NOT LIKE '$2b$%'
  AND password NOT LIKE '$2y$%';
```

Target: `0` before removing legacy login support.

---

## Environment variables & secrets audit (Phase 1)

| Check | Status |
|-------|--------|
| `.env`, `backend/.env` in `.gitignore` | ✓ |
| Committed `.env.example` files use placeholders only | ✓ |
| No service-role keys or JWT secrets in tracked source | ✓ (grep audit 2026-06-04) |
| Production JWT secrets required at boot | ✓ |
| Signup stores bcrypt only | ✓ |

**Developer setup:** Copy root [`.env.example`](../.env.example) → `.env` (frontend + shared vars) and [`backend/.env.example`](../backend/.env.example) → `backend/.env` (API-only overrides). The backend loads both. See [README.md](../README.md).

**Note:** `migration-toolkit` defaults `SUPABASE_PROJECT_REF` for local export convenience; set explicit env vars for non-default projects. Public Supabase project URLs in backup JSON are not secrets.

---

## Related docs

- [DATA_LAYER.md](./DATA_LAYER.md) — database dual-path, connection strings
- [cloudflare-cdn.md](./cloudflare-cdn.md) — R2 / CDN credentials
