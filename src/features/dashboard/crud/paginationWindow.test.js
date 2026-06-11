import { describe, it, expect } from 'vitest';
import { getPaginationWindow } from './paginationWindow';

describe('getPaginationWindow', () => {
  it('returns empty array when pageCount is zero', () => {
    expect(getPaginationWindow(1, 0)).toEqual([]);
  });

  it('returns all pages when pageCount fits within maxVisible', () => {
    expect(getPaginationWindow(2, 4)).toEqual([1, 2, 3, 4]);
    expect(getPaginationWindow(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('shows leading window and last page on early pages', () => {
    expect(getPaginationWindow(1, 12)).toEqual([1, 2, 3, 4, 'ellipsis', 12]);
    expect(getPaginationWindow(2, 12)).toEqual([1, 2, 3, 4, 'ellipsis', 12]);
  });

  it('shows centered window with both ellipses in the middle', () => {
    expect(getPaginationWindow(5, 12)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 12]);
    expect(getPaginationWindow(6, 12)).toEqual([1, 'ellipsis', 5, 6, 7, 'ellipsis', 12]);
  });

  it('shows trailing window and first page on late pages', () => {
    expect(getPaginationWindow(11, 12)).toEqual([1, 'ellipsis', 9, 10, 11, 12]);
    expect(getPaginationWindow(12, 12)).toEqual([1, 'ellipsis', 9, 10, 11, 12]);
  });

  it('respects custom maxVisible threshold', () => {
    expect(getPaginationWindow(1, 5, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationWindow(3, 8, 5)).toEqual([1, 2, 3, 4, 'ellipsis', 8]);
  });
});
