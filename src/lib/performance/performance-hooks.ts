/**
 * Performance Monitoring React Hooks
 * Hooks for integrating performance monitoring into React components
 */

import * as React from 'react';

import { performanceMonitor, recordMetrics } from './monitoring-integration';

/**
 * Hook to monitor component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStartTime = React.useRef<number>(0);
  const renderCount = React.useRef<number>(0);

  // Start timing before render
  renderStartTime.current = performance.now();
  renderCount.current += 1;

  // Effect to record render time after render
  React.useEffect(() => {
    const renderDuration = performance.now() - renderStartTime.current;
    
    recordMetrics.renderTime(componentName, renderDuration, {
      renderCount: renderCount.current,
      timestamp: Date.now(),
    });
  });

  return {
    renderCount: renderCount.current,
  };
}

/**
 * Hook to monitor memory usage
 */
export function useMemoryMonitoring(context = 'component') {
  React.useEffect(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      if (memInfo) {
        const usedMB = memInfo.usedJSHeapSize / 1024 / 1024;
        recordMetrics.memoryUsage(usedMB, context);
      }
    }
  }, [context]);
}

/**
 * Hook to monitor TanStack Query performance
 */
export function useQueryPerformanceMonitoring() {
  const trackQuery = React.useCallback((
    queryKey: string,
    startTime: number,
    fromCache: boolean
  ) => {
    const duration = performance.now() - startTime;
    recordMetrics.queryPerformance(queryKey, duration, fromCache);
  }, []);

  return { trackQuery };
}

/**
 * Hook to monitor network requests
 */
export function useNetworkMonitoring() {
  const trackRequest = React.useCallback((
    url: string, 
    duration: number, 
    status: number
  ) => {
    recordMetrics.networkRequest(url, duration, status);
  }, []);

  return { trackRequest };
}

/**
 * Hook for custom performance metrics
 */
export function useCustomMetric() {
  const recordCustomMetric = React.useCallback((
    name: string,
    value: number,
    unit: 'ms' | 'kb' | 'count' | 'percentage',
    tags?: Record<string, string>
  ) => {
    performanceMonitor.recordMetric({
      name,
      value,
      unit,
      ...(tags && { tags }),
    });
  }, []);

  return { recordCustomMetric };
}

/**
 * Hook to measure expensive operations
 */
export function useMeasureOperation() {
  const measureOperation = React.useCallback(<T>(
    operationName: string,
    operation: () => T,
    tags?: Record<string, string>
  ): T => {
    const start = performance.now();
    const result = operation();
    const duration = performance.now() - start;

    performanceMonitor.recordMetric({
      name: 'expensive-operation',
      value: duration,
      unit: 'ms',
      tags: { operation: operationName, ...tags },
    });

    return result;
  }, []);

  const measureAsyncOperation = React.useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> => {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;

    performanceMonitor.recordMetric({
      name: 'expensive-async-operation',
      value: duration,
      unit: 'ms',
      tags: { operation: operationName, ...tags },
    });

    return result;
  }, []);

  return { measureOperation, measureAsyncOperation };
}

/**
 * Hook to monitor component lifecycle performance
 */
export function useLifecyclePerformance(componentName: string) {
  const mountTime = React.useRef<number>(0);
  const updateCount = React.useRef<number>(0);

  // Track mount time
  React.useEffect(() => {
    mountTime.current = performance.now();
    
    recordMetrics.renderTime(`${componentName}-mount`, 0, {
      phase: 'mount',
      timestamp: mountTime.current,
    });

    // Cleanup - track unmount
    return () => {
      const lifetime = performance.now() - mountTime.current;
      recordMetrics.renderTime(`${componentName}-unmount`, lifetime, {
        phase: 'unmount',
        updateCount: updateCount.current,
      });
    };
  }, [componentName]);

  // Track updates
  React.useEffect(() => {
    updateCount.current += 1;
    
    if (updateCount.current > 1) { // Skip first update (mount)
      recordMetrics.renderTime(`${componentName}-update`, 0, {
        phase: 'update',
        updateCount: updateCount.current,
      });
    }
  });

  return {
    updateCount: updateCount.current,
    mountTime: mountTime.current,
  };
}

/**
 * Development-only performance debugging hook
 */
export function usePerformanceDebug(componentName: string) {
  const debugInfo = React.useRef({
    renders: 0,
    slowRenders: 0,
    fastRenders: 0,
  });

  const renderStart = performance.now();

  React.useEffect(() => {
    const renderTime = performance.now() - renderStart;
    debugInfo.current.renders += 1;
    
    if (renderTime > 16) {
      debugInfo.current.slowRenders += 1;
    } else {
      debugInfo.current.fastRenders += 1;
    }

    // Log debug info every 10 renders in development
    if (process.env.NODE_ENV === 'development' && 
        debugInfo.current.renders % 10 === 0) {
      console.group(`🔍 ${componentName} Performance Debug`);
      console.log('Total renders:', debugInfo.current.renders);
      console.log('Slow renders (>16ms):', debugInfo.current.slowRenders);
      console.log('Fast renders (≤16ms):', debugInfo.current.fastRenders);
      console.log('Performance ratio:', 
        `${((debugInfo.current.fastRenders / debugInfo.current.renders) * 100).toFixed(1)}% fast`
      );
      console.groupEnd();
    }
  });

  return debugInfo.current;
}

export default {
  useRenderPerformance,
  useMemoryMonitoring,
  useQueryPerformanceMonitoring,
  useNetworkMonitoring,
  useCustomMetric,
  useMeasureOperation,
  useLifecyclePerformance,
  usePerformanceDebug,
};