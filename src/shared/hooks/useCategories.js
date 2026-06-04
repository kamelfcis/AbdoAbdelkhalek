import { useQuery } from '@tanstack/react-query';
import { contentService } from '../api/contentService';
import { queryKeys } from '../lib/queryKeys';

export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => contentService.getCategories(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
