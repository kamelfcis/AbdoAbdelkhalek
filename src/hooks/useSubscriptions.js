import { useQuery } from '@tanstack/react-query';

import { contentService } from '../services/contentService';

import { queryKeys } from '../lib/queryKeys';

import { useAuthQueryOptions } from './useAuthQuery';



export const useSubscriptions = (options = {}) => {

  const auth = useAuthQueryOptions(options.enabled !== false);

  return useQuery({

    queryKey: queryKeys.subscriptions(),

    queryFn: () => contentService.getSubscriptions(),

    staleTime: 5 * 60 * 1000,

    ...auth,

  });

};


