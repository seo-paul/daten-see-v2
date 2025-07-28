'use client';

import { ReactNode } from 'react';

import { TopNavigation } from './TopNavigation';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className = '' }: MainLayoutProps): React.ReactElement {
  return (
    <div className="h-screen bg-[#FEFCF9] flex flex-col">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Main Content */}
      <main className={`flex-1 flex flex-col overflow-hidden ${className}`}>
        {children}
      </main>
    </div>
  );
}