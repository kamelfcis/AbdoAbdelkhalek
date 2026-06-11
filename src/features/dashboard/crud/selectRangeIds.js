/**
 * Inclusive range of page row ids between two row indices (for shift-click selection).
 */
export function selectRangeIds(pageIds, fromIndex, toIndex) {
  if (!pageIds?.length || fromIndex == null || toIndex == null) return [];
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  return pageIds.slice(start, end + 1);
}
