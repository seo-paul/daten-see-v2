'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

import { queryClient } from './client';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * TanStack Query Provider with DevTools
 * Wraps the application with Query Client and development tools
 */
export function QueryProvider({ children }: QueryProviderProps): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}