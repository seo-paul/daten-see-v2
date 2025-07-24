/**
 * TanStack Query Configuration
 * Optimized stale-while-revalidate settings for performance
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Optimized query configurations for different data types
 */
export const QUERY_CONFIG = {
  // Fast-changing data (user interactions, real-time data)
  REALTIME: {
    staleTime: 0, // Always considered stale
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // 30 seconds
  },

  // Medium-changing data (dashboard lists, user profiles)
  DYNAMIC: {
    staleTime: 2 * 60 * 1000, // 2 minutes fresh
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
    refetchOnWindowFocus: true,
    refetchInterval: false,
  },

  // Slow-changing data (settings, configurations)
  STATIC: {
    staleTime: 15 * 60 * 1000, // 15 minutes fresh
    gcTime: 60 * 60 * 1000, // 1 hour in cache
    refetchOnWindowFocus: false,
    refetchInterval: false,
  },

  // Critical data (authentication, permissions)
  CRITICAL: {
    staleTime: 30 * 1000, // 30 seconds fresh
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 60 * 1000, // 1 minute
  },

  // Background data (analytics, logs)
  BACKGROUND: {
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  },
} as const;

/**
 * Create production-optimized QueryClient
 */
export function createOptimizedQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default to DYNAMIC config for most use cases
        staleTime: QUERY_CONFIG.DYNAMIC.staleTime,
        gcTime: QUERY_CONFIG.DYNAMIC.gcTime,
        
        // Network optimization
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Error handling
        retry: (failureCount, error: Record<string, unknown>) => {
          // Don't retry on 404s or authentication errors
          if (error?.status === 404 || error?.status === 401) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Performance optimization - keep previous data while fetching new data
        placeholderData: (previousData: unknown) => previousData,
        
        // Additional stale-while-revalidate behavior
        // Note: staleTime and gcTime already set above
      },
      mutations: {
        retry: 1, // Only retry mutations once
        retryDelay: 1000,
      },
    },
  });
}

/**
 * Query key factory for consistent naming
 */
export const queryKeys = {
  // Authentication
  auth: ['auth'] as const,
  authUser: () => [...queryKeys.auth, 'user'] as const,
  
  // Dashboards
  dashboards: ['dashboards'] as const,
  dashboardsList: () => [...queryKeys.dashboards, 'list'] as const,
  dashboard: (id: string) => [...queryKeys.dashboards, 'detail', id] as const,
  
  // Analytics (future)
  analytics: ['analytics'] as const,
  
  // Settings
  settings: ['settings'] as const,
  userSettings: (userId: string) => [...queryKeys.settings, 'user', userId] as const,
} as const;

/**
 * Specialized query options for different data types
 */
export const createQueryOptions = {
  /**
   * For dashboard data - medium update frequency
   */
  dashboard: (id?: string) => ({
    ...QUERY_CONFIG.DYNAMIC,
    queryKey: id ? queryKeys.dashboard(id) : queryKeys.dashboardsList(),
  }),

  /**
   * For authentication data - high security, frequent checks
   */
  auth: () => ({
    ...QUERY_CONFIG.CRITICAL,
    queryKey: queryKeys.authUser(),
  }),

  /**
   * For settings data - infrequent updates
   */
  settings: (userId?: string) => ({
    ...QUERY_CONFIG.STATIC,
    queryKey: userId ? queryKeys.userSettings(userId) : queryKeys.settings,
  }),

  /**
   * For real-time analytics - frequent updates
   */
  analytics: () => ({
    ...QUERY_CONFIG.REALTIME,
    queryKey: queryKeys.analytics,
  }),
};

/**
 * Network status detection for adaptive behavior
 */
export function getNetworkOptimizedConfig() {
  // Check if we're in a slow network environment
  const connection = (navigator as Record<string, unknown>)?.connection as Record<string, string> | undefined;
  const isSlowNetwork = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
  
  if (isSlowNetwork) {
    return {
      staleTime: 5 * 60 * 1000, // Keep data fresh longer on slow networks
      gcTime: 30 * 60 * 1000, // Cache longer
      refetchOnWindowFocus: false, // Reduce network requests
    };
  }
  
  return QUERY_CONFIG.DYNAMIC;
}

/**
 * Development-specific query client with debugging
 */
export function createDevQueryClient(): QueryClient {
  const client = createOptimizedQueryClient();
  
  if (process.env.NODE_ENV === 'development') {
    // Enable React Query DevTools logging
    client.setMutationDefaults(['debug'], {
      onSuccess: (data, variables) => {
        console.log('Mutation success:', { data, variables });
      },
      onError: (error, variables) => {
        console.error('Mutation error:', { error, variables });
      },
    });
  }
  
  return client;
}