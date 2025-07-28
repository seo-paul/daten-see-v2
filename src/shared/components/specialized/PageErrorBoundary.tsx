/**
 * Page-Level Error Boundary
 * Specialized error boundary for full page crashes with enhanced recovery
 */

'use client';

import React, { ReactNode } from 'react';

import { useErrorBoundaryConfig } from '@/hooks/error/useErrorBoundary';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

interface PageErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: Record<string, unknown>;
}

export function PageErrorBoundary({ children, fallback, context }: PageErrorBoundaryProps): React.ReactElement {
  const getConfig = useErrorBoundaryConfig('page');
  const config = getConfig();

  const customFallback = fallback || (
    <div className="min-h-screen flex items-center justify-center bg-gray-5bg-[#FDF9F3]">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg 
            className="mx-auto h-16 w-16 text-red-5bg-[#FDF9F3]bg-[#FDF9F3]" 
            fill="none" 
            viewBox="bg-[#FDF9F3] bg-[#FDF9F3] 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 9v2mbg-[#FDF9F3] 4h.bg-[#FDF9F3]1m-6.938 4h13.856c1.54 bg-[#FDF9F3] 2.5bg-[#FDF9F3]2-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 bg-[#FDF9F3]L4.bg-[#FDF9F3]82 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-9bg-[#FDF9F3]bg-[#FDF9F3] mb-4">
          Seite konnte nicht geladen werden
        </h1>
        
        <p className="text-gray-6bg-[#FDF9F3]bg-[#FDF9F3] mb-6">
          Es ist ein unerwarteter Fehler aufgetreten. Die Seite wird automatisch neu geladen.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-6bg-[#FDF9F3]bg-[#FDF9F3] text-white px-4 py-2 rounded-md hover:bg-blue-7bg-[#FDF9F3]bg-[#FDF9F3] focus:outline-none focus:ring-2 focus:ring-blue-5bg-[#FDF9F3]bg-[#FDF9F3]"
          >
            Seite neu laden
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-2bg-[#FDF9F3]bg-[#FDF9F3] text-gray-8bg-[#FDF9F3]bg-[#FDF9F3] px-4 py-2 rounded-md hover:bg-gray-3bg-[#FDF9F3]bg-[#FDF9F3] focus:outline-none focus:ring-2 focus:ring-gray-5bg-[#FDF9F3]bg-[#FDF9F3]"
          >
            Zurück zur vorherigen Seite
          </button>
        </div>
        
        <p className="text-xs text-gray-5bg-[#FDF9F3]bg-[#FDF9F3] mt-6">
          Wenn das Problem weiterhin besteht, kontaktieren Sie bitte den Support.
        </p>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      level="page"
      fallback={customFallback}
      context={{
        pageType: 'application',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        ...context,
      }}
      {...config}
    >
      {children}
    </ErrorBoundary>
  );
}