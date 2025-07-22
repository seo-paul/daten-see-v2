// Testing Dashboard Store functionality

import type { CreateDashboardRequest, UpdateDashboardRequest } from '@/types/dashboard.types';

import { useDashboardStore } from '../dashboard.store';

// Mock the logger
jest.mock('@/lib/monitoring/logger.config', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
  appLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Create a proper test wrapper for Zustand store
const createTestStore = (): typeof useDashboardStore => {
  // Reset the store to initial state before each test
  const initialState = {
    dashboards: [],
    currentDashboard: null,
    isLoading: false,
    error: null,
  };
  
  useDashboardStore.setState(initialState);
  
  return useDashboardStore;
};

describe('Dashboard Store', () => {
  beforeEach(() => {
    // Properly reset Zustand store before each test
    createTestStore();
  });

  afterEach(() => {
    // Clean up after each test
    useDashboardStore.setState({
      dashboards: [],
      currentDashboard: null,
      isLoading: false,
      error: null,
    });
  });

  describe('fetchDashboards', () => {
    it('should load mock dashboards successfully', async () => {
      const store = useDashboardStore.getState();

      // Call fetchDashboards
      const fetchPromise = store.fetchDashboards();
      
      // Check loading state immediately
      let state = useDashboardStore.getState();
      expect(state.isLoading).toBe(true);

      // Wait for fetch to complete
      await fetchPromise;

      // Check final state
      state = useDashboardStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.dashboards).toHaveLength(3);
      expect(state.dashboards[0].name).toBe('Sales Analytics');
      expect(state.error).toBeNull();
    });
  });

  describe('createDashboard', () => {
    it('should create a new dashboard successfully', async () => {
      const store = useDashboardStore.getState();

      const newDashboard: CreateDashboardRequest = {
        name: 'Test Dashboard',
        description: 'This is a test dashboard for unit testing',
        isPublic: true,
      };

      const dashboardId = await store.createDashboard(newDashboard);

      expect(dashboardId).toBeTruthy();
      
      const state = useDashboardStore.getState();
      expect(state.dashboards).toHaveLength(1);
      expect(state.dashboards[0].name).toBe('Test Dashboard');
      expect(state.dashboards[0].isPublic).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle store state correctly during creation', async () => {
      const store = useDashboardStore.getState();
      
      const newDashboard: CreateDashboardRequest = {
        name: 'Error Test Dashboard',
        description: 'This dashboard will test our error handling',
        isPublic: false,
      };

      // Create a dashboard and verify the state transitions correctly
      const createPromise = store.createDashboard(newDashboard);

      // Check loading state during creation
      let state = useDashboardStore.getState();
      expect(state.isLoading).toBe(true);

      // Wait for creation to complete
      await createPromise;

      // Check final state after successful creation
      state = useDashboardStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.dashboards).toHaveLength(1);
    });
  });

  describe('updateDashboard', () => {
    it('should update an existing dashboard', async () => {
      const store = useDashboardStore.getState();

      // First load dashboards
      await store.fetchDashboards();
      
      let state = useDashboardStore.getState();
      const originalDashboard = state.dashboards[0];
      expect(originalDashboard.name).toBe('Sales Analytics');

      const updateData: UpdateDashboardRequest = {
        id: originalDashboard.id,
        name: 'Updated Sales Analytics',
        description: 'Updated description',
        isPublic: true,
      };

      await store.updateDashboard(updateData);

      state = useDashboardStore.getState();
      const updatedDashboard = state.dashboards.find(d => d.id === originalDashboard.id);
      expect(updatedDashboard?.name).toBe('Updated Sales Analytics');
      expect(updatedDashboard?.description).toBe('Updated description');
      expect(updatedDashboard?.isPublic).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('deleteDashboard', () => {
    it('should delete a dashboard successfully', async () => {
      const store = useDashboardStore.getState();

      // First load dashboards
      await store.fetchDashboards();
      
      let state = useDashboardStore.getState();
      const initialCount = state.dashboards.length;
      const dashboardToDelete = state.dashboards[0];

      await store.deleteDashboard(dashboardToDelete.id);

      state = useDashboardStore.getState();
      expect(state.dashboards).toHaveLength(initialCount - 1);
      expect(state.dashboards.find(d => d.id === dashboardToDelete.id)).toBeUndefined();
      expect(state.error).toBeNull();
    });
  });

  describe('fetchDashboard', () => {
    it('should load a single dashboard successfully', async () => {
      const store = useDashboardStore.getState();

      await store.fetchDashboard('dash-1');

      const state = useDashboardStore.getState();
      expect(state.currentDashboard).toBeTruthy();
      expect(state.currentDashboard?.id).toBe('dash-1');
      expect(state.currentDashboard?.name).toBe('Sales Analytics');
      expect(state.error).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should clear errors when clearError is called', () => {
      // Set an error state
      useDashboardStore.setState({ error: 'Test error' });

      let state = useDashboardStore.getState();
      expect(state.error).toBe('Test error');

      state.clearError();

      state = useDashboardStore.getState();
      expect(state.error).toBeNull();
    });
  });
});