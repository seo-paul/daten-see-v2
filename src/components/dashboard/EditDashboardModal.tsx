'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { DashboardListItem, UpdateDashboardRequest } from '@/types/dashboard.types';

interface EditDashboardModalProps {
  dashboard: DashboardListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateDashboardRequest) => Promise<void>;
  isLoading: boolean;
}

interface FormData {
  name: string;
  description: string;
  isPublic: boolean;
}

export function EditDashboardModal({ 
  dashboard,
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading 
}: EditDashboardModalProps): React.ReactElement | null {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    isPublic: false
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Update form when dashboard changes
  useEffect(() => {
    if (dashboard) {
      setFormData({
        name: dashboard.name,
        description: dashboard.description,
        isPublic: dashboard.isPublic
      });
      setErrors({});
    }
  }, [dashboard]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name muss mindestens 3 Zeichen lang sein';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Beschreibung ist erforderlich';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Beschreibung muss mindestens 10 Zeichen lang sein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!dashboard || !validateForm()) {
      return;
    }

    try {
      await onSubmit({
        id: dashboard.id,
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic
      });
      onClose();
    } catch {
      // Error handling is done in the parent component
    }
  };

  const handleClose = (): void => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !dashboard) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-[#FDF9F3] rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#E6D7B8]">
            <h2 className="text-lg font-semibold text-[#3d3d3d]">
              Dashboard bearbeiten
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-[#5d5d5d] hover:text-[#3d3d3d] hover:bg-[#FBF5ED] rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="edit-dashboard-name" className="block text-sm font-medium text-[#3d3d3d] mb-2">
                Dashboard Name
              </label>
              <input
                id="edit-dashboard-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F4F73] transition-colors ${
                  errors.name ? 'border-red-300' : 'border-[#E6D7B8]'
                }`}
                placeholder="z.B. Sales Analytics"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="edit-dashboard-description" className="block text-sm font-medium text-[#3d3d3d] mb-2">
                Beschreibung
              </label>
              <textarea
                id="edit-dashboard-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F4F73] resize-none transition-colors ${
                  errors.description ? 'border-red-300' : 'border-[#E6D7B8]'
                }`}
                placeholder="Beschreibe das Dashboard und seinen Zweck..."
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Public/Private Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="w-4 h-4 text-[#2F4F73] border-[#E6D7B8] rounded focus:ring-[#2F4F73]"
                disabled={isLoading}
              />
              <label htmlFor="isPublic" className="ml-2 text-sm text-[#3d3d3d]">
                Dashboard öffentlich machen
              </label>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-[#E6D7B8]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-[#3d3d3d] bg-[#FBF5ED] hover:bg-[#F5EFE7] rounded-lg transition-colors"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2F4F73] hover:bg-[#365C83] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Speichere...' : 'Änderungen speichern'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}