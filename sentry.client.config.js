import * as Sentry from '@sentry/nextjs';
import React from 'react';

// Initialize Sentry with advanced configuration
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring - Enhanced sampling
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay - Enhanced configuration
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.2,
  replaysOnErrorSampleRate: 1.0,
  
  // Development settings
  debug: process.env.NODE_ENV === 'development',
  
  // Environment and release tracking
  environment: process.env.NODE_ENV,
  release: process.env.npm_package_version || '0.1.0',
  
  // Enhanced Error Processing
  beforeSend(event, hint) {
    // Add custom context for all errors
    event.contexts = {
      ...event.contexts,
      app: {
        version: process.env.npm_package_version || '0.1.0',
        build_time: process.env.BUILD_TIME || new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      runtime: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    };
    
    // Enhanced error context for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Sentry Error Captured');
      console.error('Error:', hint.originalException || hint.syntheticException);
      console.log('Event:', event);
      console.log('Stack:', event.exception?.[0]?.stacktrace);
      console.groupEnd();
    }
    
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      const error = hint.originalException;
      if (error && error.message) {
        // Skip common non-critical errors
        const skipPatterns = [
          'Non-Error promise rejection captured',
          'ResizeObserver loop limit exceeded',
          'Script error',
          'Network request failed',
          'ChunkLoadError',
          'Loading chunk',
          'Loading CSS chunk',
        ];
        
        if (skipPatterns.some(pattern => error.message.includes(pattern))) {
          return null;
        }
      }
    }
    
    // Add performance context to errors
    if ('performance' in window && performance.memory) {
      event.contexts.memory = {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024), // MB
      };
    }
    
    return event;
  },
  
  // Enhanced Integrations - simplified for compatibility
  integrations: [
    // Use default integrations provided by @sentry/nextjs
  ],
  
  // Use default transport
  
  // Advanced Sampling
  beforeSendTransaction(event) {
    // Sample based on transaction name and performance
    if (event.transaction) {
      // Always capture slow transactions
      const duration = event.timestamp && event.start_timestamp 
        ? (event.timestamp - event.start_timestamp) * 1000 
        : 0;
      
      if (duration > 1000) {
        return event; // Always capture slow transactions
      }
      
      // Sample routine transactions  
      if (event.transaction.includes('/_next/') || event.transaction.includes('/static/')) {
        return Math.random() < 0.01 ? event : null; // 1% sampling for static assets
      }
    }
    
    return event;
  },
  
  // Tags for enhanced filtering
  initialScope: {
    tags: {
      component: 'client',
      version: process.env.npm_package_version || '0.1.0',
      build: process.env.BUILD_TIME || 'development',
      feature: 'bi-saas-dashboard',
    },
    user: {
      // Will be populated by authentication system later
      id: 'anonymous',
    },
    level: 'info',
  },
  
  // Maximum breadcrumbs
  maxBreadcrumbs: 100,
  
  // Attach stack traces to all events
  attachStacktrace: true,
  
  // Send default PII (personally identifiable information)
  sendDefaultPii: false,
  
  // Auto-Session Tracking
  autoSessionTracking: true,
  
  // Capture unhandled promise rejections
  captureUnhandledRejections: true,
  
  // Enable tracing
  enableTracing: true,
});

// Initialize advanced performance monitoring
if (typeof window !== 'undefined') {
  // Import and configure advanced Sentry performance monitoring
  Promise.all([
    import('./src/lib/performance/sentry-integration'),
    import('./src/lib/monitoring/development-logger')
  ]).then(([{ configureSentryPerformance }, { devLogger }]) => {
    configureSentryPerformance();
    devLogger.sentryInit('client', true);
  }).catch((error) => {
    import('./src/lib/monitoring/development-logger').then(({ devLogger }) => {
      devLogger.sentryInit('client', false);
      devLogger.error('Sentry initialization failed', { metadata: { error: error.message } });
    });
  });
}