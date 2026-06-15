import { AsyncLocalStorage } from 'node:async_hooks';
import { prisma } from '../prisma/client.js';

const syncContext = new AsyncLocalStorage<{ skipSync: boolean }>();

export function isMediaSyncSkipped(): boolean {
  return syncContext.getStore()?.skipSync === true;
}

export const isSyncSuppressed = isMediaSyncSkipped;

export function runWithMediaSyncSkipped<T>(fn: () => Promise<T>): Promise<T> {
  return syncContext.run({ skipSync: true }, fn);
}

type CategoryFields = {
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  imagePath: string | null;
  isPublic: boolean;
};

type VideoFields = {
  titleEn: string;
  titleAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  videoUrl: string | null;
  videoPath: string | null;
  thumbnailUrl: string | null;
  thumbnailPath: string | null;
  durationSeconds: number | null;
  isPublic: boolean;
};

function categoryFieldsFromFitness(cat: {
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  imagePath: string | null;
  isPublic: boolean;
}): CategoryFields {
  return {
    nameEn: cat.nameEn,
    nameAr: cat.nameAr,
    descriptionEn: cat.descriptionEn,
    descriptionAr: cat.descriptionAr,
    imagePath: cat.imagePath,
    isPublic: cat.isPublic,
  };
}

function categoryFieldsFromSquash(cat: {
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  imagePath: string | null;
  isPublic: boolean;
}): CategoryFields {
  return categoryFieldsFromFitness(cat);
}

function videoFieldsFromFitness(video: {
  titleEn: string;
  titleAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  videoUrl: string | null;
  videoPath: string | null;
  thumbnailUrl: string | null;
  thumbnailPath: string | null;
  durationSeconds: number | null;
  isPublic: boolean;
}): VideoFields {
  return {
    titleEn: video.titleEn,
    titleAr: video.titleAr,
    descriptionEn: video.descriptionEn,
    descriptionAr: video.descriptionAr,
    videoUrl: video.videoUrl,
    videoPath: video.videoPath,
    thumbnailUrl: video.thumbnailUrl,
    thumbnailPath: video.thumbnailPath,
    durationSeconds: video.durationSeconds,
    isPublic: video.isPublic,
  };
}

function videoFieldsFromSquash(video: {
  titleEn: string;
  titleAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  videoUrl: string | null;
  videoPath: string | null;
  thumbnailUrl: string | null;
  thumbnailPath: string | null;
  durationSeconds: number | null;
  isPublic: boolean;
}): VideoFields {
  return videoFieldsFromFitness(video);
}

async function resolveSquashCategoryIdForFitnessCategory(
  fitnessCategoryId: string | null | undefined
): Promise<string | null> {
  if (!fitnessCategoryId) return null;
  let mirror = await prisma.squashCategory.findUnique({
    where: { sourceCategoryId: fitnessCategoryId },
    select: { id: true },
  });
  if (mirror) return mirror.id;
  await syncFitnessCategoryToSquash(fitnessCategoryId);
  mirror = await prisma.squashCategory.findUnique({
    where: { sourceCategoryId: fitnessCategoryId },
    select: { id: true },
  });
  return mirror?.id ?? null;
}

async function resolveFitnessCategoryIdForSquashCategory(
  squashCategoryId: string | null | undefined
): Promise<string | null> {
  if (!squashCategoryId) return null;
  const squashCat = await prisma.squashCategory.findUnique({
    where: { id: squashCategoryId },
    select: { sourceCategoryId: true },
  });
  if (!squashCat) return null;
  if (squashCat.sourceCategoryId) return squashCat.sourceCategoryId;
  await syncSquashCategoryToFitness(squashCategoryId);
  const linked = await prisma.squashCategory.findUnique({
    where: { id: squashCategoryId },
    select: { sourceCategoryId: true },
  });
  return linked?.sourceCategoryId ?? null;
}

export async function syncFitnessCategoryToSquash(categoryId: string): Promise<void> {
  if (isMediaSyncSkipped()) return;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return;

  const fields = categoryFieldsFromFitness(category);
  await runWithMediaSyncSkipped(async () => {
    await prisma.squashCategory.upsert({
      where: { sourceCategoryId: categoryId },
      create: { ...fields, sourceCategoryId: categoryId },
      update: fields,
    });
  });
}

