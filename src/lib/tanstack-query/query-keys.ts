/**
 * Centralized Query Key Management
 * Provides type-safe, stable query keys for all TanStack Query operations
 * 
 * Best Practices:
 * - All query keys are functions that return const arrays
 * - Hierarchical structure: [domain, operation, ...params]
 * - Stable references prevent unnecessary re-renders
 * - Type-safe with proper TypeScript inference
 */

// Base query key factories
const createQueryKeyFactory = <T extends string>(domain: T): {
  all: () => readonly [T];
  lists: () => readonly [T, 'list'];
  list: (filters?: Record<string, unknown>) => readonly [T, 'list', Record<string, unknown> | undefined];
  details: () => readonly [T, 'detail'];
  detail: (id: string) => readonly [T, 'detail', string];
} => {
  return {
    all: () => [domain] as const,
    lists: () => [domain, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [domain, 'list', filters] as const,
    details: () => [domain, 'detail'] as const,
    detail: (id: string) => [domain, 'detail', id] as const,
  };
};

// Domain-specific query keys
export const queryKeys = {
  // Dashboard operations
  dashboards: {
    ...createQueryKeyFactory('dashboards'),
    // Specialized dashboard keys
    byWorkspace: (workspaceId: string) => 
      ['dashboards', 'workspace', workspaceId] as const,
    byUser: (userId: string) => 
      ['dashboards', 'user', userId] as const,
    templates: () => 
      ['dashboards', 'templates'] as const,
    shared: () => 
      ['dashboards', 'shared'] as const,
    widgets: (dashboardId: string) => 
      ['dashboards', dashboardId, 'widgets'] as const,
    widget: (dashboardId: string, widgetId: string) => 
      ['dashboards', dashboardId, 'widgets', widgetId] as const,
  },

  // Data source operations
  dataSources: {
    ...createQueryKeyFactory('dataSources'),
    // Specialized data source keys
    byType: (type: string) => 
      ['dataSources', 'type', type] as const,
    connectionStatus: (id: string) => 
      ['dataSources', id, 'status'] as const,
    data: (id: string, query?: Record<string, unknown>) => 
      ['dataSources', id, 'data', query] as const,
    schema: (id: string) => 
      ['dataSources', id, 'schema'] as const,
  },

  // Authentication operations
  auth: {
    user: () => ['auth', 'user'] as const,
    profile: () => ['auth', 'profile'] as const,
    permissions: (workspaceId?: string) => 
      ['auth', 'permissions', workspaceId] as const,
    session: () => ['auth', 'session'] as const,
  },

  // Analytics operations
  analytics: {
    ...createQueryKeyFactory('analytics'),
    // Time-based analytics keys
    timeRange: (startDate: string, endDate: string) => 
      ['analytics', 'timeRange', startDate, endDate] as const,
    metrics: (dataSourceId: string, metrics: string[]) => 
      ['analytics', 'metrics', dataSourceId, metrics.sort()] as const,
    dimensions: (dataSourceId: string, dimensions: string[]) => 
      ['analytics', 'dimensions', dataSourceId, dimensions.sort()] as const,
    query: (queryId: string, params?: Record<string, unknown>) => 
      ['analytics', 'query', queryId, params] as const,
  },

  // Organization & workspace operations
  organizations: {
    ...createQueryKeyFactory('organizations'),
    current: () => ['organizations', 'current'] as const,
    members: (orgId: string) => 
      ['organizations', orgId, 'members'] as const,
    settings: (orgId: string) => 
      ['organizations', orgId, 'settings'] as const,
  },

  workspaces: {
    ...createQueryKeyFactory('workspaces'),
    byOrganization: (orgId: string) => 
      ['workspaces', 'organization', orgId] as const,
    members: (workspaceId: string) => 
      ['workspaces', workspaceId, 'members'] as const,
    settings: (workspaceId: string) => 
      ['workspaces', workspaceId, 'settings'] as const,
  },

  // Cache management utilities
  cache: {
    metrics: () => ['cache', 'metrics'] as const,
    health: () => ['cache', 'health'] as const,
    size: () => ['cache', 'size'] as const,
  },
} as const;

// Type helpers for query keys
export type QueryKeys = typeof queryKeys;
export type DashboardQueryKeys = typeof queryKeys.dashboards;
export type DataSourceQueryKeys = typeof queryKeys.dataSources;
export type AuthQueryKeys = typeof queryKeys.auth;

/**
 * Utility function to invalidate related queries efficiently
 * Groups related query keys for batch invalidation
 */
export const getRelatedQueryKeys = {
  // When dashboard is updated, invalidate these related keys
  dashboard: (dashboardId: string) => [
    queryKeys.dashboards.detail(dashboardId),
    queryKeys.dashboards.lists(),
    queryKeys.dashboards.widgets(dashboardId),
  ],

  // When user logs in/out, invalidate these keys
  userAuth: () => [
    queryKeys.auth.user(),
    queryKeys.auth.profile(),
    queryKeys.auth.session(),
    queryKeys.dashboards.lists(),
    queryKeys.organizations.current(),
  ],

  // When data source is updated, invalidate related queries
  dataSource: (dataSourceId: string) => [
    queryKeys.dataSources.detail(dataSourceId),
    queryKeys.dataSources.lists(),
    queryKeys.dataSources.connectionStatus(dataSourceId),
    queryKeys.analytics.all(),
  ],

  // When workspace changes, invalidate workspace-related data
  workspace: (workspaceId: string) => [
    queryKeys.workspaces.detail(workspaceId),
    queryKeys.workspaces.members(workspaceId),
    queryKeys.dashboards.byWorkspace(workspaceId),
    queryKeys.dataSources.lists(),
  ],
} as const;

/**
 * Query key validation utilities for development
 * Helps catch query key issues early
 */
export const validateQueryKey = (key: unknown[]): boolean => {
  // Query keys should always be arrays
  if (!Array.isArray(key)) return false;
  
  // First element should be a string (domain)
  if (typeof key[0] !== 'string') return false;
  
  // Should not contain undefined values
  if (key.some(item => item === undefined)) return false;
  
  // Should have reasonable length (avoid overly complex keys)
  if (key.length > 6) return false;
  
  return true;
};

/**
 * Development utility to log query key usage
 * Helps identify query key patterns and potential optimizations
 */
export const debugQueryKey = (key: unknown[], operation: string): void => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug(`[Query Key Debug] ${operation}:`, key);
    
    if (!validateQueryKey(key)) {
      // eslint-disable-next-line no-console
      console.warn(`[Query Key Warning] Invalid query key structure:`, key);
    }
  }
};