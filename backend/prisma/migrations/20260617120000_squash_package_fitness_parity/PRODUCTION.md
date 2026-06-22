# Production: squash package fitness parity

After deploying the backend that expects `price_egp` / `price_usd` tier columns on
`squash_packages`, run the SQL in [`migration.sql`](./migration.sql) on your **Supabase**
project (SQL Editor).

**What it does**

- Adds EGP/USD 1m / 3m / 6m tier price columns and duration toggles
- Adds `level`, `type`, `includes_video_feedback`, `daily_support`, `updated_at`
- Backfills `price_egp` / `price_usd` from legacy `price`
- Converts `features_en` / `features_ar` from plain text to JSONB
- Keeps `is_active` (squash-only visibility flag)

**Order**

1. Deploy API (Vercel backend) with the new Prisma schema and validation
2. Run `migration.sql` in Supabase SQL Editor
3. Open the squash dashboard and re-save each package if tier prices look wrong after backfill
4. Verify `/squash` landing shows duration pills and correct EGP/USD prices

Until step 2 runs, squash package create/update may fail on missing columns.
