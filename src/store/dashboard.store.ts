import type { Layouts } from 'react-grid-layout';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { DashboardWidget } from '@/types/dashboard.types';

/**
 * Dashboard UI State Store (Zustand)
 * 
 * 🎨 UI STATE MANAGEMENT ONLY
 * 
 * STATE MANAGEMENT STRATEGY:
 * 🔄 TanStack Query = Server State (API data, caching, loading, optimistic updates)
 * 🎨 Zustand Store = UI State (edit mode, layouts, undo/redo, widget management)
 * 
 * Handles ONLY client-side UI state (edit mode, undo/redo, widget states)
 * Server state is managed by TanStack Query
 */
interface DashboardUIStore {
  // Edit Mode State
  isEditMode: boolean;
  hasChanges: boolean;
  
  // Widget Management State  
  widgets: DashboardWidget[];
  layouts: Layouts;
  
  // Undo/Redo State
  undoStack: {widgets: DashboardWidget[]; layouts: Layouts}[];
  redoStack: {widgets: DashboardWidget[]; layouts: Layouts}[];
  
  // UI Actions
  setEditMode: (isEditMode: boolean) => void;
  setHasChanges: (hasChanges: boolean) => void;
  setWidgets: (widgets: DashboardWidget[]) => void;
  setLayouts: (layouts: Layouts) => void;
  
  // Undo/Redo Actions
  pushUndoState: (state: {widgets: DashboardWidget[]; layouts: Layouts}) => void;
  pushRedoState: (state: {widgets: DashboardWidget[]; layouts: Layouts}) => void;
  clearRedoStack: () => void;
  undo: () => {widgets: DashboardWidget[]; layouts: Layouts} | null;
  redo: () => {widgets: DashboardWidget[]; layouts: Layouts} | null;
  
  // Reset
  resetUIState: () => void;
}

const EMPTY_LAYOUTS = {
  lg: [],
  md: [],
  sm: [],
  xs: [],
  xxs: [],
};

export const useDashboardUIStore = create<DashboardUIStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial UI state
    isEditMode: false,
    hasChanges: false,
    widgets: [],
    layouts: EMPTY_LAYOUTS,
    undoStack: [],
    redoStack: [],

    // UI Actions
    setEditMode: (isEditMode: boolean): void => {
      set({ isEditMode });
    },

    setHasChanges: (hasChanges: boolean): void => {
      set({ hasChanges });
    },

    setWidgets: (widgets: DashboardWidget[]): void => {
      set({ widgets, hasChanges: true });
    },

    setLayouts: (layouts: Layouts): void => {
      set({ layouts, hasChanges: true });
    },

    // Undo/Redo Actions
    pushUndoState: (state: {widgets: DashboardWidget[]; layouts: Layouts}): void => {
      set(current => ({
        undoStack: [...current.undoStack, state]
      }));
    },

    pushRedoState: (state: {widgets: DashboardWidget[]; layouts: Layouts}): void => {
      set(current => ({
        redoStack: [...current.redoStack, state]
      }));
    },

    clearRedoStack: (): void => {
      set({ redoStack: [] });
    },

    undo: (): {widgets: DashboardWidget[]; layouts: Layouts} | null => {
      const { undoStack } = get();
      if (undoStack.length === 0) return null;
      
      const previousState = undoStack[undoStack.length - 1];
      if (!previousState) return null;
      
      set(current => ({
        undoStack: current.undoStack.slice(0, -1),
        widgets: previousState.widgets,
        layouts: previousState.layouts,
        hasChanges: true
      }));
      
      return previousState;
    },

    redo: (): {widgets: DashboardWidget[]; layouts: Layouts} | null => {
      const { redoStack } = get();
      if (redoStack.length === 0) return null;
      
      const nextState = redoStack[redoStack.length - 1];
      if (!nextState) return null;
      
      set(current => ({
        redoStack: current.redoStack.slice(0, -1),
        widgets: nextState.widgets,
        layouts: nextState.layouts,
        hasChanges: true
      }));
      
      return nextState;
    },

    resetUIState: (): void => {
      set({
        isEditMode: false,
        hasChanges: false,
        widgets: [],
        layouts: EMPTY_LAYOUTS,
        undoStack: [],
        redoStack: []
      });
    }
  }))
);