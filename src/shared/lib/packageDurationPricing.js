function parsePrice(value) {
  if (value == null || value === '') return null;
  const num = parseFloat(value);
  return Number.isFinite(num) ? Math.round(num) : null;
}

function readTierPrice(pkg, snakeKey, camelKey, altSnakeKey) {
  return parsePrice(pkg[snakeKey] ?? pkg[camelKey] ?? pkg[altSnakeKey]);
}

/**
 * Returns { egp, usd } for the given subscription duration (1, 3, or 6 months).
 * Falls back to monthly price × months when tier-specific prices are unset.
 */
export function getPackageDurationPrice(pkg, months) {
  const m = Number(months) || 1;
  const egp1 = readTierPrice(pkg, 'price_egp', 'priceEgp');
  const usd1 = readTierPrice(pkg, 'price_usd', 'priceUsd');

  if (m === 1) {
    return { egp: egp1, usd: usd1 };
  }

  if (m === 3) {
    const egp3 = readTierPrice(pkg, 'price_egp_3m', 'priceEgp3m', 'price_egp3m');
    const usd3 = readTierPrice(pkg, 'price_usd_3m', 'priceUsd3m', 'price_usd3m');
    return {
      egp: egp3 ?? (egp1 != null ? Math.round(egp1 * 3) : null),
      usd: usd3 ?? (usd1 != null ? Math.round(usd1 * 3) : null),
    };
  }

  if (m === 6) {
    const egp6 = readTierPrice(pkg, 'price_egp_6m', 'priceEgp6m', 'price_egp6m');
    const usd6 = readTierPrice(pkg, 'price_usd_6m', 'priceUsd6m', 'price_usd6m');
    return {
      egp: egp6 ?? (egp1 != null ? Math.round(egp1 * 6) : null),
      usd: usd6 ?? (usd1 != null ? Math.round(usd1 * 6) : null),
    };
  }

  return {
    egp: egp1 != null ? Math.round(egp1 * m) : null,
    usd: usd1 != null ? Math.round(usd1 * m) : null,
  };
}
