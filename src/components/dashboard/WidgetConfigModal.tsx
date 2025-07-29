/**
 * Widget Configuration Modal
 * Unified modal for widget creation and editing
 * Replaces prompt-based widget configuration with proper UI
 */

'use client';

import { X, LineChart, BarChart3, PieChart, Target, Type } from 'lucide-react';
import { useState, useEffect } from 'react';

import { sanitizeName } from '@/lib/utils/sanitization';
import type { DashboardWidget } from '@/types/dashboard.types';

export type WidgetConfigMode = 'create' | 'edit';

interface WidgetConfigModalProps {
  isOpen: boolean;
  mode: WidgetConfigMode;
  widget?: DashboardWidget; // For edit mode
  onClose: () => void;
  onSubmit: (widgetData: Partial<DashboardWidget>) => void;
  isLoading?: boolean;
}

interface WidgetFormData {
  type: DashboardWidget['type'];
  title: string;
  config: Record<string, unknown>;
}

const WIDGET_TYPES = [
  {
    type: 'line' as const,
    name: 'Liniendiagramm',
    description: 'Zeitbasierte Daten und Trends',
    icon: LineChart,
  },
  {
    type: 'bar' as const,
    name: 'Balkendiagramm', 
    description: 'Vergleiche zwischen Kategorien',
    icon: BarChart3,
  },
  {
    type: 'pie' as const,
    name: 'Kreisdiagramm',
    description: 'Anteile und Proportionen',
    icon: PieChart,
  },
  {
    type: 'kpi' as const,
    name: 'KPI-Karte',
    description: 'Wichtige Kennzahlen hervorheben',
    icon: Target,
  },
  {
    type: 'text' as const,
    name: 'Textblock',
    description: 'Beschreibungen und Notizen',
    icon: Type,
  },
] as const;

