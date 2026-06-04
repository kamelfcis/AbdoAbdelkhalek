import { describe, it, expect } from 'vitest';
import {
  parsePagination,
  parseListFilters,
  toListResponse,
  isPaginatedResult,
  prismaPage,
} from '../../src/common/utils/pagination.js';

describe('parsePagination', () => {
  it('returns empty when limit and offset omitted', () => {
    expect(parsePagination({})).toEqual({});
  });

  it('parses limit and offset with caps', () => {
    expect(parsePagination({ limit: '10', offset: '5' })).toEqual({ limit: 10, offset: 5 });
    expect(parsePagination({ limit: '9999', offset: '-1' })).toEqual({ limit: 500, offset: 0 });
  });
});

describe('parseListFilters', () => {
  it('parses search and boolean filters', () => {
    expect(
      parseListFilters({
        search: '  yoga ',
        is_public: 'true',
        is_featured: 'false',
        category_id: 'abc-123',
      })
    ).toEqual({
      search: 'yoga',
      isPublic: true,
      isFeatured: false,
      categoryId: 'abc-123',
    });
  });

  it('accepts camelCase aliases and ignores category sentinel "all"', () => {
    expect(
      parseListFilters({
        search: 'plyo',
        isPublic: 'false',
        categoryId: 'all',
      })
    ).toEqual({
      search: 'plyo',
      isPublic: false,
    });
  });
});

describe('toListResponse', () => {
  it('returns plain array without pagination limit', () => {
    expect(toListResponse([1, 2], 2)).toEqual([1, 2]);
  });

  it('returns paginated envelope when limit set', () => {
    const result = toListResponse([1], 10, { limit: 5, offset: 0 });
    expect(result).toEqual({ items: [1], total: 10, limit: 5, offset: 0 });
    expect(isPaginatedResult(result)).toBe(true);
  });
});

describe('prismaPage', () => {
  it('returns take/skip when paginated', () => {
    expect(prismaPage({ limit: 10, offset: 20 })).toEqual({ take: 10, skip: 20 });
    expect(prismaPage({})).toEqual({});
  });
});
