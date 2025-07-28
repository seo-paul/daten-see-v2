/**
 * TanStack Query Integration Safety Tests
 * Tests: Cache management, mutation safety, query configuration, error handling
 * 
 * CRITICAL for AI Safety - ensures query state consistency and prevents data corruption
 */

import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';

import { createOptimizedQueryClient, QUERY_CONFIG, queryKeys } from '../config';

// Test wrapper with QueryClient
const createTestQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for testing
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

const createWrapper = (queryClient: QueryClient): React.FC<{ children: React.ReactNode }> => {
  const TestWrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  TestWrapper.displayName = 'TanStackQueryTestWrapper';
  return TestWrapper;
};

describe('TanStack Query Integration Safety Tests', (): void => {
  let queryClient: QueryClient;

  beforeEach((): void => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  afterEach((): void => {
    queryClient.clear();
  });

  describe('Query Configuration Safety', (): void => {
    it('should use safe default configurations', (): void => {
      const optimizedClient = createOptimizedQueryClient();
      const defaultOptions = optimizedClient.getDefaultOptions();

      // Verify retry limits prevent infinite loops
      expect(typeof defaultOptions.queries?.retry).toBe('function');
      const retryFn = defaultOptions.queries?.retry as (failureCount: number, error: Error) => boolean;
      
      // Should not retry 404s or 401s
      expect(retryFn(1, { status: 404 } as unknown as Error)).toBe(false);
      expect(retryFn(1, { status: 401 } as unknown as Error)).toBe(false);
      
      // Should retry other errors but limit attempts
      expect(retryFn(1, new Error('Network error'))).toBe(true);
      expect(retryFn(3, new Error('Network error'))).toBe(false);

      // Verify stale time configurations are reasonable
      expect(QUERY_CONFIG.CRITICAL.staleTime).toBe(30 * 1000); // 30 seconds
      expect(QUERY_CONFIG.STATIC.staleTime).toBe(15 * 60 * 1000); // 15 minutes
    });

    it('should prevent dangerous query configurations', (): void => {
      // Verify no infinite refetch intervals
      Object.values(QUERY_CONFIG).forEach(config => {
        if (config.refetchInterval) {
          expect(config.refetchInterval).toBeGreaterThan(10000); // Minimum 10 seconds
        }
      });

      // Verify garbage collection times prevent memory leaks
      Object.values(QUERY_CONFIG).forEach(config => {
        expect(config.gcTime).toBeGreaterThan(0);
        expect(config.gcTime).toBeLessThan(2 * 60 * 60 * 1000); // Max 2 hours
      });
    });

    it('should validate retry delay prevents overwhelming server', (): void => {
      const optimizedClient = createOptimizedQueryClient();
      const defaultOptions = optimizedClient.getDefaultOptions();
      const retryDelay = defaultOptions.queries?.retryDelay as (attemptIndex: number) => number;

      // Verify exponential backoff with reasonable limits
      expect(retryDelay(0)).toBe(1000); // 1 second
      expect(retryDelay(1)).toBe(2000); // 2 seconds
      expect(retryDelay(2)).toBe(4000); // 4 seconds
      expect(retryDelay(10)).toBe(30000); // Cap at 30 seconds
    });
  });

  describe('Query State Management Safety', (): void => {
    it('should handle basic query lifecycle correctly', async (): Promise<void> => {
      const mockQueryFn = jest.fn().mockResolvedValue(['item1', 'item2']);
      
      const useTestQuery = (): any => useQuery({
        queryKey: ['test'],
        queryFn: mockQueryFn,
      });

      const { result } = renderHook(() => useTestQuery(), {
        wrapper: createWrapper(queryClient),
      });

      // Initial state should be safe
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBe(null);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify final state
      expect(result.current.data).toEqual(['item1', 'item2']);
      expect(mockQueryFn).toHaveBeenCalledTimes(1);
    });

    it('should handle query errors gracefully', async (): Promise<void> => {
      const mockError = new Error('Test error');
      const mockQueryFn = jest.fn().mockRejectedValue(mockError);
      
      const useTestQuery = (): any => useQuery({
        queryKey: ['test-error'],
        queryFn: mockQueryFn,
      });

      const { result } = renderHook(() => useTestQuery(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Verify error state is handled properly
      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle enabled/disabled queries correctly', async (): Promise<void> => {
      const mockQueryFn = jest.fn().mockResolvedValue('data');
      
      const useTestQuery = (enabled: boolean): any => useQuery({
        queryKey: ['test-enabled'],
        queryFn: mockQueryFn,
        enabled,
      });

      const { result, rerender } = renderHook(
        ({ enabled }) => useTestQuery(enabled),
        {
          wrapper: createWrapper(queryClient),
          initialProps: { enabled: false },
        }
      );

      // Query should not execute when disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockQueryFn).not.toHaveBeenCalled();

      // Enable query
      rerender({ enabled: true });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockQueryFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mutation Safety', (): void => {
    it('should handle mutations with proper error boundaries', async (): Promise<void> => {
      const mockMutationFn = jest.fn().mockResolvedValue({ id: 'new-item', name: 'Created' });
      
      const useTestMutation = (): any => useMutation({
        mutationFn: mockMutationFn,
      });

      const { result } = renderHook(() => useTestMutation(), {
        wrapper: createWrapper(queryClient),
      });

      // Initial state should be safe
      expect(result.current.isIdle).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBe(null);

      // Execute mutation
      await act(async () => {
        result.current.mutate({ name: 'Test Item' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({ id: 'new-item', name: 'Created' });
      expect(mockMutationFn).toHaveBeenCalledWith({ name: 'Test Item' });
    });

    it('should handle mutation errors without breaking', async (): Promise<void> => {
      const mockError = new Error('Mutation failed');
      const mockMutationFn = jest.fn().mockRejectedValue(mockError);
      
      const useTestMutation = (): any => useMutation({
        mutationFn: mockMutationFn,
      });

      const { result } = renderHook(() => useTestMutation(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ name: 'Test Item' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('Cache Management Safety', (): void => {
    it('should prevent memory leaks through proper cache cleanup', async (): Promise<void> => {
      const initialQueries = queryClient.getQueryCache().getAll().length;

      // Create query
      const { result } = renderHook(
        () => useQuery({
          queryKey: ['memory-test'],
          queryFn: () => Promise.resolve('data'),
        }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const queriesAfterCreation = queryClient.getQueryCache().getAll().length;
      expect(queriesAfterCreation).toBeGreaterThan(initialQueries);

      // Clear cache and verify cleanup
      queryClient.clear();
      
      const queriesAfterCleanup = queryClient.getQueryCache().getAll().length;
      expect(queriesAfterCleanup).toBe(0);
    });

    it('should handle cache invalidation safely', async (): Promise<void> => {
      const mockQueryFn = jest.fn().mockResolvedValue(['item1', 'item2']);
      
      const { result } = renderHook(
        () => useQuery({
          queryKey: ['invalidation-test'],
          queryFn: mockQueryFn,
        }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockQueryFn).toHaveBeenCalledTimes(1);

      // Invalidate query
      await act(async () => {
        queryClient.invalidateQueries({ queryKey: ['invalidation-test'] });
      });

      await waitFor(() => {
        expect(mockQueryFn).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Query Key Safety', (): void => {
    it('should use consistent query keys', (): void => {
      // Verify query keys are deterministic
      const dashboardId = 'test-id';
      
      const listKey1 = queryKeys.dashboardsList();
      const listKey2 = queryKeys.dashboardsList();
      expect(listKey1).toEqual(listKey2);
      
      const detailKey1 = queryKeys.dashboard(dashboardId);
      const detailKey2 = queryKeys.dashboard(dashboardId);
      expect(detailKey1).toEqual(detailKey2);
      
      // Verify different IDs create different keys
      const detailKey3 = queryKeys.dashboard('different-id');
      expect(detailKey1).not.toEqual(detailKey3);
    });

    it('should prevent query key conflicts', (): void => {
      // Verify query key structure prevents conflicts
      const authKey = queryKeys.authUser();
      const dashboardKey = queryKeys.dashboardsList();
      
      expect(authKey[0]).not.toBe(dashboardKey[0]);
      expect(authKey.join('-')).not.toBe(dashboardKey.join('-'));
    });
  });

  describe('Error Recovery Safety', (): void => {
    it('should recover from network errors', async (): Promise<void> => {
      let shouldFail = true;
      const mockQueryFn = jest.fn().mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve('success');
      });
      
      const { result } = renderHook(
        () => useQuery({
          queryKey: ['recovery-test'],
          queryFn: mockQueryFn,
        }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for initial error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Fix the "network" and retry
      shouldFail = false;
      
      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe('success');
    });

    it('should maintain state consistency during errors', async (): Promise<void> => {
      const mockQueryFn = jest.fn()
        .mockResolvedValueOnce('initial-data')
        .mockRejectedValueOnce(new Error('Update failed'));
      
      const { result } = renderHook(
        () => useQuery({
          queryKey: ['consistency-test'],
          queryFn: mockQueryFn,
        }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for initial success
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const initialData = result.current.data;

      // Trigger refetch that will fail
      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Previous data should still be available
      expect(result.current.data).toBe(initialData);
    });
  });
});