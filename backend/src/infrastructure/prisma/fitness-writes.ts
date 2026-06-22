import { dedupeById, resolveAccessibleContent } from './accessible-content.js';
import { prisma } from './client.js';
import { isPoolerError } from './db-errors.js';
import { toCamelKeys, toSnakeKeys } from '../../common/utils/case-map.js';
import {
  assertPackageWriteResult,
  packageData,
  packageToRest,
} from './package-write-utils.js';
import * as rest from '../supabase-rest/client.js';

async function withWriteFallback<T>(
  prismaFn: () => Promise<T>,
  restFn: () => Promise<T>
): Promise<T> {
  try {
    return await prismaFn();
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    console.error('[withWriteFallback] Prisma pooler error, falling back to REST:', e);
    return restFn();
  }
}

function normalize(data: Record<string, unknown>) {
  return toCamelKeys(data);
}

function toRest(data: Record<string, unknown>) {
  return toSnakeKeys(normalize(data));
}

export async function deleteTrainee(userId: string) {
  return prisma.$transaction([
    prisma.userVideoAccess.deleteMany({ where: { userId } }),
    prisma.userCategoryAccess.deleteMany({ where: { userId } }),
    prisma.subscription.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
}

export async function createCategory(data: Record<string, unknown>) {
  const camel = normalize(data);
  return withWriteFallback(
    () => prisma.category.create({ data: camel as never }),
    () => rest.restCreate('categories', toRest(data))
  );
}

export async function updateCategory(id: string, data: Record<string, unknown>) {
  const camel = normalize(data);
  return withWriteFallback(
    () => prisma.category.update({ where: { id }, data: camel as never }),
    () => rest.restPatch('categories', id, toRest(data))
  );
}

export async function deleteCategory(id: string) {
  return withWriteFallback(
    () => prisma.category.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete('categories', id).then(() => ({ ok: true }))
  );
}

export async function createVideo(data: Record<string, unknown>) {
  const camel = normalize(data);
  return withWriteFallback(
    () => prisma.video.create({ data: camel as never, include: { category: true } }),
    async () => {
      const row = await rest.restCreate<Record<string, unknown>>('videos', toRest(data));
      if (row.category_id) {
        const cat = await rest.restOne('categories', `?id=eq.${encodeURIComponent(String(row.category_id))}`);
        return { ...row, category: cat };
      }
      return { ...row, category: null };
    }
  );
}

export async function updateVideo(id: string, data: Record<string, unknown>) {
  const camel = normalize(data);
  return withWriteFallback(
    () => prisma.video.update({ where: { id }, data: camel as never, include: { category: true } }),
    async () => {
      const row = await rest.restPatch<Record<string, unknown>>('videos', id, toRest(data));
      if (row.category_id) {
        const cat = await rest.restOne('categories', `?id=eq.${encodeURIComponent(String(row.category_id))}`);
        return { ...row, category: cat };
      }
      return { ...row, category: null };
    }
  );
}

export async function deleteVideo(id: string) {
  return withWriteFallback(
    () => prisma.video.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete('videos', id).then(() => ({ ok: true }))
  );
}

export async function createPackage(data: Record<string, unknown>) {
  const camel = packageData(data, 'create');
  return withWriteFallback(
    () => prisma.package.create({ data: camel as never }),
    async () => {
      const row = await rest.restCreate<Record<string, unknown>>('packages', packageToRest(data, 'create'));
      return assertPackageWriteResult(row, 'new', 'create');
    }
  );
}

export async function updatePackage(id: string, data: Record<string, unknown>) {
  const camel = packageData(data, 'update');
  const updatedAt = new Date();
  camel.updatedAt = updatedAt;
  const restPayload = { ...packageToRest(data, 'update'), updated_at: updatedAt.toISOString() };
  return withWriteFallback(
    () => prisma.package.update({ where: { id }, data: camel as never }),
    async () => assertPackageWriteResult(await rest.restPatch('packages', id, restPayload), id, 'update')
  );
}

export async function deletePackage(id: string) {
  return withWriteFallback(
    () => prisma.package.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete('packages', id).then(() => ({ ok: true }))
  );
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export async function createSubscription(data: Record<string, unknown>) {
  const camel = normalize(data);

  const durationMonths =
    typeof camel.durationMonths === 'number' ? camel.durationMonths : 1;
  camel.durationMonths = durationMonths;

  const startDate =
    camel.startDate instanceof Date
      ? camel.startDate
      : new Date(String(camel.startDate ?? new Date().toISOString()));

  if (camel.endDate == null) {
    camel.endDate = addMonths(startDate, durationMonths);
  }

  const snake = toRest(camel);
  delete snake.duration_months;

  return withWriteFallback(
    () => prisma.subscription.create({ data: camel as never }),
    () => rest.restCreate('subscriptions', snake)
  );
}

export async function updateSubscription(id: string, data: Record<string, unknown>) {
  const camel = normalize(data);
  return withWriteFallback(
    () => prisma.subscription.update({ where: { id }, data: camel as never }),
    () => rest.restPatch('subscriptions', id, toRest(data))
  );
}

export async function deleteSubscription(id: string) {
  return withWriteFallback(
    () => prisma.subscription.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete('subscriptions', id).then(() => ({ ok: true }))
  );
}

export async function createReview(data: Record<string, unknown>) {
  const camel = normalize(data);
  return withWriteFallback(
    () => prisma.review.create({ data: camel as never }),
    () => rest.restCreate('reviews', toRest(data))
  );
}

export async function updateReview(id: string, data: Record<string, unknown>) {
  const camel = normalize(data);
  return withWriteFallback(
    () => prisma.review.update({ where: { id }, data: camel as never }),
    () => rest.restPatch('reviews', id, toRest(data))
  );
}

export async function deleteReview(id: string) {
  return withWriteFallback(
    () => prisma.review.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete('reviews', id).then(() => ({ ok: true }))
  );
}

export async function createSuccessStory(data: Record<string, unknown>) {
  const camel = normalize(data);
  return withWriteFallback(
    () => prisma.successStory.create({ data: camel as never }),
    () => rest.restCreate('success_stories', toRest(data))
  );
}

export async function updateSuccessStory(id: string, data: Record<string, unknown>) {
  const camel = normalize(data);
  return withWriteFallback(
    () => prisma.successStory.update({ where: { id }, data: camel as never }),
    () => rest.restPatch('success_stories', id, toRest(data))
  );
}

export async function deleteSuccessStory(id: string) {
  return withWriteFallback(
    () => prisma.successStory.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete('success_stories', id).then(() => ({ ok: true }))
  );
}

export async function createFaq(data: Record<string, unknown>) {
  const camel = normalize(data);
  return withWriteFallback(
    () => prisma.faq.create({ data: camel as never }),
    () => rest.restCreate('faqs', toRest(data))
  );
}

export async function updateFaq(id: string, data: Record<string, unknown>) {
  const camel = normalize(data);
  return withWriteFallback(
    () => prisma.faq.update({ where: { id }, data: camel as never }),
    () => rest.restPatch('faqs', id, toRest(data))
  );
}

export async function deleteFaq(id: string) {
  return withWriteFallback(
    () => prisma.faq.delete({ where: { id } }).then(() => ({ ok: true })),
    () => rest.restDelete('faqs', id).then(() => ({ ok: true }))
  );
}

export async function deleteFaqsBulk(ids: string[]) {
  return withWriteFallback(
    async () => {
      const result = await prisma.faq.deleteMany({ where: { id: { in: ids } } });
      return { deleted: result.count };
    },
    async () => {
      await rest.restDeleteWhere('faqs', `id=in.(${ids.join(',')})`);
      return { deleted: ids.length };
    }
  );
}

export async function getVideoAccessUserIds(videoId: string): Promise<string[]> {
  return withWriteFallback(
    async () => {
      const rows = await prisma.userVideoAccess.findMany({
        where: { videoId },
        select: { userId: true },
      });
      return rows.map((r) => r.userId);
    },
    async () => {
      const rows = await rest.restList<{ user_id: string }>(
        'user_video_access',
        `?video_id=eq.${encodeURIComponent(videoId)}&select=user_id`
      );
      return rows.map((r) => r.user_id);
    }
  );
}

export async function setVideoAccessUserIds(videoId: string, userIds: string[]) {
  return withWriteFallback(
    async () => {
      await prisma.$transaction([
        prisma.userVideoAccess.deleteMany({ where: { videoId } }),
        ...(userIds.length > 0
          ? [prisma.userVideoAccess.createMany({ data: userIds.map((userId) => ({ userId, videoId })) })]
          : []),
      ]);
      return { ok: true };
    },
    async () => {
      await rest.restDeleteWhere('user_video_access', `video_id=eq.${encodeURIComponent(videoId)}`);
      if (userIds.length > 0) {
        await rest.restBulkCreate(
          'user_video_access',
          userIds.map((userId) => ({ user_id: userId, video_id: videoId }))
        );
      }
      return { ok: true };
    }
  );
}

export async function getTraineeAccess(userId: string) {
  return withWriteFallback(
    async () => {
      const [categories, videos] = await Promise.all([
        prisma.userCategoryAccess.findMany({ where: { userId } }),
        prisma.userVideoAccess.findMany({ where: { userId } }),
      ]);
      return { categories, videos };
    },
    async () => {
      const [categories, videos] = await Promise.all([
        rest.restList('user_category_access', `?user_id=eq.${encodeURIComponent(userId)}`),
        rest.restList('user_video_access', `?user_id=eq.${encodeURIComponent(userId)}`),
      ]);
      return { categories, videos };
    }
  );
}

export async function setTraineeAccess(
  userId: string,
  categoryIds: string[],
  videoIds: string[]
) {
  return withWriteFallback(
    async () => {
      await prisma.$transaction([
        prisma.userCategoryAccess.deleteMany({ where: { userId } }),
        prisma.userVideoAccess.deleteMany({ where: { userId } }),
        ...(categoryIds.length > 0
          ? [prisma.userCategoryAccess.createMany({ data: categoryIds.map((categoryId) => ({ userId, categoryId })) })]
          : []),
        ...(videoIds.length > 0
          ? [prisma.userVideoAccess.createMany({ data: videoIds.map((videoId) => ({ userId, videoId })) })]
          : []),
      ]);
      return { ok: true };
    },
    async () => {
      await Promise.all([
        rest.restDeleteWhere('user_category_access', `user_id=eq.${encodeURIComponent(userId)}`),
        rest.restDeleteWhere('user_video_access', `user_id=eq.${encodeURIComponent(userId)}`),
      ]);
      await Promise.all([
        categoryIds.length > 0
          ? rest.restBulkCreate(
              'user_category_access',
              categoryIds.map((categoryId) => ({ user_id: userId, category_id: categoryId }))
            )
          : Promise.resolve(),
        videoIds.length > 0
          ? rest.restBulkCreate(
              'user_video_access',
              videoIds.map((videoId) => ({ user_id: userId, video_id: videoId }))
            )
          : Promise.resolve(),
      ]);
      return { ok: true };
    }
  );
}

export async function getAccessibleVideoIds(userId: string) {
  return withWriteFallback(
    async () => {
      const [videoAccess, categoryAccess] = await Promise.all([
        prisma.userVideoAccess.findMany({ where: { userId }, select: { videoId: true } }),
        prisma.userCategoryAccess.findMany({ where: { userId }, select: { categoryId: true } }),
      ]);
      return {
        videoIds: videoAccess.map((a) => a.videoId),
        categoryIds: categoryAccess.map((a) => a.categoryId),
      };
    },
    async () => {
      const [videoAccess, categoryAccess] = await Promise.all([
        rest.restList<{ video_id: string }>(
          'user_video_access',
          `?user_id=eq.${encodeURIComponent(userId)}&select=video_id`
        ),
        rest.restList<{ category_id: string }>(
          'user_category_access',
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

export async function getUserProfileDetails(userId: string) {
  return withWriteFallback(
    async () => {
      const [user, videoAccess, categoryAccess, subscriptions] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { fullName: true, email: true, phone: true, createdAt: true, isCoach: true },
        }),
        prisma.userVideoAccess.findMany({ where: { userId }, select: { videoId: true } }),
        prisma.userCategoryAccess.findMany({ where: { userId }, select: { categoryId: true } }),
        prisma.subscription.findMany({
          where: { userId },
          include: { package: true },
          orderBy: { createdAt: 'desc' },
        }),
      ]);
      return { user, videoAccess, categoryAccess, subscriptions };
    },
    async () => {
      const [user, videoAccess, categoryAccess, subscriptions] = await Promise.all([
        rest.restOne<Record<string, unknown>>(
          'users',
          `?id=eq.${encodeURIComponent(userId)}&select=full_name,email,phone,created_at,is_coach`
        ),
        rest.restList<{ video_id: string }>(
          'user_video_access',
          `?user_id=eq.${encodeURIComponent(userId)}&select=video_id`
        ),
        rest.restList<{ category_id: string }>(
          'user_category_access',
          `?user_id=eq.${encodeURIComponent(userId)}&select=category_id`
        ),
        rest.restList<Record<string, unknown>>(
          'subscriptions',
          `?user_id=eq.${encodeURIComponent(userId)}&select=*,packages(*)&order=created_at.desc`
        ),
      ]);
      return {
        user: user
          ? {
              fullName: user.full_name,
              email: user.email,
              phone: user.phone,
              createdAt: user.created_at,
              isCoach: user.is_coach,
            }
          : null,
        videoAccess: videoAccess.map((v) => ({ videoId: v.video_id })),
        categoryAccess: categoryAccess.map((c) => ({ categoryId: c.category_id })),
        subscriptions: subscriptions.map((s) => ({
          id: s.id,
          status: s.status,
          startDate: s.start_date,
          endDate: s.end_date,
          createdAt: s.created_at,
          package: s.packages ?? null,
        })),
      };
    }
  );
}

export async function listAccessibleCategories(userId: string) {
  const { videoIds, categoryIds } = await getAccessibleVideoIds(userId);
  const hasExplicitAccess = categoryIds.length > 0 || videoIds.length > 0;
  const [publicCats, granted] = await Promise.all([
    dataListPublicCategories(),
    categoryIds.length ? dataListCategoriesByIds(categoryIds) : [],
  ]);
  return resolveAccessibleContent({
    hasExplicitAccess,
    publicItems: publicCats as Array<{ id: string }>,
    grantedItems: granted as Array<{ id: string }>,
  });
}

export async function listAccessibleVideos(userId: string) {
  const { videoIds, categoryIds } = await getAccessibleVideoIds(userId);
  const hasExplicitAccess = categoryIds.length > 0 || videoIds.length > 0;
  const [publicVids, byVideo] = await Promise.all([
    dataListPublicVideos(),
    videoIds.length ? dataListVideosByIds(videoIds) : [],
  ]);
  const publicItems = publicVids as unknown as Array<{ id: string }>;
  const grantedPrivate = byVideo as unknown as Array<{ id: string }>;
  if (!hasExplicitAccess) {
    return dedupeById(publicItems);
  }
  // Keep public catalog visible; explicit rows add private grants on top.
  return dedupeById([...publicItems, ...grantedPrivate]);
}

async function dataListPublicCategories() {
  try {
    return await prisma.category.findMany({ where: { isPublic: true } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    return rest.restList('categories', '?is_public=eq.true');
  }
}

async function dataListCategoriesByIds(ids: string[]) {
  try {
    return await prisma.category.findMany({ where: { id: { in: ids } } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    return rest.restList('categories', `?id=in.(${ids.join(',')})`);
  }
}

async function dataListPublicVideos() {
  try {
    return await prisma.video.findMany({ where: { isPublic: true }, include: { category: true } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const rows = await rest.restList<Record<string, unknown>>(
      'videos',
      '?select=*,categories(*)&is_public=eq.true'
    );
    return rows.map((v) => ({ ...v, category: v.categories }));
  }
}

async function dataListVideosByIds(ids: string[]) {
  try {
    return await prisma.video.findMany({ where: { id: { in: ids } }, include: { category: true } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const rows = await rest.restList<Record<string, unknown>>(
      'videos',
      `?select=*,categories(*)&id=in.(${ids.join(',')})`
    );
    return rows.map((v) => ({ ...v, category: v.categories }));
  }
}

async function dataListVideosByCategoryIds(categoryIds: string[]) {
  try {
    return await prisma.video.findMany({
      where: { categoryId: { in: categoryIds } },
      include: { category: true },
    });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const rows = await rest.restList<Record<string, unknown>>(
      'videos',
      `?select=*,categories(*)&category_id=in.(${categoryIds.join(',')})`
    );
    return rows.map((v) => ({ ...v, category: v.categories }));
  }
}
