# Production cutover checklist

## Before migration

- [ ] Rotate all keys that were ever committed (Supabase, R2)
- [ ] Copy `.env.example` → `.env` with real values
- [ ] Manual Supabase dashboard backup (DB + Storage)
- [ ] Confirm `pg_dump` / `psql` installed locally
- [ ] Confirm disk space for full storage export (videos may be large)

## Export (source Supabase)

```powershell
cd abdelrhmanabdelkhalek-react
npm install
npm run backup-all
# Or step by step:
# npm run export-db
# npm run export-auth
# npm run export-storage
# npm run upload-r2
# npm run replace-urls
# npm run verify-migration
```

Review:

- [ ] `backup/database/schema.sql`
- [ ] `backup/database/data/`
- [ ] `storage_manifest.json`
- [ ] `cloudflare_r2_manifest.json`
- [ ] `url_mapping.json`
- [ ] `migration_report.html`

## Target PostgreSQL

- [ ] Provision Postgres (Neon, VPS, etc.)
- [ ] `npm run restore-postgres` or `.\migration\postgresql\restore.ps1`
- [ ] `npm run verify-migration`

## Backend API

```powershell
cd backend
npx prisma generate
npm run dev
```

- [ ] `GET http://localhost:4000/api/health` returns OK
- [ ] Coach login works
- [ ] `npm run migrate-auth-users` (after export) — users reset passwords

## Frontend

```powershell
# root
set REACT_APP_API_URL=http://localhost:4000/api
set REACT_APP_CDN_URL=https://cdn.abdelrhmanabdelkhalek.com
npm start
```

- [ ] Public pages load categories/videos
- [ ] Login / signup
- [ ] Dashboard CRUD + file upload

## Cutover day

1. [ ] Freeze writes on Supabase
2. [ ] Final `npm run backup-all`
3. [ ] Restore to production Postgres
4. [ ] Deploy backend (Railway/Render/VPS) + **two** Vercel frontends (fitness + squash)
5. [ ] DNS: `api`, `cdn`, apex/`www`, `squash.abdelrhmanabdelkhalek.com` — see `docs/PHASE9_DEPLOYMENT_PLAN.md` §6
6. [ ] Set `USE_CDN=true` / `REACT_APP_USE_CDN=true` after CDN smoke
7. [ ] Smoke test 48h (`docs/PHASE9_GO_LIVE_CHECKLIST.md`)
8. [ ] Rollback plan: keep `backup/` folder

## Rollback

Restore from `backup/` folder and re-point DNS to Supabase until issues are resolved.
