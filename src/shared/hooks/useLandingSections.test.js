import { describe, it, expect } from 'vitest';
import {
  isSectionVisible,
  isSlugVisible,
  getLandingSectionsForDomain,
} from '../config/landingSections';

describe('isSectionVisible', () => {
  it('returns true when key is missing (default visible)', () => {
    expect(isSectionVisible({}, 'reviews')).toBe(true);
    expect(isSectionVisible(undefined, 'reviews')).toBe(true);
  });

  it('returns false only when explicitly false', () => {
    expect(isSectionVisible({ reviews: false }, 'reviews')).toBe(false);
    expect(isSectionVisible({ reviews: true }, 'reviews')).toBe(true);
  });
});

describe('isSlugVisible', () => {
  it('respects toggleable section visibility', () => {
    expect(isSlugVisible({ reviews: false }, 'reviews')).toBe(false);
    expect(isSlugVisible({ reviews: true }, 'reviews')).toBe(true);
  });

  it('always shows non-toggleable slugs', () => {
    expect(isSlugVisible({ categories: false }, 'home')).toBe(true);
    expect(isSlugVisible({ categories: false }, 'about-me')).toBe(true);
  });
});

describe('getLandingSectionsForDomain', () => {
  it('returns 6 fitness sections and 7 squash sections', () => {
    expect(getLandingSectionsForDomain('fitness')).toHaveLength(6);
    expect(getLandingSectionsForDomain('squash')).toHaveLength(7);
  });
});
