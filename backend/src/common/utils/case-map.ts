/** Normalize request bodies that may use camelCase (Prisma) or snake_case (legacy). */
export function toCamelKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    const camel = k.includes('_')
      ? k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
      : k;
    out[camel] = v;
  }
  return out;
}

export function toSnakeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    const snake = k.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
    out[snake] = v;
  }
  return out;
}
