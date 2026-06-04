import type { Prisma } from '@prisma/client';
import { prisma } from './client.js';
import { isPoolerError } from './db-errors.js';
import * as rest from '../supabase-rest/client.js';
import {
  type ListQueryFilters,
  type PaginationParams,
  prismaPage,
  restPaginationSuffix,
  toListResponse,
} from '../../common/utils/pagination.js';
import { applyListFilters, applySubscriptionListFilters, restFilterSuffix, restSubscriptionFilterSuffix } from '../../common/utils/list-filters.js';
import {
  filterLegacyFitnessUserIds,
  mergeFitnessTraineeUserIds,
} from './fitness-trainee-scope.js';

async function restCount(table: string, query = ''): Promise<number> {
  const sep = query.includes('?') ? '&' : '?';
  const rows = await rest.restList<Record<string, unknown>>(table, `${query}${sep}select=id`);
  return rows.length;
}

async function fitnessPackageIds(): Promise<string[]> {
  return (await prisma.package.findMany({ select: { id: true } })).map((p) => p.id);
}

async function fitnessPackageIdsRest(): Promise<string[]> {
  const rows = await rest.restList<{ id: string }>('packages', '?select=id');
  return rows.map((r) => r.id);
}

async function fitnessSubscriptionScope(): Promise<Prisma.SubscriptionWhereInput> {
  const ids = await fitnessPackageIds();
  if (!ids.length) return { packageId: null };
  return { OR: [{ packageId: { in: ids } }, { packageId: null }] };
}

function restFitnessPackageFilter(ids: string[]): string {
  if (!ids.length) return '&package_id=is.null';
  return `&or=(package_id.is.null,package_id.in.(${ids.join(',')}))`;
}

async function squashEntitledUserIds(): Promise<string[]> {
  const squashPackageIds = (
    await prisma.squashPackage.findMany({ select: { id: true } })
  ).map((p) => p.id);
  const squashScope: Prisma.SubscriptionWhereInput = squashPackageIds.length
    ? { packageId: { in: squashPackageIds } }
    : { packageId: { in: [] } };
  const [videoAccess, categoryAccess, subs, registered] = await Promise.all([
    prisma.squashUserVideoAccess.findMany({ select: { userId: true }, distinct: ['userId'] }),
    prisma.squashUserCategoryAccess.findMany({ select: { userId: true }, distinct: ['userId'] }),
    prisma.subscription.findMany({
      where: squashScope,
      select: { userId: true },
      distinct: ['userId'],
    }),
    prisma.user.findMany({
      where: { isCoach: false, registeredFrom: 'squash' },
      select: { id: true },
    }),
  ]);
  return [
    ...new Set([
      ...videoAccess.map((r) => r.userId),
      ...categoryAccess.map((r) => r.userId),
      ...subs.map((r) => r.userId),
      ...registered.map((r) => r.id),
    ]),
  ];
}

async function squashEntitledUserIdsRest(): Promise<string[]> {
  const squashPkgRows = await rest.restList<{ id: string }>('squash_packages', '?select=id');
  const squashPackageIds = squashPkgRows.map((r) => r.id);
  const pkgFilter = squashPackageIds.length
    ? `&package_id=in.(${squashPackageIds.join(',')})`
    : '';
  const [videoAccess, categoryAccess, subs, registered] = await Promise.all([
    rest.restList<{ user_id: string }>('squash_user_video_access', '?select=user_id'),
    rest.restList<{ user_id: string }>('squash_user_category_access', '?select=user_id'),
    squashPackageIds.length
      ? rest.restList<{ user_id: string }>(`subscriptions?select=user_id${pkgFilter}`)
      : Promise.resolve([]),
    rest.restList<{ id: string }>('users', '?is_coach=eq.false&registered_from=eq.squash&select=id'),
  ]);
  return [
    ...new Set([
      ...videoAccess.map((r) => r.user_id),
      ...categoryAccess.map((r) => r.user_id),
      ...subs.map((r) => r.user_id),
      ...registered.map((r) => r.id),
    ]),
  ];
}

