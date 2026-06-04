import { useQuery } from '@tanstack/react-query';
import { getContentService } from '../lib/getContentService';
import { queryKeys } from '../lib/queryKeys';
import { normalizeListResponse } from '../api/listUtils';
import { useAuthQueryOptions } from './useAuthQuery';

/** Full category list for dropdowns (video filters, access modals) — separate from paginated table cache. */
export function useDashboardCategoriesAll(options = {}) {
  const domain = options.domain || 'fitness';
  const svc = getContentService(domain);
  const auth = useAuthQueryOptions(options.enabled !== false);

  return useQuery({
    queryKey: queryKeys.dashboard.categoriesAll(domain),
    queryFn: async () => {
      const data = await svc.getCategories({ limit: 500, offset: 0 });
      return normalizeListResponse(data).items;
    },
    staleTime: 5 * 60 * 1000,
    ...auth,
  });
}
