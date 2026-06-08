import { describe, it, expect, vi } from 'vitest';
import {
  invalidateContentCrud,
  invalidateAccessCrud,
  getDashboardListQueryKey,
  queryKeys,
  readListFromCache,
  sameEntityId,
  patchPaginatedListItem,
  removePaginatedListItem,
  prependPaginatedListItem,
} from './queryKeys';

describe('getDashboardListQueryKey', () => {
  it('returns fitness dashboard categories key prefix', () => {
    expect(getDashboardListQueryKey('categories', 'fitness')).toEqual(['dashboard', 'categories']);
  });

  it('returns squash dashboard categories key prefix', () => {
    expect(getDashboardListQueryKey('categories', 'squash')).toEqual(['dashboard', 'squash', 'categories']);
  });
});

describe('queryKeys pagination', () => {
  it('includes page params in dashboard categories key', () => {
    expect(queryKeys.dashboard.categories('fitness', { page: 2, limit: 10 })).toEqual([
      'dashboard',
      'categories',
      { page: 2, limit: 10 },
    ]);
  });

  it('exposes categoriesAll key for dropdowns', () => {
    expect(queryKeys.dashboard.categoriesAll('fitness')).toEqual(['dashboard', 'categories', 'all']);
  });
});

describe('readListFromCache', () => {
  it('reads items from paginated envelope', () => {
    expect(readListFromCache({ items: [{ id: 1 }], total: 1 })).toEqual([{ id: 1 }]);
  });

  it('returns arrays as-is', () => {
    expect(readListFromCache([{ id: 1 }])).toEqual([{ id: 1 }]);
  });
});

describe('sameEntityId', () => {
  it('compares string and number ids', () => {
    expect(sameEntityId('42', 42)).toBe(true);
    expect(sameEntityId('a', 'b')).toBe(false);
  });
});

describe('patchPaginatedListItem', () => {
  it('updates matching row in paginated envelope', () => {
    const key = ['dashboard', 'categories', { page: 1 }];
    const cache = { items: [{ id: '1', name_en: 'A' }], total: 1 };
    const queryClient = {
      setQueryData: vi.fn((_, updater) => updater(cache)),
    };
    patchPaginatedListItem(queryClient, key, '1', (row) => ({ ...row, name_en: 'B' }));
    expect(queryClient.setQueryData).toHaveBeenCalled();
    const next = queryClient.setQueryData.mock.results[0].value;
    expect(next.items[0].name_en).toBe('B');
  });
});

describe('removePaginatedListItem', () => {
  it('removes row and decrements total', () => {
    const key = ['dashboard', 'categories'];
    const cache = { items: [{ id: 1 }, { id: 2 }], total: 2 };
    const queryClient = {
      setQueryData: vi.fn((_, updater) => updater(cache)),
    };
    removePaginatedListItem(queryClient, key, 1);
    const next = queryClient.setQueryData.mock.results[0].value;
    expect(next.items).toHaveLength(1);
    expect(next.items[0].id).toBe(2);
    expect(next.total).toBe(1);
  });
});

describe('prependPaginatedListItem', () => {
  it('prepends row and increments total', () => {
    const key = ['dashboard', 'categories'];
    const cache = { items: [{ id: 2 }], total: 1 };
    const queryClient = {
      setQueryData: vi.fn((_, updater) => updater(cache)),
    };
    prependPaginatedListItem(queryClient, key, { id: 1 }, 10);
    const next = queryClient.setQueryData.mock.results[0].value;
    expect(next.items[0].id).toBe(1);
    expect(next.total).toBe(2);
  });
});

describe('invalidateAccessCrud', () => {
  it('invalidates trainee-facing video and category caches for the domain', () => {
    const queryClient = {
      invalidateQueries: vi.fn(),
    };
    invalidateAccessCrud(queryClient, 'fitness');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.trainee.videos('fitness'),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.videos('fitness'),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.categories('fitness'),
    });
  });

  it('uses squash-specific trainee video key', () => {
    const queryClient = {
      invalidateQueries: vi.fn(),
    };
    invalidateAccessCrud(queryClient, 'squash');
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.trainee.videos('squash'),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.videos('squash'),
    });
  });
});

describe('invalidateContentCrud', () => {
  it('awaits all invalidations including categoriesAll', async () => {
    const queryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    };
    await invalidateContentCrud(queryClient, 'categories', 'fitness');
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(5);
  });

  it('defers all invalidations when deferSecondary is true', async () => {
    vi.useFakeTimers();
    const queryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    };
    await invalidateContentCrud(queryClient, 'categories', 'fitness', { deferSecondary: true });
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(5);
    vi.useRealTimers();
  });
});
