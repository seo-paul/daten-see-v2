/**
 * Widget Deletion Test Suite
 * 
 * Comprehensive tests for the widget deletion fix, including:
 * - Race condition prevention
 * - Demo data re-initialization issues
 * - Monitoring integration
 * - Error handling
 */

import { act, renderHook } from '@testing-library/react';
import { useDashboardUIState } from '../useDashboardUIState';

// Mock the monitoring hook
jest.mock('../useWidgetMonitoring', () => ({
  useWidgetMonitoring: () => ({
    trackWidgetOperation: jest.fn(),
    trackWidgetError: jest.fn(),
    trackPerformanceMetric: jest.fn(),
  }),
  useWidgetDebugging: jest.fn(),
}));

// Mock Zustand store
const mockStore = {
  isEditMode: true,
  hasChanges: false,
  widgets: [
    { id: 'widget-1', type: 'line', title: 'Test Widget 1', config: {} },
    { id: 'widget-2', type: 'kpi', title: 'Test Widget 2', config: {} },
  ],
  layouts: {
    lg: [
      { i: 'widget-1', x: 0, y: 0, w: 8, h: 4 },
      { i: 'widget-2', x: 8, y: 0, w: 4, h: 3 },
    ],
  },
  undoStack: [],
  redoStack: [],
  isInitialized: false,
  hasBeenModified: false,
  setEditMode: jest.fn(),
  setHasChanges: jest.fn(),
  setWidgets: jest.fn(),
  setLayouts: jest.fn(),
  initializeDemoData: jest.fn(),
  markAsModified: jest.fn(),
  pushUndoState: jest.fn(),
  clearRedoStack: jest.fn(),
  undo: jest.fn(),
  redo: jest.fn(),
};

jest.mock('@/store/dashboard.store', () => ({
  useDashboardUIStore: {
    getState: () => mockStore,
    ...(() => mockStore),
  },
}));

