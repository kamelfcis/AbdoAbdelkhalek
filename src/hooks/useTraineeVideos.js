import { useQuery } from '@tanstack/react-query';
import { contentService } from '../services/contentService';
import { queryKeys } from '../lib/queryKeys';

export const useTraineeVideos = () => {
  return useQuery({
    queryKey: queryKeys.trainee.videos(),
    queryFn: () => contentService.getVideos(),
    staleTime: 5 * 60 * 1000,
  });
};
