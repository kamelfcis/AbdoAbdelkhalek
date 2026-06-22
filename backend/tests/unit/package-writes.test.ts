import { describe, expect, it } from 'vitest';
import { packageUpdateSchema } from '../../src/common/validation/fitness-schemas.js';
import {
  packageData,
  packageToRest,
  squashPackageLegacyRest,
} from '../../src/infrastructure/prisma/package-write-utils.js';

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
        priceEgp3m: 1400,
        priceUsd3m: 45,
      },
      'update'
    );

    expect(restBody.type).toBe('nutrition');
    expect(restBody.package_type).toBeUndefined();
    expect(restBody.duration_days).toBe(30);
    expect(restBody.price_egp_3m).toBe(1400);
    expect(restBody.price_usd_3m).toBe(45);
  });

  it('does not zero prices on update when omitted', () => {
    const camel = packageData({ nameEn: 'Updated' }, 'update');
    expect(camel.priceEgp).toBeUndefined();
    expect(camel.priceUsd).toBeUndefined();
    expect(camel.priceEgp3m).toBeUndefined();
    expect(camel.priceUsd3m).toBeUndefined();
    expect(camel.packageType).toBeUndefined();
  });

  it('passes duration tier prices through REST mapping', () => {
    const restBody = packageToRest(
      {
        nameEn: 'Silver Pro',
        priceEgp3m: 1400,
        priceUsd3m: 45,
        priceEgp6m: 2500,
        priceUsd6m: 80,
      },
      'update'
    );

    expect(restBody.price_egp_3m).toBe(1400);
    expect(restBody.price_usd_3m).toBe(45);
    expect(restBody.price_egp_6m).toBe(2500);
    expect(restBody.price_usd_6m).toBe(80);
  });

  it('maps dashboard type field to Prisma packageType', () => {
    const camel = packageData(
      {
        name_en: 'Squash Pro',
        type: 'training',
        level: 'intermediate',
      },
      'update'
    );

    expect(camel.packageType).toBe('training');
    expect(camel.type).toBeUndefined();
    expect(camel.level).toBe('intermediate');
  });
});

describe('squash package legacy REST payload', () => {
  it('writes legacy price and TEXT features before parity migration', () => {
    const legacy = squashPackageLegacyRest(
      {
        name_en: 'Legacy',
        name_ar: 'قديم',
        price_egp: 500,
        duration_days: 30,
        features_en: ['Line A', 'Line B'],
        is_active: true,
      },
      'update'
    );

    expect(legacy).toMatchObject({
      name_en: 'Legacy',
      name_ar: 'قديم',
      price: 500,
      duration_days: 30,
      features_en: 'Line A\nLine B',
      is_active: true,
    });
    expect(legacy.price_egp).toBeUndefined();
    expect(legacy.level).toBeUndefined();
  });
});
