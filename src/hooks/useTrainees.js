import { useQuery } from '@tanstack/react-query';

import { contentService } from '../services/contentService';

import { queryKeys } from '../lib/queryKeys';

import { useAuthQueryOptions } from './useAuthQuery';



export const useTrainees = (options = {}) => {

  const auth = useAuthQueryOptions(options.enabled !== false);

  return useQuery({

    queryKey: queryKeys.trainees(),

    queryFn: () => contentService.getTrainees(),

    staleTime: 5 * 60 * 1000,

    ...auth,

  });

};


