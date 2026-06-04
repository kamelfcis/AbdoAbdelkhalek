import { useQuery } from '@tanstack/react-query';
import { contentService } from '../api/contentService';
import { queryKeys } from '../lib/queryKeys';

export const useFAQs = () => {
  return useQuery({
    queryKey: queryKeys.faqs(),
    queryFn: () => contentService.getFaqs(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
