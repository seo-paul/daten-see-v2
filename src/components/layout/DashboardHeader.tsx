'use client';

import { Share, Edit3, Clock } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  className?: string;
}

export function DashboardHeader({ 
  title, 
  subtitle, 
  lastUpdated = "vor 3 Min", 
  className = '' 
}: DashboardHeaderProps): React.ReactElement {
  return (
    <div className={`px-6 py-6 bg-white ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Section: Title and Subtitle */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mb-2">
              {subtitle}
            </p>
          )}
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Zuletzt gespeichert: {lastUpdated}
          </p>
        </div>

        {/* Right Section: Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Time Filter */}
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="30">Letzte 30 Tage</option>
              <option value="7">Letzte 7 Tage</option>
              <option value="90">Letzte 90 Tage</option>
              <option value="365">Letztes Jahr</option>
            </select>
            <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Share className="w-4 h-4" />
              Teilen
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Bearbeiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}