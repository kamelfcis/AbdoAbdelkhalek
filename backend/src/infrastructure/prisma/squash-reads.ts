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
import {
  applyListFilters,
  applySubscriptionListFilters,
  applyTraineeListFilters,
  restFilterSuffix,
  restSubscriptionFilterSuffix,
  restTraineeFilterSuffix,
} from '../../common/utils/list-filters.js';

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

async function restCount(table: string, query = ''): Promise<number> {
  const sep = query.includes('?') ? '&' : '?';
  const rows = await rest.restList<Record<string, unknown>>(table, `${query}${sep}select=id`);
  return rows.length;
}

const SQUASH_CATEGORY_SEARCH_FIELDS = [
  { en: 'nameEn', ar: 'nameAr' },
  { en: 'descriptionEn', ar: 'descriptionAr' },
];

const SQUASH_CATEGORY_REST_SEARCH_FIELDS = ['name_en', 'name_ar', 'description_en', 'description_ar'];

export async function listSquashCategoriesPublic(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const baseWhere = applyListFilters(
    { isPublic: true },
    filters,
    { searchFields: SQUASH_CATEGORY_SEARCH_FIELDS }
  );
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.squashCategory.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' }, ...page }),
        prisma.squashCategory.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashCategory.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?is_public=eq.true&order=created_at.desc${restFilterSuffix(filters, SQUASH_CATEGORY_REST_SEARCH_FIELDS)}`;
    if (paginated) {
      const items = await rest.restList(T.categories, `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount(T.categories, `?is_public=eq.true${restFilterSuffix(filters, SQUASH_CATEGORY_REST_SEARCH_FIELDS)}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList(T.categories, base);
  }
}

export async function listSquashCategoriesAll(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const baseWhere = applyListFilters({}, filters, {
    searchFields: SQUASH_CATEGORY_SEARCH_FIELDS,
  });
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.squashCategory.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' }, ...page }),
        prisma.squashCategory.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashCategory.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?order=created_at.desc${restFilterSuffix(filters, SQUASH_CATEGORY_REST_SEARCH_FIELDS)}`;
    if (paginated) {
      const items = await rest.restList(T.categories, `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount(T.categories, `?${restFilterSuffix(filters, SQUASH_CATEGORY_REST_SEARCH_FIELDS).slice(1)}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList(T.categories, base);
  }
}

const SQUASH_VIDEO_SEARCH_FIELDS = [
  { en: 'titleEn', ar: 'titleAr' },
  { en: 'descriptionEn', ar: 'descriptionAr' },
];

const SQUASH_VIDEO_REST_SEARCH_FIELDS = ['title_en', 'title_ar', 'description_en', 'description_ar'];

function squashVideoWherePublic(filters?: ListQueryFilters) {
  return applyListFilters(
    { isPublic: true },
    filters,
    {
      searchFields: SQUASH_VIDEO_SEARCH_FIELDS,
      categoryField: 'categoryId',
    }
  );
}

function squashVideoWhereAll(filters?: ListQueryFilters) {
  return applyListFilters({}, filters, {
    searchFields: SQUASH_VIDEO_SEARCH_FIELDS,
    categoryField: 'categoryId',
  });
}

export async function listSquashVideosPublic(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const where = squashVideoWherePublic(filters);
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.squashVideo.findMany({
          where,
          include: { category: true },
          orderBy: { createdAt: 'desc' },
          ...page,
        }),
        prisma.squashVideo.count({ where }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashVideo.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?select=*,squash_categories(*)&is_public=eq.true&order=created_at.desc${restFilterSuffix(filters, SQUASH_VIDEO_REST_SEARCH_FIELDS)}`;
    const rows = await rest.restList<Record<string, unknown>>(
      T.videos,
      `${base}${restPaginationSuffix(pagination, base)}`
    );
    const items = rows.map((v) => ({ ...v, category: v.squash_categories }));
    if (paginated) {
      const total = await restCount(T.videos, `?is_public=eq.true${restFilterSuffix(filters, SQUASH_VIDEO_REST_SEARCH_FIELDS)}`);
      return toListResponse(items, total, pagination);
    }
    return items;
  }
}

export async function listSquashVideosAll(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const where = squashVideoWhereAll(filters);
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.squashVideo.findMany({
          where,
          include: { category: true },
          orderBy: { createdAt: 'desc' },
          ...page,
        }),
        prisma.squashVideo.count({ where }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashVideo.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?select=*,squash_categories(*)&order=created_at.desc${restFilterSuffix(filters, SQUASH_VIDEO_REST_SEARCH_FIELDS)}`;
    const rows = await rest.restList<Record<string, unknown>>(
      T.videos,
      `${base}${restPaginationSuffix(pagination, base)}`
    );
    const items = rows.map((v) => ({ ...v, category: v.squash_categories }));
    if (paginated) {
      const total = await restCount(T.videos, `?${restFilterSuffix(filters, SQUASH_VIDEO_REST_SEARCH_FIELDS).slice(1)}`);
      return toListResponse(items, total, pagination);
    }
    return items;
  }
}

export async function listSquashPackagesActive(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const baseWhere = applyListFilters({ isActive: true }, filters, {
    searchFields: [{ en: 'nameEn', ar: 'nameAr' }],
  });
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.squashPackage.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' }, ...page }),
        prisma.squashPackage.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashPackage.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?is_active=eq.true&order=created_at.desc${restFilterSuffix(filters, ['name_en', 'name_ar'])}`;
    if (paginated) {
      const items = await rest.restList(T.packages, `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount(T.packages, `?is_active=eq.true${restFilterSuffix(filters, ['name_en', 'name_ar'])}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList(T.packages, base);
  }
}

export async function listSquashPackagesAll(
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
        prisma.squashPackage.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' }, ...page }),
        prisma.squashPackage.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashPackage.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?order=created_at.desc${restFilterSuffix(filters, ['name_en', 'name_ar'])}`;
    if (paginated) {
      const items = await rest.restList(T.packages, `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount(T.packages, `?${restFilterSuffix(filters, ['name_en', 'name_ar']).slice(1)}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList(T.packages, base);
  }
}

export async function listSquashReviewsPublic(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const baseWhere = applyListFilters({ isPublic: true }, filters);
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.squashReview.findMany({ where: baseWhere, orderBy: { displayOrder: 'asc' }, ...page }),
        prisma.squashReview.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashReview.findMany({ where: baseWhere, orderBy: { displayOrder: 'asc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?is_public=eq.true&order=display_order.asc${restFilterSuffix(filters)}`;
    if (paginated) {
      const items = await rest.restList(T.reviews, `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount(T.reviews, `?is_public=eq.true${restFilterSuffix(filters)}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList(T.reviews, base);
  }
}

export async function listSquashSuccessStoriesPublic(
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
      T.successStories,
      `${base}${restPaginationSuffix(pagination, base)}`
    );
    if (paginated) {
      const total = await restCount(
        T.successStories,
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
        prisma.squashSuccessStory.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' }, ...page }),
        prisma.squashSuccessStory.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashSuccessStory.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    return restFetch();
  }
}

export async function listSquashFaqsPublic(
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
        prisma.squashFaq.findMany({ where: baseWhere, orderBy: { orderIndex: 'asc' }, ...page }),
        prisma.squashFaq.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashFaq.findMany({ where: baseWhere, orderBy: { orderIndex: 'asc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?is_active=eq.true&order=order_index.asc${restFilterSuffix(filters, ['question_en', 'question_ar'])}`;
    if (paginated) {
      const items = await rest.restList(T.faqs, `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount(T.faqs, `?is_active=eq.true${restFilterSuffix(filters, ['question_en', 'question_ar'])}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList(T.faqs, base);
  }
}

export async function listSquashCoachesPublic(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const baseWhere = applyListFilters(
    { isPublic: true },
    filters,
    { searchFields: [{ en: 'nameEn', ar: 'nameAr' }, { en: 'titleEn', ar: 'titleAr' }] }
  );
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.squashCoach.findMany({ where: baseWhere, orderBy: { displayOrder: 'asc' }, ...page }),
        prisma.squashCoach.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashCoach.findMany({ where: baseWhere, orderBy: { displayOrder: 'asc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?is_public=eq.true&order=display_order.asc${restFilterSuffix(filters, ['name_en', 'name_ar', 'title_en', 'title_ar'])}`;
    if (paginated) {
      const items = await rest.restList(T.coaches, `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount(T.coaches, `?is_public=eq.true${restFilterSuffix(filters, ['name_en', 'name_ar', 'title_en', 'title_ar'])}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList(T.coaches, base);
  }
}

export async function listSquashCoachesAll(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const baseWhere = applyListFilters({}, filters, {
    searchFields: [{ en: 'nameEn', ar: 'nameAr' }, { en: 'titleEn', ar: 'titleAr' }],
  });
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.squashCoach.findMany({ where: baseWhere, orderBy: { displayOrder: 'asc' }, ...page }),
        prisma.squashCoach.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashCoach.findMany({ where: baseWhere, orderBy: { displayOrder: 'asc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?order=display_order.asc${restFilterSuffix(filters, ['name_en', 'name_ar', 'title_en', 'title_ar'])}`;
    if (paginated) {
      const items = await rest.restList(T.coaches, `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount(T.coaches, `?${restFilterSuffix(filters, ['name_en', 'name_ar', 'title_en', 'title_ar']).slice(1)}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList(T.coaches, base);
  }
}

export async function listSquashProgramsPublic(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const baseWhere = applyListFilters(
    { isPublic: true, isActive: true },
    filters,
    { searchFields: [{ en: 'nameEn', ar: 'nameAr' }] }
  );
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.squashProgram.findMany({ where: baseWhere, orderBy: { displayOrder: 'asc' }, ...page }),
        prisma.squashProgram.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashProgram.findMany({ where: baseWhere, orderBy: { displayOrder: 'asc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?is_public=eq.true&is_active=eq.true&order=display_order.asc${restFilterSuffix(filters, ['name_en', 'name_ar'])}`;
    if (paginated) {
      const items = await rest.restList(T.programs, `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount(
        T.programs,
        `?is_public=eq.true&is_active=eq.true${restFilterSuffix(filters, ['name_en', 'name_ar'])}`
      );
      return toListResponse(items, total, pagination);
    }
    return rest.restList(T.programs, base);
  }
}

export async function listSquashProgramsAll(
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
        prisma.squashProgram.findMany({ where: baseWhere, orderBy: { displayOrder: 'asc' }, ...page }),
        prisma.squashProgram.count({ where: baseWhere }),
      ]);
      return toListResponse(items, total, pagination);
    }
    return await prisma.squashProgram.findMany({ where: baseWhere, orderBy: { displayOrder: 'asc' } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const base = `?order=display_order.asc${restFilterSuffix(filters, ['name_en', 'name_ar'])}`;
    if (paginated) {
      const items = await rest.restList(T.programs, `${base}${restPaginationSuffix(pagination, base)}`);
      const total = await restCount(T.programs, `?${restFilterSuffix(filters, ['name_en', 'name_ar']).slice(1)}`);
      return toListResponse(items, total, pagination);
    }
    return rest.restList(T.programs, base);
  }
}

async function squashPackageIds(): Promise<string[]> {
  return (await prisma.squashPackage.findMany({ select: { id: true } })).map((p) => p.id);
}

async function squashPackageIdsRest(): Promise<string[]> {
  const rows = await rest.restList<{ id: string }>('squash_packages', '?select=id');
  return rows.map((r) => r.id);
}

async function squashSubscriptionScope(): Promise<Prisma.SubscriptionWhereInput> {
  const ids = await squashPackageIds();
  if (!ids.length) return { packageId: { in: [] } };
  return { packageId: { in: ids } };
}

function restSquashPackageFilter(ids: string[]): string {
  if (!ids.length) return '&package_id=in.()';
  return `&package_id=in.(${ids.join(',')})`;
}

async function squashTraineeUserIds(): Promise<string[]> {
  const squashScope = await squashSubscriptionScope();
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
      ...subs.map((r) => r.userId).filter((id): id is string => id != null),
      ...registered.map((r) => r.id),
    ]),
  ];
}

type SquashSubRow = {
  id: string;
  userId: string | null;
  packageId: string | null;
  status: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date | null;
  user?: { fullName: string | null; email: string } | null;
};

async function attachSquashPackages(rows: SquashSubRow[]) {
  const packageIds = [...new Set(rows.map((r) => r.packageId).filter(Boolean))] as string[];
  const packages =
    packageIds.length > 0
      ? await prisma.squashPackage.findMany({ where: { id: { in: packageIds } } })
      : [];
  const pkgMap = new Map(packages.map((p) => [p.id, p]));
  return rows.map((sub) => {
    const pkg = sub.packageId ? pkgMap.get(sub.packageId) : null;
    return {
      id: sub.id,
      user_id: sub.userId,
      package_id: sub.packageId,
      status: sub.status,
      start_date: sub.startDate,
      end_date: sub.endDate,
      created_at: sub.createdAt,
      users: sub.user ? { full_name: sub.user.fullName, email: sub.user.email } : undefined,
      packages: pkg
        ? {
            id: pkg.id,
            name_en: pkg.nameEn,
            name_ar: pkg.nameAr,
            duration_days: pkg.durationDays,
          }
        : null,
    };
  });
}

async function attachSquashPackagesRest(items: Record<string, unknown>[]) {
  const packageIds = [
    ...new Set(items.map((r) => r.package_id as string | undefined).filter(Boolean)),
  ] as string[];
  const packages =
    packageIds.length > 0
      ? await rest.restList<Record<string, unknown>>(
          T.packages,
          `?id=in.(${packageIds.join(',')})&select=id,name_en,name_ar,duration_days`
        )
      : [];
  const pkgMap = new Map(packages.map((p) => [p.id as string, p]));
  return items.map((sub) => ({
    ...sub,
    packages: sub.package_id ? pkgMap.get(sub.package_id as string) ?? null : null,
  }));
}

export async function listSquashSubscriptions(
  userId: string,
  isCoach: boolean,
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    const squashScope = await squashSubscriptionScope();
    if (isCoach) {
      const where = applySubscriptionListFilters(squashScope, filters);
      if (paginated) {
        const [items, total] = await Promise.all([
          prisma.subscription.findMany({
            where,
            include: { user: { select: { fullName: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            ...page,
          }),
          prisma.subscription.count({ where }),
        ]);
        return toListResponse(await attachSquashPackages(items), total, pagination);
      }
      return attachSquashPackages(
        await prisma.subscription.findMany({
          where,
          include: { user: { select: { fullName: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        })
      );
    }
    const where: Prisma.SubscriptionWhereInput = {
      AND: [{ userId }, squashScope, applySubscriptionListFilters({}, filters)],
    };
    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.subscription.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          ...page,
        }),
        prisma.subscription.count({ where }),
      ]);
      return toListResponse(await attachSquashPackages(items), total, pagination);
    }
    return attachSquashPackages(
      await prisma.subscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const squashIds = await squashPackageIdsRest();
    const pkgFilter = restSquashPackageFilter(squashIds);
    if (isCoach) {
      const base = `?select=*,users(full_name,email)&order=created_at.desc${pkgFilter}${restSubscriptionFilterSuffix(filters)}`;
      if (paginated) {
        const items = await attachSquashPackagesRest(
          await rest.restList('subscriptions', `${base}${restPaginationSuffix(pagination, base)}`)
        );
        const total = await restCount(
          'subscriptions',
          `?${pkgFilter.slice(1)}${restSubscriptionFilterSuffix(filters)}`
        );
        return toListResponse(items, total, pagination);
      }
      return attachSquashPackagesRest(await rest.restList('subscriptions', base));
    }
    const base = `?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc${pkgFilter}${restSubscriptionFilterSuffix(filters)}`;
    if (paginated) {
      const items = await attachSquashPackagesRest(
        await rest.restList('subscriptions', `${base}${restPaginationSuffix(pagination, base)}`)
      );
      const total = await restCount(
        'subscriptions',
        `?user_id=eq.${encodeURIComponent(userId)}${pkgFilter}${restSubscriptionFilterSuffix(filters)}`
      );
      return toListResponse(items, total, pagination);
    }
    return attachSquashPackagesRest(await rest.restList('subscriptions', base));
  }
}

type SquashTraineeRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: Date;
  registered_from: string | null;
  subscription_status: string | null;
};

function mapSquashTraineeRow(
  user: {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    createdAt: Date;
    registeredFrom: string | null;
  },
  subscriptionStatus?: string | null
): SquashTraineeRow {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    phone: user.phone,
    created_at: user.createdAt,
    registered_from: user.registeredFrom,
    subscription_status: subscriptionStatus ?? null,
  };
}

async function attachSquashTraineeSubscriptionStatus(
  users: { id: string }[]
): Promise<Map<string, string | null>> {
  if (!users.length) return new Map();
  const squashScope = await squashSubscriptionScope();
  const subs = await prisma.subscription.findMany({
    where: {
      userId: { in: users.map((u) => u.id) },
      ...squashScope,
    },
    orderBy: { createdAt: 'desc' },
    select: { userId: true, status: true },
  });
  const byUser = new Map<string, string | null>();
  for (const user of users) byUser.set(user.id, null);
  for (const sub of subs) {
    if (!sub.userId) continue;
    if (!byUser.has(sub.userId) || byUser.get(sub.userId) == null) {
      byUser.set(sub.userId, sub.status);
    }
  }
  return byUser;
}

async function filterSquashTraineeIdsBySubscription(
  userIds: string[],
  filters?: ListQueryFilters
): Promise<string[]> {
  if (!filters?.subscriptionStatus && !filters?.packageId) return userIds;
  const squashScope = await squashSubscriptionScope();
  const where = applyTraineeListFilters(
    { id: { in: userIds }, isCoach: false },
    filters,
    squashScope
  ) as Prisma.UserWhereInput;
  const rows = await prisma.user.findMany({ where, select: { id: true } });
  return rows.map((r) => r.id);
}

export async function listSquashTrainees(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  let userIds = await squashTraineeUserIds();
  if (!userIds.length) {
    return pagination?.limit != null ? toListResponse([], 0, pagination) : [];
  }

  const page = prismaPage(pagination);
  const paginated = pagination?.limit != null;
  try {
    const squashScope = await squashSubscriptionScope();
    const baseWhere = applyTraineeListFilters(
      { id: { in: userIds }, isCoach: false },
      filters,
      squashScope
    ) as Prisma.UserWhereInput;

    if (paginated) {
      const [items, total] = await Promise.all([
        prisma.user.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' }, ...page }),
        prisma.user.count({ where: baseWhere }),
      ]);
      const statusMap = await attachSquashTraineeSubscriptionStatus(items);
      const mapped = items.map((user) =>
        mapSquashTraineeRow(user, statusMap.get(user.id) ?? null)
      );
      return toListResponse(mapped, total, pagination);
    }
    const items = await prisma.user.findMany({ where: baseWhere, orderBy: { createdAt: 'desc' } });
    const statusMap = await attachSquashTraineeSubscriptionStatus(items);
    return items.map((user) => mapSquashTraineeRow(user, statusMap.get(user.id) ?? null));
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    userIds = await filterSquashTraineeIdsBySubscription(userIds, filters);
    if (!userIds.length) {
      return pagination?.limit != null ? toListResponse([], 0, pagination) : [];
    }
    const idFilter = `&id=in.(${userIds.join(',')})`;
    const base = `?is_coach=eq.false&select=id,email,full_name,phone,created_at,registered_from&order=created_at.desc${idFilter}${restTraineeFilterSuffix(filters)}`;
    if (paginated) {
      const items = await rest.restList<Record<string, unknown>>(
        'users',
        `${base}${restPaginationSuffix(pagination, base)}`
      );
      const total = await restCount('users', `?is_coach=eq.false${idFilter}${restTraineeFilterSuffix(filters)}`);
      const mapped = items.map((row) => ({
        id: row.id as string,
        email: row.email as string,
        full_name: (row.full_name as string | null) ?? null,
        phone: (row.phone as string | null) ?? null,
        created_at: row.created_at as Date,
        registered_from: (row.registered_from as string | null) ?? null,
        subscription_status: null,
      }));
      return toListResponse(mapped, total, pagination);
    }
    const items = await rest.restList<Record<string, unknown>>('users', base);
    return items.map((row) => ({
      id: row.id as string,
      email: row.email as string,
      full_name: (row.full_name as string | null) ?? null,
      phone: (row.phone as string | null) ?? null,
      created_at: row.created_at as Date,
      registered_from: (row.registered_from as string | null) ?? null,
      subscription_status: null,
    }));
  }
}

function squashStartOfCurrentMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getSquashDashboardStats() {
  try {
    const squashScope = await squashSubscriptionScope();
    const traineeIds = await squashTraineeUserIds();
    const monthStart = squashStartOfCurrentMonth();
    const [
      categories,
      videos,
      packages,
      reviews,
      successStories,
      faqs,
      subscriptions,
      activeSubscriptions,
      traineesNewThisMonth,
      activeSubUserRows,
    ] = await Promise.all([
      prisma.squashCategory.count(),
      prisma.squashVideo.count(),
      prisma.squashPackage.count(),
      prisma.squashReview.count(),
      prisma.squashSuccessStory.count(),
      prisma.squashFaq.count(),
      prisma.subscription.count({ where: squashScope }),
      prisma.subscription.count({ where: { AND: [squashScope, { status: 'active' }] } }),
      prisma.user.count({
        where: { id: { in: traineeIds }, createdAt: { gte: monthStart } },
      }),
      prisma.subscription.findMany({
        where: { AND: [squashScope, { status: 'active' }] },
        select: { userId: true },
        distinct: ['userId'],
      }),
    ]);
    const publicVideos = await prisma.squashVideo.count({ where: { isPublic: true } });
    const activeSubUserIds = new Set(activeSubUserRows.map((row) => row.userId));
    const traineesWithoutActiveSubscription = traineeIds.filter((id) => !activeSubUserIds.has(id)).length;
    return {
      categories,
      videos,
      packages,
      reviews,
      successStories,
      faqs,
      trainees: traineeIds.length,
      subscriptions,
      activeSubscriptions,
      traineesNewThisMonth,
      traineesWithoutActiveSubscription,
      totalSubscriptions: subscriptions,
      publicVideos,
      privateVideos: videos - publicVideos,
    };
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const counts = await Promise.all(
      Object.values(T).map((table) =>
        rest.restList(table, '?select=id&limit=1').then((rows) => rows.length)
      )
    );
    return {
      categories: counts[0],
      videos: counts[1],
      packages: counts[2],
      reviews: counts[3],
      successStories: counts[4],
      faqs: counts[5],
      trainees: 0,
      subscriptions: 0,
      activeSubscriptions: 0,
      traineesNewThisMonth: 0,
      traineesWithoutActiveSubscription: 0,
      totalSubscriptions: 0,
      publicVideos: 0,
      privateVideos: 0,
    };
  }
}

const VIDEO_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getSquashVideoById(id: string) {
  if (!VIDEO_ID_RE.test(id)) return null;
  try {
    return await prisma.squashVideo.findUnique({
      where: { id },
      include: { category: true },
    });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const row = await rest.restOne<Record<string, unknown>>(
      T.videos,
      `?select=*,squash_categories(*)&id=eq.${encodeURIComponent(id)}`
    );
    if (!row) return null;
    return { ...row, category: row.squash_categories };
  }
}
