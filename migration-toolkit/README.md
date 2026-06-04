# Migration toolkit

Exports Supabase project `ugscjqusyjttihnfhtuk` to offline backup, uploads storage to Cloudflare R2, and prepares PostgreSQL migration files.

## Prerequisites

- Node.js 22+
- `.env` at repo root (see `.env.example`)
- `pg_dump` and `psql` in PATH
- Supabase CLI logged in (optional, for `supabase db dump`)

## Commands

| Command | Description |
|---------|-------------|
| `npm run backup-all` | Full pipeline |
| `npm run export-db` | Schema, policies, per-table JSON/CSV/SQL |
| `npm run export-auth` | Auth users metadata (no password hashes) |
| `npm run export-storage` | Download all buckets to `backup/storage/` |
| `npm run upload-r2` | Upload to R2 + `url_mapping.json` |
| `npm run replace-urls` | Generate `migration/postgresql/updated_data.sql` |
| `npm run generate-prisma` | Write `backend/prisma/schema.prisma` |
| `npm run restore-postgres` | Apply schema/data via psql |
| `npm run verify-migration` | `migration_report.json` + `.html` |

## Flags

```bash
npm run backup-all -- --skip-storage
npm run backup-all -- --skip-r2
```

## Output layout

```
backup/
  database/
    schema.sql
    data.sql
    data/{table}.json|.csv|.sql
    policies.sql
    functions.sql
    metadata.json
  auth/
    users.json
  storage/{bucket}/...
migration/postgresql/
  updated_data.sql
  restore.sh / restore.ps1
```
