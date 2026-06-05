import type { ListQueryFilters } from './pagination.js';

/** Map legacy `fitness` filter to stored `online_football` value. */
export function normalizeRegisteredFromFilter(value: string): string {
  return value === 'fitness' ? 'online_football' : value;
}

const ONLINE_FOOTBALL_SOURCES = ['online_football', 'fitness'] as const;

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

export function traineeSearchClause(term: string): {
  OR: Record<string, { contains: string; mode: 'insensitive' }>[];
} {
  return {
    OR: [
      { fullName: { contains: term, mode: 'insensitive' } },
      { email: { contains: term, mode: 'insensitive' } },
      { phone: { contains: term, mode: 'insensitive' } },
    ],
  };
}

/** Trainee list filters: search, registration source, created date, subscription. */
export function applyTraineeListFilters<T extends Record<string, unknown>>(
  base: T,
  filters?: ListQueryFilters,
  subscriptionScope?: Record<string, unknown>
): T {
  const clauses: Record<string, unknown>[] = [{ ...base }];

  if (filters?.registeredFrom && filters.registeredFrom !== 'all') {
    if (filters.registeredFrom === 'legacy') {
      clauses.push({ registeredFrom: null });
    } else {
      const source = normalizeRegisteredFromFilter(filters.registeredFrom);
      if (source === 'online_football') {
        clauses.push({ registeredFrom: { in: [...ONLINE_FOOTBALL_SOURCES] } });
      } else {
        clauses.push({ registeredFrom: source });
      }
    }
  }

  const createdRange = dateRangeClause(filters?.createdDateFrom, filters?.createdDateTo);
  if (createdRange) {
    clauses.push({ createdAt: createdRange });
  }

  if (subscriptionScope && (filters?.subscriptionStatus || filters?.packageId)) {
    if (filters.subscriptionStatus === 'none') {
      clauses.push({ subscriptions: { none: subscriptionScope } });
    } else {
      const subWhere: Record<string, unknown> = { ...subscriptionScope };
      if (filters.packageId) subWhere.packageId = filters.packageId;
      if (filters.subscriptionStatus) subWhere.status = filters.subscriptionStatus;
      clauses.push({ subscriptions: { some: subWhere } });
    }
  }

  let searchClause: Record<string, unknown> | undefined;
  if (filters?.search) {
    searchClause = traineeSearchClause(filters.search);
  }

  const scalar =
    clauses.length === 1 ? clauses[0] : { AND: clauses };
  return combineWhereClauses(scalar, searchClause) as T;
}

/** PostgREST filters for trainee user lists. */
export function restTraineeFilterSuffix(
  filters?: ListQueryFilters,
  searchFields: string[] = ['full_name', 'email', 'phone']
): string {
  const parts: string[] = [];
  if (filters?.registeredFrom && filters.registeredFrom !== 'all') {
    if (filters.registeredFrom === 'legacy') {
      parts.push('registered_from=is.null');
    } else {
      const source = normalizeRegisteredFromFilter(filters.registeredFrom);
      if (source === 'online_football') {
        parts.push(`registered_from=in.(${ONLINE_FOOTBALL_SOURCES.join(',')})`);
      } else {
        parts.push(`registered_from=eq.${encodeURIComponent(source)}`);
      }
    }
  }
  if (filters?.createdDateFrom) {
    parts.push(`created_at=gte.${encodeURIComponent(filters.createdDateFrom)}`);
  }
  if (filters?.createdDateTo) {
    parts.push(`created_at=lte.${encodeURIComponent(endOfDayIso(filters.createdDateTo))}`);
  }
  if (filters?.search && searchFields.length) {
    const term = encodeURIComponent(`*${filters.search}*`);
    parts.push(`or=(${searchFields.map((f) => `${f}.ilike.${term}`).join(',')})`);
  }
  return parts.length ? `&${parts.join('&')}` : '';
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
