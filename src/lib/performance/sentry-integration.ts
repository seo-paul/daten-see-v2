/**
 * Sentry Performance Integration
 * Enhanced Sentry configuration for performance monitoring
 */

import * as Sentry from '@sentry/nextjs';
import * as React from 'react';

/**
 * Enhanced Sentry configuration for performance monitoring
 */
export function configureSentryPerformance() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Add performance-specific global event processor
  Sentry.addEventProcessor((event: Record<string, unknown>, _hint: Record<string, unknown>) => {
    // Enhance performance transactions
    if (event.type === 'transaction') {
      return enhancePerformanceTransaction(event);
    }

    // Enhance error events with performance context
    if (event.exception) {
      return enhanceErrorWithPerformance(event);
    }

    return event;
  });

  // Configure custom performance tracing
  if (process.env.NODE_ENV === 'production') {
    initializeCustomTracing();
  }

  console.log('📊 Sentry performance monitoring configured');
}

/**
 * Enhance transaction events with custom performance data
 */
function enhancePerformanceTransaction(event: Sentry.Event): Sentry.Event {
  // Add custom performance context
  event.contexts = {
    ...event.contexts,
    performance: {
      // Add browser performance API data
      navigation: getNavigationTiming(),
      memory: getMemoryInfo(),
      connection: getConnectionInfo(),
    },
    runtime: {
      // Add React and application-specific data
      reactVersion: React.version || 'unknown',
      nodeEnv: process.env.NODE_ENV,
      buildTime: process.env.BUILD_TIME || 'unknown',
    },
  };

  // Add custom tags for better filtering
  event.tags = {
    ...event.tags,
    performanceCategory: categorizePerformance(event),
    userAgent: navigator.userAgent.split(' ')[0], // Simplified UA
  };

  return event;
}

/**
 * Enhance error events with performance context
 */
function enhanceErrorWithPerformance(event: Sentry.Event): Sentry.Event {
  // Add performance breadcrumb
  Sentry.addBreadcrumb({
    category: 'performance',
    message: 'Error occurred during performance monitoring',
    level: 'info',
    data: {
      memoryUsage: getMemoryInfo(),
      connectionType: getConnectionInfo().effectiveType,
    },
  });

  // Add performance tags to error
  event.tags = {
    ...event.tags,
    hasPerformanceIssue: checkForPerformanceIssues(),
  };

  return event;
}

/**
 * Initialize custom performance tracing
 */
function initializeCustomTracing(): void {
  // Monitor long tasks (>50ms)
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            Sentry.addBreadcrumb({
              category: 'performance',
              message: `Long task detected: ${entry.duration.toFixed(2)}ms`,
              level: 'warning',
              data: {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name,
              },
            });
          }
        });
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task observer not supported:', error);
    }

    // Monitor layout shifts
    try {
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: Record<string, unknown>) => {
          if (entry.value > 0.1) { // CLS threshold
            Sentry.addBreadcrumb({
              category: 'performance',
              message: `Layout shift detected: ${entry.value.toFixed(3)}`,
              level: 'warning',
              data: {
                value: entry.value,
                sources: (entry.sources as Record<string, unknown>[] | undefined)?.map((source: Record<string, unknown>) => ({
                  node: source.node?.tagName,
                  currentRect: source.currentRect,
                  previousRect: source.previousRect,
                })),
              },
            });
          }
        });
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Layout shift observer not supported:', error);
    }
  }
}

/**
 * Get navigation timing data
 */
function getNavigationTiming() {
  if (!('performance' in window) || !performance.getEntriesByType) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigation) return null;

  return {
    domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
    domComplete: Math.round(navigation.domComplete - navigation.fetchStart),
    loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
    firstPaint: Math.round(navigation.responseStart - navigation.fetchStart),
    ttfb: Math.round(navigation.responseStart - navigation.requestStart),
  };
}

/**
 * Get memory information
 */
function getMemoryInfo() {
  if (!('memory' in performance)) return null;

  const memory = (performance as Record<string, unknown>).memory as Record<string, number>;
  return {
    usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
    totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
    jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
  };
}

