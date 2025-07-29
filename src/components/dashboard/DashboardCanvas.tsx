'use client';

import { useState, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import { Plus, Settings, Save, Eye, Edit3 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import type { Layout, Layouts } from 'react-grid-layout';

// Import grid layout styles
import '@/styles/react-grid-layout.css';

/**
 * Widget data structure
 */
export interface DashboardWidget {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'kpi' | 'text';
  title: string;
  config: Record<string, any>;
  dataSource?: string;
}

/**
 * Dashboard Canvas Props
 */
interface DashboardCanvasProps {
  widgets: DashboardWidget[];
  layout: Layout[];
  onLayoutChange?: (layout: Layout[]) => void;
  onAddWidget?: () => void;
  onEditWidget?: (widgetId: string) => void;
  onDeleteWidget?: (widgetId: string) => void;
  isEditMode?: boolean;
  className?: string;
}

/**
 * Main Dashboard Canvas Component
 * Provides drag-and-drop grid layout for dashboard widgets
 */
export function DashboardCanvas({
  widgets,
  layout: initialLayout,
  onLayoutChange,
  onAddWidget,
  onEditWidget,
  onDeleteWidget,
  isEditMode = false,
  className = '',
}: DashboardCanvasProps) {
  const [currentLayout, setCurrentLayout] = useState<Layout[]>(initialLayout);

  // Handle layout changes
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setCurrentLayout(newLayout);
    onLayoutChange?.(newLayout);
  }, [onLayoutChange]);

  // Grid configuration
  const gridProps = {
    className: `react-grid-layout ${isEditMode ? 'dashboard-edit-mode' : ''} ${className}`,
    layout: currentLayout,
    cols: 12,
    rowHeight: 80,
    width: 1200, // Will be responsive
    isDraggable: isEditMode,
    isResizable: isEditMode,
    compactType: 'vertical' as const,
    preventCollision: false,
    onLayoutChange: handleLayoutChange,
  };

  return (
    <div className="dashboard-grid-container">
      <GridLayout {...gridProps}>
        {widgets.map((widget) => {
          const layoutItem = currentLayout.find(l => l.i === widget.id);
          if (!layoutItem) return null;

          return (
            <div key={widget.id} className="widget-content">
              <WidgetContainer
                widget={widget}
                isEditMode={isEditMode}
                onEdit={() => onEditWidget?.(widget.id)}
                onDelete={() => onDeleteWidget?.(widget.id)}
              />
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
}

/**
 * Widget Container Component
 * Wraps widget content with header and toolbar
 */
interface WidgetContainerProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function WidgetContainer({ 
  widget, 
  isEditMode, 
  onEdit, 
  onDelete 
}: WidgetContainerProps) {
  return (
    <>
      <div className="widget-header">
        <h3 className="text-sm font-medium text-[#3d3d3d] truncate">
          {widget.title}
        </h3>
        {isEditMode && (
          <div className="widget-toolbar">
            <button
              onClick={onEdit}
              title="Widget bearbeiten"
              aria-label="Widget bearbeiten"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              title="Widget löschen"
              aria-label="Widget löschen"
            >
              <span className="text-red-600">×</span>
            </button>
          </div>
        )}
      </div>
      <div className="widget-body">
        <WidgetContent widget={widget} />
      </div>
    </>
  );
}

/**
 * Widget Content Renderer
 * Renders appropriate content based on widget type
 */
function WidgetContent({ widget }: { widget: DashboardWidget }) {
  // Placeholder content for now
  const placeholderContent = {
    line: '📈 Line Chart',
    bar: '📊 Bar Chart', 
    pie: '🥧 Pie Chart',
    kpi: '🎯 KPI Card',
    text: '📝 Text Widget',
  };

  return (
    <div className="flex items-center justify-center h-full text-[#5d5d5d]">
      <div className="text-center">
        <div className="text-2xl mb-2">
          {placeholderContent[widget.type]}
        </div>
        <div className="text-sm">
          Widget ID: {widget.id}
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard Toolbar Component
 * Controls for edit mode and widget management
 */
interface DashboardToolbarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onAddWidget: () => void;
  onSave?: () => void;
  hasChanges?: boolean;
}

export function DashboardToolbar({
  isEditMode,
  onToggleEditMode,
  onAddWidget,
  onSave,
  hasChanges = false,
}: DashboardToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4 p-4 bg-[#FDF9F3] rounded-lg border border-[#E6D7B8]">
      <div className="flex items-center gap-3">
        <Button
          variant={isEditMode ? "secondary" : "primary"}
          size="sm"
          onClick={onToggleEditMode}
          leftIcon={isEditMode ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
        >
          {isEditMode ? 'Vorschau' : 'Bearbeiten'}
        </Button>
        
        {isEditMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddWidget}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Widget hinzufügen
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {hasChanges && (
          <span className="text-sm text-[#C5A572]">
            Ungespeicherte Änderungen
          </span>
        )}
        
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          disabled={!hasChanges}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Speichern
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Settings className="w-4 h-4" />}
        >
          Einstellungen
        </Button>
      </div>
    </div>
  );
}