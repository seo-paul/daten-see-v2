'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { tokenManager } from '@/lib/auth/token';
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

// Props interface
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Context Provider
 * Manages user authentication state without Zustand
 * Uses React Context + TanStack Query for server state
 */
export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
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

        const tokenInfo = tokenManager.getTokenInfo();
        
        if (tokenInfo.isValid && tokenInfo.token) {
          // Get user info from token
          const userInfo = tokenManager.getCurrentUserInfo();
          
          if (userInfo?.userId && userInfo?.email) {
            const user: User = {
              id: userInfo.userId,
              email: userInfo.email,
              name: userInfo.email.split('@')[0], // Fallback name
              role: (userInfo.role as 'user' | 'admin') || 'user',
            };

            // Update API client with token
            tokenManager.updateApiClientToken();

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
        tokenManager.clearTokens();
        
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication initialization failed',
        });
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token when needed
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const checkTokenRefresh = async (): Promise<void> => {
      if (tokenManager.needsRefresh()) {
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

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, refreshToken]);

  // Login function (will be enhanced with TanStack mutation)
  const login = async (email: string, _password: string): Promise<void> => {
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
        name: email.split('@')[0],
        role: 'user',
      };

      // Store tokens
      tokenManager.setTokens(mockTokenData);
      tokenManager.updateApiClientToken();

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
      userId: authState.user?.id,
    });

    // Clear tokens
    tokenManager.clearTokens();

    // Reset auth state
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    appLogger.info('Logout completed');
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = tokenManager.getRefreshToken();
      
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

      tokenManager.setTokens(mockTokenData);
      tokenManager.updateApiClientToken();

      appLogger.info('Token refresh successful');
      return true;

    } catch (error) {
      appLogger.error('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Force logout on refresh failure
      logout();
      return false;
    }
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
    return tokenManager.getAccessToken();
  };

  const needsRefresh = (): boolean => {
    return tokenManager.needsRefresh();
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