import { z } from 'zod';

// Base API Response Schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  timestamp: z.string().datetime(),
});

// Error Response Schema
export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
  timestamp: z.string().datetime(),
});

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Dashboard API Types
export const DashboardListResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    dashboards: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      isPublic: z.boolean(),
      updatedAt: z.string().datetime(),
      widgetCount: z.number().int().nonnegative(),
    })),
    pagination: PaginationSchema.optional(),
  }),
});

export const DashboardDetailResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    dashboard: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      isPublic: z.boolean(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      widgets: z.array(z.object({
        id: z.string(),
        type: z.enum(['chart', 'kpi', 'text']),
        title: z.string(),
        position: z.object({
          x: z.number(),
          y: z.number(),
          w: z.number(),
          h: z.number(),
        }),
        config: z.record(z.unknown()),
        data: z.unknown(),
      })),
      settings: z.object({
        backgroundColor: z.string(),
        gridSize: z.number().int().positive(),
        autoRefresh: z.boolean(),
        refreshInterval: z.number().int().positive(),
      }),
    }),
  }),
});

export const CreateDashboardRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  isPublic: z.boolean().default(false),
  settings: z.object({
    backgroundColor: z.string().default('#f8fafc'),
    gridSize: z.number().int().positive().default(24),
    autoRefresh: z.boolean().default(true),
    refreshInterval: z.number().int().positive().default(300),
  }).optional(),
});

export const UpdateDashboardRequestSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
  settings: z.object({
    backgroundColor: z.string(),
    gridSize: z.number().int().positive(),
    autoRefresh: z.boolean(),
    refreshInterval: z.number().int().positive(),
  }).partial().optional(),
});

export const CreateDashboardResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    dashboardId: z.string(),
  }),
});

// Authentication API Types
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const LoginResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      role: z.enum(['user', 'admin']),
      avatar: z.string().url().optional(),
    }),
    token: z.string(),
    refreshToken: z.string(),
    expiresAt: z.string().datetime(),
  }),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export const RefreshTokenResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    token: z.string(),
    expiresAt: z.string().datetime(),
  }),
});

// User API Types
export const UserProfileResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      role: z.enum(['user', 'admin']),
      avatar: z.string().url().optional(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    }),
  }),
});

export const UpdateUserProfileRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

// Widget API Types
export const CreateWidgetRequestSchema = z.object({
  dashboardId: z.string(),
  type: z.enum(['chart', 'kpi', 'text']),
  title: z.string().min(1).max(100),
  position: z.object({
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    w: z.number().int().positive(),
    h: z.number().int().positive(),
  }),
  config: z.record(z.unknown()).default({}),
});

export const UpdateWidgetRequestSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100).optional(),
  position: z.object({
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    w: z.number().int().positive(),
    h: z.number().int().positive(),
  }).optional(),
  config: z.record(z.unknown()).optional(),
});

// Export TypeScript types
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;

export type DashboardListResponse = z.infer<typeof DashboardListResponseSchema>;
export type DashboardDetailResponse = z.infer<typeof DashboardDetailResponseSchema>;
export type CreateDashboardRequest = z.infer<typeof CreateDashboardRequestSchema>;
export type UpdateDashboardRequest = z.infer<typeof UpdateDashboardRequestSchema>;
export type CreateDashboardResponse = z.infer<typeof CreateDashboardResponseSchema>;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;
export type UpdateUserProfileRequest = z.infer<typeof UpdateUserProfileRequestSchema>;

export type CreateWidgetRequest = z.infer<typeof CreateWidgetRequestSchema>;
export type UpdateWidgetRequest = z.infer<typeof UpdateWidgetRequestSchema>;