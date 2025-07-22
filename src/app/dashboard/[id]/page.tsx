'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDashboardStore } from '@/store/dashboard.store';

export default function DashboardDetailPage(): React.ReactElement {
  const params = useParams();
  const dashboardId = params.id as string;
  
  const {
    currentDashboard,
    isLoading,
    error,
    fetchDashboard,
    clearError
  } = useDashboardStore();

  // Load dashboard on mount
  useEffect(() => {
    if (dashboardId) {
      fetchDashboard(dashboardId);
    }
  }, [dashboardId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Back Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <Link 
            href="/dashboards"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 border-2 border-gray-300 border-dashed rounded animate-spin"></div>
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
                  <strong>Fehler beim Laden:</strong> {error}
                </div>
                <div className="space-x-3">
                  <button
                    onClick={clearError}
                    className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Schließen
                  </button>
                  <button
                    onClick={() => fetchDashboard(dashboardId)}
                    className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Erneut versuchen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && !error && currentDashboard && (
          <>
            {/* Dashboard Header */}
            <DashboardHeader
              title={currentDashboard.name}
              subtitle={`${currentDashboard.description} • ${currentDashboard.isPublic ? 'Öffentlich' : 'Privat'}`}
              lastUpdated={new Intl.DateTimeFormat('de-DE', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }).format(currentDashboard.updatedAt)}
            />

            {/* Main Dashboard Content */}
            <DashboardGrid>
              {currentDashboard.widgets.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg font-medium mb-2">Keine Widgets vorhanden</p>
                  <p className="text-sm">Widgets werden in Task 1.7 implementiert</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentDashboard.widgets.map(widget => (
                    <div
                      key={widget.id}
                      className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                      <h4 className="font-medium text-gray-900 mb-2">{widget.title}</h4>
                      <p className="text-sm text-gray-500">Widget Type: {widget.type}</p>
                    </div>
                  ))}
                </div>
              )}
            </DashboardGrid>
          </>
        )}
      </div>
    </MainLayout>
  );
}