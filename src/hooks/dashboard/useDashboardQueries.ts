/**
 * Dashboard Queries Hook (Updated)
 * TanStack Query hooks using new centralized API types
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';

import { dashboardApi } from '@/lib/api/dashboard.api';
import { createQueryOptions } from '@/lib/tanstack-query/config';
import { queryKeys } from '@/lib/tanstack-query/query-keys';
import type { Dashboard, DashboardListItem } from '@/types/dashboard.types';
import type { CreateDashboardRequest, UpdateDashboardRequest } from '@/types/dashboard.types';

/**
 * Hook to fetch all dashboards
 */
export function useDashboards(): UseQueryResult<DashboardListItem[], Error> {
  return useQuery({
    ...createQueryOptions.dashboard(),
    queryKey: queryKeys.dashboards.lists(),
    queryFn: () => dashboardApi.getAll(),
  });
}

/**
 * Hook to fetch single dashboard
 */
export function useDashboard(dashboardId: string): UseQueryResult<Dashboard, Error> {
  return useQuery({
    ...createQueryOptions.dashboard(dashboardId),
    queryKey: queryKeys.dashboards.detail(dashboardId),
    queryFn: () => dashboardApi.getById(dashboardId),
    enabled: !!dashboardId,
  });
}

/**
 * Hook to create dashboard
 */
export function useCreateDashboard(): UseMutationResult<{ dashboardId: string }, Error, CreateDashboardRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDashboardRequest) => dashboardApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch dashboards
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboards.lists() });
    },
  });
}

/**
 * Hook to update dashboard
 */
export function useUpdateDashboard(dashboardId: string): UseMutationResult<void, Error, UpdateDashboardRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDashboardRequest) => dashboardApi.update(data.id, data),
    onSuccess: () => {
      // Invalidate specific dashboard and list
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboards.detail(dashboardId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboards.lists() });
    },
  });
}

/**
 * Hook to delete dashboard
 */
export function useDeleteDashboard(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dashboardId: string) => dashboardApi.delete(dashboardId),
    onSuccess: () => {
      // Invalidate dashboards list
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboards.lists() });
    },
  });
}

/**
 * Hook to duplicate dashboard
 */
// Remove duplicate functionality for now - not implemented in API
// export function useDuplicateDashboard(): UseMutationResult<Dashboard, Error, { id: string; name?: string }> {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, name }: { id: string; name?: string }) => 
//       dashboardApi.duplicate(id, name),
//     onSuccess: () => {
//       // Invalidate dashboards list to show new dashboard
//       queryClient.invalidateQueries({ queryKey: queryKeys.dashboards.lists() });
//     },
//   });
// }