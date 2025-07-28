/**
 * Dashboard API Tests
 * Testing dashboard CRUD operations and mock behavior
 */

import type { CreateDashboardRequest, UpdateDashboardRequest } from '@/types/dashboard.types';

import { dashboardApi, resetMockDashboards } from '../dashboard.api';

describe('Dashboard API', () => {
  // Mock timers to control delays
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    resetMockDashboards(); // Reset mock data to initial state
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getAll', () => {
    it('should return all dashboards', async () => {
      const promise = dashboardApi.getAll();
      
      // Fast-forward the simulated delay
      jest.advanceTimersByTime(500);
      
      const dashboards = await promise;
      
      expect(dashboards).toBeInstanceOf(Array);
      expect(dashboards).toHaveLength(3);
      expect(dashboards[0]).toMatchObject({
        id: 'dash-1',
        name: 'Sales Analytics',
        description: 'Comprehensive sales performance tracking',
        isPublic: false,
        widgetCount: 5,
      });
    });

    it('should return a copy of dashboards (not mutate original)', async () => {
      const promise1 = dashboardApi.getAll();
      jest.advanceTimersByTime(500);
      const dashboards1 = await promise1;

      const promise2 = dashboardApi.getAll();
      jest.advanceTimersByTime(500);
      const dashboards2 = await promise2;

      expect(dashboards1).toEqual(dashboards2);
      expect(dashboards1).not.toBe(dashboards2); // Different array references
    });

    it('should include all required fields for each dashboard', async () => {
      const promise = dashboardApi.getAll();
      jest.advanceTimersByTime(500);
      const dashboards = await promise;

      dashboards.forEach(dashboard => {
        expect(dashboard).toHaveProperty('id');
        expect(dashboard).toHaveProperty('name');
        expect(dashboard).toHaveProperty('description');
        expect(dashboard).toHaveProperty('isPublic');
        expect(dashboard).toHaveProperty('updatedAt');
        expect(dashboard).toHaveProperty('widgetCount');
        expect(dashboard.updatedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('getById', () => {
    it('should return dashboard by ID', async () => {
      const promise = dashboardApi.getById('dash-1');
      jest.advanceTimersByTime(300);
      const dashboard = await promise;

      expect(dashboard).toMatchObject({
        id: 'dash-1',
        name: 'Sales Analytics',
        description: 'Comprehensive sales performance tracking',
        isPublic: false,
        widgetCount: 5,
      });
      
      // Check extended properties
      expect(dashboard.createdAt).toBeInstanceOf(Date);
      expect(dashboard.widgets).toBeInstanceOf(Array);
      expect(dashboard.widgets).toHaveLength(0);
      expect(dashboard.settings).toBeDefined();
      expect(dashboard.settings.backgroundColor).toBe('#f8fafc');
      expect(dashboard.settings.gridSize).toBe(24);
      expect(dashboard.settings.autoRefresh).toBe(true);
      expect(dashboard.settings.refreshInterval).toBe(300);
    });

    it('should throw error for non-existent dashboard', async () => {
      const promise = dashboardApi.getById('non-existent');
      jest.advanceTimersByTime(300);
      
      await expect(promise).rejects.toThrow('Dashboard with ID non-existent not found');
    });

    it('should return different dashboard for different IDs', async () => {
      const promise1 = dashboardApi.getById('dash-1');
      jest.advanceTimersByTime(300);
      const dashboard1 = await promise1;

      const promise2 = dashboardApi.getById('dash-2');
      jest.advanceTimersByTime(300);
      const dashboard2 = await promise2;

      expect(dashboard1.id).not.toBe(dashboard2.id);
      expect(dashboard1.name).not.toBe(dashboard2.name);
    });
  });

  describe('create', () => {
    it('should create new dashboard', async () => {
      const createRequest: CreateDashboardRequest = {
        name: 'New Dashboard',
        description: 'Test dashboard creation',
        isPublic: false,
      };

      const promise = dashboardApi.create(createRequest);
      jest.advanceTimersByTime(800);
      const result = await promise;

      expect(result).toHaveProperty('dashboardId');
      expect(result.dashboardId).toMatch(/^dash-\d+$/);
    });

    it('should add created dashboard to the list', async () => {
      const createRequest: CreateDashboardRequest = {
        name: 'Another New Dashboard',
        description: 'Another test',
        isPublic: true,
      };

      // Create dashboard
      const createPromise = dashboardApi.create(createRequest);
      jest.advanceTimersByTime(800);
      const createResult = await createPromise;

      // Get all dashboards
      const getAllPromise = dashboardApi.getAll();
      jest.advanceTimersByTime(500);
      const dashboards = await getAllPromise;

      // Should have one more dashboard
      expect(dashboards).toHaveLength(4);
      
      // Find the created dashboard
      const createdDashboard = dashboards.find(d => d.id === createResult.dashboardId);
      expect(createdDashboard).toBeDefined();
      expect(createdDashboard?.name).toBe(createRequest.name);
      expect(createdDashboard?.description).toBe(createRequest.description);
      expect(createdDashboard?.isPublic).toBe(createRequest.isPublic);
    });

    it('should generate unique IDs', async () => {
      const createRequest: CreateDashboardRequest = {
        name: 'Test Dashboard',
        description: 'Test',
        isPublic: false,
      };

      const promise1 = dashboardApi.create(createRequest);
      jest.advanceTimersByTime(800);
      const result1 = await promise1;

      // Small delay to ensure different timestamp
      jest.advanceTimersByTime(10);

      const promise2 = dashboardApi.create(createRequest);
      jest.advanceTimersByTime(800);
      const result2 = await promise2;

      expect(result1.dashboardId).not.toBe(result2.dashboardId);
    });
  });

  describe('update', () => {
    it('should update existing dashboard', async () => {
      const updateRequest: UpdateDashboardRequest = {
        id: 'dash-1',
        name: 'Updated Sales Analytics',
        description: 'Updated description',
        isPublic: true,
      };

      const promise = dashboardApi.update('dash-1', updateRequest);
      jest.advanceTimersByTime(600);
      await promise;

      // Verify update by getting the dashboard
      const getPromise = dashboardApi.getById('dash-1');
      jest.advanceTimersByTime(300);
      const dashboard = await getPromise;

      expect(dashboard.name).toBe(updateRequest.name);
      expect(dashboard.description).toBe(updateRequest.description);
      expect(dashboard.isPublic).toBe(updateRequest.isPublic);
    });

    it('should throw error when updating non-existent dashboard', async () => {
      const updateRequest: UpdateDashboardRequest = {
        id: 'non-existent',
        name: 'Updated Name',
      };

      const promise = dashboardApi.update('non-existent', updateRequest);
      jest.advanceTimersByTime(600);
      
      await expect(promise).rejects.toThrow('Dashboard with ID non-existent not found');
    });

    it('should update only provided fields', async () => {
      // Get original state
      const getPromise1 = dashboardApi.getAll();
      jest.advanceTimersByTime(500);
      const originalDashboards = await getPromise1;
      const originalDashboard = originalDashboards.find(d => d.id === 'dash-2');

      // Update only name
      const updateRequest: UpdateDashboardRequest = {
        id: 'dash-2',
        name: 'Updated Marketing',
      };

      const updatePromise = dashboardApi.update('dash-2', updateRequest);
      jest.advanceTimersByTime(600);
      await updatePromise;

      // Verify partial update
      const getPromise2 = dashboardApi.getAll();
      jest.advanceTimersByTime(500);
      const updatedDashboards = await getPromise2;
      const updatedDashboard = updatedDashboards.find(d => d.id === 'dash-2');

      expect(updatedDashboard?.name).toBe(updateRequest.name);
      expect(updatedDashboard?.description).toBe(originalDashboard?.description);
      expect(updatedDashboard?.isPublic).toBe(originalDashboard?.isPublic);
    });

    it('should update updatedAt timestamp', async () => {
      const getPromise1 = dashboardApi.getAll();
      jest.advanceTimersByTime(500);
      const originalDashboards = await getPromise1;
      const originalDashboard = originalDashboards.find(d => d.id === 'dash-3');
      const originalUpdatedAt = originalDashboard?.updatedAt;

      const updateRequest: UpdateDashboardRequest = {
        description: 'Updated customer insights',
      };

      const updatePromise = dashboardApi.update('dash-3', updateRequest);
      jest.advanceTimersByTime(600);
      await updatePromise;

      const getPromise2 = dashboardApi.getAll();
      jest.advanceTimersByTime(500);
      const updatedDashboards = await getPromise2;
      const updatedDashboard = updatedDashboards.find(d => d.id === 'dash-3');

      expect(updatedDashboard?.updatedAt).not.toEqual(originalUpdatedAt);
      expect(updatedDashboard?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt?.getTime() || 0);
    });
  });

  describe('delete', () => {
    it('should delete existing dashboard', async () => {
      // Get initial count
      const getPromise1 = dashboardApi.getAll();
      jest.advanceTimersByTime(500);
      const initialDashboards = await getPromise1;
      const initialCount = initialDashboards.length;

      // Delete dashboard
      const deletePromise = dashboardApi.delete('dash-1');
      jest.advanceTimersByTime(400);
      await deletePromise;

      // Verify deletion
      const getPromise2 = dashboardApi.getAll();
      jest.advanceTimersByTime(500);
      const remainingDashboards = await getPromise2;

      expect(remainingDashboards).toHaveLength(initialCount - 1);
      expect(remainingDashboards.find(d => d.id === 'dash-1')).toBeUndefined();
    });

    it('should throw error when deleting non-existent dashboard', async () => {
      const promise = dashboardApi.delete('non-existent');
      jest.advanceTimersByTime(400);
      
      await expect(promise).rejects.toThrow('Dashboard with ID non-existent not found');
    });

    it('should not be able to get deleted dashboard by ID', async () => {
      // Delete dashboard
      const deletePromise = dashboardApi.delete('dash-2');
      jest.advanceTimersByTime(400);
      await deletePromise;

      // Try to get deleted dashboard
      const getPromise = dashboardApi.getById('dash-2');
      jest.advanceTimersByTime(300);
      
      await expect(getPromise).rejects.toThrow('Dashboard with ID dash-2 not found');
    });
  });

  describe('edge cases', () => {
    it('should handle empty dashboard name in create', async () => {
      const createRequest: CreateDashboardRequest = {
        name: '',
        description: 'Empty name test',
        isPublic: false,
      };

      const promise = dashboardApi.create(createRequest);
      jest.advanceTimersByTime(800);
      const result = await promise;

      // Should still create with empty name
      expect(result.dashboardId).toBeDefined();
    });

    it('should handle very long descriptions', async () => {
      const longDescription = 'A'.repeat(1000);
      const createRequest: CreateDashboardRequest = {
        name: 'Long Description Dashboard',
        description: longDescription,
        isPublic: false,
      };

      const promise = dashboardApi.create(createRequest);
      jest.advanceTimersByTime(800);
      const result = await promise;

      const getPromise = dashboardApi.getAll();
      jest.advanceTimersByTime(500);
      const dashboards = await getPromise;
      
      const created = dashboards.find(d => d.id === result.dashboardId);
      expect(created?.description).toBe(longDescription);
    });
  });
});