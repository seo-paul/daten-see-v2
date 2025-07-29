'use client';

import { X, Move3D } from 'lucide-react';
import React from 'react';

import { 
  DashboardLineChart, 
  DashboardBarChart, 
  DashboardPieChart,
  DashboardKPICard,
} from '@/components/charts';
import { mockLineData, mockBarData, mockPieData } from '@/lib/mock-data';
import type { DashboardWidget } from '@/types/dashboard.types';

/**
 * Widget Renderer Props
 * Fixed for exactOptionalPropertyTypes compatibility
 */
interface WidgetRendererProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onEdit?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
  onDuplicate?: (() => void) | undefined;
}

/**
 * Widget Renderer Component
 * Renders the actual chart/content based on widget type
 */
function WidgetRendererBase({
  widget,
  isEditMode,
  onDelete,
}: WidgetRendererProps): React.ReactElement {

  return (
    <div className={`widget-container relative h-full ${isEditMode ? 'widget-edit-mode' : ''}`}>
      {/* Edit Mode Overlay */}
      {isEditMode && (
        <div className="absolute inset-0 bg-blue-100/30 border-2 border-blue-300/50 rounded-lg pointer-events-none z-10" />
      )}
      
      {/* Resize Handle - Only visible in edit mode */}
      {isEditMode && (
        <div className="absolute bottom-2 right-2 z-20 w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-sm flex items-center justify-center cursor-se-resize transition-colors shadow-sm">
          <Move3D className="w-3 h-3" />
        </div>
      )}

      <div className="widget-header">
        <h3 className="text-sm font-medium text-[#3d3d3d] truncate">
          {widget.title}
        </h3>
        {isEditMode && (
          <div className="widget-toolbar">
            <button
              type="button"
              onMouseDown={(e) => {
                // CRITICAL: Prevent grid layout from capturing this event
                e.stopPropagation();
                e.preventDefault();
                console.log('🎯 MOUSE DOWN on delete button - preventing grid drag');
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🎯 DELETE BUTTON CLICKED:', widget.id);
                console.log('🎯 onDelete function available:', typeof onDelete);
                
                // Enhanced debouncing and error handling
                const button = e.currentTarget;
                if (button.hasAttribute('data-deleting')) {
                  console.log('🚫 DELETE BLOCKED: Already deleting');
                  return;
                }
                
                button.setAttribute('data-deleting', 'true');
                button.style.opacity = '0.5';
                
                // Execute deletion with proper error handling
                try {
                  if (onDelete) {
                    console.log('🔄 CALLING onDelete function...');
                    onDelete();
                  } else {
                    console.error('❌ onDelete function is undefined!');
                  }
                } catch (error) {
                  console.error('❌ DELETE ERROR:', error);
                } finally {
                  // Clean up after deletion completes or fails
                  setTimeout(() => {
                    button.removeAttribute('data-deleting');
                    button.style.opacity = '1';
                  }, 1000);
                }
              }}
              title="Widget löschen"
              aria-label="Widget löschen"
              className="delete-widget-btn"
              style={{ 
                pointerEvents: 'auto',
                zIndex: 1000, // Higher than grid elements
                position: 'relative'
              }}
            >
              <X className="w-3 h-3" style={{ pointerEvents: 'none' }} />
            </button>
          </div>
        )}
      </div>
      <div className="widget-body">
        <WidgetContent widget={widget} />
      </div>
    </div>
  );
}

/**
 * Widget Content Component
 * Renders the appropriate chart component based on widget type
 */
function WidgetContent({ widget }: { widget: DashboardWidget }): React.ReactElement {

  switch (widget.type) {
    case 'line':
      return (
        <DashboardLineChart
          data={widget.config.data || mockLineData}
          title=""
          height={widget.config.height || 250}
        />
      );

    case 'bar':
      return (
        <DashboardBarChart
          data={widget.config.data || mockBarData}
          title=""
          height={widget.config.height || 250}
        />
      );

    case 'pie':
      return (
        <DashboardPieChart
          data={widget.config.data || mockPieData}
          title=""
          height={widget.config.height || 250}
        />
      );

    case 'kpi':
      return (
        <DashboardKPICard
          title={widget.config.metric || 'Metrik'}
          value={widget.config.value || 125000}
          previousValue={widget.config.previousValue || 118000}
          unit={widget.config.unit || 'currency'}
          trend={widget.config.trend || 'up'}
        />
      );

    case 'text':
      return (
        <div className="prose prose-sm max-w-none">
          <p className="text-[#5d5d5d]">
            {widget.config.content || 'Text-Widget Inhalt hier...'}
          </p>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center h-full text-[#5d5d5d]">
          <div className="text-center">
            <div className="text-sm">
              Unbekannter Widget-Typ: {widget.type}
            </div>
          </div>
        </div>
      );
  }
}

/**
 * Generate a new widget with default configuration
 */
export function createDefaultWidget(type: DashboardWidget['type']): Omit<DashboardWidget, 'id'> {
  const defaultConfigs: Record<DashboardWidget['type'], Omit<DashboardWidget, 'id'>> = {
    line: {
      type: 'line',
      title: 'Liniendiagramm',
      config: {
        height: 250,
        showGrid: true,
        showLegend: true,
      },
    },
    bar: {
      type: 'bar',
      title: 'Balkendiagramm',
      config: {
        height: 250,
        horizontal: false,
        stacked: false,
      },
    },
    pie: {
      type: 'pie',
      title: 'Kreisdiagramm',
      config: {
        height: 250,
        doughnut: false,
      },
    },
    kpi: {
      type: 'kpi',
      title: 'KPI Metrik',
      config: {
        metric: 'Gesamtumsatz',
        value: 0,
        unit: 'currency',
      },
    },
    text: {
      type: 'text',
      title: 'Text Widget',
      config: {
        content: 'Fügen Sie hier Ihren Text ein...',
      },
    },
  };

  return defaultConfigs[type as keyof typeof defaultConfigs];
}

/**
 * Memoized Widget Renderer
 * Prevents unnecessary re-renders when widget props haven't changed
 */
export const WidgetRenderer = React.memo(WidgetRendererBase);