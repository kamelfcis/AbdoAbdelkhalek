# Backup & Restore Report

**Date:** 2026-06-04  
**Supabase project:** `ugscjqusyjttihnfhtuk`

## Artifacts created

| Item | Path |
|------|------|
| Backup folder | `backups/` |
| Prisma schema copy | `backups/schema.prisma` |
| Backup README | `backups/README.md` |
| Migration toolkit | `migration-toolkit/` (`npm run export-db`, `backup-all`) |

## Schema export

- **Automated:** `npm run export-db --workspace=migration-toolkit` → `backup/database/schema.sql`
- **Reference:** `backups/schema.prisma` snapshot at validation time

## Data export

| Method | Use |
|--------|-----|
| Supabase Dashboard backup | On-demand before cutover |
| `pg_dump` via toolkit | Full data + schema |
| Supabase Management API | Read-only verification only |

**Not executed:** Full production dump during this validation (no prod wipe).

## Env backup checklist

Documented in `backups/README.md` — variable **names** only, no values.

## Restore procedure (dry-run documentation)

1. Freeze writes on source.
2. `npm run backup-all` final snapshot.
3. `npm run restore-postgres` to target instance.
4. `npx prisma generate` in `backend/`.
5. `npm run migrate-auth-users` if auth IDs change.
6. Smoke: `GET /api/health`, coach login, public GETs.
7. Rollback: re-point DNS to previous stack; restore from `backup/` folder.

**Not performed:** Live restore against Supabase prod.

## Verification

- [x] Restore steps documented
- [x] Prisma schema copied
- [x] Toolkit scripts referenced
- [ ] Full pg_dump size check (operator task — videos may be large)
