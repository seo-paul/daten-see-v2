'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDashboards } from '@/hooks/useDashboards';
import { prefetchDashboards } from '@/lib/tanstack-query/prefetch';


export default function DashboardPage(): React.ReactElement {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queryClient = useQueryClient();
  const { data: dashboards, isLoading } = useDashboards();

  // Prefetch dashboards on page load for performance
  useEffect(() => {
    void prefetchDashboards(queryClient);
  }, [queryClient]);

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-[#FEFCF9]">
        {/* Dashboard Header */}
        <DashboardHeader
          title="Marketing Analytics"
          subtitle="Google Ads, Facebook & LinkedIn Daten • Ansichtsmodus"
        />

        {/* Main Dashboard Content */}
        <DashboardGrid>
          {/* Show loading state or dashboard info */}
          <div className="text-center text-[#5d5d5d] py-12">
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