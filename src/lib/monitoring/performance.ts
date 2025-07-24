import * as Sentry from '@sentry/nextjs';

import { appLogger } from './logger.config';

// Core Web Vitals tracking
export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Performance thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

// Get performance rating
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Enhanced Web Vitals reporting
export function reportWebVitals(metric: WebVitalsMetric): void {
  const rating = getRating(metric.name, metric.value);
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    appLogger.performance(`Web Vital: ${metric.name}`, metric.value, {
      metadata: {
        rating,
        id: metric.id,
        delta: metric.delta,
      },
    });
  }
  
  // Send to Sentry
  Sentry.addBreadcrumb({
    message: `Web Vital: ${metric.name}`,
    level: rating === 'poor' ? 'error' : rating === 'needs-improvement' ? 'warning' : 'info',
    data: {
      value: metric.value,
      rating,
      id: metric.id,
      delta: metric.delta,
    },
    category: 'web-vitals',
  });
  
  // Send performance data to Sentry as measurement
  Sentry.setMeasurement(metric.name, metric.value, 'millisecond');
  
  // Alert on poor performance
  if (rating === 'poor') {
    appLogger.warn(`Poor Web Vital detected: ${metric.name}`, {
      metadata: {
        value: metric.value,
        threshold: THRESHOLDS[metric.name as keyof typeof THRESHOLDS]?.poor,
        id: metric.id,
      },
    });
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static marks = new Map<string, number>();
  
  // Start performance measurement
  static mark(name: string): void {
    const timestamp = performance.now();
    this.marks.set(name, timestamp);
    
    if (process.env.NODE_ENV === 'development') {
      appLogger.debug(`Performance mark: ${name}`, {
        metadata: { timestamp },
      });
    }
  }
  
  // End performance measurement
  static measure(name: string, context?: Record<string, unknown>): number {
    const endTime = performance.now();
    const startTime = this.marks.get(name);
    
    if (!startTime) {
      appLogger.warn(`Performance mark '${name}' not found`);
      return 0;
    }
    
    const duration = Math.round(endTime - startTime);
    this.marks.delete(name);
    
    // Log performance measurement
    appLogger.performance(name, duration, {
      metadata: context,
    });
    
    // Send to Sentry if duration is concerning
    if (duration > 1000) { // Over 1 second
      Sentry.addBreadcrumb({
        message: `Slow operation: ${name}`,
        level: 'warning',
        data: { duration, ...context },
        category: 'performance',
      });
    }
    
    return duration;
  }
  
  // Memory usage monitoring
  static checkMemory(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const { memory } = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } });
      const memoryInfo = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100), // %
      };
      
      appLogger.info('Memory usage check', {
        metadata: memoryInfo,
      });
      
      // Alert on high memory usage
      if (memoryInfo.usage > 80) {
        appLogger.warn('High memory usage detected', {
          metadata: memoryInfo,
        });
        
        Sentry.addBreadcrumb({
          message: 'High memory usage',
          level: 'warning',
          data: memoryInfo,
          category: 'performance',
        });
      }
    }
  }
  
  // API call performance tracking
  static async trackApiCall<T>(
    name: string, 
    apiCall: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = Math.round(performance.now() - startTime);
      
      appLogger.apiCall('GET', name, duration, 200, context);
      
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      
      appLogger.apiCall('GET', name, duration, 500, {
        ...context,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      
      throw error;
    }
  }
}

// Hook for React component performance tracking
export function usePerformanceMonitor(componentName: string): {
  markStart: (operation: string) => void;
  markEnd: (operation: string, context?: Record<string, unknown>) => number;
  trackAsync: <T>(operation: string, asyncFn: () => Promise<T>) => Promise<T>;
} {
  return {
    markStart: (operation: string): void => {
      PerformanceMonitor.mark(`${componentName}.${operation}`);
    },
    markEnd: (operation: string, context?: Record<string, unknown>): number => {
      return PerformanceMonitor.measure(`${componentName}.${operation}`, {
        component: componentName,
        ...context,
      });
    },
    trackAsync: <T>(operation: string, asyncFn: () => Promise<T>): Promise<T> => {
      return PerformanceMonitor.trackApiCall(
        `${componentName}.${operation}`,
        asyncFn,
        { component: componentName }
      );
    },
  };
}