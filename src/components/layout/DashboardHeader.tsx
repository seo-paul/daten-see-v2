'use client';

import { Share, Edit3, Clock, ChevronDown, Plus, Eye, Undo2, Redo2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  className?: string;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  onAddWidget?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function DashboardHeader({ 
  title, 
  subtitle, 
  lastUpdated = "vor 3 Min", 
  className = '',
  isEditMode = false,
  onToggleEditMode,
  onAddWidget,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
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

        {/* Center Section: Conditional Content */}
        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 flex justify-center">
          {isEditMode ? (
            // Edit Mode: Undo/Redo Buttons (Icon only)
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                context="page"
                onClick={onUndo}
                disabled={!canUndo}
                className="!px-3"
                aria-label="Undo"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="primary"
                context="page"
                onClick={onRedo}
                disabled={!canRedo}
                className="!px-3"
                aria-label="Redo"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            // View Mode: Time Filter
            <Button
              variant="primary"
              context="page"
              leftIcon={<Clock className="w-4 h-4" />}
              rightIcon={<ChevronDown className="w-4 h-4" />}
              className="min-w-[160px]"
            >
              Letzte 30 Tage
            </Button>
          )}
        </div>

        {/* Right Section: Mode-Specific Action Buttons */}
        <div className="flex items-center gap-3 md:ml-auto">
          {isEditMode ? (
            // Edit Mode: Widget hinzufügen + Ansicht
            <>
              <Button
                variant="primary"
                context="page"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={onAddWidget}
              >
                Widget hinzufügen
              </Button>
              <Button
                variant="primary"
                context="page"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={onToggleEditMode}
              >
                Ansicht
              </Button>
            </>
          ) : (
            // View Mode: Teilen + Bearbeiten
            <>
              <Button
                variant="primary"
                context="page"
                leftIcon={<Share className="w-4 h-4" />}
              >
                Teilen
              </Button>
              <Button
                variant="primary"
                context="page"
                leftIcon={<Edit3 className="w-4 h-4" />}
                onClick={onToggleEditMode}
              >
                Bearbeiten
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}