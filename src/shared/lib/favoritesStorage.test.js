import { describe, it, expect, beforeEach } from 'vitest';
import { favoritesStorageKey, readFavoriteIds, writeFavoriteIds } from './favoritesStorage';

describe('video favorite localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses a domain-specific key for squash', () => {
    expect(favoritesStorageKey('fitness')).toBe('traineeFavoriteVideos');
    expect(favoritesStorageKey('squash')).toBe('traineeFavoriteVideos:squash');
  });

  it('round-trips ids without breaking existing fitness key', () => {
    writeFavoriteIds('fitness', ['a', 'b']);
    expect(readFavoriteIds('fitness')).toEqual(['a', 'b']);
    expect(localStorage.getItem('traineeFavoriteVideos')).toBe(JSON.stringify(['a', 'b']));
  });
});
