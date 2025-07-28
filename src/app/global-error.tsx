'use client';

// Global Error Handler for Next.js App Router
// Official Sentry Pattern: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#react-render-errors-in-app-router

import * as Sentry from '@sentry/nextjs';
import React, { useEffect } from 'react';

import { appLogger } from '@/lib/monitoring/logger.config';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps): React.ReactElement {
  useEffect(() => {
    // Log to our structured logging system
    appLogger.error('Global Error Handler triggered', {
      error,
      component: 'global-error-handler',
      metadata: {
        digest: error.digest,
        stack: error.stack,
        timestamp: Date.now(),
      },
    });

    // Report to Sentry with full context
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', 'global');
      scope.setLevel('fatal');
      scope.setContext('errorDetails', {
        digest: error.digest,
        componentStack: 'global-level',
        errorBoundaryLevel: 'global',
      });
      
      Sentry.captureException(error);
    });
  }, [error]);

  const handleReload = (): void => {
    appLogger.info('Global error recovery - page reload', {
      action: 'global-error-reload',
      component: 'global-error-handler',
    });
    
    // Try to reset first, then reload if that fails
    try {
      reset();
    } catch (resetError) {
      appLogger.warn('Reset failed, forcing page reload', {
        error: resetError instanceof Error ? resetError : new Error(String(resetError)),
        component: 'global-error-handler',
      });
      window.location.reload();
    }
  };

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
          <div className="max-w-md w-full bg-[#FDF9F3] shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-red-800">
                  Application Error
                </h1>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-red-700 mb-2">
                The application encountered a critical error and needs to be restarted.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-red-800">
                    Development Error Details
                  </summary>
                  <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.message}
                    </div>
                    {error.digest && (
                      <div className="mb-2">
                        <strong>Digest:</strong> {error.digest}
                      </div>
                    )}
                    {error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleReload}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Restart Application
              </button>
              
              {process.env.NODE_ENV === 'production' && (
                <button
                  onClick={() => {
                    window.open(
                      'mailto:support@daten-see.com?subject=Critical Application Error&body=A critical error occurred in the application. Please investigate.',
                      '_blank'
                    );
                  }}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Report Issue
                </button>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-[#5d5d5d]">
                Error ID: {error.digest?.slice(0, 8) || 'unknown'}
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}