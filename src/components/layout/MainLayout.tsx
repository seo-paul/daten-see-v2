'use client';

import { ReactNode } from 'react';

import { TopNavigation } from './TopNavigation';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className = '' }: MainLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Main Content */}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
    </div>
  );
}