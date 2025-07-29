/**
 * Widget Operations Monitoring Hook
 * 
 * Integrates with existing Sentry infrastructure to provide comprehensive
 * monitoring and debugging for widget operations, especially deletion.
 * 
 * Features:
 * - Real-time deletion tracking with Sentry integration
 * - Performance monitoring for widget operations
 * - Automatic error capture with enhanced context
 * - Development debugging utilities
 */

import { useCallback } from 'react';

export interface WidgetOperation {
  widgetId: string;
  widgetType: string;
  operation: 'delete' | 'create' | 'edit' | 'duplicate';
  timestamp: number;
  context?: Record<string, unknown>;
}

export interface WidgetMonitoringHook {
  trackWidgetOperation: (operation: WidgetOperation) => void;
  trackWidgetError: (error: Error, operation: WidgetOperation) => void;
  trackPerformanceMetric: (operation: string, duration: number, context?: Record<string, unknown>) => void;
}

/**
 * Hook for monitoring widget operations with Sentry integration
 */
export function useWidgetMonitoring(dashboardId: string, userId?: string): WidgetMonitoringHook {
  
  const trackWidgetOperation = useCallback((operation: WidgetOperation) => {
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.group(`📊 Widget Operation: ${operation.operation.toUpperCase()}`);
      console.log('Widget ID:', operation.widgetId);
      console.log('Widget Type:', operation.widgetType);
      console.log('Dashboard ID:', dashboardId);
      console.log('Context:', operation.context);
      console.groupEnd();
    }
    
    // Production Sentry tracking (integration with existing Sentry setup)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'widget.operation',
        message: `Widget ${operation.operation}: ${operation.widgetId}`,
        level: 'info',
        data: {
          widgetId: operation.widgetId,
          widgetType: operation.widgetType,
          dashboardId,
          userId,
          timestamp: operation.timestamp,
          ...operation.context,
        },
      });

      // Track as custom event for analytics
      window.Sentry.captureMessage(`Widget ${operation.operation} completed`, 'info');
    }

    // Custom event for debugging dashboard
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('widget-operation', {
        detail: {
          ...operation,
          dashboardId,
          userId,
        }
      }));
    }
  }, [dashboardId, userId]);

  const trackWidgetError = useCallback((error: Error, operation: WidgetOperation) => {
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Widget Operation Error: ${operation.operation.toUpperCase()}`);
      console.error('Error:', error);
      console.log('Widget ID:', operation.widgetId);
      console.log('Widget Type:', operation.widgetType);
      console.log('Dashboard ID:', dashboardId);
      console.log('Context:', operation.context);
      console.groupEnd();
    }

    // Enhanced Sentry error tracking
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.withScope((scope) => {
        scope.setTag('component', 'widget-operations');
        scope.setTag('operation', operation.operation);
        scope.setContext('widget', {
          widgetId: operation.widgetId,
          widgetType: operation.widgetType,
          operation: operation.operation,
        });
        scope.setContext('dashboard', {
          dashboardId,
          userId,
        });
        scope.setLevel('error');
        
        window.Sentry.captureException(error);
      });
    }

    // Custom error event for debugging
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('widget-operation-error', {
        detail: {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          operation,
          dashboardId,
          userId,
        }
      }));
    }
  }, [dashboardId, userId]);

  const trackPerformanceMetric = useCallback((operation: string, duration: number, context?: Record<string, unknown>) => {
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ Widget Performance: ${operation} took ${duration.toFixed(2)}ms`, context);
    }

    // Performance tracking with Sentry
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'widget.performance',
        message: `${operation} duration: ${duration.toFixed(2)}ms`,
        level: 'info',
        data: {
          operation,
          duration,
          dashboardId,
          userId,
          ...context,
        },
      });

      // Alert on slow operations
      if (duration > 1000) {
        window.Sentry.captureMessage(
          `Slow widget operation detected: ${operation} (${duration.toFixed(2)}ms)`,
          'warning'
        );
      }
    }

    // Custom performance event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('widget-performance', {
        detail: {
          operation,
          duration,
          dashboardId,
          userId,
          context,
        }
      }));
    }
  }, [dashboardId, userId]);

  return {
    trackWidgetOperation,
    trackWidgetError,
    trackPerformanceMetric,
  };
}

/**
 * Development debugging utilities
 * Available in browser console as window.widgetDebug
 */
export function useWidgetDebugging() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    window.widgetDebug = {
      // Get all widget operation events from the last 5 minutes
      getRecentOperations: () => {
        const events = JSON.parse(localStorage.getItem('widget-operations') || '[]');
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return events.filter((event: WidgetOperation) => event.timestamp > fiveMinutesAgo);
      },
      
      // Clear operation history
      clearHistory: () => {
        localStorage.removeItem('widget-operations');
        console.log('Widget operation history cleared');
      },
      
      // Simulate deletion error for testing
      simulateDeletionError: (widgetId: string) => {
        throw new Error(`Simulated deletion error for widget ${widgetId}`);
      },
      
      // Get current Sentry breadcrumbs
      getSentryBreadcrumbs: () => {
        return window.Sentry?.getCurrentHub()?.getScope()?.getBreadcrumbs() || [];
      },
    };
  }
}