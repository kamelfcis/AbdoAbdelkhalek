import pg from 'pg';
import { env } from './env.js';
import { log } from './logger.js';

export function createPgClient(): pg.Client {
  const connectionString = env.databaseUrl();
  const parsed = new URL(connectionString.replace(/^postgresql:/i, 'postgres:'));

  log(
    `Connecting to Postgres at ${parsed.hostname}:${parsed.port || '5432'} (user ${parsed.username})`
  );

  return new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}
