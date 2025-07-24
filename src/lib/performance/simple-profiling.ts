/**
 * Simple React Performance Profiling
 * Essential profiling utilities without complex JSX dependencies
 */

import * as React from 'react';

/**
 * Performance measurement hook
 */
export function usePerformanceProfiler(componentName: string) {
  const renderCount = React.useRef(0);
  const mountTime = React.useRef<number>();

  renderCount.current += 1;
  const currentTime = performance.now();

  React.useEffect(() => {
    if (!mountTime.current) {
      mountTime.current = currentTime;
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 ${componentName} mounted at ${currentTime.toFixed(2)}ms`);
      }
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

  getMetrics() {
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
  componentName: string,
  renderTime: number,
  budget: 'small' | 'medium' | 'large' = 'medium'
): boolean {
  const budgets = { small: 5, medium: 16, large: 100 };
  const limit = budgets[budget];
  
  if (renderTime > limit && process.env.NODE_ENV === 'development') {
    console.warn(`💰 ${componentName}: ${renderTime.toFixed(2)}ms exceeds ${limit}ms budget`);
    return false;
  }
  
  return true;
}

/**
 * Simple profiling HOC
 */
export function withSimpleProfiler<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const name = componentName || Component.displayName || Component.name || 'Component';
  
  return React.forwardRef<any, P>((props, ref) => {
    const renderStart = performance.now();
    const { renderCount } = usePerformanceProfiler(name);
    
    React.useEffect(() => {
      const renderTime = performance.now() - renderStart;
      simpleMonitor.recordMetric(`${name}-render`, renderTime);
      checkPerformanceBudget(name, renderTime);
      
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`⚠️ ${name} slow render: ${renderTime.toFixed(2)}ms (render #${renderCount})`);
      }
    });

    const componentProps = { ...props } as P;
    if (ref) {
      // Type assertion to handle ref forwarding properly
      (componentProps as any).ref = ref;
    }
    
    return React.createElement(Component, componentProps);
  });
}

/**
 * Development utilities
 */
export const devProfiling = {
  start: () => {
    console.log('🎬 Started simple profiling session');
    simpleMonitor.clear();
  },
  
  stop: () => {
    const metrics = simpleMonitor.getMetrics();
    console.log('🛑 Profiling session ended');
    console.table(metrics);
    return metrics;
  },
  
  getMetrics: () => simpleMonitor.getMetrics(),
  
  clear: () => simpleMonitor.clear(),
};

// Make available in development console
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).simpleProfiling = devProfiling;
}

export default {
  usePerformanceProfiler,
  withSimpleProfiler,
  checkPerformanceBudget,
  devProfiling,
  simpleMonitor,
};