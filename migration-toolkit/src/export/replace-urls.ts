import { readFile, writeFile, readdir } from 'fs/promises';
import { resolve } from 'path';
import { env, paths } from '../lib/env.js';
import { ensureDir, readJson } from '../lib/fs-utils.js';
import { log } from '../lib/logger.js';
import type { UrlMapping } from './upload-r2.js';

const SUPABASE_STORAGE_PATTERN =
  /https?:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/([^?\s"']+)/gi;

function replaceInText(text: string, mappings: Map<string, string>): string {
  let result = text;
  for (const [oldUrl, newUrl] of mappings) {
    result = result.split(oldUrl).join(newUrl);
  }
  result = result.replace(SUPABASE_STORAGE_PATTERN, (_, pathPart: string) => {
    return `${env.cdnBaseUrl}/${pathPart}`;
  });
  return result;
}

export async function replaceUrls(): Promise<void> {
  await ensureDir(paths.migration);

  const mappingFile = resolve(env.rootDir, 'url_mapping.json');
  const mappingsArr = (await readJson<UrlMapping[]>(mappingFile)) || [];
  const mappingMap = new Map<string, string>();
  for (const m of mappingsArr) {
    mappingMap.set(m.old_url, m.new_url);
  }

  const dataDir = paths.databaseData;
  const sqlChunks: string[] = ['-- URL replacements for Supabase storage -> CDN\n'];

  try {
    const files = await readdir(dataDir);
    for (const file of files) {
      if (!file.endsWith('.json') && !file.endsWith('.sql') && !file.endsWith('.csv')) continue;
      const filePath = resolve(dataDir, file);
      const content = await readFile(filePath, 'utf8');
      const updated = replaceInText(content, mappingMap);
      if (updated !== content) {
        await writeFile(filePath.replace(/(\.[^.]+)$/, '.migrated$1'), updated, 'utf8');
        sqlChunks.push(`-- Updated references in ${file}\n`);
      }
    }
  } catch {
    log('No data directory yet — skipping per-file URL replace');
  }

  const mainDataSql = resolve(paths.database, 'data.sql');
  try {
    let dataSql = await readFile(mainDataSql, 'utf8');
    dataSql = replaceInText(dataSql, mappingMap);
    await writeFile(resolve(paths.migration, 'updated_data.sql'), dataSql, 'utf8');
    log('Wrote migration/postgresql/updated_data.sql');
  } catch {
    await writeFile(
      resolve(paths.migration, 'updated_data.sql'),
      sqlChunks.join('\n') + '\n-- Run after url_mapping.json is generated\n',
      'utf8'
    );
  }

  log(`URL replacement done. ${mappingMap.size} explicit mappings applied.`);
}
