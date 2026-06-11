import { describe, it, expect } from 'vitest';
import { faqBulkDeleteSchema } from '../../src/common/validation/fitness-schemas.js';

describe('faqBulkDeleteSchema', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  it('accepts a non-empty array of UUIDs', () => {
    const result = faqBulkDeleteSchema.parse({ ids: [validId] });
    expect(result).toEqual({ ids: [validId] });
  });

  it('rejects an empty ids array', () => {
    expect(() => faqBulkDeleteSchema.parse({ ids: [] })).toThrow();
  });

  it('rejects non-UUID ids', () => {
    expect(() => faqBulkDeleteSchema.parse({ ids: ['not-a-uuid'] })).toThrow();
  });

  it('rejects missing ids', () => {
    expect(() => faqBulkDeleteSchema.parse({})).toThrow();
  });
});
