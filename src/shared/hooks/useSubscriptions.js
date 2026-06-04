import { useQuery } from '@tanstack/react-query';

import { getContentService } from '../lib/getContentService';
import { queryKeys } from '../lib/queryKeys';
import { useAuthQueryOptions } from './useAuthQuery';

export const useSubscriptions = (options = {}) => {
  const domain = options.domain || 'fitness';
  const svc = getContentService(domain);
  const auth = useAuthQueryOptions(options.enabled !== false);

  return useQuery({
    queryKey: queryKeys.subscriptions(domain),
    queryFn: () => svc.getSubscriptions(),
    staleTime: 5 * 60 * 1000,
    ...auth,
  });
};
