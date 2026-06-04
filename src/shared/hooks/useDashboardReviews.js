import { useQuery } from '@tanstack/react-query';

import { getContentService } from '../lib/getContentService';
import { queryKeys } from '../lib/queryKeys';

import { useAuthQueryOptions } from './useAuthQuery';



export const useDashboardReviews = (options = {}) => {
  const domain = options.domain || 'fitness';
  const svc = getContentService(domain);

  const auth = useAuthQueryOptions(options.enabled !== false);

  return useQuery({

    queryKey: queryKeys.dashboard.reviews(domain),

    queryFn: async () => svc.getReviews(),

    staleTime: 2 * 60 * 1000,

    ...auth,

  });

};


