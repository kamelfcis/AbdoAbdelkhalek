import { useQuery } from '@tanstack/react-query';
import { contentService } from '../api/contentService';
import { queryKeys } from '../lib/queryKeys';

export const useVideos = () => {
  return useQuery({
    queryKey: queryKeys.videos(),
    queryFn: () => contentService.getVideos(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    select: (data) => data,
  });
};
