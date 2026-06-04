import { queryClient } from '../../config/queryClient';
import { getContentService } from './getContentService';
import { queryKeys } from './queryKeys';
import { buildListApiParams, normalizeListResponse } from '../api/listUtils';
import { VIDEOS_PAGE_SIZE } from '../../features/dashboard/constants/pagination';

const STALE_STATS = 60 * 1000;
const STALE_LIST = 2 * 60 * 1000;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const SECTION_CHUNKS = {
  categories: () =>
    import(/* webpackChunkName: "dash-categories" */ '../../features/dashboard/sections/CategoriesSection'),
  videos: () =>
    import(/* webpackChunkName: "dash-videos" */ '../../features/dashboard/sections/VideosSection'),
  overview: () =>
    import(/* webpackChunkName: "dash-overview" */ '../../features/dashboard/sections/OverviewSection'),
};

function paginatedListPrefetch(domain, entity, method, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
  const svc = getContentService(domain);
  const pageParams = { page, limit };
  const apiParams = buildListApiParams(page, limit, {});
  return queryClient.prefetchQuery({
    queryKey: queryKeys.dashboard[entity](domain, pageParams),
    queryFn: async () => normalizeListResponse(await svc[method](apiParams)),
    staleTime: STALE_LIST,
  });
}

/**
 * Warm dashboard cache and JS chunks after coach auth (login or session restore).
 * Uses paginated query keys so section tables hit cache on first paint.
 */
export async function prefetchDashboardData(domain = 'fitness') {
  const svc = getContentService(domain);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.stats(domain),
      queryFn: () => svc.getStats(),
      staleTime: STALE_STATS,
    }),
    paginatedListPrefetch(domain, 'categories', 'getCategories'),
    paginatedListPrefetch(domain, 'videos', 'getVideos', DEFAULT_PAGE, VIDEOS_PAGE_SIZE),
  ]);
}

/** Lazy-load dashboard section JS chunk on navigation. */
export function prefetchDashboardSection(section) {
  const chunkLoader = SECTION_CHUNKS[section];
  if (chunkLoader) {
    void chunkLoader();
  }
}
