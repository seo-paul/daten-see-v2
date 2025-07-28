'use client';

import { ReactNode } from 'react';

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className = '' }: DashboardGridProps): React.ReactElement {
  return (
    <div className={`flex-1 w-full h-full ${className}`}>
      {/* Grid Container - prepared for react-grid-layout */}
      {/* Full-width and height widget area */}
      <div className="w-full h-full bg-[#FEFCF9] p-6">
        {children || (
          <div className="flex items-center justify-center h-96 text-[#5d5d5d]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#FBF5ED] rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#E6D7B8] border-dashed rounded"></div>
              </div>
              <p className="text-sm font-medium">Keine Widgets vorhanden</p>
              <p className="text-xs text-[#5d5d5d] mt-1">Fügen Sie Widgets hinzu, um loszulegen</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}