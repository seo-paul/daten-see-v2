// Next.js Instrumentation Hook (Official Pattern)
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register(): Promise<void> {
  const { devLogger } = await import('./lib/monitoring/development-logger');
  // Server-side Sentry initialization
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import minimal Sentry configuration for Docker compatibility
    await import('../sentry.minimal.config.js');
    
    // Initialize performance monitoring for server
    const { configureSentryPerformance } = await import('./lib/performance/sentry-integration');
    configureSentryPerformance();
    
    // Server-side logging
    devLogger.sentryInit('server', true);
  }
  
  // Edge runtime initialization (if needed)
  if (process.env.NEXT_RUNTIME === 'edge') {
    const { init } = await import('@sentry/nextjs');
    
    init({
      dsn: process.env.SENTRY_DSN || '',
      
      // Performance Monitoring - Conservative for edge
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5,
      
      // Edge-specific settings
      debug: false,
      environment: process.env.NODE_ENV,
      release: process.env.npm_package_version || '0.1.0',
      
      // Edge runtime context
      beforeSend(event) {
        event.contexts = {
          ...event.contexts,
          runtime: {
            name: 'edge',
            version: process.env.npm_package_version || '0.1.0',
            environment: process.env.NODE_ENV,
          },
        };
        
        return event;
      },
      
      // Minimal integrations for edge
      integrations: [
        // Only essential integrations for edge runtime
      ],
      
      // Tags for filtering
      initialScope: {
        tags: {
          component: 'edge',
          runtime: 'edge',
          version: process.env.npm_package_version || '0.1.0',
        },
      },
      
      // Edge-specific settings
      maxBreadcrumbs: 20,
      attachStacktrace: true,
      sendDefaultPii: false,
      autoSessionTracking: false,
    });
    
    // Edge runtime logging
    devLogger.sentryInit('edge', true);
  }
}