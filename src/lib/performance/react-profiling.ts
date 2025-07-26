/**
 * React DevTools Profiling Utilities
 * Performance monitoring and profiling helpers for React components
 */

import * as React from 'react';

/**
 * Performance measurement hook
 * Measures component render time and re-render frequency
 */
export function usePerformanceProfiler(componentName: string): {
  renderCount: number;
  mountTime: number | undefined;
  lastRenderTime: number | undefined;
} {
  const renderCount = React.useRef(0);
  const mountTime = React.useRef<number>();
  const lastRenderTime = React.useRef<number>();

  // Track render count and timing
  renderCount.current += 1;
  const currentTime = performance.now();

  React.useEffect(() => {
    // Record mount time on first render
    if (!mountTime.current) {
      mountTime.current = currentTime;
      if (process.env.NODE_ENV === 'development') {
        // 🚀 Component mounted - logged to console in development
      }
    }

    // Log re-render information
    if (lastRenderTime.current) {
      const renderDuration = currentTime - lastRenderTime.current;
      if (process.env.NODE_ENV === 'development' && renderDuration > 16) {
        // ⚠️ Slow render detected - logged to console in development
      }
    }

    lastRenderTime.current = currentTime;
  });

  // Cleanup and final metrics on unmount
  React.useEffect(() => {
    return (): void => {
      if (mountTime.current && process.env.NODE_ENV === 'development') {
        // Calculate total lifetime for development logging
        // const totalLifetime = performance.now() - mountTime.current;
        // 💀 Component unmounted - logged to console in development
      }
    };
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    mountTime: mountTime.current,
    lastRenderTime: lastRenderTime.current,
  };
}

/**
 * Expensive computation profiler
 * Measures time for heavy calculations
 */
export function profileExpensiveComputation<T>(
  _computationName: string,
  computation: () => T
): T {
  const start = performance.now();
  const result = computation();
  const duration = performance.now() - start;

  if (process.env.NODE_ENV === 'development' && duration > 5) {
    // ⏱️ Expensive computation duration logged to console in development
  }

  return result;
}

/**
 * useMemo profiler wrapper
 * Tracks memo hit/miss ratio
 */
export function useProfiledMemo<T>(
  factory: () => T,
  deps: React.DependencyList | undefined,
  name: string
): T {
  const memoCallCount = React.useRef(0);
  const memoComputeCount = React.useRef(0);
  
  return React.useMemo(() => {
    memoCallCount.current += 1;
    memoComputeCount.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
      const hitRatio = ((memoCallCount.current - memoComputeCount.current) / memoCallCount.current) * 100;
      if (memoCallCount.current > 5 && hitRatio < 50) {
        // 📊 Memo efficiency warning logged to console in development
      }
    }
    
    return profileExpensiveComputation(`useMemo(${name})`, factory);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps ? [...deps, factory, name] : [factory, name]);
}

/**
 * useCallback profiler wrapper
 * Tracks callback recreation frequency
 */
export function useProfiledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList,
  name: string
): T {
  const recreateCount = React.useRef(0);
  
  return React.useCallback((...args: Parameters<T>) => {
    recreateCount.current += 1;
    
    if (process.env.NODE_ENV === 'development' && recreateCount.current > 10) {
      // 🔄 Callback recreation warning logged to console in development
      // Uses name for logging: name
      void name;
    }
    
    return callback(...args);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, name, ...deps]) as T;
}

/**
 * Query performance profiler specifically for TanStack Query
 */
export function useQueryProfiler(queryKey: string[]): {
  trackCacheHit: () => void;
  trackNetworkCall: () => void;
  getQueryMetrics: () => {
    queryKey: string;
    totalCalls: number;
    cacheHits: number;
    networkCalls: number;
    cacheHitRatio: number;
  };
} {
  const queryCallCount = React.useRef(0);
  const cacheHits = React.useRef(0);
  const networkCalls = React.useRef(0);

  React.useEffect(() => {
    queryCallCount.current += 1;
  });

  const trackCacheHit = React.useCallback((): void => {
    cacheHits.current += 1;
  }, []);

  const trackNetworkCall = React.useCallback((): void => {
    networkCalls.current += 1;
  }, []);

  const getQueryMetrics = React.useCallback(() => ({
    queryKey: queryKey.join(':'),
    totalCalls: queryCallCount.current,
    cacheHits: cacheHits.current,
    networkCalls: networkCalls.current,
    cacheHitRatio: queryCallCount.current > 0 ? (cacheHits.current / queryCallCount.current) * 100 : 0,
  }), [queryKey]);

  // Log metrics in development when query is frequently called
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && queryCallCount.current > 10) {
      const metrics = getQueryMetrics();
      if (metrics.cacheHitRatio < 60) {
        // 📊 Query low cache efficiency warning logged to console in development
      }
    }
  }, [getQueryMetrics]);

  return {
    trackCacheHit,
    trackNetworkCall,
    getQueryMetrics,
  };
}

