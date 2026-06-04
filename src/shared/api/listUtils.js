export function normalizeListResponse(data) {
  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }
  if (data && typeof data === 'object' && Array.isArray(data.items)) {
    return {
      items: data.items,
      total: data.total ?? data.items.length,
      limit: data.limit,
      offset: data.offset,
    };
  }
  return { items: [], total: 0 };
}

export function buildListApiParams(page, limit, filters = {}) {
  const params = { limit, offset: (page - 1) * limit };
  if (filters.search) params.search = filters.search;
  if (filters.is_public === true || filters.is_public === 'true') params.is_public = 'true';
  if (filters.is_public === false || filters.is_public === 'false') params.is_public = 'false';
  if (filters.is_featured === true || filters.is_featured === 'true') params.is_featured = 'true';
  if (filters.is_featured === false || filters.is_featured === 'false') params.is_featured = 'false';
  if (filters.category_id) params.category_id = filters.category_id;
  if (filters.status) params.status = filters.status;
  if (filters.package_id) params.package_id = filters.package_id;
  if (filters.start_date_from) params.start_date_from = filters.start_date_from;
  if (filters.start_date_to) params.start_date_to = filters.start_date_to;
  if (filters.end_date_from) params.end_date_from = filters.end_date_from;
  if (filters.end_date_to) params.end_date_to = filters.end_date_to;
  return params;
}

export function filtersFromCrudState({ search, statusFilter, featuredFilter, categoryId } = {}) {
  const filters = {};
  if (search?.trim()) filters.search = search.trim();
  if (statusFilter === 'public') filters.is_public = 'true';
  if (statusFilter === 'private') filters.is_public = 'false';
  if (featuredFilter === 'featured') filters.is_featured = 'true';
  if (featuredFilter === 'regular') filters.is_featured = 'false';
  if (categoryId && categoryId !== 'all') filters.category_id = String(categoryId);
  return filters;
}

export function filtersFromSubscriptionState({
  search,
  statusFilter,
  packageId,
  startDateFrom,
  startDateTo,
  endDateFrom,
  endDateTo,
} = {}) {
  const filters = {};
  if (search?.trim()) filters.search = search.trim();
  if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
  if (packageId && packageId !== 'all') filters.package_id = String(packageId);
  if (startDateFrom) filters.start_date_from = startDateFrom;
  if (startDateTo) filters.start_date_to = startDateTo;
  if (endDateFrom) filters.end_date_from = endDateFrom;
  if (endDateTo) filters.end_date_to = endDateTo;
  return filters;
}

function buildQueryString(params) {
  if (!params) return '';
  const parts = [];
  if (params.limit != null) parts.push(`limit=${params.limit}`);
  if (params.offset != null) parts.push(`offset=${params.offset}`);
  if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.is_public === true || params.is_public === 'true') parts.push('is_public=true');
  if (params.is_public === false || params.is_public === 'false') parts.push('is_public=false');
  if (params.is_featured === true || params.is_featured === 'true') parts.push('is_featured=true');
  if (params.is_featured === false || params.is_featured === 'false') parts.push('is_featured=false');
  if (params.category_id) parts.push(`category_id=${encodeURIComponent(params.category_id)}`);
  if (params.status) parts.push(`status=${encodeURIComponent(params.status)}`);
  if (params.package_id) parts.push(`package_id=${encodeURIComponent(params.package_id)}`);
  if (params.start_date_from) parts.push(`start_date_from=${encodeURIComponent(params.start_date_from)}`);
  if (params.start_date_to) parts.push(`start_date_to=${encodeURIComponent(params.start_date_to)}`);
  if (params.end_date_from) parts.push(`end_date_from=${encodeURIComponent(params.end_date_from)}`);
  if (params.end_date_to) parts.push(`end_date_to=${encodeURIComponent(params.end_date_to)}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

export { buildQueryString };
