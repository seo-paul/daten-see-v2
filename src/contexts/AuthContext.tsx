'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

import { tokenManager, type TokenManager } from '@/lib/auth/token';
import { appLogger } from '@/lib/monitoring/logger.config';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth context interface
export interface AuthContextType extends AuthState {
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  
  // User actions
  updateUser: (updates: Partial<Pick<User, 'name' | 'avatar'>>) => void;
  
  // Token utilities
  getAccessToken: () => string | null;
  needsRefresh: () => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props interface with optional dependency injection
interface AuthProviderProps {
  children: ReactNode;
  tokenManager?: TokenManager; // Optional for testing and flexibility
}

/**
 * Authentication Context Provider
 * Manages user authentication state without Zustand
 * Uses React Context + TanStack Query for server state
 */
export function AuthProvider({ children, tokenManager: injectedTokenManager }: AuthProviderProps): React.ReactElement {
  // Dependency Injection: Use injected tokenManager or default to singleton
  const activeTokenManager = injectedTokenManager ?? tokenManager;
  
  // Production safety check
  if (process.env.NODE_ENV === 'production' && injectedTokenManager && injectedTokenManager !== tokenManager) {
    appLogger.warn('Custom tokenManager injected in production environment', {
      isCustomTokenManager: true,
      hasInjectedTokenManager: !!injectedTokenManager,
    });
  }
  
  // Comprehensive TokenManager Interface Validation
  if (injectedTokenManager) {
    // Type validation
    if (typeof injectedTokenManager !== 'object' || injectedTokenManager === null) {
      throw new Error('Invalid tokenManager: must be a non-null object');
    }

    // Required methods validation
    const requiredMethods = [
      'getTokenInfo',
      'setTokens', 
      'clearTokens',
      'updateApiClientToken',
      'getCurrentUserInfo',
      'needsRefresh',
      'getAccessToken',
      'getRefreshToken',
      'parseTokenPayload'
    ];

    const missingMethods = requiredMethods.filter(method => 
      !injectedTokenManager[method as keyof TokenManager] || typeof injectedTokenManager[method as keyof TokenManager] !== 'function'
    );

    if (missingMethods.length > 0) {
      throw new Error(`Invalid tokenManager: missing required methods: ${missingMethods.join(', ')}. TokenManager must implement the full interface.`);
    }

    // Production environment extra validation
    if (process.env.NODE_ENV === 'production') {
      // Check if this looks like a test mock (suspicious patterns)
      const mockIndicators = [
        injectedTokenManager.constructor?.name === 'Object', // Plain object (likely mock)
        'mockReturnValue' in injectedTokenManager.getTokenInfo, // Jest mock function
        injectedTokenManager.getTokenInfo.toString().includes('jest'), // Jest signature
      ];

      if (mockIndicators.some(Boolean)) {
        appLogger.error('Suspicious tokenManager detected in production', {
          constructorName: injectedTokenManager.constructor?.name,
          hasMockSignature: mockIndicators[1],
          hasJestSignature: mockIndicators[2],
          isProduction: true,
        });
        
        // In production, reject obvious test mocks
        throw new Error('Invalid tokenManager: test mocks are not allowed in production environment');
      }
    }

    appLogger.debug('TokenManager validation passed', {
      isInjected: true,
      methodCount: requiredMethods.length,
      environment: process.env.NODE_ENV,
    });
  }
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading to check existing tokens
    error: null,
  });

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        appLogger.debug('Initializing authentication state');

        const tokenInfo = activeTokenManager.getTokenInfo();
        
        if (tokenInfo.isValid && tokenInfo.token) {
          // Get user info from token
          const userInfo = activeTokenManager.getCurrentUserInfo();
          
          if (userInfo?.userId && userInfo?.email) {
            const user: User = {
              id: userInfo.userId!,
              email: userInfo.email,
              name: userInfo.email.split('@')[0] || 'Unknown User', // Fallback name
              role: (userInfo.role as 'user' | 'admin') || 'user',
            };

            // Update API client with token
            activeTokenManager.updateApiClientToken();

            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            appLogger.info('Authentication restored from stored token', {
              userId: user.id,
              email: user.email,
              role: user.role,
            });
          } else {
            throw new Error('Invalid token payload');
          }
        } else {
          // No valid token found
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          appLogger.debug('No valid authentication token found');
        }
      } catch (error) {
        appLogger.error('Failed to initialize authentication', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Clear invalid tokens
        activeTokenManager.clearTokens();
        
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication initialization failed',
        });
      }
    };

    initializeAuth();
  }, [activeTokenManager]);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshTokenValue = activeTokenManager.getRefreshToken();
      
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      appLogger.debug('Token refresh attempt started');

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock successful refresh
      const mockTokenData = {
        token: 'refreshed.jwt.token',
        refreshToken: refreshTokenValue, // Keep same refresh token
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      activeTokenManager.setTokens(mockTokenData);
      activeTokenManager.updateApiClientToken();

      appLogger.info('Token refresh successful');
      return true;

    } catch (error) {
      appLogger.error('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Clear tokens and update state on refresh failure
      activeTokenManager.clearTokens();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return false;
    }
  }, [activeTokenManager]);

  // Auto-refresh token when needed
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const checkTokenRefresh = async (): Promise<void> => {
      if (activeTokenManager.needsRefresh()) {
        appLogger.debug('Token needs refresh, attempting refresh');
        refreshToken().catch((error) => {
          appLogger.error('Auto token refresh failed', { error });
        });
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenRefresh, 5 * 60 * 1000);
    
    // Check immediately
    checkTokenRefresh();

    return (): void => clearInterval(interval);
  }, [authState.isAuthenticated, refreshToken, activeTokenManager]);

  // Login function (will be enhanced with TanStack mutation)
  const login = async (email: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      appLogger.info('Login attempt started', { email });

      // TODO: Replace with actual API call via TanStack mutation
      // For now, mock successful login
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful response
      const mockTokenData = {
        token: 'mock.jwt.token',
        refreshToken: 'mock.refresh.token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      };

      const mockUser: User = {
        id: 'user-1',
        email,
        name: email.split('@')[0] || 'Unknown User',
        role: 'user',
      };

      // Store tokens
      activeTokenManager.setTokens(mockTokenData);
      activeTokenManager.updateApiClientToken();

      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      appLogger.info('Login successful', {
        userId: mockUser.id,
        email: mockUser.email,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      appLogger.error('Login failed', {
        email,
        error: errorMessage,
      });

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    appLogger.info('Logout started', {
      ...(authState.user?.id && { userId: authState.user.id }),
    });

    // Clear tokens using active token manager
    activeTokenManager.clearTokens();

    // Reset auth state
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    appLogger.info('Logout completed');
  };


  // Clear error
  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Update user profile
  const updateUser = (updates: Partial<Pick<User, 'name' | 'avatar'>>): void => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...updates };

    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));

    appLogger.info('User profile updated', {
      userId: updatedUser.id,
      updates,
    });
  };

  // Token utilities
  const getAccessToken = (): string | null => {
    return activeTokenManager.getAccessToken();
  };

  const needsRefresh = (): boolean => {
    return activeTokenManager.needsRefresh();
  };

  // Context value
  const contextValue: AuthContextType = {
    // State
    ...authState,
    
    // Actions
    login,
    logout,
    refreshToken,
    clearError,
    updateUser,
    
    // Utilities
    getAccessToken,
    needsRefresh,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Export types
export { AuthContext };