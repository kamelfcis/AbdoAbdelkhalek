const FLAG_EG = 'https://flagcdn.com/w40/eg.png';
const FLAG_US = 'https://flagcdn.com/w40/us.png';

function formatAmount(value) {
  if (value == null || value === '') return null;
  const num = Number(value);
  if (!Number.isNaN(num)) {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return String(value);
}

/**
 * Format package prices for display (HTML) with flag icons.
 */
export function formatPrice(priceEgp, priceUsd) {
  const items = [];

  const egpAmount = formatAmount(priceEgp);
  if (egpAmount != null) {
    items.push(`
      <span class="currency-item-simple">
        <img class="currency-flag-simple" src="${FLAG_EG}" alt="EG" width="24" height="18" loading="lazy" />
        <span class="currency-amount-simple">${egpAmount}</span>
        <span class="currency-code-simple">EGP</span>
      </span>
    `);
  }

  const usdAmount = formatAmount(priceUsd);
  if (usdAmount != null) {
    items.push(`
      <span class="currency-item-simple">
        <img class="currency-flag-simple" src="${FLAG_US}" alt="US" width="24" height="18" loading="lazy" />
        <span class="currency-amount-simple">${usdAmount}</span>
        <span class="currency-code-simple">USD</span>
      </span>
    `);
  }

  if (!items.length) return '<span>—</span>';

  return `<span class="simple-currency-display">${items.join('<span class="currency-separator-simple">/</span>')}</span>`;
}
