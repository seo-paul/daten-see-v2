'use client';

import { Menu, Settings, X, Bug, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Logo } from '@/components/brand/Logo';
import { NavbarButton } from '@/components/ui/Button';
import { useRouteContext } from '@/hooks/useRouteContext';

interface TopNavigationProps {
  className?: string;
}

export function TopNavigation({ className = '' }: TopNavigationProps): React.ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { showDashboardOverviewButton, showCommunityButton } = useRouteContext();

  return (
    <header className={`bg-[#FDF9F3] border-b border-[#E6D7B8] px-4 sm:px-6 py-2 ${className}`}>
      <div className="grid grid-cols-3 items-center w-full">
        {/* Left: Logo - Always Present */}
        <div className="flex items-center justify-start">
          <Link href="/" className="flex items-center">
            <Logo variant="full" size="sm" />
          </Link>
        </div>

        {/* Center: Conditional Navigation Links */}
        <div className="hidden md:flex items-center justify-center">
          <div className="flex items-center space-x-6">
            {showDashboardOverviewButton && (
              <Link href="/dashboards">
                <NavbarButton size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Zur Dashboard-Übersicht
                </NavbarButton>
              </Link>
            )}
            {showCommunityButton && (
              <Link href="/community">
                <NavbarButton size="sm" leftIcon={<Users className="w-4 h-4" />}>
                  Community
                </NavbarButton>
              </Link>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#3d3d3d]/60 hover:text-[#3d3d3d] hover:bg-[#F6F0E0] rounded-md transition-colors touch-manipulation"
            aria-label="Menü öffnen"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center space-x-2">
            <Link href="/charts-demo">
              <NavbarButton
                size="sm"
                aria-label="Charts Demo"
                className="!px-2"
              >
                📊
              </NavbarButton>
            </Link>
            <NavbarButton
              size="sm"
              aria-label="Debug"
              className="!px-2"
            >
              <Bug className="w-4 h-4" />
            </NavbarButton>
            <NavbarButton
              size="sm"
              aria-label="Einstellungen"
              className="!px-2"
            >
              <Settings className="w-4 h-4" />
            </NavbarButton>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - Conditional Items */}
      {isMobileMenuOpen && (
        <nav className="md:hidden mt-4 pt-4 border-t border-[#E6D7B8] bg-[#FDF9F3]">
          <div className="flex flex-col space-y-3 pb-2">
            {showDashboardOverviewButton && (
              <Link 
                href="/dashboards" 
                className="text-base font-medium text-[#3d3d3d]/70 hover:text-[#3d3d3d] py-2 px-2 -mx-2 rounded transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Zur Dashboard-Übersicht
              </Link>
            )}
            {showCommunityButton && (
              <Link 
                href="/community" 
                className="text-base font-medium text-[#3d3d3d]/70 hover:text-[#3d3d3d] py-2 px-2 -mx-2 rounded transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Community
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}