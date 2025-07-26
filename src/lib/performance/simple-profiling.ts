/**
 * Simple React Performance Profiling
 * Essential profiling utilities without complex JSX dependencies
 */

import * as React from 'react';

/**
 * Performance measurement hook
 */
export function usePerformanceProfiler(componentName: string): { renderCount: number; mountTime: number | undefined } {
  const renderCount = React.useRef(0);
  const mountTime = React.useRef<number>();

  renderCount.current += 1;
  const currentTime = performance.now();

  React.useEffect(() => {
    if (!mountTime.current) {
      mountTime.current = currentTime;
      // Development logging: Component mounted at ${currentTime.toFixed(2)}ms
    }
  }, [componentName, currentTime]);

  return {
    renderCount: renderCount.current,
    mountTime: mountTime.current,
  };
}

/**
 * Simple performance monitor
 */
class SimplePerformanceMonitor {
  private static instance: SimplePerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): SimplePerformanceMonitor {
    if (!SimplePerformanceMonitor.instance) {
      SimplePerformanceMonitor.instance = new SimplePerformanceMonitor();
    }
    return SimplePerformanceMonitor.instance;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getMetrics(): Record<string, { count: number; avg: number }> {
    const summary: Record<string, { count: number; avg: number }> = {};
    this.metrics.forEach((values, name) => {
      if (values.length > 0) {
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        summary[name] = { count: values.length, avg };
      }
    });
    return summary;
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const simpleMonitor = SimplePerformanceMonitor.getInstance();

/**
 * Performance budget checker
 */
export function checkPerformanceBudget(
  _componentName: string,
  renderTime: number,
  budget: 'small' | 'medium' | 'large' = 'medium'
): boolean {
  const budgets = { small: 5, medium: 16, large: 100 };
  const limit = budgets[budget];
  
  if (renderTime > limit && process.env.NODE_ENV === 'development') {
    // Development warning: Component exceeds budget
    return false;
  }
  
  return true;
}

/**
 * Simple profiling HOC
 */
export function withSimpleProfiler<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<unknown>> {
  const name = componentName || Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = React.forwardRef<unknown, P>((props, ref) => {
    const renderStart = performance.now();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { renderCount: _renderCount } = usePerformanceProfiler(name);
    
    React.useEffect(() => {
      const renderTime = performance.now() - renderStart;
      simpleMonitor.recordMetric(`${name}-render`, renderTime);
      checkPerformanceBudget(name, renderTime);
      
      // Development warning: Slow render detected over 16ms
    });

    const componentProps = { ...props } as P;
    if (ref) {
      // Type assertion to handle ref forwarding properly
      (componentProps as Record<string, unknown>).ref = ref;
    }
    
    return React.createElement(Component, componentProps);
  });

  WrappedComponent.displayName = `withSimpleProfiler(${name})`;
  
  return WrappedComponent;
}

/**
 * Development utilities
 */
export const devProfiling = {
  start: (): void => {
    // Development logging: Started simple profiling session
    simpleMonitor.clear();
  },
  
  stop: (): Record<string, { count: number; avg: number }> => {
    const metrics = simpleMonitor.getMetrics();
    // Development logging: Profiling session ended
    // Development table: metrics
    return metrics;
  },
  
  getMetrics: (): Record<string, { count: number; avg: number }> => simpleMonitor.getMetrics(),
  
  clear: (): void => simpleMonitor.clear(),
};

// Make available in development console
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).simpleProfiling = devProfiling;
}

const simpleProfilingModule = {
  usePerformanceProfiler,
  withSimpleProfiler,
  checkPerformanceBudget,
  devProfiling,
  simpleMonitor,
};

export default simpleProfilingModule;