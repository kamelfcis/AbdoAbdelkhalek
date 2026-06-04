/**
 * Format package prices for display (HTML).
 */
export function formatPrice(priceEgp, priceUsd) {
  const parts = [];
  if (priceEgp != null && priceEgp !== '') {
    parts.push(`<span>${priceEgp} EGP</span>`);
  }
  if (priceUsd != null && priceUsd !== '') {
    parts.push(`<span>$${priceUsd}</span>`);
  }
  return parts.length ? parts.join(' <span class="text-gray-400">·</span> ') : '<span>—</span>';
}
