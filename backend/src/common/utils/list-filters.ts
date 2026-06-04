import type { ListQueryFilters } from './pagination.js';

/** PostgREST filter fragments (leading `&` when non-empty). */
export function restFilterSuffix(
  filters?: ListQueryFilters,
  searchFields: string[] = []
): string {
  const parts: string[] = [];
  if (filters?.isPublic !== undefined) {
    parts.push(`is_public=eq.${filters.isPublic}`);
  }
  if (filters?.isFeatured !== undefined) {
    parts.push(`is_featured=eq.${filters.isFeatured}`);
  }
  if (filters?.categoryId) {
    parts.push(`category_id=eq.${encodeURIComponent(filters.categoryId)}`);
  }
  if (filters?.search && searchFields.length) {
    const term = encodeURIComponent(`*${filters.search}*`);
    parts.push(`or=(${searchFields.map((f) => `${f}.ilike.${term}`).join(',')})`);
  }
  return parts.length ? `&${parts.join('&')}` : '';
}

export function prismaSearchOr(
  term: string,
  fields: { en: string; ar: string }[]
): { OR: Record<string, { contains: string; mode: 'insensitive' }>[] } {
  return {
    OR: fields.flatMap(({ en, ar }) => [
      { [en]: { contains: term, mode: 'insensitive' as const } },
      { [ar]: { contains: term, mode: 'insensitive' as const } },
    ]),
  };
}

function endOfDayIso(date: string): string {
  return `${date}T23:59:59.999Z`;
}

function dateRangeClause(
  from?: string,
  to?: string
): { gte?: Date; lte?: Date } | undefined {
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(endOfDayIso(to)) } : {}),
  };
}

function combineWhereClauses(
  scalars: Record<string, unknown>,
  searchClause?: Record<string, unknown>
): Record<string, unknown> {
  if (searchClause && Object.keys(scalars).length > 0) {
    return { AND: [scalars, searchClause] };
  }
  if (searchClause) return searchClause;
  return scalars;
}

export function applyListFilters<T extends Record<string, unknown>>(
  base: T,
  filters?: ListQueryFilters,
  opts?: {
    searchFields?: { en: string; ar: string }[];
    publicField?: 'isPublic' | 'isActive';
    featuredField?: string;
    categoryField?: string;
  }
): T {
  const where: Record<string, unknown> = { ...base };
  const publicKey = opts?.publicField ?? 'isPublic';
  if (filters?.isPublic !== undefined) {
    where[publicKey] = filters.isPublic;
  }
  if (filters?.isFeatured !== undefined && opts?.featuredField) {
    where[opts.featuredField] = filters.isFeatured;
  }
  if (filters?.categoryId && opts?.categoryField) {
    where[opts.categoryField] = filters.categoryId;
  }
  if (filters?.search && opts?.searchFields?.length) {
    const searchClause = prismaSearchOr(filters.search, opts.searchFields);
    return combineWhereClauses(where, searchClause) as T;
  }
  return where as T;
}

/** Subscription list filters: trainee search, status, package, date ranges. */
export function applySubscriptionListFilters<T extends Record<string, unknown>>(
  base: T,
  filters?: ListQueryFilters
): T {
  const where: Record<string, unknown> = { ...base };

  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.packageId) {
    where.packageId = filters.packageId;
  }
  const startRange = dateRangeClause(filters?.startDateFrom, filters?.startDateTo);
  if (startRange) {
    where.startDate = startRange;
  }
  const endRange = dateRangeClause(filters?.endDateFrom, filters?.endDateTo);
  if (endRange) {
    where.endDate = endRange;
  }

  let searchClause: Record<string, unknown> | undefined;
  if (filters?.search) {
    searchClause = {
      OR: [
        { user: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ],
    };
  }

  return combineWhereClauses(where, searchClause) as T;
}

/** PostgREST filters for subscription lists (trainee search via users FK). */
export function restSubscriptionFilterSuffix(filters?: ListQueryFilters): string {
  const parts: string[] = [];
  if (filters?.status) {
    parts.push(`status=eq.${encodeURIComponent(filters.status)}`);
  }
  if (filters?.packageId) {
    parts.push(`package_id=eq.${encodeURIComponent(filters.packageId)}`);
  }
  if (filters?.startDateFrom) {
    parts.push(`start_date=gte.${encodeURIComponent(filters.startDateFrom)}`);
  }
  if (filters?.startDateTo) {
    parts.push(`start_date=lte.${encodeURIComponent(endOfDayIso(filters.startDateTo))}`);
  }
  if (filters?.endDateFrom) {
    parts.push(`end_date=gte.${encodeURIComponent(filters.endDateFrom)}`);
  }
  if (filters?.endDateTo) {
    parts.push(`end_date=lte.${encodeURIComponent(endOfDayIso(filters.endDateTo))}`);
  }
  if (filters?.search) {
    const term = encodeURIComponent(`*${filters.search}*`);
    parts.push(`or=(users.full_name.ilike.${term},users.email.ilike.${term})`);
  }
  return parts.length ? `&${parts.join('&')}` : '';
}
