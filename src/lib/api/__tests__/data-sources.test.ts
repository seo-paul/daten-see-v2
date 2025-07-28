/**
 * Data Sources API Service Tests
 * Testing data source CRUD operations and analytics queries
 */

import type { DataSource, DataSourceType, AnalyticsQuery } from '@/types';

import { DataSourceService, AnalyticsService } from '../data-sources';
import { apiClient } from '../index';

// Mock the API client
jest.mock('../index', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  createQueryFunction: (fn: Function) => fn,
}));

describe('DataSourceService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDataSources', () => {
    const mockDataSources: DataSource[] = [
      {
        id: 'ds-1',
        name: 'Production Database',
        type: 'postgresql',
        status: 'connected',
        workspaceId: 'ws-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        config: {
          host: 'db.example.com',
          port: 5432,
          database: 'production',
        },
      },
      {
        id: 'ds-2',
        name: 'Analytics API',
        type: 'rest-api',
        status: 'connected',
        workspaceId: 'ws-1',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-20'),
        config: {
          baseUrl: 'https://api.analytics.com',
          authType: 'bearer',
        },
      },
    ];

    it('should get all data sources without workspace filter', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockDataSources);

      const result = await DataSourceService.getDataSources();

      expect(mockApiClient.get).toHaveBeenCalledWith('/data-sources');
      expect(result).toEqual(mockDataSources);
    });

    it('should get data sources filtered by workspace', async () => {
      mockApiClient.get.mockResolvedValueOnce([mockDataSources[0]]);

      const result = await DataSourceService.getDataSources('ws-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/data-sources?workspaceId=ws-1');
      expect(result).toHaveLength(1);
      expect(result[0].workspaceId).toBe('ws-1');
    });

    it('should handle empty data sources', async () => {
      mockApiClient.get.mockResolvedValueOnce([]);

      const result = await DataSourceService.getDataSources();

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(DataSourceService.getDataSources()).rejects.toThrow('Network error');
    });
  });

  describe('getDataSource', () => {
    const mockDataSource: DataSource = {
      id: 'ds-1',
      name: 'Production Database',
      type: 'postgresql',
      status: 'connected',
      workspaceId: 'ws-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      config: {
        host: 'db.example.com',
        port: 5432,
        database: 'production',
      },
    };

    it('should get single data source by ID', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockDataSource);

      const result = await DataSourceService.getDataSource('ds-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/data-sources/ds-1');
      expect(result).toEqual(mockDataSource);
    });

    it('should handle not found error', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Data source not found'));

      await expect(DataSourceService.getDataSource('non-existent')).rejects.toThrow('Data source not found');
    });
  });

  describe('createDataSource', () => {
    const createRequest = {
      name: 'New Data Source',
      type: 'mysql' as DataSourceType,
      config: {
        host: 'localhost',
        port: 3306,
        database: 'test_db',
        username: 'test_user',
      },
      workspaceId: 'ws-1',
    };

    const mockCreatedDataSource: DataSource = {
      id: 'ds-new',
      ...createRequest,
      status: 'connecting',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create new data source', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: mockCreatedDataSource,
      });

      const result = await DataSourceService.createDataSource(createRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/data-sources', createRequest);
      expect(result).toEqual(mockCreatedDataSource);
    });

    it('should handle creation failure', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        success: false,
        message: 'Invalid configuration',
      });

      await expect(DataSourceService.createDataSource(createRequest))
        .rejects.toThrow('Invalid configuration');
    });

    it('should handle generic creation error', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        success: false,
      });

      await expect(DataSourceService.createDataSource(createRequest))
        .rejects.toThrow('Failed to create data source');
    });

    it('should create data source without workspace', async () => {
      const requestWithoutWorkspace = {
        name: 'Global Data Source',
        type: 'rest-api' as DataSourceType,
        config: {
          baseUrl: 'https://api.example.com',
        },
      };

      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: {
          id: 'ds-global',
          ...requestWithoutWorkspace,
          status: 'connected',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await DataSourceService.createDataSource(requestWithoutWorkspace);

      expect(result.workspaceId).toBeUndefined();
    });
  });

  describe('updateDataSource', () => {
    const updateRequest = {
      name: 'Updated Database',
      config: {
        host: 'new-db.example.com',
      },
    };

    const mockUpdatedDataSource: DataSource = {
      id: 'ds-1',
      name: 'Updated Database',
      type: 'postgresql',
      status: 'connected',
      workspaceId: 'ws-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      config: {
        host: 'new-db.example.com',
        port: 5432,
        database: 'production',
      },
    };

    it('should update data source', async () => {
      mockApiClient.put.mockResolvedValueOnce({
        success: true,
        data: mockUpdatedDataSource,
      });

      const result = await DataSourceService.updateDataSource('ds-1', updateRequest);

      expect(mockApiClient.put).toHaveBeenCalledWith('/data-sources/ds-1', updateRequest);
      expect(result).toEqual(mockUpdatedDataSource);
    });

    it('should update only name', async () => {
      const nameOnlyUpdate = { name: 'Renamed Database' };
      
      mockApiClient.put.mockResolvedValueOnce({
        success: true,
        data: { ...mockUpdatedDataSource, name: 'Renamed Database' },
      });

      const result = await DataSourceService.updateDataSource('ds-1', nameOnlyUpdate);

      expect(mockApiClient.put).toHaveBeenCalledWith('/data-sources/ds-1', nameOnlyUpdate);
      expect(result.name).toBe('Renamed Database');
    });

    it('should handle update failure', async () => {
      mockApiClient.put.mockResolvedValueOnce({
        success: false,
        message: 'Connection failed with new config',
      });

      await expect(DataSourceService.updateDataSource('ds-1', updateRequest))
        .rejects.toThrow('Connection failed with new config');
    });
  });

  describe('deleteDataSource', () => {
    it('should delete data source', async () => {
      mockApiClient.delete.mockResolvedValueOnce({ success: true });

      await expect(DataSourceService.deleteDataSource('ds-1')).resolves.not.toThrow();

      expect(mockApiClient.delete).toHaveBeenCalledWith('/data-sources/ds-1');
    });

    it('should handle delete error', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Cannot delete active data source'));

      await expect(DataSourceService.deleteDataSource('ds-1'))
        .rejects.toThrow('Cannot delete active data source');
    });
  });

  describe('testConnection', () => {
    it('should test successful connection', async () => {
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

    it('should test failed connection', async () => {
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

    it('should handle test API error', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('API error'));

      await expect(DataSourceService.testConnection('ds-1')).rejects.toThrow('API error');
    });
  });

  describe('AnalyticsService.query', () => {
    const mockQuery: AnalyticsQuery = {
      dataSourceId: 'ds-1',
      query: 'SELECT * FROM users LIMIT 10',
      parameters: {},
    };

    const mockResponse = {
      success: true,
      data: {
        rows: [
          { id: 1, name: 'User 1', email: 'user1@example.com' },
          { id: 2, name: 'User 2', email: 'user2@example.com' },
        ],
        metadata: {
          columns: ['id', 'name', 'email'],
          rowCount: 2,
          executionTime: 45,
        },
      },
    };

    it('should execute query successfully', async () => {
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await AnalyticsService.query(mockQuery);

      expect(mockApiClient.post).toHaveBeenCalledWith('/analytics/query', mockQuery);
      expect(result).toEqual(mockResponse.data);
    });

    it('should execute query with parameters', async () => {
      const queryWithParams = {
        ...mockQuery,
        parameters: {
          userId: 123,
          startDate: '2024-01-01',
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      await AnalyticsService.query(queryWithParams);

      expect(mockApiClient.post).toHaveBeenCalledWith('/analytics/query', queryWithParams);
    });

    it('should handle query execution error', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        success: false,
        message: 'Syntax error in SQL query',
      });

      await expect(AnalyticsService.query(mockQuery))
        .rejects.toThrow('Syntax error in SQL query');
    });

    it('should handle empty query results', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: {
          rows: [],
          metadata: {
            columns: [],
            rowCount: 0,
            executionTime: 10,
          },
        },
      });

      const result = await AnalyticsService.query(mockQuery);

      expect(result.rows).toHaveLength(0);
      expect(result.metadata.rowCount).toBe(0);
    });
  });

  describe('getAvailableMetrics and getAvailableDimensions', () => {
    const mockMetrics = ['revenue', 'users', 'sessions', 'pageviews'];
    const mockDimensions = ['country', 'device', 'browser', 'page'];

    it('should get available metrics', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockMetrics);

      const result = await DataSourceService.getAvailableMetrics('ds-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/data-sources/ds-1/metrics');
      expect(result).toEqual(mockMetrics);
    });

    it('should get available dimensions', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockDimensions);

      const result = await DataSourceService.getAvailableDimensions('ds-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/data-sources/ds-1/dimensions');
      expect(result).toEqual(mockDimensions);
    });
  });
});