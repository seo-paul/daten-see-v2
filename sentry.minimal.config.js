// Minimal Sentry configuration for development/Docker
import * as Sentry from '@sentry/nextjs';

// Basic Sentry initialization that works in all environments
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  
  // Basic performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Development settings
  debug: process.env.NODE_ENV === 'development',
  
  // Environment
  environment: process.env.NODE_ENV,
  release: process.env.npm_package_version || '0.1.0',
  
  // Basic error filtering
  beforeSend(event) {
    // Skip common non-critical errors
    if (process.env.NODE_ENV === 'production') {
      const error = event.exception?.[0]?.value;
      if (error?.includes('Non-Error promise rejection') || 
          error?.includes('ResizeObserver loop limit exceeded')) {
        return null;
      }
    }
    return event;
  },
  
  // Use default integrations only
  integrations: [],
  
  // Basic settings
  maxBreadcrumbs: 50,
  attachStacktrace: true,
  sendDefaultPii: false,
});