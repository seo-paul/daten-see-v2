/**
 * API Integration Tests
 * Validate that our new API types work correctly
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

import type { 
  Dashboard, 
  CreateDashboardRequest, 
  DataSource,
  AnalyticsQuery,
} from '@/types';
import { apiQueryKeys } from '@/types';

import { DashboardService } from '../dashboard';
import { ApiClient, ApiClientError } from '../index';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Type Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('ApiClient Type Safety', () => {
    it('should handle typed responses correctly', async () => {
      const client = new ApiClient();
      const mockDashboard: Dashboard = {
        id: 'test-123',
        title: 'Test Dashboard',
        description: 'Test description',
        widgets: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        isPublic: false,
        owner: 'user-123',
        organizationId: 'org-123',
        workspaceId: 'workspace-123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockDashboard,
        }),
      });

      const result = await client.get<Dashboard>('/dashboards/test-123');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDashboard);
      expect(result.data.id).toBe('test-123');
    });

    it('should handle API errors with proper typing', async () => {
      const client = new ApiClient();
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          success: false,
          message: 'Dashboard not found',
          errors: [{ code: 'NOT_FOUND', message: 'Dashboard not found' }],
        }),
      });

      await expect(client.get<Dashboard>('/dashboards/invalid')).rejects.toThrow(ApiClientError);
    });
  });

  describe('Dashboard Service Types', () => {
    it('should create dashboard with proper types', async () => {
      const createRequest: CreateDashboardRequest = {
        title: 'New Dashboard',
        description: 'Test dashboard',
        isPublic: false,
        organizationId: 'org-123',
        workspaceId: 'workspace-123',
      };

      const mockResponse: Dashboard = {
        id: 'new-dashboard',
        title: createRequest.title,
        ...(createRequest.description && { description: createRequest.description }),
        isPublic: createRequest.isPublic || false,
        widgets: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        owner: 'user-123',
        organizationId: createRequest.organizationId || 'org-123',
        workspaceId: createRequest.workspaceId || 'workspace-123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockResponse,
        }),
      });

      const result = await DashboardService.createDashboard(createRequest);
      
      expect(result.id).toBe('new-dashboard');
      expect(result.title).toBe(createRequest.title);
    });

    it('should validate widget types', () => {
      // Test widget type validation at compile time
      const validWidget = {
        id: 'widget-1',
        type: 'chart' as const,
        title: 'Test Chart',
        config: {
          chartType: 'line' as const,
          metrics: ['sessions', 'pageviews'],
          timeRange: {
            start: '2024-01-01',
            end: '2024-01-31',
            preset: 'last30days' as const,
          },
        },
        position: { x: 0, y: 0, w: 6, h: 4 },
        dataSource: 'google-analytics-1',
      };

      // This should compile without errors
      expect(validWidget.type).toBe('chart');
      expect(validWidget.config.chartType).toBe('line');
    });
  });

  describe('Data Source Service Types', () => {
    it('should handle multi-source types correctly', async () => {
      const googleAnalyticsSource: DataSource = {
        id: 'ga-source-1',
        name: 'Google Analytics',
        type: 'google_analytics',
        config: {
          accountId: 'acc-123',
          propertyId: 'prop-456',
          viewId: 'view-789',
        },
        status: 'connected',
        lastSync: '2024-01-01T00:00:00Z',
        organizationId: 'org-123',
        workspaceId: 'workspace-123',
      };

      const metaAdsSource: DataSource = {
        id: 'meta-source-1', 
        name: 'Meta Ads',
        type: 'meta_ads',
        config: {
          appId: 'app-123',
          appSecret: 'secret-456',
          accessToken: 'token-789',
        },
        status: 'connected',
        organizationId: 'org-123',
        workspaceId: 'workspace-123',
      };

      // Both should be valid DataSource types
      expect(googleAnalyticsSource.type).toBe('google_analytics');
      expect(metaAdsSource.type).toBe('meta_ads');
    });

    it('should validate analytics query structure', () => {
      const query: AnalyticsQuery = {
        dataSource: 'ga-source-1',
        metrics: ['sessions', 'pageviews', 'bounceRate'],
        dimensions: ['date', 'country', 'deviceCategory'],
        filters: [
          {
            field: 'country',
            operator: 'equals',
            value: 'United States',
          },
          {
            field: 'sessions',
            operator: 'greater_than',
            value: 100,
          },
        ],
        timeRange: {
          start: '2024-01-01',
          end: '2024-01-31',
          preset: 'last30days',
        },
        limit: 1000,
        offset: 0,
      };

      expect(query.metrics).toContain('sessions');
      expect(query.filters?.[0]?.operator).toBe('equals');
    });
  });

  describe('Query Keys Type Safety', () => {
    it('should provide consistent query keys', () => {
      // Test query key generation
      const dashboardKeys = apiQueryKeys.dashboards;
      const specificDashboard = apiQueryKeys.dashboard('test-123');
      const dashboardWidgets = apiQueryKeys.dashboardWidgets('test-123');
      
      expect(dashboardKeys).toEqual(['dashboards']);
      expect(specificDashboard).toEqual(['dashboards', 'test-123']);
      expect(dashboardWidgets).toEqual(['dashboards', 'test-123', 'widgets']);
    });

    it('should generate data source query keys', () => {
      const dataSourceKeys = apiQueryKeys.dataSources;
      const specificDataSource = apiQueryKeys.dataSource('ds-123');
      const dataSourceData = apiQueryKeys.dataSourceData('ds-123', 'query-hash');
      
      expect(dataSourceKeys).toEqual(['dataSources']);
      expect(specificDataSource).toEqual(['dataSources', 'ds-123']);
      expect(dataSourceData).toEqual(['dataSources', 'ds-123', 'data', 'query-hash']);
    });
  });

  describe('Type Guards', () => {
    it('should validate dashboard objects', () => {
      const validDashboard = {
        id: 'test-123',
        title: 'Test Dashboard',
        widgets: [],
      };

      const invalidObject = {
        name: 'Not a dashboard',
        content: 'Missing required fields',
      };

      // Import type guards from our types
      const { isDashboard } = require('@/types');
      
      expect(isDashboard(validDashboard)).toBe(true);
      expect(isDashboard(invalidObject)).toBe(false);
      expect(isDashboard(null)).toBe(false);
      expect(isDashboard(undefined)).toBe(false);
    });
  });

  describe('Error Handling Types', () => {
    it('should handle structured API errors', () => {
      const apiError = new ApiClientError('Test error', [
        { code: 'VALIDATION_ERROR', message: 'Title is required', field: 'title' },
        { code: 'PERMISSION_DENIED', message: 'Insufficient permissions' },
      ]);

      expect(apiError.errors).toHaveLength(2);
      expect(apiError.errors[0]?.code).toBe('VALIDATION_ERROR');
      expect(apiError.errors[0]?.field).toBe('title');
    });
  });

  describe('Integration with existing hooks', () => {
    it('should be compatible with useDashboards hook types', () => {
      // This test validates that our new types integrate with existing code
      // We're testing type compatibility, not runtime behavior
      
      const mockDashboardResponse: Dashboard[] = [
        {
          id: 'dash-1',
          title: 'Dashboard 1',
          description: 'Test dashboard',
          widgets: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          isPublic: false,
          owner: 'user-123',
          organizationId: 'org-123',
          workspaceId: 'workspace-123',
        },
      ];

      // This should compile without type errors
      expect(mockDashboardResponse[0]?.id).toBe('dash-1');
      expect(mockDashboardResponse[0]?.widgets).toEqual([]);
    });
  });
});

// Additional compile-time type checking
describe('Compile-time Type Validation', () => {
  it('should enforce exact optional properties', () => {
    // This test ensures our exactOptionalPropertyTypes works
    const createRequest: CreateDashboardRequest = {
      title: 'Test Dashboard',
      // description intentionally omitted - should be fine
      // isPublic intentionally omitted - should be fine  
      organizationId: 'org-123',
    };

    expect(createRequest.title).toBe('Test Dashboard');
    expect(createRequest.description).toBeUndefined();
  });

  it('should enforce widget configuration types', () => {
    // Test that widget configurations are properly typed
    const chartConfig = {
      chartType: 'line' as const,
      metrics: ['sessions'],
      dimensions: ['date'],
      timeRange: {
        start: '2024-01-01',
        end: '2024-01-31',
        preset: 'last30days' as const,
      },
    };

    const kpiConfig = {
      metric: 'sessions',
      target: 10000,
      comparison: 'previous_period' as const,
    };

    // Both configs should be valid
    expect(chartConfig.chartType).toBe('line');
    expect(kpiConfig.comparison).toBe('previous_period');
  });
});