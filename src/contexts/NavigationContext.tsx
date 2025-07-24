'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { appLogger } from '@/lib/monitoring/logger.config';

// Breadcrumb interface
export interface Breadcrumb {
  label: string;
  href: string;
  isActive?: boolean;
}

// Navigation state interface
export interface NavigationState {
  currentPath: string;
  previousPath: string | null;
  breadcrumbs: Breadcrumb[];
  pageTitle: string;
}

// Navigation context interface
export interface NavigationContextType extends NavigationState {
  // Navigation actions
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  setPageTitle: (title: string) => void;
  
  // Navigation utilities
  generateBreadcrumbs: (pathname: string) => Breadcrumb[];
  goBack: () => void;
}

// Create context
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Props interface
interface NavigationProviderProps {
  children: ReactNode;
}

// Route to label mapping
const ROUTE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/dashboards': 'Dashboards',
  '/dashboard': 'Dashboard',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/auth-demo': 'Auth Demo',
  '/login': 'Login',
  '/unauthorized': 'Unauthorized',
};

/**
 * Navigation Context Provider
 * Manages navigation state without persistence
 * Uses React Context + Next.js App Router (no Zustand)
 */
export function NavigationProvider({ children }: NavigationProviderProps): React.ReactElement {
  const pathname = usePathname();
  
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentPath: pathname,
    previousPath: null,
    breadcrumbs: [],
    pageTitle: '',
  });

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = (path: string): Breadcrumb[] => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs: Breadcrumb[] = [];

    // Always add home
    if (path !== '/') {
      breadcrumbs.push({
        label: 'Home',
        href: '/',
        isActive: false,
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      const isLast = index === segments.length - 1;
      const label = ROUTE_LABELS[currentPath] || 
                   segment.charAt(0).toUpperCase() + segment.slice(1);

      breadcrumbs.push({
        label,
        href: currentPath,
        isActive: isLast,
      });
    });

    return breadcrumbs;
  };

  // Update navigation state when pathname changes
  useEffect(() => {
    const newBreadcrumbs = generateBreadcrumbs(pathname);
    const newTitle = newBreadcrumbs[newBreadcrumbs.length - 1]?.label || 'Dashboard';

    setNavigationState(prev => ({
      currentPath: pathname,
      previousPath: prev.currentPath,
      breadcrumbs: newBreadcrumbs,
      pageTitle: newTitle,
    }));

    appLogger.debug('Navigation updated', {
      currentPath: pathname,
      previousPath: navigationState.currentPath,
      breadcrumbs: newBreadcrumbs.map(b => b.label),
      pageTitle: newTitle,
    });
  }, [pathname, navigationState.currentPath]);

  // Set custom breadcrumbs
  const setBreadcrumbs = (breadcrumbs: Breadcrumb[]): void => {
    setNavigationState(prev => ({
      ...prev,
      breadcrumbs,
    }));

    appLogger.debug('Custom breadcrumbs set', {
      breadcrumbs: breadcrumbs.map(b => b.label),
    });
  };

  // Set custom page title
  const setPageTitle = (title: string): void => {
    setNavigationState(prev => ({
      ...prev,
      pageTitle: title,
    }));

    // Update document title
    if (typeof document !== 'undefined') {
      document.title = `${title} - Daten See`;
    }

    appLogger.debug('Page title updated', { title });
  };

  // Go back to previous page
  const goBack = (): void => {
    if (navigationState.previousPath) {
      window.history.back();
      appLogger.debug('Navigate back', {
        from: navigationState.currentPath,
        to: navigationState.previousPath,
      });
    } else {
      // Fallback to dashboard if no previous path
      window.location.href = '/dashboards';
      appLogger.debug('Navigate back fallback to dashboards');
    }
  };

  // Context value
  const contextValue: NavigationContextType = {
    // State
    ...navigationState,
    
    // Actions
    setBreadcrumbs,
    setPageTitle,
    generateBreadcrumbs,
    goBack,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

/**
 * Hook to use navigation context
 */
export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  
  return context;
}

/**
 * Hook for page-specific navigation setup
 */
export function usePageNavigation(options: {
  title?: string;
  breadcrumbs?: Breadcrumb[];
}) {
  const { setPageTitle, setBreadcrumbs } = useNavigation();
  
  useEffect(() => {
    if (options.title) {
      setPageTitle(options.title);
    }
    
    if (options.breadcrumbs) {
      setBreadcrumbs(options.breadcrumbs);
    }
  }, [options.title, options.breadcrumbs, setPageTitle, setBreadcrumbs]);
}

// Export types
export { NavigationContext };