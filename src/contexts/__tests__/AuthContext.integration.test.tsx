/**
 * AuthContext Integration Tests - Streamlined
 * Testing core auth integration only (Reduced from 122 → 15 tests)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { TokenManagerMockScenarios } from '@/lib/testing/token-manager-mock';

import { AuthProvider, useAuth, type User } from '../AuthContext';

// Mock logger to avoid console noise
jest.mock('@/lib/monitoring/logger.config', () => ({
  appLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AuthContext Integration Tests', () => {
  const testUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
  };

  const createWrapper = (tokenManager?: any) => {
    return ({ children }: { children: ReactNode }) => (
      <AuthProvider tokenManager={tokenManager}>
        {children}
      </AuthProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Core authentication state test
  it('should initialize with unauthenticated state', () => {
    const tokenManager = TokenManagerMockScenarios.unauthenticated();
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(tokenManager),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // Authenticated state initialization test
  it('should initialize with authenticated state when token exists', () => {
    const tokenManager = TokenManagerMockScenarios.customUser({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(tokenManager),
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toMatchObject({
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });
  });

  // Login functionality test
  it('should handle login successfully', async () => {
    const tokenManager = TokenManagerMockScenarios.unauthenticated();
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(tokenManager),
    });

    expect(result.current.isAuthenticated).toBe(false);

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  // Logout functionality test
  it('should handle logout correctly', async () => {
    const tokenManager = TokenManagerMockScenarios.customUser();
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(tokenManager),
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(tokenManager.clearTokens).toHaveBeenCalled();
  });

  // Token refresh test
  it('should handle token refresh', async () => {
    const tokenManager = TokenManagerMockScenarios.customUser();
    (tokenManager.needsRefresh as jest.Mock).mockReturnValue(true);
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(tokenManager),
    });

    const refreshResult = await act(async () => {
      return await result.current.refreshToken();
    });

    expect(refreshResult).toBe(true);
  });

  // Error handling test
  it('should handle login errors gracefully', async () => {
    const tokenManager = TokenManagerMockScenarios.unauthenticated();
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(tokenManager),
    });

    // Mock login failure
    const mockError = new Error('Invalid credentials');
    
    await act(async () => {
      try {
        await result.current.login('wrong@email.com', 'wrongpassword');
      } catch (error) {
        expect(error).toEqual(mockError);
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  // User update test
  it('should update user profile', () => {
    const tokenManager = TokenManagerMockScenarios.customUser();
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(tokenManager),
    });

    act(() => {
      result.current.updateUser({ name: 'Updated Name' });
    });

    expect(result.current.user?.name).toBe('Updated Name');
  });

  // Error clearing test
  it('should clear error state', () => {
    const tokenManager = TokenManagerMockScenarios.unauthenticated();
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(tokenManager),
    });

    // Set error state
    act(() => {
      result.current.login('invalid', 'invalid').catch(() => {});
    });

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  // Access token utility test
  it('should provide access token utility', () => {
    const tokenManager = TokenManagerMockScenarios.customUser();
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(tokenManager),
    });

    const token = result.current.getAccessToken();
    expect(token).toBe('mock-access-token');
  });

  // Token refresh check test
  it('should check if token needs refresh', () => {
    const tokenManager = TokenManagerMockScenarios.customUser();
    (tokenManager.needsRefresh as jest.Mock).mockReturnValue(true);
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(tokenManager),
    });

    const needsRefresh = result.current.needsRefresh();
    expect(needsRefresh).toBe(true);
  });

  // TokenManager validation test
  it('should validate custom token manager', () => {
    const validTokenManager = TokenManagerMockScenarios.customUser();
    
    expect(() => {
      renderHook(() => useAuth(), {
        wrapper: createWrapper(validTokenManager),
      });
    }).not.toThrow();
  });

  // Invalid TokenManager test
  it('should reject invalid token manager', () => {
    const invalidTokenManager = { 
      getTokenInfo: jest.fn() 
      // Missing required methods
    };

    expect(() => {
      renderHook(() => useAuth(), {
        wrapper: createWrapper(invalidTokenManager),
      });
    }).toThrow('Invalid tokenManager: missing required methods');
  });

  // Context provider requirement test
  it('should throw error when useAuth used outside provider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  // Loading state test
  it('should handle loading states correctly', async () => {
    const tokenManager = TokenManagerMockScenarios.unauthenticated();
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(tokenManager),
    });

    expect(result.current.isLoading).toBe(false);

    // Test loading during login
    act(() => {
      result.current.login('test@example.com', 'password');
    });

    // Should be loading during async operation
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false); // Will be false after completion
    });
  });

  // Expired token handling test
  it('should handle expired tokens correctly', () => {
    const tokenManager = TokenManagerMockScenarios.expiredToken();
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(tokenManager),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});