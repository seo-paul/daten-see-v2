/**
 * Mock Token Manager for Testing
 * Provides comprehensive mock implementation for all TokenManager methods
 * Supports flexible test scenarios with proper TypeScript typing
 */

import type { TokenData, StoredTokenInfo } from '../token';

// Pre-declare type for self-reference
type MockTokenManagerType = {
  setTokens: jest.MockedFunction<(data: TokenData) => void>;
  clearTokens: jest.MockedFunction<() => void>;
  getTokenInfo: jest.MockedFunction<() => StoredTokenInfo>;
  getAccessToken: jest.MockedFunction<() => string | null>;
  getRefreshToken: jest.MockedFunction<() => string | null>;
  needsRefresh: jest.MockedFunction<() => boolean>;
  updateApiClientToken: jest.MockedFunction<() => void>;
  getCurrentUserInfo: jest.MockedFunction<() => { userId?: string; email?: string; role?: string } | null>;
  parseTokenPayload: jest.MockedFunction<(token: string) => Record<string, unknown> | null>;
};

// Mock implementation factory
export const createMockTokenManager = (): MockTokenManagerType => ({
  // Token storage methods
  setTokens: jest.fn<void, [TokenData]>(),
  clearTokens: jest.fn<void, []>(),
  
  // Token retrieval methods
  getTokenInfo: jest.fn<StoredTokenInfo, []>().mockReturnValue({
    token: null,
    refreshToken: null,
    expiresAt: null,
    isValid: false,
    isExpired: true,
  }),
  
  getAccessToken: jest.fn<string | null, []>().mockReturnValue(null),
  getRefreshToken: jest.fn<string | null, []>().mockReturnValue(null),
  
  // Token validation methods
  needsRefresh: jest.fn<boolean, []>().mockReturnValue(false),
  
  // API integration methods
  updateApiClientToken: jest.fn<void, []>(),
  
  // User info methods
  getCurrentUserInfo: jest.fn<{ userId?: string; email?: string; role?: string } | null, []>()
    .mockReturnValue(null),
    
  // Token parsing (the problematic method causing "URI malformed")
  parseTokenPayload: jest.fn<Record<string, unknown> | null, [string]>()
    .mockReturnValue(null),
});

// Export default mock instance for Jest manual mocks
export const tokenManager = createMockTokenManager();

// Export types for better TypeScript support
export type MockTokenManager = MockTokenManagerType;

// Helper function to create specific test scenarios
export const createAuthenticatedMockState = (userInfo: {
  userId: string;
  email: string;
  role: string;
  name?: string;
}): MockTokenManager => {
  const mockManager = createMockTokenManager();
  
  // Configure for authenticated state
  mockManager.getTokenInfo.mockReturnValue({
    token: 'valid.jwt.token',
    refreshToken: 'valid.refresh.token',
    expiresAt: new Date(Date.now() + 60000), // 1 minute from now
    isValid: true,
    isExpired: false,
  });
  
  mockManager.getAccessToken.mockReturnValue('valid.jwt.token');
  mockManager.getRefreshToken.mockReturnValue('valid.refresh.token');
  mockManager.needsRefresh.mockReturnValue(false);
  
  mockManager.getCurrentUserInfo.mockReturnValue({
    userId: userInfo.userId,
    email: userInfo.email,
    role: userInfo.role,
  });
  
  // Mock valid JWT payload
  mockManager.parseTokenPayload.mockReturnValue({
    sub: userInfo.userId,
    email: userInfo.email,
    role: userInfo.role,
    exp: Math.floor((Date.now() + 60000) / 1000), // 1 minute from now
    iat: Math.floor(Date.now() / 1000),
  });
  
  return mockManager;
};

export const createUnauthenticatedMockState = (): MockTokenManager => {
  const mockManager = createMockTokenManager();
  
  // All default values are already unauthenticated
  return mockManager;
};

export const createExpiredTokenMockState = (): MockTokenManager => {
  const mockManager = createMockTokenManager();
  
  // Configure for expired token state
  mockManager.getTokenInfo.mockReturnValue({
    token: 'expired.jwt.token',
    refreshToken: 'expired.refresh.token',
    expiresAt: new Date(Date.now() - 60000), // 1 minute ago
    isValid: false,
    isExpired: true,
  });
  
  mockManager.needsRefresh.mockReturnValue(true);
  
  return mockManager;
};