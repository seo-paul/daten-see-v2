# TanStack Query Patterns & Best Practices

## Table of Contents
1. [Overview](#overview)
2. [Core Patterns](#core-patterns)
3. [Query Patterns](#query-patterns)
4. [Mutation Patterns](#mutation-patterns)
5. [Advanced Patterns](#advanced-patterns)
6. [Testing Patterns](#testing-patterns)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)

## Overview

This document outlines the TanStack Query patterns used in our BI SaaS dashboard application. These patterns ensure consistent data fetching, caching, and synchronization across the application.

### Key Principles
- **Type Safety First**: All queries and mutations are fully typed
- **Centralized Configuration**: Shared query options via `createQueryOptions`
- **Consistent Query Keys**: Hierarchical key structure for cache management
- **Error Boundaries**: Graceful error handling at every level

## Core Patterns

### 1. Query Key Structure

We use a hierarchical query key structure for efficient cache invalidation:

```typescript
// src/types/api.ts
export const apiQueryKeys = {
  // Root keys
  dashboards: ['dashboards'] as const,
  dataSources: ['dataSources'] as const,
  widgets: ['widgets'] as const,
  analytics: ['analytics'] as const,
  
  // Detailed keys with parameters
  dashboard: (id: string) => ['dashboards', id] as const,
  dashboardWidgets: (dashboardId: string) => ['dashboards', dashboardId, 'widgets'] as const,
  dataSource: (id: string) => ['dataSources', id] as const,
  dataSourceData: (id: string, queryHash: string) => ['dataSources', id, 'data', queryHash] as const,
};
```

### 2. Centralized Query Configuration

All queries share common configuration for consistency:

```typescript
// src/lib/tanstack-query/config.ts
export const createQueryOptions = {
  dashboard: (id?: string) => ({
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }),
  
  dataSource: () => ({
    staleTime: 2 * 60 * 1000, // 2 minutes - fresher data for sources
    gcTime: 5 * 60 * 1000,    // 5 minutes
    retry: 3,                  // More retries for critical data
  }),
  
  analytics: () => ({
    staleTime: 1 * 60 * 1000, // 1 minute - real-time data
    gcTime: 3 * 60 * 1000,    // 3 minutes
    retry: 1,                  // Fast fail for analytics
  }),
};
```

## Query Patterns

### 1. Basic Query Hook

Standard pattern for fetching single resources:

```typescript
// src/hooks/useDashboard.ts
export function useDashboard(dashboardId: string): UseQueryResult<Dashboard, Error> {
  return useQuery({
    ...createQueryOptions.dashboard(dashboardId),
    queryKey: apiQueryKeys.dashboard(dashboardId),
    queryFn: () => dashboardApi.getDashboard(dashboardId),
    enabled: !!dashboardId, // Prevent query if no ID
  });
}
```

### 2. List Query with Filtering

Pattern for fetching filtered lists:

```typescript
// src/hooks/useDataSources.ts
interface DataSourceFilters {
  type?: DataSourceType;
  status?: 'connected' | 'disconnected' | 'error';
  search?: string;
}

export function useDataSources(filters?: DataSourceFilters): UseQueryResult<DataSource[], Error> {
  // Stable query key that includes filters
  const queryKey = [...apiQueryKeys.dataSources, { filters }] as const;
  
  return useQuery({
    ...createQueryOptions.dataSource(),
    queryKey,
    queryFn: () => dataSourceApi.getDataSources(filters),
    // Keep previous data while fetching with new filters
    placeholderData: keepPreviousData,
  });
}
```

### 3. Dependent Queries

Pattern for queries that depend on other data:

```typescript
// src/hooks/useWidgetData.ts
export function useWidgetData(widget: Widget | undefined): UseQueryResult<WidgetData, Error> {
  const dataSourceId = widget?.dataSource;
  
  return useQuery({
    queryKey: ['widgets', widget?.id, 'data'] as const,
    queryFn: () => {
      if (!widget || !dataSourceId) {
        throw new Error('Widget or data source not available');
      }
      return analyticsApi.getWidgetData(widget);
    },
    enabled: !!widget && !!dataSourceId,
    // Refetch when widget config changes
    refetchInterval: widget?.config.autoRefresh ? 30000 : false,
  });
}
```

### 4. Infinite Query Pattern

For paginated data with infinite scroll:

```typescript
// src/hooks/useAnalyticsHistory.ts
export function useAnalyticsHistory(dataSourceId: string) {
  return useInfiniteQuery({
    queryKey: ['analytics', 'history', dataSourceId] as const,
    queryFn: ({ pageParam = 0 }) => 
      analyticsApi.getHistory(dataSourceId, { 
        offset: pageParam, 
        limit: 50 
      }),
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * 50;
      return lastPage.hasMore ? nextOffset : undefined;
    },
    initialPageParam: 0,
  });
}
```

## Mutation Patterns

### 1. Basic Mutation with Optimistic Updates

Pattern for immediate UI updates:

```typescript
// src/hooks/useUpdateDashboard.ts
export function useUpdateDashboard(dashboardId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateDashboardRequest) => 
      dashboardApi.updateDashboard(dashboardId, data),
    
    // Optimistic update
    onMutate: async (newData) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ 
        queryKey: apiQueryKeys.dashboard(dashboardId) 
      });
      
      // Snapshot previous value
      const previousDashboard = queryClient.getQueryData<Dashboard>(
        apiQueryKeys.dashboard(dashboardId)
      );
      
      // Optimistically update
      if (previousDashboard) {
        queryClient.setQueryData<Dashboard>(
          apiQueryKeys.dashboard(dashboardId),
          { ...previousDashboard, ...newData }
        );
      }
      
      return { previousDashboard };
    },
    
    // Rollback on error
    onError: (err, newData, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(
          apiQueryKeys.dashboard(dashboardId),
          context.previousDashboard
        );
      }
    },
    
    // Refetch after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: apiQueryKeys.dashboard(dashboardId) 
      });
    },
  });
}
```

### 2. Batch Mutations

Pattern for multiple related mutations:

```typescript
// src/hooks/useBatchUpdateWidgets.ts
export function useBatchUpdateWidgets(dashboardId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: WidgetUpdate[]) => {
      // Execute all updates in parallel
      const results = await Promise.allSettled(
        updates.map(update => 
          widgetApi.updateWidget(update.id, update.data)
        )
      );
      
      // Throw if any failed
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        throw new Error(`${failed.length} widget updates failed`);
      }
      
      return results;
    },
    
    onSuccess: () => {
      // Invalidate dashboard and all its widgets
      queryClient.invalidateQueries({ 
        queryKey: apiQueryKeys.dashboard(dashboardId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: apiQueryKeys.dashboardWidgets(dashboardId) 
      });
    },
  });
}
```

### 3. Sequential Mutations

Pattern for dependent mutations:

```typescript
// src/hooks/useCreateDashboardWithWidgets.ts
export function useCreateDashboardWithWidgets() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      dashboard, 
      widgets 
    }: { 
      dashboard: CreateDashboardRequest; 
      widgets: CreateWidgetRequest[] 
    }) => {
      // First create dashboard
      const newDashboard = await dashboardApi.createDashboard(dashboard);
      
      // Then create widgets with dashboard ID
      const widgetPromises = widgets.map(widget =>
        widgetApi.createWidget({
          ...widget,
          dashboardId: newDashboard.id,
        })
      );
      
      const createdWidgets = await Promise.all(widgetPromises);
      
      return { dashboard: newDashboard, widgets: createdWidgets };
    },
    
    onSuccess: ({ dashboard }) => {
      // Invalidate dashboards list
      queryClient.invalidateQueries({ 
        queryKey: apiQueryKeys.dashboards 
      });
      
      // Prefetch the new dashboard
      queryClient.setQueryData(
        apiQueryKeys.dashboard(dashboard.id),
        dashboard
      );
    },
  });
}
```

## Advanced Patterns

### 1. Real-time Data Synchronization

Pattern for WebSocket/SSE integration:

```typescript
// src/hooks/useRealtimeAnalytics.ts
export function useRealtimeAnalytics(dataSourceId: string) {
  const queryClient = useQueryClient();
  
  // Base query for initial data
  const query = useQuery({
    queryKey: ['analytics', 'realtime', dataSourceId] as const,
    queryFn: () => analyticsApi.getRealtimeData(dataSourceId),
  });
  
  // WebSocket subscription
  useEffect(() => {
    if (!dataSourceId) return;
    
    const ws = new WebSocket(`${WS_URL}/analytics/${dataSourceId}`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      // Update query data with new values
      queryClient.setQueryData(
        ['analytics', 'realtime', dataSourceId],
        (oldData: any) => ({
          ...oldData,
          ...update,
          lastUpdated: new Date().toISOString(),
        })
      );
    };
    
    return () => ws.close();
  }, [dataSourceId, queryClient]);
  
  return query;
}
```

### 2. Prefetching Pattern

Proactive data loading for better UX:

```typescript
// src/hooks/usePrefetchDashboard.ts
export function usePrefetchDashboard() {
  const queryClient = useQueryClient();
  
  return useCallback((dashboardId: string) => {
    return queryClient.prefetchQuery({
      ...createQueryOptions.dashboard(dashboardId),
      queryKey: apiQueryKeys.dashboard(dashboardId),
      queryFn: () => dashboardApi.getDashboard(dashboardId),
    });
  }, [queryClient]);
}

// Usage in component
function DashboardList() {
  const prefetchDashboard = usePrefetchDashboard();
  const { data: dashboards } = useDashboards();
  
  return (
    <div>
      {dashboards?.map(dashboard => (
        <Link
          key={dashboard.id}
          href={`/dashboard/${dashboard.id}`}
          onMouseEnter={() => prefetchDashboard(dashboard.id)}
        >
          {dashboard.title}
        </Link>
      ))}
    </div>
  );
}
```

### 3. Query Invalidation Patterns

Strategic cache invalidation:

```typescript
// src/lib/tanstack-query/invalidation.ts
export const invalidationPatterns = {
  // Invalidate everything for a dashboard
  dashboard: (dashboardId: string) => [
    { queryKey: apiQueryKeys.dashboard(dashboardId) },
    { queryKey: apiQueryKeys.dashboardWidgets(dashboardId) },
    { queryKey: ['analytics'], predicate: (query) => 
      query.queryKey.includes(dashboardId) 
    },
  ],
  
  // Invalidate all data for a data source
  dataSource: (dataSourceId: string) => [
    { queryKey: apiQueryKeys.dataSource(dataSourceId) },
    { queryKey: ['dataSources', dataSourceId], exact: false },
    { queryKey: ['analytics'], predicate: (query) => 
      query.queryKey.includes(dataSourceId) 
    },
  ],
  
  // Smart invalidation based on mutation type
  afterMutation: (mutation: MutationType, id: string) => {
    switch (mutation) {
      case 'UPDATE_WIDGET':
        return [
          { queryKey: ['widgets', id] },
          { queryKey: ['dashboards'], exact: false }, // Any dashboard might contain this widget
        ];
      case 'DELETE_DASHBOARD':
        return [
          { queryKey: apiQueryKeys.dashboards },
          { queryKey: ['widgets'], predicate: (query) => 
            query.queryKey.includes(id) 
          },
        ];
      default:
        return [];
    }
  },
};
```

## Testing Patterns

### 1. Query Hook Testing

```typescript
// src/hooks/__tests__/useDashboard.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashboard } from '../useDashboard';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useDashboard', () => {
  it('fetches dashboard data', async () => {
    const mockDashboard = { id: '123', title: 'Test Dashboard' };
    
    // Mock API response
    jest.spyOn(dashboardApi, 'getDashboard')
      .mockResolvedValueOnce(mockDashboard);
    
    const { result } = renderHook(
      () => useDashboard('123'),
      { wrapper: createWrapper() }
    );
    
    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    
    // Wait for success
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toEqual(mockDashboard);
  });
  
  it('handles errors gracefully', async () => {
    const error = new Error('Network error');
    
    jest.spyOn(dashboardApi, 'getDashboard')
      .mockRejectedValueOnce(error);
    
    const { result } = renderHook(
      () => useDashboard('123'),
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    
    expect(result.current.error).toEqual(error);
  });
});
```

### 2. Mutation Testing

```typescript
// src/hooks/__tests__/useUpdateDashboard.test.ts
describe('useUpdateDashboard', () => {
  it('optimistically updates dashboard', async () => {
    const queryClient = new QueryClient();
    const dashboardId = '123';
    const originalDashboard = { 
      id: dashboardId, 
      title: 'Original Title' 
    };
    
    // Set initial data
    queryClient.setQueryData(
      apiQueryKeys.dashboard(dashboardId),
      originalDashboard
    );
    
    const { result } = renderHook(
      () => useUpdateDashboard(dashboardId),
      { wrapper: createWrapper(queryClient) }
    );
    
    // Trigger mutation
    act(() => {
      result.current.mutate({ title: 'New Title' });
    });
    
    // Check optimistic update
    const updatedData = queryClient.getQueryData(
      apiQueryKeys.dashboard(dashboardId)
    );
    expect(updatedData).toEqual({
      id: dashboardId,
      title: 'New Title',
    });
  });
});
```

## Error Handling

### 1. Global Error Handling

```typescript
// src/lib/tanstack-query/error-handler.ts
export const queryErrorHandler = (error: unknown): void => {
  if (error instanceof ApiClientError) {
    // Handle API errors
    if (error.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.status === 403) {
      // Show permission error
      toast.error('You do not have permission to perform this action');
    } else {
      // Generic API error
      toast.error(error.message || 'An error occurred');
    }
  } else if (error instanceof Error) {
    // Handle network errors
    if (error.message.includes('NetworkError')) {
      toast.error('Network connection lost. Please check your internet connection.');
    } else {
      toast.error('An unexpected error occurred');
    }
    
    // Log to Sentry
    sentryCapture(error);
  }
};

// Apply to QueryClient
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: queryErrorHandler,
  }),
  mutationCache: new MutationCache({
    onError: queryErrorHandler,
  }),
});
```

### 2. Component-Level Error Boundaries

```typescript
// src/components/QueryErrorBoundary.tsx
export function QueryErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: (error: Error, retry: () => void) => React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => {
        if (fallback) {
          return fallback(error, resetErrorBoundary);
        }
        
        return (
          <div className="error-container">
            <h2>Something went wrong</h2>
            <pre>{error.message}</pre>
            <button onClick={resetErrorBoundary}>Try again</button>
          </div>
        );
      }}
      onError={(error) => {
        // Log to monitoring
        console.error('Query Error Boundary:', error);
        sentryCapture(error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Performance Optimization

### 1. Query Deduplication

Prevent duplicate requests:

```typescript
// Automatic deduplication within gcTime window
const { data: dashboard1 } = useDashboard('123');
const { data: dashboard2 } = useDashboard('123'); // No new request!

// Both hooks share the same query instance
```

### 2. Selective Refetching

Refetch only what's needed:

```typescript
// src/hooks/useSelectiveRefetch.ts
export function useSelectiveRefetch() {
  const queryClient = useQueryClient();
  
  return {
    // Refetch only active queries
    refetchActive: () => 
      queryClient.invalidateQueries({ 
        refetchType: 'active' 
      }),
    
    // Refetch specific data type
    refetchDashboards: () =>
      queryClient.invalidateQueries({ 
        queryKey: apiQueryKeys.dashboards,
        refetchType: 'active',
      }),
    
    // Refetch with predicate
    refetchStale: () =>
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.state.dataUpdatedAt < Date.now() - 5 * 60 * 1000, // 5 min old
      }),
  };
}
```

### 3. Suspense Integration

For concurrent rendering:

```typescript
// src/hooks/useDashboardSuspense.ts
export function useDashboardSuspense(dashboardId: string) {
  return useSuspenseQuery({
    ...createQueryOptions.dashboard(dashboardId),
    queryKey: apiQueryKeys.dashboard(dashboardId),
    queryFn: () => dashboardApi.getDashboard(dashboardId),
  });
}

// Usage with Suspense
function DashboardView({ dashboardId }: { dashboardId: string }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent dashboardId={dashboardId} />
    </Suspense>
  );
}

function DashboardContent({ dashboardId }: { dashboardId: string }) {
  // This will suspend until data is ready
  const { data } = useDashboardSuspense(dashboardId);
  
  return <Dashboard data={data} />;
}
```

## Best Practices Summary

1. **Always use TypeScript** for full type safety
2. **Centralize query keys** to prevent typos and ensure consistency
3. **Handle loading and error states** explicitly in components
4. **Use optimistic updates** for better perceived performance
5. **Implement proper error boundaries** at multiple levels
6. **Test your hooks** thoroughly with mock data
7. **Monitor query performance** with React Query DevTools
8. **Document complex patterns** for team understanding

## Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Our API Types](/src/types/api.ts)
- [Query Configuration](/src/lib/tanstack-query/config.ts)
- [Example Implementations](/src/hooks/)