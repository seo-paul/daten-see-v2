/**
 * Edit Mode Toolbar Component
 * Dedicated toolbar for dashboard edit mode controls
 * Extracted from DashboardHeader for better separation of concerns
 */

import { Plus, Eye, Undo2, Redo2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export interface EditModeToolbarProps {
  // Undo/Redo Actions
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  
  // Widget Management
  onAddWidget?: () => void;
  
  // Mode Toggle
  onExitEditMode?: () => void;
  
  // Layout
  className?: string;
}

/**
 * Edit Mode Toolbar Component
 * Contains all edit mode specific controls:
 * - Center: Undo/Redo buttons
 * - Right: Add Widget + Exit Edit Mode buttons
 */
export function EditModeToolbar({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onAddWidget,
  onExitEditMode,
  className = '',
}: EditModeToolbarProps): React.ReactElement {
  return (
    <div className={`flex items-center justify-between gap-6 ${className}`}>
      {/* Center Section: Undo/Redo Controls */}
      <div className="flex items-center gap-2 mx-auto">
        <Button
          variant="primary"
          context="page"
          onClick={onUndo || ((): void => {})}
          disabled={!canUndo || !onUndo}
          className="!px-3"
          aria-label="Undo"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="primary"
          context="page"
          onClick={onRedo || ((): void => {})}
          disabled={!canRedo || !onRedo}
          className="!px-3"
          aria-label="Redo"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Right Section: Widget Management */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          context="page"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onAddWidget || ((): void => {})}
          disabled={!onAddWidget}
        >
          Widget hinzufügen
        </Button>
        <Button
          variant="primary"
          context="page"
          leftIcon={<Eye className="w-4 h-4" />}
          onClick={onExitEditMode || ((): void => {})}
          disabled={!onExitEditMode}
        >
          Ansicht
        </Button>
      </div>
    </div>
  );
}