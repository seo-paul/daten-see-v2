'use client';

import { Edit3, Copy, Trash2, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { 
  DashboardLineChart, 
  DashboardBarChart, 
  DashboardPieChart,
  DashboardKPICard,
  type SimpleChartData,
} from '@/components/charts';
import type { DashboardWidget } from './DashboardCanvas';

/**
 * Widget Renderer Props
 */
interface WidgetRendererProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

/**
 * Widget Renderer Component
 * Renders the actual chart/content based on widget type
 */
export function WidgetRenderer({
  widget,
  isEditMode,
  onEdit,
  onDelete,
  onDuplicate,
}: WidgetRendererProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="widget-header">
        <h3 className="text-sm font-medium text-[#3d3d3d] truncate">
          {widget.title}
        </h3>
        {isEditMode && (
          <div className="widget-toolbar" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              title="Widget-Optionen"
              aria-label="Widget-Optionen"
              className="relative"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 z-50 bg-white rounded-lg shadow-lg border border-[#E6D7B8] py-1 min-w-[160px]">
                <button
                  onClick={() => {
                    onEdit?.();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[#3d3d3d] hover:bg-[#F5EFE7] flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Bearbeiten
                </button>
                <button
                  onClick={() => {
                    onDuplicate?.();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[#3d3d3d] hover:bg-[#F5EFE7] flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplizieren
                </button>
                <hr className="my-1 border-[#E6D7B8]" />
                <button
                  onClick={() => {
                    onDelete?.();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Löschen
                </button>
              </div>
            )}
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
 * Widget Content Component
 * Renders the appropriate chart component based on widget type
 */
function WidgetContent({ widget }: { widget: DashboardWidget }) {
  // Mock data for demonstration - will be replaced with real data
  const mockLineData: SimpleChartData = {
    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Umsatz 2024',
      data: [45000, 52000, 48000, 61000, 55000, 67000],
    }],
  };

  const mockBarData: SimpleChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: '2024',
      data: [145000, 183000, 203000, 196000],
    }],
  };

  const mockPieData: SimpleChartData = {
    labels: ['Marketing', 'Personal', 'Technologie', 'Büro'],
    datasets: [{
      label: 'Ausgaben',
      data: [35000, 45000, 25000, 15000],
    }],
  };

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
  const defaultConfigs = {
    line: {
      title: 'Liniendiagramm',
      config: {
        height: 250,
        showGrid: true,
        showLegend: true,
      },
    },
    bar: {
      title: 'Balkendiagramm',
      config: {
        height: 250,
        horizontal: false,
        stacked: false,
      },
    },
    pie: {
      title: 'Kreisdiagramm',
      config: {
        height: 250,
        doughnut: false,
      },
    },
    kpi: {
      title: 'KPI Metrik',
      config: {
        metric: 'Gesamtumsatz',
        value: 0,
        unit: 'currency',
      },
    },
    text: {
      title: 'Text Widget',
      config: {
        content: 'Fügen Sie hier Ihren Text ein...',
      },
    },
  };

  return {
    type,
    ...defaultConfigs[type],
  };
}