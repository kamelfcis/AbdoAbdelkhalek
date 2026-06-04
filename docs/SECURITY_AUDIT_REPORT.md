# Security Audit Report — Phase 9

**Date:** 2026-06-04  
**Scope:** Repo-local review; no secret values in this document.

---

## 1. Secrets audit

| Location | Finding | Action |
|----------|---------|--------|
| `.env`, `backend/.env` | Gitignored (verify not committed) | Rotate if ever pushed |
| `.env.example`, `backend/.env.example` | Placeholders only | OK |
| `backend/.env.production.example` | Names only | Use host secret store |
| Docs / reports | No live keys observed | Keep policy |
| R2 / Supabase refs in docs | Project ref `ugscjqusyjttihnfhtuk`, pub hostname | Non-secret identifiers |

**Production rule:** `backend/src/config/env.ts` **requires** `JWT_SECRET` and `JWT_REFRESH_SECRET` when `NODE_ENV=production`.

---

## 2. JWT & auth

| Item | Status | Recommendation |
|------|--------|----------------|
| Access token TTL | 15m (`jwtExpiresIn`) | OK |
| Refresh storage | Hashed in `refresh_tokens` | OK |
| Logout | Refresh invalidated; access JWT stateless until expiry | Document in runbook |
| Dev fallbacks | Used when not production | Must not reach prod |
| Coach signup | Trainees by default; `is_coach` DB flag | Ops process for new coaches |
| Password hashing | bcrypt in auth layer | Migrate any legacy plaintext users before go-live |

---

## 3. CORS

| Setting | Dev | Production target |
|---------|-----|-------------------|
| `CORS_ORIGIN` | `http://localhost:3000` | Exact HTTPS origins: apex, www, squash Vercel URLs |
| Credentials | `true` | Required for cookie refresh |

**Risk:** Single origin string — if multiple prod hosts, confirm Express `cors` accepts comma list or configure array in host env (operator test).

---

## 4. HTTP headers

| Layer | Mechanism |
|-------|-----------|
| API | `helmet()` in `backend/src/app/server.ts` |
| Vercel SPA | Optional headers in `docs/VERCEL_DEPLOYMENT.md` (not enabled in `vercel.json` by default) |

---

## 5. Upload allowlist

File: `backend/src/domains/shared/media/allowlist.ts`

**Fitness buckets:** `categories`, `videos`, `video-thumbnails`, `packages`, `reviews`, `success-stories`, `faqs`, `profile`

**Squash prefixes:** `squash/categories/`, `squash/videos/`, … `squash/programs/`

**Guards:** Rejects `..` in paths; squash keys must match prefix list.

---

## 6. npm audit summary (2026-06-04)

Command: `npm audit --json` (root workspace + backend workspace).

### Root / frontend workspace

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 25 |
| Moderate | 16 |
| Low | 10 |
| **Total** | **51** |

Most findings are **transitive** via `react-scripts` / Jest / webpack toolchain (dev/build), not runtime Express.

### Backend workspace (direct prod deps)

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 3 |
| Moderate | 4 |
| **Total** | **7** |

Notable: **express** / **path-to-regexp** / **qs** chain — `fixAvailable: true` via dependency upgrades.

### Recommended actions

1. `npm audit fix` in `backend/` — review breaking changes before prod deploy.
2. Plan CRA → Vite or eject long-term to reduce frontend audit noise (post go-live).
3. Re-run audit in CI weekly; fail build on new **critical** only (policy choice).

---

## 7. R2 / CDN exposure

| Topic | Notes |
|-------|-------|
| Bucket | Public read for media paths (by design) |
| Write | API-only via keys; not exposed to browser |
| Presigned PUT | Requires bucket CORS if `REACT_APP_UPLOAD_VIA_API=false` |

---

## 8. Production checklist

- [ ] Rotate JWT secrets (32+ random chars each)
- [ ] Lock `CORS_ORIGIN` to production frontends
- [ ] Confirm `.env` never in git history (`git log -- .env`)
- [ ] Run `npm audit fix` on backend; document accepted risks
- [ ] Review coach accounts (`is_coach=true` only for staff)
- [ ] Enable `USE_CDN` only after TLS on `cdn.*`

---

## 9. References

- `docs/SECURITY.md` (if present — project policy)
- `backend/.env.production.example`
- `docs/PHASE9_DEPLOYMENT_PLAN.md` §4
