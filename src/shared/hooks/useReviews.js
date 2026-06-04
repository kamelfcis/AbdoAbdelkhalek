import { useQuery } from '@tanstack/react-query';
import { contentService } from '../api/contentService';
import { queryKeys } from '../lib/queryKeys';

export const useReviews = () => {
  return useQuery({
    queryKey: queryKeys.reviews(),
    queryFn: () => contentService.getReviews(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
