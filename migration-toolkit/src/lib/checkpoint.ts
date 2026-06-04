import { resolve } from 'path';
import { readJson, writeJson } from './fs-utils.js';
import { paths } from './env.js';

export interface TableCheckpoint {
  table: string;
  offset: number;
  totalExported: number;
  completed: boolean;
  updatedAt: string;
}

export function checkpointPath(table: string): string {
  return resolve(paths.databaseData, `.checkpoint-${table}.json`);
}

export async function loadCheckpoint(table: string): Promise<TableCheckpoint | null> {
  return readJson<TableCheckpoint>(checkpointPath(table));
}

export async function saveCheckpoint(cp: TableCheckpoint): Promise<void> {
  cp.updatedAt = new Date().toISOString();
  await writeJson(checkpointPath(table), cp);
}
