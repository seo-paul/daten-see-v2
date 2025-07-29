'use client';

import { useState, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout, Layouts } from 'react-grid-layout';

import { DashboardWidget } from './DashboardCanvas';
import { WidgetRenderer } from './WidgetRenderer';

// Import grid layout styles
import '@/styles/react-grid-layout.css';

// Create responsive grid layout component
const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * Responsive Dashboard Props
 */
interface ResponsiveDashboardProps {
  widgets: DashboardWidget[];
  layouts: Layouts;
  onLayoutChange?: (currentLayout: Layout[], allLayouts: Layouts) => void;
  isEditMode?: boolean;
  onEditWidget?: (widgetId: string) => void;
  onDeleteWidget?: (widgetId: string) => void;
  onDuplicateWidget?: (widgetId: string) => void;
  className?: string;
}

/**
 * Responsive Dashboard Component
 * Automatically adjusts layout for different screen sizes
 */
export function ResponsiveDashboard({
  widgets,
  layouts: initialLayouts,
  onLayoutChange,
  isEditMode = false,
  onEditWidget,
  onDeleteWidget,
  onDuplicateWidget,
  className = '',
}: ResponsiveDashboardProps) {
  const [layouts, setLayouts] = useState<Layouts>(initialLayouts);

  // Handle layout changes across all breakpoints
  const handleLayoutChange = useCallback((currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    onLayoutChange?.(currentLayout, allLayouts);
  }, [onLayoutChange]);

  // Grid configuration
  const gridProps = {
    className: `react-grid-layout ${isEditMode ? 'dashboard-edit-mode' : ''} ${className}`,
    layouts: layouts,
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    rowHeight: 80,
    isDraggable: isEditMode,
    isResizable: isEditMode,
    compactType: 'vertical' as const,
    preventCollision: false,
    onLayoutChange: handleLayoutChange,
  };

  return (
    <div className="dashboard-grid-container">
      <ResponsiveGridLayout {...gridProps}>
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-content">
            <WidgetRenderer
              widget={widget}
              isEditMode={isEditMode}
              onEdit={onEditWidget ? () => onEditWidget(widget.id) : undefined}
              onDelete={onDeleteWidget ? () => onDeleteWidget(widget.id) : undefined}
              onDuplicate={onDuplicateWidget ? () => onDuplicateWidget(widget.id) : undefined}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}

/**
 * Generate default layouts for a widget
 */
export function generateDefaultLayouts(widgetId: string, type: DashboardWidget['type']): Layouts {
  // Default sizes based on widget type
  const defaultSizes = {
    line: { w: 6, h: 4 },
    bar: { w: 6, h: 4 },
    pie: { w: 4, h: 4 },
    kpi: { w: 3, h: 2 },
    text: { w: 4, h: 3 },
  };

  const size = defaultSizes[type];

  return {
    lg: [{ i: widgetId, x: 0, y: 0, ...size }],
    md: [{ i: widgetId, x: 0, y: 0, w: Math.min(size.w, 10), h: size.h }],
    sm: [{ i: widgetId, x: 0, y: 0, w: Math.min(size.w, 6), h: size.h }],
    xs: [{ i: widgetId, x: 0, y: 0, w: 4, h: size.h }],
    xxs: [{ i: widgetId, x: 0, y: 0, w: 2, h: size.h }],
  };
}

/**
 * Merge layouts for multiple widgets
 */
export function mergeLayouts(existingLayouts: Layouts, newLayouts: Layouts): Layouts {
  const merged: Layouts = {};
  const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];

  breakpoints.forEach((bp) => {
    merged[bp] = [
      ...(existingLayouts[bp] || []),
      ...(newLayouts[bp] || []),
    ];
  });

  return merged;
}

/**
 * Remove widget from all layout breakpoints
 */
export function removeWidgetFromLayouts(layouts: Layouts, widgetId: string): Layouts {
  const updated: Layouts = {};
  
  Object.entries(layouts).forEach(([breakpoint, layout]) => {
    updated[breakpoint] = layout.filter(item => item.i !== widgetId);
  });

  return updated;
}

/**
 * Update widget position in layouts
 */
export function updateWidgetInLayouts(
  layouts: Layouts, 
  widgetId: string, 
  updates: Partial<Layout>
): Layouts {
  const updated: Layouts = {};
  
  Object.entries(layouts).forEach(([breakpoint, layout]) => {
    updated[breakpoint] = layout.map(item => 
      item.i === widgetId ? { ...item, ...updates } : item
    );
  });

  return updated;
}

/**
 * Default empty dashboard layouts
 */
export const EMPTY_LAYOUTS: Layouts = {
  lg: [],
  md: [],
  sm: [],
  xs: [],
  xxs: [],
};