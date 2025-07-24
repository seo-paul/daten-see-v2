/**
 * MSW (Mock Service Worker) Handlers
 * API mocking for tests and development
 */

import { http, HttpResponse } from 'msw';
import type { 
  DashboardListItem,
  Dashboard,
  CreateDashboardRequest 
} from '@/types/dashboard.types';
import { mockTestData } from './custom-hooks';

// Mock API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Mock dashboard data
const mockDashboards: DashboardListItem[] = mockTestData.dashboards;

let mockDashboardsStore = [...mockDashboards];

/**
 * Authentication API handlers
 */
export const authHandlers = [
  // Login endpoint
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    // Mock successful login
    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockTestData.user,
          token: 'mock-jwt-token',
        },
      });
    }
    
    // Mock failed login
    return HttpResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Logout endpoint
  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Token refresh endpoint
  http.post(`${API_BASE}/auth/refresh`, () => {
    return HttpResponse.json({
      success: true,
      data: { token: 'new-mock-jwt-token' },
    });
  }),

  // User profile endpoint
  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json({
      success: true,
      data: { user: mockTestData.user },
    });
  }),
];

/**
 * Dashboard API handlers
 */
export const dashboardHandlers = [
  // Get all dashboards
  http.get(`${API_BASE}/dashboards`, () => {
    return HttpResponse.json({
      success: true,
      data: { dashboards: mockDashboardsStore },
    });
  }),

  // Get single dashboard
  http.get(`${API_BASE}/dashboards/:id`, ({ params }) => {
    const { id } = params;
    const dashboard = mockDashboardsStore.find(d => d.id === id);
    
    if (!dashboard) {
      return HttpResponse.json(
        { success: false, error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    // Convert to full dashboard object
    const fullDashboard: Dashboard = {
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

    return HttpResponse.json({
      success: true,
      data: { dashboard: fullDashboard },
    });
  }),

  // Create dashboard
  http.post(`${API_BASE}/dashboards`, async ({ request }) => {
    const body = await request.json() as CreateDashboardRequest;
    
    const newDashboard: DashboardListItem = {
      id: `mock-${Date.now()}`,
      name: body.name,
      description: body.description,
      isPublic: body.isPublic,
      updatedAt: new Date(),
      widgetCount: 0,
    };

    mockDashboardsStore.push(newDashboard);

    return HttpResponse.json({
      success: true,
      data: { dashboardId: newDashboard.id },
    });
  }),

  // Update dashboard
  http.put(`${API_BASE}/dashboards/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Partial<CreateDashboardRequest>;
    
    const dashboardIndex = mockDashboardsStore.findIndex(d => d.id === id);
    
    if (dashboardIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    // Update dashboard
    mockDashboardsStore[dashboardIndex] = {
      ...mockDashboardsStore[dashboardIndex],
      ...body,
      updatedAt: new Date(),
    };

    return HttpResponse.json({ success: true });
  }),

  // Delete dashboard
  http.delete(`${API_BASE}/dashboards/:id`, ({ params }) => {
    const { id } = params;
    const dashboardIndex = mockDashboardsStore.findIndex(d => d.id === id);
    
    if (dashboardIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    mockDashboardsStore.splice(dashboardIndex, 1);

    return HttpResponse.json({ success: true });
  }),
];

/**
 * Error simulation handlers
 * For testing error scenarios
 */
export const errorHandlers = [
  // Simulate network error
  http.get(`${API_BASE}/test/network-error`, () => {
    return HttpResponse.error();
  }),

  // Simulate server error
  http.get(`${API_BASE}/test/server-error`, () => {
    return HttpResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }),

  // Simulate slow response
  http.get(`${API_BASE}/test/slow-response`, async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return HttpResponse.json({ success: true, data: 'slow response' });
  }),
];

/**
 * Default handlers for testing
 */
export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...errorHandlers,
];

/**
 * Utility to reset mock data
 * Call between tests to ensure clean state
 */
export function resetMockData(): void {
  mockDashboardsStore = [...mockDashboards];
}

export default handlers;