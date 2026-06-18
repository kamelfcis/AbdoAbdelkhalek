# Production: decouple squash / fitness media

After deploying the backend that removes fitness↔squash sync, run the SQL in
[`migration.sql`](./migration.sql) on your **Supabase** project (SQL Editor).

This drops `source_category_id` and `source_video_id` from `squash_categories` and
`squash_videos`. Existing squash row data is **not** deleted.

**Order:** deploy API first, then run SQL. Until SQL runs, old link columns remain
in the database but are unused by the new code.
