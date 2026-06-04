import { describe, it, expect } from 'vitest';
import { categoryUpdateSchema } from '../../src/common/validation/fitness-schemas.js';

describe('bodyWithAliases (snake-camel)', () => {
  it('accepts snake_case dashboard PATCH payload', () => {
    const result = categoryUpdateSchema.parse({
      name_en: 'Strength',
      name_ar: 'قوة',
      description_en: 'Desc',
      description_ar: 'وصف',
      is_public: true,
    });
    expect(result).toEqual({
      nameEn: 'Strength',
      nameAr: 'قوة',
      descriptionEn: 'Desc',
      descriptionAr: 'وصف',
      isPublic: true,
    });
  });

  it('accepts camelCase API payload', () => {
    const result = categoryUpdateSchema.parse({
      nameEn: 'Cardio',
      nameAr: 'كارديو',
    });
    expect(result).toEqual({
      nameEn: 'Cardio',
      nameAr: 'كارديو',
    });
  });

  it('rejects empty PATCH body', () => {
    expect(() => categoryUpdateSchema.parse({})).toThrow(/At least one field required/);
  });
});
