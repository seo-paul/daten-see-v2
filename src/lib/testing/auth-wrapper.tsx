/**
 * Enhanced Auth Test Wrappers with Dependency Injection Support
 * Provides easy-to-use wrappers for different authentication test scenarios
 */

import React from 'react';

import { AuthProvider } from '@/contexts/AuthContext';
import type { TokenManager } from '@/lib/auth/token';

import { TestQueryWrapper } from './query-wrapper';
import { 
  TokenManagerMockScenarios 
} from './token-manager-mock';

export interface AuthWrapperProps {
  children: React.ReactNode;
  tokenManager?: TokenManager;
}

/**
 * Base Auth Wrapper with DI support
 */
export function BaseAuthWrapper({ children, tokenManager }: AuthWrapperProps): React.ReactElement {
  return (
    <TestQueryWrapper>
      <AuthProvider {...(tokenManager && { tokenManager })}>
        {children}
      </AuthProvider>
    </TestQueryWrapper>
  );
}

/**
 * Unauthenticated User Wrapper
 * User starts with no authentication
 */
export function UnauthenticatedWrapper({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <BaseAuthWrapper tokenManager={TokenManagerMockScenarios.unauthenticated()}>
      {children}
    </BaseAuthWrapper>
  );
}

/**
 * Authenticated User Wrapper
 * User starts authenticated with default user profile
 */
export function AuthenticatedWrapper({ 
  children,
  userOverrides 
}: { 
  children: React.ReactNode;
  userOverrides?: {
    userId?: string;
    email?: string;
    role?: 'user' | 'admin';
  };
}): React.ReactElement {
  return (
    <BaseAuthWrapper tokenManager={TokenManagerMockScenarios.customUser(userOverrides)}>
      {children}
    </BaseAuthWrapper>
  );
}

/**
 * Admin User Wrapper
 * User starts authenticated as admin
 */
export function AdminWrapper({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <BaseAuthWrapper tokenManager={TokenManagerMockScenarios.authenticatedAdmin()}>
      {children}
    </BaseAuthWrapper>
  );
}

/**
 * Expired Token Wrapper
 * User starts with expired authentication
 */
export function ExpiredTokenWrapper({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <BaseAuthWrapper tokenManager={TokenManagerMockScenarios.expiredToken()}>
      {children}
    </BaseAuthWrapper>
  );
}

/**
 * Custom TokenManager Wrapper
 * For complex test scenarios requiring custom TokenManager behavior
 */
export function CustomTokenManagerWrapper({ 
  children, 
  tokenManager 
}: AuthWrapperProps): React.ReactElement {
  return (
    <BaseAuthWrapper {...(tokenManager && { tokenManager })}>
      {children}
    </BaseAuthWrapper>
  );
}

// Export convenience type
export type AuthTestScenario = 
  | 'unauthenticated' 
  | 'authenticated' 
  | 'admin' 
  | 'expired'
  | 'custom';

/**
 * Universal Auth Wrapper - choose scenario via prop
 */
export function UniversalAuthWrapper({ 
  children, 
  scenario = 'unauthenticated',
  tokenManager,
  userOverrides 
}: { 
  children: React.ReactNode;
  scenario?: AuthTestScenario;
  tokenManager?: TokenManager;
  userOverrides?: {
    userId?: string;
    email?: string;
    role?: 'user' | 'admin';
  };
}): React.ReactElement {
  
  if (scenario === 'custom' && tokenManager) {
    return <CustomTokenManagerWrapper tokenManager={tokenManager}>{children}</CustomTokenManagerWrapper>;
  }

  switch (scenario) {
    case 'authenticated':
      return <AuthenticatedWrapper {...(userOverrides && { userOverrides })}>{children}</AuthenticatedWrapper>;
    case 'admin':
      return <AdminWrapper>{children}</AdminWrapper>;
    case 'expired':
      return <ExpiredTokenWrapper>{children}</ExpiredTokenWrapper>;
    case 'unauthenticated':
    default:
      return <UnauthenticatedWrapper>{children}</UnauthenticatedWrapper>;
  }
}