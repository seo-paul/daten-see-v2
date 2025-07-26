/**
 * Core Web Vitals Tracking
 * Implements Google's Core Web Vitals monitoring for performance optimization
 */

import * as React from 'react';

import { simpleMonitor } from './simple-profiling';

/**
 * Core Web Vitals metric interface
 */
export interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
  entries: PerformanceEntry[];
}

/**
 * Core Web Vitals thresholds based on Google recommendations
 */
export const WEB_VITALS_THRESHOLDS = {
  // Largest Contentful Paint (LCP)
  LCP: {
    good: 2500,      // <= 2.5s
    poor: 4000,      // > 4.0s
  },
  // First Input Delay (FID) 
  FID: {
    good: 100,       // <= 100ms
    poor: 300,       // > 300ms
  },
  // Cumulative Layout Shift (CLS)
  CLS: {
    good: 0.1,       // <= 0.1
    poor: 0.25,      // > 0.25
  },
  // First Contentful Paint (FCP)
  FCP: {
    good: 1800,      // <= 1.8s
    poor: 3000,      // > 3.0s
  },
  // Time to First Byte (TTFB)
  TTFB: {
    good: 800,       // <= 0.8s
    poor: 1800,      // > 1.8s
  },
  // Interaction to Next Paint (INP)
  INP: {
    good: 200,       // <= 200ms
    poor: 500,       // > 500ms
  },
} as const;

/**
 * Get rating for a metric value
 */
