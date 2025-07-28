/**
 * Central API Type Definitions
 * Generated and maintained types for all API endpoints
 */

// ===== DASHBOARD TYPES =====
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  owner: string;
  organizationId?: string;
  workspaceId?: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'kpi' | 'text' | 'table' | 'filter';
  title: string;
  config: WidgetConfig;
  position: WidgetPosition;
  dataSource?: string;
  refreshInterval?: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetConfig {
  // Chart specific
  chartType?: 'line' | 'bar' | 'doughnut' | 'scatter';
  metrics?: string[];
  dimensions?: string[];
  timeRange?: TimeRange;
  
  // KPI specific
  metric?: string;
  target?: number;
  comparison?: 'previous_period' | 'target' | 'benchmark';
  
  // Text specific
  content?: string;
  markdown?: boolean;
  
  // Table specific
  columns?: TableColumn[];
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Filter specific
  filterType?: 'date' | 'select' | 'multiselect' | 'range';
  filterOptions?: FilterOption[];
}

export interface TableColumn {
  id: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sortable?: boolean;
  filterable?: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
  selected?: boolean;
}

export interface TimeRange {
  start: string;
  end: string;
  preset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last90days' | 'custom';
}

// ===== REQUEST/RESPONSE TYPES =====
export interface CreateDashboardRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  organizationId?: string;
  workspaceId?: string;
}

export interface UpdateDashboardRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  widgets?: DashboardWidget[];
}

export interface CreateWidgetRequest {
  dashboardId: string;
  type: DashboardWidget['type'];
  title: string;
  config: WidgetConfig;
  position: WidgetPosition;
  dataSource?: string;
}

export interface UpdateWidgetRequest {
  title?: string;
  config?: Partial<WidgetConfig>;
  position?: Partial<WidgetPosition>;
  dataSource?: string;
}

// ===== DATA SOURCE TYPES =====
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  config: DataSourceConfig;
  status: 'connected' | 'error' | 'pending' | 'disconnected';
  lastSync?: string;
  organizationId: string;
  workspaceId?: string;
}

export type DataSourceType = 
  | 'google_analytics' 
  | 'google_ads' 
  | 'meta_ads' 
  | 'csv_upload' 
  | 'rest_api' 
  | 'google_my_business';

export interface DataSourceConfig {
  // Google Analytics & Ads
  accountId?: string;
  propertyId?: string;
  viewId?: string;
  customerId?: string;
  
  // Meta Ads
  appId?: string;
  appSecret?: string;
  accessToken?: string;
  
  // CSV Upload
  fileName?: string;
  fileSize?: number;
  columns?: DataColumn[];
  refreshSchedule?: 'manual' | 'daily' | 'weekly' | 'monthly';
  
  // REST API
  baseUrl?: string;
  authType?: 'none' | 'bearer' | 'basic' | 'api_key';
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
}

export interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  nullable?: boolean;
  unique?: boolean;
}

// ===== ANALYTICS DATA TYPES =====
export interface AnalyticsData {
  dimensions: Record<string, string>;
  metrics: Record<string, number>;
  timestamp?: string;
}

export interface AnalyticsQuery {
  dataSource: string;
  metrics: string[];
  dimensions?: string[];
  filters?: AnalyticsFilter[];
  timeRange: TimeRange;
  limit?: number;
  offset?: number;
}

export interface AnalyticsFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | (string | number)[];
}

export interface AnalyticsResponse {
  data: AnalyticsData[];
  totalRows: number;
  query: AnalyticsQuery;
  executionTime: number;
  cached: boolean;
}

// ===== AUTH & USER TYPES =====
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  organizationId?: string;
  workspaces: WorkspaceMembership[];
  createdAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  memberCount: number;
  createdAt: string;
  settings: OrganizationSettings;
}

export interface OrganizationSettings {
  allowGuestAccess: boolean;
  dataRetentionDays: number;
  maxDataSources: number;
  maxDashboards: number;
  customBranding: boolean;
  ssoEnabled: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  memberCount: number;
  dashboardCount: number;
  dataSourceCount: number;
  createdAt: string;
}

export interface WorkspaceMembership {
  workspaceId: string;
  workspace: Workspace;
  role: UserRole;
  joinedAt: string;
}

// ===== API RESPONSE WRAPPERS =====
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== QUERY KEYS FOR TANSTACK QUERY =====
export const apiQueryKeys = {
  // Dashboards
  dashboards: ['dashboards'] as const,
  dashboard: (id: string) => ['dashboards', id] as const,
  dashboardWidgets: (id: string) => ['dashboards', id, 'widgets'] as const,
  
  // Data Sources
  dataSources: ['dataSources'] as const,
  dataSource: (id: string) => ['dataSources', id] as const,
  dataSourceData: (id: string, query: string) => ['dataSources', id, 'data', query] as const,
  
  // Analytics
  analytics: (query: AnalyticsQuery) => ['analytics', query] as const,
  
  // Organizations & Workspaces
  organization: (id: string) => ['organizations', id] as const,
  workspaces: (orgId: string) => ['organizations', orgId, 'workspaces'] as const,
  workspace: (id: string) => ['workspaces', id] as const,
  
  // User
  currentUser: ['user', 'current'] as const,
  userPermissions: (workspaceId: string) => ['user', 'permissions', workspaceId] as const,
} as const;

// ===== TYPE GUARDS =====
export function isDashboard(obj: unknown): obj is Dashboard {
  return typeof obj === 'object' && 
         obj !== null && 
         'id' in obj && 
         'name' in obj && 
         'widgets' in obj;
}

export function isAnalyticsData(obj: unknown): obj is AnalyticsData {
  return typeof obj === 'object' && 
         obj !== null && 
         'dimensions' in obj && 
         'metrics' in obj;
}

export function isApiError(obj: unknown): obj is ApiError {
  return typeof obj === 'object' && 
         obj !== null && 
         'code' in obj && 
         'message' in obj;
}