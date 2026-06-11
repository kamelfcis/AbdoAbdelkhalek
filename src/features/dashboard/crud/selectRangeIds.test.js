import { describe, it, expect } from 'vitest';
import { selectRangeIds } from './selectRangeIds';

describe('selectRangeIds', () => {
  const pageIds = ['a', 'b', 'c', 'd', 'e'];

  it('returns empty array when inputs are invalid', () => {
    expect(selectRangeIds([], 0, 2)).toEqual([]);
    expect(selectRangeIds(pageIds, null, 2)).toEqual([]);
    expect(selectRangeIds(pageIds, 1, null)).toEqual([]);
  });

  it('returns a single id when from and to are equal', () => {
    expect(selectRangeIds(pageIds, 2, 2)).toEqual(['c']);
  });

  it('returns inclusive range in forward order', () => {
    expect(selectRangeIds(pageIds, 1, 3)).toEqual(['b', 'c', 'd']);
  });

  it('returns inclusive range when to is before from (shift-click)', () => {
    expect(selectRangeIds(pageIds, 4, 1)).toEqual(['b', 'c', 'd', 'e']);
  });
});
