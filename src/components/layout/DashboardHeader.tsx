'use client';

import { Share, Edit3, Clock, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/Button';

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
    <div className={`px-6 py-4 bg-white border-b border-[#E6D7B8] ${className}`}>
      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        {/* Left Section: Title and Subtitle */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#3d3d3d] mb-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#5d5d5d] mb-1">
              {subtitle}
            </p>
          )}
          <p className="text-xs text-[#5d5d5d] flex items-center gap-1">
            Zuletzt gespeichert: {lastUpdated}
          </p>
        </div>

        {/* Center Section: Time Filter - Button Style */}
        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 flex justify-center">
          <Button
            variant="primary"
            context="page"
            leftIcon={<Clock className="w-4 h-4" />}
            rightIcon={<ChevronDown className="w-4 h-4" />}
            className="min-w-[160px]"
          >
            Letzte 30 Tage
          </Button>

        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-3 md:ml-auto">
          <Button
            variant="primary"
            context="page"
            leftIcon={<Share className="w-4 h-4" />}
          >
            Teilen
          </Button>
          <Button
            variant="primary"
            context="page"
            leftIcon={<Edit3 className="w-4 h-4" />}
          >
            Bearbeiten
          </Button>
        </div>
      </div>
    </div>
  );
}