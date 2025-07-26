import * as Sentry from '@sentry/nextjs';

// Initialize Sentry for server-side
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring - Conservative sampling for server
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5,
  
  // Development settings
  debug: process.env.NODE_ENV === 'development',
  
  // Environment and release tracking
  environment: process.env.NODE_ENV,
  release: process.env.npm_package_version || '0.1.0',
  
  // Enhanced Error Processing
  beforeSend(event, hint) {
    // Add server-specific context
    event.contexts = {
      ...event.contexts,
      app: {
        version: process.env.npm_package_version || '0.1.0',
        build_time: process.env.BUILD_TIME || new Date().toISOString(),
        environment: process.env.NODE_ENV,
        runtime: 'nodejs',
      },
      server: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        memory_usage: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };
    
    // Enhanced error context for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Sentry Server Error Captured');
      console.error('Error:', hint.originalException || hint.syntheticException);
      console.log('Event:', event);
      console.groupEnd();
    }
    
    // Filter out non-critical server errors in production
    if (process.env.NODE_ENV === 'production') {
      const error = hint.originalException;
      if (error && error.message) {
        // Skip common non-critical errors
        const skipPatterns = [
          'ECONNRESET',
          'EPIPE',
          'ENOTFOUND',
          'socket hang up',
          'Client closed connection',
          'aborted',
        ];
        
        if (skipPatterns.some(pattern => error.message.includes(pattern))) {
          return null;
        }
      }
      
      // Skip 404 and similar client errors
      if (event.request && event.request.url) {
        const url = event.request.url;
        if (url.includes('favicon.ico') || url.includes('robots.txt') || url.includes('.map')) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Server-specific integrations - simplified for compatibility
  integrations: [
    // Use default integrations that are guaranteed to be available
  ],
  
  // Advanced Transaction Sampling
  beforeSendTransaction(event) {
    // Filter out health check and static asset requests
    if (event.transaction) {
      const transaction = event.transaction;
      
      // Skip health checks and monitoring endpoints
      if (transaction.includes('/health') || 
          transaction.includes('/metrics') || 
          transaction.includes('/_next/') ||
          transaction.includes('/favicon.ico')) {
        return null;
      }
      
      // Always capture slow API requests
      const duration = event.timestamp && event.start_timestamp 
        ? (event.timestamp - event.start_timestamp) * 1000 
        : 0;
      
      if (duration > 2000) {
        return event; // Always capture slow API requests
      }
      
      // Sample routine API requests
      if (transaction.includes('/api/')) {
        return Math.random() < 0.1 ? event : null; // 10% sampling for API routes
      }
    }
    
    return event;
  },
  
  // Tags for enhanced filtering
  initialScope: {
    tags: {
      component: 'server',
      version: process.env.npm_package_version || '0.1.0',
      build: process.env.BUILD_TIME || 'development',
      feature: 'bi-saas-api',
      runtime: 'nodejs',
    },
    level: 'info',
  },
  
  // Server-specific settings
  maxBreadcrumbs: 50,
  attachStacktrace: true,
  sendDefaultPii: false,
  autoSessionTracking: false, // Disable for server-side
  captureUnhandledRejections: true,
  enableTracing: true,
  
  // Request data collection - simplified
  maxRequestBodySize: 'medium', // Up to 10KB
});

// Global error handlers for Node.js
process.on('unhandledRejection', (reason, promise) => {
  Sentry.captureException(reason, {
    tags: { source: 'unhandledRejection' },
    extra: { promise: promise.toString() },
  });
});

process.on('uncaughtException', (error) => {
  Sentry.captureException(error, {
    tags: { source: 'uncaughtException' },
    level: 'fatal',
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  Sentry.close(2000).then(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  Sentry.close(2000).then(() => {
    process.exit(0);
  });
});