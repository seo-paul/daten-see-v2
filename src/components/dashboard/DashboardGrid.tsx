/**
 * Dashboard Grid Component
 * Grid layout for dashboard cards
 */

import { DashboardCard } from './DashboardCard';
import type { DashboardListItem } from '@/types/dashboard.types';

interface DashboardGridProps {
  dashboards: DashboardListItem[];
  onEdit: (dashboard: DashboardListItem) => void;
  onDelete: (id: string) => Promise<void>;
  showGrid: boolean;
}

export function DashboardGrid({ 
  dashboards, 
  onEdit, 
  onDelete, 
  showGrid 
}: DashboardGridProps): React.ReactElement | null {
  if (!showGrid) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dashboards.map((dashboard: DashboardListItem) => (
        <DashboardCard
          key={dashboard.id}
          dashboard={dashboard}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}