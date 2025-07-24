/**
 * Context Provider Test Wrapper
 * Combines all app contexts for testing
 */

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { TestQueryWrapper, createTestQueryClient } from './query-wrapper';
import { QueryClient } from '@tanstack/react-query';

export interface TestContextWrapperProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  // Auth context overrides for testing different states
  authValue?: {
    user?: any;
    isAuthenticated?: boolean;
    isLoading?: boolean;
  };
}

/**
 * Full Context Wrapper for integration tests
 * Provides all app contexts in testing environment
 */
export function TestContextWrapper({ 
  children, 
  queryClient = createTestQueryClient(),
  authValue 
}: TestContextWrapperProps): React.ReactElement {
  return (
    <TestQueryWrapper queryClient={queryClient}>
      <AuthProvider value={authValue}>
        <NavigationProvider>
          {children}
        </NavigationProvider>
      </AuthProvider>
    </TestQueryWrapper>
  );
}

/**
 * Minimal wrapper for components that only need Query Client
 */
export function MinimalTestWrapper({ 
  children,
  queryClient 
}: Omit<TestContextWrapperProps, 'authValue'>): React.ReactElement {
  return (
    <TestQueryWrapper queryClient={queryClient}>
      {children}
    </TestQueryWrapper>
  );
}

/**
 * Auth-only wrapper for testing authentication flows
 */
export function AuthTestWrapper({ 
  children,
  authValue 
}: Pick<TestContextWrapperProps, 'children' | 'authValue'>): React.ReactElement {
  return (
    <TestQueryWrapper>
      <AuthProvider value={authValue}>
        {children}
      </AuthProvider>
    </TestQueryWrapper>
  );
}

export default TestContextWrapper;