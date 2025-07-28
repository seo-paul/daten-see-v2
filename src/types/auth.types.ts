/**
 * Authentication Types
 * Core types for authentication and authorization
 */

// Extract User type from API types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Auth state types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth context methods
export interface AuthActions {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Combined auth context interface
export interface AuthContextType extends AuthState, AuthActions {}

// Token information
export interface TokenInfo {
  token: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
}

// Token payload (JWT claims)
export interface TokenPayload {
  sub: string; // User ID
  email: string;
  name: string;
  role: 'user' | 'admin';
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
  [key: string]: unknown; // Additional claims
}

// Auth storage interface
export interface AuthStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

// Role definitions
export type UserRole = 'user' | 'admin';

// Permission definitions
export interface Permission {
  resource: string;
  action: string;
}

// Route protection options
export interface RouteProtectionOptions {
  requireAuth?: boolean;
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
  redirectTo?: string;
}

// Auth provider configuration
export interface AuthProviderConfig {
  apiBaseUrl?: string;
  tokenStorageKey?: string;
  refreshTokenStorageKey?: string;
  autoRefresh?: boolean;
  refreshThreshold?: number; // Minutes before expiry to refresh
}

// Auth hook return types
export interface UseAuthReturn extends AuthState {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refresh: () => Promise<void>;
}

export interface UseRouteProtectionReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  hasAccess: boolean;
}

// Auth event types
export type AuthEvent = 
  | 'login'
  | 'logout' 
  | 'token_refresh'
  | 'token_expired'
  | 'auth_error';

export interface AuthEventData {
  type: AuthEvent;
  user?: User | null;
  error?: string;
  timestamp: number;
}

// Auth listener callback
export type AuthEventListener = (data: AuthEventData) => void;