# Phase 9 Go-Live Checklist (All Milestones)

**Date:** 2026-06-04  
Mark `[x]` only when **verified** in target environment (production unless noted).

---

## Milestone A — Production Database

- [x] Prisma schema audited (fitness + squash + access) — `docs/PRODUCTION_DATABASE_REPORT.md`
- [x] Migrations listed (`20260604120000`, `20260604130000`)
- [x] Index recommendations documented
- [x] Backup paths referenced (`backups/`, `docs/BACKUP_AND_RESTORE_REPORT.md`)
- [ ] `npx prisma migrate deploy` on production Postgres
- [ ] Optional: Management API table list on `ugscjqusyjttihnfhtuk`
- [ ] Final `pg_dump` / `backup-all` before cutover

---

## Milestone B — Cloudflare CDN

- [x] R2 + custom domain setup documented — `docs/cloudflare-cdn.md`
- [x] `pub-353c1e27968842789935db96cbbff77b.r2.dev` object curl **200**
- [x] `cdn.abdelrhmanabdelkhalek.com` DNS resolves
- [x] CDN custom domain object curl **200** (sample thumbnail)
- [ ] Operator: confirm R2 **Connect domain** in dashboard (if not already)
- [ ] Production `USE_CDN=true` + `REACT_APP_USE_CDN=true`
- [ ] Cache rules + bucket CORS documented and applied in Cloudflare UI
- [ ] All production media URLs use CDN hostname

---

## Milestone C — Frontend (Vercel)

- [x] CRA build audited (`package.json`, React Router SPA)
- [x] `vercel.json` SPA rewrites
- [x] `docs/VERCEL_DEPLOYMENT.md` — all `REACT_APP_*` mapped
- [x] `docs/VERCEL_CHECKLIST.md`
- [x] `npm run build` PASS
- [x] `.env.production.example` (+ squash variant)
- [x] Deploy commands documented (no `vercel deploy` without login)
- [ ] Vercel fitness project created + env set
- [ ] Vercel squash project created + `REACT_APP_DOMAIN=squash`
- [ ] Custom domains + SSL live
- [ ] Production smoke: refresh `/dashboard`, `/login`

**Alternative:** Cloudflare Pages — see `docs/PHASE9_DEPLOYMENT_PLAN.md` §5b

---

## Milestone D — Backend (docs only)

- [x] Railway / Render / VPS guide in deployment plan
- [x] `backend/.env.production.example`
- [x] No Railway.toml / deploy code modified in repo
- [ ] API deployed to chosen host
- [ ] Production env injected (JWT, DATABASE_URL, R2, CORS)
- [ ] `GET /api/health` on prod URL

---

## Milestone E — DNS

- [x] DNS record table documented (apex, www, cdn, squash, api)
- [x] SSL notes (Vercel auto, Cloudflare proxy)
- [ ] Apex → Vercel fitness
- [ ] `www` → apex or Vercel
- [ ] `squash` → Vercel squash project
- [ ] `api` → API host
- [ ] `cdn` → R2 (likely complete — verify in dashboard)

---

## Milestone F — Security

- [x] `docs/SECURITY_AUDIT_REPORT.md` (secrets audit, JWT, npm audit, CORS, allowlist)
- [ ] Production JWT secrets rotated (not dev fallbacks)
- [ ] `CORS_ORIGIN` locked to prod origins only
- [ ] Plaintext password users migrated to bcrypt
- [ ] `npm audit fix` triaged for production deps

---

## Milestone G — Monitoring

- [x] `docs/MONITORING_REPORT.md`
- [x] `/api/health` verified locally
- [ ] External uptime monitor on prod `/api/health`
- [ ] Backup schedule active (Supabase or pg_dump cron)
- [ ] Optional: Sentry DSN configured (future code hook)

---

## Milestone H — Staging Sign-off

- [x] `npm run test:e2e:gate` — **12/12 PASS**
- [x] `npm run backend:test` — **5 PASS**
- [x] `npm run build` + `npm run backend:build` — **PASS**
- [x] API health smoke (local)
- [ ] `npm run test:e2e:squash` on CI/staging (1 test — run before prod)
- [ ] `backend/scripts/smoke-squash-access.mjs` vs prod API

---

## Milestone I — Go Live

- [x] `docs/GO_LIVE_REPORT.md` published
- [ ] Production deploy completed (Vercel + API)
- [ ] 48h smoke checklist signed
- [ ] **GO_LIVE = YES** (blocked until above)

---

## Final gates

| Gate | Status |
|------|--------|
| **READY_FOR_IMPLEMENTATION** | **YES** |
| **GO_LIVE** | **NO** |
