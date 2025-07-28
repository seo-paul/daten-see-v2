/**
 * Data Sources API Service Tests
 * Testing data source CRUD operations and analytics queries
 */

import type { DataSource, DataSourceType, AnalyticsQuery } from '@/types';

import { DataSourceService, AnalyticsService } from '../data-sources';
import { apiClient } from '../index';

// Mock the API client
jest.mock('../index', (): object => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  createQueryFunction: (fn: Function): (() => Promise<any>) => async (): Promise<any> => {
    const response = await fn();
    if (!response.success) {
      throw new Error(response.message || 'API request failed');
    }
    return response.data;
  },
}));

describe('DataSourceService', (): void => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach((): void => {
    jest.clearAllMocks();
  });

  describe('getDataSources', (): void => {
    const mockDataSources: DataSource[] = [
      {
        id: 'ds-1',
        name: 'Google Analytics',
        type: 'google_analytics',
        status: 'connected',
        organizationId: 'org-1',
        workspaceId: 'ws-1',
        lastSync: '2024-01-15T10:00:00Z',
        config: {
          accountId: '12345',
          propertyId: '67890',
          viewId: '11111',
        },
      },
      {
        id: 'ds-2',
        name: 'Analytics API',
        type: 'rest_api',
        status: 'connected',
        organizationId: 'org-1',
        workspaceId: 'ws-1',
        lastSync: '2024-01-20T10:00:00Z',
        config: {
          baseUrl: 'https://api.analytics.com',
          authType: 'bearer',
        },
      },
    ];

    it('should get all data sources without workspace filter', async (): Promise<void> => {
      const mockResponse = {
        data: mockDataSources,
        success: true,
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await DataSourceService.getDataSources();

      expect(mockApiClient.get).toHaveBeenCalledWith('/data-sources');
      expect(result).toEqual(mockDataSources);
    });

    it('should get data sources filtered by workspace', async (): Promise<void> => {
      const mockResponse = {
        data: [mockDataSources[0]],
        success: true,
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await DataSourceService.getDataSources('ws-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/data-sources?workspaceId=ws-1');
      expect(result).toHaveLength(1);
      expect(result[0]?.workspaceId).toBe('ws-1');
    });

    it('should handle empty data sources', async (): Promise<void> => {
      const mockResponse = {
        data: [],
        success: true,
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await DataSourceService.getDataSources();

      expect(result).toEqual([]);
    });

    it('should handle API errors', async (): Promise<void> => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(DataSourceService.getDataSources()).rejects.toThrow('Network error');
    });
  });

  describe('getDataSource', (): void => {
    const mockDataSource: DataSource = {
      id: 'ds-1',
      name: 'Production Database',
      type: 'rest_api',
      status: 'connected',
      organizationId: 'org-1',
      workspaceId: 'ws-1',
      config: {
        baseUrl: 'https://db.example.com',
        authType: 'bearer',
      },
    };

    it('should get single data source by ID', async (): Promise<void> => {
      const mockResponse = {
        data: mockDataSource,
        success: true,
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await DataSourceService.getDataSource('ds-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/data-sources/ds-1');
      expect(result).toEqual(mockDataSource);
    });

    it('should handle not found error', async (): Promise<void> => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Data source not found'));

      await expect(DataSourceService.getDataSource('non-existent')).rejects.toThrow('Data source not found');
    });
  });

  describe('createDataSource', (): void => {
    const createRequest = {
      name: 'New Data Source',
      type: 'rest_api' as DataSourceType,
      config: {
        baseUrl: 'https://localhost:3306',
        authType: 'bearer' as const,
      },
      workspaceId: 'ws-1',
    };

    const mockCreatedDataSource: DataSource = {
      id: 'ds-new',
      ...createRequest,
      organizationId: 'org-1',
      status: 'connected',
    };

    it('should create new data source', async (): Promise<void> => {
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: mockCreatedDataSource,
      });

      const result = await DataSourceService.createDataSource(createRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/data-sources', createRequest);
      expect(result).toEqual(mockCreatedDataSource);
    });

    it('should handle creation failure', async (): Promise<void> => {
      mockApiClient.post.mockResolvedValueOnce({
        data: null,
        success: false,
        message: 'Invalid configuration',
      });

      await expect(DataSourceService.createDataSource(createRequest))
        .rejects.toThrow('Invalid configuration');
    });

    it('should handle generic creation error', async (): Promise<void> => {
      mockApiClient.post.mockResolvedValueOnce({
        data: null,
        success: false,
        message: 'Failed to create data source',
      });

      await expect(DataSourceService.createDataSource(createRequest))
        .rejects.toThrow('Failed to create data source');
    });

    it('should create data source without workspace', async (): Promise<void> => {
      const requestWithoutWorkspace = {
        name: 'Global Data Source',
        type: 'rest_api' as DataSourceType,
        config: {
          baseUrl: 'https://api.example.com',
          authType: 'none' as const,
        },
      };

      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: {
          id: 'ds-global',
          ...requestWithoutWorkspace,
          organizationId: 'org-1',
          status: 'connected',
        },
      });

      const result = await DataSourceService.createDataSource(requestWithoutWorkspace);

      expect(result.workspaceId).toBeUndefined();
    });
  });

  describe('updateDataSource', (): void => {
    const updateRequest = {
      name: 'Updated Database',
      config: {
        baseUrl: 'https://new-db.example.com',
      },
    };

    const mockUpdatedDataSource: DataSource = {
      id: 'ds-1',
      name: 'Updated Database',
      type: 'rest_api',
      status: 'connected',
      organizationId: 'org-1',
      workspaceId: 'ws-1',
      config: {
        baseUrl: 'https://new-db.example.com',
        authType: 'bearer',
      },
    };

    it('should update data source', async (): Promise<void> => {
      mockApiClient.put.mockResolvedValueOnce({
        success: true,
        data: mockUpdatedDataSource,
      });

      const result = await DataSourceService.updateDataSource('ds-1', updateRequest);

      expect(mockApiClient.put).toHaveBeenCalledWith('/data-sources/ds-1', updateRequest);
      expect(result).toEqual(mockUpdatedDataSource);
    });

    it('should update only name', async (): Promise<void> => {
      const nameOnlyUpdate = { name: 'Renamed Database' };
      
      mockApiClient.put.mockResolvedValueOnce({
        success: true,
        data: { ...mockUpdatedDataSource, name: 'Renamed Database' },
      });

      const result = await DataSourceService.updateDataSource('ds-1', nameOnlyUpdate);

      expect(mockApiClient.put).toHaveBeenCalledWith('/data-sources/ds-1', nameOnlyUpdate);
      expect(result.name).toBe('Renamed Database');
    });

    it('should handle update failure', async (): Promise<void> => {
      mockApiClient.put.mockResolvedValueOnce({
        data: null,
        success: false,
        message: 'Connection failed with new config',
      });

      await expect(DataSourceService.updateDataSource('ds-1', updateRequest))
        .rejects.toThrow('Connection failed with new config');
    });
  });

  describe('deleteDataSource', (): void => {
    it('should delete data source', async (): Promise<void> => {
      mockApiClient.delete.mockResolvedValueOnce({ 
        data: undefined,
        success: true 
      });

      await expect(DataSourceService.deleteDataSource('ds-1')).resolves.not.toThrow();

      expect(mockApiClient.delete).toHaveBeenCalledWith('/data-sources/ds-1');
    });

    it('should handle delete error', async (): Promise<void> => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Cannot delete active data source'));

      await expect(DataSourceService.deleteDataSource('ds-1'))
        .rejects.toThrow('Cannot delete active data source');
    });
  });

  describe('testConnection', (): void => {
    it('should test successful connection', async (): Promise<void> => {
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: {
          connected: true,
        },
      });

      const result = await DataSourceService.testConnection('ds-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/data-sources/ds-1/test');
      expect(result).toEqual({
        connected: true,
      });
    });

    it('should test failed connection', async (): Promise<void> => {
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: {
          connected: false,
          error: 'ECONNREFUSED',
        },
      });

      const result = await DataSourceService.testConnection('ds-1');

      expect(result).toEqual({
        connected: false,
        error: 'ECONNREFUSED',
      });
    });

    it('should handle test API error', async (): Promise<void> => {
      mockApiClient.post.mockRejectedValueOnce(new Error('API error'));

      await expect(DataSourceService.testConnection('ds-1')).rejects.toThrow('API error');
    });
  });

  describe('AnalyticsService.query', (): void => {
    const mockQuery: AnalyticsQuery = {
      dataSource: 'ds-1',
      metrics: ['users', 'sessions'],
      dimensions: ['country', 'device'],
      timeRange: {
        start: '2024-01-01',
        end: '2024-01-31',
        preset: 'last30days',
      },
    };

    const mockResponse = {
      success: true,
      data: {
        data: [
          {
            dimensions: { country: 'US', device: 'desktop' },
            metrics: { users: 1000, sessions: 1500 },
            timestamp: '2024-01-01',
          },
          {
            dimensions: { country: 'DE', device: 'mobile' },
            metrics: { users: 800, sessions: 1200 },
            timestamp: '2024-01-02',
          },
        ],
        totalRows: 2,
        query: mockQuery,
        executionTime: 45,
        cached: false,
      },
    };

    it('should execute query successfully', async (): Promise<void> => {
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await AnalyticsService.query(mockQuery);

      expect(mockApiClient.post).toHaveBeenCalledWith('/analytics/query', mockQuery);
      expect(result).toEqual(mockResponse.data);
    });

    it('should execute query with filters', async (): Promise<void> => {
      const queryWithFilters = {
        ...mockQuery,
        filters: [
          {
            field: 'country',
            operator: 'equals' as const,
            value: 'US',
          },
        ],
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      await AnalyticsService.query(queryWithFilters);

      expect(mockApiClient.post).toHaveBeenCalledWith('/analytics/query', queryWithFilters);
    });

    it('should handle query execution error', async (): Promise<void> => {
      mockApiClient.post.mockResolvedValueOnce({
        data: null,
        success: false,
        message: 'Syntax error in SQL query',
      });

      await expect(AnalyticsService.query(mockQuery))
        .rejects.toThrow('Syntax error in SQL query');
    });

    it('should handle empty query results', async (): Promise<void> => {
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: {
          data: [],
          totalRows: 0,
          query: mockQuery,
          executionTime: 10,
          cached: false,
        },
      });

      const result = await AnalyticsService.query(mockQuery);

      expect(result.data).toHaveLength(0);
      expect(result.totalRows).toBe(0);
    });
  });

  describe('getAvailableMetrics and getAvailableDimensions', (): void => {
    const mockMetrics = ['revenue', 'users', 'sessions', 'pageviews'];
    const mockDimensions = ['country', 'device', 'browser', 'page'];

    it('should get available metrics', async (): Promise<void> => {
      const mockResponse = {
        data: mockMetrics,
        success: true,
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await DataSourceService.getAvailableMetrics('ds-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/data-sources/ds-1/metrics');
      expect(result).toEqual(mockMetrics);
    });

    it('should get available dimensions', async (): Promise<void> => {
      const mockResponse = {
        data: mockDimensions,
        success: true,
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await DataSourceService.getAvailableDimensions('ds-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/data-sources/ds-1/dimensions');
      expect(result).toEqual(mockDimensions);
    });
  });
});