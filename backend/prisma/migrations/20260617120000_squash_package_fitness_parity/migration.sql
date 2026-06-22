-- Squash packages: fitness-parity columns (EGP/USD tiers, duration flags, level/type)

ALTER TABLE squash_packages
  ADD COLUMN IF NOT EXISTS price_egp  NUMERIC,
  ADD COLUMN IF NOT EXISTS price_usd  NUMERIC,
  ADD COLUMN IF NOT EXISTS price_egp_3m  NUMERIC,
  ADD COLUMN IF NOT EXISTS price_usd_3m  NUMERIC,
  ADD COLUMN IF NOT EXISTS price_egp_6m  NUMERIC,
  ADD COLUMN IF NOT EXISTS price_usd_6m  NUMERIC,
  ADD COLUMN IF NOT EXISTS allow_1_month  BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_3_months BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_6_months BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'combined',
  ADD COLUMN IF NOT EXISTS includes_video_feedback BOOLEAN,
  ADD COLUMN IF NOT EXISTS daily_support BOOLEAN,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Backfill tier prices from legacy single price column
UPDATE squash_packages
SET
  price_usd = COALESCE(price_usd, price),
  price_egp = COALESCE(price_egp, price),
  duration_days = COALESCE(duration_days, 30)
WHERE price IS NOT NULL OR price_egp IS NULL;

-- Level / type constraints (TEXT — no cross-table enum dependency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'squash_packages_level_check'
  ) THEN
    ALTER TABLE squash_packages
      ADD CONSTRAINT squash_packages_level_check
        CHECK (level IN ('beginner','intermediate','advanced','elite'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'squash_packages_type_check'
  ) THEN
    ALTER TABLE squash_packages
      ADD CONSTRAINT squash_packages_type_check
        CHECK (type IN ('training','nutrition','combined'));
  END IF;
END $$;

-- Convert features to JSONB (match fitness packages)
ALTER TABLE squash_packages
  ALTER COLUMN features_en TYPE JSONB USING (
    CASE WHEN features_en IS NULL OR features_en = '' THEN NULL
         WHEN features_en LIKE '[%' THEN features_en::jsonb
         ELSE to_jsonb(string_to_array(features_en, E'\n'))
    END
  ),
  ALTER COLUMN features_ar TYPE JSONB USING (
    CASE WHEN features_ar IS NULL OR features_ar = '' THEN NULL
         WHEN features_ar LIKE '[%' THEN features_ar::jsonb
         ELSE to_jsonb(string_to_array(features_ar, E'\n'))
    END
  );

-- Optional: drop legacy column after backfill is verified in production
-- ALTER TABLE squash_packages DROP COLUMN IF EXISTS price;
