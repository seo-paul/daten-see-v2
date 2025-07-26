/**
 * React Hook for Sentry Performance Monitoring
 * Provides easy-to-use hooks for tracking component performance and business metrics
 */

import { useCallback, useEffect, useRef } from 'react';

import { trackComponentRenderPerformance, trackBusinessEvent, trackPerformanceMetrics, type EnhancedErrorContext, type PerformanceMetrics } from '@/lib/monitoring/sentry-enhanced';

/**
 * Hook to track component render performance
 */
export function useComponentPerformance(
  componentName: string,
  context: EnhancedErrorContext = {}
): {
  startRender: () => void;
  endRender: () => void;
  trackEvent: (eventName: string, properties?: Record<string, unknown>) => void;
  componentName: string;
} {
  const renderStartRef = useRef<number | null>(null);
  const mountTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Track component mount time
    if (!mountTimeRef.current) {
      mountTimeRef.current = performance.now();
    }
  }, []);

  const startRender = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      trackComponentRenderPerformance(componentName, renderTime, context);
      renderStartRef.current = null;
    }
  }, [componentName, context]);

  const trackEvent = useCallback((eventName: string, properties = {}) => {
    trackBusinessEvent(eventName, {
      componentName,
      ...context,
      ...properties,
    });
  }, [componentName, context]);

  return {
    startRender,
    endRender,
    trackEvent,
    componentName,
  };
}

/**
 * Hook to track business metrics and events
 */
export function useBusinessMetrics(
  context: EnhancedErrorContext = {}
): {
  trackDashboard: (action: string, dashboardId: string, properties?: Record<string, unknown>) => void;
  trackWidget: (action: string, widgetId: string, widgetType: string, properties?: Record<string, unknown>) => void;
  trackDataSource: (action: string, dataSourceId: string, dataSourceType: string, properties?: Record<string, unknown>) => void;
  trackCustomEvent: (eventName: string, properties?: Record<string, unknown>) => void;
} {
  const trackDashboard = useCallback((action: string, dashboardId: string, properties = {}) => {
    trackBusinessEvent(`dashboard.${action}`, {
      dashboardId,
      ...context,
      ...properties,
    });
  }, [context]);

  const trackWidget = useCallback((action: string, widgetId: string, widgetType: string, properties = {}) => {
    trackBusinessEvent(`widget.${action}`, {
      widgetId,
      userAction: `${action}_${widgetType}`,
      ...context,
      ...properties,
    });
  }, [context]);

  const trackDataSource = useCallback((action: string, dataSourceId: string, dataSourceType: string, properties = {}) => {
    trackBusinessEvent(`datasource.${action}`, {
      dataSourceId,
      userAction: `${action}_${dataSourceType}`,
      ...context,
      ...properties,
    });
  }, [context]);

  const trackCustomEvent = useCallback((eventName: string, properties = {}) => {
    trackBusinessEvent(eventName, {
      ...context,
      ...properties,
    });
  }, [context]);

  return {
    trackDashboard,
    trackWidget,
    trackDataSource,
    trackCustomEvent,
  };
}

/**
 * Hook to track performance metrics
 */
export function usePerformanceTracking(
  operationName: string,
  context: EnhancedErrorContext = {}
): {
  startOperation: () => void;
  endOperation: (additionalMetrics?: PerformanceMetrics) => void;
  addMetric: (key: keyof PerformanceMetrics, value: number) => void;
  trackMemoryUsage: () => void;
} {
  const operationStartRef = useRef<number | null>(null);
  const metricsRef = useRef<PerformanceMetrics>({});

  const startOperation = useCallback(() => {
    operationStartRef.current = performance.now();
    metricsRef.current = {};
  }, []);

  const endOperation = useCallback((additionalMetrics: PerformanceMetrics = {}) => {
    if (operationStartRef.current) {
      const duration = performance.now() - operationStartRef.current;
      
      const finalMetrics = {
        ...metricsRef.current,
        ...additionalMetrics,
        renderTime: duration,
      };

      trackPerformanceMetrics(operationName, finalMetrics, context);
      operationStartRef.current = null;
      metricsRef.current = {};
    }
  }, [operationName, context]);

  const addMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    metricsRef.current[key] = value;
  }, []);

  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const { memory } = performance as { memory: { usedJSHeapSize: number } };
      addMetric('memoryUsage', Math.round(memory.usedJSHeapSize / 1024 / 1024)); // MB
    }
  }, [addMetric]);

  return {
    startOperation,
    endOperation,
    addMetric,
    trackMemoryUsage,
  };
}

