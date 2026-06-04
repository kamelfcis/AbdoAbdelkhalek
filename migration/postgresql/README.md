# PostgreSQL migration package

## Files

- `schema.sql` — copied from `backup/database/schema.sql` by `npm run generate-prisma`
- `updated_data.sql` — data with CDN URLs (from `npm run replace-urls`)
- `restore.sh` / `restore.ps1` — apply schema + data
- `verify.sh` / `verify.ps1` — run migration verification report

## Usage

```bash
# From repo root (with .env configured)
./migration/postgresql/restore.sh
./migration/postgresql/verify.sh
```

Windows:

```powershell
.\migration\postgresql\restore.ps1
.\migration\postgresql\verify.ps1
```
