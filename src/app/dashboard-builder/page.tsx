'use client';

import { useState, useCallback } from 'react';
import type { Layout, Layouts } from 'react-grid-layout';

import { DashboardToolbar } from '@/components/dashboard/DashboardCanvas';
import { 
  ResponsiveDashboard, 
  generateDefaultLayouts, 
  mergeLayouts,
  removeWidgetFromLayouts,
  EMPTY_LAYOUTS,
} from '@/components/dashboard/ResponsiveDashboard';
import { createDefaultWidget } from '@/components/dashboard/WidgetRenderer';
import type { DashboardWidget } from '@/components/dashboard/DashboardCanvas';

/**
 * Dashboard Builder Demo Page
 * Demonstrates the drag-and-drop dashboard creation functionality
 */
export default function DashboardBuilderPage() {
  const [isEditMode, setIsEditMode] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Initialize with demo widgets
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: 'widget-1',
      type: 'line',
      title: 'Umsatzentwicklung 2024',
      config: {},
    },
    {
      id: 'widget-2',
      type: 'bar',
      title: 'Quartalsvergleich',
      config: {},
    },
    {
      id: 'widget-3',
      type: 'pie',
      title: 'Ausgabenverteilung',
      config: {},
    },
    {
      id: 'widget-4',
      type: 'kpi',
      title: 'Gesamtumsatz',
      config: {
        metric: 'Gesamtumsatz',
        value: 125000,
        previousValue: 118000,
        unit: 'currency',
        trend: 'up',
      },
    },
  ]);

  // Initialize layouts
  const [layouts, setLayouts] = useState<Layouts>({
    lg: [
      { i: 'widget-1', x: 0, y: 0, w: 6, h: 4 },
      { i: 'widget-2', x: 6, y: 0, w: 6, h: 4 },
      { i: 'widget-3', x: 0, y: 4, w: 4, h: 4 },
      { i: 'widget-4', x: 4, y: 4, w: 3, h: 2 },
    ],
    md: [
      { i: 'widget-1', x: 0, y: 0, w: 5, h: 4 },
      { i: 'widget-2', x: 5, y: 0, w: 5, h: 4 },
      { i: 'widget-3', x: 0, y: 4, w: 4, h: 4 },
      { i: 'widget-4', x: 4, y: 4, w: 3, h: 2 },
    ],
    sm: [
      { i: 'widget-1', x: 0, y: 0, w: 6, h: 4 },
      { i: 'widget-2', x: 0, y: 4, w: 6, h: 4 },
      { i: 'widget-3', x: 0, y: 8, w: 6, h: 4 },
      { i: 'widget-4', x: 0, y: 12, w: 6, h: 2 },
    ],
    xs: [
      { i: 'widget-1', x: 0, y: 0, w: 4, h: 4 },
      { i: 'widget-2', x: 0, y: 4, w: 4, h: 4 },
      { i: 'widget-3', x: 0, y: 8, w: 4, h: 4 },
      { i: 'widget-4', x: 0, y: 12, w: 4, h: 2 },
    ],
    xxs: [
      { i: 'widget-1', x: 0, y: 0, w: 2, h: 4 },
      { i: 'widget-2', x: 0, y: 4, w: 2, h: 4 },
      { i: 'widget-3', x: 0, y: 8, w: 2, h: 4 },
      { i: 'widget-4', x: 0, y: 12, w: 2, h: 2 },
    ],
  });

  // Handle layout changes
  const handleLayoutChange = useCallback((currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    setHasChanges(true);
  }, []);

  // Add new widget
  const handleAddWidget = useCallback(() => {
    const widgetType = prompt('Widget-Typ wählen: line, bar, pie, kpi, text') as DashboardWidget['type'];
    if (!widgetType || !['line', 'bar', 'pie', 'kpi', 'text'].includes(widgetType)) {
      return;
    }

    const newWidgetId = `widget-${Date.now()}`;
    const newWidget: DashboardWidget = {
      id: newWidgetId,
      ...createDefaultWidget(widgetType),
    };

    setWidgets([...widgets, newWidget]);
    setLayouts(mergeLayouts(layouts, generateDefaultLayouts(newWidgetId, widgetType)));
    setHasChanges(true);
  }, [widgets, layouts]);

  // Delete widget
  const handleDeleteWidget = useCallback((widgetId: string) => {
    if (confirm('Widget wirklich löschen?')) {
      setWidgets(widgets.filter(w => w.id !== widgetId));
      setLayouts(removeWidgetFromLayouts(layouts, widgetId));
      setHasChanges(true);
    }
  }, [widgets, layouts]);

  // Duplicate widget
  const handleDuplicateWidget = useCallback((widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const newWidgetId = `widget-${Date.now()}`;
    const newWidget: DashboardWidget = {
      ...widget,
      id: newWidgetId,
      title: `${widget.title} (Kopie)`,
    };

    setWidgets([...widgets, newWidget]);
    setLayouts(mergeLayouts(layouts, generateDefaultLayouts(newWidgetId, widget.type)));
    setHasChanges(true);
  }, [widgets, layouts]);

  // Edit widget
  const handleEditWidget = useCallback((widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const newTitle = prompt('Widget-Titel:', widget.title);
    if (newTitle && newTitle !== widget.title) {
      setWidgets(widgets.map(w => 
        w.id === widgetId ? { ...w, title: newTitle } : w
      ));
      setHasChanges(true);
    }
  }, [widgets]);

  // Save dashboard
  const handleSave = useCallback(() => {
    console.log('Saving dashboard:', { widgets, layouts });
    setHasChanges(false);
    alert('Dashboard gespeichert!');
  }, [widgets, layouts]);

  return (
    <div className="min-h-screen bg-[#FBF5ED] p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#3d3d3d]">
            🎨 Dashboard Builder
          </h1>
          <p className="text-[#5d5d5d]">
            Erstellen Sie Ihr individuelles Dashboard mit Drag & Drop
          </p>
        </div>

        {/* Toolbar */}
        <DashboardToolbar
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          onAddWidget={handleAddWidget}
          onSave={handleSave}
          hasChanges={hasChanges}
        />

        {/* Dashboard Grid */}
        <ResponsiveDashboard
          widgets={widgets}
          layouts={layouts}
          onLayoutChange={handleLayoutChange}
          isEditMode={isEditMode}
          onEditWidget={handleEditWidget}
          onDeleteWidget={handleDeleteWidget}
          onDuplicateWidget={handleDuplicateWidget}
        />

        {/* Instructions */}
        {isEditMode && (
          <div className="bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-6 mt-8">
            <h3 className="text-lg font-semibold text-[#3d3d3d] mb-4">
              📝 Anleitung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#5d5d5d]">
              <div>
                <h4 className="font-medium text-[#3d3d3d] mb-2">Bearbeitungsmodus:</h4>
                <ul className="space-y-1">
                  <li>• Widgets per Drag & Drop verschieben</li>
                  <li>• Größe an den Ecken anpassen</li>
                  <li>• Über das Menü (⋮) bearbeiten oder löschen</li>
                  <li>• Neue Widgets mit "Widget hinzufügen" erstellen</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-[#3d3d3d] mb-2">Widget-Typen:</h4>
                <ul className="space-y-1">
                  <li>• <strong>line:</strong> Liniendiagramm für Zeitverläufe</li>
                  <li>• <strong>bar:</strong> Balkendiagramm für Vergleiche</li>
                  <li>• <strong>pie:</strong> Kreisdiagramm für Anteile</li>
                  <li>• <strong>kpi:</strong> KPI-Karte für wichtige Metriken</li>
                  <li>• <strong>text:</strong> Text-Widget für Beschreibungen</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}