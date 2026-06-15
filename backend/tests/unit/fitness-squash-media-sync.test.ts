import { describe, expect, it, vi, beforeEach } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  category: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  video: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  squashCategory: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
  squashVideo: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock('../../src/infrastructure/prisma/client.js', () => ({
  prisma: prismaMocks,
}));

import {
  syncFitnessCategoryToSquash,
  syncFitnessVideoToSquash,
  syncSquashCategoryToFitness,
  syncSquashVideoToFitness,
  deleteSquashMirrorForFitnessCategory,
  deleteSquashMirrorForFitnessVideo,
  deleteFitnessMirrorForSquashCategory,
  isMediaSyncSkipped,
} from '../../src/infrastructure/sync/fitness-squash-media-sync.js';

const fitnessCategory = {
  id: 'fit-cat-1',
  nameEn: 'Strength',
  nameAr: 'قوة',
  descriptionEn: 'desc',
  descriptionAr: 'وصف',
  imagePath: 'categories/hero.jpg',
  isPublic: true,
};

const fitnessVideo = {
  id: 'fit-vid-1',
  titleEn: 'Squat',
  titleAr: 'سكوات',
  descriptionEn: null,
  descriptionAr: null,
  categoryId: 'fit-cat-1',
  videoUrl: null,
  videoPath: 'videos/squat.mp4',
  thumbnailUrl: null,
  thumbnailPath: 'video-thumbnails/squat.jpg',
  durationSeconds: 120,
  isPublic: true,
};

