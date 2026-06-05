import { useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getContentService } from '../lib/getContentService';
import { queryKeys } from '../lib/queryKeys';
import { normalizeListResponse, buildListApiParams } from '../api/listUtils';
import { useAuthQueryOptions } from './useAuthQuery';

export {
  buildListApiParams,
  filtersFromCrudState,
  filtersFromSubscriptionState,
  filtersFromTraineeState,
} from '../api/listUtils';

const LIST_METHODS = {
  categories: 'getCategories',
  videos: 'getVideos',
  packages: 'getPackages',
  reviews: 'getReviews',
  successStories: 'getSuccessStories',
  faqs: 'getFaqs',
  coaches: 'getCoaches',
  programs: 'getPrograms',
  trainees: 'getTrainees',
  subscriptions: 'getSubscriptions',
};

const QUERY_KEY_FNS = {
  categories: queryKeys.dashboard.categories,
  videos: queryKeys.dashboard.videos,
  packages: queryKeys.dashboard.packages,
  reviews: queryKeys.dashboard.reviews,
  successStories: queryKeys.dashboard.successStories,
  faqs: queryKeys.dashboard.faqs,
  coaches: queryKeys.dashboard.coaches,
  programs: queryKeys.dashboard.programs,
  trainees: queryKeys.trainees,
  subscriptions: queryKeys.subscriptions,
};

export function usePaginatedDashboardList({
  entity,
  domain = 'fitness',
  page = 1,
  limit = 10,
  filters = {},
  enabled = true,
}) {
  const queryClient = useQueryClient();
  const svc = getContentService(domain);
  const method = LIST_METHODS[entity];
  const keyFn = QUERY_KEY_FNS[entity];

  if (!method || !keyFn) {
    throw new Error(`usePaginatedDashboardList: unknown entity "${entity}"`);
  }

  const pageParams = { page, limit, ...filters };
  const queryKey = keyFn(domain, pageParams);
  const apiParams = buildListApiParams(page, limit, filters);
  const auth = useAuthQueryOptions(enabled);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await svc[method](apiParams);
      return normalizeListResponse(data);
    },
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...auth,
  });

  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / limit) || 1);

  useEffect(() => {
    if (!enabled || !query.isSuccess || page >= pageCount) return;
    const nextPage = page + 1;
    const nextParams = buildListApiParams(nextPage, limit, filters);
    const nextKey = keyFn(domain, { page: nextPage, limit, ...filters });
    queryClient.prefetchQuery({
      queryKey: nextKey,
      queryFn: async () => normalizeListResponse(await svc[method](nextParams)),
      staleTime: 2 * 60 * 1000,
    });
  }, [enabled, query.isSuccess, page, pageCount, limit, filters, domain, entity, queryClient, method, keyFn, svc]);

  return {
    items: query.data?.items ?? [],
    total,
    pageCount,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    queryKey,
  };
}
