import { useAuth } from '../../contexts/AuthContext';

export function useAuthQueryOptions(enabled = true) {
  const { isAuthenticated, isLoading, user } = useAuth();

  return {
    enabled: enabled && !isLoading && isAuthenticated,
    userId: user?.id ?? null,
  };
}
