'use client';

import { Menu, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface TopNavigationProps {
  className?: string;
}

export function TopNavigation({ className = '' }: TopNavigationProps): React.ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header className={`bg-white border-b border-gray-200 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left Section: Logo and Main Navigation */}
        <div className="flex items-center space-x-8">
          {/* DATEN-SEE Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-sm opacity-90"></div>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              DATEN-SEE
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/dashboards" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Zur Dashboard-Übersicht
            </Link>
            <Link 
              href="/community" 
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Community
            </Link>
          </nav>
        </div>

        {/* Right Section: User Controls */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Menü öffnen"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Einstellungen"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">N</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col space-y-3">
            <Link 
              href="/dashboards" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Zur Dashboard-Übersicht
            </Link>
            <Link 
              href="/community" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Community
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}