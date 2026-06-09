import { useQuery } from '@tanstack/react-query';
import { contentService } from '../api/contentService';
import { queryKeys } from '../lib/queryKeys';
import { useAuth } from '../../contexts/AuthContext';

export const useCategories = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const userId = isAuthenticated ? user?.id : null;

  return useQuery({
    queryKey: [...queryKeys.categories(), { userId }],
    queryFn: () => contentService.getCategories(),
    enabled: !authLoading,
    staleTime: userId ? 60 * 1000 : 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
