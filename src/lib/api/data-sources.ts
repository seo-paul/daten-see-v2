/**
 * Data Sources API Service
 * Type-safe data source operations
 */

import type {
  DataSource,
  DataSourceType,
  DataSourceConfig,
  AnalyticsQuery,
  AnalyticsResponse,
} from '@/types';

import { apiClient, createQueryFunction } from './index';

/**
 * Data Source Service Class
 */
export class DataSourceService {
  /**
   * Get all data sources for workspace
   */
  static async getDataSources(workspaceId?: string): Promise<DataSource[]> {
    const endpoint = workspaceId 
      ? `/data-sources?workspaceId=${workspaceId}`
      : '/data-sources';
    
    return createQueryFunction(() => 
      apiClient.get<DataSource[]>(endpoint)
    )();
  }

  /**
   * Get single data source
   */
  static async getDataSource(id: string): Promise<DataSource> {
    return createQueryFunction(() => 
      apiClient.get<DataSource>(`/data-sources/${id}`)
    )();
  }

  /**
   * Create new data source
   */
  static async createDataSource(data: {
    name: string;
    type: DataSourceType;
    config: DataSourceConfig;
    workspaceId?: string;
  }): Promise<DataSource> {
    const response = await apiClient.post<DataSource, typeof data>(
      '/data-sources',
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create data source');
    }
    
    return response.data;
  }

  /**
   * Update data source
   */
  static async updateDataSource(
    id: string,
    data: {
      name?: string;
      config?: Partial<DataSourceConfig>;
    }
  ): Promise<DataSource> {
    const response = await apiClient.put<DataSource, typeof data>(
      `/data-sources/${id}`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update data source');
    }
    
    return response.data;
  }

  /**
   * Delete data source
   */
  static async deleteDataSource(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`/data-sources/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete data source');
    }
  }

  /**
   * Test data source connection
   */
  static async testConnection(id: string): Promise<{ connected: boolean; error?: string }> {
    const response = await apiClient.post<{ connected: boolean; error?: string }>(
      `/data-sources/${id}/test`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to test connection');
    }
    
    return response.data;
  }

  /**
   * Sync data source (refresh data)
   */
  static async syncDataSource(id: string): Promise<{ success: boolean; lastSync: string }> {
    const response = await apiClient.post<{ success: boolean; lastSync: string }>(
      `/data-sources/${id}/sync`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to sync data source');
    }
    
    return response.data;
  }

  /**
   * Get available metrics for data source
   */
  static async getAvailableMetrics(id: string): Promise<string[]> {
    return createQueryFunction(() => 
      apiClient.get<string[]>(`/data-sources/${id}/metrics`)
    )();
  }

  /**
   * Get available dimensions for data source
   */
  static async getAvailableDimensions(id: string): Promise<string[]> {
    return createQueryFunction(() => 
      apiClient.get<string[]>(`/data-sources/${id}/dimensions`)
    )();
  }
}

/**
 * Analytics Service Class
 */
export class AnalyticsService {
  /**
   * Execute analytics query
   */
  static async query(query: AnalyticsQuery): Promise<AnalyticsResponse> {
    const response = await apiClient.post<AnalyticsResponse, AnalyticsQuery>(
      '/analytics/query',
      query
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Analytics query failed');
    }
    
    return response.data;
  }

  /**
   * Get cached query result
   */
  static async getCachedQuery(queryHash: string): Promise<AnalyticsResponse | null> {
    try {
      return createQueryFunction(() => 
        apiClient.get<AnalyticsResponse>(`/analytics/cache/${queryHash}`)
      )();
    } catch {
      return null; // Cache miss
    }
  }

  /**
   * Execute multiple queries in batch
   */
  static async batchQuery(queries: AnalyticsQuery[]): Promise<AnalyticsResponse[]> {
    const response = await apiClient.post<AnalyticsResponse[], AnalyticsQuery[]>(
      '/analytics/batch',
      queries
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Batch query failed');
    }
    
    return response.data;
  }

  /**
   * Get query suggestions based on data source
   */
  static async getQuerySuggestions(dataSourceId: string): Promise<{
    metrics: string[];
    dimensions: string[];
    commonQueries: AnalyticsQuery[];
  }> {
    return createQueryFunction(() => 
      apiClient.get<{
        metrics: string[];
        dimensions: string[];
        commonQueries: AnalyticsQuery[];
      }>(`/analytics/suggestions/${dataSourceId}`)
    )();
  }
}

/**
 * Google APIs Service Class
 */
export class GoogleApiService {
  /**
   * Get Google Analytics accounts
   */
  static async getAnalyticsAccounts(): Promise<Array<{
    id: string;
    name: string;
    properties: Array<{ id: string; name: string }>;
  }>> {
    return createQueryFunction(() => 
      apiClient.get<Array<{
        id: string;
        name: string;
        properties: Array<{ id: string; name: string }>;
      }>>('/google/analytics/accounts')
    )();
  }

  /**
   * Get Google Ads accounts
   */
  static async getAdsAccounts(): Promise<Array<{
    id: string;
    name: string;
    currency: string;
  }>> {
    return createQueryFunction(() => 
      apiClient.get<Array<{
        id: string;
        name: string;
        currency: string;
      }>>('/google/ads/accounts')
    )();
  }

  /**
   * Authorize Google services
   */
  static async authorizeGoogle(scopes: string[]): Promise<{ authUrl: string }> {
    const response = await apiClient.post<{ authUrl: string }, { scopes: string[] }>(
      '/google/auth',
      { scopes }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to get Google auth URL');
    }
    
    return response.data;
  }

  /**
   * Handle Google OAuth callback
   */
  static async handleGoogleCallback(code: string, state: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }, { code: string; state: string }>(
      '/google/callback',
      { code, state }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to handle Google callback');
    }
    
    return response.data;
  }
}

// Export services
export { 
  DataSourceService as dataSourceApi, 
  AnalyticsService as analyticsApi,
  GoogleApiService as googleApi,
};