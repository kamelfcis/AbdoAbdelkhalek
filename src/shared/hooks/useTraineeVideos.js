import { useQuery } from '@tanstack/react-query';
import { getContentService } from '../lib/getContentService';
import { queryKeys } from '../lib/queryKeys';
import { useAuthQueryOptions } from './useAuthQuery';

export const useTraineeVideos = (domain = 'fitness', enabled = true) => {
  const { enabled: queryEnabled, userId } = useAuthQueryOptions(enabled);
  const svc = getContentService(domain);

  return useQuery({
    queryKey: [...queryKeys.trainee.videos(domain), { userId }],
    queryFn: () => svc.getVideos(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: queryEnabled,
  });
};
