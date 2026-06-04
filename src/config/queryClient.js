import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized caching configuration for better performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - data is fresh for 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't refetch on component mount if data exists
      refetchOnReconnect: true, // Refetch on reconnect (good for offline support)
      retry: 1, // Retry failed requests once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      // Use structural sharing to prevent unnecessary re-renders
      structuralSharing: true,
      // Network mode: prefer cached data
      networkMode: 'online',
      // Placeholder data for better UX
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});

