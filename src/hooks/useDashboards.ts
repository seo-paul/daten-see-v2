/**
 * Dashboard Management Hooks
 * TanStack Query hooks for dashboard operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';

import { dashboardApi } from '@/lib/api/dashboard';
import { createQueryOptions } from '@/lib/tanstack-query/config';
import type { Dashboard, CreateDashboardRequest, UpdateDashboardRequest } from '@/types';
import { apiQueryKeys } from '@/types';

/**
 * Hook to fetch all dashboards
 * Integrates TanStack Query with Zustand Store
 */
export function useDashboards(): UseQueryResult<Dashboard[], Error> {
  return useQuery<Dashboard[], Error>({
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
export function useCreateDashboard(): UseMutationResult<Dashboard, Error, CreateDashboardRequest, unknown> {
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
export function useUpdateDashboard(dashboardId: string): UseMutationResult<Dashboard, Error, UpdateDashboardRequest, unknown> {
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
export function useDeleteDashboard(): UseMutationResult<void, Error, string, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dashboardId: string) => dashboardApi.deleteDashboard(dashboardId),
    onSuccess: () => {
      // Invalidate dashboards list
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.dashboards });
    },
  });
}