async function fitnessTraineeUserIdsPrisma(): Promise<string[]> {
  const fitnessScope = await fitnessSubscriptionScope();
  const [videoAccess, categoryAccess, subs, registeredFitness, legacyNull, squashEntitled] =
    await Promise.all([
      prisma.userVideoAccess.findMany({ select: { userId: true }, distinct: ['userId'] }),
      prisma.userCategoryAccess.findMany({ select: { userId: true }, distinct: ['userId'] }),
      prisma.subscription.findMany({
        where: fitnessScope,
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.user.findMany({
        where: { isCoach: false, registeredFrom: 'fitness' },
        select: { id: true },
      }),
      prisma.user.findMany({
        where: { isCoach: false, registeredFrom: null },
        select: { id: true },
      }),
      squashEntitledUserIds(),
    ]);
  return mergeFitnessTraineeUserIds({
    videoAccess: videoAccess.map((r) => r.userId),
    categoryAccess: categoryAccess.map((r) => r.userId),
    subscription: subs.map((r) => r.userId),
    registeredFitness: registeredFitness.map((r) => r.id),
    legacyNull: filterLegacyFitnessUserIds(
      legacyNull.map((r) => r.id),
      squashEntitled
    ),
  });
}

async function fitnessTraineeUserIdsRest(): Promise<string[]> {
  const fitnessIds = await fitnessPackageIdsRest();
  const pkgFilter = restFitnessPackageFilter(fitnessIds);
  const [videoAccess, categoryAccess, subs, registeredFitness, legacyNull, squashEntitled] =
    await Promise.all([
      rest.restList<{ user_id: string }>('user_video_access', '?select=user_id'),
      rest.restList<{ user_id: string }>('user_category_access', '?select=user_id'),
      rest.restList<{ user_id: string }>(`subscriptions?select=user_id${pkgFilter}`),
      rest.restList<{ id: string }>(
        'users',
        '?is_coach=eq.false&registered_from=eq.fitness&select=id'
      ),
      rest.restList<{ id: string }>(
        'users',
        '?is_coach=eq.false&registered_from=is.null&select=id'
      ),
      squashEntitledUserIdsRest(),
    ]);
  return mergeFitnessTraineeUserIds({
    videoAccess: videoAccess.map((r) => r.user_id),
    categoryAccess: categoryAccess.map((r) => r.user_id),
    subscription: subs.map((r) => r.user_id),
    registeredFitness: registeredFitness.map((r) => r.id),
    legacyNull: filterLegacyFitnessUserIds(
      legacyNull.map((r) => r.id),
      squashEntitled
    ),
  });
}

async function fitnessTraineeUserIds(): Promise<string[]> {
  try {
    return await fitnessTraineeUserIdsPrisma();
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    return fitnessTraineeUserIdsRest();
  }
}

const CATEGORY_SEARCH_FIELDS = [
  { en: 'nameEn', ar: 'nameAr' },
  { en: 'descriptionEn', ar: 'descriptionAr' },
];

const CATEGORY_REST_SEARCH_FIELDS = ['name_en', 'name_ar', 'description_en', 'description_ar'];

export async function listCategoriesPublic(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const baseWhere = applyListFilters(
    { isPublic: true },
    filters,
    { searchFields: CATEGORY_SEARCH_FIELDS }
  );
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.category.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' }, ...page }),
        prisma.category.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.category.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?is_public=eq.true&order=created_at.desc${restFilterSuffix(filters, CATEGORY_REST_SEARCH_FIELDS)}`;
    if (paginated) {
      const items = await rest.restList('categories', `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount('categories', `?is_public=eq.true${restFilterSuffix(filters, CATEGORY_REST_SEARCH_FIELDS)}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList('categories', base);
  }
}

export async function listCategoriesAll(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const baseWhere = applyListFilters({}, filters, {
    searchFields: CATEGORY_SEARCH_FIELDS,
  });
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.category.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' }, ...page }),
        prisma.category.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.category.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?order=created_at.desc${restFilterSuffix(filters, CATEGORY_REST_SEARCH_FIELDS)}`;
    if (paginated) {
      const items = await rest.restList('categories', `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount('categories', `?${restFilterSuffix(filters, CATEGORY_REST_SEARCH_FIELDS).slice(1)}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList('categories', base);
  }
}

const VIDEO_SEARCH_FIELDS = [
  { en: 'titleEn', ar: 'titleAr' },
  { en: 'descriptionEn', ar: 'descriptionAr' },
];

const VIDEO_REST_SEARCH_FIELDS = ['title_en', 'title_ar', 'description_en', 'description_ar'];

function videoWherePublic(filters?: ListQueryFilters) {
  return applyListFilters(
    { isPublic: true },
    filters,
    {
      searchFields: VIDEO_SEARCH_FIELDS,
      categoryField: 'categoryId',
    }
  );
}

function videoWhereAll(filters?: ListQueryFilters) {
  return applyListFilters({}, filters, {
    searchFields: VIDEO_SEARCH_FIELDS,
    categoryField: 'categoryId',
  });
}

export async function listVideosPublic(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const where = videoWherePublic(filters);
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.video.findMany({
          where,
          include: { category: true },
          orderBy: { createdAt: 'desc' },
          ...page,
        }),
        prisma.video.count({ where }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.video.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?select=*,categories(*)&is_public=eq.true&order=created_at.desc${restFilterSuffix(filters, VIDEO_REST_SEARCH_FIELDS)}`;
    const rows = await rest.restList<Record<string, unknown>>(
      'videos',
      `${base}${restPaginationSuffix(pagination, base)}`
    );
    const items = rows.map((v) => ({ ...v, category: v.categories }));
    if (paginated) {
      const countQ = `?is_public=eq.true${restFilterSuffix(filters, VIDEO_REST_SEARCH_FIELDS)}`;
      const total = await restCount('videos', countQ);
      return toListResponse(items, total, pagination);
    }
    return items;
  }
}

export async function listVideosAll(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const where = videoWhereAll(filters);
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.video.findMany({
          where,
          include: { category: true },
          orderBy: { createdAt: 'desc' },
          ...page,
        }),
        prisma.video.count({ where }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.video.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?select=*,categories(*)&order=created_at.desc${restFilterSuffix(filters, VIDEO_REST_SEARCH_FIELDS)}`;
    const rows = await rest.restList<Record<string, unknown>>(
      'videos',
      `${base}${restPaginationSuffix(pagination, base)}`
    );
    const items = rows.map((v) => ({ ...v, category: v.categories }));
    if (paginated) {
      const countQ = `?${restFilterSuffix(filters, VIDEO_REST_SEARCH_FIELDS).slice(1)}`;
      const total = await restCount('videos', countQ || '?');
      return toListResponse(items, total, pagination);
    }
    return items;
  }
}

export async function listPackagesActive(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const baseWhere = applyListFilters({}, filters, {
    searchFields: [{ en: 'nameEn', ar: 'nameAr' }],
  });
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.package.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' }, ...page }),
        prisma.package.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.package.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?order=created_at.desc${restFilterSuffix(filters, ['name_en', 'name_ar'])}`;
    if (paginated) {
      const items = await rest.restList('packages', `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount('packages', `?${restFilterSuffix(filters, ['name_en', 'name_ar']).slice(1)}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList('packages', base);
  }
}

export async function listReviewsPublic(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const baseWhere = applyListFilters(
    { isPublic: true },
    filters,
    { publicField: 'isPublic' }
  );
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.review.findMany({ where: baseWhere, orderBy: { displayOrder: 'asc' }, ...page }),
        prisma.review.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.review.findMany({ where: baseWhere, orderBy: { displayOrder: 'asc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?is_public=eq.true&order=display_order.asc${restFilterSuffix(filters)}`;
    if (paginated) {
      const items = await rest.restList('reviews', `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount('reviews', `?is_public=eq.true${restFilterSuffix(filters)}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList('reviews', base);
  }
}

export async function listSuccessStoriesPublic(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const useRestFeatured = filters?.isFeatured != null;
  const baseWhere = applyListFilters({ isPublic: true }, filters, {
    searchFields: [{ en: 'titleEn', ar: 'titleAr' }],
    featuredField: 'isFeatured',
  });
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;

  const restFetch = async () => {
    const base = `?is_public=eq.true&order=created_at.desc${restFilterSuffix(filters, ['title_en', 'title_ar'])}`;
    const items = await rest.restList(
      'success_stories',
      `${base}${restPaginationSuffix(pagination, base)}`
    );
    if (paginated) {
      const total = await restCount(
        'success_stories',
        `?is_public=eq.true${restFilterSuffix(filters, ['title_en', 'title_ar'])}`
      );
      return toListResponse(items, total, pagination);
    }
    return items;
  };

  if (useRestFeatured) return restFetch();

  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.successStory.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' }, ...page }),
        prisma.successStory.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.successStory.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    return restFetch();
  }
}

export async function listFaqsPublic(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const baseWhere = applyListFilters(
    { isActive: true },
    filters,
    {
      searchFields: [{ en: 'questionEn', ar: 'questionAr' }],
      publicField: 'isActive',
    }
  );
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.faq.findMany({ where: baseWhere, orderBy: { orderIndex: 'asc' }, ...page }),
        prisma.faq.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.faq.findMany({ where: baseWhere, orderBy: { orderIndex: 'asc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?is_active=eq.true&order=order_index.asc${restFilterSuffix(filters, ['question_en', 'question_ar'])}`;
    if (paginated) {
      const items = await rest.restList('faqs', `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount('faqs', `?is_active=eq.true${restFilterSuffix(filters, ['question_en', 'question_ar'])}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList('faqs', base);
  }
}

export async function listTrainees(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    const userIds = await fitnessTraineeUserIdsPrisma();
    if (!userIds.length) {
      return paginated ? toListResponse([], 0, pagination) : [];
    }

    const baseWhere: Prisma.UserWhereInput = {
      id: { in: userIds },
      isCoach: false,
    };
    if (filters?.search) {
      baseWhere.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.user.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' }, ...page }),
        prisma.user.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.user.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const userIds = await fitnessTraineeUserIdsRest();
    if (!userIds.length) {
      return paginated ? toListResponse([], 0, pagination) : [];
    }
    const idFilter = `&id=in.(${userIds.join(',')})`;
    const base = `?is_coach=eq.false&select=id,email,full_name,phone,created_at,registered_from&order=created_at.desc${idFilter}${restFilterSuffix(filters, ['full_name', 'email'])}`;
    if (paginated) {
      const items = await rest.restList('users', `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount(
        'users',
        `?is_coach=eq.false${idFilter}${restFilterSuffix(filters, ['full_name', 'email'])}`
      );
      return toListResponse(items, total, pagination);
    }
    return rest.restList('users', base);
  }
}

export async function listSubscriptions(
  userId: string,
  isCoach: boolean,
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    const fitnessScope = await fitnessSubscriptionScope();
    if (isCoach) {
      const where = applySubscriptionListFilters(fitnessScope, filters);
      if (paginated) {
        const [items, total] = await Promise.all([
          prisma.subscription.findMany({
            where,
            include: {
              package: true,
              user: { select: { fullName: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
            ...page,
          }),
          prisma.subscription.count({ where }),
        ]);
        return toListResponse(items, total, pagination);
      }
      return await prisma.subscription.findMany({
        where,
        include: {
          package: true,
          user: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    const where: Prisma.SubscriptionWhereInput = {
      AND: [{ userId }, fitnessScope, applySubscriptionListFilters({}, filters)],
    };
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.subscription.findMany({
          where,
          include: { package: true },
          orderBy: { createdAt: 'desc' },
          ...page,
        }),
        prisma.subscription.count({ where }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.subscription.findMany({
      where,
      include: { package: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const fitnessIds = await fitnessPackageIdsRest();
    const pkgFilter = restFitnessPackageFilter(fitnessIds);
    if (isCoach) {
      const base = `?select=*,packages(*),users(full_name,email)&order=created_at.desc${pkgFilter}${restSubscriptionFilterSuffix(filters)}`;
      if (paginated) {
        const items = await rest.restList('subscriptions', `${base}${restPaginationSuffix(pagination, base)}`);
        const total = await restCount(
          'subscriptions',
          `?${pkgFilter.slice(1)}${restSubscriptionFilterSuffix(filters)}`
        );
        return toListResponse(items, total, pagination);
      }
      return rest.restList('subscriptions', base);
    }
    const base = `?user_id=eq.${encodeURIComponent(userId)}&select=*,packages(*)&order=created_at.desc${pkgFilter}${restSubscriptionFilterSuffix(filters)}`;
    if (paginated) {
      const items = await rest.restList('subscriptions', `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount(
        'subscriptions',
        `?user_id=eq.${encodeURIComponent(userId)}${restSubscriptionFilterSuffix(filters)}`
      );
      return toListResponse(items, total, pagination);
    }
    return rest.restList('subscriptions', base);
  }
}

export async function getDashboardStats() {
  try {
    const traineeIds = await fitnessTraineeUserIds();
    const fitnessScope = await fitnessSubscriptionScope();
    const [
      categories,
      videos,
      packages,
      subscriptions,
      activeSubscriptions,
      successStories,
      reviews,
      faqs,
      publicVideos,
      privateVideos,
    ] = await Promise.all([
      prisma.category.count(),
      prisma.video.count(),
      prisma.package.count(),
      prisma.subscription.count({ where: fitnessScope }),
      prisma.subscription.count({ where: { AND: [fitnessScope, { status: 'active' }] } }),
      prisma.successStory.count(),
      prisma.review.count(),
      prisma.faq.count(),
      prisma.video.count({ where: { isPublic: true } }),
      prisma.video.count({ where: { isPublic: false } }),
    ]);
    return {
      categories,
      videos,
      packages,
      trainees: traineeIds.length,
      subscriptions,
      activeSubscriptions,
      successStories,
      reviews,
      faqs,
      publicVideos,
      privateVideos,
    };
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const [videos, subscriptions] = await Promise.all([
      rest.restList<{ is_public?: boolean }>('videos', '?select=id,is_public'),
      rest.restList<{ status?: string }>('subscriptions', '?select=id,status'),
    ]);
    const [categories, packages, trainees, successStories, reviews, faqs] = await Promise.all([
      restCount('categories'),
      restCount('packages'),
      restCount('users', '?is_coach=eq.false'),
      restCount('success_stories'),
      restCount('reviews'),
      restCount('faqs'),
    ]);
    return {
      categories,
      videos: videos.length,
      packages,
      trainees,
      subscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter((s) => s.status === 'active').length,
      successStories,
      reviews,
      faqs,
      publicVideos: videos.filter((v) => v.is_public).length,
      privateVideos: videos.filter((v) => !v.is_public).length,
    };
  }
}
