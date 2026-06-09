/** Dedupe rows by id. */
export function dedupeById<T extends { id: string }>(rows: T[]): T[] {
  const map = new Map(rows.map((row) => [row.id, row]));
  return [...map.values()];
}

/** Strict grants when any access rows exist; otherwise public catalog only. */
export function resolveAccessibleContent<T extends { id: string }>(opts: {
  hasExplicitAccess: boolean;
  publicItems: T[];
  grantedItems: T[];
}): T[] {
  const { hasExplicitAccess, publicItems, grantedItems } = opts;
  if (hasExplicitAccess) {
    return dedupeById(grantedItems);
  }
  return dedupeById(publicItems);
}
