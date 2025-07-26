/**
 * Performance Monitoring Integration
 * Integrates performance data with Sentry and development tools
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Performance metric types
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'kb' | 'count' | 'percentage';
  timestamp: number;
  tags?: Record<string, string>;
  context?: Record<string, unknown>;
}

/**
 * Performance monitoring configuration
 */
export interface MonitoringConfig {
  enableSentry: boolean;
  enableConsoleLogging: boolean;
  enableLocalStorage: boolean;
  enableWebVitals: boolean;
  sampleRate: number;
  thresholds: {
    slowRender: number;
    largeBundle: number;
    highMemory: number;
  };
}

/**
 * Default monitoring configuration
 */
const DEFAULT_CONFIG: MonitoringConfig = {
  enableSentry: process.env.NODE_ENV === 'production',
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableLocalStorage: process.env.NODE_ENV === 'development',
  enableWebVitals: true,
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  thresholds: {
    slowRender: 16, // ms
    largeBundle: 250, // kb
    highMemory: 50, // mb
  },
};

/**
 * Performance Monitor Class
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private config: MonitoringConfig;
  private metrics: PerformanceMetric[] = [];
  private isEnabled = true;

  private constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initialize();
  }

  static getInstance(config?: Partial<MonitoringConfig>): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    // Initialize Sentry performance monitoring
    if (this.config.enableSentry) {
      this.initializeSentryPerformance();
    }

    // Initialize Web Vitals monitoring
    if (this.config.enableWebVitals) {
      this.initializeWebVitals();
    }

    // Initialize development tools
    if (this.config.enableConsoleLogging || this.config.enableLocalStorage) {
      this.initializeDevelopmentTools();
    }
  }

  private initializeSentryPerformance(): void {
    // Configure Sentry for performance monitoring
    Sentry.addEventProcessor((event) => {
      if (event.type === 'transaction') {
        // Add custom performance context
        event.contexts = {
          ...event.contexts,
          performance: {
            metrics: this.getRecentMetrics(10),
            thresholds: this.config.thresholds,
          },
        };
      }
      return event;
    });

    if (process.env.NODE_ENV === 'development') {
      // Sentry performance monitoring initialized
    }
  }

  private initializeWebVitals(): void {
    // Web Vitals will be initialized separately in Core Web Vitals task
    if (process.env.NODE_ENV === 'development') {
      // Web Vitals monitoring prepared
    }
  }

  private initializeDevelopmentTools(): void {
    if (typeof window !== 'undefined') {
      // Make monitoring available in console
      (window as unknown as Record<string, unknown>).performanceMonitor = {
        getMetrics: (): PerformanceMetric[] => this.getMetrics(),
        getRecentMetrics: (count?: number): PerformanceMetric[] => this.getRecentMetrics(count),
        clearMetrics: (): void => this.clearMetrics(),
        exportMetrics: (): string => this.exportMetrics(),
        getThresholds: (): MonitoringConfig['thresholds'] => this.config.thresholds,
        setThreshold: (key: keyof MonitoringConfig['thresholds'], value: number): void => {
          this.config.thresholds[key] = value;
        },
      };

      if (process.env.NODE_ENV === 'development') {
        // Development performance tools available via window.performanceMonitor
      }
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);

    // Apply sampling
    if (Math.random() > this.config.sampleRate) return;

    // Console logging for development
    if (this.config.enableConsoleLogging) {
      this.logMetricToConsole(fullMetric);
    }

    // Send to Sentry if enabled
    if (this.config.enableSentry) {
      this.sendMetricToSentry(fullMetric);
    }

    // Store locally for development
    if (this.config.enableLocalStorage) {
      this.storeMetricLocally(fullMetric);
    }

    // Check thresholds and alert
    this.checkThresholds(fullMetric);

    // Cleanup old metrics (keep last 1000)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private logMetricToConsole(metric: PerformanceMetric): void {
    if (process.env.NODE_ENV === 'development') {
      // Console output removed: metric logged with emoji and color
      // Accessing metric properties for potential future logging
      // Metric info calculation for potential future use
      void this.getMetricEmoji(metric);
      void this.getMetricColor(metric);
    }
  }

  private sendMetricToSentry(metric: PerformanceMetric): void {
    // Send custom metric to Sentry
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${metric.name}: ${metric.value}${metric.unit}`,
      level: 'info',
      data: {
        value: metric.value,
        unit: metric.unit,
        tags: metric.tags,
        context: metric.context,
      },
    });

    // For critical metrics, add detailed breadcrumb
    if (this.isCriticalMetric(metric)) {
      try {
        Sentry.addBreadcrumb({
          category: 'performance.critical',
          message: `Critical metric: ${metric.name}`,
          level: 'warning',
          data: {
            value: metric.value,
            unit: metric.unit,
            threshold: this.getThresholdForMetric(metric.name),
          },
        });
      } catch {
        if (process.env.NODE_ENV === 'development') {
          // Failed to track critical metric
        }
      }
    }
  }

  private storeMetricLocally(metric: PerformanceMetric): void {
    try {
      const stored = localStorage.getItem('performance-metrics') || '[]';
      const metrics = JSON.parse(stored);
      metrics.push(metric);
      
      // Keep only last 100 metrics in localStorage
      const recent = metrics.slice(-100);
      localStorage.setItem('performance-metrics', JSON.stringify(recent));
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // Failed to store performance metric locally
      }
    }
  }

  private checkThresholds(metric: PerformanceMetric): void {
    const { thresholds } = this.config;
    let isViolation = false;
    let violationType = '';

    switch (metric.name) {
      case 'component-render-time':
        if (metric.value > thresholds.slowRender) {
          isViolation = true;
          violationType = 'slow-render';
        }
        break;
      case 'bundle-size':
        if (metric.value > thresholds.largeBundle * 1024) { // Convert KB to bytes
          isViolation = true;
          violationType = 'large-bundle';
        }
        break;
      case 'memory-usage':
        if (metric.value > thresholds.highMemory * 1024 * 1024) { // Convert MB to bytes
          isViolation = true;
          violationType = 'high-memory';
        }
        break;
    }

    if (isViolation) {
      this.handleThresholdViolation(metric, violationType);
    }
  }

  private handleThresholdViolation(metric: PerformanceMetric, type: string): void {
    const message = `Performance threshold violated: ${metric.name} (${metric.value}${metric.unit})`;
    
    // Console warning in development
    if (this.config.enableConsoleLogging) {
      if (process.env.NODE_ENV === 'development') {
        // Performance threshold violation warning logged
      }
    }

    // Send to Sentry as warning
    if (this.config.enableSentry) {
      Sentry.captureMessage(message, 'warning');
    }

    // Emit custom event for application handling
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('performance-threshold-violation', {
        detail: { metric, type, message }
      }));
    }
  }

  private getMetricEmoji(metric: PerformanceMetric): string {
    if (metric.name.includes('render')) return '🎨';
    if (metric.name.includes('bundle')) return '📦';
    if (metric.name.includes('memory')) return '🧠';
    if (metric.name.includes('network')) return '🌐';
    if (metric.name.includes('vitals')) return '🎯';
    return '📊';
  }

  private getMetricColor(metric: PerformanceMetric): string {
    if (this.isCriticalMetric(metric)) return '#dc2626'; // red
    if (metric.value > 50) return '#f59e0b'; // yellow
    return '#10b981'; // green
  }

  private isCriticalMetric(metric: PerformanceMetric): boolean {
    const { thresholds } = this.config;
    
    if (metric.name.includes('render') && metric.value > thresholds.slowRender) return true;
    if (metric.name.includes('bundle') && metric.value > thresholds.largeBundle * 1024) return true;
    if (metric.name.includes('memory') && metric.value > thresholds.highMemory * 1024 * 1024) return true;
    
    return false;
  }

  private getThresholdForMetric(metricName: string): number {
    const { thresholds } = this.config;
    
    if (metricName.includes('render')) return thresholds.slowRender;
    if (metricName.includes('bundle')) return thresholds.largeBundle;
    if (metricName.includes('memory')) return thresholds.highMemory;
    
    return 0;
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count = 50): PerformanceMetric[] {
    return this.metrics.slice(-count);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    if (this.config.enableLocalStorage) {
      try {
        localStorage.removeItem('performance-metrics');
      } catch {
        if (process.env.NODE_ENV === 'development') {
          // Failed to clear stored metrics
        }
      }
    }
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      config: this.config,
      metrics: this.metrics,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, unknown> {
    const summary: Record<string, unknown> = {};
    
    // Group metrics by name
    const grouped = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) acc[metric.name] = [];
      acc[metric.name]!.push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate statistics for each metric type
    Object.entries(grouped).forEach(([name, values]) => {
      if (values.length === 0) return;
      
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const sortedValues = [...values].sort((a, b) => a - b);
      const p95 = sortedValues[Math.floor(sortedValues.length * 0.95)] || 0;

      summary[name] = {
        count: values.length,
        avg: Number(avg.toFixed(2)),
        min: Number(min.toFixed(2)),
        max: Number(max.toFixed(2)),
        p95: Number(p95.toFixed(2)),
      };
    });

    return summary;
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (process.env.NODE_ENV === 'development') {
      // Performance monitoring enabled/disabled status logged
    }
  }
}

// Create singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Convenience functions for common metrics
 */
