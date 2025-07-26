# TanStack Query Examples

This directory contains practical examples of TanStack Query patterns used in our application.

## Quick Start Examples

### 1. Basic Data Fetching

```typescript
// Simple query hook
import { useDashboard } from '@/hooks/useDashboard';

function DashboardPage({ id }: { id: string }) {
  const { data, isLoading, error } = useDashboard(id);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <DashboardView dashboard={data} />;
}
```

### 2. Creating Resources

```typescript
// Mutation with toast notifications
import { useCreateDashboard } from '@/hooks/useCreateDashboard';
import { toast } from '@/components/ui/toast';

function CreateDashboardForm() {
  const createDashboard = useCreateDashboard();
  
  const handleSubmit = async (formData: FormData) => {
    try {
      const dashboard = await createDashboard.mutateAsync({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
      });
      
      toast.success('Dashboard created successfully!');
      router.push(`/dashboard/${dashboard.id}`);
    } catch (error) {
      toast.error('Failed to create dashboard');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button 
        type="submit" 
        disabled={createDashboard.isPending}
      >
        {createDashboard.isPending ? 'Creating...' : 'Create Dashboard'}
      </button>
    </form>
  );
}
```

### 3. Real-time Updates

```typescript
// Polling for real-time data
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

function RealtimeMetrics({ widgetId }: { widgetId: string }) {
  const { data } = useAnalyticsData(widgetId, {
    // Refetch every 10 seconds
    refetchInterval: 10000,
    // Keep refetching when window is in background
    refetchIntervalInBackground: true,
  });
  
  return <MetricsDisplay data={data} />;
}
```

### 4. Dependent Queries

```typescript
// Query that depends on user selection
import { useDataSource, useDataSourceMetrics } from '@/hooks/dataSource';

function DataSourceDashboard() {
  const [selectedSourceId, setSelectedSourceId] = useState<string>();
  
  // First query: get available data sources
  const { data: sources } = useDataSources();
  
  // Second query: get metrics for selected source
  const { data: metrics } = useDataSourceMetrics(selectedSourceId, {
    // Only run when we have a selected source
    enabled: !!selectedSourceId,
  });
  
  return (
    <div>
      <select onChange={(e) => setSelectedSourceId(e.target.value)}>
        <option value="">Select a data source</option>
        {sources?.map(source => (
          <option key={source.id} value={source.id}>
            {source.name}
          </option>
        ))}
      </select>
      
      {metrics && <MetricsChart data={metrics} />}
    </div>
  );
}
```

### 5. Optimistic Updates

```typescript
// Update with immediate UI feedback
import { useUpdateWidget } from '@/hooks/useUpdateWidget';

function WidgetSettings({ widget }: { widget: Widget }) {
  const updateWidget = useUpdateWidget(widget.id);
  
  const handleColorChange = (color: string) => {
    // Update will be reflected immediately in UI
    updateWidget.mutate(
      { config: { ...widget.config, color } },
      {
        // Show previous state if update fails
        onError: (error, variables, context) => {
          toast.error('Failed to update widget color');
        },
      }
    );
  };
  
  return (
    <ColorPicker
      value={widget.config.color}
      onChange={handleColorChange}
      disabled={updateWidget.isPending}
    />
  );
}
```

### 6. Infinite Scroll

```typescript
// Paginated data with infinite loading
import { useInfiniteAnalyticsHistory } from '@/hooks/useAnalyticsHistory';

function AnalyticsHistoryList({ dataSourceId }: { dataSourceId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAnalyticsHistory(dataSourceId);
  
  return (
    <div>
      {data?.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.items.map((item) => (
            <AnalyticsItem key={item.id} item={item} />
          ))}
        </React.Fragment>
      ))}
      
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### 7. Prefetching

```typescript
// Prefetch data for better UX
import { usePrefetchDashboard } from '@/hooks/usePrefetchDashboard';

