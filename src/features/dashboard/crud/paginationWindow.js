/**
 * Build a compact page list with ellipsis for long ranges.
 * @returns {(number | 'ellipsis')[]}
 */
export function getPaginationWindow(page, pageCount, maxVisible = 7) {
  if (pageCount <= 0) return [];
  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const pages = new Set([1, pageCount]);

  for (let i = page - 1; i <= page + 1; i += 1) {
    if (i >= 1 && i <= pageCount) pages.add(i);
  }

  if (page <= 3) {
    for (let i = 2; i <= Math.min(4, pageCount - 1); i += 1) pages.add(i);
  }

  if (page >= pageCount - 2) {
    for (let i = Math.max(pageCount - 3, 2); i <= pageCount - 1; i += 1) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const window = [];
  let prev = null;

  for (const pageNum of sorted) {
    if (prev !== null && pageNum - prev > 1) {
      window.push('ellipsis');
    }
    window.push(pageNum);
    prev = pageNum;
  }

  return window;
}
