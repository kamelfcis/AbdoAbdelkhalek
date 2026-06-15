-- Run this in Supabase Dashboard → SQL Editor on the fitness project.
-- Adds per-duration package prices (3-month and 6-month tiers).
-- Nullable so existing packages fall back to monthly price × months until coaches set explicit prices.

ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS price_egp_3m  NUMERIC,
  ADD COLUMN IF NOT EXISTS price_usd_3m  NUMERIC,
  ADD COLUMN IF NOT EXISTS price_egp_6m  NUMERIC,
  ADD COLUMN IF NOT EXISTS price_usd_6m  NUMERIC;
