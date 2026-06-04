import { useQuery } from '@tanstack/react-query';
import { contentService } from '../api/contentService';
import { queryKeys } from '../lib/queryKeys';
import { useAuthQueryOptions } from './useAuthQuery';
import { fitnessConfig } from '../../domains/fitness/config';

const ENTITY_FETCHERS = {
  categories: () => contentService.getCategories(),
  videos: () => contentService.getVideos(),
  packages: () => contentService.getPackages(),
  reviews: () => contentService.getReviews(),
  successStories: () => contentService.getSuccessStories(),
  faqs: () => contentService.getFaqs(),
};

const ENTITY_PUBLIC_KEYS = {
  categories: queryKeys.categories,
  videos: queryKeys.videos,
  packages: queryKeys.packages,
  reviews: queryKeys.reviews,
  successStories: queryKeys.successStories,
  faqs: queryKeys.faqs,
};

const ENTITY_DASHBOARD_KEYS = {
  categories: queryKeys.dashboard.categories,
  videos: queryKeys.dashboard.videos,
  packages: queryKeys.dashboard.packages,
  reviews: queryKeys.dashboard.reviews,
  successStories: queryKeys.dashboard.successStories,
  faqs: queryKeys.dashboard.faqs,
};

/**
 * Domain-aware content query — public landing vs coach dashboard list.
 * @param {'categories'|'videos'|'packages'|'reviews'|'successStories'|'faqs'} entity
 * @param {{ scope?: 'public'|'dashboard', domain?: string, enabled?: boolean, staleTime?: number }} [options]
 */
export function useContentEntity(entity, options = {}) {
  const scope = options.scope || 'public';
  const domain = options.domain || fitnessConfig.domain;
  const enabled = options.enabled !== false;
  const fetcher = ENTITY_FETCHERS[entity];
  const keyFn = scope === 'dashboard' ? ENTITY_DASHBOARD_KEYS[entity] : ENTITY_PUBLIC_KEYS[entity];

  if (!fetcher || !keyFn) {
    throw new Error(`useContentEntity: unknown entity "${entity}"`);
  }

  const auth = useAuthQueryOptions(scope === 'dashboard' && enabled);
  const staleTime =
    options.staleTime ?? (scope === 'dashboard' ? 2 * 60 * 1000 : 10 * 60 * 1000);
  const gcTime = scope === 'dashboard' ? undefined : 30 * 60 * 1000;

  return useQuery({
    queryKey: keyFn(),
    queryFn: fetcher,
    staleTime,
    ...(gcTime ? { gcTime } : {}),
    ...(scope === 'dashboard' ? auth : { enabled }),
  });
}
