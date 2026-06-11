import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { landingSectionsService } from '../api/landingSectionsService';
import { queryKeys } from '../lib/queryKeys';

export function useLandingSections(domain, { coachMode = false } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.landingSections(domain),
    queryFn: () => landingSectionsService.getLandingSections(domain),
    staleTime: coachMode ? 30 * 1000 : 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: ({ key, visible }) =>
      landingSectionsService.setLandingSectionVisible(domain, key, visible),
    onMutate: async ({ key, visible }) => {
      const qk = queryKeys.landingSections(domain);
      await queryClient.cancelQueries({ queryKey: qk });
      const previous = queryClient.getQueryData(qk);
      queryClient.setQueryData(qk, (old) => ({
        ...(old || { domain, sections: {} }),
        domain,
        sections: { ...(old?.sections || {}), [key]: visible },
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.landingSections(domain), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.landingSections(domain) });
    },
  });

  return {
    ...query,
    sections: query.data?.sections ?? {},
    toggleSection: mutation.mutate,
    toggleSectionAsync: mutation.mutateAsync,
    isToggling: mutation.isPending,
    togglingKey: mutation.variables?.key ?? null,
  };
}
