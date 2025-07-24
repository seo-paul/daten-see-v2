/**
 * Context Provider Test Wrapper
 * Combines all app contexts for testing
 */

import { QueryClient } from '@tanstack/react-query';
import React from 'react';

import { AuthProvider } from '@/contexts/AuthContext';
import { NavigationProvider } from '@/contexts/NavigationContext';

import { TestQueryWrapper, createTestQueryClient } from './query-wrapper';

export interface TestContextWrapperProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  // Auth context overrides for testing different states
  authValue?: {
    user?: Record<string, unknown>;
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
  queryClient = createTestQueryClient()
}: Omit<TestContextWrapperProps, 'authValue'>): React.ReactElement {
  // Note: AuthProvider manages its own state
  return (
    <TestQueryWrapper queryClient={queryClient}>
      <AuthProvider>
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
  queryClient = createTestQueryClient()
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
  children
}: Pick<TestContextWrapperProps, 'children'>): React.ReactElement {
  // Note: AuthProvider manages its own state
  return (
    <TestQueryWrapper>
      <AuthProvider>
        {children}
      </AuthProvider>
    </TestQueryWrapper>
  );
}

export default TestContextWrapper;