function getRating(name: keyof typeof WEB_VITALS_THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Web Vitals collector class
 */
class WebVitalsCollector {
  private static instance: WebVitalsCollector;
  private metrics: Map<string, WebVitalMetric> = new Map();
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  static getInstance(): WebVitalsCollector {
    if (!WebVitalsCollector.instance) {
      WebVitalsCollector.instance = new WebVitalsCollector();
    }
    return WebVitalsCollector.instance;
  }

  /**
   * Initialize Web Vitals tracking
   */
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      this.initializeLCP();
      this.initializeFID();
      this.initializeCLS();
      this.initializeFCP();
      this.initializeTTFB();
      this.initializeINP();
      
      this.isInitialized = true;
      if (process.env.NODE_ENV === 'development') {
        // Core Web Vitals tracking initialized
      }
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // Failed to initialize Web Vitals tracking: error
      }
    }
  }

  /**
   * Initialize Largest Contentful Paint (LCP) tracking
   */
  private initializeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        
        if (lastEntry) {
          this.recordMetric({
            name: 'LCP',
            value: lastEntry.startTime,
            entries: [lastEntry],
          });
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // LCP observer not supported: error
      }
    }
  }

  /**
   * Initialize First Input Delay (FID) tracking
   */
  private initializeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { processingStart?: number; startTime: number }) => {
          this.recordMetric({
            name: 'FID',
            value: (entry.processingStart || 0) - entry.startTime,
            entries: [entry],
          });
        });
      });

      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // FID observer not supported: error
      }
    }
  }

  /**
   * Initialize Cumulative Layout Shift (CLS) tracking
   */
  private initializeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    const clsEntries: PerformanceEntry[] = [];

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => {
          // Only count layout shifts without recent user input
          if (!entry.hadRecentInput) {
            clsValue += (entry.value || 0);
            clsEntries.push(entry);
            
            this.recordMetric({
              name: 'CLS',
              value: clsValue,
              entries: [...clsEntries],
            });
          }
        });
      });

      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // CLS observer not supported: error
      }
    }
  }

  /**
   * Initialize First Contentful Paint (FCP) tracking
   */
  private initializeFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { startTime: number }) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric({
              name: 'FCP',
              value: entry.startTime,
              entries: [entry],
            });
          }
        });
      });

      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // FCP observer not supported: error
      }
    }
  }

  /**
   * Initialize Time to First Byte (TTFB) tracking
   */
  private initializeTTFB(): void {
    // Use Navigation Timing API for TTFB
    if ('performance' in window && 'getEntriesByType' in performance) {
      try {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        const navigationEntry = navigationEntries[0];
        
        if (navigationEntry) {
          const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
          this.recordMetric({
            name: 'TTFB',
            value: ttfb,
            entries: [navigationEntry],
          });
        }
      } catch {
        if (process.env.NODE_ENV === 'development') {
          // TTFB measurement failed: error
        }
      }
    }
  }

  /**
   * Initialize Interaction to Next Paint (INP) tracking
   */
  private initializeINP(): void {
    if (!('PerformanceObserver' in window)) return;

    let maxInpValue = 0;
    const inpEntries: PerformanceEntry[] = [];

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { duration: number }) => {
          const inp = entry.duration;
          if (inp > maxInpValue) {
            maxInpValue = inp;
            inpEntries.push(entry);
            
            this.recordMetric({
              name: 'INP',
              value: maxInpValue,
              entries: [...inpEntries],
            });
          }
        });
      });

      // Try event timing first, fallback to first-input
      try {
        observer.observe({ type: 'event', buffered: true });
      } catch {
        observer.observe({ type: 'first-input', buffered: true });
      }
      
      this.observers.push(observer);
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // INP observer not supported: error
      }
    }
  }

  /**
   * Record a Web Vital metric
   */
  private recordMetric(params: {
    name: WebVitalMetric['name'];
    value: number;
    entries: PerformanceEntry[];
  }): void {
    const { name, value, entries } = params;
    const rating = getRating(name, value);
    const previousValue = this.metrics.get(name)?.value || 0;
    const delta = value - previousValue;

    const metric: WebVitalMetric = {
      name,
      value,
      rating,
      delta,
      id: `${name}-${Date.now()}`,
      timestamp: Date.now(),
      entries,
    };

    this.metrics.set(name, metric);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
        // Web Vital metric logged: name: value + unit (rating)
    }

    // Record to performance monitor
    simpleMonitor.recordMetric(`web-vitals-${name.toLowerCase()}`, value);

    // Send to analytics/monitoring
    this.sendToMonitoring(metric);

    // Emit custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('web-vital', {
        detail: metric
      }));
    }
  }

  /**
   * Send metric to monitoring systems
   */
  private sendToMonitoring(metric: WebVitalMetric): void {
    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid bundle size in development
        import('@sentry/nextjs').then(({ addBreadcrumb, captureMessage }) => {
          addBreadcrumb({
            category: 'web-vitals',
            message: `${metric.name}: ${metric.value.toFixed(2)}${this.getMetricUnit(metric.name)}`,
            level: metric.rating === 'poor' ? 'warning' : 'info',
            data: {
              value: metric.value,
              rating: metric.rating,
              delta: metric.delta,
            },
          });

          // Alert on poor metrics
          if (metric.rating === 'poor') {
            captureMessage(`Poor Web Vital: ${metric.name}`, 'warning');
          }
        });
      } catch {
        // Failed to send Web Vital to Sentry in development
      }
    }

    // Send to Google Analytics (if available)
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).gtag) {
      try {
        const gtag = (window as unknown as Record<string, unknown>).gtag as Function;
        gtag('event', metric.name, {
          event_category: 'Web Vitals',
          value: Math.round(metric.value),
          metric_rating: metric.rating,
          custom_map: { metric_1: metric.name },
        });
      } catch {
        // Failed to send Web Vital to GA in development
      }
    }
  }


  /**
   * Get unit for metric
   */
  private getMetricUnit(name: WebVitalMetric['name']): string {
    switch (name) {
      case 'CLS': return '';
      case 'FID':
      case 'LCP':
      case 'FCP':
      case 'TTFB':
      case 'INP':
        return 'ms';
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): WebVitalMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metric by name
   */
  getMetric(name: WebVitalMetric['name']): WebVitalMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get Web Vitals score (0-100)
   */
  getScore(): number {
    const metrics = this.getMetrics();
    if (metrics.length === 0) return 0;

    const scores = metrics.map(metric => {
      switch (metric.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 75;
        case 'poor': return 50;
      }
    });

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    score: number;
    metrics: { [K in WebVitalMetric['name']]?: { value: number; rating: string } };
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    const summary: {
      score: number;
      metrics: Record<string, { value: number; rating: string }>;
      recommendations: string[];
    } = {
      score: this.getScore(),
      metrics: {},
      recommendations: [],
    };

    metrics.forEach(metric => {
      summary.metrics[metric.name] = {
        value: metric.value,
        rating: metric.rating,
      };

      // Add recommendations for poor metrics
      if (metric.rating === 'poor') {
        summary.recommendations.push(...this.getRecommendations(metric.name));
      }
    });

    return summary;
  }

  /**
   * Get recommendations for improving specific metrics
   */
  private getRecommendations(metricName: WebVitalMetric['name']): string[] {
    const recommendations = {
      LCP: [
        'Optimize server response times',
        'Use image optimization and lazy loading',
        'Minimize render-blocking JavaScript and CSS',
        'Use a CDN for static assets',
      ],
      FID: [
        'Minimize main thread work',
        'Reduce JavaScript execution time',
        'Use code splitting and lazy loading',
        'Remove unused JavaScript',
      ],
      CLS: [
        'Include size attributes on images and video elements',
        'Reserve space for ad slots and embeds',
        'Avoid inserting content above existing content',
        'Use transform animations instead of layout changes',
      ],
      FCP: [
        'Eliminate render-blocking resources',
        'Minimize CSS and JavaScript',
        'Use efficient cache policy',
        'Optimize fonts and images',
      ],
      TTFB: [
        'Optimize server configuration',
        'Use faster hosting',
        'Implement edge caching',
        'Optimize database queries',
      ],
      INP: [
        'Optimize event handlers',
        'Avoid long-running tasks',
        'Use requestIdleCallback for non-critical work',
        'Implement proper loading states',
      ],
    };

    return recommendations[metricName] || [];
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch {
        if (process.env.NODE_ENV === 'development') {
          // Failed to disconnect observer: error
        }
      }
    });
    this.observers = [];
    this.isInitialized = false;
  }
}

