import { describe, expect, it } from 'vitest';
import {
  favoriteDomainSchema,
  favoriteSyncSchema,
  favoriteToggleSchema,
} from '../../src/common/validation/favorites-schemas.js';

describe('favorites schemas', () => {
  it('accepts fitness or squash domain', () => {
    expect(favoriteDomainSchema.parse('fitness')).toBe('fitness');
    expect(favoriteDomainSchema.parse('squash')).toBe('squash');
    expect(() => favoriteDomainSchema.parse('other')).toThrow();
  });

  it('requires a uuid video id on toggle', () => {
    expect(() =>
      favoriteToggleSchema.parse({ domain: 'fitness', videoId: 'not-a-uuid' })
    ).toThrow();
    expect(
      favoriteToggleSchema.parse({
        domain: 'squash',
        videoId: '11111111-1111-4111-8111-111111111111',
      })
    ).toEqual({
      domain: 'squash',
      videoId: '11111111-1111-4111-8111-111111111111',
    });
  });

  it('caps sync lists', () => {
    const videoIds = Array.from({ length: 501 }, (_, i) => {
      const n = String(i).padStart(12, '0');
      return `11111111-1111-4111-8111-${n}`;
    });
    expect(() => favoriteSyncSchema.parse({ domain: 'fitness', videoIds })).toThrow();
  });
});
