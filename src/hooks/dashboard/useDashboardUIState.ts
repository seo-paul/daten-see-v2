/**
 * Dashboard UI State Hook
 * 
 * 🎨 UI STATE MANAGEMENT (Zustand Store)
 * Centralized state management for dashboard UI interactions
 * Separates UI state logic from component presentation
 * 
 * STATE STRATEGY:
 * - TanStack Query = Server State (API data, caching, loading states)
 * - Zustand Store = UI State (edit mode, layouts, undo/redo, widget management)
 * 
 * This hook encapsulates all dashboard interaction logic and provides
 * a clean interface for components to manage UI state without mixing
 * server state concerns.
 */

import { useCallback, useEffect, useState } from 'react';
import type { Layout, Layouts } from 'react-grid-layout';

import { 
  generateDefaultLayouts, 
  mergeLayouts,
  removeWidgetFromLayouts,
} from '@/components/dashboard/ResponsiveDashboard';
import type { WidgetConfigMode } from '@/components/dashboard/WidgetConfigModal';
import { useDashboardUIStore } from '@/store/dashboard.store';
import type { DashboardWidget } from '@/types/dashboard.types';

export interface DashboardUIActions {
  // Edit Mode
  handleToggleEditMode: () => void;
  
  // Widget Management
  handleAddWidget: () => void;
  handleDeleteWidget: (widgetId: string) => void;
  handleDuplicateWidget: (widgetId: string) => void;
  handleEditWidget: (widgetId: string) => void;
  
  // Layout Management
  handleLayoutChange: (currentLayout: Layout[], allLayouts: Layouts) => void;
  
  // Undo/Redo
  handleUndo: () => void;
  handleRedo: () => void;
  
  // Widget Modal Management
  handleCloseWidgetModal: () => void;
  handleWidgetModalSubmit: (widgetData: Partial<DashboardWidget>) => void;
}

export interface DashboardUIState {
  // State Values
  isEditMode: boolean;
  hasChanges: boolean;
  widgets: DashboardWidget[];
  layouts: Layouts;
  canUndo: boolean;
  canRedo: boolean;
  
  // Widget Modal State
  widgetModalOpen: boolean;
  widgetModalMode: WidgetConfigMode;
  widgetModalData?: DashboardWidget | undefined;
  
  // Actions
  actions: DashboardUIActions;
}

/**
 * Custom hook for dashboard UI state management
 * Encapsulates all dashboard interaction logic
 */
