/**
 * TanStack Query Test Wrapper
 * Provides isolated Query Client for tests
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export interface TestQueryWrapperProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

/**
 * Creates a fresh Query Client for testing
 * Each test gets isolated cache to prevent interference
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Disable retries in tests for faster failures
        retry: false,
        // Disable caching in tests for predictable behavior
        gcTime: 0,
        staleTime: 0,
        // Disable network calls in tests
        networkMode: 'offlineFirst',
      },
      mutations: {
        // Disable retries in tests
        retry: false,
        // Disable network calls in tests
        networkMode: 'offlineFirst',
      },
    },
    // Suppress console output during tests
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

/**
 * Test wrapper component for TanStack Query
 * Use this to wrap components that use Query hooks
 */
export function TestQueryWrapper({ 
  children, 
  queryClient = createTestQueryClient() 
}: TestQueryWrapperProps): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * HOC to wrap render function with Query Client
 * For use with React Testing Library
 */
export const withQueryClient = (ui: React.ReactElement, queryClient?: QueryClient) => {
  return (
    <TestQueryWrapper queryClient={queryClient}>
      {ui}
    </TestQueryWrapper>
  );
};

export default TestQueryWrapper;