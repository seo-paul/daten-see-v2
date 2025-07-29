/**
 * Dashboard Loading State Component
 * Loading spinner and message for dashboard list
 */

interface DashboardLoadingStateProps {
  isLoading: boolean;
  showLoading: boolean;
}

export function DashboardLoadingState({ 
  isLoading, 
  showLoading 
}: DashboardLoadingStateProps): React.ReactElement | null {
  if (!isLoading || !showLoading) return null;

  return (
    <div className="bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-8">
      <div className="text-center text-[#5d5d5d]">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#FBF5ED] rounded-lg flex items-center justify-center animate-pulse">
          <div className="w-8 h-8 border-2 border-[#E6D7B8] border-dashed rounded animate-spin"></div>
        </div>
        <p className="text-lg font-medium">Lade Dashboards...</p>
      </div>
    </div>
  );
}