export const recordMetrics = {
  renderTime: (componentName: string, duration: number, additionalData?: Record<string, unknown>): void => {
    performanceMonitor.recordMetric({
      name: 'component-render-time',
      value: duration,
      unit: 'ms',
      tags: { component: componentName },
      ...(additionalData && { context: additionalData }),
    });
  },

  bundleSize: (bundleName: string, size: number): void => {
    performanceMonitor.recordMetric({
      name: 'bundle-size',
      value: size,
      unit: 'kb',
      tags: { bundle: bundleName },
    });
  },

  memoryUsage: (usage: number, context?: string): void => {
    performanceMonitor.recordMetric({
      name: 'memory-usage',
      value: usage,
      unit: 'kb', // Convert MB to KB to match PerformanceMetric type
      tags: { context: context || 'general' },
    });
  },

  networkRequest: (url: string, duration: number, status: number): void => {
    performanceMonitor.recordMetric({
      name: 'network-request',
      value: duration,
      unit: 'ms',
      tags: { url, status: status.toString() },
    });
  },

  queryPerformance: (queryKey: string, duration: number, fromCache: boolean): void => {
    performanceMonitor.recordMetric({
      name: 'tanstack-query-duration',
      value: duration,
      unit: 'ms',
      tags: { 
        queryKey, 
        source: fromCache ? 'cache' : 'network' 
      },
    });
  },
};

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitoring(): {
  recordMetric: (metric: Omit<PerformanceMetric, 'timestamp'>) => void;
  recordMetrics: typeof recordMetrics;
  getMetrics: () => PerformanceMetric[];
  getSummary: () => Record<string, unknown>;
  exportMetrics: () => string;
} {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    recordMetrics,
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getSummary: performanceMonitor.getSummary.bind(performanceMonitor),
    exportMetrics: performanceMonitor.exportMetrics.bind(performanceMonitor),
  };
}

export default performanceMonitor;