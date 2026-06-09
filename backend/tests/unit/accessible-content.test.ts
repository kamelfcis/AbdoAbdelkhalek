import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  dedupeById,
  resolveAccessibleContent,
} from '../../src/infrastructure/prisma/accessible-content.js';

const prismaMocks = vi.hoisted(() => ({
  userVideoAccess: { findMany: vi.fn() },
  userCategoryAccess: { findMany: vi.fn() },
  video: { findMany: vi.fn() },
  category: { findMany: vi.fn() },
  squashUserVideoAccess: { findMany: vi.fn() },
  squashUserCategoryAccess: { findMany: vi.fn() },
  squashVideo: { findMany: vi.fn() },
  squashCategory: { findMany: vi.fn() },
}));

vi.mock('../../src/infrastructure/prisma/client.js', () => ({
  prisma: prismaMocks,
}));

import {
  listAccessibleCategories,
  listAccessibleVideos,
} from '../../src/infrastructure/prisma/fitness-writes.js';
import {
  listSquashAccessibleCategories,
  listSquashAccessibleVideos,
} from '../../src/infrastructure/prisma/squash-writes.js';

describe('accessible-content helpers', () => {
  it('dedupes rows by id', () => {
    expect(
      dedupeById([
        { id: 'a', title: 'first' },
        { id: 'b' },
        { id: 'a', title: 'second' },
      ])
    ).toEqual([
      { id: 'a', title: 'second' },
      { id: 'b' },
    ]);
  });

  it('returns public catalog when no explicit access', () => {
    const publicItems = [{ id: 'pub-1' }, { id: 'pub-2' }];
    const grantedItems = [{ id: 'grant-1' }];
    expect(
      resolveAccessibleContent({
        hasExplicitAccess: false,
        publicItems,
        grantedItems,
      })
    ).toEqual(publicItems);
  });

  it('returns granted items only when explicit access exists', () => {
    const publicItems = [{ id: 'pub-1' }];
    const grantedItems = [{ id: 'grant-1' }, { id: 'grant-1' }, { id: 'grant-2' }];
    expect(
      resolveAccessibleContent({
        hasExplicitAccess: true,
        publicItems,
        grantedItems,
      })
    ).toEqual([{ id: 'grant-1' }, { id: 'grant-2' }]);
  });
});

describe('fitness accessible lists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('category-only grant returns empty video list (explicit video access only)', async () => {
    const catA = 'cat-a';
    prismaMocks.userVideoAccess.findMany.mockResolvedValue([]);
    prismaMocks.userCategoryAccess.findMany.mockResolvedValue([{ categoryId: catA }]);
    prismaMocks.video.findMany.mockImplementation(async (args: { where: Record<string, unknown> }) => {
      if (args.where.isPublic === true) {
        return [{ id: 'pub-c', categoryId: 'cat-c', isPublic: true }];
      }
      if (args.where.categoryId) {
        return [
          { id: 'priv-a1', categoryId: catA, isPublic: false },
          { id: 'priv-a2', categoryId: catA, isPublic: false },
        ];
      }
      return [];
    });

    const result = await listAccessibleVideos('trainee-1');

    expect(result).toEqual([]);
    expect(prismaMocks.video.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isPublic: true } })
    );
  });

  it('no grants returns public videos only', async () => {
    prismaMocks.userVideoAccess.findMany.mockResolvedValue([]);
    prismaMocks.userCategoryAccess.findMany.mockResolvedValue([]);
    prismaMocks.video.findMany.mockResolvedValue([
      { id: 'pub-1', isPublic: true },
      { id: 'pub-2', isPublic: true },
    ]);

    const result = await listAccessibleVideos('trainee-2');

    expect(result).toHaveLength(2);
    expect(result.map((v) => v.id)).toEqual(['pub-1', 'pub-2']);
  });

  it('category + individual video returns only explicit video ids', async () => {
    const catA = 'cat-a';
    prismaMocks.userVideoAccess.findMany.mockResolvedValue([{ videoId: 'shared' }]);
    prismaMocks.userCategoryAccess.findMany.mockResolvedValue([{ categoryId: catA }]);
    prismaMocks.video.findMany.mockImplementation(async (args: { where: Record<string, unknown> }) => {
      if (args.where.isPublic === true) {
        return [{ id: 'pub-1', isPublic: true }];
      }
      if (args.where.id) {
        return [{ id: 'shared', categoryId: catA, isPublic: false }];
      }
      if (args.where.categoryId) {
        return [
          { id: 'shared', categoryId: catA, isPublic: false },
          { id: 'cat-only', categoryId: catA, isPublic: false },
        ];
      }
      return [];
    });

    const result = await listAccessibleVideos('trainee-3');

    expect(result.map((v) => v.id)).toEqual(['shared']);
  });

  it('category-only grant returns only granted categories', async () => {
    prismaMocks.userVideoAccess.findMany.mockResolvedValue([]);
    prismaMocks.userCategoryAccess.findMany.mockResolvedValue([{ categoryId: 'cat-a' }]);
    prismaMocks.category.findMany.mockImplementation(async (args: { where: Record<string, unknown> }) => {
      if (args.where.isPublic === true) {
        return [{ id: 'pub-cat', isPublic: true }];
      }
      if (args.where.id) {
        return [{ id: 'cat-a', isPublic: false }];
      }
      return [];
    });

    const result = await listAccessibleCategories('trainee-4');

    expect(result.map((c) => c.id)).toEqual(['cat-a']);
  });
});

describe('squash accessible lists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('category-only grant returns empty video list (explicit video access only)', async () => {
    const catA = 'squash-cat-a';
    prismaMocks.squashUserVideoAccess.findMany.mockResolvedValue([]);
    prismaMocks.squashUserCategoryAccess.findMany.mockResolvedValue([{ categoryId: catA }]);
    prismaMocks.squashVideo.findMany.mockImplementation(async (args: { where: Record<string, unknown> }) => {
      if (args.where.isPublic === true) {
        return [{ id: 'squash-pub', categoryId: 'other', isPublic: true }];
      }
      if (args.where.categoryId) {
        return [{ id: 'squash-a1', categoryId: catA, isPublic: false }];
      }
      return [];
    });

    const result = await listSquashAccessibleVideos('trainee-sq-1');

    expect(result).toEqual([]);
  });

  it('no grants returns public squash videos only', async () => {
    prismaMocks.squashUserVideoAccess.findMany.mockResolvedValue([]);
    prismaMocks.squashUserCategoryAccess.findMany.mockResolvedValue([]);
    prismaMocks.squashVideo.findMany.mockResolvedValue([{ id: 'sq-pub-1', isPublic: true }]);

    const result = await listSquashAccessibleVideos('trainee-sq-2');

    expect(result.map((v) => v.id)).toEqual(['sq-pub-1']);
  });

  it('category-only grant returns only granted squash categories', async () => {
    prismaMocks.squashUserVideoAccess.findMany.mockResolvedValue([]);
    prismaMocks.squashUserCategoryAccess.findMany.mockResolvedValue([{ categoryId: 'sq-cat-a' }]);
    prismaMocks.squashCategory.findMany.mockImplementation(async (args: { where: Record<string, unknown> }) => {
      if (args.where.isPublic === true) {
        return [{ id: 'sq-pub-cat', isPublic: true }];
      }
      if (args.where.id) {
        return [{ id: 'sq-cat-a', isPublic: false }];
      }
      return [];
    });

    const result = await listSquashAccessibleCategories('trainee-sq-3');

    expect(result.map((c) => c.id)).toEqual(['sq-cat-a']);
  });
});
