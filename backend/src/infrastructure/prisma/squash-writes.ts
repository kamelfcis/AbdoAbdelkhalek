import { dedupeById, resolveAccessibleContent } from './accessible-content.js';
import { prisma } from './client.js';
import { isPoolerError } from './db-errors.js';
import { toCamelKeys, toSnakeKeys } from '../../common/utils/case-map.js';
import {
  assertPackageWriteResult,
  isSchemaMismatchError,
  packageData,
  packageToRest,
  squashPackageLegacyRest,
} from './package-write-utils.js';
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

async function restPatchSquashPackage(
  id: string,
  data: Record<string, unknown>,
  mode: 'create' | 'update'
) {
  const restPayload = packageToRest(data, mode);
  if (mode === 'update' && data.updatedAt instanceof Date) {
    restPayload.updated_at = data.updatedAt.toISOString();
  }
  try {
    return assertPackageWriteResult(
      await rest.restPatch<Record<string, unknown>>(T.packages, id, restPayload),
      id,
      mode
    );
  } catch (e) {
    if (!isSchemaMismatchError(e)) throw e;
    return assertPackageWriteResult(
      await rest.restPatch<Record<string, unknown>>(
        T.packages,
        id,
        squashPackageLegacyRest(data, mode)
      ),
      id,
      mode
    );
  }
}

async function restCreateSquashPackage(data: Record<string, unknown>, mode: 'create' | 'update') {
  const restPayload = packageToRest(data, mode);
  try {
    return assertPackageWriteResult(
      await rest.restCreate<Record<string, unknown>>(T.packages, restPayload),
      'new',
      mode
    );
  } catch (e) {
    if (!isSchemaMismatchError(e)) throw e;
    return assertPackageWriteResult(
      await rest.restCreate<Record<string, unknown>>(
        T.packages,
        squashPackageLegacyRest(data, mode)
      ),
      'new',
      mode
    );
  }
}

async function writeSquashPackage(
  id: string | null,
  data: Record<string, unknown>,
  mode: 'create' | 'update'
) {
  const camel = packageData(data, mode);
  if (mode === 'update') {
    camel.updatedAt = new Date();
  }

  const prismaFn = () =>
    mode === 'create'
      ? prisma.squashPackage.create({ data: camel as never })
      : prisma.squashPackage.update({ where: { id: id! }, data: camel as never });

  const restFn = () =>
    mode === 'create'
      ? restCreateSquashPackage(camel, mode)
      : restPatchSquashPackage(id!, camel, mode);

  try {
    return await prismaFn();
  } catch (e) {
    if (isPoolerError(e) || isSchemaMismatchError(e)) {
      return restFn();
    }
    throw e;
  }
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
  return writeSquashPackage(null, data, 'create');
}

export async function updateSquashPackage(id: string, data: Record<string, unknown>) {
  return writeSquashPackage(id, data, 'update');
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

export async function deleteSquashFaqsBulk(ids: string[]) {
  return withWriteFallback(
    async () => {
      const result = await prisma.squashFaq.deleteMany({ where: { id: { in: ids } } });
      return { deleted: result.count };
    },
    async () => {
      await rest.restDeleteWhere(T.faqs, `id=in.(${ids.join(',')})`);
      return { deleted: ids.length };
    }
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
    findMany: (args: unknown) => Promise<{ userId: string; videoId?: string }[]>;
    deleteMany: (args: unknown) => Promise<unknown>;
    createMany: (args: unknown) => Promise<unknown>;
  };
  squashUserCategoryAccess: {
    findMany: (args: unknown) => Promise<{ userId: string; categoryId: string }[]>;
    deleteMany: (args: unknown) => Promise<unknown>;
    createMany: (args: unknown) => Promise<unknown>;
  };
  $transaction: (ops: unknown[]) => Promise<unknown>;
};

const squashAccessDb = prisma as unknown as SquashAccessPrisma;

export async function deleteTrainee(userId: string) {
  return squashAccessDb.$transaction([
    squashAccessDb.squashUserVideoAccess.deleteMany({ where: { userId } }),
    squashAccessDb.squashUserCategoryAccess.deleteMany({ where: { userId } }),
    prisma.userVideoFavorite.deleteMany({ where: { userId } }),
    prisma.subscription.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
}

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
        ...(userIds.length > 0
          ? [
              squashAccessDb.squashUserVideoAccess.createMany({
                data: userIds.map((userId) => ({ userId, videoId })),
              }),
            ]
          : []),
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
        squashAccessDb.squashUserCategoryAccess.findMany({
          where: { userId },
          select: { userId: true, categoryId: true },
        }),
        squashAccessDb.squashUserVideoAccess.findMany({
          where: { userId },
          select: { userId: true, videoId: true },
        }),
      ]);
      return { categories, videos };
    },
    async () => {
      const [categories, videos] = await Promise.all([
        rest.restList('squash_user_category_access', `?user_id=eq.${encodeURIComponent(userId)}&select=user_id,category_id`),
        rest.restList('squash_user_video_access', `?user_id=eq.${encodeURIComponent(userId)}&select=user_id,video_id`),
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
        ...(categoryIds.length > 0
          ? [
              squashAccessDb.squashUserCategoryAccess.createMany({
                data: categoryIds.map((categoryId) => ({ userId, categoryId })),
              }),
            ]
          : []),
        ...(videoIds.length > 0
          ? [
              squashAccessDb.squashUserVideoAccess.createMany({
                data: videoIds.map((videoId) => ({ userId, videoId })),
              }),
            ]
          : []),
      ]);
      return { ok: true };
    },
    async () => {
      await Promise.all([
        rest.restDeleteWhere('squash_user_category_access', `user_id=eq.${encodeURIComponent(userId)}`),
        rest.restDeleteWhere('squash_user_video_access', `user_id=eq.${encodeURIComponent(userId)}`),
      ]);
      await Promise.all([
        categoryIds.length > 0
          ? rest.restBulkCreate(
              'squash_user_category_access',
              categoryIds.map((categoryId) => ({ user_id: userId, category_id: categoryId }))
            )
          : Promise.resolve(),
        videoIds.length > 0
          ? rest.restBulkCreate(
              'squash_user_video_access',
              videoIds.map((videoId) => ({ user_id: userId, video_id: videoId }))
            )
          : Promise.resolve(),
      ]);
      return { ok: true };
    }
  );
}

