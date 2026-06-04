import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { env, paths } from '../lib/env.js';
import { ensureDir, writeJson, escapeSqlString, appendLine } from '../lib/fs-utils.js';
import { log } from '../lib/logger.js';

const PUBLIC_TABLES = [
  'users',
  'categories',
  'videos',
  'packages',
  'subscriptions',
  'reviews',
  'success_stories',
  'faqs',
  'user_video_access',
  'user_category_access',
];

const SENSITIVE_COLUMNS: Record<string, string[]> = {
  users: ['password'],
};

async function supabaseHeaders(): Promise<Record<string, string>> {
  const key = env.supabaseServiceKey();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

async function fetchAllRows(table: string, pageSize: number): Promise<Record<string, unknown>[]> {
  const headers = await supabaseHeaders();
  const rows: Record<string, unknown>[] = [];
  let offset = 0;

  while (true) {
    const url = `${env.supabaseUrl}/rest/v1/${table}?select=*&limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`REST ${table} failed ${res.status}: ${text}`);
    }
    const batch = (await res.json()) as Record<string, unknown>[];
    if (!batch.length) break;
    rows.push(...batch);
    offset += batch.length;
    log(`  ${table}: ${rows.length} rows`);
    if (batch.length < pageSize) break;
  }

  return rows;
}

function stripSensitive(table: string, rows: Record<string, unknown>[]): Record<string, unknown>[] {
  const cols = SENSITIVE_COLUMNS[table];
  if (!cols) return rows;
  return rows.map((row) => {
    const copy = { ...row };
    for (const c of cols) delete copy[c];
    return copy;
  });
}

async function writeTableExports(table: string, rows: Record<string, unknown>[]): Promise<void> {
  const jsonPath = resolve(paths.databaseData, `${table}.json`);
  const csvPath = resolve(paths.databaseData, `${table}.csv`);
  const sqlPath = resolve(paths.databaseData, `${table}.sql`);

  await writeFile(jsonPath, JSON.stringify(rows, null, 2), 'utf8');

  if (rows.length === 0) {
    await writeFile(csvPath, '', 'utf8');
    await writeFile(sqlPath, `-- No rows for ${table}\n`, 'utf8');
    return;
  }

  const columns = Object.keys(rows[0]);
  await writeFile(csvPath, columns.join(',') + '\n', 'utf8');
  await writeFile(sqlPath, `-- Data for ${table}\n`, 'utf8');

  for (const row of rows) {
    const csvVals = columns.map((c) => {
      const v = row[c];
      if (v === null || v === undefined) return '';
      const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    });
    await appendLine(csvPath, csvVals.join(','));

    const vals = columns.map((c) => escapeSqlString(row[c]));
    await appendLine(
      sqlPath,
      `INSERT INTO public."${table}" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES (${vals.join(', ')});`
    );
  }
}

export async function exportDatabaseViaRest(): Promise<void> {
  await ensureDir(paths.database);
  await ensureDir(paths.databaseData);

  log('Exporting database via Supabase REST API (Postgres direct unavailable)...');

  const counts: Record<string, number> = {};

  for (const table of PUBLIC_TABLES) {
    const raw = await fetchAllRows(table, env.exportPageSize);
    const rows = stripSensitive(table, raw);
    counts[table] = rows.length;
    await writeTableExports(table, rows);
  }

  await writeFile(
    resolve(paths.database, 'schema.sql'),
    '-- Schema not dumped via REST. Use Supabase Dashboard backup or install pg_dump with working DATABASE_URL.\n',
    'utf8'
  );

  await writeJson(resolve(paths.database, 'metadata.json'), {
    exportedAt: new Date().toISOString(),
    method: 'supabase-rest',
    projectRef: env.projectRef,
    tables: PUBLIC_TABLES,
    rowCounts: counts,
  });

  log('REST database export complete.');
}
