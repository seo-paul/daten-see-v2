/**
 * Enhanced TanStack Query DevTools Configuration
 * Advanced development tools for BI SaaS dashboard optimization
 */

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState, useCallback } from 'react';

import { devLogger } from '@/lib/development/logger';
import { QueryPerformanceDashboard, useQueryPerformanceDashboard } from '@/lib/tanstack-query/devtools-dashboard';
import { useDevQueryMonitor } from '@/lib/tanstack-query/performance-monitor';
import { queryKeys } from '@/lib/tanstack-query/query-keys';

// DevTools state management
interface DevToolsState {
  isAdvancedMode: boolean;
  showNetworkStats: boolean;
  autoRefreshStats: boolean;
  selectedDomain: string | null;
}

export function EnhancedQueryDevTools(): React.ReactElement | null {
  const queryClient = useQueryClient();
  const [devState, setDevState] = useState<DevToolsState>({
    isAdvancedMode: false,
    showNetworkStats: false,
    autoRefreshStats: false,
    selectedDomain: null,
  });
  
  // Performance dashboard hook
  const performanceDashboard = useQueryPerformanceDashboard();
  
  // Auto performance monitoring (development only)
  useDevQueryMonitor({
    intervalMs: 10000, // Check every 10 seconds
    autoOptimize: false, // Manual optimization only
  });

  // Enhanced keyboard shortcuts for development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      // Ctrl/Cmd + Shift + C to clear cache
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        queryClient.clear();
        devLogger.success('Query cache cleared via keyboard shortcut');
      }
      
      // Ctrl/Cmd + Shift + D to toggle DevTools advanced mode
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setDevState(prev => ({ ...prev, isAdvancedMode: !prev.isAdvancedMode }));
      }
      
      // Ctrl/Cmd + Shift + N to toggle network stats
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'N') {
        event.preventDefault();
        setDevState(prev => ({ ...prev, showNetworkStats: !prev.showNetworkStats }));
      }
      
      // Ctrl/Cmd + Shift + R to force refetch all queries
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        queryClient.refetchQueries();
        devLogger.success('All queries refetched via keyboard shortcut');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return (): void => window.removeEventListener('keydown', handleKeyDown);
  }, [queryClient]);

  // Advanced query performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    const queries = queryClient.getQueryCache().getAll();
    const mutations = queryClient.getMutationCache().getAll();
    
    return {
      cache: {
        queries: {
          total: queries.length,
          loading: queries.filter(q => q.state.status === 'pending').length,
          error: queries.filter(q => q.state.status === 'error').length,
          success: queries.filter(q => q.state.status === 'success').length,
          stale: queries.filter(q => q.isStale()).length,
          inactive: queries.filter(q => q.getObserversCount() === 0).length,
        },
        mutations: {
          total: mutations.length,
          pending: mutations.filter(m => m.state.status === 'pending').length,
          error: mutations.filter(m => m.state.status === 'error').length,
          success: mutations.filter(m => m.state.status === 'success').length,
        },
      },
      domains: ((): Record<string, number> => {
        const domainStats: Record<string, number> = {};
        queries.forEach(query => {
          const domain = Array.isArray(query.queryKey) ? query.queryKey[0] as string : 'unknown';
          domainStats[domain] = (domainStats[domain] || 0) + 1;
        });
        return domainStats;
      })(),
      memory: {
        cacheSize: queries.reduce((size, query) => {
          const dataSize = JSON.stringify(query.state.data || {}).length;
          return size + dataSize;
        }, 0),
        averageQuerySize: queries.length > 0 
          ? queries.reduce((total, query) => total + JSON.stringify(query.state.data || {}).length, 0) / queries.length 
          : 0,
      },
    };
  }, [queryClient]);

  // Enhanced development utilities
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (typeof window === 'undefined') return;

    const queryDebugUtils = {
      // Basic operations
      getAllQueries: (): unknown[] => queryClient.getQueryCache().getAll(),
      getAllMutations: (): unknown[] => queryClient.getMutationCache().getAll(),
      clearCache: (): void => queryClient.clear(),
      invalidateAll: (): Promise<void> => queryClient.invalidateQueries(),
      refetchAll: (): Promise<void> => queryClient.refetchQueries(),
      
      // Performance monitoring
      getStats: getPerformanceMetrics,
      
      // Domain-specific operations
      invalidateDomain: (domain: string): void => {
        queryClient.invalidateQueries({ 
          predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === domain 
        });
        devLogger.success(`Invalidated all queries for domain: ${domain}`);
      },
      
      // Query key management
      findQueriesByKey: (searchKey: string): unknown[] => {
        return queryClient.getQueryCache().getAll().filter(query => 
          JSON.stringify(query.queryKey).includes(searchKey)
        );
      },
      
      // Error analysis
      getErrorQueries: (): Array<{queryKey: readonly unknown[]; error: unknown; errorUpdateCount: number; failureReason?: string}> => {
        return queryClient.getQueryCache().getAll()
          .filter(query => query.state.status === 'error')
          .map(query => {
            const result: {queryKey: readonly unknown[]; error: unknown; errorUpdateCount: number; failureReason?: string} = {
              queryKey: query.queryKey,
              error: query.state.error,
              errorUpdateCount: query.state.errorUpdateCount,
            };
            
            const errorMessage = query.state.error?.toString();
            if (errorMessage) {
              result.failureReason = errorMessage;
            }
            
            return result;
          });
      },
      
      // Stale data management
      getStaleQueries: (): Array<{queryKey: readonly unknown[]; dataUpdatedAt: number; isStale: boolean; observersCount: number}> => {
        return queryClient.getQueryCache().getAll()
          .filter(query => query.isStale())
          .map(query => ({
            queryKey: query.queryKey,
            dataUpdatedAt: query.state.dataUpdatedAt,
            isStale: query.isStale(),
            observersCount: query.getObserversCount(),
          }));
      },
      
      // Cache efficiency analysis
      analyzeCacheEfficiency: (): {totalQueries: number; cacheHitRate: number; staleFetchRate: number; averageFetchCount: number} => {
        const queries = queryClient.getQueryCache().getAll();
        const totalQueries = queries.length;
        const hitQueries = queries.filter(q => q.state.dataUpdateCount > 0).length;
        const staleFetches = queries.filter(q => q.state.dataUpdateCount > 1).length;
        
        return {
          totalQueries,
          cacheHitRate: totalQueries > 0 ? (hitQueries / totalQueries) * 100 : 0,
          staleFetchRate: totalQueries > 0 ? (staleFetches / totalQueries) * 100 : 0,
          averageFetchCount: totalQueries > 0 
            ? queries.reduce((sum, q) => sum + q.state.dataUpdateCount, 0) / totalQueries 
            : 0,
        };
      },

      // Network simulation (for testing)
      simulateNetworkDelay: (ms: number): void => {
        const originalFetch = window.fetch;
        window.fetch = (...args): Promise<Response> => {
          return new Promise(resolve => {
            setTimeout(() => resolve(originalFetch(...args)), ms);
          });
        };
        devLogger.network('Network delay simulation started', { delayMs: ms });
        
        // Auto-restore after 30 seconds
        setTimeout((): void => {
          window.fetch = originalFetch;
          devLogger.network('Network delay simulation restored', { duration: '30s' });
        }, 30000);
      },

      // Query key utilities using our centralized system
      queryKeys: {
        dashboards: queryKeys.dashboards,
        auth: queryKeys.auth,
        dataSources: queryKeys.dataSources,
        analytics: queryKeys.analytics,
      },

      // Advanced debugging
      enableVerboseLogging: (): void => {
        // Note: setLogger method may not be available in all TanStack Query versions
        // This is a development-only feature
        devLogger.success('Verbose query logging enabled (Note: setLogger not available in current version)');
      },

      disableVerboseLogging: (): void => {
        devLogger.success('Verbose query logging disabled');
      },

      // Performance dashboard controls
      showPerformanceDashboard: (): void => performanceDashboard.show(),
      hidePerformanceDashboard: (): void => performanceDashboard.hide(),
      togglePerformanceDashboard: (): void => performanceDashboard.toggle(),
    };

    // Expose to window for console access
    (window as unknown as Record<string, unknown>).queryDebug = queryDebugUtils;
    
    // Log available commands
    devLogger.group('TanStack Query DevTools Enhanced - Available Commands', () => {
      devLogger.log('Basic Operations:');
      devLogger.log('  queryDebug.getStats() - Get performance metrics');
      devLogger.log('  queryDebug.clearCache() - Clear all cached data');
      devLogger.log('  queryDebug.invalidateAll() - Invalidate all queries');
      devLogger.log('  queryDebug.refetchAll() - Refetch all queries');
      
      devLogger.log('Advanced Analysis:');
      devLogger.log('  queryDebug.getErrorQueries() - Get queries with errors');
      devLogger.log('  queryDebug.getStaleQueries() - Get stale queries');
      devLogger.log('  queryDebug.analyzeCacheEfficiency() - Cache performance analysis');
      
      devLogger.log('Domain Operations:');
      devLogger.log('  queryDebug.invalidateDomain(\'dashboards\') - Invalidate specific domain');
      devLogger.log('  queryDebug.findQueriesByKey(\'dashboard\') - Find queries by key');
      
      devLogger.log('Debugging:');
      devLogger.log('  queryDebug.enableVerboseLogging() - Enable detailed logs');
      devLogger.log('  queryDebug.simulateNetworkDelay(1000) - Add network delay');
      
      devLogger.log('Performance Dashboard:');
      devLogger.log('  queryDebug.showPerformanceDashboard() - Show advanced dashboard');
      devLogger.log('  queryDebug.togglePerformanceDashboard() - Toggle dashboard');
      
      devLogger.log('Keyboard Shortcuts:');
      devLogger.log('  Cmd/Ctrl + Shift + C - Clear cache');
      devLogger.log('  Cmd/Ctrl + Shift + R - Refetch all');
      devLogger.log('  Cmd/Ctrl + Shift + D - Toggle advanced mode');
      devLogger.log('  Cmd/Ctrl + Shift + N - Toggle network stats');
      devLogger.log('  Cmd/Ctrl + Shift + P - Toggle performance dashboard');
    });
    
  }, [queryClient, getPerformanceMetrics, performanceDashboard]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <ReactQueryDevtools 
        initialIsOpen={false}
        buttonPosition="bottom-right"
      />
      {devState.isAdvancedMode && (
        <div 
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: 9999,
            maxWidth: '400px',
            maxHeight: '500px',
            overflow: 'auto',
          }}
        >
          <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
            🚀 Enhanced Query DevTools
          </div>
          <QueryStatsDisplay getStats={getPerformanceMetrics} />
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button
              onClick={performanceDashboard.toggle}
              style={{
                background: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              Performance
            </button>
            <button
              onClick={() => setDevState(prev => ({ ...prev, isAdvancedMode: false }))}
              style={{
                background: '#666',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Advanced Performance Dashboard */}
      <QueryPerformanceDashboard 
        isVisible={performanceDashboard.isVisible}
        onClose={performanceDashboard.hide}
      />
    </>
  );
}

// Query stats display component  
function QueryStatsDisplay({ getStats }: { getStats: () => {
  cache: {
    queries: { total: number; loading: number; error: number; success: number; stale: number; inactive: number; };
    mutations: { total: number; pending: number; error: number; success: number; };
  };
  domains: Record<string, number>;
  memory: { cacheSize: number; averageQuerySize: number; };
} }): React.ReactElement {
  const [stats, setStats] = useState(getStats());

  useEffect(() => {
    const interval = setInterval((): void => {
      setStats(getStats());
    }, 1000);

    return (): void => clearInterval(interval);
  }, [getStats]);

  return (
    <div style={{ lineHeight: '1.4' }}>
      <div><strong>Cache Stats:</strong></div>
      <div>Total Queries: {stats.cache.queries.total}</div>
      <div>Loading: {stats.cache.queries.loading}</div>
      <div>Errors: {stats.cache.queries.error}</div>
      <div>Success: {stats.cache.queries.success}</div>
      <div>Stale: {stats.cache.queries.stale}</div>
      
      <div style={{ marginTop: '8px' }}><strong>Mutations:</strong></div>
      <div>Total: {stats.cache.mutations.total}</div>
      <div>Pending: {stats.cache.mutations.pending}</div>
      
      <div style={{ marginTop: '8px' }}><strong>Memory:</strong></div>
      <div>Cache Size: {Math.round(stats.memory.cacheSize / 1024)}KB</div>
      <div>Avg Query: {Math.round(stats.memory.averageQuerySize)}B</div>
      
      <div style={{ marginTop: '8px' }}><strong>Domains:</strong></div>
      {Object.entries(stats.domains).map(([domain, count]) => (
        <div key={domain}>{String(domain)}: {count}</div>
      ))}
    </div>
  );
}

export default function BISaaSQueryDevTools(): React.ReactElement | null {
  return <EnhancedQueryDevTools />;
}