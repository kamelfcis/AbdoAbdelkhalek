import { z } from 'zod';

function toCamelKey(key: string): string {
  return key.includes('_') ? key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()) : key;
}

function normalizeBodyKeys(input: unknown): unknown {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (v === undefined) continue;
    out[toCamelKey(k)] = v;
  }
  return out;
}

/** Accept camelCase or snake_case keys from dashboard / legacy clients. */
export function bodyWithAliases<T extends z.ZodRawShape>(shape: T) {
  return z.preprocess(normalizeBodyKeys, z.object(shape));
}
