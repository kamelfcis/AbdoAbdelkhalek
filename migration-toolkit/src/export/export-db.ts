import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import pg from 'pg';
import PQueue from 'p-queue';
import { env, paths } from '../lib/env.js';
import { createPgClient } from '../lib/pg-client.js';
import { ensureDir, writeJson, escapeSqlString, appendLine } from '../lib/fs-utils.js';
import { loadCheckpoint, saveCheckpoint, type TableCheckpoint } from '../lib/checkpoint.js';
import { log, error } from '../lib/logger.js';

const SENSITIVE_COLUMNS: Record<string, string[]> = {
  users: ['password'],
};

const SKIP_TABLES = new Set(['schema_migrations']);

async function runPgDump(args: string[], outFile: string): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const dbUrl = env.databaseUrl();
    const child = spawn('pg_dump', [dbUrl, ...args.split(' ')], {
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const out = createWriteStream(outFile);
    child.stdout.pipe(out);
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`pg_dump failed (${code}): ${stderr}`));
    });
    child.on('error', (e) => {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        reject(new Error('pg_dump not found. Install PostgreSQL client tools.'));
      } else reject(e);
    });
  });
}

async function dumpSchemaFallback(client: pg.Client): Promise<void> {
  log('pg_dump unavailable or failed — using SQL metadata export for schema hints');
  const tables = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  await writeFile(
    resolve(paths.database, 'schema-tables.txt'),
    tables.rows.map((r) => r.tablename).join('\n'),
    'utf8'
  );
}

async function exportPoliciesAndFunctions(client: pg.Client): Promise<void> {
  const policies = await client.query(`
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies WHERE schemaname IN ('public', 'storage')
    ORDER BY schemaname, tablename, policyname
  `);
  const policySql = policies.rows
    .map(
      (p) =>
        `-- Policy: ${p.schemaname}.${p.tablename}.${p.policyname}\n` +
        `-- CMD: ${p.cmd} | Roles: ${JSON.stringify(p.roles)}\n`
    )
    .join('\n');
  await writeFile(resolve(paths.database, 'policies.sql'), policySql || '-- No RLS policies found\n', 'utf8');

  const functions = await client.query(`
    SELECT n.nspname AS schema, p.proname AS name, pg_get_functiondef(p.oid) AS def
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname IN ('public', 'auth', 'storage')
      AND p.prokind IN ('f', 'p')
    ORDER BY n.nspname, p.proname
  `);
  const fnSql = functions.rows.map((f) => `${f.def};\n`).join('\n');
  await writeFile(resolve(paths.database, 'functions.sql'), fnSql || '-- No functions\n', 'utf8');
}

