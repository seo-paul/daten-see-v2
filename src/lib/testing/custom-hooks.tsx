/**
 * Custom Testing Hooks
 * Utilities for testing custom hooks with TanStack Query
 */

import { renderHook, RenderHookOptions } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestContextWrapper } from './context-wrapper';
import { TestQueryWrapper } from './query-wrapper';
import { createTestQueryClient } from './query-wrapper';
import React from 'react';

export interface RenderHookWithQueryOptions<TProps> extends Omit<RenderHookOptions<TProps>, 'wrapper'> {
  queryClient?: QueryClient;
  withAuth?: boolean;
  authValue?: {
    user?: any;
    isAuthenticated?: boolean;
    isLoading?: boolean;
  };
}

/**
 * Render hook with TanStack Query Client
 * For testing custom hooks that use queries/mutations
 */
export function renderHookWithQuery<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: RenderHookWithQueryOptions<TProps> = {}
) {
  const {
    queryClient = createTestQueryClient(),
    withAuth = false,
    authValue,
    ...renderOptions
  } = options;

  const wrapper = withAuth 
    ? ({ children }: { children: React.ReactNode }) => (
        <TestContextWrapper 
          queryClient={queryClient} 
          {...(authValue && { authValue })}
        >
          {children}
        </TestContextWrapper>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <TestQueryWrapper queryClient={queryClient}>
          {children}
        </TestQueryWrapper>
      );

  return renderHook(hook, {
    wrapper,
    ...renderOptions,
  });
}

/**
 * Render hook with full context providers
 * For integration testing of hooks that need auth + navigation
 */
export function renderHookWithContext<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: RenderHookWithQueryOptions<TProps> = {}
) {
  return renderHookWithQuery(hook, {
    ...options,
    withAuth: true,
  });
}

/**
 * Wait for query to settle (success or error)
 * Useful for testing async query behavior
 */
export async function waitForQuery(
  result: { current: any },
  timeout = 5000
): Promise<void> {
  const startTime = Date.now();
  
  while (result.current.isLoading && Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  if (result.current.isLoading) {
    throw new Error(`Query did not settle within ${timeout}ms`);
  }
}

/**
 * Create mock data for testing
 */
export const mockTestData = {
  user: {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
  },
  dashboard: {
    id: 'test-dashboard-1',
    name: 'Test Dashboard',
    description: 'Test Description',
    isPublic: false,
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    widgetCount: 3,
  },
  dashboards: [
    {
      id: 'test-dashboard-1',
      name: 'Test Dashboard 1',
      description: 'First test dashboard',
      isPublic: false,
      updatedAt: new Date('2024-01-15T10:30:00Z'),
      widgetCount: 3,
    },
    {
      id: 'test-dashboard-2',
      name: 'Test Dashboard 2',
      description: 'Second test dashboard',
      isPublic: true,
      updatedAt: new Date('2024-01-14T16:45:00Z'),
      widgetCount: 5,
    },
  ],
} as const;

export default {
  renderHookWithQuery,
  renderHookWithContext,
  waitForQuery,
  mockTestData,
};