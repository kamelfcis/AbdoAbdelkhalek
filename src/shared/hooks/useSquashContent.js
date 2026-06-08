import { useQuery } from '@tanstack/react-query';
import { squashService } from '../api/squashService';
import { queryKeys } from '../lib/queryKeys';
import { useAuthQueryOptions } from './useAuthQuery';
import { useAuth } from '../../contexts/AuthContext';

const publicFetchers = {
  categories: () => squashService.getCategories(),
  videos: () => squashService.getVideos(),
  packages: () => squashService.getPackages(),
  reviews: () => squashService.getReviews(),
  successStories: () => squashService.getSuccessStories(),
  faqs: () => squashService.getFaqs(),
  coaches: () => squashService.getCoaches(),
  programs: () => squashService.getPrograms(),
};

const ENTITY_KEY = {
  categories: 'categories',
  videos: 'videos',
  packages: 'packages',
  reviews: 'reviews',
  successStories: 'successStories',
  faqs: 'faqs',
  coaches: 'coaches',
  programs: 'programs',
};

export function useSquashContent(entity, options = {}) {
  const scope = options.scope || 'public';
  const enabled = options.enabled !== false;
  const fetcher = publicFetchers[entity];
  const keyName = ENTITY_KEY[entity];
  const keyFn = scope === 'dashboard' ? queryKeys.dashboard[keyName] : queryKeys[keyName];

  if (!fetcher || !keyFn) {
    throw new Error(`useSquashContent: unknown entity "${entity}"`);
  }

  const auth = useAuthQueryOptions(scope === 'dashboard' && enabled);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const staleTime =
    options.staleTime ?? (scope === 'dashboard' ? 2 * 60 * 1000 : 10 * 60 * 1000);

  const publicAuthKey = scope === 'public' ? { auth: isAuthenticated } : null;

  return useQuery({
    queryKey: publicAuthKey ? [...keyFn('squash'), publicAuthKey] : keyFn('squash'),
    queryFn: fetcher,
    staleTime,
    enabled: scope === 'dashboard' ? auth.enabled : enabled && !authLoading,
  });
}