async function exportTableData(
  client: pg.Client,
  table: string,
  pageSize: number
): Promise<number> {
  const cp = (await loadCheckpoint(table)) || {
    table,
    offset: 0,
    totalExported: 0,
    completed: false,
    updatedAt: new Date().toISOString(),
  };

  if (cp.completed) {
    log(`Table ${table} already exported (checkpoint)`);
    return cp.totalExported;
  }

  const skipCols = SENSITIVE_COLUMNS[table] || [];
  const colResult = await client.query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
    [table]
  );
  const columns = colResult.rows
    .map((r) => r.column_name as string)
    .filter((c) => !skipCols.includes(c));

  if (columns.length === 0) return 0;

  const countRes = await client.query(`SELECT COUNT(*)::int AS c FROM public."${table}"`);
  const totalRows = countRes.rows[0].c as number;

  const jsonPath = resolve(paths.databaseData, `${table}.json`);
  const jsonNdPath = resolve(paths.databaseData, `${table}.jsonl`);
  const csvPath = resolve(paths.databaseData, `${table}.csv`);
  const sqlPath = resolve(paths.databaseData, `${table}.sql`);

  if (cp.offset === 0) {
    await writeFile(csvPath, columns.join(',') + '\n', 'utf8');
    await writeFile(sqlPath, `-- Data for ${table}\n`, 'utf8');
  }

  let offset = cp.offset;

  while (offset < totalRows) {
    const orderCol = columns.includes('id') ? 'id' : columns[0];
    const query = `SELECT ${columns.map((c) => `"${c}"`).join(', ')}
      FROM public."${table}" ORDER BY "${orderCol}" LIMIT $1 OFFSET $2`;
    const { rows } = await client.query(query, [pageSize, offset]);

    for (const row of rows) {
      await appendLine(jsonNdPath, JSON.stringify(row));

      const csvVals = columns.map((c) => {
        const v = row[c];
        if (v === null) return '';
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

    offset += rows.length;
    cp.offset = offset;
    cp.totalExported = offset;
    await saveCheckpoint(cp);
    log(`  ${table}: ${offset}/${totalRows}`);
    if (rows.length < pageSize) break;
  }

  const { readFile } = await import('fs/promises');
  try {
    const nd = await readFile(jsonNdPath, 'utf8');
    const rows = nd
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    await writeFile(jsonPath, JSON.stringify(rows, null, 2), 'utf8');
  } catch {
    await writeFile(jsonPath, '[]', 'utf8');
  }

  cp.completed = true;
  await saveCheckpoint(cp);
  return cp.totalExported;
}

export async function exportDatabase(): Promise<void> {
  await ensureDir(paths.database);
  await ensureDir(paths.databaseData);

  if (process.env.EXPORT_USE_REST === 'true') {
    const { exportDatabaseViaRest } = await import('./export-db-rest.js');
    await exportDatabaseViaRest();
    return;
  }

  log('Exporting database schema via pg_dump (optional)...');
  try {
    await runPgDump(
      '--schema-only --no-owner --no-privileges --schema=public',
      resolve(paths.database, 'schema.sql')
    );
    await runPgDump(
      '--schema-only --no-owner --no-privileges --schema=auth',
      resolve(paths.database, 'auth_schema.sql')
    );
    await runPgDump(
      '--data-only --no-owner --schema=public --inserts',
      resolve(paths.database, 'data.sql')
    );
  } catch (e) {
    error('pg_dump skipped (install PostgreSQL client for full schema.sql)', e);
  }

  const client = createPgClient();
  try {
    await client.connect();
  } catch (connectErr) {
    error('Postgres connection failed — falling back to Supabase REST export', connectErr);
    const { exportDatabaseViaRest } = await import('./export-db-rest.js');
    await exportDatabaseViaRest();
    return;
  }

  try {
    await dumpSchemaFallback(client);
    await exportPoliciesAndFunctions(client);

    const tablesRes = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );
    const tables = tablesRes.rows
      .map((r) => r.tablename as string)
      .filter((t) => !SKIP_TABLES.has(t));

    const extensions = await client.query(`SELECT extname, extversion FROM pg_extension`);
    const publications = await client.query(`SELECT pubname FROM pg_publication`);

    const counts: Record<string, number> = {};
    for (const t of tables) {
      const c = await client.query(`SELECT COUNT(*)::int AS c FROM public."${t}"`);
      counts[t] = c.rows[0].c;
    }

    await writeJson(resolve(paths.database, 'metadata.json'), {
      exportedAt: new Date().toISOString(),
      projectRef: env.projectRef,
      tables,
      rowCounts: counts,
      extensions: extensions.rows,
      publications: publications.rows.map((r) => r.pubname),
      sensitiveColumnsSkipped: SENSITIVE_COLUMNS,
    });

    log(`Exporting ${tables.length} tables (paginated)...`);
    const queue = new PQueue({ concurrency: env.exportMaxConcurrency });
    await Promise.all(
      tables.map((table) =>
        queue.add(() => exportTableData(client, table, env.exportPageSize))
      )
    );

    log('Database export complete.');
  } finally {
    await client.end();
  }
}
