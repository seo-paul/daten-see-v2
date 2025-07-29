'use client';

import { useParams } from 'next/navigation';

import { ResponsiveDashboard } from '@/components/dashboard/ResponsiveDashboard';
import { WidgetConfigModal } from '@/components/dashboard/WidgetConfigModal';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDashboard } from '@/hooks/dashboard/useDashboardQueries';
import { useDashboardUIState } from '@/hooks/dashboard/useDashboardUIState';

export default function DashboardDetailPage(): React.ReactElement {
  const params = useParams();
  const dashboardId = params.id as string;
  
  /**
   * STATE MANAGEMENT STRATEGY:
   * 
   * 🔄 TanStack Query = Server State Management
   * - Dashboard data from API (currentDashboard)
   * - Loading states, error handling, caching
   * - Optimistic updates, invalidation, background refetch
   * 
   * 🎨 Zustand (via useDashboardUIState) = UI State Management  
   * - Edit mode toggle, widget layouts, undo/redo stacks
   * - Local user interactions that don't require server sync
   * - Component-specific UI state (modals, selections, transient data)
   */
  
  // TanStack Query for server state - Dashboard data from API
  const { data: currentDashboard, isLoading, error } = useDashboard(dashboardId);
  
  // Custom hook for UI state management - Edit mode, widgets, undo/redo
  const {
    isEditMode,
    widgets,
    layouts,
    canUndo,
    canRedo,
    widgetModalOpen,
    widgetModalMode,
    widgetModalData,
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
  } = useDashboardUIState(dashboardId);

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
              canUndo={canUndo}
              canRedo={canRedo}
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

        {/* Widget Configuration Modal */}
        <WidgetConfigModal
          isOpen={widgetModalOpen}
          mode={widgetModalMode}
          {...(widgetModalData && { widget: widgetModalData })}
          onClose={handleCloseWidgetModal}
          onSubmit={handleWidgetModalSubmit}
        />
      </div>
    </MainLayout>
  );
}