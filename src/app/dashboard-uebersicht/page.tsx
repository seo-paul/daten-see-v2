'use client';

import { useState } from 'react';

import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardErrorMessage } from '@/components/dashboard/DashboardErrorMessage';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { DashboardLoadingState } from '@/components/dashboard/DashboardLoadingState';
import { DashboardModals } from '@/components/dashboard/DashboardModals';
import { DashboardNoSearchResults } from '@/components/dashboard/DashboardNoSearchResults';
import { DashboardOverviewHeader } from '@/components/dashboard/DashboardOverviewHeader';
import { DashboardSearchBar } from '@/components/dashboard/DashboardSearchBar';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDashboards, useCreateDashboard, useUpdateDashboard, useDeleteDashboard } from '@/hooks/dashboard/useDashboardQueries';
import type { DashboardListItem, CreateDashboardRequest, UpdateDashboardRequest } from '@/types/dashboard.types';

export default function DashboardsPage(): React.ReactElement {
  /**
   * STATE MANAGEMENT STRATEGY:
   * 🔄 TanStack Query = Server State (Dashboard CRUD, API calls, caching)
   * 🎨 Local React State = UI State (modals, search, editing state)
   */
  
  // TanStack Query hooks for server state - Dashboard list from API
  const { data: dashboards = [], isLoading, error } = useDashboards();
  const createDashboardMutation = useCreateDashboard();
  const updateDashboardMutation = useUpdateDashboard('dummy-id');
  const deleteDashboardMutation = useDeleteDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<DashboardListItem | null>(null);

  // Filter dashboards based on search query
  const filteredDashboards = (dashboards as DashboardListItem[]).filter((dashboard: DashboardListItem) =>
    dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dashboard.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (dashboard: DashboardListItem): void => {
    setEditingDashboard(dashboard);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm('Sind Sie sicher, dass Sie dieses Dashboard löschen möchten?')) {
      await deleteDashboardMutation.mutateAsync(id);
    }
  };

  const handleCreate = async (data: CreateDashboardRequest): Promise<string> => {
    const result = await createDashboardMutation.mutateAsync(data);
    return result.dashboardId;
  };

  const handleUpdate = async (data: UpdateDashboardRequest): Promise<void> => {
    if (!editingDashboard) return;
    await updateDashboardMutation.mutateAsync(data);
  };

  // Computed values for component display logic
  const dashboardsTyped = dashboards as DashboardListItem[];
  const errorTyped = error as Error | null;
  
  const showSearch = dashboardsTyped.length > 0;
  const showLoading = isLoading && dashboardsTyped.length === 0;
  const showGrid = !isLoading && filteredDashboards.length > 0;
  const showEmptyState = !isLoading && dashboardsTyped.length === 0;
  const showNoResults = !isLoading && dashboardsTyped.length > 0 && filteredDashboards.length === 0;

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <DashboardOverviewHeader
            dashboards={dashboardsTyped}
            onCreateClick={() => setShowCreateModal(true)}
          />

          <DashboardSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showSearch={showSearch}
          />

          <DashboardErrorMessage error={errorTyped} />

          <DashboardLoadingState 
            isLoading={isLoading}
            showLoading={showLoading}
          />

          <DashboardGrid
            dashboards={filteredDashboards}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showGrid={showGrid}
          />

          <DashboardEmptyState
            onCreateClick={() => setShowCreateModal(true)}
            showEmptyState={showEmptyState}
          />

          <DashboardNoSearchResults
            searchQuery={searchQuery}
            showNoResults={showNoResults}
          />
        </div>
      </div>

      <DashboardModals
        showCreateModal={showCreateModal}
        showEditModal={showEditModal}
        editingDashboard={editingDashboard}
        createLoading={createDashboardMutation.isPending}
        updateLoading={updateDashboardMutation.isPending}
        onCreateClose={() => setShowCreateModal(false)}
        onEditClose={() => {
          setShowEditModal(false);
          setEditingDashboard(null);
        }}
        onCreateSubmit={handleCreate}
        onUpdateSubmit={handleUpdate}
      />
    </MainLayout>
  );
}