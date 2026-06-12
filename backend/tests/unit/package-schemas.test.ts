import { describe, it, expect } from 'vitest';
import {
  packageCreateSchema,
  packageUpdateSchema,
} from '../../src/common/validation/fitness-schemas.js';

describe('package schemas (dashboard snake_case payload)', () => {
  it('accepts dashboard create payload', () => {
    const result = packageCreateSchema.parse({
      name_en: 'Silver',
      name_ar: 'فضي',
      description_en: 'Desc',
      description_ar: 'وصف',
      price_egp: 11000,
      price_usd: 280,
      duration_days: 30,
      level: 'beginner',
      type: 'combined',
      features_en: ['Feature A', 'Feature B'],
      features_ar: ['ميزة أ', 'ميزة ب'],
      includes_video_feedback: true,
      daily_support: false,
    });

    expect(result).toMatchObject({
      nameEn: 'Silver',
      nameAr: 'فضي',
      priceEgp: 11000,
      priceUsd: 280,
      durationDays: 30,
      level: 'beginner',
      type: 'combined',
      featuresEn: ['Feature A', 'Feature B'],
      featuresAr: ['ميزة أ', 'ميزة ب'],
      includesVideoFeedback: true,
      dailySupport: false,
    });
  });

  it('accepts dashboard PATCH payload', () => {
    const result = packageUpdateSchema.parse({
      name_en: 'Updated',
      name_ar: 'محدث',
      price_egp: 12000,
      duration_days: 45,
      type: 'training',
    });

    expect(result).toMatchObject({
      nameEn: 'Updated',
      nameAr: 'محدث',
      priceEgp: 12000,
      durationDays: 45,
      type: 'training',
    });
  });
});
