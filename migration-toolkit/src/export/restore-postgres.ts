import { spawn } from 'child_process';
import { resolve } from 'path';
import { access } from 'fs/promises';
import { env, paths } from '../lib/env.js';
import { log, error } from '../lib/logger.js';

function runPsql(dbUrl: string, file: string): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('psql', [dbUrl, '-f', file], { shell: true, stdio: 'inherit' });
    child.on('close', (code) => (code === 0 ? resolvePromise() : reject(new Error(`psql exit ${code}`))));
    child.on('error', reject);
  });
}

export async function restorePostgres(): Promise<void> {
  const dbUrl = env.databaseUrl();
  const schemaFile = resolve(paths.migration, 'schema.sql');
  const dataFile = resolve(paths.migration, 'updated_data.sql');
  const fallbackData = resolve(paths.database, 'data.sql');

  try {
    await access(schemaFile);
    log('Applying schema...');
    await runPsql(dbUrl, schemaFile);
  } catch {
    const backupSchema = resolve(paths.database, 'schema.sql');
    log('Using backup/database/schema.sql');
    await runPsql(dbUrl, backupSchema);
  }

  try {
    await access(dataFile);
    log('Applying updated_data.sql...');
    await runPsql(dbUrl, dataFile);
  } catch {
    try {
      await access(fallbackData);
      log('Applying data.sql...');
      await runPsql(dbUrl, fallbackData);
    } catch (e) {
      error('No data file found for restore', e);
    }
  }

  log('Restore complete. Run verify-migration to validate.');
}
