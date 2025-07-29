/**
 * Dashboard Modals Component
 * Contains Create and Edit modals for dashboards
 */

import { CreateDashboardModal } from './CreateDashboardModal';
import { EditDashboardModal } from './EditDashboardModal';
import type { DashboardListItem, CreateDashboardRequest, UpdateDashboardRequest } from '@/types/dashboard.types';

interface DashboardModalsProps {
  showCreateModal: boolean;
  showEditModal: boolean;
  editingDashboard: DashboardListItem | null;
  createLoading: boolean;
  updateLoading: boolean;
  onCreateClose: () => void;
  onEditClose: () => void;
  onCreateSubmit: (data: CreateDashboardRequest) => Promise<string>;
  onUpdateSubmit: (data: UpdateDashboardRequest) => Promise<void>;
}

export function DashboardModals({
  showCreateModal,
  showEditModal,
  editingDashboard,
  createLoading,
  updateLoading,
  onCreateClose,
  onEditClose,
  onCreateSubmit,
  onUpdateSubmit,
}: DashboardModalsProps): React.ReactElement {
  return (
    <>
      <CreateDashboardModal
        isOpen={showCreateModal}
        onClose={onCreateClose}
        onSubmit={onCreateSubmit}
        isLoading={createLoading}
      />

      <EditDashboardModal
        dashboard={editingDashboard}
        isOpen={showEditModal}
        onClose={onEditClose}
        onSubmit={onUpdateSubmit}
        isLoading={updateLoading}
      />
    </>
  );
}