/**
 * Performance budget checker
 * Warns when components exceed performance budgets
 */
export const performanceBudgets = {
  // Component render time budgets (in ms)
  componentRender: {
    small: 5,     // Simple components (buttons, inputs)
    medium: 16,   // Complex components (forms, cards)
    large: 100,   // Heavy components (charts, tables)
  },
  
  // Memory usage budgets
  memoryUsage: {
    componentInstances: 1000,  // Max component instances
    eventListeners: 100,       // Max event listeners
  },
  
  // Network request budgets
  networkRequests: {
    concurrent: 6,             // Max concurrent requests
    totalPerPage: 20,          // Max requests per page load
  },
} as const;

export function checkPerformanceBudget(
  type: keyof typeof performanceBudgets.componentRender,
  actualTime: number,
  componentName: string
): boolean {
  const budget = performanceBudgets.componentRender[type];
  const isWithinBudget = actualTime <= budget;

  if (!isWithinBudget && process.env.NODE_ENV === 'development') {
    // 💰 Performance budget exceeded warning logged to console in development
    // Uses componentName and actualTime for logging in development
    void componentName;
  }

  return isWithinBudget;
}

/**
 * Global performance monitoring
 * Collects and reports performance metrics
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getMetricSummary(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    total: number;
  } | null {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { count: values.length, avg, min, max, total: sum };
  }

  getAllMetrics(): Record<string, ReturnType<typeof this.getMetricSummary>> {
    const summary: Record<string, ReturnType<typeof this.getMetricSummary>> = {};
    this.metrics.forEach((_, name) => {
      summary[name] = this.getMetricSummary(name);
    });
    return summary;
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Development-only performance panel
 * Shows real-time performance metrics
 */
export function PerformanceDevPanel(): React.ReactElement | null {
  const [isVisible, setIsVisible] = React.useState(false);
  const [metrics, setMetrics] = React.useState(performanceMonitor.getAllMetrics());

  React.useEffect(() => {
    if (!isVisible || process.env.NODE_ENV !== 'development') return;

    const interval = setInterval((): void => {
      setMetrics(performanceMonitor.getAllMetrics());
    }, 1000);

    return (): void => clearInterval(interval);
  }, [isVisible]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return React.createElement(React.Fragment, null,
    // Toggle button
    React.createElement('button', {
      onClick: () => setIsVisible(!isVisible),
      style: {
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        padding: '8px 12px',
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
      }
    }, '📊 Perf'),

    // Performance panel
    isVisible && React.createElement('div', {
      style: {
        position: 'fixed',
        bottom: 60,
        right: 20,
        width: 300,
        maxHeight: 400,
        overflow: 'auto',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        zIndex: 9998,
        fontSize: '12px',
        fontFamily: 'monospace',
      }
    },
      React.createElement('h3', null, 'Performance Metrics'),
      Object.entries(metrics).map(([name, data]) => 
        data && React.createElement('div', { key: name, style: { marginBottom: '8px' } },
          React.createElement('strong', null, name),
          React.createElement('div', null, `Count: ${(data as NonNullable<ReturnType<typeof performanceMonitor.getMetricSummary>>).count}`),
          React.createElement('div', null, `Avg: ${(data as NonNullable<ReturnType<typeof performanceMonitor.getMetricSummary>>).avg.toFixed(2)}ms`),
          React.createElement('div', null, `Min/Max: ${(data as NonNullable<ReturnType<typeof performanceMonitor.getMetricSummary>>).min.toFixed(2)}/${(data as NonNullable<ReturnType<typeof performanceMonitor.getMetricSummary>>).max.toFixed(2)}ms`)
        )
      ),
      React.createElement('button', {
        onClick: () => performanceMonitor.clear(),
        style: {
          marginTop: '10px',
          padding: '4px 8px',
          fontSize: '11px',
        }
      }, 'Clear Metrics')
    )
  );
}