'use client';

import * as Sentry from '@sentry/nextjs';
import React, { Component, ReactNode } from 'react';

import { appLogger } from '@/lib/monitoring/logger.config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'widget' | 'component';
  context?: Record<string, unknown>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { level = 'component', context } = this.props;
    
    // Enhanced logging with context
    appLogger.error(`Error Boundary Triggered (${level})`, {
      error,
      component: `error-boundary-${level}`,
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundaryLevel: level,
        ...context,
      },
    });

    // Capture to Sentry with enhanced context
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', level);
      scope.setLevel('error');
      scope.setContext('errorInfo', {
        componentStack: errorInfo.componentStack,
        level,
        ...context,
      });
      
      const errorId = Sentry.captureException(error);
      this.setState({ errorId });
    });
  }

  private handleRetry = (): void => {
    const { level = 'component' } = this.props;
    appLogger.info('Error Boundary Retry Attempted', {
      component: `error-boundary-${level}`,
      action: 'retry',
    });
    
    this.setState({ hasError: false });
  };

  private handleReportIssue = (): void => {
    const { level = 'component' } = this.props;
    if (this.state.errorId) {
      appLogger.userAction('report-error', undefined, {
        errorId: this.state.errorId,
        errorBoundaryLevel: level,
      });
      
      // In production, this could open a support ticket
      if (typeof window !== 'undefined') {
        window.open(
          `mailto:support@daten-see.com?subject=Error Report - ${this.state.errorId}&body=Error ID: ${this.state.errorId}%0A%0APlease describe what you were doing when this error occurred.`,
          '_blank'
        );
      }
    }
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI or use provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component' } = this.props;
      
      return (
        <div className="error-boundary-fallback" data-level={level} role="alert">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Oops! Etwas ist schiefgelaufen
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {level === 'page' && 'Diese Seite ist auf einen Fehler gestoßen und kann nicht angezeigt werden.'}
                    {level === 'widget' && 'Dieses Widget ist auf einen Fehler gestoßen und kann nicht angezeigt werden.'}
                    {level === 'component' && 'Diese Komponente ist auf einen Fehler gestoßen.'}
                  </p>
                  
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">
                        Development Error Details
                      </summary>
                      <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                        {this.state.error.message}
                        {'\n'}
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
                
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={this.handleRetry}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Seite neu laden
                  </button>
                  
                  {this.state.errorId && process.env.NODE_ENV === 'production' && (
                    <button
                      onClick={this.handleReportIssue}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Report Issue
                    </button>
                  )}
                  
                  {this.state.errorId && (
                    <span className="text-xs text-gray-500 self-center">
                      Error ID: {this.state.errorId.slice(0, 8)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}