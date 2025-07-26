/**
 * Type Integration Smoke Tests
 * Quick validation that our types work across the app
 */

import { describe, it, expect } from '@jest/globals';

import { ApiClient } from '@/lib/api';
import { DashboardService } from '@/lib/api/dashboard';
import type { Dashboard, DataSource, AnalyticsQuery } from '@/types';
import { isDashboard, apiQueryKeys } from '@/types';

describe('Type Integration Smoke Tests', () => {
  it('should import all types without errors', () => {
    // This test validates that our type exports work
    expect(typeof apiQueryKeys).toBe('object');
    expect(typeof isDashboard).toBe('function');
    expect(typeof ApiClient).toBe('function');
    expect(typeof DashboardService).toBe('function'); // DashboardService is a class/constructor function
  });

  it('should create properly typed objects', () => {
    const dashboard: Dashboard = {
      id: 'test-123',
      title: 'Test Dashboard',
      description: 'Test description',
      widgets: [
        {
          id: 'widget-1',
          type: 'chart',
          title: 'Test Chart',
          config: {
            chartType: 'line',
            metrics: ['sessions'],
            timeRange: {
              start: '2024-01-01',
              end: '2024-01-31',
              preset: 'last30days',
            },
          },
          position: { x: 0, y: 0, w: 6, h: 4 },
          dataSource: 'ga-source-1',
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isPublic: false,
      owner: 'user-123',
      organizationId: 'org-123',
      workspaceId: 'workspace-123',
    };

    expect(dashboard.id).toBe('test-123');
    expect(dashboard.widgets).toHaveLength(1);
    expect(dashboard.widgets[0]?.type).toBe('chart');
  });

  it('should validate data source types', () => {
    const googleDataSource: DataSource = {
      id: 'ga-1',
      name: 'Google Analytics',
      type: 'google_analytics',
      config: {
        accountId: 'acc-123',
        propertyId: 'prop-456',
      },
      status: 'connected',
      organizationId: 'org-123',
    };

    const metaDataSource: DataSource = {
      id: 'meta-1',
      name: 'Meta Ads',
      type: 'meta_ads',
      config: {
        appId: 'app-123',
        accessToken: 'token-456',
      },
      status: 'connected',
      organizationId: 'org-123',
    };

    expect(googleDataSource.type).toBe('google_analytics');
    expect(metaDataSource.type).toBe('meta_ads');
  });

  it('should create valid analytics queries', () => {
    const query: AnalyticsQuery = {
      dataSource: 'ga-source-1',
      metrics: ['sessions', 'pageviews'],
      dimensions: ['date', 'country'],
      filters: [
        {
          field: 'country',
          operator: 'equals',
          value: 'United States',
        },
      ],
      timeRange: {
        start: '2024-01-01',
        end: '2024-01-31',
        preset: 'last30days',
      },
      limit: 100,
    };

    expect(query.metrics).toContain('sessions');
    expect(query.filters?.[0]?.operator).toBe('equals');
  });

  it('should generate correct query keys', () => {
    const dashboardKeys = apiQueryKeys.dashboards;
    const dashboardDetail = apiQueryKeys.dashboard('test-123');
    const widgetKeys = apiQueryKeys.dashboardWidgets('test-123');

    expect(dashboardKeys).toEqual(['dashboards']);
    expect(dashboardDetail).toEqual(['dashboards', 'test-123']);
    expect(widgetKeys).toEqual(['dashboards', 'test-123', 'widgets']);
  });
});