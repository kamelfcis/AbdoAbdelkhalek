#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

: "${DATABASE_URL:?DATABASE_URL is required}"

echo "Restoring PostgreSQL schema..."
if [ -f migration/postgresql/schema.sql ]; then
  psql "$DATABASE_URL" -f migration/postgresql/schema.sql
elif [ -f backup/database/schema.sql ]; then
  psql "$DATABASE_URL" -f backup/database/schema.sql
else
  echo "No schema.sql found" >&2
  exit 1
fi

echo "Restoring data..."
if [ -f migration/postgresql/updated_data.sql ]; then
  psql "$DATABASE_URL" -f migration/postgresql/updated_data.sql
elif [ -f backup/database/data.sql ]; then
  psql "$DATABASE_URL" -f backup/database/data.sql
fi

echo "Restore complete."