/**
 * Get connection information
 */
function getConnectionInfo() {
  const connection = (navigator as Record<string, unknown>).connection || (navigator as Record<string, unknown>).mozConnection || (navigator as Record<string, unknown>).webkitConnection;
  
  if (!connection) {
    return { effectiveType: 'unknown', downlink: 0 };
  }

  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false,
  };
}

/**
 * Categorize performance based on transaction data
 */
function categorizePerformance(event: Sentry.Event): string {
  const op = event.contexts?.trace?.op;
  
  if (op === 'navigation') return 'page-load';
  if (op === 'pageload') return 'initial-load';
  if (op?.includes('component')) return 'component-render';
  if (op?.includes('query')) return 'data-fetch';
  
  return 'general';
}

/**
 * Check for common performance issues
 */
function checkForPerformanceIssues(): boolean {
  const memory = getMemoryInfo();
  const connection = getConnectionInfo();
  
  // High memory usage
  if (memory && memory.usedJSHeapSize > 100) return true;
  
  // Slow connection
  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') return true;
  
  return false;
}

/**
 * Create custom performance transaction
 */
export function createPerformanceTransaction(
  name: string,
  op: string,
  description?: string
): Record<string, unknown> | undefined {
  if (process.env.NODE_ENV !== 'production') return undefined;

  // Use Sentry.startSpan to create a span and return it
  let spanRef: Record<string, unknown> | undefined = undefined;
  
  Sentry.startSpan({
    name,
    op,
    attributes: {
      performanceMonitoring: true,
      environment: process.env.NODE_ENV || 'development',
      ...(description && { description }),
    },
  }, (span) => {
    spanRef = span;
    // Add initial context using setData for spans
    if (span) {
      (span as Record<string, unknown>).setData?.('startTime', performance.now());
      (span as Record<string, unknown>).setData?.('memory', getMemoryInfo());
      (span as Record<string, unknown>).setData?.('connection', getConnectionInfo());
    }
  });

  return spanRef;
}

/**
 * Track component render performance
 */
export function trackComponentRender(componentName: string, renderTime: number): void {
  if (process.env.NODE_ENV !== 'production') return;

  // Use startSpan directly for better v8 compatibility
  Sentry.startSpan({
    name: `Component Render: ${componentName}`,
    op: 'component.render',
    attributes: {
      componentName,
      renderTime,
      performance: renderTime > 16 ? 'slow' : 'normal',
    },
  }, (_span) => {
    // Span automatically ends when callback completes
  });

  // Also add breadcrumb for context
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${componentName} rendered in ${renderTime.toFixed(2)}ms`,
    level: renderTime > 16 ? 'warning' : 'info',
    data: { componentName, renderTime },
  });
}

/**
 * Track bundle loading performance
 */
export function trackBundleLoad(bundleName: string, loadTime: number, size?: number): void {
  if (process.env.NODE_ENV !== 'production') return;

  Sentry.addBreadcrumb({
    category: 'performance',
    message: `Bundle ${bundleName} loaded in ${loadTime.toFixed(2)}ms`,
    level: loadTime > 1000 ? 'warning' : 'info',
    data: { bundleName, loadTime, size },
  });
}

/**
 * Track query performance
 */
export function trackQueryPerformance(
  queryKey: string, 
  duration: number, 
  fromCache: boolean,
  error?: Error
): void {
  if (process.env.NODE_ENV !== 'production') return;

  const level = error ? 'error' : (duration > 1000 ? 'warning' : 'info');
  
  Sentry.addBreadcrumb({
    category: 'query',
    message: `Query ${queryKey} ${error ? 'failed' : 'completed'} in ${duration.toFixed(2)}ms`,
    level,
    data: { 
      queryKey, 
      duration, 
      fromCache, 
      error: error?.message 
    },
  });

  if (error) {
    Sentry.captureException(error, {
      tags: { queryKey, fromCache: fromCache.toString() },
      extra: { duration },
    });
  }
}

export default {
  configureSentryPerformance,
  createPerformanceTransaction,
  trackComponentRender,
  trackBundleLoad,
  trackQueryPerformance,
};