// Create singleton instance
export const webVitalsCollector = WebVitalsCollector.getInstance();

/**
 * React hook for Web Vitals
 */
export function useWebVitals(): {
  metrics: WebVitalMetric[];
  score: number;
  summary: ReturnType<typeof webVitalsCollector.getSummary>;
  getMetric: (name: WebVitalMetric['name']) => WebVitalMetric | undefined;
} {
  const [metrics, setMetrics] = React.useState<WebVitalMetric[]>([]);
  const [score, setScore] = React.useState<number>(0);

  React.useEffect(() => {
    // Initialize tracking
    webVitalsCollector.initialize();

    // Listen for updates
    const handleWebVital = (): void => {
      setMetrics(webVitalsCollector.getMetrics());
      setScore(webVitalsCollector.getScore());
    };

    window.addEventListener('web-vital', handleWebVital as EventListener);

    return (): void => {
      window.removeEventListener('web-vital', handleWebVital as EventListener);
    };
  }, []);

  return {
    metrics,
    score,
    summary: webVitalsCollector.getSummary(),
    getMetric: webVitalsCollector.getMetric.bind(webVitalsCollector),
  };
}

/**
 * Initialize Web Vitals tracking
 */
export function initializeWebVitals(): void {
  if (typeof window !== 'undefined') {
    webVitalsCollector.initialize();
    
    // Make available in console for debugging
    if (process.env.NODE_ENV === 'development') {
      (window as unknown as Record<string, unknown>).webVitals = {
        getMetrics: (): WebVitalMetric[] => webVitalsCollector.getMetrics(),
        getScore: (): number => webVitalsCollector.getScore(),
        getSummary: (): ReturnType<typeof webVitalsCollector.getSummary> => webVitalsCollector.getSummary(),
      };
    }
  }
}

export default webVitalsCollector;