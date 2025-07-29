/**
 * Dashboard No Search Results Component
 * Shows message when search yields no results
 */

import { Search } from 'lucide-react';

interface DashboardNoSearchResultsProps {
  searchQuery: string;
  showNoResults: boolean;
}

export function DashboardNoSearchResults({ 
  searchQuery, 
  showNoResults 
}: DashboardNoSearchResultsProps): React.ReactElement | null {
  if (!showNoResults) return null;

  return (
    <div className="bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-8">
      <div className="text-center text-[#5d5d5d]">
        <Search className="w-16 h-16 mx-auto mb-4 text-[#E6D7B8]" />
        <p className="text-lg font-medium mb-2">Keine Suchergebnisse</p>
        <p className="text-sm text-[#5d5d5d]">
          Keine Dashboards gefunden für &quot;{searchQuery}&quot;
        </p>
      </div>
    </div>
  );
}