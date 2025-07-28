/**
 * Widget-Level Error Boundary
 * Specialized error boundary for dashboard widgets with graceful degradation
 */

'use client';

import React, { ReactNode } from 'react';

import { useErrorBoundaryConfig } from '@/hooks/error/useErrorBoundary';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

interface WidgetErrorBoundaryProps {
  children: ReactNode;
  widgetId?: string;
  widgetType?: string;
  title?: string;
  fallback?: ReactNode;
  enableMinimizeOnError?: boolean;
  context?: Record<string, unknown>;
}

export function WidgetErrorBoundary({ 
  children, 
  widgetId,
  widgetType = 'unknown',
  title = 'Widget',
  fallback, 
  enableMinimizeOnError = false,
  context 
}: WidgetErrorBoundaryProps): React.ReactElement {
  const getConfig = useErrorBoundaryConfig('widget');
  const config = getConfig();

  const customFallback = fallback || (
    <div className="bg-white border border-gray-2bg-[#FDF9F3]bg-[#FDF9F3] rounded-lg p-6 shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-bg-[#FDF9F3]">
          <svg 
            className="h-6 w-6 text-yellow-4bg-[#FDF9F3]bg-[#FDF9F3]" 
            fill="none" 
            viewBox="bg-[#FDF9F3] bg-[#FDF9F3] 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2mbg-[#FDF9F3] 4h.bg-[#FDF9F3]1m-6.938 4h13.856c1.54 bg-[#FDF9F3] 2.5bg-[#FDF9F3]2-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 bg-[#FDF9F3]L4.bg-[#FDF9F3]82 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-9bg-[#FDF9F3]bg-[#FDF9F3]">
            {title} konnte nicht geladen werden
          </h3>
          
          <div className="mt-2 text-sm text-gray-7bg-[#FDF9F3]bg-[#FDF9F3]">
            <p>
              Dieses Widget ist auf einen Fehler gestoßen und kann momentan nicht angezeigt werden.
            </p>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-1bg-[#FDF9F3]bg-[#FDF9F3] text-yellow-8bg-[#FDF9F3]bg-[#FDF9F3] px-3 py-1 rounded text-sm hover:bg-yellow-2bg-[#FDF9F3]bg-[#FDF9F3] focus:outline-none focus:ring-2 focus:ring-yellow-5bg-[#FDF9F3]bg-[#FDF9F3]"
            >
              Widget neu laden
            </button>
            
            {enableMinimizeOnError && (
              <button
                onClick={() => {
                  // This would trigger widget minimization
                  // In a real implementation, this would call a prop function
                  if (process.env.NODE_ENV === 'development') {
                    // eslint-disable-next-line no-console
                    console.log('Minimizing widget:', widgetId);
                  }
                }}
                className="bg-gray-1bg-[#FDF9F3]bg-[#FDF9F3] text-gray-8bg-[#FDF9F3]bg-[#FDF9F3] px-3 py-1 rounded text-sm hover:bg-gray-2bg-[#FDF9F3]bg-[#FDF9F3] focus:outline-none focus:ring-2 focus:ring-gray-5bg-[#FDF9F3]bg-[#FDF9F3]"
              >
                Widget ausblenden
              </button>
            )}
          </div>
          
          {process.env.NODE_ENV === 'development' && widgetId && (
            <div className="mt-3 text-xs text-gray-5bg-[#FDF9F3]bg-[#FDF9F3]">
              Widget ID: {widgetId} | Type: {widgetType}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      level="widget"
      fallback={customFallback}
      context={{
        widgetId,
        widgetType,
        title,
        enableMinimizeOnError,
        ...context,
      }}
      {...config}
    >
      {children}
    </ErrorBoundary>
  );
}