/**
 * Hook to track user interactions with automatic performance monitoring
 */
export function useInteractionTracking(
  context: EnhancedErrorContext = {}
): {
  trackInteraction: (interactionType: string, target?: string) => (success?: boolean, additionalData?: Record<string, unknown>) => void;
} {
  const interactions = useRef<Map<string, number>>(new Map());

  const trackInteraction = useCallback((interactionType: string, target?: string) => {
    const startTime = performance.now();
    const interactionKey = `${interactionType}_${target || 'unknown'}`;
    
    interactions.current.set(interactionKey, startTime);

    // Track the interaction start
    trackBusinessEvent('interaction.start', {
      userAction: interactionKey,
      ...context,
    });

    // Return a completion function
    return (success: boolean = true, additionalData: Record<string, unknown> = {}): void => {
      const startTime = interactions.current.get(interactionKey);
      if (startTime) {
        const duration = performance.now() - startTime;
        
        trackPerformanceMetrics('user_interaction', {
          renderTime: duration,
        }, {
          userAction: interactionKey,
          ...context,
        });

        trackBusinessEvent('interaction.complete', {
          userAction: interactionKey,
          ...context,
          ...additionalData,
        }, success ? 'info' : 'warning');

        interactions.current.delete(interactionKey);
      }
    };
  }, [context]);

  return {
    trackInteraction,
  };
}

/**
 * Hook for automatic session tracking
 */
export function useSessionTracking(
  context: EnhancedErrorContext = {}
): {
  trackPageView: (pageName?: string) => void;
  trackInteraction: (interactionType: string) => void;
  sessionMetrics: {
    pageViews: number;
    interactions: number;
  };
} {
  const sessionStartRef = useRef<number | null>(null);
  const pageViewCountRef = useRef(0);
  const interactionCountRef = useRef(0);

  useEffect(() => {
    // Start session on mount
    sessionStartRef.current = Date.now();
    trackBusinessEvent('session.start', {
      ...context,
      usersActive: 1,
    });

    // Track page view
    pageViewCountRef.current += 1;
    trackBusinessEvent('page.view', {
      ...context,
    });

    // End session on unmount
    return (): void => {
      if (sessionStartRef.current) {
        const sessionDuration = Date.now() - sessionStartRef.current;
        
        trackBusinessEvent('session.end', {
          ...context,
          sessionDuration: Math.round(sessionDuration / 1000), // seconds
        });
      }
    };
  }, [context]);

  const trackPageView = useCallback((pageName?: string) => {
    pageViewCountRef.current += 1;
    trackBusinessEvent('page.view', {
      ...context,
      userAction: pageName ? `view_${pageName}` : 'view_page',
    });
  }, [context]);

  const trackInteraction = useCallback((interactionType: string) => {
    interactionCountRef.current += 1;
    trackBusinessEvent('user.interaction', {
      ...context,
      userAction: interactionType,
    });
  }, [context]);

  return {
    trackPageView,
    trackInteraction,
    sessionMetrics: {
      pageViews: pageViewCountRef.current,
      interactions: interactionCountRef.current,
    },
  };
}

const useSentryPerformance = {
  useComponentPerformance,
  useBusinessMetrics,
  usePerformanceTracking,
  useInteractionTracking,
  useSessionTracking,
};

export default useSentryPerformance;