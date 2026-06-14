-- Run this in Supabase Dashboard → SQL Editor on the fitness project.
-- Adds per-package duration option flags (1 month / 3 months / 6 months).
-- Defaults to true so all existing packages keep all three durations enabled.

ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS allow_1_month  BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_3_months BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_6_months BOOLEAN NOT NULL DEFAULT true;
