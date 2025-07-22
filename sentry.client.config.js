import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay (available in Sentry v8+)
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Development settings
  debug: process.env.NODE_ENV === 'development',
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // User Context
  beforeSend(event, hint) {
    // Enhanced error context for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Error:', hint.originalException || hint.syntheticException);
    }
    
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      const error = hint.originalException;
      if (error && error.message) {
        // Skip common non-critical errors
        if (error.message.includes('Non-Error promise rejection captured')) {
          return null;
        }
        if (error.message.includes('ResizeObserver loop limit exceeded')) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Integrations - minimal setup for reliable operation
  integrations: [],
  
  // Tags for filtering
  initialScope: {
    tags: {
      component: 'client',
      version: process.env.npm_package_version,
    },
  },
});