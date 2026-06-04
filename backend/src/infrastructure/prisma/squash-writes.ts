import { prisma } from './client.js';
import { isPoolerError } from './db-errors.js';
import { toCamelKeys, toSnakeKeys } from '../../common/utils/case-map.js';
import * as rest from '../supabase-rest/client.js';

const T = {
  categories: 'squash_categories',
  videos: 'squash_videos',
  packages: 'squash_packages',
  reviews: 'squash_reviews',
  successStories: 'squash_success_stories',
  faqs: 'squash_faqs',
  coaches: 'squash_coaches',
  programs: 'squash_programs',
} as const;

async function withWriteFallback<T>(
  prismaFn: () => Promise<T>,
  restFn: () => Promise<T>
): Promise<T> {
  try {
    return await prismaFn();
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    return restFn();
  }
}

function normalize(data: Record<string, unknown>) {
  return toCamelKeys(data);
}

function toRest(data: Record<string, unknown>) {
  return toSnakeKeys(normalize(data));
}

export async function createSquashCategory(data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashCategory.create({ data: normalize(data) as never }),
    () => rest.restCreate(T.categories, toRest(data))
  );
}

export async function updateSquashCategory(id: string, data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashCategory.update({ where: { id }, data: normalize(data) as never }),
    () => rest.restPatch(T.categories, id, toRest(data))
  );
}

export async function deleteSquashCategory(id: string) {
  return withWriteFallback(
    () => prisma.squashCategory.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete(T.categories, id).then(() => ({ ok: true }))
  );
}

export async function createSquashVideo(data: Record<string, unknown>) {
  return withWriteFallback(
    () =>
      prisma.squashVideo.create({
        data: normalize(data) as never,
        include: { category: true },
      }),
    async () => {
      const row = await rest.restCreate<Record<string, unknown>>(T.videos, toRest(data));
      if (row.category_id) {
        const cat = await rest.restOne(
          T.categories,
          `?id=eq.${encodeURIComponent(String(row.category_id))}`
        );
        return { ...row, category: cat };
      }
      return { ...row, category: null };
    }
  );
}

export async function updateSquashVideo(id: string, data: Record<string, unknown>) {
  return withWriteFallback(
    () =>
      prisma.squashVideo.update({
        where: { id },
        data: normalize(data) as never,
        include: { category: true },
      }),
    async () => {
      const row = await rest.restPatch<Record<string, unknown>>(T.videos, id, toRest(data));
      if (row.category_id) {
        const cat = await rest.restOne(
          T.categories,
          `?id=eq.${encodeURIComponent(String(row.category_id))}`
        );
        return { ...row, category: cat };
      }
      return { ...row, category: null };
    }
  );
}

export async function deleteSquashVideo(id: string) {
  return withWriteFallback(
    () => prisma.squashVideo.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete(T.videos, id).then(() => ({ ok: true }))
  );
}

export async function createSquashPackage(data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashPackage.create({ data: normalize(data) as never }),
    () => rest.restCreate(T.packages, toRest(data))
  );
}

export async function updateSquashPackage(id: string, data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashPackage.update({ where: { id }, data: normalize(data) as never }),
    () => rest.restPatch(T.packages, id, toRest(data))
  );
}

export async function deleteSquashPackage(id: string) {
  return withWriteFallback(
    () => prisma.squashPackage.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete(T.packages, id).then(() => ({ ok: true }))
  );
}

export async function createSquashReview(data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashReview.create({ data: normalize(data) as never }),
    () => rest.restCreate(T.reviews, toRest(data))
  );
}

export async function updateSquashReview(id: string, data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashReview.update({ where: { id }, data: normalize(data) as never }),
    () => rest.restPatch(T.reviews, id, toRest(data))
  );
}

export async function deleteSquashReview(id: string) {
  return withWriteFallback(
    () => prisma.squashReview.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete(T.reviews, id).then(() => ({ ok: true }))
  );
}

export async function createSquashSuccessStory(data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashSuccessStory.create({ data: normalize(data) as never }),
    () => rest.restCreate(T.successStories, toRest(data))
  );
}

export async function updateSquashSuccessStory(id: string, data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashSuccessStory.update({ where: { id }, data: normalize(data) as never }),
    () => rest.restPatch(T.successStories, id, toRest(data))
  );
}

export async function deleteSquashSuccessStory(id: string) {
  return withWriteFallback(
    () => prisma.squashSuccessStory.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete(T.successStories, id).then(() => ({ ok: true }))
  );
}

export async function createSquashFaq(data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashFaq.create({ data: normalize(data) as never }),
    () => rest.restCreate(T.faqs, toRest(data))
  );
}

export async function updateSquashFaq(id: string, data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashFaq.update({ where: { id }, data: normalize(data) as never }),
    () => rest.restPatch(T.faqs, id, toRest(data))
  );
}

export async function deleteSquashFaq(id: string) {
  return withWriteFallback(
    () => prisma.squashFaq.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete(T.faqs, id).then(() => ({ ok: true }))
  );
}

