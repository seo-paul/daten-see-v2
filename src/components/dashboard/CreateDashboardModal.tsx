'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import type { CreateDashboardRequest } from '@/types/dashboard.types';

interface CreateDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDashboardRequest) => Promise<string>;
  isLoading: boolean;
}

export function CreateDashboardModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading 
}: CreateDashboardModalProps): React.ReactElement | null {
  const [formData, setFormData] = useState<CreateDashboardRequest>({
    name: '',
    description: '',
    isPublic: false
  });
  const [errors, setErrors] = useState<Partial<CreateDashboardRequest>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateDashboardRequest> = {};

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
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({ name: '', description: '', isPublic: false });
      setErrors({});
      onClose();
    } catch {
      // Error handling is done in the parent component
    }
  };

  const handleClose = (): void => {
    setFormData({ name: '', description: '', isPublic: false });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Neues Dashboard erstellen
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="dashboard-name" className="block text-sm font-medium text-gray-700 mb-2">
                Dashboard Name
              </label>
              <input
                id="dashboard-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
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
              <label htmlFor="dashboard-description" className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                id="dashboard-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
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
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                Dashboard öffentlich machen
              </label>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Erstelle...' : 'Dashboard erstellen'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}