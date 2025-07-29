/**
 * Dashboard Empty State Component
 * Shows empty state when no dashboards exist
 */

import { Button } from '@/components/ui/Button';

interface DashboardEmptyStateProps {
  onCreateClick: () => void;
  showEmptyState: boolean;
}

export function DashboardEmptyState({ 
  onCreateClick, 
  showEmptyState 
}: DashboardEmptyStateProps): React.ReactElement | null {
  if (!showEmptyState) return null;

  return (
    <div className="bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-8">
      <div className="text-center text-[#5d5d5d]">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#FBF5ED] rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#E6D7B8] border-dashed rounded"></div>
        </div>
        <p className="text-lg font-medium mb-2">Noch keine Dashboards</p>
        <p className="text-sm text-[#5d5d5d] mb-4">
          Erstellen Sie Ihr erstes Dashboard, um loszulegen.
        </p>
        <Button
          variant="primary"
          context="page"
          onClick={onCreateClick}
        >
          Erstes Dashboard erstellen
        </Button>
      </div>
    </div>
  );
}