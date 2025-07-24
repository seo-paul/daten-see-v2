/**
 * Integration tests for AuthContext
 * Tests the complete authentication flow with token management
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';

import { TestQueryWrapper } from '@/lib/testing';

import { AuthProvider, useAuth } from '../AuthContext';

// Mock the token manager
jest.mock('@/lib/auth/token', () => ({
  tokenManager: {
    getTokenInfo: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    updateApiClientToken: jest.fn(),
    getCurrentUserInfo: jest.fn(),
    needsRefresh: jest.fn(),
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
  },
}));

// Mock logger
jest.mock('@/lib/monitoring/logger.config', () => ({
  appLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Test component that uses auth context
function TestComponent(): React.ReactElement {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="user-info">
        {user ? `${user.name} (${user.email})` : 'no-user'}
      </div>
      <button 
        data-testid="login-btn" 
        onClick={() => login('test@example.com', 'password')}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

// Test wrapper with providers
function TestWrapper({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <TestQueryWrapper>
      <AuthProvider>
        {children}
      </AuthProvider>
    </TestQueryWrapper>
  );
}

// Get mocked token manager for assertions
const { tokenManager: mockTokenManager } = jest.requireMock('@/lib/auth/token');

describe('AuthContext Integration', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockTokenManager.getTokenInfo.mockReturnValue({
      token: null,
      refreshToken: null,
      expiresAt: null,
      isValid: false,
      isExpired: true,
    });
    
    mockTokenManager.getCurrentUserInfo.mockReturnValue(null);
    mockTokenManager.needsRefresh.mockReturnValue(false);
    mockTokenManager.getAccessToken.mockReturnValue(null);
    mockTokenManager.getRefreshToken.mockReturnValue(null);
  });

  test('should initialize with no authentication', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Should eventually show not authenticated (may skip loading state in tests)
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('no-user');
  });

  test('should restore authentication from stored tokens', async () => {
    // Mock valid stored tokens
    mockTokenManager.getTokenInfo.mockReturnValue({
      token: 'stored.jwt.token',
      refreshToken: 'stored.refresh.token',
      expiresAt: new Date(Date.now() + 60000), // 1 minute from now
      isValid: true,
      isExpired: false,
    });

    mockTokenManager.getCurrentUserInfo.mockReturnValue({
      userId: 'user-123',
      email: 'stored@example.com',
      role: 'user',
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('stored (stored@example.com)');
    expect(mockTokenManager.updateApiClientToken).toHaveBeenCalled();
  });

  test('should handle invalid stored tokens', async () => {
    // Mock invalid stored tokens
    mockTokenManager.getTokenInfo.mockReturnValue({
      token: 'invalid.jwt.token',
      refreshToken: 'invalid.refresh.token',
      expiresAt: new Date(Date.now() - 60000), // Expired
      isValid: false,
      isExpired: true,
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('no-user');
  });

  test('should handle login flow', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    // Mock successful login
    const loginBtn = screen.getByTestId('login-btn');
    await act(async () => {
      loginBtn.click();
    });

    // Should show loading during login
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('loading');
    });

    // Should complete login (mocked)
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    }, { timeout: 2000 });

    expect(mockTokenManager.setTokens).toHaveBeenCalled();
    expect(mockTokenManager.updateApiClientToken).toHaveBeenCalled();
  });

  test('should handle logout flow', async () => {
    // Start with authenticated user
    mockTokenManager.getTokenInfo.mockReturnValue({
      token: 'valid.jwt.token',
      refreshToken: 'valid.refresh.token',
      expiresAt: new Date(Date.now() + 60000),
      isValid: true,
      isExpired: false,
    });

    mockTokenManager.getCurrentUserInfo.mockReturnValue({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'user',
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // Perform logout
    const logoutBtn = screen.getByTestId('logout-btn');
    await act(async () => {
      logoutBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('no-user');
    expect(mockTokenManager.clearTokens).toHaveBeenCalled();
  });

  test('should provide token utilities', async () => {
    const mockAccessToken = 'current.access.token';
    mockTokenManager.getAccessToken.mockReturnValue(mockAccessToken);
    mockTokenManager.needsRefresh.mockReturnValue(false);

    let authContext: any;

    function TestUtilities(): React.ReactElement {
      authContext = useAuth();
      return <div>test</div>;
    }

    render(
      <TestWrapper>
        <TestUtilities />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(authContext).toBeDefined();
    });

    expect(authContext.getAccessToken()).toBe(mockAccessToken);
    expect(authContext.needsRefresh()).toBe(false);
  });
});