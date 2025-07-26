/**
 * Performance Monitoring Index
 * Central export for all performance monitoring utilities
 */

// Core monitoring
export { 
  performanceMonitor, 
  recordMetrics, 
  usePerformanceMonitoring 
} from './monitoring-integration';

// React hooks
export {
  useRenderPerformance,
  useMemoryMonitoring,
  useQueryPerformanceMonitoring,
  useNetworkMonitoring,
  useCustomMetric,
  useMeasureOperation,
  useLifecyclePerformance,
  usePerformanceDebug,
} from './performance-hooks';

// Sentry integration
export {
  configureSentryPerformance,
  createPerformanceTransaction,
  trackComponentRender,
  trackBundleLoad,
  trackQueryPerformance,
} from './sentry-integration';

// Simple profiling (fallback)
export {
  usePerformanceProfiler,
  withSimpleProfiler,
  checkPerformanceBudget,
  devProfiling,
  simpleMonitor,
} from './simple-profiling';

// Web Vitals
export {
  webVitalsCollector,
  useWebVitals,
  initializeWebVitals,
  WEB_VITALS_THRESHOLDS,
} from './web-vitals';

export type { WebVitalMetric } from './web-vitals';

// Bundle optimization (available separately)
// export { dynamicImport, createLazyComponent, bundleConfig } from './bundle-optimization';

/**
 * Initialize all performance monitoring
 */
export function initializePerformanceMonitoring(config?: {
  enableSentry?: boolean;
  enableConsoleLogging?: boolean;
  sampleRate?: number;
}): void {
  // Initialize Sentry performance monitoring
  if (config?.enableSentry !== false) {
    import('./sentry-integration').then(({ configureSentryPerformance }) => {
      configureSentryPerformance();
    });
  }

  // Initialize Web Vitals
  if (typeof window !== 'undefined') {
    import('./web-vitals').then(({ initializeWebVitals }) => {
      initializeWebVitals();
    });
  }

  // Initialize core monitoring
  if (typeof window !== 'undefined') {
    // Make performance tools available globally in development
    if (process.env.NODE_ENV === 'development') {
      import('./simple-profiling').then(({ simpleMonitor }) => {
        const windowAny = window as unknown as Record<string, unknown>;
        windowAny.performance = {
          ...((windowAny.performance || {}) as Record<string, unknown>),
          monitoring: simpleMonitor,
        };
      });
    }

    if (process.env.NODE_ENV === 'development') {
      // Performance monitoring initialized
    }
  }
}

const performanceConfig = {
  init: initializePerformanceMonitoring,
  get monitor(): unknown {
    // Lazy load simpleMonitor to avoid circular dependencies
    return require('./simple-profiling').simpleMonitor;
  },
};

export default performanceConfig;