import { describe, it, expect } from 'vitest';
import {
  packageCreateSchema,
  packageUpdateSchema,
} from '../../src/common/validation/fitness-schemas.js';

const baseCreatePayload = {
  name_en: 'Silver',
  name_ar: 'فضي',
  description_en: 'Desc',
  description_ar: 'وصف',
  price_egp: 11000,
  price_usd: 280,
  priceEgp3m: 30000,
  priceUsd3m: 750,
  priceEgp6m: 55000,
  priceUsd6m: 1400,
  duration_days: 30,
  level: 'beginner',
  type: 'combined',
  features_en: ['Feature A', 'Feature B'],
  features_ar: ['ميزة أ', 'ميزة ب'],
  includes_video_feedback: true,
  daily_support: false,
};

describe('package schemas (dashboard snake_case payload)', () => {
  it('accepts dashboard create payload with duration prices', () => {
    const result = packageCreateSchema.parse(baseCreatePayload);

    expect(result).toMatchObject({
      nameEn: 'Silver',
      nameAr: 'فضي',
      priceEgp: 11000,
      priceUsd: 280,
      priceEgp3m: 30000,
      priceUsd3m: 750,
      priceEgp6m: 55000,
      priceUsd6m: 1400,
      durationDays: 30,
      level: 'beginner',
      type: 'combined',
      featuresEn: ['Feature A', 'Feature B'],
      featuresAr: ['ميزة أ', 'ميزة ب'],
      includesVideoFeedback: true,
      dailySupport: false,
    });
  });

  it('rejects create when 3-month is enabled without tier prices', () => {
    const { priceEgp3m, priceUsd3m, ...without3mPrices } = baseCreatePayload;
    expect(() =>
      packageCreateSchema.parse({
        ...without3mPrices,
        allow3Months: true,
        allow6Months: false,
      })
    ).toThrow(/priceEgp3m and priceUsd3m/);
  });

  it('accepts dashboard PATCH payload with duration prices', () => {
    const result = packageUpdateSchema.parse({
      name_en: 'Updated',
      name_ar: 'محدث',
      price_egp: 12000,
      priceEgp3m: 33000,
      priceUsd3m: 800,
      duration_days: 45,
      type: 'training',
      allow3Months: true,
    });

    expect(result).toMatchObject({
      nameEn: 'Updated',
      nameAr: 'محدث',
      priceEgp: 12000,
      priceEgp3m: 33000,
      priceUsd3m: 800,
      durationDays: 45,
      type: 'training',
    });
  });

  it('rejects update when enabling 3-month with only one tier price', () => {
    expect(() =>
      packageUpdateSchema.parse({
        allow3Months: true,
        priceEgp3m: 1400,
      })
    ).toThrow(/priceEgp3m and priceUsd3m/);
  });
});

describe('squash package schemas (fitness parity + is_active)', () => {
  const squashCreatePayload = {
    ...baseCreatePayload,
    is_active: true,
  };

  it('accepts squash create payload with tier prices and is_active', async () => {
    const { packageCreateSchema: squashPackageCreateSchema } = await import(
      '../../src/common/validation/squash-schemas.js'
    );
    const result = squashPackageCreateSchema.parse(squashCreatePayload);

    expect(result).toMatchObject({
      nameEn: 'Silver',
      priceEgp: 11000,
      priceUsd: 280,
      isActive: true,
    });
  });

  it('accepts squash update with is_active only', async () => {
    const { packageUpdateSchema: squashPackageUpdateSchema } = await import(
      '../../src/common/validation/squash-schemas.js'
    );
    const result = squashPackageUpdateSchema.parse({ is_active: false });

    expect(result).toMatchObject({ isActive: false });
  });
});
