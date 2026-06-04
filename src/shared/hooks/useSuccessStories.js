import { useQuery } from '@tanstack/react-query';
import { contentService } from '../api/contentService';
import { queryKeys } from '../lib/queryKeys';

export const useSuccessStories = () => {
  return useQuery({
    queryKey: queryKeys.successStories(),
    queryFn: () => contentService.getSuccessStories(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
