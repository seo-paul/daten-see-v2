/**
 * Dashboard API Client
 * RESTful API operations for dashboard management
 */

import type { Dashboard, DashboardListItem, CreateDashboardRequest, UpdateDashboardRequest } from '@/types/dashboard.types';

// Initial mock data for development - will be replaced with real API calls
const initialMockDashboards: DashboardListItem[] = [
  {
    id: 'dash-1',
    name: 'Sales Analytics',
    description: 'Comprehensive sales performance tracking',
    isPublic: false,
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    widgetCount: 5,
  },
  {
    id: 'dash-2', 
    name: 'Marketing Campaign',
    description: 'Track campaign performance across channels',
    isPublic: true,
    updatedAt: new Date('2024-01-14T16:45:00Z'),
    widgetCount: 3,
  },
  {
    id: 'dash-3',
    name: 'Customer Insights',
    description: 'Customer behavior and demographics analysis',
    isPublic: false,
    updatedAt: new Date('2024-01-13T09:15:00Z'),
    widgetCount: 4,
  },
];

// Working copy of mock data that can be mutated
let mockDashboards = [...initialMockDashboards];

// Reset function for testing
export const resetMockDashboards = (): void => {
  mockDashboards = initialMockDashboards.map(d => ({ ...d }));
};

export const dashboardApi = {
  /**
   * Get all dashboards
   */
  async getAll(): Promise<DashboardListItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockDashboards];
  },

  /**
   * Get dashboard by ID
   */
  async getById(id: string): Promise<Dashboard> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const dashboard = mockDashboards.find(d => d.id === id);
    if (!dashboard) {
      throw new Error(`Dashboard with ID ${id} not found`);
    }

    // Convert to full dashboard object
    return {
      ...dashboard,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      widgets: [],
      settings: {
        backgroundColor: '#f8fafc',
        gridSize: 24,
        autoRefresh: true,
        refreshInterval: 300,
      },
    };
  },

  /**
   * Create new dashboard
   */
  async create(data: CreateDashboardRequest): Promise<{ dashboardId: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newDashboard: DashboardListItem = {
      id: `dash-${Date.now()}`,
      name: data.name,
      description: data.description,
      isPublic: data.isPublic,
      updatedAt: new Date(),
      widgetCount: 0,
    };

    mockDashboards.push(newDashboard);
    
    return { dashboardId: newDashboard.id };
  },

  /**
   * Update existing dashboard
   */
  async update(id: string, data: UpdateDashboardRequest): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockDashboards.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error(`Dashboard with ID ${id} not found`);
    }

    const existingDashboard = mockDashboards[index];
    if (!existingDashboard) {
      throw new Error(`Dashboard with ID ${id} not found`);
    }
    
    mockDashboards[index] = {
      ...existingDashboard,
      ...data,
      id: existingDashboard.id, // Preserve required id
      name: data.name ?? existingDashboard.name,
      description: data.description ?? existingDashboard.description,
      isPublic: data.isPublic ?? existingDashboard.isPublic,
      updatedAt: new Date(),
      widgetCount: existingDashboard.widgetCount, // Preserve required widgetCount
    };
  },

  /**
   * Delete dashboard
   */
  async delete(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockDashboards.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error(`Dashboard with ID ${id} not found`);
    }

    mockDashboards.splice(index, 1);
  },
};