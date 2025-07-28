import { appLogger } from '@/lib/monitoring/logger.config';

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Token interfaces
export interface TokenData {
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface StoredTokenInfo {
  token: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  isValid: boolean;
  isExpired: boolean;
}

export interface TokenManager {
  isClient: boolean;
  setTokens(tokenData: TokenData): void;
  getTokenInfo(): StoredTokenInfo;
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  needsRefresh(): boolean;
  clearTokens(): void;
  updateApiClientToken(): void;
  parseTokenPayload(token: string): Record<string, unknown> | null;
  getCurrentUserInfo(): { userId?: string; email?: string; role?: string } | null;
}

/**
 * Secure Token Manager Implementation
 * Handles JWT token storage, validation, and expiration checks
 * Uses localStorage for client-side storage (will be enhanced with httpOnly cookies later)
 */
class TokenManagerImpl implements TokenManager {
  public isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  /**
   * Store authentication tokens securely
   */
  public setTokens(tokenData: TokenData): void {
    if (!this.isClient) {
      appLogger.warn('Token storage attempted on server side');
      return;
    }

    try {
      localStorage.setItem(TOKEN_KEY, tokenData.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refreshToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, tokenData.expiresAt);

      appLogger.debug('Tokens stored successfully', {
        expiresAt: tokenData.expiresAt,
        hasToken: !!tokenData.token,
        hasRefreshToken: !!tokenData.refreshToken,
      });
    } catch (error) {
      appLogger.error('Failed to store tokens', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Token storage failed');
    }
  }

  /**
   * Retrieve stored tokens with validation
   */
  public getTokenInfo(): StoredTokenInfo {
    if (!this.isClient) {
      return {
        token: null,
        refreshToken: null,
        expiresAt: null,
        isValid: false,
        isExpired: true,
      };
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const expiryString = localStorage.getItem(TOKEN_EXPIRY_KEY);

      const expiresAt = expiryString ? new Date(expiryString) : null;
      const now = new Date();

      const isExpired = expiresAt ? expiresAt <= now : true;
      const isValid = !!(token && refreshToken && expiresAt && !isExpired);

      if (token && isExpired) {
        appLogger.debug('Token expired', {
          expiresAt: expiresAt?.toISOString(),
          now: now.toISOString(),
        });
      }

      return {
        token,
        refreshToken,
        expiresAt,
        isValid,
        isExpired,
      };
    } catch (error) {
      appLogger.error('Failed to retrieve tokens', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        token: null,
        refreshToken: null,
        expiresAt: null,
        isValid: false,
        isExpired: true,
      };
    }
  }

  /**
   * Get current valid access token
   */
  public getAccessToken(): string | null {
    const tokenInfo = this.getTokenInfo();
    return tokenInfo.isValid ? tokenInfo.token : null;
  }

  /**
   * Get refresh token for token renewal
   */
  public getRefreshToken(): string | null {
    const tokenInfo = this.getTokenInfo();
    return tokenInfo.refreshToken;
  }

  /**
   * Check if token needs refresh (expires in next 5 minutes)
   */
  public needsRefresh(): boolean {
    const tokenInfo = this.getTokenInfo();
    
    if (!tokenInfo.expiresAt || !tokenInfo.token) {
      return false;
    }

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    return tokenInfo.expiresAt <= fiveMinutesFromNow;
  }

  /**
   * Clear all stored tokens
   */
  public clearTokens(): void {
    if (!this.isClient) {
      return;
    }

    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);

      appLogger.debug('Tokens cleared successfully');
    } catch (error) {
      appLogger.error('Failed to clear tokens', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update API client with current token
   */
  public updateApiClientToken(): void {
    const token = this.getAccessToken();
    
    if (token) {
      // Import dynamically to avoid circular dependency
      import('@/lib/api/client').then(({ apiClient }) => {
        apiClient.setAuthToken(token);
        appLogger.debug('API client token updated');
      }).catch((error) => {
        appLogger.error('Failed to update API client token', { error });
      });
    } else {
      // Clear token from API client
      import('@/lib/api/client').then(({ apiClient }) => {
        apiClient.clearAuthToken();
        appLogger.debug('API client token cleared');
      }).catch((error) => {
        appLogger.error('Failed to clear API client token', { error });
      });
    }
  }

  /**
   * Parse JWT token payload (without verification - for client-side info only)
   */
  public parseTokenPayload(token: string): Record<string, unknown> | null {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      appLogger.warn('Failed to parse token payload', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Get user info from current token
   */
  public getCurrentUserInfo(): { userId?: string; email?: string; role?: string } | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const payload = this.parseTokenPayload(token);
    if (!payload) return null;

    return {
      userId: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  }
}

// Export singleton instance
export const tokenManager = new TokenManagerImpl();