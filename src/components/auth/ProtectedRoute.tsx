'use client';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { ReactNode, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { appLogger } from '@/lib/monitoring/logger.config';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'user' | 'admin';
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * Protected Route Wrapper Component
 * Handles authentication and authorization for routes
 * Works with the AuthContext (no Zustand dependency)
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/login',
  fallback
}: ProtectedRouteProps): React.ReactElement {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) {
      return;
    }

    setHasChecked(true);

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      appLogger.warn('Access denied: User not authenticated', {
        requireAuth,
        isAuthenticated,
        redirectTo
      });
      
      router.push(redirectTo as Route);
      return;
    }

    // Check role requirement
    if (requiredRole && user?.role !== requiredRole) {
      appLogger.warn('Access denied: Insufficient permissions', {
        requiredRole,
        userRole: user?.role,
        userId: user?.id
      });
      
      // Redirect to appropriate page based on user status
      if (!isAuthenticated) {
        router.push(redirectTo as Route);
      } else {
        router.push('/unauthorized' as Route); // Could be a 403 page
      }
      return;
    }

    // Access granted
    if (requireAuth && isAuthenticated) {
      appLogger.debug('Route access granted', {
        userId: user?.id,
        userRole: user?.role,
        requiredRole
      });
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requiredRole, redirectTo, router]);

  // Show loading state while checking auth
  if (isLoading || !hasChecked) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show children if all checks pass
  if (!requireAuth || (isAuthenticated && (!requiredRole || user?.role === requiredRole))) {
    return <>{children}</>;
  }

  // This should not be reached due to redirects above, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    </div>
  );
}

/**
 * Higher-order component for protecting pages
 * Usage: export default withProtectedRoute(MyPage, { requireAuth: true })
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  protection: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P): React.ReactElement {
    return (
      <ProtectedRoute {...protection}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook for route protection logic (can be used in pages directly)
 */
export function useRouteProtection(options: {
  requireAuth?: boolean;
  requiredRole?: 'user' | 'admin';
  redirectTo?: string;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { requireAuth = true, requiredRole, redirectTo = '/login' } = options;

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo as Route);
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      if (!isAuthenticated) {
        router.push(redirectTo as Route);
      } else {
        router.push('/unauthorized' as Route);
      }
      return;
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requiredRole, redirectTo, router]);

  return {
    isLoading,
    isAuthenticated,
    user,
    hasAccess: !requireAuth || (isAuthenticated && (!requiredRole || user?.role === requiredRole))
  };
}