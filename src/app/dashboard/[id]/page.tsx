'use client';

import { useParams } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import type { Layout, Layouts } from 'react-grid-layout';

import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  ResponsiveDashboard, 
  generateDefaultLayouts, 
  mergeLayouts,
  removeWidgetFromLayouts,
} from '@/components/dashboard/ResponsiveDashboard';
import { createDefaultWidget } from '@/components/dashboard/WidgetRenderer';
import type { DashboardWidget } from '@/components/dashboard/DashboardCanvas';
import { sanitizeName } from '@/lib/utils/sanitization';
import { useDashboard } from '@/hooks/dashboard/useDashboardQueries';
import { useDashboardUIStore } from '@/store/dashboard.store';

export default function DashboardDetailPage(): React.ReactElement {
  const params = useParams();
  const dashboardId = params.id as string;
  
  // TanStack Query for server state
  const { data: currentDashboard, isLoading, error } = useDashboard(dashboardId);
  
  // Zustand for UI state
  const {
    isEditMode,
    hasChanges,
    widgets,
    layouts,
    undoStack,
    redoStack,
    setEditMode,
    setHasChanges,
    setWidgets,
    setLayouts,
    pushUndoState,
    clearRedoStack,
    undo,
    redo
  } = useDashboardUIStore();

  // Initialize demo widgets if empty (will be replaced with real data later)
  useEffect(() => {
    if (widgets.length === 0) {
      const demoWidgets: DashboardWidget[] = [
        {
          id: 'widget-1',
          type: 'line',
          title: 'Marketing Performance',
          config: {},
        },
        {
          id: 'widget-2',
          type: 'kpi',
          title: 'Gesamtumsatz',
          config: {
            metric: 'Gesamtumsatz',
            value: 89500,
            previousValue: 76200,
            unit: 'currency',
            trend: 'up',
          },
        },
      ];

      const demoLayouts: Layouts = {
        lg: [
          { i: 'widget-1', x: 0, y: 0, w: 8, h: 4 },
          { i: 'widget-2', x: 8, y: 0, w: 4, h: 3 },
        ],
        md: [
          { i: 'widget-1', x: 0, y: 0, w: 6, h: 4 },
          { i: 'widget-2', x: 6, y: 0, w: 4, h: 3 },
        ],
        sm: [
          { i: 'widget-1', x: 0, y: 0, w: 6, h: 4 },
          { i: 'widget-2', x: 0, y: 4, w: 6, h: 3 },
        ],
        xs: [
          { i: 'widget-1', x: 0, y: 0, w: 4, h: 4 },
          { i: 'widget-2', x: 0, y: 4, w: 4, h: 3 },
        ],
        xxs: [
          { i: 'widget-1', x: 0, y: 0, w: 2, h: 4 },
          { i: 'widget-2', x: 0, y: 4, w: 2, h: 3 },
        ],
      };

      setWidgets(demoWidgets);
      setLayouts(demoLayouts);
    }
  }, [widgets.length, setWidgets, setLayouts]);

  // Handle layout changes
  const handleLayoutChange = useCallback((_currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
  }, [setLayouts]);

  // Edit Mode Handlers
  const handleToggleEditMode = useCallback(() => {
    setEditMode(!isEditMode);
    if (isEditMode && hasChanges) {
      // Save changes when exiting edit mode
      console.log('Saving dashboard changes:', { widgets, layouts });
      setHasChanges(false);
    }
  }, [isEditMode, hasChanges, widgets, layouts, setEditMode, setHasChanges]);

  // Add new widget
  const handleAddWidget = useCallback(() => {
    const widgetType = prompt('Widget-Typ wählen: line, bar, pie, kpi, text') as DashboardWidget['type'];
    if (!widgetType || !['line', 'bar', 'pie', 'kpi', 'text'].includes(widgetType)) {
      return;
    }

    // Save current state to undo stack
    pushUndoState({ widgets, layouts });
    clearRedoStack();

    const newWidgetId = `widget-${Date.now()}`;
    const newWidget: DashboardWidget = {
      id: newWidgetId,
      ...createDefaultWidget(widgetType),
    };

    setWidgets([...widgets, newWidget]);
    setLayouts(mergeLayouts(layouts, generateDefaultLayouts(newWidgetId, widgetType)));
  }, [widgets, layouts, pushUndoState, clearRedoStack, setWidgets, setLayouts]);

  // Delete widget (no confirmation dialog)
  const handleDeleteWidget = useCallback((widgetId: string) => {
    // Save current state to undo stack
    pushUndoState({ widgets, layouts });
    clearRedoStack();

    setWidgets(widgets.filter(w => w.id !== widgetId));
    setLayouts(removeWidgetFromLayouts(layouts, widgetId));
  }, [widgets, layouts, pushUndoState, clearRedoStack, setWidgets, setLayouts]);

  // Duplicate widget
  const handleDuplicateWidget = useCallback((widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    // Save current state to undo stack
    pushUndoState({ widgets, layouts });
    clearRedoStack();

    const newWidgetId = `widget-${Date.now()}`;
    const newWidget: DashboardWidget = {
      ...widget,
      id: newWidgetId,
      title: `${widget.title} (Kopie)`,
    };

    setWidgets([...widgets, newWidget]);
    setLayouts(mergeLayouts(layouts, generateDefaultLayouts(newWidgetId, widget.type)));
  }, [widgets, layouts, pushUndoState, clearRedoStack, setWidgets, setLayouts]);

  // Edit widget
  const handleEditWidget = useCallback((widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const newTitle = prompt('Widget-Titel:', widget.title);
    if (newTitle && newTitle !== widget.title) {
      try {
        // Sanitize widget title
        const sanitizedTitle = sanitizeName(newTitle, 50);
        
        // Save current state to undo stack
        pushUndoState({ widgets, layouts });
        clearRedoStack();

        setWidgets(widgets.map(w => 
          w.id === widgetId ? { ...w, title: sanitizedTitle } : w
        ));
      } catch (error) {
        if (error instanceof Error) {
          alert(`Fehler: ${error.message}`);
        }
      }
    }
  }, [widgets, layouts, pushUndoState, clearRedoStack, setWidgets]);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      // State is already updated by undo() function
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      // State is already updated by redo() function
    }
  }, [redo]);

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-[#FEFCF9]">

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-[#5d5d5d]">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#FBF5ED] rounded-lg flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 border-2 border-[#E6D7B8] border-dashed rounded animate-spin"></div>
              </div>
              <p className="text-lg font-medium">Lade Dashboard...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md w-full">
              <div className="text-center">
                <div className="text-red-600 text-sm mb-4">
                  <strong>Fehler beim Laden:</strong> {error.message}
                </div>
                <div className="space-x-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Seite neu laden
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && !error && currentDashboard && (
          <>
            {/* Dashboard Header with Edit Mode */}
            <DashboardHeader
              title={currentDashboard.name}
              subtitle={`${currentDashboard.description} • ${currentDashboard.isPublic ? 'Öffentlich' : 'Privat'} • Bearbeitungsmodus ${isEditMode ? 'aktiv' : 'inaktiv'}`}
              lastUpdated={new Intl.DateTimeFormat('de-DE', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }).format(new Date(currentDashboard.updatedAt))}
              isEditMode={isEditMode}
              onToggleEditMode={handleToggleEditMode}
              onAddWidget={handleAddWidget}
              onUndo={handleUndo}
              onRedo={handleRedo}    
              canUndo={undoStack.length > 0}
              canRedo={redoStack.length > 0}
            />

            {/* Main Dashboard Content - Full Width Widget Area (No container background) */}
            <div className="flex-1 bg-[#FBF5ED] bg-opacity-20">
              <ResponsiveDashboard
                widgets={widgets}
                layouts={layouts}
                onLayoutChange={handleLayoutChange}
                isEditMode={isEditMode}
                onEditWidget={handleEditWidget}
                onDeleteWidget={handleDeleteWidget}
                onDuplicateWidget={handleDuplicateWidget}
                className={isEditMode ? 'dashboard-edit-mode-active' : ''}
              />
              
              {/* Empty State */}
              {widgets.length === 0 && (
                <div className="text-center text-[#5d5d5d] py-16">
                  <p className="text-lg font-medium mb-2">
                    {isEditMode ? 'Bearbeitungsmodus aktiv' : 'Dashboard Widget-Bereich'}
                  </p>
                  <p className="text-sm mb-4">
                    {isEditMode 
                      ? 'Klicken Sie auf "Widget hinzufügen" um neue Widgets zu erstellen'
                      : 'Dieses Dashboard hat noch keine Widgets'
                    }
                  </p>
                  {isEditMode && (
                    <p className="text-xs text-[#5d5d5d]">
                      Widgets haben hellblaue Overlays im Bearbeitungsmodus
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}