export function useDashboardUIState(_dashboardId = 'demo-dashboard', _userId?: string): DashboardUIState {
  // Zustand store access
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
    initializeDemoData,
    markAsModified,
    pushUndoState,
    clearRedoStack,
    undo,
    redo
  } = useDashboardUIStore();


  // Local modal state
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);
  const [widgetModalMode, setWidgetModalMode] = useState<WidgetConfigMode>('create');
  const [widgetModalData, setWidgetModalData] = useState<DashboardWidget | undefined>();

  // Initialize demo data ONCE - NO MORE RACE CONDITIONS!
  useEffect(() => {
    // Initialize demo data only if not already initialized
    // This prevents widgets from reappearing after deletion
    initializeDemoData();
  }, []); // No dependencies - run only once on mount

  // Edit Mode Toggle
  const handleToggleEditMode = useCallback(() => {
    setEditMode(!isEditMode);
    if (isEditMode && hasChanges) {
      // Save changes when exiting edit mode
      setHasChanges(false);
    }
  }, [isEditMode, hasChanges, setEditMode, setHasChanges]);

  // Layout Change Handler
  const handleLayoutChange = useCallback((_currentLayout: Layout[], allLayouts: Layouts) => {
    markAsModified(); // Mark as modified to prevent demo data re-initialization
    setLayouts(allLayouts);
    setHasChanges(true);
  }, [markAsModified, setLayouts, setHasChanges]);

  // Add New Widget
  const handleAddWidget = useCallback(() => {
    setWidgetModalMode('create');
    setWidgetModalData(undefined);
    setWidgetModalOpen(true);
  }, []);

  // Delete Widget - ATOMIC UPDATE APPROACH
  const handleDeleteWidget = useCallback((widgetId: string) => {
    console.log(`🗑️ DELETE ATTEMPT: Widget ${widgetId}`);
    
    try {
      // Perform atomic state update to prevent race conditions
      const store = useDashboardUIStore.getState();
      const widget = store.widgets.find(w => w.id === widgetId);
      
      if (!widget) {
        console.warn(`❌ Widget not found: ${widgetId}`, {
          requestedId: widgetId,
          availableIds: store.widgets.map(w => w.id)
        });
        return;
      }

      console.log(`🔄 DELETE PROCESSING: Widget ${widgetId}`, {
        widgetType: widget.type,
        currentCount: store.widgets.length
      });

      // Mark as modified to prevent demo data re-initialization
      markAsModified();

      // Save current state to undo stack before any modifications
      pushUndoState({ widgets: store.widgets, layouts: store.layouts });
      clearRedoStack();

      // Atomic updates using functional approach
      setWidgets(prevWidgets => {
        const filtered = prevWidgets.filter(w => w.id !== widgetId);
        console.log(`✅ WIDGETS UPDATED: ${prevWidgets.length} → ${filtered.length}`);
        return filtered;
      });
      
      setLayouts(prevLayouts => {
        const updated = removeWidgetFromLayouts(prevLayouts, widgetId);
        console.log(`✅ LAYOUTS UPDATED: Widget ${widgetId} removed`);
        return updated;
      });
      
      setHasChanges(true);
      console.log(`✅ DELETE COMPLETED: Widget ${widgetId}`);
      
    } catch (error) {
      console.error(`❌ DELETE FAILED: Widget ${widgetId}`, error);
      throw error; // Re-throw for error boundaries
    }
  }, [markAsModified, pushUndoState, clearRedoStack, setWidgets, setLayouts, setHasChanges]);

  // Duplicate Widget
  const handleDuplicateWidget = useCallback((widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    // Mark as modified to prevent demo data re-initialization
    markAsModified();

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
    setHasChanges(true);
  }, [widgets, layouts, markAsModified, pushUndoState, clearRedoStack, setWidgets, setLayouts, setHasChanges]);

  // Edit Widget
  const handleEditWidget = useCallback((widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    setWidgetModalMode('edit');
    setWidgetModalData(widget);
    setWidgetModalOpen(true);
  }, [widgets]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      // State is already updated by undo() function
      setHasChanges(true);
    }
  }, [undo, setHasChanges]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      // State is already updated by redo() function
      setHasChanges(true);
    }
  }, [redo, setHasChanges]);

  // Widget Modal Handlers
  const handleCloseWidgetModal = useCallback(() => {
    setWidgetModalOpen(false);
    setWidgetModalData(undefined);
  }, []);

  const handleWidgetModalSubmit = useCallback((widgetData: Partial<DashboardWidget>) => {
    // Mark as modified to prevent demo data re-initialization
    markAsModified();

    // Save current state to undo stack
    pushUndoState({ widgets, layouts });
    clearRedoStack();

    if (widgetModalMode === 'create') {
      // Create new widget
      const newWidgetId = `widget-${Date.now()}`;
      const newWidget: DashboardWidget = {
        id: newWidgetId,
        type: widgetData.type || 'line',
        title: widgetData.title || 'Neues Widget',
        config: widgetData.config || {},
        ...(widgetData.dataSource && { dataSource: widgetData.dataSource }),
      };

      setWidgets([...widgets, newWidget]);
      setLayouts(mergeLayouts(layouts, generateDefaultLayouts(newWidgetId, newWidget.type)));
    } else if (widgetModalMode === 'edit' && widgetModalData) {
      // Update existing widget
      setWidgets(widgets.map(w => 
        w.id === widgetModalData.id 
          ? { 
              ...w, 
              title: widgetData.title || w.title,
              config: widgetData.config || w.config,
              ...(widgetData.dataSource !== undefined && { dataSource: widgetData.dataSource }),
            }
          : w
      ));
    }

    setHasChanges(true);
    setWidgetModalOpen(false);
    setWidgetModalData(undefined);
  }, [
    markAsModified,
    widgetModalMode, 
    widgetModalData, 
    widgets, 
    layouts, 
    pushUndoState, 
    clearRedoStack, 
    setWidgets, 
    setLayouts, 
    setHasChanges
  ]);

  // Return consolidated state and actions
  return {
    // State Values
    isEditMode,
    hasChanges,
    widgets,
    layouts,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    
    // Widget Modal State
    widgetModalOpen,
    widgetModalMode,
    widgetModalData,
    
    // Actions
    actions: {
      handleToggleEditMode,
      handleAddWidget,
      handleDeleteWidget,
      handleDuplicateWidget,
      handleEditWidget,
      handleLayoutChange,
      handleUndo,
      handleRedo,
      handleCloseWidgetModal,
      handleWidgetModalSubmit,
    },
  };
}