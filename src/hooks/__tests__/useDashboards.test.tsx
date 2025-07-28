import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { dashboardApi } from '@/lib/api/dashboard';
import type { Dashboard, CreateDashboardRequest, UpdateDashboardRequest } from '@/types/dashboard.types';

import { 
  useDashboards, 
  useDashboard, 
  useCreateDashboard, 
  useUpdateDashboard, 
  useDeleteDashboard 
} from '../useDashboards';

// Mock dashboard API
jest.mock('@/lib/api/dashboard', () => ({
  dashboardApi: {
    getDashboards: jest.fn(),
    getDashboard: jest.fn(),
    createDashboard: jest.fn(),
    updateDashboard: jest.fn(),
    deleteDashboard: jest.fn(),
  },
}));

// Mock query options
jest.mock('@/lib/tanstack-query/config', () => ({
  createQueryOptions: {
    dashboard: jest.fn(() => ({
      staleTime: 5 * 60 * 1000,
      retry: 1,
    })),
  },
}));

// Mock query keys
jest.mock('@/types', (): object => ({
  ...jest.requireActual('@/types'),
  apiQueryKeys: {
    dashboards: ['dashboards'],
    dashboard: (id: string): string[] => ['dashboard', id],
  },
}));

describe('useDashboards Hook Tests - Critical Business Logic (90%+ Coverage)', (): void => {
  let queryClient: QueryClient;

  // Test data
  const mockDashboards: Dashboard[] = [
    {
      id: 'dash-1',
      name: 'Sales Dashboard',
      description: 'Sales analytics dashboard',
      isPublic: false,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      widgets: [],
      settings: {
        backgroundColor: '#ffffff',
        gridSize: 10,
        autoRefresh: false,
        refreshInterval: 60
      }
    },
    {
      id: 'dash-2',
      name: 'Marketing Dashboard',
      description: 'Marketing metrics dashboard',
      isPublic: true,
      createdAt: new Date('2024-01-02T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      widgets: [],
      settings: {
        backgroundColor: '#ffffff',
        gridSize: 10,
        autoRefresh: false,
        refreshInterval: 60
      }
    },
  ];

  const mockDashboard = mockDashboards[0];

  // Wrapper for TanStack Query
  const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
    const TestWrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    TestWrapper.displayName = 'UseDashboardsTestWrapper';
    return TestWrapper;
  };

  beforeEach((): void => {
    // Fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  afterEach((): void => {
    queryClient.clear();
  });

  describe('useDashboards - Fetch All Dashboards', (): void => {
    it('should fetch dashboards successfully', async (): Promise<void> => {
      (dashboardApi.getDashboards as jest.Mock).mockResolvedValue(mockDashboards);

      const { result } = renderHook(() => useDashboards(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockDashboards);
      expect(result.current.isLoading).toBe(false);
      expect(dashboardApi.getDashboards).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch dashboards error', async (): Promise<void> => {
      const error = new Error('Failed to fetch dashboards');
      (dashboardApi.getDashboards as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useDashboards(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 2000 });

      expect(result.current.error).toEqual(error);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle empty dashboards list', async (): Promise<void> => {
      (dashboardApi.getDashboards as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useDashboards(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should use correct query key and options', async (): Promise<void> => {
      (dashboardApi.getDashboards as jest.Mock).mockResolvedValue(mockDashboards);

      renderHook(() => useDashboards(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(dashboardApi.getDashboards).toHaveBeenCalled();
      });

      // Verify query is cached with correct key
      const cachedData = queryClient.getQueryData(['dashboards']);
      expect(cachedData).toEqual(mockDashboards);
    });
  });

  describe('useDashboard - Fetch Single Dashboard', (): void => {
    it('should fetch single dashboard successfully', async (): Promise<void> => {
      (dashboardApi.getDashboard as jest.Mock).mockResolvedValue(mockDashboard);

      const { result } = renderHook(() => useDashboard('dash-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockDashboard);
      expect(dashboardApi.getDashboard).toHaveBeenCalledWith('dash-1');
    });

    it('should not fetch when dashboardId is empty', (): void => {
      const { result } = renderHook(() => useDashboard(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(dashboardApi.getDashboard).not.toHaveBeenCalled();
    });

    it('should handle fetch single dashboard error', async (): Promise<void> => {
      const error = new Error('Dashboard not found');
      (dashboardApi.getDashboard as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useDashboard('dash-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 2000 });

      expect(result.current.error).toEqual(error);
    });

    it('should refetch when dashboardId changes', async (): Promise<void> => {
      (dashboardApi.getDashboard as jest.Mock).mockResolvedValue(mockDashboard);

      const { result, rerender } = renderHook(
        ({ id }: { id: string }) => useDashboard(id),
        {
          wrapper: createWrapper(),
          initialProps: { id: 'dash-1' },
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(dashboardApi.getDashboard).toHaveBeenCalledWith('dash-1');

      // Change ID
      rerender({ id: 'dash-2' });

      await waitFor(() => {
        expect(dashboardApi.getDashboard).toHaveBeenCalledWith('dash-2');
      });

      expect(dashboardApi.getDashboard).toHaveBeenCalledTimes(2);
    });
  });

  describe('useCreateDashboard - Create Operations', (): void => {
    it('should create dashboard successfully', async (): Promise<void> => {
      const newDashboard = { ...mockDashboard, id: 'dash-new' };
      const createRequest: CreateDashboardRequest = {
        name: 'New Dashboard',
        description: 'New dashboard description',
        isPublic: false,
      };

      (dashboardApi.createDashboard as jest.Mock).mockResolvedValue(newDashboard);

      const { result } = renderHook(() => useCreateDashboard(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);

      // Trigger mutation
      result.current.mutate(createRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(newDashboard);
      expect(dashboardApi.createDashboard).toHaveBeenCalledWith(createRequest);
    });

    it('should handle create dashboard error', async (): Promise<void> => {
      const error = new Error('Failed to create dashboard');
      const createRequest: CreateDashboardRequest = {
        name: 'New Dashboard',
        description: 'New dashboard description',
        isPublic: false,
      };

      (dashboardApi.createDashboard as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateDashboard(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(createRequest);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should invalidate dashboards cache on success', async (): Promise<void> => {
      const newDashboard = { ...mockDashboard, id: 'dash-new' };
      const createRequest: CreateDashboardRequest = {
        name: 'New Dashboard',
        description: 'New dashboard description',
        isPublic: false,
      };

      (dashboardApi.createDashboard as jest.Mock).mockResolvedValue(newDashboard);

      // Pre-populate cache
      queryClient.setQueryData(['dashboards'], mockDashboards);

      const { result } = renderHook(() => useCreateDashboard(), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate(createRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['dashboards'] });
    });
  });

  describe('useUpdateDashboard - Update Operations', (): void => {
    it('should update dashboard successfully', async (): Promise<void> => {
      const updatedDashboard = { ...mockDashboard, name: 'Updated Dashboard' };
      const updateRequest: UpdateDashboardRequest = {
        id: 'dash-1',
        name: 'Updated Dashboard',
        description: 'Updated description',
        isPublic: true,
      };

      (dashboardApi.updateDashboard as jest.Mock).mockResolvedValue(updatedDashboard);

      const { result } = renderHook(() => useUpdateDashboard('dash-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate(updateRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(updatedDashboard);
      expect(dashboardApi.updateDashboard).toHaveBeenCalledWith('dash-1', updateRequest);
    });

    it('should handle update dashboard error', async (): Promise<void> => {
      const error = new Error('Failed to update dashboard');
      const updateRequest: UpdateDashboardRequest = {
        id: 'dash-1',
        name: 'Updated Dashboard',
        description: 'Updated description',
        isPublic: true,
      };

      (dashboardApi.updateDashboard as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateDashboard('dash-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate(updateRequest);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should invalidate both specific and list caches on success', async (): Promise<void> => {
      const updatedDashboard = { ...mockDashboard, name: 'Updated Dashboard' };
      const updateRequest: UpdateDashboardRequest = {
        id: 'dash-1',
        name: 'Updated Dashboard',
        description: 'Updated description',
        isPublic: true,
      };

      (dashboardApi.updateDashboard as jest.Mock).mockResolvedValue(updatedDashboard);

      const { result } = renderHook(() => useUpdateDashboard('dash-1'), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate(updateRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['dashboard', 'dash-1'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['dashboards'] });
    });
  });

  describe('useDeleteDashboard - Delete Operations', (): void => {
    it('should delete dashboard successfully', async (): Promise<void> => {
      (dashboardApi.deleteDashboard as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteDashboard(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('dash-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(dashboardApi.deleteDashboard).toHaveBeenCalledWith('dash-1');
    });

    it('should handle delete dashboard error', async (): Promise<void> => {
      const error = new Error('Failed to delete dashboard');
      (dashboardApi.deleteDashboard as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteDashboard(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('dash-1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should invalidate dashboards cache on success', async (): Promise<void> => {
      (dashboardApi.deleteDashboard as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteDashboard(), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate('dash-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['dashboards'] });
    });

    it('should handle delete non-existent dashboard', async (): Promise<void> => {
      const error = new Error('Dashboard not found');
      (dashboardApi.deleteDashboard as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteDashboard(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('non-existent-id');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('Cache Management & Performance', (): void => {
    it('should properly cache dashboard queries', async (): Promise<void> => {
      (dashboardApi.getDashboards as jest.Mock).mockResolvedValue(mockDashboards);

      // First render
      const { result: result1 } = renderHook(() => useDashboards(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Second render should use cache
      const { result: result2 } = renderHook(() => useDashboards(), {
        wrapper: createWrapper(),
      });

      expect(result2.current.data).toEqual(mockDashboards);
      expect(result2.current.isLoading).toBe(false);
      
      // API should only be called once due to caching
      expect(dashboardApi.getDashboards).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent mutations properly', async (): Promise<void> => {
      const createRequest1: CreateDashboardRequest = {
        name: 'Dashboard 1',
        description: 'Description 1',
        isPublic: false,
      };
      const createRequest2: CreateDashboardRequest = {
        name: 'Dashboard 2',
        description: 'Description 2',
        isPublic: true,
      };

      (dashboardApi.createDashboard as jest.Mock)
        .mockResolvedValueOnce({ ...mockDashboard, id: 'dash-new-1' })
        .mockResolvedValueOnce({ ...mockDashboard, id: 'dash-new-2' });

      const { result: result1 } = renderHook(() => useCreateDashboard(), {
        wrapper: createWrapper(),
      });
      const { result: result2 } = renderHook(() => useCreateDashboard(), {
        wrapper: createWrapper(),
      });

      // Trigger both mutations
      result1.current.mutate(createRequest1);
      result2.current.mutate(createRequest2);

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
      });

      expect(dashboardApi.createDashboard).toHaveBeenCalledTimes(2);
      expect(dashboardApi.createDashboard).toHaveBeenCalledWith(createRequest1);
      expect(dashboardApi.createDashboard).toHaveBeenCalledWith(createRequest2);
    });
  });

  describe('Edge Cases & Error Scenarios', (): void => {
    it('should handle network timeouts gracefully', async (): Promise<void> => {
      const timeoutError = new Error('Network timeout');
      (dashboardApi.getDashboards as jest.Mock).mockRejectedValue(timeoutError);

      const { result } = renderHook(() => useDashboards(), {
        wrapper: createWrapper(),
      });

      // First wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      // Then check error state
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 3000 });

      expect(result.current.error).toEqual(timeoutError);
      expect(result.current.failureCount).toBeGreaterThan(0);
    });

    it('should handle malformed API responses', async (): Promise<void> => {
      (dashboardApi.getDashboards as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useDashboards(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });

    it('should handle very large dashboard lists', async (): Promise<void> => {
      const largeDashboardList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockDashboard,
        id: `dash-${i}`,
        name: `Dashboard ${i}`,
      }));

      (dashboardApi.getDashboards as jest.Mock).mockResolvedValue(largeDashboardList);

      const { result } = renderHook(() => useDashboards(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1000);
      if (result.current.data && result.current.data.length === 1000) {
        expect(result.current.data[999]?.name).toBe('Dashboard 999');
      }
    });
  });
});