export async function syncFitnessVideoToSquash(videoId: string): Promise<void> {
  if (isMediaSyncSkipped()) return;

  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) return;

  const squashCategoryId = await resolveSquashCategoryIdForFitnessCategory(video.categoryId);
  const fields = {
    ...videoFieldsFromFitness(video),
    categoryId: squashCategoryId,
  };

  await runWithMediaSyncSkipped(async () => {
    await prisma.squashVideo.upsert({
      where: { sourceVideoId: videoId },
      create: { ...fields, sourceVideoId: videoId },
      update: fields,
    });
  });
}

export async function syncSquashCategoryToFitness(squashCategoryId: string): Promise<void> {
  if (isMediaSyncSkipped()) return;

  const squash = await prisma.squashCategory.findUnique({ where: { id: squashCategoryId } });
  if (!squash) return;

  const fields = categoryFieldsFromSquash(squash);

  if (squash.sourceCategoryId) {
    await runWithMediaSyncSkipped(async () => {
      await prisma.category.update({
        where: { id: squash.sourceCategoryId! },
        data: fields,
      });
    });
    return;
  }

  const fitness = await runWithMediaSyncSkipped(async () =>
    prisma.category.create({ data: fields })
  );

  await prisma.squashCategory.update({
    where: { id: squashCategoryId },
    data: { sourceCategoryId: fitness.id },
  });
}

export async function syncSquashVideoToFitness(squashVideoId: string): Promise<void> {
  if (isMediaSyncSkipped()) return;

  const squash = await prisma.squashVideo.findUnique({ where: { id: squashVideoId } });
  if (!squash) return;

  const fitnessCategoryId = await resolveFitnessCategoryIdForSquashCategory(squash.categoryId);
  const fields = {
    ...videoFieldsFromSquash(squash),
    categoryId: fitnessCategoryId,
  };

  if (squash.sourceVideoId) {
    await runWithMediaSyncSkipped(async () => {
      await prisma.video.update({
        where: { id: squash.sourceVideoId! },
        data: fields,
      });
    });
    return;
  }

  const fitness = await runWithMediaSyncSkipped(async () =>
    prisma.video.create({ data: fields })
  );

  await prisma.squashVideo.update({
    where: { id: squashVideoId },
    data: { sourceVideoId: fitness.id },
  });
}

export async function deleteSquashMirrorForFitnessCategory(categoryId: string): Promise<void> {
  await runWithMediaSyncSkipped(async () => {
    await prisma.squashCategory.deleteMany({ where: { sourceCategoryId: categoryId } });
  });
}

export async function deleteSquashMirrorForFitnessVideo(videoId: string): Promise<void> {
  await runWithMediaSyncSkipped(async () => {
    await prisma.squashVideo.deleteMany({ where: { sourceVideoId: videoId } });
  });
}

export async function deleteFitnessMirrorForSquashCategory(
  squashCategoryId: string
): Promise<boolean> {
  const squash = await prisma.squashCategory.findUnique({
    where: { id: squashCategoryId },
    select: { sourceCategoryId: true },
  });
  if (!squash?.sourceCategoryId) return false;

  await runWithMediaSyncSkipped(async () => {
    await prisma.category.delete({ where: { id: squash.sourceCategoryId! } });
  });
  return true;
}

export async function deleteFitnessMirrorForSquashVideo(squashVideoId: string): Promise<boolean> {
  const squash = await prisma.squashVideo.findUnique({
    where: { id: squashVideoId },
    select: { sourceVideoId: true },
  });
  if (!squash?.sourceVideoId) return false;

  await runWithMediaSyncSkipped(async () => {
    await prisma.video.delete({ where: { id: squash.sourceVideoId! } });
  });
  return true;
}

export const deleteFitnessSourceForSquashCategory = deleteFitnessMirrorForSquashCategory;
export const deleteFitnessSourceForSquashVideo = deleteFitnessMirrorForSquashVideo;
