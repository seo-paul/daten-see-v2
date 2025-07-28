'use client';

import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CreateDashboardModal } from '@/components/dashboard/CreateDashboardModal';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { EditDashboardModal } from '@/components/dashboard/EditDashboardModal';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useDashboardStore } from '@/store/dashboard.store';
import type { DashboardListItem } from '@/types/dashboard.types';

export default function DashboardsPage(): React.ReactElement {
  const {
    dashboards,
    isLoading,
    error,
    fetchDashboards,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    clearError
  } = useDashboardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<DashboardListItem | null>(null);

  // Load dashboards on mount
  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  // Filter dashboards based on search query
  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dashboard.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (dashboard: DashboardListItem): void => {
    setEditingDashboard(dashboard);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm('Sind Sie sicher, dass Sie dieses Dashboard löschen möchten?')) {
      await deleteDashboard(id);
    }
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#3d3d3d]">
                Dashboard-Übersicht
              </h1>
              <p className="text-sm text-[#5d5d5d] mt-1">
                {dashboards.length > 0 
                  ? `${dashboards.length} Dashboard${dashboards.length === 1 ? '' : 's'} verfügbar`
                  : 'Noch keine Dashboards erstellt'
                }
              </p>
            </div>

            <Button
              variant="primary"
              context="page"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Neues Dashboard
            </Button>
          </div>

          {/* Search Bar */}
          {dashboards.length > 0 && (
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5d5d5d] w-5 h-5" />
              <input
                type="text"
                placeholder="Dashboards durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E6D7B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F4F73] focus:border-transparent"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-red-600 text-sm">
                    <strong>Fehler:</strong> {error}
                  </div>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 text-sm underline"
                >
                  Schließen
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && dashboards.length === 0 && (
            <div className="bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-8">
              <div className="text-center text-[#5d5d5d]">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#FBF5ED] rounded-lg flex items-center justify-center animate-pulse">
                  <div className="w-8 h-8 border-2 border-[#E6D7B8] border-dashed rounded animate-spin"></div>
                </div>
                <p className="text-lg font-medium">Lade Dashboards...</p>
              </div>
            </div>
          )}

          {/* Dashboard Grid */}
          {!isLoading && filteredDashboards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDashboards.map(dashboard => (
                <DashboardCard
                  key={dashboard.id}
                  dashboard={dashboard}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && dashboards.length === 0 && (
            <div className="bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-8">
              <div className="text-center text-[#5d5d5d]">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#FBF5ED] rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#E6D7B8] border-dashed rounded"></div>
                </div>
                <p className="text-lg font-medium mb-2">Noch keine Dashboards</p>
                <p className="text-sm text-[#5d5d5d] mb-4">
                  Erstellen Sie Ihr erstes Dashboard, um loszulegen.
                </p>
                <Button
                  variant="primary"
                  context="page"
                  onClick={() => setShowCreateModal(true)}
                >
                  Erstes Dashboard erstellen
                </Button>
              </div>
            </div>
          )}

          {/* No Search Results */}
          {!isLoading && dashboards.length > 0 && filteredDashboards.length === 0 && (
            <div className="bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-8">
              <div className="text-center text-[#5d5d5d]">
                <Search className="w-16 h-16 mx-auto mb-4 text-[#E6D7B8]" />
                <p className="text-lg font-medium mb-2">Keine Suchergebnisse</p>
                <p className="text-sm text-[#5d5d5d]">
                  Keine Dashboards gefunden für &quot;{searchQuery}&quot;
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateDashboardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createDashboard}
        isLoading={isLoading}
      />

      <EditDashboardModal
        dashboard={editingDashboard}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingDashboard(null);
        }}
        onSubmit={updateDashboard}
        isLoading={isLoading}
      />
    </MainLayout>
  );
}