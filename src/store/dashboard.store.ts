import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { appLogger as logger } from '@/lib/monitoring/logger.config';
import type { 
  Dashboard, 
  DashboardListItem, 
  CreateDashboardRequest, 
  UpdateDashboardRequest 
} from '@/types/dashboard.types';

interface DashboardStore {
  // State
  dashboards: DashboardListItem[];
  currentDashboard: Dashboard | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboards: () => Promise<void>;
  fetchDashboard: (id: string) => Promise<Dashboard | null>;
  createDashboard: (data: CreateDashboardRequest) => Promise<string>;
  updateDashboard: (data: UpdateDashboardRequest) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  setCurrentDashboard: (dashboard: Dashboard | null) => void;
  clearError: () => void;
}

// Mock data for development
const mockDashboards: DashboardListItem[] = [
  {
    id: 'dash-1',
    name: 'Sales Analytics',
    description: 'Übersicht über Verkaufsdaten und KPIs',
    isPublic: false,
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    widgetCount: 6
  },
  {
    id: 'dash-2', 
    name: 'Marketing Dashboard',
    description: 'Social Media und Kampagnen Performance',
    isPublic: true,
    updatedAt: new Date('2024-01-14T16:45:00Z'),
    widgetCount: 4
  },
  {
    id: 'dash-3',
    name: 'Operations Monitor',
    description: 'System Health und Performance Metriken',
    isPublic: false,
    updatedAt: new Date('2024-01-13T09:15:00Z'),
    widgetCount: 8
  }
];

const mockFullDashboard: Dashboard = {
  id: 'dash-1',
  name: 'Sales Analytics',
  description: 'Übersicht über Verkaufsdaten und KPIs',
  isPublic: false,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z'),
  widgets: [],
  settings: {
    backgroundColor: '#f8fafc',
    gridSize: 24,
    autoRefresh: true,
    refreshInterval: 300
  }
};

export const useDashboardStore = create<DashboardStore>()(
  subscribeWithSelector((set) => ({
    // Initial state
    dashboards: [],
    currentDashboard: null,
    isLoading: false,
    error: null,

    // Actions
    fetchDashboards: async (): Promise<void> => {
      set({ isLoading: true, error: null });
      
      try {
        logger.info('Fetching dashboards list');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set({ 
          dashboards: mockDashboards,
          isLoading: false 
        });
        
        logger.info('Dashboards loaded successfully', { 
          count: mockDashboards.length 
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboards';
        logger.error('Failed to fetch dashboards', { error });
        set({ 
          error: errorMessage,
          isLoading: false 
        });
      }
    },

    fetchDashboard: async (id: string): Promise<Dashboard | null> => {
      set({ isLoading: true, error: null });
      
      try {
        logger.info('Fetching dashboard details', { dashboardId: id });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock: return the full dashboard with given ID
        const dashboard: Dashboard = {
          ...mockFullDashboard,
          id,
          name: mockDashboards.find(d => d.id === id)?.name || 'Unknown Dashboard'
        };
        
        set({ 
          currentDashboard: dashboard,
          isLoading: false 
        });
        
        logger.info('Dashboard loaded successfully', { dashboardId: id });
        return dashboard;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard';
        logger.error('Failed to fetch dashboard', { error, dashboardId: id });
        set({ 
          error: errorMessage,
          isLoading: false 
        });
        return null;
      }
    },

    createDashboard: async (data: CreateDashboardRequest): Promise<string> => {
      set({ isLoading: true, error: null });
      
      try {
        logger.info('Creating new dashboard', { name: data.name });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const newDashboard: DashboardListItem = {
          id: `dash-${Date.now()}`,
          name: data.name,
          description: data.description,
          isPublic: data.isPublic,
          updatedAt: new Date(),
          widgetCount: 0
        };
        
        set(state => ({
          dashboards: [newDashboard, ...state.dashboards],
          isLoading: false
        }));
        
        logger.info('Dashboard created successfully', { 
          dashboardId: newDashboard.id,
          name: data.name
        });
        
        return newDashboard.id;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create dashboard';
        logger.error('Failed to create dashboard', { error, data });
        set({ 
          error: errorMessage,
          isLoading: false 
        });
        throw new Error(errorMessage);
      }
    },

    updateDashboard: async (data: UpdateDashboardRequest): Promise<void> => {
      set({ isLoading: true, error: null });
      
      try {
        logger.info('Updating dashboard', { dashboardId: data.id });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600));
        
        set(state => ({
          dashboards: state.dashboards.map(dashboard => 
            dashboard.id === data.id
              ? {
                  ...dashboard,
                  ...(data.name && { name: data.name }),
                  ...(data.description && { description: data.description }),
                  ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
                  updatedAt: new Date()
                }
              : dashboard
          ),
          currentDashboard: state.currentDashboard?.id === data.id
            ? {
                ...state.currentDashboard,
                ...(data.name && { name: data.name }),
                ...(data.description && { description: data.description }),
                ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
                ...(data.settings && { settings: { ...state.currentDashboard.settings, ...data.settings } }),
                updatedAt: new Date()
              }
            : state.currentDashboard,
          isLoading: false
        }));
        
        logger.info('Dashboard updated successfully', { dashboardId: data.id });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update dashboard';
        logger.error('Failed to update dashboard', { error, data });
        set({ 
          error: errorMessage,
          isLoading: false 
        });
      }
    },

    deleteDashboard: async (id: string): Promise<void> => {
      set({ isLoading: true, error: null });
      
      try {
        logger.info('Deleting dashboard', { dashboardId: id });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 400));
        
        set(state => ({
          dashboards: state.dashboards.filter(dashboard => dashboard.id !== id),
          currentDashboard: state.currentDashboard?.id === id ? null : state.currentDashboard,
          isLoading: false
        }));
        
        logger.info('Dashboard deleted successfully', { dashboardId: id });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete dashboard';
        logger.error('Failed to delete dashboard', { error, dashboardId: id });
        set({ 
          error: errorMessage,
          isLoading: false 
        });
      }
    },

    setCurrentDashboard: (dashboard: Dashboard | null): void => {
      set({ currentDashboard: dashboard });
    },

    clearError: (): void => {
      set({ error: null });
    }
  }))
);