describe('fitness-squash-media-sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('syncFitnessCategoryToSquash upserts mirror with same image path', async () => {
    prismaMocks.category.findUnique.mockResolvedValue(fitnessCategory);
    prismaMocks.squashCategory.upsert.mockResolvedValue({ id: 'sq-cat-1' });

    await syncFitnessCategoryToSquash('fit-cat-1');

    expect(prismaMocks.squashCategory.upsert).toHaveBeenCalledWith({
      where: { sourceCategoryId: 'fit-cat-1' },
      create: expect.objectContaining({
        nameEn: 'Strength',
        imagePath: 'categories/hero.jpg',
        sourceCategoryId: 'fit-cat-1',
      }),
      update: expect.objectContaining({
        imagePath: 'categories/hero.jpg',
      }),
    });
  });

  it('syncFitnessVideoToSquash maps category and copies paths verbatim', async () => {
    prismaMocks.video.findUnique.mockResolvedValue(fitnessVideo);
    prismaMocks.squashCategory.findUnique.mockResolvedValue({ id: 'sq-cat-1' });
    prismaMocks.squashVideo.upsert.mockResolvedValue({ id: 'sq-vid-1' });

    await syncFitnessVideoToSquash('fit-vid-1');

    expect(prismaMocks.squashVideo.upsert).toHaveBeenCalledWith({
      where: { sourceVideoId: 'fit-vid-1' },
      create: expect.objectContaining({
        videoPath: 'videos/squat.mp4',
        thumbnailPath: 'video-thumbnails/squat.jpg',
        categoryId: 'sq-cat-1',
        sourceVideoId: 'fit-vid-1',
      }),
      update: expect.objectContaining({
        videoPath: 'videos/squat.mp4',
        thumbnailPath: 'video-thumbnails/squat.jpg',
        categoryId: 'sq-cat-1',
      }),
    });
  });

  it('syncSquashCategoryToFitness updates linked fitness row', async () => {
    prismaMocks.squashCategory.findUnique.mockResolvedValue({
      id: 'sq-cat-1',
      sourceCategoryId: 'fit-cat-1',
      ...fitnessCategory,
    });
    prismaMocks.category.update.mockResolvedValue(fitnessCategory);

    await syncSquashCategoryToFitness('sq-cat-1');

    expect(prismaMocks.category.update).toHaveBeenCalledWith({
      where: { id: 'fit-cat-1' },
      data: expect.objectContaining({
        nameEn: 'Strength',
        imagePath: 'categories/hero.jpg',
      }),
    });
    expect(prismaMocks.category.create).not.toHaveBeenCalled();
  });

  it('syncSquashCategoryToFitness creates fitness row when unlinked', async () => {
    prismaMocks.squashCategory.findUnique.mockResolvedValue({
      ...fitnessCategory,
      id: 'sq-cat-2',
      sourceCategoryId: null,
    });
    prismaMocks.category.create.mockResolvedValue({ id: 'fit-cat-new' });
    prismaMocks.squashCategory.update.mockResolvedValue({});

    await syncSquashCategoryToFitness('sq-cat-2');

    expect(prismaMocks.category.create).toHaveBeenCalled();
    expect(prismaMocks.squashCategory.update).toHaveBeenCalledWith({
      where: { id: 'sq-cat-2' },
      data: { sourceCategoryId: 'fit-cat-new' },
    });
  });

  it('syncSquashVideoToFitness links new fitness video when unlinked', async () => {
    prismaMocks.squashVideo.findUnique.mockResolvedValue({
      ...fitnessVideo,
      id: 'sq-vid-2',
      sourceVideoId: null,
      categoryId: 'sq-cat-1',
    });
    prismaMocks.squashCategory.findUnique.mockResolvedValue({
      id: 'sq-cat-1',
      sourceCategoryId: 'fit-cat-1',
    });
    prismaMocks.video.create.mockResolvedValue({ id: 'fit-vid-new' });
    prismaMocks.squashVideo.update.mockResolvedValue({});

    await syncSquashVideoToFitness('sq-vid-2');

    expect(prismaMocks.video.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        videoPath: 'videos/squat.mp4',
        categoryId: 'fit-cat-1',
      }),
    });
    expect(prismaMocks.squashVideo.update).toHaveBeenCalledWith({
      where: { id: 'sq-vid-2' },
      data: { sourceVideoId: 'fit-vid-new' },
    });
  });

  it('deleteSquashMirrorForFitnessCategory removes mirror rows', async () => {
    prismaMocks.squashCategory.deleteMany.mockResolvedValue({ count: 1 });
    await deleteSquashMirrorForFitnessCategory('fit-cat-1');
    expect(prismaMocks.squashCategory.deleteMany).toHaveBeenCalledWith({
      where: { sourceCategoryId: 'fit-cat-1' },
    });
  });

  it('deleteSquashMirrorForFitnessVideo removes mirror rows', async () => {
    prismaMocks.squashVideo.deleteMany.mockResolvedValue({ count: 1 });
    await deleteSquashMirrorForFitnessVideo('fit-vid-1');
    expect(prismaMocks.squashVideo.deleteMany).toHaveBeenCalledWith({
      where: { sourceVideoId: 'fit-vid-1' },
    });
  });

  it('deleteFitnessMirrorForSquashCategory deletes linked fitness row', async () => {
    prismaMocks.squashCategory.findUnique.mockResolvedValue({
      sourceCategoryId: 'fit-cat-1',
    });
    prismaMocks.category.delete.mockResolvedValue(fitnessCategory);

    const deleted = await deleteFitnessMirrorForSquashCategory('sq-cat-1');

    expect(deleted).toBe(true);
    expect(prismaMocks.category.delete).toHaveBeenCalledWith({ where: { id: 'fit-cat-1' } });
  });

  it('loop guard suppresses nested sync', async () => {
    expect(isMediaSyncSkipped()).toBe(false);
    prismaMocks.squashCategory.findUnique.mockResolvedValue({
      id: 'sq-cat-1',
      sourceCategoryId: 'fit-cat-1',
      ...fitnessCategory,
    });
    prismaMocks.category.update.mockImplementation(async () => {
      await syncFitnessCategoryToSquash('fit-cat-1');
      return fitnessCategory;
    });

    await syncSquashCategoryToFitness('sq-cat-1');

    expect(prismaMocks.category.findUnique).not.toHaveBeenCalled();
  });
});
