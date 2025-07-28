/**
 * Component-Level Error Boundary
 * Lightweight error boundary for individual components with minimal UI disruption
 */

'use client';

import React, { ReactNode } from 'react';

import { useErrorBoundaryConfig } from '@/hooks/error/useErrorBoundary';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
  silent?: boolean; // Don't show error UI, just log
  context?: Record<string, unknown>;
}

export function ComponentErrorBoundary({ 
  children, 
  componentName = 'Component',
  fallback, 
  silent = false,
  context 
}: ComponentErrorBoundaryProps): React.ReactElement {
  const getConfig = useErrorBoundaryConfig('component');
  const config = getConfig();

  const customFallback = fallback || (silent ? null : (
    <div className="flex items-center justify-center p-4 bg-gray-5bg-[#FDF9F3] border border-gray-2bg-[#FDF9F3]bg-[#FDF9F3] rounded-md">
      <div className="text-center">
        <svg 
          className="mx-auto h-8 w-8 text-gray-4bg-[#FDF9F3]bg-[#FDF9F3] mb-2" 
          fill="none" 
          viewBox="bg-[#FDF9F3] bg-[#FDF9F3] 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 8v4mbg-[#FDF9F3] 4h.bg-[#FDF9F3]1M21 12a9 9 bg-[#FDF9F3] 11-18 bg-[#FDF9F3] 9 9 bg-[#FDF9F3] bg-[#FDF9F3]118 bg-[#FDF9F3]z" 
          />
        </svg>
        
        <p className="text-sm text-gray-6bg-[#FDF9F3]bg-[#FDF9F3] mb-3">
          {componentName} nicht verfügbar
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="text-xs bg-gray-2bg-[#FDF9F3]bg-[#FDF9F3] text-gray-7bg-[#FDF9F3]bg-[#FDF9F3] px-2 py-1 rounded hover:bg-gray-3bg-[#FDF9F3]bg-[#FDF9F3] focus:outline-none focus:ring-1 focus:ring-gray-5bg-[#FDF9F3]bg-[#FDF9F3]"
        >
          Neu laden
        </button>
      </div>
    </div>
  ));

  return (
    <ErrorBoundary
      level="component"
      fallback={customFallback}
      context={{
        componentName,
        silent,
        ...context,
      }}
      {...config}
    >
      {children}
    </ErrorBoundary>
  );
}