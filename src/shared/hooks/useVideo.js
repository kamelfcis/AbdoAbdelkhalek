import { useQuery } from '@tanstack/react-query';
import { getContentService } from '../lib/getContentService';
import { queryKeys } from '../lib/queryKeys';
import { isWatchVideoId } from '../lib/watchRoutes';
import { useAuth } from '../../contexts/AuthContext';

export function useVideo(domain = 'fitness', videoId) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const resolvedDomain = domain === 'squash' ? 'squash' : 'fitness';
  const svc = getContentService(resolvedDomain);
  const userId = isAuthenticated ? user?.id : null;
  const enabled = Boolean(videoId) && isWatchVideoId(String(videoId)) && !authLoading;

  return useQuery({
    queryKey: [...queryKeys.video(resolvedDomain, videoId), { userId }],
    queryFn: () => svc.getVideo(videoId),
    enabled,
    retry: (failureCount, error) => {
      if ([401, 403, 404].includes(error?.status)) return false;
      return failureCount < 1;
    },
    staleTime: userId ? 60 * 1000 : 10 * 60 * 1000,
  });
}
