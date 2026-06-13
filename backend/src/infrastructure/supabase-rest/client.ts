import { env } from '../../config/env.js';

function headers(): Record<string, string> {
  const key = env.supabaseServiceKey();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

async function restGet<T>(path: string): Promise<T> {
  const url = `${env.supabaseUrl}/rest/v1/${path}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase REST ${path}: ${res.status} ${text}`);
  }
  return res.json() as T;
}

export async function restOne<T>(table: string, query: string): Promise<T | null> {
  const sep = query.includes('?') ? '&' : '?';
  const rows = await restGet<T[]>(`${table}${query}${sep}limit=1`);
  return rows[0] ?? null;
}

/** True when the query already includes PostgREST limit/offset (via restPaginationSuffix). */
function queryHasPaginationLimit(query: string): boolean {
  return /(?:^|[?&])limit=\d+/.test(query);
}

export async function restList<T>(table: string, query = ''): Promise<T[]> {
  // Paginated list reads append limit/offset once — do not batch-fetch every row.
  if (queryHasPaginationLimit(query)) {
    return restGet<T[]>(`${table}${query}`);
  }

  const pageSize = 1000;
  const all: T[] = [];
  let offset = 0;
  while (true) {
    const sep = query.includes('?') ? '&' : '?';
    const path = `${table}${query}${sep}limit=${pageSize}&offset=${offset}`;
    const batch = await restGet<T[]>(path);
    if (!batch.length) break;
    all.push(...batch);
    offset += batch.length;
    if (batch.length < pageSize) break;
  }
  return all;
}

async function restMutate<T>(
  method: 'POST' | 'PATCH' | 'DELETE',
  table: string,
  query: string,
  body?: Record<string, unknown>
): Promise<T> {
  const url = `${env.supabaseUrl}/rest/v1/${table}${query}`;
  const res = await fetch(url, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase REST ${method} ${table}: ${res.status} ${text}`);
  }
  if (method === 'DELETE') return undefined as T;
  const data = (await res.json()) as T[] | T;
  return Array.isArray(data) ? data[0] : data;
}

export async function restCreate<T>(
  table: string,
  body: Record<string, unknown>
): Promise<T> {
  return restMutate<T>('POST', table, '', body);
}

export async function restPatch<T>(
  table: string,
  id: string,
  body: Record<string, unknown>
): Promise<T> {
  const row = await restMutate<T>('PATCH', table, `?id=eq.${encodeURIComponent(id)}`, body);
  if (row == null) {
    throw new Error(`Supabase REST PATCH ${table} returned no rows for id ${id}`);
  }
  return row;
}

export async function restDelete(table: string, id: string): Promise<void> {
  await restMutate<void>('DELETE', table, `?id=eq.${encodeURIComponent(id)}`);
}

export async function restDeleteWhere(table: string, query: string): Promise<void> {
  await restMutate<void>('DELETE', table, query.startsWith('?') ? query : `?${query}`);
}

export async function restBulkCreate(
  table: string,
  rows: Record<string, unknown>[]
): Promise<void> {
  if (rows.length === 0) return;
  const url = `${env.supabaseUrl}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase REST bulk POST ${table}: ${res.status} ${text}`);
  }
}

export async function restReplaceRows(
  table: string,
  deleteQuery: string,
  rows: Record<string, unknown>[]
): Promise<void> {
  await restDeleteWhere(table, deleteQuery);
  if (rows.length > 0) {
    await restBulkCreate(table, rows);
  }
}
