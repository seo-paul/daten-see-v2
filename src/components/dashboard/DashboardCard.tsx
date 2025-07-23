import { Calendar, Globe, Lock, MoreVertical, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { useState } from 'react';

import type { DashboardListItem } from '@/types/dashboard.types';

interface DashboardCardProps {
  dashboard: DashboardListItem;
  onEdit: (dashboard: DashboardListItem) => void;
  onDelete: (id: string) => void;
}

export function DashboardCard({ dashboard, onEdit, onDelete }: DashboardCardProps): React.ReactElement {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link 
            href={`/dashboard/${dashboard.id}` as Route}
            className="block hover:text-blue-600 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
              {dashboard.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 line-clamp-2">
            {dashboard.description}
          </p>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 top-8 z-20 bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[150px]">
                <button
                  type="button"
                  onClick={() => {
                    onEdit(dashboard);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Bearbeiten
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(dashboard.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Löschen
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Meta Information */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          {/* Privacy */}
          <div className="flex items-center">
            {dashboard.isPublic ? (
              <>
                <Globe className="w-4 h-4 mr-1.5" />
                <span>Öffentlich</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-1.5" />
                <span>Privat</span>
              </>
            )}
          </div>

          {/* Widget Count */}
          <span>{dashboard.widgetCount} Widgets</span>
        </div>

        {/* Last Updated */}
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1.5" />
          <span>{formatDate(dashboard.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}