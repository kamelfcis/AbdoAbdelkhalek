-- Migration: add duration_months to subscriptions
-- Apply this via the Supabase Dashboard SQL editor if prisma migrate dev cannot reach the DB on port 5432.
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS duration_months INTEGER NOT NULL DEFAULT 1;
