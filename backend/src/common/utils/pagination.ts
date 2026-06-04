export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListQueryFilters {
  search?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  categoryId?: string;
  status?: string;
  packageId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

/** Optional `limit` / `offset` query params — omit both for full list (backward compatible). */
export function parsePagination(query: Record<string, unknown>): PaginationParams {
  if (query.limit == null && query.offset == null) {
    return {};
  }
  const limit =
    query.limit != null ? Math.min(Math.max(Number(query.limit) || 1, 1), 500) : undefined;
  const offset = query.offset != null ? Math.max(Number(query.offset) || 0, 0) : 0;
  return { limit, offset };
}

function readQueryString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

export function parseListFilters(query: Record<string, unknown>): ListQueryFilters {
  const filters: ListQueryFilters = {};
  const search = readQueryString(query.search);
  if (search) filters.search = search;

  const isPublic = query.is_public ?? query.isPublic;
  if (isPublic === 'true' || isPublic === true) filters.isPublic = true;
  if (isPublic === 'false' || isPublic === false) filters.isPublic = false;

  const isFeatured = query.is_featured ?? query.isFeatured;
  if (isFeatured === 'true' || isFeatured === true) filters.isFeatured = true;
  if (isFeatured === 'false' || isFeatured === false) filters.isFeatured = false;

  const categoryId = readQueryString(query.category_id ?? query.categoryId);
  if (categoryId && categoryId !== 'all') filters.categoryId = categoryId;

  const status = readQueryString(query.status);
  if (status) filters.status = status;

  const packageId = readQueryString(query.package_id ?? query.packageId);
  if (packageId) filters.packageId = packageId;

  const startDateFrom = readQueryString(query.start_date_from ?? query.startDateFrom);
  if (startDateFrom) filters.startDateFrom = startDateFrom;

  const startDateTo = readQueryString(query.start_date_to ?? query.startDateTo);
  if (startDateTo) filters.startDateTo = startDateTo;

  const endDateFrom = readQueryString(query.end_date_from ?? query.endDateFrom);
  if (endDateFrom) filters.endDateFrom = endDateFrom;

  const endDateTo = readQueryString(query.end_date_to ?? query.endDateTo);
  if (endDateTo) filters.endDateTo = endDateTo;

  return filters;
}

export function prismaPage(pagination?: PaginationParams): { take?: number; skip?: number } {
  if (pagination?.limit == null) return {};
  return { take: pagination.limit, skip: pagination.offset ?? 0 };
}

export function restPaginationSuffix(pagination?: PaginationParams, existingQuery = '') {
  if (pagination?.limit == null) return '';
  const sep = existingQuery.includes('?') ? '&' : '?';
  return `${sep}limit=${pagination.limit}&offset=${pagination.offset ?? 0}`;
}

export function toListResponse<T>(
  items: T[],
  total: number,
  pagination?: PaginationParams
): T[] | PaginatedResult<T> {
  if (pagination?.limit == null) return items;
  return {
    items,
    total,
    limit: pagination.limit,
    offset: pagination.offset ?? 0,
  };
}

export function isPaginatedResult<T>(value: unknown): value is PaginatedResult<T> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'items' in value &&
    Array.isArray((value as PaginatedResult<T>).items)
  );
}
