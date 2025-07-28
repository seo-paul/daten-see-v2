/**
 * Dashboard Management Hooks
 * TanStack Query hooks for dashboard operations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';

import { dashboardApi } from '@/lib/api/dashboard';
import { createQueryOptions } from '@/lib/tanstack-query/config';
import { apiQueryKeys, type Dashboard, type CreateDashboardRequest, type UpdateDashboardRequest } from '@/types';

/**
 * Hook to fetch all dashboards
 * Integrates TanStack Query with Zustand Store
 */
export function useDashboards(): UseQueryResult<Dashboard[], Error> {
  return useQuery({
    ...createQueryOptions.dashboard(),
    queryKey: apiQueryKeys.dashboards,
    queryFn: () => dashboardApi.getDashboards(),
  });
}

/**
 * Hook to fetch single dashboard
 */
export function useDashboard(dashboardId: string): UseQueryResult<Dashboard, Error> {
  return useQuery({
    ...createQueryOptions.dashboard(dashboardId),
    queryKey: apiQueryKeys.dashboard(dashboardId),
    queryFn: () => dashboardApi.getDashboard(dashboardId),
    enabled: !!dashboardId,
  });
}

/**
 * Hook to create dashboard
 */
export function useCreateDashboard(): UseMutationResult<Dashboard, Error, CreateDashboardRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dashboardApi.createDashboard,
    onSuccess: () => {
      // Invalidate and refetch dashboards
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.dashboards });
    },
  });
}

/**
 * Hook to update dashboard
 */
export function useUpdateDashboard(dashboardId: string): UseMutationResult<Dashboard, Error, UpdateDashboardRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDashboardRequest) => dashboardApi.updateDashboard(dashboardId, data),
    onSuccess: () => {
      // Invalidate specific dashboard and list
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.dashboard(dashboardId) });
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.dashboards });
    },
  });
}

/**
 * Hook to delete dashboard
 */
export function useDeleteDashboard(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dashboardId: string) => dashboardApi.deleteDashboard(dashboardId),
    onSuccess: () => {
      // Invalidate dashboards list
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.dashboards });
    },
  });
}