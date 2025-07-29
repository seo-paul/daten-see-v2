'use client';

import { EditModeToolbar } from '@/components/dashboard/EditModeToolbar';
import { ViewModeToolbar } from '@/components/dashboard/ViewModeToolbar';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  className?: string;
  
  // Mode State
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  
  // Edit Mode Actions
  onAddWidget?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  
  // View Mode Actions
  onShare?: () => void;
  timeFilter?: string;
  onTimeFilterChange?: () => void;
}

export function DashboardHeader({ 
  title, 
  subtitle, 
  lastUpdated = "vor 3 Min", 
  className = '',
  
  // Mode State
  isEditMode = false,
  onToggleEditMode,
  
  // Edit Mode Actions
  onAddWidget,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  
  // View Mode Actions
  onShare,
  timeFilter,
  onTimeFilterChange,
}: DashboardHeaderProps): React.ReactElement {
  return (
    <div className={`px-6 py-4 bg-white border-b border-[#E6D7B8] ${className}`}>
      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        {/* Left Section: Title and Subtitle */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#3d3d3d] mb-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#5d5d5d] mb-1">
              {subtitle}
            </p>
          )}
          <p className="text-xs text-[#5d5d5d] flex items-center gap-1">
            Zuletzt gespeichert: {lastUpdated}
          </p>
        </div>

        {/* Mode-Specific Toolbar */}
        <div className="flex-1 md:ml-auto">
          {isEditMode ? (
            <EditModeToolbar
              {...(onUndo && { onUndo })}
              {...(onRedo && { onRedo })}
              canUndo={canUndo}
              canRedo={canRedo}
              {...(onAddWidget && { onAddWidget })}
              {...(onToggleEditMode && { onExitEditMode: onToggleEditMode })}
            />
          ) : (
            <ViewModeToolbar
              {...(onToggleEditMode && { onEnterEditMode: onToggleEditMode })}
              {...(onShare && { onShare })}
              {...(timeFilter && { timeFilter })}
              {...(onTimeFilterChange && { onTimeFilterChange })}
            />
          )}
        </div>
      </div>
    </div>
  );
}