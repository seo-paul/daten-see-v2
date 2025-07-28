/**
 * Token Manager Mock Scenarios
 * Complete implementation for auth testing
 */

import type { TokenManager, StoredTokenInfo } from '@/lib/auth/token';

export const TokenManagerMockScenarios = {
  unauthenticated: (): TokenManager => ({
    isClient: true,
    getAccessToken: jest.fn(() => null),
    getRefreshToken: jest.fn(() => null),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    getTokenInfo: jest.fn(() => ({
      token: null,
      refreshToken: null,
      expiresAt: null,
      isValid: false,
      isExpired: true,
    } as StoredTokenInfo)),
    updateApiClientToken: jest.fn(),
    getCurrentUserInfo: jest.fn(() => null),
    needsRefresh: jest.fn(() => false),
    parseTokenPayload: jest.fn(() => null),
  } as TokenManager),

  customUser: (overrides?: { userId?: string; email?: string; role?: 'user' | 'admin' }): TokenManager => ({
    isClient: true,
    getAccessToken: jest.fn(() => 'mock-access-token'),
    getRefreshToken: jest.fn(() => 'mock-refresh-token'),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    getTokenInfo: jest.fn(() => ({
      token: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 3600000),
      isValid: true,
      isExpired: false,
    } as StoredTokenInfo)),
    updateApiClientToken: jest.fn(),
    getCurrentUserInfo: jest.fn(() => ({
      userId: overrides?.userId || 'test-user-id',
      email: overrides?.email || 'test@example.com',
      role: overrides?.role || 'user',
    })),
    needsRefresh: jest.fn(() => false),
    parseTokenPayload: jest.fn(() => ({
      sub: overrides?.userId || 'test-user-id',
      email: overrides?.email || 'test@example.com',
      role: overrides?.role || 'user',
      exp: Math.floor((Date.now() + 3600000) / 1000),
      iat: Math.floor(Date.now() / 1000),
    })),
  } as TokenManager),

  authenticatedAdmin: (): TokenManager => ({
    isClient: true,
    getAccessToken: jest.fn(() => 'mock-admin-token'),
    getRefreshToken: jest.fn(() => 'mock-admin-refresh'),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    getTokenInfo: jest.fn(() => ({
      token: 'mock-admin-token',
      refreshToken: 'mock-admin-refresh',
      expiresAt: new Date(Date.now() + 3600000),
      isValid: true,
      isExpired: false,
    } as StoredTokenInfo)),
    updateApiClientToken: jest.fn(),
    getCurrentUserInfo: jest.fn(() => ({
      userId: 'admin-user-id',
      email: 'admin@example.com',
      role: 'admin',
    })),
    needsRefresh: jest.fn(() => false),
    parseTokenPayload: jest.fn(() => ({
      sub: 'admin-user-id',
      email: 'admin@example.com',
      role: 'admin',
      exp: Math.floor((Date.now() + 3600000) / 1000),
      iat: Math.floor(Date.now() / 1000),
    })),
  } as TokenManager),

  expiredToken: (): TokenManager => ({
    isClient: true,
    getAccessToken: jest.fn(() => null),
    getRefreshToken: jest.fn(() => 'expired-refresh'),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    getTokenInfo: jest.fn(() => ({
      token: 'expired-token',
      refreshToken: 'expired-refresh',
      expiresAt: new Date(Date.now() - 3600000),
      isValid: false,
      isExpired: true,
    } as StoredTokenInfo)),
    updateApiClientToken: jest.fn(),
    getCurrentUserInfo: jest.fn(() => null),
    needsRefresh: jest.fn(() => true),
    parseTokenPayload: jest.fn(() => null),
  } as TokenManager),

  // Alias for backward compatibility
  authenticatedUser: (overrides?: { userId?: string; email?: string; role?: 'user' | 'admin' }): TokenManager => {
    return TokenManagerMockScenarios.customUser(overrides);
  },
};

/**
 * Create a fresh mock TokenManager with all methods as jest.fn()
 * Useful for tests that need to customize behavior extensively
 */
export function createMockTokenManager(): TokenManager {
  return {
    isClient: true,
    getAccessToken: jest.fn(() => null),
    getRefreshToken: jest.fn(() => null),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    getTokenInfo: jest.fn(() => ({
      token: null,
      refreshToken: null,
      expiresAt: null,
      isValid: false,
      isExpired: true,
    } as StoredTokenInfo)),
    updateApiClientToken: jest.fn(),
    getCurrentUserInfo: jest.fn(() => null),
    needsRefresh: jest.fn(() => false),
    parseTokenPayload: jest.fn(() => null),
  } as TokenManager;
}