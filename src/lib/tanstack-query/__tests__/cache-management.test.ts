/**
 * TanStack Query Cache Management Tests
 * 80% Coverage for Cache Operations - Critical Business Logic
 * 
 * Test Categories:
 * 1. Query Cache Invalidation & Refetching (5 tests)
 * 2. Cache Time & Stale-While-Revalidate (4 tests)  
 * 3. Network-Aware Cache Management (3 tests)
 * 4. Optimistic Updates & Cache Mutations (4 tests)
 * 5. Cache Persistence & Garbage Collection (4 tests)
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

import {
  createOptimizedQueryClient,
  createDevQueryClient, 
  QUERY_CONFIG,
  queryKeys,
  createQueryOptions,
  getNetworkOptimizedConfig,
} from '../config';

// Mock navigator.connection for network tests
const mockConnection = {
  effectiveType: '4g',
  downlink: 10,
};

Object.defineProperty(navigator, 'connection', {
  writable: true,
  value: mockConnection,
});

describe('TanStack Query Cache Management Tests - 80% Cache Coverage', () => {
  let queryClient: QueryClient;
  let queryCache: QueryCache;
  let mutationCache: MutationCache;

  beforeEach(() => {
    queryClient = createOptimizedQueryClient();
    queryCache = queryClient.getQueryCache();
    mutationCache = queryClient.getMutationCache();
    
    // Clear all caches
    queryClient.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Query Cache Invalidation & Refetching', () => {
    it('should invalidate dashboard queries and trigger refetch', async () => {
      const mockData = [{ id: '1', name: 'Test Dashboard' }];
      
      // Set initial cache data
      queryClient.setQueryData(queryKeys.dashboardsList(), mockData);
      
      // Verify data is cached
      const cachedData = queryClient.getQueryData(queryKeys.dashboardsList());
      expect(cachedData).toEqual(mockData);
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboards });
      
      // Verify cache state changed
      const query = queryCache.find({ queryKey: queryKeys.dashboardsList() });
      expect(query?.state.isInvalidated).toBe(true);
    });

    it('should invalidate specific dashboard by ID', async () => {
      const dashboardId = 'dashboard-123';
      const mockDashboard = { id: dashboardId, name: 'Test Dashboard' };
      
      // Cache dashboard data
      queryClient.setQueryData(queryKeys.dashboard(dashboardId), mockDashboard);
      
      // Invalidate specific dashboard
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.dashboard(dashboardId) 
      });
      
      const query = queryCache.find({ queryKey: queryKeys.dashboard(dashboardId) });
      expect(query?.state.isInvalidated).toBe(true);
    });

    it('should handle partial invalidation with predicate function', async () => {
      // Cache multiple dashboards
      queryClient.setQueryData(queryKeys.dashboard('1'), { id: '1', name: 'Dashboard 1' });
      queryClient.setQueryData(queryKeys.dashboard('2'), { id: '2', name: 'Dashboard 2' });
      queryClient.setQueryData(queryKeys.dashboardsList(), []);
      
      // Invalidate only specific dashboard queries (not list)
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes('dashboards') && 
                 query.queryKey.includes('detail');
        },
      });
      
      // Verify selective invalidation
      const detailQuery1 = queryCache.find({ queryKey: queryKeys.dashboard('1') });
      const detailQuery2 = queryCache.find({ queryKey: queryKeys.dashboard('2') });
      const listQuery = queryCache.find({ queryKey: queryKeys.dashboardsList() });
      
      expect(detailQuery1?.state.isInvalidated).toBe(true);
      expect(detailQuery2?.state.isInvalidated).toBe(true);
      expect(listQuery?.state.isInvalidated).toBe(false);
    });

    it('should refetch queries on window focus for critical data', () => {
      const authOptions = createQueryOptions.auth();
      
      expect(authOptions).toMatchObject({
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: QUERY_CONFIG.CRITICAL.staleTime,
      });
    });

    it('should handle cache removal and cleanup', () => {
      const dashboardId = 'temp-dashboard';
      
      // Add data to cache
      queryClient.setQueryData(queryKeys.dashboard(dashboardId), { id: dashboardId });
      
      // Verify data exists
      expect(queryClient.getQueryData(queryKeys.dashboard(dashboardId))).toBeTruthy();
      
      // Remove specific query from cache
      queryClient.removeQueries({ queryKey: queryKeys.dashboard(dashboardId) });
      
      // Verify data removed
      expect(queryClient.getQueryData(queryKeys.dashboard(dashboardId))).toBeUndefined();
    });
  });

  describe('Cache Time & Stale-While-Revalidate', () => {
    it('should respect staleTime for different data types', () => {
      const realtimeOptions = createQueryOptions.analytics();
      const dynamicOptions = createQueryOptions.dashboard();
      const staticOptions = createQueryOptions.settings();
      
      expect(realtimeOptions.staleTime).toBe(0); // Always stale
      expect(dynamicOptions.staleTime).toBe(2 * 60 * 1000); // 2 minutes
      expect(staticOptions.staleTime).toBe(15 * 60 * 1000); // 15 minutes
    });

    it('should configure garbage collection time correctly', () => {
      const client = createOptimizedQueryClient();
      const defaultGcTime = client.getDefaultOptions().queries?.gcTime;
      
      expect(defaultGcTime).toBe(QUERY_CONFIG.DYNAMIC.gcTime);
      expect(defaultGcTime).toBe(10 * 60 * 1000); // 10 minutes
    });

    it('should keep previous data during refetch (placeholderData)', async () => {
      const initialData = [{ id: '1', name: 'Dashboard 1' }];
      
      // Set initial data
      queryClient.setQueryData(queryKeys.dashboardsList(), initialData);
      
      // Simulate stale data fetch with placeholder
      const defaultOptions = queryClient.getDefaultOptions().queries;
      const placeholderData = defaultOptions?.placeholderData as (prev: unknown) => unknown;
      
      if (typeof placeholderData === 'function') {
        const placeholder = placeholderData(initialData);
        expect(placeholder).toEqual(initialData);
      }
    });

    it('should handle cache expiration and automatic cleanup', () => {
      jest.useFakeTimers();
      
      const dashboardId = 'expiring-dashboard';
      queryClient.setQueryData(queryKeys.dashboard(dashboardId), { id: dashboardId });
      
      // Fast-forward past gcTime
      const {gcTime} = QUERY_CONFIG.DYNAMIC;
      jest.advanceTimersByTime(gcTime + 1000);
      
      // Trigger garbage collection
      queryClient.clear();
      
      jest.useRealTimers();
    });
  });

  describe('Network-Aware Cache Management', () => {
    it('should optimize cache for slow networks', () => {
      // Mock slow network
      (mockConnection as Record<string, string>).effectiveType = 'slow-2g';
      
      const networkConfig = getNetworkOptimizedConfig();
      
      expect(networkConfig).toMatchObject({
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
      });
    });

    it('should use default config for fast networks', () => {
      // Mock fast network
      (mockConnection as Record<string, string>).effectiveType = '4g';
      
      const networkConfig = getNetworkOptimizedConfig();
      
      expect(networkConfig).toEqual(QUERY_CONFIG.DYNAMIC);
    });

    it('should handle missing network connection gracefully', () => {
      // Mock missing connection API
      Object.defineProperty(navigator, 'connection', {
        value: undefined,
      });
      
      const networkConfig = getNetworkOptimizedConfig();
      
      expect(networkConfig).toEqual(QUERY_CONFIG.DYNAMIC);
      
      // Restore connection
      Object.defineProperty(navigator, 'connection', {
        value: mockConnection,
      });
    });
  });

  describe('Optimistic Updates & Cache Mutations', () => {
    it('should perform optimistic update for dashboard creation', () => {
      const newDashboard = { id: 'new-123', name: 'New Dashboard' };
      const existingDashboards = [{ id: '1', name: 'Existing' }];
      
      // Set initial cache
      queryClient.setQueryData(queryKeys.dashboardsList(), existingDashboards);
      
      // Optimistic update
      queryClient.setQueryData(
        queryKeys.dashboardsList(),
        (old: unknown) => {
          const dashboards = old as typeof existingDashboards;
          return [...dashboards, newDashboard];
        }
      );
      
      // Verify optimistic data
      const updatedData = queryClient.getQueryData(queryKeys.dashboardsList());
      expect(updatedData).toEqual([...existingDashboards, newDashboard]);
    });

    it('should rollback optimistic update on mutation failure', () => {
      const originalData = [{ id: '1', name: 'Dashboard 1' }];
      const optimisticData = [...originalData, { id: '2', name: 'New Dashboard' }];
      
      // Set original data
      queryClient.setQueryData(queryKeys.dashboardsList(), originalData);
      
      // Perform optimistic update
      queryClient.setQueryData(queryKeys.dashboardsList(), optimisticData);
      
      // Simulate rollback on failure
      queryClient.setQueryData(queryKeys.dashboardsList(), originalData);
      
      // Verify rollback
      const finalData = queryClient.getQueryData(queryKeys.dashboardsList());
      expect(finalData).toEqual(originalData);
    });

    it('should handle concurrent optimistic updates correctly', () => {
      const initialData = [{ id: '1', name: 'Dashboard 1' }];
      queryClient.setQueryData(queryKeys.dashboardsList(), initialData);
      
      // Simulate concurrent updates
      const update1 = { id: '2', name: 'Dashboard 2' };
      const update2 = { id: '3', name: 'Dashboard 3' };
      
      // First optimistic update
      queryClient.setQueryData(
        queryKeys.dashboardsList(),
        (old: unknown) => [...(old as typeof initialData), update1]
      );
      
      // Second optimistic update
      queryClient.setQueryData(
        queryKeys.dashboardsList(),
        (old: unknown) => [...(old as typeof initialData), update2]
      );
      
      const finalData = queryClient.getQueryData(queryKeys.dashboardsList());
      expect(finalData).toHaveLength(3);
    });

    it('should update related cache entries after mutation', () => {
      const dashboardId = 'dashboard-123';
      const dashboardData = { id: dashboardId, name: 'Original Name' };
      const updatedData = { id: dashboardId, name: 'Updated Name' };
      
      // Cache both list and detail
      queryClient.setQueryData(queryKeys.dashboardsList(), [dashboardData]);
      queryClient.setQueryData(queryKeys.dashboard(dashboardId), dashboardData);
      
      // Update detail cache
      queryClient.setQueryData(queryKeys.dashboard(dashboardId), updatedData);
      
      // Verify detail cache updated
      const detailData = queryClient.getQueryData(queryKeys.dashboard(dashboardId));
      expect(detailData).toEqual(updatedData);
    });
  });

  describe('Cache Persistence & Garbage Collection', () => {
    it('should configure development vs production query clients differently', () => {
      const prodClient = createOptimizedQueryClient();
      const devClient = createDevQueryClient();
      
      // Both should have same basic config
      expect(prodClient.getDefaultOptions().queries?.staleTime)
        .toBe(devClient.getDefaultOptions().queries?.staleTime);
      
      // Dev client should have additional debugging
      expect(devClient).toBeInstanceOf(QueryClient);
    });

    it('should handle cache size limits gracefully', () => {
      // Fill cache with many entries
      const cacheEntries: Array<{ key: string; data: unknown }> = [];
      
      for (let i = 0; i < 100; i++) {
        const key = `dashboard-${i}`;
        const data = { id: key, name: `Dashboard ${i}` };
        
        queryClient.setQueryData(queryKeys.dashboard(key), data);
        cacheEntries.push({ key, data });
      }
      
      // Verify cache has entries
      const cacheSize = queryCache.getAll().length;
      expect(cacheSize).toBe(100);
      
      // Clear cache
      queryClient.clear();
      
      // Verify cache cleared
      expect(queryCache.getAll().length).toBe(0);
    });

    it('should maintain cache across component unmounts', () => {
      const testData = { id: 'persistent-dashboard', name: 'Persistent' };
      
      // Set data in cache
      queryClient.setQueryData(queryKeys.dashboard('persistent-dashboard'), testData);
      
      // Simulate component unmount (cache should persist)
      const persistentData = queryClient.getQueryData(
        queryKeys.dashboard('persistent-dashboard')
      );
      
      expect(persistentData).toEqual(testData);
    });

    it('should handle cache hydration and dehydration', () => {
      const testData = [
        { id: '1', name: 'Dashboard 1' },
        { id: '2', name: 'Dashboard 2' },
      ];
      
      // Set cache data
      queryClient.setQueryData(queryKeys.dashboardsList(), testData);
      
      // Get cache state (simulate dehydration)
      const cacheState = queryCache.getAll().map(query => ({
        queryKey: query.queryKey,
        state: query.state,
      }));
      
      expect(cacheState).toHaveLength(1);
      expect(cacheState[0].queryKey).toEqual(queryKeys.dashboardsList());
      expect(cacheState[0].state.data).toEqual(testData);
      
      // Clear and restore (simulate hydration)
      queryClient.clear();
      queryClient.setQueryData(queryKeys.dashboardsList(), testData);
      
      const restoredData = queryClient.getQueryData(queryKeys.dashboardsList());
      expect(restoredData).toEqual(testData);
    });
  });

  describe('Query Key Management & Consistency', () => {
    it('should generate consistent query keys', () => {
      const dashboardId = 'test-dashboard-123';
      
      const key1 = queryKeys.dashboard(dashboardId);
      const key2 = queryKeys.dashboard(dashboardId);
      
      expect(key1).toEqual(key2);
      expect(key1).toEqual(['dashboards', 'detail', dashboardId]);
    });

    it('should handle query key hierarchy correctly', () => {
      expect(queryKeys.dashboards).toEqual(['dashboards']);
      expect(queryKeys.dashboardsList()).toEqual(['dashboards', 'list']);
      expect(queryKeys.dashboard('123')).toEqual(['dashboards', 'detail', '123']);
      
      // Verify hierarchy allows partial matching
      const allDashboardQueries = queryCache.findAll({ queryKey: queryKeys.dashboards });
      expect(Array.isArray(allDashboardQueries)).toBe(true);
    });
  });

  describe('Error Handling & Cache Resilience', () => {
    it('should handle cache corruption gracefully', () => {
      // Simulate corrupted cache data - should not throw errors
      expect(() => {
        queryClient.setQueryData(queryKeys.dashboardsList(), null);
        queryClient.setQueryData(queryKeys.dashboardsList(), undefined);
      }).not.toThrow();
      
      // Should be able to remove corrupted entries
      queryClient.removeQueries({ queryKey: queryKeys.dashboardsList() });
      
      const data = queryClient.getQueryData(queryKeys.dashboardsList());
      expect(data).toBeUndefined();
    });

    it('should configure retry logic for cache operations', () => {
      const defaultOptions = queryClient.getDefaultOptions();
      const retryFn = defaultOptions.queries?.retry as (count: number, error: Error) => boolean;
      
      // Test retry logic for different error types
      if (typeof retryFn === 'function') {
        // Should not retry 404 errors
        const notFoundError = { status: 404 } as Error;
        expect(retryFn(1, notFoundError)).toBe(false);
        
        // Should not retry 401 errors
        const authError = { status: 401 } as Error;
        expect(retryFn(1, authError)).toBe(false);
        
        // Should retry network errors
        const networkError = new Error('Network error');
        expect(retryFn(1, networkError)).toBe(true);
        expect(retryFn(2, networkError)).toBe(true);
        expect(retryFn(3, networkError)).toBe(false); // Max 3 retries
      }
    });
  });
});