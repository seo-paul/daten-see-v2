import type { Layouts } from 'react-grid-layout';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { DashboardWidget } from '@/types/dashboard.types';
import { demoWidgets, demoLayouts } from '@/lib/mock-data';

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
  
  // Initialization State - CRITICAL for preventing race conditions
  isInitialized: boolean;
  hasBeenModified: boolean; // Track if user has made any changes
  
  // Undo/Redo State
  undoStack: {widgets: DashboardWidget[]; layouts: Layouts}[];
  redoStack: {widgets: DashboardWidget[]; layouts: Layouts}[];
  
  // UI Actions
  setEditMode: (isEditMode: boolean) => void;
  setHasChanges: (hasChanges: boolean) => void;
  setWidgets: (widgets: DashboardWidget[] | ((prev: DashboardWidget[]) => DashboardWidget[])) => void;
  setLayouts: (layouts: Layouts | ((prev: Layouts) => Layouts)) => void;
  
  // Initialization Actions
  initializeDemoData: () => void;
  markAsModified: () => void;
  
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
    
    // Initialization state - CRITICAL for race condition prevention
    isInitialized: false,
    hasBeenModified: false,
    
    undoStack: [],
    redoStack: [],

    // UI Actions
    setEditMode: (isEditMode: boolean): void => {
      set({ isEditMode });
    },

    setHasChanges: (hasChanges: boolean): void => {
      set({ hasChanges });
    },

    setWidgets: (widgets: DashboardWidget[] | ((prev: DashboardWidget[]) => DashboardWidget[])): void => {
      if (typeof widgets === 'function') {
        set((state) => ({ 
          widgets: widgets(state.widgets), 
          hasChanges: true, 
          hasBeenModified: true 
        }));
      } else {
        set({ widgets, hasChanges: true, hasBeenModified: true });
      }
    },

    setLayouts: (layouts: Layouts | ((prev: Layouts) => Layouts)): void => {
      if (typeof layouts === 'function') {
        set((state) => ({ 
          layouts: layouts(state.layouts), 
          hasChanges: true, 
          hasBeenModified: true 
        }));
      } else {
        set({ layouts, hasChanges: true, hasBeenModified: true });
      }
    },

    // Initialization Actions - CRITICAL for preventing race conditions
    initializeDemoData: (): void => {
      const { isInitialized, hasBeenModified } = get();
      
      // NEVER re-initialize if already initialized OR if user has made changes
      if (isInitialized || hasBeenModified) {
        return;
      }
      
      set({ 
        widgets: demoWidgets,
        layouts: demoLayouts,
        isInitialized: true,
        hasChanges: false // Demo data is not a "change"
      });
    },

    markAsModified: (): void => {
      set({ hasBeenModified: true });
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
        isInitialized: false,
        hasBeenModified: false,
        undoStack: [],
        redoStack: []
      });
    }
  }))
);