export async function getSquashAccessibleVideoIds(userId: string) {
  return withWriteFallback(
    async () => {
      const [videoAccess, categoryAccess] = await Promise.all([
        squashAccessDb.squashUserVideoAccess.findMany({
          where: { userId },
          select: { videoId: true },
        }),
        squashAccessDb.squashUserCategoryAccess.findMany({
          where: { userId },
          select: { categoryId: true },
        }),
      ]);
      return {
        videoIds: videoAccess.map((a) => a.videoId).filter(Boolean) as string[],
        categoryIds: categoryAccess.map((a: { categoryId: string }) => a.categoryId),
      };
    },
    async () => {
      const [videoAccess, categoryAccess] = await Promise.all([
        rest.restList<{ video_id: string }>(
          'squash_user_video_access',
          `?user_id=eq.${encodeURIComponent(userId)}&select=video_id`
        ),
        rest.restList<{ category_id: string }>(
          'squash_user_category_access',
          `?user_id=eq.${encodeURIComponent(userId)}&select=category_id`
        ),
      ]);
      return {
        videoIds: videoAccess.map((a) => a.video_id),
        categoryIds: categoryAccess.map((a) => a.category_id),
      };
    }
  );
}

async function squashDataListPublicCategories() {
  try {
    return await prisma.squashCategory.findMany({ where: { isPublic: true } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    return rest.restList(T.categories, '?is_public=eq.true');
  }
}

async function squashDataListCategoriesByIds(ids: string[]) {
  try {
    return await prisma.squashCategory.findMany({ where: { id: { in: ids } } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    return rest.restList(T.categories, `?id=in.(${ids.join(',')})`);
  }
}

async function squashDataListPublicVideos() {
  try {
    return await prisma.squashVideo.findMany({
      where: { isPublic: true },
      include: { category: true },
    });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const rows = await rest.restList<Record<string, unknown>>(
      T.videos,
      '?select=*,squash_categories(*)&is_public=eq.true'
    );
    return rows.map((v) => ({ ...v, category: v.squash_categories }));
  }
}

async function squashDataListVideosByIds(ids: string[]) {
  try {
    return await prisma.squashVideo.findMany({
      where: { id: { in: ids } },
      include: { category: true },
    });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const rows = await rest.restList<Record<string, unknown>>(
      T.videos,
      `?select=*,squash_categories(*)&id=in.(${ids.join(',')})`
    );
    return rows.map((v) => ({ ...v, category: v.squash_categories }));
  }
}

async function squashDataListVideosByCategoryIds(categoryIds: string[]) {
  try {
    return await prisma.squashVideo.findMany({
      where: { categoryId: { in: categoryIds } },
      include: { category: true },
    });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const rows = await rest.restList<Record<string, unknown>>(
      T.videos,
      `?select=*,squash_categories(*)&category_id=in.(${categoryIds.join(',')})`
    );
    return rows.map((v) => ({ ...v, category: v.squash_categories }));
  }
}

export async function listSquashAccessibleCategories(userId: string) {
  const { videoIds, categoryIds } = await getSquashAccessibleVideoIds(userId);
  const hasExplicitAccess = categoryIds.length > 0 || videoIds.length > 0;
  const [publicCats, granted] = await Promise.all([
    squashDataListPublicCategories(),
    categoryIds.length ? squashDataListCategoriesByIds(categoryIds) : [],
  ]);
  return resolveAccessibleContent({
    hasExplicitAccess,
    publicItems: publicCats as Array<{ id: string }>,
    grantedItems: granted as Array<{ id: string }>,
  });
}

export async function userCanPlaySquashVideo(userId: string, videoId: string): Promise<boolean> {
  const { videoIds } = await getSquashAccessibleVideoIds(userId);
  return videoIds.includes(videoId);
}

export async function listSquashAccessibleVideos(userId: string) {
  const { videoIds, categoryIds } = await getSquashAccessibleVideoIds(userId);
  const hasExplicitAccess = categoryIds.length > 0 || videoIds.length > 0;
  const [publicVids, byVideo] = await Promise.all([
    squashDataListPublicVideos(),
    videoIds.length ? squashDataListVideosByIds(videoIds) : [],
  ]);
  const publicItems = publicVids as unknown as Array<{ id: string }>;
  const grantedPrivate = byVideo as unknown as Array<{ id: string }>;
  if (!hasExplicitAccess) {
    return dedupeById(publicItems);
  }
  return dedupeById([...publicItems, ...grantedPrivate]);
}