export async function createSquashCoach(data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashCoach.create({ data: normalize(data) as never }),
    () => rest.restCreate(T.coaches, toRest(data))
  );
}

export async function updateSquashCoach(id: string, data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashCoach.update({ where: { id }, data: normalize(data) as never }),
    () => rest.restPatch(T.coaches, id, toRest(data))
  );
}

export async function deleteSquashCoach(id: string) {
  return withWriteFallback(
    () => prisma.squashCoach.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete(T.coaches, id).then(() => ({ ok: true }))
  );
}

export async function createSquashProgram(data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashProgram.create({ data: normalize(data) as never }),
    () => rest.restCreate(T.programs, toRest(data))
  );
}

export async function updateSquashProgram(id: string, data: Record<string, unknown>) {
  return withWriteFallback(
    () => prisma.squashProgram.update({ where: { id }, data: normalize(data) as never }),
    () => rest.restPatch(T.programs, id, toRest(data))
  );
}

export async function deleteSquashProgram(id: string) {
  return withWriteFallback(
    () => prisma.squashProgram.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete(T.programs, id).then(() => ({ ok: true }))
  );
}

type SquashAccessPrisma = {
  squashUserVideoAccess: {
    findMany: (args: unknown) => Promise<{ userId: string }[]>;
    deleteMany: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
  };
  squashUserCategoryAccess: {
    findMany: (args: unknown) => Promise<{ userId: string; categoryId: string }[]>;
    deleteMany: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
  };
  $transaction: (ops: unknown[]) => Promise<unknown>;
};

const squashAccessDb = prisma as unknown as SquashAccessPrisma;

export async function getSquashVideoAccessUserIds(videoId: string): Promise<string[]> {
  return withWriteFallback(
    async () => {
      const rows = await squashAccessDb.squashUserVideoAccess.findMany({
        where: { videoId },
        select: { userId: true },
      });
      return rows.map((r: { userId: string }) => r.userId);
    },
    async () => {
      const rows = await rest.restList<{ user_id: string }>(
        'squash_user_video_access',
        `?video_id=eq.${encodeURIComponent(videoId)}&select=user_id`
      );
      return rows.map((r) => r.user_id);
    }
  );
}

export async function setSquashVideoAccessUserIds(videoId: string, userIds: string[]) {
  return withWriteFallback(
    async () => {
      await squashAccessDb.$transaction([
        squashAccessDb.squashUserVideoAccess.deleteMany({ where: { videoId } }),
        ...userIds.map((userId) =>
          squashAccessDb.squashUserVideoAccess.create({ data: { userId, videoId } })
        ),
      ]);
      return { ok: true };
    },
    async () => {
      await rest.restReplaceRows(
        'squash_user_video_access',
        `video_id=eq.${encodeURIComponent(videoId)}`,
        userIds.map((userId) => ({ user_id: userId, video_id: videoId }))
      );
      return { ok: true };
    }
  );
}

export async function getSquashTraineeAccess(userId: string) {
  return withWriteFallback(
    async () => {
      const [categories, videos] = await Promise.all([
        squashAccessDb.squashUserCategoryAccess.findMany({ where: { userId } }),
        squashAccessDb.squashUserVideoAccess.findMany({ where: { userId } }),
      ]);
      return { categories, videos };
    },
    async () => {
      const [categories, videos] = await Promise.all([
        rest.restList('squash_user_category_access', `?user_id=eq.${encodeURIComponent(userId)}`),
        rest.restList('squash_user_video_access', `?user_id=eq.${encodeURIComponent(userId)}`),
      ]);
      return { categories, videos };
    }
  );
}

export async function setSquashTraineeAccess(
  userId: string,
  categoryIds: string[],
  videoIds: string[]
) {
  return withWriteFallback(
    async () => {
      await squashAccessDb.$transaction([
        squashAccessDb.squashUserCategoryAccess.deleteMany({ where: { userId } }),
        squashAccessDb.squashUserVideoAccess.deleteMany({ where: { userId } }),
        ...categoryIds.map((categoryId) =>
          squashAccessDb.squashUserCategoryAccess.create({ data: { userId, categoryId } })
        ),
        ...videoIds.map((videoId) =>
          squashAccessDb.squashUserVideoAccess.create({ data: { userId, videoId } })
        ),
      ]);
      return { ok: true };
    },
    async () => {
      await rest.restDeleteWhere('squash_user_category_access', `user_id=eq.${encodeURIComponent(userId)}`);
      await rest.restDeleteWhere('squash_user_video_access', `user_id=eq.${encodeURIComponent(userId)}`);
      for (const categoryId of categoryIds) {
        await rest.restCreate('squash_user_category_access', { user_id: userId, category_id: categoryId });
      }
      for (const videoId of videoIds) {
        await rest.restCreate('squash_user_video_access', { user_id: userId, video_id: videoId });
      }
      return { ok: true };
    }
  );
}
