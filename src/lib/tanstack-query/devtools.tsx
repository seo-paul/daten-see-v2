/**
 * Enhanced TanStack Query DevTools Configuration
 * Simplified working version for BI SaaS dashboard
 */

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';

export function EnhancedQueryDevTools(): React.ReactElement | null {
  const queryClient = useQueryClient();

  // Enhanced keyboard shortcuts for development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      // Ctrl/Cmd + Shift + C to clear cache
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        queryClient.clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return (): void => window.removeEventListener('keydown', handleKeyDown);
  }, [queryClient]);

  // Development utilities
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (typeof window === 'undefined') return;

    const queryDebugUtils = {
      getAllQueries: (): unknown[] => queryClient.getQueryCache().getAll(),
      
      getQueryStats: (): Record<string, number> => {
        const queries = queryClient.getQueryCache().getAll();
        return {
          total: queries.length,
          loading: queries.filter(q => q.state.status === 'pending').length,
          error: queries.filter(q => q.state.status === 'error').length,
          success: queries.filter(q => q.state.status === 'success').length,
          stale: queries.filter(q => q.isStale()).length,
          inactive: queries.filter(q => q.getObserversCount() === 0).length,
        };
      },
      
      clearCache: (): void => queryClient.clear(),
      
      invalidateAll: (): void => {
        queryClient.invalidateQueries();
      },
    };

    (window as unknown as Record<string, unknown>).queryDebug = queryDebugUtils;
  }, [queryClient]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <ReactQueryDevtools initialIsOpen={false} />;
}

export default function BISaaSQueryDevTools(): React.ReactElement | null {
  return <EnhancedQueryDevTools />;
}