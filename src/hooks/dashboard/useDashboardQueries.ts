import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';

// import { apiClient } from '@/lib/api/client'; // TODO: Use when implementing real API calls
import { appLogger } from '@/lib/monitoring/logger.config';
import type { 
  CreateDashboardRequest,
  UpdateDashboardRequest
} from '@/types/api.types';
// import {
//   DashboardListResponseSchema,
//   DashboardDetailResponseSchema,
//   CreateDashboardResponseSchema
// } from '@/types/api.types'; // TODO: Use when implementing real API calls
import type { DashboardListItem, Dashboard } from '@/types/dashboard.types';

// Query Keys - centralized for cache management
export const dashboardKeys = {
  all: ['dashboards'] as const,
  lists: () => [...dashboardKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...dashboardKeys.lists(), { filters }] as const,
  details: () => [...dashboardKeys.all, 'detail'] as const,
  detail: (id: string) => [...dashboardKeys.details(), id] as const,
} as const;

/**
 * Hook to fetch dashboard list
 * Replaces the Zustand-based dashboard fetching
 */
export function useDashboards(): UseQueryResult<Dashboard[], Error> {
  return useQuery({
    queryKey: dashboardKeys.lists(),
    queryFn: async (): Promise<DashboardListItem[]> => {
      appLogger.info('Fetching dashboards list via TanStack Query');

      try {
        // In production, this would be a real API call
        // For now, simulate the API call with mock data
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock dashboard data (same as Zustand store)
        const mockDashboards: DashboardListItem[] = [
          {
            id: 'dash-1',
            name: 'Sales Analytics',
            description: 'Übersicht über Verkaufsdaten und KPIs',
            isPublic: false,
            updatedAt: new Date('2024-01-15T10:30:00Z'),
            widgetCount: 6
          },
          {
            id: 'dash-2', 
            name: 'Marketing Dashboard',
            description: 'Social Media und Kampagnen Performance',
            isPublic: true,
            updatedAt: new Date('2024-01-14T16:45:00Z'),
            widgetCount: 4
          },
          {
            id: 'dash-3',
            name: 'Operations Monitor',
            description: 'System Health und Performance Metriken',
            isPublic: false,
            updatedAt: new Date('2024-01-13T09:15:00Z'),
            widgetCount: 8
          }
        ];

        appLogger.info('Dashboards loaded successfully via TanStack Query', { 
          count: mockDashboards.length 
        });

        return mockDashboards;

        // TODO: Replace with real API call
        // const response = await apiClient.get<DashboardListResponse>('/dashboards');
        // const validatedResponse = DashboardListResponseSchema.parse(response);
        // return validatedResponse.data.dashboards;

      } catch (error) {
        appLogger.error('Failed to fetch dashboards via TanStack Query', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch single dashboard details
 * Replaces Zustand-based dashboard detail fetching
 */
export function useDashboard(id: string | undefined): UseQueryResult<Dashboard, Error> {
  return useQuery({
    queryKey: dashboardKeys.detail(id || ''),
    queryFn: async (): Promise<Dashboard> => {
      if (!id) {
        throw new Error('Dashboard ID is required');
      }

      appLogger.info('Fetching dashboard details via TanStack Query', { dashboardId: id });

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));

        // Mock dashboard details
        const mockDashboard: Dashboard = {
          id,
          name: 'Sales Analytics', // In real app, fetch based on ID
          description: 'Übersicht über Verkaufsdaten und KPIs',
          isPublic: false,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-15T10:30:00Z'),
          widgets: [],
          settings: {
            backgroundColor: '#f8fafc',
            gridSize: 24,
            autoRefresh: true,
            refreshInterval: 300
          }
        };

        appLogger.info('Dashboard details loaded successfully via TanStack Query', { 
          dashboardId: id 
        });

        return mockDashboard;

        // TODO: Replace with real API call
        // const response = await apiClient.get<DashboardDetailResponse>(`/dashboards/${id}`);
        // const validatedResponse = DashboardDetailResponseSchema.parse(response);
        // return validatedResponse.data.dashboard;

      } catch (error) {
        appLogger.error('Failed to fetch dashboard details via TanStack Query', {
          error: error instanceof Error ? error.message : 'Unknown error',
          dashboardId: id
        });
        throw error;
      }
    },
    enabled: !!id, // Only run query if ID is provided
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to create new dashboard
 * Replaces Zustand-based dashboard creation
 */
export function useCreateDashboard(): UseMutationResult<string, Error, CreateDashboardRequest> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDashboardRequest): Promise<string> => {
      appLogger.info('Creating dashboard via TanStack Query', { name: data.name });

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const newDashboardId = `dash-${Date.now()}`;

        appLogger.info('Dashboard created successfully via TanStack Query', {
          dashboardId: newDashboardId,
          name: data.name
        });

        return newDashboardId;

        // TODO: Replace with real API call
        // const response = await apiClient.post<CreateDashboardResponse>('/dashboards', data);
        // const validatedResponse = CreateDashboardResponseSchema.parse(response);
        // return validatedResponse.data.dashboardId;

      } catch (error) {
        appLogger.error('Failed to create dashboard via TanStack Query', {
          error: error instanceof Error ? error.message : 'Unknown error',
          data
        });
        throw error;
      }
    },
    onSuccess: (dashboardId, variables) => {
      // Invalidate dashboard list to refetch with new dashboard
      queryClient.invalidateQueries({ queryKey: dashboardKeys.lists() });

      // Optionally prefetch the new dashboard details
      // Note: We'll implement prefetching later when we have real API endpoints

      appLogger.info('Dashboard creation completed, cache invalidated', {
        dashboardId,
        name: variables.name
      });
    },
    onError: (error, variables) => {
      appLogger.error('Dashboard creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data: variables
      });
    },
  });
}

