'use client';

import { usePathname } from 'next/navigation';

interface RouteContext {
  isHomePage: boolean;
  isDashboardOverview: boolean;
  isDashboardDetail: boolean;
  isCommunityPage: boolean;
  showDashboardOverviewButton: boolean;
  showCommunityButton: boolean;
}

/**
 * Hook to determine current route context for conditional navigation
 */
export function useRouteContext(): RouteContext {
  const pathname = usePathname();

  const isHomePage = pathname === '/';
  const isDashboardOverview = pathname === '/dashboards';
  const isDashboardDetail = pathname.startsWith('/dashboard/') && pathname !== '/dashboard';
  const isCommunityPage = pathname === '/community';

  return {
    isHomePage,
    isDashboardOverview,
    isDashboardDetail,
    isCommunityPage,
    // Hide dashboard overview button on home and dashboard overview pages
    showDashboardOverviewButton: !isHomePage && !isDashboardOverview,
    // Always show community button for now
    showCommunityButton: true,
  };
}