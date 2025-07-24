/**
 * MSW (Mock Service Worker) Handlers
 * API mocking for tests and development
 */

import { rest } from 'msw';
import type { 
  DashboardListItem,
  Dashboard,
  CreateDashboardRequest 
} from '@/types/dashboard.types';
import { mockTestData } from './custom-hooks';

// Mock API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Mock dashboard data - convert readonly to mutable
const mockDashboards: DashboardListItem[] = [...mockTestData.dashboards];

let mockDashboardsStore = [...mockDashboards];

/**
 * Authentication API handlers
 */
export const authHandlers = [
  // Login endpoint
  rest.post(`${API_BASE}/auth/login`, async (req, res, ctx) => {
    const body = await req.json() as { email: string; password: string };
    
    // Mock successful login
    if (body.email === 'test@example.com' && body.password === 'password') {
      return res(
        ctx.json({
          success: true,
          data: {
            user: mockTestData.user,
            token: 'mock-jwt-token',
          },
        })
      );
    }
    
    // Mock failed login
    return res(
      ctx.status(401),
      ctx.json({ success: false, error: 'Invalid credentials' })
    );
  }),

  // Logout endpoint
  rest.post(`${API_BASE}/auth/logout`, (_req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),

  // Token refresh endpoint
  rest.post(`${API_BASE}/auth/refresh`, (_req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: { token: 'new-mock-jwt-token' },
      })
    );
  }),

  // User profile endpoint
  rest.get(`${API_BASE}/auth/me`, (_req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: { user: mockTestData.user },
      })
    );
  }),
];

/**
 * Dashboard API handlers
 */
export const dashboardHandlers = [
  // Get all dashboards
  rest.get(`${API_BASE}/dashboards`, (_req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: { dashboards: mockDashboardsStore },
      })
    );
  }),

  // Get single dashboard
  rest.get(`${API_BASE}/dashboards/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const dashboard = mockDashboardsStore.find(d => d.id === id);
    
    if (!dashboard) {
      return res(
        ctx.status(404),
        ctx.json({ success: false, error: 'Dashboard not found' })
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

    return res(
      ctx.json({
        success: true,
        data: { dashboard: fullDashboard },
      })
    );
  }),

  // Create dashboard
  rest.post(`${API_BASE}/dashboards`, async (req, res, ctx) => {
    const body = await req.json() as CreateDashboardRequest;
    
    const newDashboard: DashboardListItem = {
      id: `mock-${Date.now()}`,
      name: body.name,
      description: body.description,
      isPublic: body.isPublic,
      updatedAt: new Date(),
      widgetCount: 0,
    };

    mockDashboardsStore.push(newDashboard);

    return res(
      ctx.json({
        success: true,
        data: { dashboardId: newDashboard.id },
      })
    );
  }),

  // Update dashboard
  rest.put(`${API_BASE}/dashboards/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json() as Partial<CreateDashboardRequest>;
    
    const dashboardIndex = mockDashboardsStore.findIndex(d => d.id === id);
    
    if (dashboardIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ success: false, error: 'Dashboard not found' })
      );
    }

    // Update dashboard
    const existingDashboard = mockDashboardsStore[dashboardIndex];
    if (!existingDashboard) {
      return res(ctx.status(404), ctx.json({ error: 'Dashboard not found' }));
    }
    
    mockDashboardsStore[dashboardIndex] = {
      ...existingDashboard,
      ...body,
      id: existingDashboard.id, // Ensure id is preserved
      name: body.name ?? existingDashboard.name,
      description: body.description ?? existingDashboard.description,
      isPublic: body.isPublic ?? existingDashboard.isPublic,
      updatedAt: new Date(),
      widgetCount: existingDashboard.widgetCount, // Preserve required widgetCount
    };

    return res(ctx.json({ success: true }));
  }),

  // Delete dashboard
  rest.delete(`${API_BASE}/dashboards/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const dashboardIndex = mockDashboardsStore.findIndex(d => d.id === id);
    
    if (dashboardIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ success: false, error: 'Dashboard not found' })
      );
    }

    mockDashboardsStore.splice(dashboardIndex, 1);

    return res(ctx.json({ success: true }));
  }),
];

/**
 * Error simulation handlers
 * For testing error scenarios
 */
export const errorHandlers = [
  // Simulate network error
  rest.get(`${API_BASE}/test/network-error`, (_req, res) => {
    return res.networkError('Network error');
  }),

  // Simulate server error
  rest.get(`${API_BASE}/test/server-error`, (_req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ success: false, error: 'Internal server error' })
    );
  }),

  // Simulate slow response
  rest.get(`${API_BASE}/test/slow-response`, async (_req, res, ctx) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return res(ctx.json({ success: true, data: 'slow response' }));
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