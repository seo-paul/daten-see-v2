import type { Dashboard, CreateDashboardRequest, UpdateDashboardRequest } from '@/types';

import { DashboardService } from '../dashboard';
import { apiClient } from '../index';

// Mock the API client
jest.mock('../index', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    getPaginated: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('DashboardService', () => {
  const mockDashboard: Dashboard = {
    id: '1',
    name: 'Test Dashboard',
    description: 'Test description',
    isPublic: false,
    userId: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboards', () => {
    it('should return paginated dashboards', async () => {
      const mockResponse = {
        data: [mockDashboard],
        pagination: { page: 1, totalPages: 1, totalItems: 1 },
      };
      mockApiClient.getPaginated.mockResolvedValue(mockResponse);

      const result = await DashboardService.getDashboards({ page: 1 });

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.getPaginated).toHaveBeenCalledWith('/dashboards', { page: 1 });
    });
  });

  describe('createDashboard', () => {
    it('should create dashboard successfully', async () => {
      const createRequest: CreateDashboardRequest = {
        name: 'New Dashboard',
        description: 'New description',
        isPublic: false,
      };
      mockApiClient.post.mockResolvedValue(mockDashboard);

      const result = await DashboardService.createDashboard(createRequest);

      expect(result).toEqual(mockDashboard);
      expect(mockApiClient.post).toHaveBeenCalledWith('/dashboards', createRequest);
    });
  });

  describe('updateDashboard', () => {
    it('should update dashboard successfully', async () => {
      const updateRequest: UpdateDashboardRequest = {
        name: 'Updated Dashboard',
        description: 'Updated description',
        isPublic: true,
      };
      const updatedDashboard = { ...mockDashboard, ...updateRequest };
      mockApiClient.put.mockResolvedValue(updatedDashboard);

      const result = await DashboardService.updateDashboard('1', updateRequest);

      expect(result).toEqual(updatedDashboard);
      expect(mockApiClient.put).toHaveBeenCalledWith('/dashboards/1', updateRequest);
    });
  });

  describe('deleteDashboard', () => {
    it('should delete dashboard successfully', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await DashboardService.deleteDashboard('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/dashboards/1');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(DashboardService.getDashboard('1')).rejects.toThrow('Network error');
    });
  });
});