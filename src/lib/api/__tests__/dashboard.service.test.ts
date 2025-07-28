import type { Dashboard, CreateDashboardRequest, UpdateDashboardRequest } from '@/types/dashboard.types';

import { DashboardService } from '../dashboard';
import { apiClient } from '../index';

// Mock the API client
jest.mock('../index', (): object => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    getPaginated: jest.fn(),
  },
  createQueryFunction: (fn: Function): (() => Promise<any>) => async (): Promise<any> => {
    const response = await fn();
    if (!response.success) {
      throw new Error(response.message || 'API request failed');
    }
    return response.data;
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('DashboardService', (): void => {
  const mockDashboard: Dashboard = {
    id: '1',
    name: 'Test Dashboard',
    description: 'Test description',
    isPublic: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    widgets: [],
    settings: {
      backgroundColor: '#ffffff',
      gridSize: 12,
      autoRefresh: false,
      refreshInterval: 300,
    },
  };

  beforeEach((): void => {
    jest.clearAllMocks();
  });

  describe('getDashboards', (): void => {
    it('should return dashboards array', async (): Promise<void> => {
      const mockResponse = {
        data: [mockDashboard],
        success: true,
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await DashboardService.getDashboards();

      expect(result).toEqual([mockDashboard]);
      expect(mockApiClient.get).toHaveBeenCalledWith('/dashboards');
    });
  });

  describe('createDashboard', (): void => {
    it('should create dashboard successfully', async (): Promise<void> => {
      const createRequest: CreateDashboardRequest = {
        name: 'New Dashboard',
        description: 'New description',
        isPublic: false,
      };
      const mockResponse = {
        data: mockDashboard,
        success: true,
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await DashboardService.createDashboard(createRequest);

      expect(result).toEqual(mockDashboard);
      expect(mockApiClient.post).toHaveBeenCalledWith('/dashboards', createRequest);
    });
  });

  describe('updateDashboard', (): void => {
    it('should update dashboard successfully', async (): Promise<void> => {
      const updateRequest: UpdateDashboardRequest = {
        id: '1',
        name: 'Updated Dashboard',
        description: 'Updated description',
        isPublic: true,
      };
      const updatedDashboard = { ...mockDashboard, ...updateRequest };
      const mockResponse = {
        data: updatedDashboard,
        success: true,
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await DashboardService.updateDashboard('1', updateRequest);

      expect(result).toEqual(updatedDashboard);
      expect(mockApiClient.put).toHaveBeenCalledWith('/dashboards/1', updateRequest);
    });
  });

  describe('deleteDashboard', (): void => {
    it('should delete dashboard successfully', async (): Promise<void> => {
      const mockResponse = {
        data: undefined,
        success: true,
      };
      mockApiClient.delete.mockResolvedValue(mockResponse);

      await DashboardService.deleteDashboard('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/dashboards/1');
    });
  });

  describe('getDashboard', (): void => {
    it('should return single dashboard', async (): Promise<void> => {
      const mockResponse = {
        data: mockDashboard,
        success: true,
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await DashboardService.getDashboard('1');

      expect(result).toEqual(mockDashboard);
      expect(mockApiClient.get).toHaveBeenCalledWith('/dashboards/1');
    });
  });

  describe('error handling', (): void => {
    it('should handle network errors', async (): Promise<void> => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(DashboardService.getDashboard('1')).rejects.toThrow('Network error');
    });
  });
});