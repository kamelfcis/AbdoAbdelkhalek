import { toCamelKeys, toSnakeKeys } from '../../common/utils/case-map.js';

export function packageData(data: Record<string, unknown>, mode: 'create' | 'update' = 'create') {
  const camel = toCamelKeys(data);
  if (camel.type !== undefined && camel.packageType === undefined) {
    camel.packageType = camel.type;
    delete camel.type;
  }
  if (mode === 'create') {
    if (camel.priceEgp == null) camel.priceEgp = 0;
    if (camel.priceUsd == null) camel.priceUsd = 0;
  }
  return camel;
}

export function packageToRest(data: Record<string, unknown>, mode: 'create' | 'update' = 'update') {
  const snake = toSnakeKeys(packageData(data, mode));
  if (snake.package_type !== undefined) {
    snake.type = snake.package_type;
    delete snake.package_type;
  }
  const durationPriceAliases: Record<string, string> = {
    price_egp3m: 'price_egp_3m',
    price_usd3m: 'price_usd_3m',
    price_egp6m: 'price_egp_6m',
    price_usd6m: 'price_usd_6m',
  };
  for (const [from, to] of Object.entries(durationPriceAliases)) {
    if (snake[from] !== undefined) {
      snake[to] = snake[from];
      delete snake[from];
    }
  }
  return snake;
}

export function assertPackageWriteResult<T>(row: T | null | undefined, id: string, action: string): T {
  if (row == null) {
    throw new Error(`Package ${action} returned no row for id ${id}`);
  }
  return row;
}

function featuresToLegacyText(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value == null) return null;
  if (Array.isArray(value)) return value.length ? value.join('\n') : null;
  if (typeof value === 'string') return value || null;
  return String(value);
}

/** Pre-migration squash_packages columns (legacy price + TEXT features). */
export function squashPackageLegacyRest(
  data: Record<string, unknown>,
  mode: 'create' | 'update' = 'update'
) {
  const camel = packageData(data, mode);
  const legacy: Record<string, unknown> = {};

  const set = (key: string, val: unknown) => {
    if (val !== undefined) legacy[key] = val;
  };

  set('name_en', camel.nameEn);
  set('name_ar', camel.nameAr);
  set('description_en', camel.descriptionEn);
  set('description_ar', camel.descriptionAr);
  set('duration_days', camel.durationDays);
  set('is_active', camel.isActive);

  const price = camel.priceEgp ?? camel.priceUsd ?? camel.price;
  if (price != null) legacy.price = price;

  const featuresEn = featuresToLegacyText(camel.featuresEn);
  if (featuresEn !== undefined) legacy.features_en = featuresEn;
  const featuresAr = featuresToLegacyText(camel.featuresAr);
  if (featuresAr !== undefined) legacy.features_ar = featuresAr;

  if (mode === 'update' && camel.updatedAt instanceof Date) {
    legacy.updated_at = camel.updatedAt.toISOString();
  }

  return legacy;
}

export function isSchemaMismatchError(err: unknown): boolean {
  if (err == null || typeof err !== 'object') {
    const msg = String(err);
    return msg.includes('does not exist') || msg.includes('42703');
  }
  const code = (err as { code?: string }).code;
  if (code === 'P2022' || code === 'P2010') return true;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('does not exist') ||
    msg.includes('Unknown argument') ||
    msg.includes('42703') ||
    (msg.includes('column') && msg.includes('not found'))
  );
}
