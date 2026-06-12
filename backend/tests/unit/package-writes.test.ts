import { describe, expect, it } from 'vitest';
import { packageUpdateSchema } from '../../src/common/validation/fitness-schemas.js';
import { toSnakeKeys } from '../../src/common/utils/case-map.js';

function packageData(data: Record<string, unknown>, mode: 'create' | 'update' = 'create') {
  const camel: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    const key = k.includes('_') ? k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()) : k;
    camel[key] = v;
  }
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

function packageToRest(data: Record<string, unknown>, mode: 'create' | 'update' = 'update') {
  const snake = toSnakeKeys(packageData(data, mode));
  if (snake.package_type !== undefined) {
    snake.type = snake.package_type;
    delete snake.package_type;
  }
  return snake;
}

describe('package update pipeline', () => {
  it('accepts dashboard snake_case payload', () => {
    const parsed = packageUpdateSchema.parse({
      name_en: 'Silver Pro',
      name_ar: 'فضي برو',
      price_egp: 1500,
      price_usd: 50,
      duration_days: 30,
      level: 'beginner',
      type: 'combined',
      features_en: ['Feature A'],
      features_ar: ['ميزة أ'],
      includes_video_feedback: true,
      daily_support: false,
    });

    expect(parsed.nameEn).toBe('Silver Pro');
    expect(parsed.type).toBe('combined');
    expect(parsed.featuresEn).toEqual(['Feature A']);
  });

  it('maps package type to REST column name', () => {
    const restBody = packageToRest(
      {
        nameEn: 'Silver Pro',
        type: 'nutrition',
        durationDays: 30,
      },
      'update'
    );

    expect(restBody.type).toBe('nutrition');
    expect(restBody.package_type).toBeUndefined();
    expect(restBody.duration_days).toBe(30);
  });

  it('does not zero prices on update when omitted', () => {
    const camel = packageData({ nameEn: 'Updated' }, 'update');
    expect(camel.priceEgp).toBeUndefined();
    expect(camel.priceUsd).toBeUndefined();
    expect(camel.packageType).toBeUndefined();
  });
});
