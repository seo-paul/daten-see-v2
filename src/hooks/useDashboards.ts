/**
 * Dashboard Management Hooks
 * TanStack Query hooks for dashboard operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard.api';
import { useDashboardStore } from '@/store/dashboard.store';
import { createQueryOptions, queryKeys } from '@/lib/tanstack-query/config';
import type { DashboardListItem, CreateDashboardRequest } from '@/types/dashboard.types';

/**
 * Hook to fetch all dashboards
 * Integrates TanStack Query with Zustand Store
 */
export function useDashboards() {
  const { dashboards } = useDashboardStore();

  return useQuery<DashboardListItem[], Error>({
    ...createQueryOptions.dashboard(),
    queryKey: queryKeys.dashboardsList(),
    queryFn: dashboardApi.getAll,
    ...(dashboards.length > 0 && { initialData: dashboards }),
  });
}

/**
 * Hook to fetch single dashboard
 */
export function useDashboard(dashboardId: string) {
  const { currentDashboard } = useDashboardStore();

  return useQuery({
    ...createQueryOptions.dashboard(dashboardId),
    queryKey: queryKeys.dashboard(dashboardId),
    queryFn: () => dashboardApi.getById(dashboardId),
    ...(currentDashboard?.id === dashboardId && { initialData: currentDashboard }),
    enabled: !!dashboardId,
  });
}

/**
 * Hook to create dashboard
 */
export function useCreateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDashboardRequest) => dashboardApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch dashboards list with optimized key
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboards });
    },
  });
}

/**
 * Hook to update dashboard
 */
export function useUpdateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dashboardApi.update,
    onSuccess: (_, variables) => {
      // Invalidate specific dashboard and list with optimized keys
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboards });
    },
  });
}

/**
 * Hook to delete dashboard
 */
export function useDeleteDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dashboardId: string) => dashboardApi.delete(dashboardId),
    onSuccess: () => {
      // Invalidate dashboards list with optimized key
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboards });
    },
  });
}