/**
 * TanStack Query Prefetching Utilities
 * Optimized prefetching strategies for improved performance
 */

import { QueryClient } from '@tanstack/react-query';

import { dashboardApi } from '@/lib/api/dashboard.api';
// import type { Dashboard, DashboardListItem } from '@/types/dashboard.types'; // TODO: Use when implementing real API calls

/**
 * Prefetch dashboard list
 * Use on dashboard overview page or before navigation
 */
export async function prefetchDashboards(queryClient: QueryClient): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ['dashboards'],
    queryFn: dashboardApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Prefetch single dashboard
 * Use before navigating to dashboard detail page
 */
export async function prefetchDashboard(
  queryClient: QueryClient,
  dashboardId: string
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: () => dashboardApi.getById(dashboardId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Prefetch multiple dashboards in parallel
 * Use for hover states or predictive loading
 */
export async function prefetchMultipleDashboards(
  queryClient: QueryClient,
  dashboardIds: string[]
): Promise<void> {
  await Promise.all(
    dashboardIds.map(id => prefetchDashboard(queryClient, id))
  );
}

/**
 * Hover prefetch hook for dashboard cards
 * Intelligently prefetches on hover with debounce
 */
export function usePrefetchOnHover(
  queryClient: QueryClient,
  dashboardId: string,
  delay: number = 100
): {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
} {
  let timeoutId: NodeJS.Timeout;

  const onMouseEnter = () => {
    timeoutId = setTimeout(() => {
      // Only prefetch if not already in cache
      const cached = queryClient.getQueryData(['dashboard', dashboardId]);
      if (!cached) {
        prefetchDashboard(queryClient, dashboardId);
      }
    }, delay);
  };

  const onMouseLeave = () => {
    clearTimeout(timeoutId);
  };

  return { onMouseEnter, onMouseLeave };
}

/**
 * Route-based prefetching
 * Call this on route changes for predictive loading
 */
export async function prefetchRouteData(
  queryClient: QueryClient,
  route: string
): Promise<void> {
  switch (route) {
    case '/dashboard':
      await prefetchDashboards(queryClient);
      break;
    
    case '/dashboard/create':
      // Prefetch data needed for dashboard creation
      // e.g., templates, user preferences, etc.
      break;
    
    default:
      // Handle dynamic routes
      const dashboardMatch = route.match(/^\/dashboard\/([^/]+)$/);
      if (dashboardMatch && dashboardMatch[1]) {
        await prefetchDashboard(queryClient, dashboardMatch[1]);
      }
  }
}

/**
 * Invalidate and prefetch pattern
 * Use after mutations for immediate UI updates
 */
export async function invalidateAndPrefetch(
  queryClient: QueryClient,
  queryKey: string[]
): Promise<void> {
  // Invalidate to mark as stale
  await queryClient.invalidateQueries({ queryKey });
  
  // Immediately prefetch fresh data
  if (queryKey[0] === 'dashboards') {
    await prefetchDashboards(queryClient);
  } else if (queryKey[0] === 'dashboard' && queryKey[1]) {
    await prefetchDashboard(queryClient, queryKey[1] as string);
  }
}

/**
 * Prefetch nearby pages for pagination
 * Improves perceived performance for list navigation
 */
export async function prefetchPaginatedData(
  queryClient: QueryClient,
  currentPage: number,
  totalPages: number,
  queryKeyBase: string[]
): Promise<void> {
  const pagesToPrefetch: number[] = [];
  
  // Prefetch next page
  if (currentPage < totalPages) {
    pagesToPrefetch.push(currentPage + 1);
  }
  
  // Prefetch previous page (for back navigation)
  if (currentPage > 1) {
    pagesToPrefetch.push(currentPage - 1);
  }
  
  await Promise.all(
    pagesToPrefetch.map(page =>
      queryClient.prefetchQuery({
        queryKey: [...queryKeyBase, { page }],
        staleTime: 5 * 60 * 1000,
      })
    )
  );
}