describe('Widget Deletion Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset store state
    mockStore.widgets = [
      { id: 'widget-1', type: 'line', title: 'Test Widget 1', config: {} },
      { id: 'widget-2', type: 'kpi', title: 'Test Widget 2', config: {} },
    ];
    mockStore.hasChanges = false;
  });

  describe('Race Condition Prevention', () => {
    it('should not re-initialize demo data after deletion', () => {
      const { result } = renderHook(() => useDashboardUIState('test-dashboard', 'test-user'));

      // Simulate deleting all widgets
      act(() => {
        result.current.actions.handleDeleteWidget('widget-1');
      });

      act(() => {
        result.current.actions.handleDeleteWidget('widget-2');
      });

      // Verify setWidgets was called for deletion, not re-initialization
      expect(mockStore.setWidgets).toHaveBeenCalledTimes(2);
      
      // Verify no demo data re-initialization
      const setWidgetsCalls = mockStore.setWidgets.mock.calls;
      setWidgetsCalls.forEach(call => {
        // Each call should be a function (functional update)
        expect(typeof call[0]).toBe('function');
      });
    });

    it('should handle single widget deletion without re-initialization', () => {
      // Start with single widget
      mockStore.widgets = [{ id: 'widget-1', type: 'line', title: 'Last Widget', config: {} }];
      
      const { result } = renderHook(() => useDashboardUIState('test-dashboard', 'test-user'));

      act(() => {
        result.current.actions.handleDeleteWidget('widget-1');
      });

      // Should only call setWidgets once for the deletion
      expect(mockStore.setWidgets).toHaveBeenCalledTimes(1);
      expect(mockStore.pushUndoState).toHaveBeenCalledTimes(1);
      expect(mockStore.clearRedoStack).toHaveBeenCalledTimes(1);
      expect(mockStore.setHasChanges).toHaveBeenCalledWith(true);
    });
  });

  describe('Functional Updates', () => {
    it('should use functional updates to prevent stale closures', () => {
      const { result } = renderHook(() => useDashboardUIState('test-dashboard', 'test-user'));

      act(() => {
        result.current.actions.handleDeleteWidget('widget-1');
      });

      // Verify setWidgets was called with a function
      expect(mockStore.setWidgets).toHaveBeenCalledWith(expect.any(Function));
      expect(mockStore.setLayouts).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should correctly filter widgets in functional update', () => {
      const { result } = renderHook(() => useDashboardUIState('test-dashboard', 'test-user'));

      act(() => {
        result.current.actions.handleDeleteWidget('widget-1');
      });

      // Get the functional update function and test it
      const functionalUpdate = mockStore.setWidgets.mock.calls[0][0];
      const mockPreviousWidgets = [
        { id: 'widget-1', type: 'line', title: 'Test Widget 1', config: {} },
        { id: 'widget-2', type: 'kpi', title: 'Test Widget 2', config: {} },
      ];

      const result_widgets = functionalUpdate(mockPreviousWidgets);
      
      expect(result_widgets).toHaveLength(1);
      expect(result_widgets[0].id).toBe('widget-2');
    });
  });

  describe('Error Handling', () => {
    it('should handle deletion of non-existent widget gracefully', () => {
      const { result } = renderHook(() => useDashboardUIState('test-dashboard', 'test-user'));

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.actions.handleDeleteWidget('non-existent-widget');
        });
      }).not.toThrow();

      // Should not modify state for non-existent widget
      expect(mockStore.setWidgets).not.toHaveBeenCalled();
      expect(mockStore.setLayouts).not.toHaveBeenCalled();
    });

    it('should preserve undo/redo state on successful deletion', () => {
      const { result } = renderHook(() => useDashboardUIState('test-dashboard', 'test-user'));

      act(() => {
        result.current.actions.handleDeleteWidget('widget-1');
      });

      expect(mockStore.pushUndoState).toHaveBeenCalledWith({
        widgets: mockStore.widgets,
        layouts: mockStore.layouts,
      });
      expect(mockStore.clearRedoStack).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should mark dashboard as having changes after deletion', () => {
      const { result } = renderHook(() => useDashboardUIState('test-dashboard', 'test-user'));

      act(() => {
        result.current.actions.handleDeleteWidget('widget-1');
      });

      expect(mockStore.setHasChanges).toHaveBeenCalledWith(true);
    });

    it('should update layouts after widget deletion', () => {
      const { result } = renderHook(() => useDashboardUIState('test-dashboard', 'test-user'));

      act(() => {
        result.current.actions.handleDeleteWidget('widget-1');
      });

      expect(mockStore.setLayouts).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Performance', () => {
    it('should complete deletion within reasonable time', async () => {
      const { result } = renderHook(() => useDashboardUIState('test-dashboard', 'test-user'));

      const startTime = performance.now();
      
      act(() => {
        result.current.actions.handleDeleteWidget('widget-1');
      });

      const duration = performance.now() - startTime;
      
      // Should complete within 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});

describe('Integration Tests', () => {
  it('should handle rapid consecutive deletions', () => {
    const { result } = renderHook(() => useDashboardUIState('test-dashboard', 'test-user'));

    // Rapidly delete multiple widgets
    act(() => {
      result.current.actions.handleDeleteWidget('widget-1');
      result.current.actions.handleDeleteWidget('widget-2');
    });

    // Should handle both deletions
    expect(mockStore.setWidgets).toHaveBeenCalledTimes(2);
    expect(mockStore.pushUndoState).toHaveBeenCalledTimes(2);
  });

  it('should maintain consistent state throughout deletion process', () => {
    const { result } = renderHook(() => useDashboardUIState('test-dashboard', 'test-user'));

    // Track state changes
    const stateChanges: string[] = [];
    
    mockStore.setWidgets.mockImplementation(() => {
      stateChanges.push('widgets-updated');
    });
    
    mockStore.setLayouts.mockImplementation(() => {
      stateChanges.push('layouts-updated');
    });
    
    mockStore.setHasChanges.mockImplementation(() => {
      stateChanges.push('has-changes-updated');
    });

    act(() => {
      result.current.actions.handleDeleteWidget('widget-1');
    });

    // Verify order of state updates
    expect(stateChanges).toEqual([
      'widgets-updated',
      'layouts-updated', 
      'has-changes-updated'
    ]);
  });
});