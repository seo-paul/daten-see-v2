'use client';

import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDashboards } from '@/hooks/useDashboards';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchDashboards } from '@/lib/tanstack-query/prefetch';
import { useEffect } from 'react';

export default function DashboardPage(): React.ReactElement {
  const queryClient = useQueryClient();
  const { data: dashboards, isLoading } = useDashboards();

  // Prefetch dashboards on page load for performance
  useEffect(() => {
    prefetchDashboards(queryClient);
  }, [queryClient]);

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Dashboard Header */}
        <DashboardHeader
          title="Marketing Analytics"
          subtitle="Google Ads, Facebook & LinkedIn Daten • Ansichtsmodus"
        />

        {/* Main Dashboard Content */}
        <DashboardGrid>
          {/* Show loading state or dashboard info */}
          <div className="text-center text-gray-500 py-12">
            {isLoading ? (
              <p className="text-lg font-medium mb-2">Loading dashboards...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">Dashboard Grid bereit</p>
                <p className="text-sm">
                  {Array.isArray(dashboards) ? dashboards.length : 0} Dashboard(s) geladen • Widgets werden in Task 1.7 implementiert
                </p>
              </>
            )}
          </div>
        </DashboardGrid>
      </div>
    </MainLayout>
  );
}