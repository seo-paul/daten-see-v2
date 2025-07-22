import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MainLayout } from '@/components/layout/MainLayout';

export default function DashboardPage(): React.ReactElement {
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
          {/* Placeholder for future widgets */}
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg font-medium mb-2">Dashboard Grid bereit</p>
            <p className="text-sm">Widgets werden in Task 1.7 implementiert</p>
          </div>
        </DashboardGrid>
      </div>
    </MainLayout>
  );
}