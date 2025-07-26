'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

import BISaaSQueryDevTools from '@/lib/tanstack-query/devtools';

import { queryClient } from './client';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * TanStack Query Provider with Enhanced DevTools
 * Wraps the application with Query Client and advanced development tools
 */
export function QueryProvider({ children }: QueryProviderProps): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Enhanced DevTools only in development */}
      {process.env.NODE_ENV === 'development' && <BISaaSQueryDevTools />}
    </QueryClientProvider>
  );
}