/**
 * Hook to update existing dashboard
 * Replaces Zustand-based dashboard updates
 */
export function useUpdateDashboard(): UseMutationResult<void, Error, UpdateDashboardRequest> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateDashboardRequest): Promise<void> => {
      appLogger.info('Updating dashboard via TanStack Query', { dashboardId: data.id });

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600));

        appLogger.info('Dashboard updated successfully via TanStack Query', {
          dashboardId: data.id
        });

        // TODO: Replace with real API call
        // await apiClient.put(`/dashboards/${data.id}`, data);

      } catch (error) {
        appLogger.error('Failed to update dashboard via TanStack Query', {
          error: error instanceof Error ? error.message : 'Unknown error',
          data
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: dashboardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(variables.id) });

      appLogger.info('Dashboard update completed, cache invalidated', {
        dashboardId: variables.id
      });
    },
    onError: (error, variables) => {
      appLogger.error('Dashboard update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data: variables
      });
    },
  });
}

/**
 * Hook to delete dashboard
 * Replaces Zustand-based dashboard deletion
 */
export function useDeleteDashboard(): UseMutationResult<void, Error, string> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      appLogger.info('Deleting dashboard via TanStack Query', { dashboardId: id });

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 400));

        appLogger.info('Dashboard deleted successfully via TanStack Query', {
          dashboardId: id
        });

        // TODO: Replace with real API call
        // await apiClient.delete(`/dashboards/${id}`);

      } catch (error) {
        appLogger.error('Failed to delete dashboard via TanStack Query', {
          error: error instanceof Error ? error.message : 'Unknown error',
          dashboardId: id
        });
        throw error;
      }
    },
    onSuccess: (_, dashboardId) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: dashboardKeys.detail(dashboardId) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.lists() });

      appLogger.info('Dashboard deletion completed, cache updated', {
        dashboardId
      });
    },
    onError: (error, dashboardId) => {
      appLogger.error('Dashboard deletion failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        dashboardId
      });
    },
  });
}