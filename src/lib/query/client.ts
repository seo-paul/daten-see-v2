import { QueryClient } from '@tanstack/react-query';

import { appLogger } from '@/lib/monitoring/logger.config';

// Query Client Configuration with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      // Retry failed requests 2 times
      retry: 2,
      // Retry with exponential backoff
      retryDelay: (attemptIndex: number): number => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (useful for dashboard data)
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect for better UX
      refetchOnReconnect: false,
      // Refetch on mount only if data is stale
      refetchOnMount: true
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Log mutation errors
      onError: (error: Error): void => {
        appLogger.error('Mutation failed', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    }
  }
});

// Global error handler for queries via cache subscription
queryClient.getQueryCache().subscribe((event) => {
  if (event?.type === 'updated' && event.action?.type === 'error') {
    const error = event.action.error;
    appLogger.error('Query failed', { 
      queryKey: event.query.queryKey,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Development logging for cache events
if (process.env.NODE_ENV === 'development') {
  queryClient.getQueryCache().subscribe((event) => {
    if (event?.type === 'updated' && event.action?.type === 'success') {
      appLogger.debug('Query cache updated', {
        queryKey: event.query.queryKey,
        type: event.type
      });
    }
  });
}