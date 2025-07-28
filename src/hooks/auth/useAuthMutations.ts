import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';
import { tokenManager } from '@/lib/auth/token';
import { appLogger } from '@/lib/monitoring/logger.config';
import type { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse 
} from '@/types/api.types';
import { LoginResponseSchema, RefreshTokenResponseSchema } from '@/types/api.types';

/**
 * Login mutation hook
 * Handles user authentication via TanStack Query
 */
export function useLoginMutation(): UseMutationResult<LoginResponse, Error, LoginRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loginData: LoginRequest): Promise<LoginResponse> => {
      appLogger.info('Login mutation started', { 
        email: loginData.email 
      });

      // API call to login endpoint
      const response = await apiClient.post<LoginResponse>('/auth/login', loginData);
      
      // Validate response with Zod
      const validatedResponse = LoginResponseSchema.parse(response);
      
      appLogger.info('Login API call successful', {
        userId: validatedResponse.data.user.id,
        email: validatedResponse.data.user.email,
      });

      return validatedResponse;
    },
    onSuccess: async (data) => {
      // Store tokens securely
      tokenManager.setTokens({
        token: data.data.token,
        refreshToken: data.data.refreshToken,
        expiresAt: data.data.expiresAt,
      });

      // Update API client with new token
      tokenManager.updateApiClientToken();

      // Invalidate relevant queries (batched for performance)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboards'] }),
      ]);

      appLogger.info('Login mutation completed successfully', {
        userId: data.data.user.id,
      });
    },
    onError: (error) => {
      appLogger.error('Login mutation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Clear any partial token data
      tokenManager.clearTokens();
    },
  });
}

/**
 * Logout mutation hook
 * Handles user logout and cleanup
 */
export function useLogoutMutation(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      appLogger.info('Logout mutation started');

      const refreshToken = tokenManager.getRefreshToken();
      
      if (refreshToken) {
        try {
          // Notify server about logout (optional - for token blacklisting)
          await apiClient.post('/auth/logout', { refreshToken });
          appLogger.debug('Server logout notification sent');
        } catch (error) {
          // Don't fail logout if server call fails
          appLogger.warn('Server logout notification failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    },
    onSuccess: () => {
      // Clear tokens
      tokenManager.clearTokens();

      // Clear all cached queries
      queryClient.clear();

      appLogger.info('Logout mutation completed successfully');
    },
    onError: (error) => {
      appLogger.error('Logout mutation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Force clear tokens even if server call failed
      tokenManager.clearTokens();
      queryClient.clear();
    },
    onSettled: () => {
      // Always redirect to login or home page after logout
      // This will be handled by the component using this hook
    },
  });
}

/**
 * Refresh token mutation hook
 * Handles token refresh for automatic renewal
 */
export function useRefreshTokenMutation(): UseMutationResult<RefreshTokenResponse, Error, void> {
  return useMutation({
    mutationFn: async (): Promise<RefreshTokenResponse> => {
      const refreshToken = tokenManager.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      appLogger.debug('Refresh token mutation started');

      const requestData: RefreshTokenRequest = { refreshToken };
      
      // API call to refresh endpoint
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', requestData);
      
      // Validate response with Zod
      const validatedResponse = RefreshTokenResponseSchema.parse(response);
      
      appLogger.debug('Refresh token API call successful');

      return validatedResponse;
    },
    onSuccess: (data) => {
      // Update stored token with new access token
      const currentTokenInfo = tokenManager.getTokenInfo();
      
      if (currentTokenInfo.refreshToken) {
        tokenManager.setTokens({
          token: data.data.token,
          refreshToken: currentTokenInfo.refreshToken, // Keep existing refresh token
          expiresAt: data.data.expiresAt,
        });

        // Update API client
        tokenManager.updateApiClientToken();

        appLogger.info('Token refresh completed successfully');
      } else {
        throw new Error('No refresh token to preserve');
      }
    },
    onError: (error) => {
      appLogger.error('Refresh token mutation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Clear tokens on refresh failure (user needs to login again)
      tokenManager.clearTokens();
    },
    retry: false, // Don't retry refresh token requests
  });
}

/**
 * Mock login mutation for development
 * Simulates API calls without actual backend
 */
export function useMockLoginMutation(): UseMutationResult<LoginResponse, Error, LoginRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loginData: LoginRequest): Promise<LoginResponse> => {
      appLogger.info('Mock login mutation started', { 
        email: loginData.email 
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful response
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        timestamp: new Date().toISOString(),
        data: {
          user: {
            id: 'mock-user-1',
            email: loginData.email,
            name: loginData.email.split('@')[0] || 'Unknown User',
            role: 'user',
          },
          token: `mock.jwt.token.${Date.now()}`,
          refreshToken: `mock.refresh.token.${Date.now()}`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        },
      };

      // Simulate login failure for testing
      if (loginData.email === 'error@test.com') {
        throw new Error('Invalid credentials');
      }

      return mockResponse;
    },
    onSuccess: (data) => {
      // Store tokens securely
      tokenManager.setTokens({
        token: data.data.token,
        refreshToken: data.data.refreshToken,
        expiresAt: data.data.expiresAt,
      });

      // Update API client with new token
      tokenManager.updateApiClientToken();

      // Invalidate relevant queries  
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

      appLogger.info('Mock login completed successfully', {
        userId: data.data.user.id,
        email: data.data.user.email,
      });
    },
    onError: (error) => {
      appLogger.error('Mock login failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      tokenManager.clearTokens();
    },
  });
}

/**
 * Mock refresh token mutation for development
 */
export function useMockRefreshTokenMutation(): UseMutationResult<RefreshTokenResponse, Error, void> {
  return useMutation({
    mutationFn: async (): Promise<RefreshTokenResponse> => {
      appLogger.debug('Mock refresh token mutation started');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockResponse: RefreshTokenResponse = {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          token: `refreshed.jwt.token.${Date.now()}`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
      };

      return mockResponse;
    },
    onSuccess: (data) => {
      const currentTokenInfo = tokenManager.getTokenInfo();
      
      if (currentTokenInfo.refreshToken) {
        tokenManager.setTokens({
          token: data.data.token,
          refreshToken: currentTokenInfo.refreshToken,
          expiresAt: data.data.expiresAt,
        });

        tokenManager.updateApiClientToken();
        appLogger.info('Mock token refresh successful');
      }
    },
    onError: (error) => {
      appLogger.error('Mock refresh token failed', { error });
      tokenManager.clearTokens();
    },
    retry: false,
  });
}