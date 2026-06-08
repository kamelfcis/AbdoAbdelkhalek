import { useQuery } from '@tanstack/react-query';
import { getContentService } from '../lib/getContentService';
import { queryKeys } from '../lib/queryKeys';
import { useAuth } from '../../contexts/AuthContext';

export const useVideos = (domain = 'fitness') => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const resolvedDomain = typeof domain === 'string' ? domain : 'fitness';
  const svc = getContentService(resolvedDomain);
  const userId = isAuthenticated ? user?.id : null;

  return useQuery({
    queryKey: [...queryKeys.videos(resolvedDomain), { userId }],
    queryFn: () => svc.getVideos(),
    enabled: !authLoading,
    staleTime: userId ? 60 * 1000 : 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    select: (data) => data,
  });
};
