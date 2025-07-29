/**
 * Dashboard Overview Header Component
 * Contains title, description, and create button
 */

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import type { DashboardListItem } from '@/types/dashboard.types';

interface DashboardOverviewHeaderProps {
  dashboards: DashboardListItem[];
  onCreateClick: () => void;
}

export function DashboardOverviewHeader({ 
  dashboards, 
  onCreateClick 
}: DashboardOverviewHeaderProps): React.ReactElement {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#3d3d3d]">
          Dashboard-Übersicht
        </h1>
        <p className="text-sm text-[#5d5d5d] mt-1">
          {dashboards.length > 0 
            ? `${dashboards.length} Dashboard${dashboards.length === 1 ? '' : 's'} verfügbar`
            : 'Noch keine Dashboards erstellt'
          }
        </p>
      </div>

      <Button
        variant="primary"
        context="page"
        onClick={onCreateClick}
        leftIcon={<Plus className="w-4 h-4" />}
      >
        Neues Dashboard
      </Button>
    </div>
  );
}