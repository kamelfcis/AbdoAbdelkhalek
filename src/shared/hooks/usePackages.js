import { useQuery } from '@tanstack/react-query';
import { contentService } from '../api/contentService';
import { queryKeys } from '../lib/queryKeys';

export const usePackages = () => {
  return useQuery({
    queryKey: queryKeys.packages(),
    queryFn: () => contentService.getPackages(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
