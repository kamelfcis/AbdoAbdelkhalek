# Backup Strategy

**Date:** 2026-06-04  
**Primary DB:** Supabase `ugscjqusyjttihnfhtuk`  
**Media:** Cloudflare R2 (`abdelrhmanabdelkhalek-assets`)

---

## 1. Supabase schema & data

### Automated (migration-toolkit)

```powershell
cd abdelrhmanabdelkhalek-react
npm install
npm run backup-all
# Or: npm run export-db && npm run export-auth && npm run export-storage
```

**Outputs:** `backup/database/schema.sql`, `backup/database/data/*`, `backup/auth/users.json`

See [migration-toolkit/README.md](../../migration-toolkit/README.md).

### Manual (dashboard)

1. Supabase → Project → **Database** → Backups (enable PITR on paid plan).  
2. Export critical tables before major migrations.  
3. Store export off-site (encrypted drive / S3).

---

## 2. R2 inventory

| Step | Action |
|------|--------|
| List objects | AWS CLI / Cloudflare dashboard / `migration-toolkit` upload manifests |
| Manifest | `cloudflare_r2_manifest.json` after `npm run upload-r2` |
| Public URL map | `url_mapping.json` + `migration_report.html` |

**Do not** commit `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` to git.

---

## 3. Access control tables (include in DB backup)

**Fitness:**

- `user_video_access`
- `user_category_access`

**Squash:**

- `squash_user_video_access`
- `squash_user_category_access`

---

## 4. Restore procedure

1. Provision target Postgres (Neon/VPS/Supabase).  
2. `npm run restore-postgres` or `migration/postgresql/restore.ps1`.  
3. `npx prisma generate` in `backend/`.  
4. Point `DATABASE_URL` at restored instance.  
5. `npm run verify-migration`.  
6. Deploy backend + frontend; smoke login and public GETs.

**Rollback:** Keep latest `backup/` snapshot; re-point DNS to previous stack if cutover fails ([CUTOVER_CHECKLIST.md](../CUTOVER_CHECKLIST.md)).

---

## 5. Frequency

| Asset | Frequency | Retention |
|-------|-----------|-----------|
| Supabase DB | Daily automated (if PITR) + weekly `export-db` | 30–90 days |
| R2 | After bulk uploads; monthly manifest | 90 days |
| Auth export | Before auth migrations | 1 year encrypted |
| Full `backup-all` | Before production cutover + monthly | 3 copies geo-separated |

---

## 6. Disaster recovery

| Scenario | Response |
|----------|----------|
| DB corruption | Restore from PITR or `backup/database/` |
| R2 bucket loss | Re-upload from `backup/storage/` |
| Region outage | Secondary region R2 + DB replica (future) |
| Leaked JWT | Rotate secrets; invalidate refresh tokens |

**RTO target (documented):** 4–8 hours for full restore from `backup-all` snapshot.  
**RPO target:** 24 hours without PITR; &lt;1 hour with Supabase PITR.

---

## References

- [docs/CUTOVER_CHECKLIST.md](../CUTOVER_CHECKLIST.md)  
- [migration-toolkit/README.md](../../migration-toolkit/README.md)  
- [docs/cloudflare-cdn.md](../cloudflare-cdn.md)
