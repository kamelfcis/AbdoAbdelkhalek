-- Track which landing (fitness vs squash) a trainee signed up from.
ALTER TABLE users ADD COLUMN IF NOT EXISTS registered_from TEXT;

CREATE INDEX IF NOT EXISTS users_registered_from_idx ON users (registered_from)
  WHERE registered_from IS NOT NULL;
