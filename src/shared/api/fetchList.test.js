import { describe, it, expect } from 'vitest';
import {
  normalizeListResponse,
  filtersFromCrudState,
  filtersFromSubscriptionState,
  buildListApiParams,
  buildQueryString,
} from './listUtils';

describe('normalizeListResponse', () => {
  it('wraps plain arrays', () => {
    expect(normalizeListResponse([1, 2, 3])).toEqual({ items: [1, 2, 3], total: 3 });
  });

  it('passes through paginated envelopes', () => {
    expect(normalizeListResponse({ items: ['a'], total: 50, limit: 10, offset: 0 })).toEqual({
      items: ['a'],
      total: 50,
      limit: 10,
      offset: 0,
    });
  });

  it('handles empty/null input', () => {
    expect(normalizeListResponse(null)).toEqual({ items: [], total: 0 });
  });
});

describe('filtersFromCrudState', () => {
  it('maps status and featured filters to API params', () => {
    expect(
      filtersFromCrudState({
        search: ' yoga ',
        statusFilter: 'public',
        featuredFilter: 'featured',
        categoryId: 'cat-1',
      })
    ).toEqual({
      search: 'yoga',
      is_public: 'true',
      is_featured: 'true',
      category_id: 'cat-1',
    });
  });
});

describe('filtersFromSubscriptionState', () => {
  it('maps subscription filters to API params', () => {
    expect(
      filtersFromSubscriptionState({
        search: ' ali ',
        statusFilter: 'active',
        packageId: 'pkg-1',
        startDateFrom: '2025-01-01',
        endDateTo: '2025-12-31',
      })
    ).toEqual({
      search: 'ali',
      status: 'active',
      package_id: 'pkg-1',
      start_date_from: '2025-01-01',
      end_date_to: '2025-12-31',
    });
  });
});

describe('buildListApiParams', () => {
  it('computes offset from page and limit', () => {
    expect(buildListApiParams(3, 10, { search: 'test' })).toEqual({
      limit: 10,
      offset: 20,
      search: 'test',
    });
  });

  it('forwards subscription filter params', () => {
    expect(
      buildListApiParams(1, 10, {
        search: 'sara',
        status: 'paused',
        package_id: 'pkg-2',
        end_date_from: '2025-06-01',
      })
    ).toEqual({
      limit: 10,
      offset: 0,
      search: 'sara',
      status: 'paused',
      package_id: 'pkg-2',
      end_date_from: '2025-06-01',
    });
  });

  it('maps all video dashboard filters to API query params', () => {
    const filters = filtersFromCrudState({
      search: 'Stretch',
      statusFilter: 'private',
      categoryId: 'cat-uuid',
    });
    expect(buildListApiParams(1, 8, filters)).toEqual({
      limit: 8,
      offset: 0,
      search: 'Stretch',
      is_public: 'false',
      category_id: 'cat-uuid',
    });
    expect(buildQueryString(buildListApiParams(1, 8, filters))).toBe(
      '?limit=8&offset=0&search=Stretch&is_public=false&category_id=cat-uuid'
    );
  });
});
