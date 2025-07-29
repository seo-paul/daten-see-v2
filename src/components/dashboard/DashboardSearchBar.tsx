/**
 * Dashboard Search Bar Component
 * Search input for filtering dashboards
 */

import { Search } from 'lucide-react';

interface DashboardSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSearch: boolean;
}

export function DashboardSearchBar({ 
  searchQuery, 
  onSearchChange, 
  showSearch 
}: DashboardSearchBarProps): React.ReactElement | null {
  if (!showSearch) return null;

  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5d5d5d] w-5 h-5" />
      <input
        type="text"
        placeholder="Dashboards durchsuchen..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-[#E6D7B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F4F73] focus:border-transparent"
      />
    </div>
  );
}