export function WidgetConfigModal({
  isOpen,
  mode,
  widget,
  onClose,
  onSubmit,
  isLoading = false,
}: WidgetConfigModalProps): React.ReactElement | null {
  const [formData, setFormData] = useState<WidgetFormData>({
    type: 'line',
    title: '',
    config: {},
  });
  const [errors, setErrors] = useState<Partial<WidgetFormData>>({});

  // Initialize form data when modal opens or widget changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && widget) {
        setFormData({
          type: widget.type,
          title: widget.title,
          config: widget.config,
        });
      } else {
        // Reset for create mode
        setFormData({
          type: 'line',
          title: '',
          config: {},
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, widget]);

  const validateForm = (): boolean => {
    const newErrors: Partial<WidgetFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titel ist erforderlich';
    } else if (formData.title.length < 2) {
      newErrors.title = 'Titel muss mindestens 2 Zeichen lang sein';
    } else if (formData.title.length > 50) {
      newErrors.title = 'Titel darf maximal 50 Zeichen lang sein';
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
      // Sanitize title
      const sanitizedTitle = sanitizeName(formData.title, 50);
      
      const widgetData: Partial<DashboardWidget> = {
        type: formData.type,
        title: sanitizedTitle,
        config: formData.config,
      };

      onSubmit(widgetData);
      handleClose();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Title cannot')) {
        setErrors({ title: error.message.replace('Name cannot', 'Titel kann nicht') });
      } else {
        throw error;
      }
    }
  };

  const handleClose = (): void => {
    setFormData({
      type: 'line',
      title: '',
      config: {},
    });
    setErrors({});
    onClose();
  };

  const getDefaultConfig = (type: DashboardWidget['type']): Record<string, unknown> => {
    switch (type) {
      case 'kpi':
        return {
          metric: 'Kennzahl',
          value: 0,
          unit: 'number',
          trend: 'neutral',
        };
      case 'text':
        return {
          content: 'Ihr Text hier...',
          fontSize: 'medium',
        };
      default:
        return {};
    }
  };

  const handleTypeChange = (newType: DashboardWidget['type']): void => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      config: getDefaultConfig(newType),
    }));
  };

  if (!isOpen) return null;

  const selectedWidgetType = WIDGET_TYPES.find(w => w.type === formData.type);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-[#FDF9F3] rounded-lg shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#E6D7B8]">
            <h2 className="text-lg font-semibold text-[#3d3d3d]">
              {mode === 'create' ? 'Widget hinzufügen' : 'Widget bearbeiten'}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-[#5d5d5d] hover:text-[#3d3d3d] hover:bg-[#FBF5ED] rounded-lg transition-colors"
              aria-label="Modal schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Widget Type Selection (only in create mode) */}
            {mode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-[#3d3d3d] mb-3">
                  Widget-Typ auswählen
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WIDGET_TYPES.map((widgetType) => {
                    const Icon = widgetType.icon;
                    const isSelected = formData.type === widgetType.type;
                    
                    return (
                      <button
                        key={widgetType.type}
                        type="button"
                        onClick={() => handleTypeChange(widgetType.type)}
                        className={`p-4 border-2 rounded-lg text-left transition-all hover:border-[#2F4F73] ${
                          isSelected 
                            ? 'border-[#2F4F73] bg-[#FBF5ED]' 
                            : 'border-[#E6D7B8] bg-white'
                        }`}
                        disabled={isLoading}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className={`w-5 h-5 mt-0.5 ${
                            isSelected ? 'text-[#2F4F73]' : 'text-[#5d5d5d]'
                          }`} />
                          <div>
                            <div className={`font-medium ${
                              isSelected ? 'text-[#2F4F73]' : 'text-[#3d3d3d]'
                            }`}>
                              {widgetType.name}
                            </div>
                            <div className="text-xs text-[#5d5d5d] mt-1">
                              {widgetType.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Widget Type Display (edit mode) */}
            {mode === 'edit' && selectedWidgetType && (
              <div>
                <label className="block text-sm font-medium text-[#3d3d3d] mb-2">
                  Widget-Typ
                </label>
                <div className="flex items-center space-x-3 p-3 bg-[#FBF5ED] rounded-lg border border-[#E6D7B8]">
                  <selectedWidgetType.icon className="w-5 h-5 text-[#2F4F73]" />
                  <div>
                    <div className="font-medium text-[#3d3d3d]">{selectedWidgetType.name}</div>
                    <div className="text-xs text-[#5d5d5d]">{selectedWidgetType.description}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Widget Title */}
            <div>
              <label htmlFor="widget-title" className="block text-sm font-medium text-[#3d3d3d] mb-2">
                Widget-Titel
              </label>
              <input
                id="widget-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F4F73] transition-colors ${
                  errors.title ? 'border-red-300' : 'border-[#E6D7B8]'
                }`}
                placeholder="z.B. Umsatz Q4 2024"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Widget-specific Configuration */}
            {formData.type === 'kpi' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[#3d3d3d]">KPI-Konfiguration</h3>
                
                <div>
                  <label htmlFor="kpi-metric" className="block text-xs font-medium text-[#5d5d5d] mb-1">
                    Kennzahl-Name
                  </label>
                  <input
                    id="kpi-metric"
                    type="text"
                    value={formData.config.metric || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      config: { ...prev.config, metric: e.target.value }
                    }))}
                    className="w-full px-2 py-1 border border-[#E6D7B8] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2F4F73]"
                    placeholder="z.B. Umsatz"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="kpi-value" className="block text-xs font-medium text-[#5d5d5d] mb-1">
                      Aktueller Wert
                    </label>
                    <input
                      id="kpi-value"
                      type="number"
                      value={formData.config.value || 0}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, value: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-2 py-1 border border-[#E6D7B8] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2F4F73]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="kpi-unit" className="block text-xs font-medium text-[#5d5d5d] mb-1">
                      Einheit
                    </label>
                    <select
                      id="kpi-unit"
                      value={formData.config.unit || 'number'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        config: { ...prev.config, unit: e.target.value }
                      }))}
                      className="w-full px-2 py-1 border border-[#E6D7B8] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2F4F73]"
                    >
                      <option value="number">Zahl</option>
                      <option value="currency">Währung</option>
                      <option value="percentage">Prozent</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'text' && (
              <div>
                <label htmlFor="text-content" className="block text-sm font-medium text-[#3d3d3d] mb-2">
                  Text-Inhalt
                </label>
                <textarea
                  id="text-content"
                  value={formData.config.content || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    config: { ...prev.config, content: e.target.value }
                  }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-[#E6D7B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F4F73] resize-none"
                  placeholder="Geben Sie Ihren Text ein..."
                />
              </div>
            )}
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
              {isLoading 
                ? (mode === 'create' ? 'Erstelle...' : 'Speichere...') 
                : (mode === 'create' ? 'Widget erstellen' : 'Änderungen speichern')
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}