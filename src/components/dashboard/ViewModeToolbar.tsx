/**
 * View Mode Toolbar Component
 * Dedicated toolbar for dashboard view mode controls
 * Extracted from DashboardHeader for better separation of concerns
 */

import { Share, Edit3, Clock, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export interface ViewModeToolbarProps {
  // Mode Toggle
  onEnterEditMode?: () => void;
  
  // Sharing
  onShare?: () => void;
  
  // Time Filter
  timeFilter?: string;
  onTimeFilterChange?: () => void;
  
  // Layout
  className?: string;
}

/**
 * View Mode Toolbar Component
 * Contains all view mode specific controls:
 * - Center: Time filter dropdown
 * - Right: Share + Edit Mode buttons
 */
export function ViewModeToolbar({
  onEnterEditMode,
  onShare,
  timeFilter = "Letzte 30 Tage",
  onTimeFilterChange,
  className = '',
}: ViewModeToolbarProps): React.ReactElement {
  return (
    <div className={`flex items-center justify-between gap-6 ${className}`}>
      {/* Center Section: Time Filter */}
      <div className="mx-auto">
        <Button
          variant="primary"
          context="page"
          leftIcon={<Clock className="w-4 h-4" />}
          rightIcon={<ChevronDown className="w-4 h-4" />}
          className="min-w-[160px]"
          onClick={onTimeFilterChange || (() => {})}
          disabled={!onTimeFilterChange}
        >
          {timeFilter}
        </Button>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          context="page"
          leftIcon={<Share className="w-4 h-4" />}
          onClick={onShare || (() => {})}
          disabled={!onShare}
        >
          Teilen
        </Button>
        <Button
          variant="primary"
          context="page"
          leftIcon={<Edit3 className="w-4 h-4" />}
          onClick={onEnterEditMode || (() => {})}
          disabled={!onEnterEditMode}
        >
          Bearbeiten
        </Button>
      </div>
    </div>
  );
}