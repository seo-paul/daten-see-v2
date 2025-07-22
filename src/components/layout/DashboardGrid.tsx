'use client';

import { ReactNode } from 'react';

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className = '' }: DashboardGridProps): React.ReactElement {
  return (
    <div className={`flex-1 px-6 py-6 ${className}`}>
      {/* Grid Container - prepared for react-grid-layout */}
      <div className="min-h-96 bg-white rounded-lg border border-gray-200 p-4">
        {children || (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-dashed rounded"></div>
              </div>
              <p className="text-sm font-medium">Keine Widgets vorhanden</p>
              <p className="text-xs text-gray-400 mt-1">Fügen Sie Widgets hinzu, um loszulegen</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}