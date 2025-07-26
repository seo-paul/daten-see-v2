/**
 * Simple Query Performance Dashboard
 * Lightweight monitoring for TanStack Query
 */

'use client';

import { useQueryClient } from '@tanstack/react-query';
import React from 'react';

interface QueryMetrics {
  total: number;
  loading: number;
  error: number;
  success: number;
  stale: number;
}

function useSimpleQueryMetrics(): QueryMetrics {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = React.useState<QueryMetrics>({
    total: 0,
    loading: 0,
    error: 0,
    success: 0,
    stale: 0,
  });

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateMetrics = (): void => {
      const queries = queryClient.getQueryCache().getAll();
      setMetrics({
        total: queries.length,
        loading: queries.filter(q => q.state.status === 'pending').length,
        error: queries.filter(q => q.state.status === 'error').length,
        success: queries.filter(q => q.state.status === 'success').length,
        stale: queries.filter(q => q.isStale()).length,
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);
    return (): void => {
      clearInterval(interval);
    };
  }, [queryClient]);

  return metrics;
}

export function QueryPerformanceDashboard(): React.ReactElement | null {
  const metrics = useSimpleQueryMetrics();
  const queryClient = useQueryClient();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleClearCache = (): void => {
    queryClient.clear();
  };

  const handleInvalidateAll = (): void => {
    queryClient.invalidateQueries();
  };

  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: '12px',
      padding: '12px',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      border: '1px solid #e9ecef',
    }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
        🔍 Query Performance Monitor
      </h4>
      
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <span>Total: <strong>{metrics.total}</strong></span>
        <span style={{ color: '#f59e0b' }}>Loading: <strong>{metrics.loading}</strong></span>
        <span style={{ color: '#dc2626' }}>Errors: <strong>{metrics.error}</strong></span>
        <span style={{ color: '#059669' }}>Success: <strong>{metrics.success}</strong></span>
        <span style={{ color: '#7c3aed' }}>Stale: <strong>{metrics.stale}</strong></span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleClearCache}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          Clear Cache
        </button>
        <button
          onClick={handleInvalidateAll}
          style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          Invalidate All
        </button>
      </div>
    </div>
  );
}

export default QueryPerformanceDashboard;