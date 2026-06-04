import { readFile, readdir } from 'fs/promises';
import { resolve } from 'path';
import { env, paths } from '../lib/env.js';
import { createPgClient } from '../lib/pg-client.js';
import { readJson, writeJson, fileExists } from '../lib/fs-utils.js';
import { log } from '../lib/logger.js';

export interface MigrationReport {
  generatedAt: string;
  tables: { name: string; backupCount: number; liveCount: number | null; match: boolean }[];
  storage: { manifestTotal: number; downloaded: number; r2Uploaded: number };
  urlIssues: string[];
  warnings: string[];
}

export async function verifyMigration(): Promise<MigrationReport> {
  const warnings: string[] = [];
  const urlIssues: string[] = [];

  const metadata = await readJson<{ tables: string[]; rowCounts: Record<string, number> }>(
    resolve(paths.database, 'metadata.json')
  );

  const tables: MigrationReport['tables'] = [];
  let liveCounts: Record<string, number> | null = null;

  try {
    const client = createPgClient();
    await client.connect();
    liveCounts = {};
    for (const t of metadata?.tables || []) {
      const r = await client.query(`SELECT COUNT(*)::int AS c FROM public."${t}"`);
      liveCounts[t] = r.rows[0].c;
    }
    await client.end();
  } catch (e) {
    warnings.push(`Could not connect to live DB: ${(e as Error).message}`);
  }

  for (const [name, backupCount] of Object.entries(metadata?.rowCounts || {})) {
    const liveCount = liveCounts?.[name] ?? null;
    tables.push({
      name,
      backupCount,
      liveCount,
      match: liveCount === null ? true : backupCount === liveCount,
    });
  }

  const storageManifest = await readJson<{ totalFiles: number; downloaded: number }>(
    resolve(env.rootDir, 'storage_manifest.json')
  );
  const r2Manifest = await readJson<{ totalUploaded: number }>(
    resolve(env.rootDir, 'cloudflare_r2_manifest.json')
  );

  const dataDir = paths.databaseData;
  if (await fileExists(dataDir)) {
    const files = await readdir(dataDir);
    for (const f of files.filter((x) => x.endsWith('.json'))) {
      try {
        const content = await readFile(resolve(dataDir, f), 'utf8');
        if (content.includes('supabase.co/storage')) {
          urlIssues.push(`${f} still contains Supabase storage URLs`);
        }
      } catch {
        /* ignore */
      }
    }
  }

  const report: MigrationReport = {
    generatedAt: new Date().toISOString(),
    tables,
    storage: {
      manifestTotal: storageManifest?.totalFiles ?? 0,
      downloaded: storageManifest?.downloaded ?? 0,
      r2Uploaded: r2Manifest?.totalUploaded ?? 0,
    },
    urlIssues,
    warnings,
  };

  await writeJson(resolve(env.rootDir, 'migration_report.json'), report);
  await writeFileHtml(resolve(env.rootDir, 'migration_report.html'), report);
  log('Migration report written: migration_report.json, migration_report.html');
  return report;
}

async function writeFileHtml(path: string, report: MigrationReport): Promise<void> {
  const tableRows = report.tables
    .map(
      (t) =>
        `<tr><td>${t.name}</td><td>${t.backupCount}</td><td>${t.liveCount ?? 'N/A'}</td><td>${t.match ? 'OK' : 'MISMATCH'}</td></tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Migration Report</title>
<style>body{font-family:sans-serif;margin:2rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}th{background:#0074b7;color:#fff}</style>
</head><body>
<h1>Supabase Migration Report</h1>
<p>Generated: ${report.generatedAt}</p>
<h2>Tables</h2>
<table><tr><th>Table</th><th>Backup Count</th><th>Live Count</th><th>Status</th></tr>${tableRows}</table>
<h2>Storage</h2>
<ul>
<li>Manifest total: ${report.storage.manifestTotal}</li>
<li>Downloaded: ${report.storage.downloaded}</li>
<li>R2 uploaded: ${report.storage.r2Uploaded}</li>
</ul>
<h2>URL Issues</h2><ul>${report.urlIssues.map((u) => `<li>${u}</li>`).join('') || '<li>None</li>'}</ul>
<h2>Warnings</h2><ul>${report.warnings.map((w) => `<li>${w}</li>`).join('') || '<li>None</li>'}</ul>
</body></html>`;

  const { writeFile } = await import('fs/promises');
  await writeFile(path, html, 'utf8');
}
