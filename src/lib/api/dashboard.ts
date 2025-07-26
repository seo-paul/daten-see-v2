/**
 * Dashboard API Service
 * Type-safe dashboard operations
 */

import type {
  Dashboard,
  DashboardWidget,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  CreateWidgetRequest,
  UpdateWidgetRequest,
  PaginatedResponse,
} from '@/types';

import { apiClient, createQueryFunction } from './index';

/**
 * Dashboard Service Class
 */
export class DashboardService {
  /**
   * Get all dashboards for current user/workspace
   */
  static async getDashboards(workspaceId?: string): Promise<Dashboard[]> {
    const endpoint = workspaceId 
      ? `/dashboards?workspaceId=${workspaceId}`
      : '/dashboards';
    
    return createQueryFunction(() => 
      apiClient.get<Dashboard[]>(endpoint)
    )();
  }

  /**
   * Get paginated dashboards
   */
  static async getDashboardsPaginated(
    page = 1, 
    limit = 20, 
    workspaceId?: string
  ): Promise<PaginatedResponse<Dashboard>> {
    const endpoint = workspaceId 
      ? `/dashboards?workspaceId=${workspaceId}`
      : '/dashboards';
    
    return apiClient.getPaginated<Dashboard>(endpoint, page, limit);
  }

  /**
   * Get single dashboard by ID
   */
  static async getDashboard(id: string): Promise<Dashboard> {
    return createQueryFunction(() => 
      apiClient.get<Dashboard>(`/dashboards/${id}`)
    )();
  }

  /**
   * Create new dashboard
   */
  static async createDashboard(data: CreateDashboardRequest): Promise<Dashboard> {
    const response = await apiClient.post<Dashboard, CreateDashboardRequest>(
      '/dashboards', 
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create dashboard');
    }
    
    return response.data;
  }

  /**
   * Update existing dashboard
   */
  static async updateDashboard(
    id: string, 
    data: UpdateDashboardRequest
  ): Promise<Dashboard> {
    const response = await apiClient.put<Dashboard, UpdateDashboardRequest>(
      `/dashboards/${id}`, 
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update dashboard');
    }
    
    return response.data;
  }

  /**
   * Delete dashboard
   */
  static async deleteDashboard(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`/dashboards/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete dashboard');
    }
  }

  /**
   * Duplicate dashboard
   */
  static async duplicateDashboard(id: string, title?: string): Promise<Dashboard> {
    const response = await apiClient.post<Dashboard, { title?: string }>(
      `/dashboards/${id}/duplicate`,
      title ? { title } : {}
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to duplicate dashboard');
    }
    
    return response.data;
  }
}

/**
 * Widget Service Class
 */
export class WidgetService {
  /**
   * Get all widgets for a dashboard
   */
  static async getWidgets(dashboardId: string): Promise<DashboardWidget[]> {
    return createQueryFunction(() => 
      apiClient.get<DashboardWidget[]>(`/dashboards/${dashboardId}/widgets`)
    )();
  }

  /**
   * Get single widget
   */
  static async getWidget(dashboardId: string, widgetId: string): Promise<DashboardWidget> {
    return createQueryFunction(() => 
      apiClient.get<DashboardWidget>(`/dashboards/${dashboardId}/widgets/${widgetId}`)
    )();
  }

  /**
   * Create new widget
   */
  static async createWidget(data: CreateWidgetRequest): Promise<DashboardWidget> {
    const response = await apiClient.post<DashboardWidget, CreateWidgetRequest>(
      `/dashboards/${data.dashboardId}/widgets`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create widget');
    }
    
    return response.data;
  }

  /**
   * Update widget
   */
  static async updateWidget(
    dashboardId: string,
    widgetId: string,
    data: UpdateWidgetRequest
  ): Promise<DashboardWidget> {
    const response = await apiClient.put<DashboardWidget, UpdateWidgetRequest>(
      `/dashboards/${dashboardId}/widgets/${widgetId}`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update widget');
    }
    
    return response.data;
  }

  /**
   * Delete widget
   */
  static async deleteWidget(dashboardId: string, widgetId: string): Promise<void> {
    const response = await apiClient.delete<void>(
      `/dashboards/${dashboardId}/widgets/${widgetId}`
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete widget');
    }
  }

  /**
   * Bulk update widget positions
   */
  static async updateWidgetPositions(
    dashboardId: string,
    widgets: Pick<DashboardWidget, 'id' | 'position'>[]
  ): Promise<DashboardWidget[]> {
    const response = await apiClient.put<DashboardWidget[], typeof widgets>(
      `/dashboards/${dashboardId}/widgets/positions`,
      widgets
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update widget positions');
    }
    
    return response.data;
  }
}

// Export services
export { DashboardService as dashboardApi, WidgetService as widgetApi };