function DashboardList({ dashboards }: { dashboards: Dashboard[] }) {
  const prefetchDashboard = usePrefetchDashboard();
  
  return (
    <ul>
      {dashboards.map(dashboard => (
        <li key={dashboard.id}>
          <Link
            href={`/dashboard/${dashboard.id}`}
            // Prefetch on hover for instant navigation
            onMouseEnter={() => prefetchDashboard(dashboard.id)}
          >
            {dashboard.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

### 8. Error Recovery

```typescript
// Graceful error handling with retry
import { useDashboards } from '@/hooks/useDashboards';

function DashboardsWithErrorHandling() {
  const { data, error, refetch, isRefetching } = useDashboards();
  
  if (error) {
    return (
      <ErrorCard>
        <p>Failed to load dashboards: {error.message}</p>
        <button 
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? 'Retrying...' : 'Try Again'}
        </button>
      </ErrorCard>
    );
  }
  
  return <DashboardGrid dashboards={data ?? []} />;
}
```

### 9. Background Refetching

```typescript
// Keep data fresh in background
import { useDataSources } from '@/hooks/useDataSources';

function DataSourceMonitor() {
  const { data: sources } = useDataSources({
    // Refetch when window regains focus
    refetchOnWindowFocus: true,
    // Refetch when reconnecting to internet
    refetchOnReconnect: true,
    // Consider data stale after 2 minutes
    staleTime: 2 * 60 * 1000,
  });
  
  return (
    <div>
      {sources?.map(source => (
        <DataSourceCard 
          key={source.id} 
          source={source}
          isStale={source.lastSync < Date.now() - 5 * 60 * 1000}
        />
      ))}
    </div>
  );
}
```

### 10. Mutation with File Upload

```typescript
// Handle file uploads with progress
import { useUploadDataSource } from '@/hooks/useUploadDataSource';

function CSVUploader() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadMutation = useUploadDataSource();
  
  const handleFileSelect = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    
    try {
      await uploadMutation.mutateAsync(formData, {
        onUploadProgress: (progress) => {
          setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
        },
      });
      
      toast.success('File uploaded successfully!');
      setUploadProgress(0);
    } catch (error) {
      toast.error('Upload failed');
      setUploadProgress(0);
    }
  };
  
  return (
    <div>
      <FileInput 
        onFileSelect={handleFileSelect}
        disabled={uploadMutation.isPending}
      />
      
      {uploadMutation.isPending && (
        <ProgressBar value={uploadProgress} />
      )}
    </div>
  );
}
```

## Testing Examples

### Mock Query Client for Tests

```typescript
// test-utils/query-client.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        cacheTime: 0, // No caching in tests
      },
    },
  });
}

export function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Testing a Query Hook

```typescript
// __tests__/useDashboard.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { TestWrapper } from '@/test-utils/query-client';

test('useDashboard fetches data correctly', async () => {
  const { result } = renderHook(
    () => useDashboard('test-id'),
    { wrapper: TestWrapper }
  );
  
  // Wait for query to resolve
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });
  
  expect(result.current.data).toMatchObject({
    id: 'test-id',
    title: expect.any(String),
  });
});
```

## Performance Tips

1. **Use `select` to transform data**
   ```typescript
   const { data: widgetCount } = useDashboard(id, {
     select: (dashboard) => dashboard.widgets.length,
   });
   ```

2. **Disable queries until needed**
   ```typescript
   const { data } = useExpensiveQuery({
     enabled: userWantsToSeeThis,
   });
   ```

3. **Use `keepPreviousData` for smoother UX**
   ```typescript
   const { data } = useSearchResults(searchTerm, {
     keepPreviousData: true, // Show old results while fetching new
   });
   ```

4. **Batch invalidations**
   ```typescript
   queryClient.invalidateQueries([
     { queryKey: ['dashboards'] },
     { queryKey: ['widgets'] },
     { queryKey: ['analytics'] },
   ]);
   ```

## Common Gotchas

1. **Stable Query Keys**: Always use stable query keys
   ```typescript
   // ❌ Bad: Creates new array on every render
   const { data } = useQuery({
     queryKey: ['data', { ...filters }],
   });
   
   // ✅ Good: Stable reference
   const queryKey = useMemo(
     () => ['data', filters],
     [filters]
   );
   const { data } = useQuery({ queryKey });
   ```

2. **Error Handling**: Always handle errors
   ```typescript
   // ❌ Bad: No error handling
   const { data } = useQuery({ ... });
   
   // ✅ Good: Explicit error handling
   const { data, error } = useQuery({ ... });
   if (error) return <ErrorDisplay error={error} />;
   ```

3. **Mutation Side Effects**: Use callbacks properly
   ```typescript
   // ❌ Bad: Side effects in render
   if (mutation.isSuccess) {
     router.push('/success'); // This runs on every render!
   }
   
   // ✅ Good: Side effects in callbacks
   const mutation = useMutation({
     onSuccess: () => {
       router.push('/success');
     },
   });
   ```