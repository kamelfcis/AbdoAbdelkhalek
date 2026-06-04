import { useAuth } from '../../contexts/AuthContext';

export function useAuthQueryOptions(enabled = true) {
  const { isAuthenticated, isLoading } = useAuth();

  return {
    enabled: enabled && !isLoading && isAuthenticated,
  };
}
