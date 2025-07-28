/**
 * Advanced Query Performance Dashboard
 * Comprehensive development tools for TanStack Query optimization
 */

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useMemo } from 'react';


interface QueryPerformanceData {
  queryKey: readonly unknown[];
  status: 'pending' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
  isStale: boolean;
  dataUpdateCount: number;
  errorUpdateCount: number;
  observersCount: number;
  dataUpdatedAt: number;
  lastFetchTime?: number;
  cacheTime?: number;
  staleTime?: number;
}

interface DashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

export function QueryPerformanceDashboard({ isVisible, onClose }: DashboardProps): React.ReactElement | null {
  const queryClient = useQueryClient();
  const [refreshInterval, setRefreshInterval] = useState(1000);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'updateCount' | 'observers' | 'staleTime'>('updateCount');

  // Performance data collection
  const performanceData = useMemo((): QueryPerformanceData[] => {
    return queryClient.getQueryCache().getAll().map(query => ({
      queryKey: query.queryKey,
      status: query.state.status,
      fetchStatus: query.state.fetchStatus,
      isStale: query.isStale(),
      dataUpdateCount: query.state.dataUpdateCount,
      errorUpdateCount: query.state.errorUpdateCount,
      observersCount: query.getObserversCount(),
      dataUpdatedAt: query.state.dataUpdatedAt,
      lastFetchTime: query.state.dataUpdatedAt,
      // Note: These are internal and may not be available
      cacheTime: (query as unknown as Record<string, unknown>).cacheTime as number,
      staleTime: (query as unknown as Record<string, unknown>).staleTime as number,
    }));
  }, [queryClient]);

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = performanceData;
    
    if (selectedDomain) {
      filtered = filtered.filter(query => 
        Array.isArray(query.queryKey) && query.queryKey[0] === selectedDomain
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updateCount':
          return b.dataUpdateCount - a.dataUpdateCount;
        case 'observers':
          return b.observersCount - a.observersCount;
        case 'staleTime':
          return (b.staleTime || 0) - (a.staleTime || 0);
        default:
          return 0;
      }
    });
  }, [performanceData, selectedDomain, sortBy]);

  // Domain statistics
  const domainStats = useMemo(() => {
    const stats: Record<string, {
      total: number;
      stale: number;
      errors: number;
      loading: number;
      avgUpdateCount: number;
    }> = {};

    performanceData.forEach(query => {
      const domain = Array.isArray(query.queryKey) ? query.queryKey[0] as string : 'unknown';
      
      if (!stats[domain]) {
        stats[domain] = {
          total: 0,
          stale: 0,
          errors: 0,
          loading: 0,
          avgUpdateCount: 0,
        };
      }

      stats[domain].total++;
      if (query.isStale) stats[domain].stale++;
      if (query.status === 'error') stats[domain].errors++;
      if (query.status === 'pending') stats[domain].loading++;
      stats[domain].avgUpdateCount += query.dataUpdateCount;
    });

    // Calculate averages
    Object.keys(stats).forEach(domain => {
      const domainStat = stats[domain];
      if (domainStat && domainStat.total > 0) {
        domainStat.avgUpdateCount /= domainStat.total;
      }
    });

    return stats;
  }, [performanceData]);

  // Auto-refresh logic
  useEffect(() => {
    if (!isVisible || refreshInterval === 0) return;

    const interval = setInterval((): void => {
      // Force re-render by accessing cache
      queryClient.getQueryCache().getAll();
    }, refreshInterval);

    return (): void => clearInterval(interval);
  }, [isVisible, refreshInterval, queryClient]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      zIndex: 10000,
      overflow: 'auto',
      fontFamily: 'monospace',
      fontSize: '12px',
    }}>
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #333',
          paddingBottom: '10px',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>
            🚀 Query Performance Dashboard
          </h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>
              Refresh:
              <select 
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                style={{ marginLeft: '5px', background: '#333', color: 'white', border: 'none' }}
              >
                <option value={0}>Off</option>
                <option value={500}>500ms</option>
                <option value={1000}>1s</option>
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
              </select>
            </label>
            <button
              onClick={onClose}
              style={{
                background: '#666',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Domain Overview */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Domain Overview</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
          }}>
            {Object.entries(domainStats).map(([domain, stats]) => (
              <div 
                key={domain}
                onClick={() => setSelectedDomain(selectedDomain === domain ? null : domain)}
                style={{
                  background: selectedDomain === domain ? '#444' : '#222',
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: selectedDomain === domain ? '2px solid #666' : '1px solid #333',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{domain}</div>
                <div>Total: {stats.total}</div>
                <div>Stale: {stats.stale}</div>
                <div>Errors: {stats.errors}</div>
                <div>Loading: {stats.loading}</div>
                <div>Avg Updates: {stats.avgUpdateCount.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginBottom: '20px',
          padding: '10px',
          background: '#222',
          borderRadius: '4px',
        }}>
          <label>
            Sort by:
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              style={{ marginLeft: '5px', background: '#333', color: 'white', border: 'none' }}
            >
              <option value="updateCount">Update Count</option>
              <option value="observers">Observers</option>
              <option value="staleTime">Stale Time</option>
            </select>
          </label>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => queryClient.clear()}
              style={{
                background: '#d32f2f',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear All
            </button>
            <button
              onClick={() => queryClient.invalidateQueries()}
              style={{
                background: '#f57c00',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Invalidate All
            </button>
            <button
              onClick={() => queryClient.refetchQueries()}
              style={{
                background: '#388e3c',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Refetch All
            </button>
          </div>
        </div>

        {/* Query List */}
        <div>
          <h3 style={{ margin: '0 0 10px 0' }}>
            Query Details ({filteredData.length} queries)
            {selectedDomain && ` - ${selectedDomain}`}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 80px 60px 60px 80px 120px',
            gap: '10px',
            alignItems: 'center',
            padding: '10px',
            background: '#333',
            borderRadius: '4px',
            marginBottom: '5px',
            fontWeight: 'bold',
          }}>
            <div>Query Key</div>
            <div>Status</div>
            <div>Updates</div>
            <div>Errors</div>
            <div>Obs</div>
            <div>Stale</div>
            <div>Last Updated</div>
          </div>
          
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {filteredData.map((query, index) => (
              <div 
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 80px 60px 60px 80px 120px',
                  gap: '10px',
                  alignItems: 'center',
                  padding: '8px 10px',
                  background: index % 2 === 0 ? '#222' : '#111',
                  borderRadius: '2px',
                  fontSize: '11px',
                }}
              >
                <div style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  fontFamily: 'monospace',
                }}>
                  {JSON.stringify(query.queryKey)}
                </div>
                <div style={{
                  color: query.status === 'error' ? '#f44336' :
                        query.status === 'pending' ? '#ff9800' :
                        query.status === 'success' ? '#4caf50' : 'white'
                }}>
                  {query.status}
                </div>
                <div>{query.dataUpdateCount}</div>
                <div style={{ color: query.errorUpdateCount > 0 ? '#f44336' : '#666' }}>
                  {query.errorUpdateCount}
                </div>
                <div>{query.observersCount}</div>
                <div style={{ color: query.isStale ? '#ff9800' : '#666' }}>
                  {query.isStale ? 'Yes' : 'No'}
                </div>
                <div>
                  {query.dataUpdatedAt > 0 
                    ? new Date(query.dataUpdatedAt).toLocaleTimeString()
                    : 'Never'
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to control dashboard visibility
export function useQueryPerformanceDashboard(): {
  isVisible: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
} {
  const [isVisible, setIsVisible] = useState(false);

  // Keyboard shortcut to toggle dashboard
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Ctrl/Cmd + Shift + P to toggle performance dashboard
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return (): void => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isVisible,
    toggle: () => setIsVisible(prev => !prev),
    show: () => setIsVisible(true),
    hide: () => setIsVisible(false),
  };
}