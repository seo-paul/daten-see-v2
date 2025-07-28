/**
 * Authentication Mocks for Testing
 * Provides mock implementations for auth-related functionality
 */

import type { TokenManager, StoredTokenInfo } from '@/lib/auth/token';
import type { User } from '@/types/auth.types';

export interface MockTokenManagerOptions {
  user?: User | null;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Creates a mock TokenManager for testing
 */
export function createMockTokenManager(options: MockTokenManagerOptions = {}): TokenManager {
  const {
    user = null,
    isAuthenticated = false,
  } = options;

  const mockTokenInfo: StoredTokenInfo = {
    token: isAuthenticated ? 'mock-token' : null,
    refreshToken: isAuthenticated ? 'mock-refresh-token' : null,
    expiresAt: isAuthenticated ? new Date(Date.now() + 3600000) : null,
    isValid: isAuthenticated,
    isExpired: !isAuthenticated,
  };

  const mockManager = {
    // Token management
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    getAccessToken: jest.fn().mockReturnValue(isAuthenticated ? 'mock-token' : null),
    getRefreshToken: jest.fn().mockReturnValue(isAuthenticated ? 'mock-refresh-token' : null),
    
    // Token info
    getTokenInfo: jest.fn().mockReturnValue(mockTokenInfo),

    // Token validation
    needsRefresh: jest.fn().mockReturnValue(false),

    // Token parsing
    parseTokenPayload: jest.fn().mockReturnValue(
      isAuthenticated && user
        ? {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
          }
        : null
    ),

    // API integration
    updateApiClientToken: jest.fn(),

    // User info from token
    getCurrentUserInfo: jest.fn().mockReturnValue(
      isAuthenticated && user
        ? {
            userId: user.id,
            email: user.email,
            role: user.role,
          }
        : null
    ),
  } as unknown as TokenManager;

  // Add test-specific markers for better detection
  Object.defineProperty(mockManager, '__isTestMock', {
    value: true,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  Object.defineProperty(mockManager, '__testEnvironment', {
    value: 'jest',
    writable: false,
    enumerable: false,
    configurable: false,
  });

  return mockManager;
}

/**
 * Mock user data for testing
 */
export const mockUsers = {
  user: {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'user' as const,
  },
  admin: {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as const,
  },
};

/**
 * Mock auth responses for API testing
 */
export const mockAuthResponses = {
  loginSuccess: {
    success: true,
    message: 'Login successful',
    timestamp: new Date().toISOString(),
    data: {
      user: mockUsers.user,
      token: 'mock.jwt.token',
      refreshToken: 'mock.refresh.token',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    },
  },
  loginError: {
    success: false,
    message: 'Invalid credentials',
    timestamp: new Date().toISOString(),
    error: {
      code: 'INVALID_CREDENTIALS',
      details: 'Email or password is incorrect',
    },
  },
  refreshSuccess: {
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      token: 'new.jwt.token',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    },
  },
};

/**
 * Mock AuthContext state for testing
 */
export interface MockAuthContextState {
  user?: User | null;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  error?: string | null;
  login?: jest.Mock;
  logout?: jest.Mock;
  clearError?: jest.Mock;
}

export function createMockAuthContext(state: MockAuthContextState = {}): MockAuthContextState & { login: jest.Mock; logout: jest.Mock; clearError: jest.Mock } {
  return {
    user: state.user || null,
    isAuthenticated: state.isAuthenticated || false,
    isLoading: state.isLoading || false,
    error: state.error || null,
    login: state.login || jest.fn(),
    logout: state.logout || jest.fn(),
    clearError: state.clearError || jest.fn(),
  };
}

/**
 * Utility to create authenticated mock context
 */
export function createAuthenticatedMockContext(user: User = mockUsers.user): MockAuthContextState & { login: jest.Mock; logout: jest.Mock; clearError: jest.Mock } {
  return createMockAuthContext({
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  });
}

/**
 * Utility to create unauthenticated mock context
 */
export function createUnauthenticatedMockContext(): MockAuthContextState & { login: jest.Mock; logout: jest.Mock; clearError: jest.Mock } {
  return createMockAuthContext({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
}

/**
 * Utility to create loading mock context
 */
export function createLoadingMockContext(): MockAuthContextState & { login: jest.Mock; logout: jest.Mock; clearError: jest.Mock } {
  return createMockAuthContext({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
}

/**
 * Utility to create error mock context
 */
export function createErrorMockContext(error: string = 'Authentication failed'): MockAuthContextState & { login: jest.Mock; logout: jest.Mock; clearError: jest.Mock } {
  return createMockAuthContext({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error,
  });
}