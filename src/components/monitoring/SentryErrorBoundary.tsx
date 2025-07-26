/**
 * Enhanced Error Boundary with Sentry Integration
 * Provides comprehensive error tracking with business context
 */

import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { devLogger } from '@/lib/monitoring/development-logger';
import { captureEnhancedError, createErrorBoundaryHandler, type EnhancedErrorContext } from '@/lib/monitoring/sentry-enhanced';

export interface SentryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'widget' | 'component';
  context?: EnhancedErrorContext;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface SentryErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
  retryCount: number;
}

/**
 * Enhanced Error Boundary with Sentry integration and business context
 */
export class SentryErrorBoundary extends Component<SentryErrorBoundaryProps, SentryErrorBoundaryState> {
  private errorHandler: ReturnType<typeof createErrorBoundaryHandler>;

  constructor(props: SentryErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      retryCount: 0,
    };

    // Create error handler with business context
    this.errorHandler = createErrorBoundaryHandler(
      `${props.level || 'component'}_boundary`,
      props.context
    );
  }

  static getDerivedStateFromError(error: Error): Partial<SentryErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { context = {}, onError, level = 'component' } = this.props;
    
    // Capture error with enhanced context
    const eventId = captureEnhancedError(error, {
      ...context,
      errorBoundary: `${level}_boundary`,
      componentName: errorInfo.componentStack?.split('\n')[1]?.trim() || 'unknown',
    });

    // Call the error handler
    this.errorHandler(error, { componentStack: errorInfo.componentStack || '' });

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      eventId,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Log to development logger with Sentry integration
    devLogger.errorBoundary(level, error, eventId, errorInfo.componentStack || undefined);
  }

  handleRetry = (): void => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleReportBug = (): void => {
    // Open external bug report form or Sentry user feedback
    const { eventId } = this.state;
    if (eventId && typeof window !== 'undefined') {
      // Option 1: Open Sentry user feedback (if configured)
      // Sentry.showReportDialog({ eventId });
      
      // Option 2: Navigate to custom bug report page
      window.open(
        `/feedback?eventId=${eventId}&type=error_boundary`,
        '_blank'
      );
    }
  };

  renderErrorFallback(): ReactNode {
    const { level = 'component', showDetails = false } = this.props;
    const { error, eventId, retryCount } = this.state;

    // Different UI based on error boundary level
    if (level === 'page') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-page p-6">
          <Card className="max-w-2xl w-full" variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-red-900">
                    Etwas ist schiefgelaufen
                  </CardTitle>
                  <p className="text-red-700 mt-1">
                    Diese Seite konnte nicht geladen werden.
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <p className="text-text-secondary">
                Wir wurden automatisch über diesen Fehler informiert und arbeiten an einer Lösung. 
                Sie können versuchen, die Seite neu zu laden.
              </p>
              
              <div className="flex gap-3">
                <Button 
                  variant="primary" 
                  onClick={this.handleRetry}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Seite neu laden
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={() => window.location.href = '/'}
                  leftIcon={<Home className="w-4 h-4" />}
                >
                  Zur Startseite
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={this.handleReportBug}
                  leftIcon={<Bug className="w-4 h-4" />}
                >
                  Fehler melden
                </Button>
              </div>
              
              {showDetails && process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
                    Entwickler-Details anzeigen
                  </summary>
                  <div className="mt-2 p-3 bg-neutral-50 rounded-lg text-xs font-mono text-neutral-700">
                    <div><strong>Error:</strong> {error?.message}</div>
                    <div><strong>Event ID:</strong> {eventId}</div>
                    <div><strong>Retry Count:</strong> {retryCount}</div>
                    {error?.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (level === 'widget') {
      return (
        <Card className="min-h-48 border-red-200" variant="flat">
          <CardContent className="flex flex-col items-center justify-center h-full py-8">
            <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
            <h3 className="font-semibold text-red-900 mb-2">Widget-Fehler</h3>
            <p className="text-sm text-red-700 text-center mb-4">
              Dieses Widget konnte nicht geladen werden.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={this.handleRetry}
                leftIcon={<RefreshCw className="w-3 h-3" />}
              >
                Wiederholen
              </Button>
              {showDetails && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={this.handleReportBug}
                  leftIcon={<Bug className="w-3 h-3" />}
                >
                  Melden
                </Button>
              )}
            </div>
            
            {showDetails && process.env.NODE_ENV === 'development' && (
              <details className="mt-3 w-full">
                <summary className="cursor-pointer text-xs text-text-secondary hover:text-text-primary">
                  Details
                </summary>
                <div className="mt-1 p-2 bg-red-50 rounded text-xs text-red-800">
                  {error?.message} (Event: {eventId})
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    // Component level error
    return (
      <div className="p-3 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium text-red-900">Komponenten-Fehler</span>
        </div>
        <p className="text-xs text-red-700 mb-2">
          Diese Komponente konnte nicht geladen werden.
        </p>
        <button
          onClick={this.handleRetry}
          className="text-xs text-red-600 hover:text-red-800 underline"
        >
          Wiederholen
        </button>
        
        {showDetails && process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-red-600">
            {error?.message} (Event: {eventId})
          </div>
        )}
      </div>
    );
  }

  override render(): ReactNode {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback || this.renderErrorFallback();
    }

    return children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withSentryErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  boundaryProps?: Omit<SentryErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  const WithErrorBoundary = (props: P): React.ReactElement => (
    <SentryErrorBoundary {...boundaryProps}>
      <WrappedComponent {...props} />
    </SentryErrorBoundary>
  );

  WithErrorBoundary.displayName = `withSentryErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundary;
}

/**
 * Hook for using error boundary context
 */
export function useErrorBoundary(): { throwError: (error: Error) => void } {
  const throwError = React.useCallback((error: Error) => {
    throw error;
  }, []);

  return { throwError };
}

export default SentryErrorBoundary;