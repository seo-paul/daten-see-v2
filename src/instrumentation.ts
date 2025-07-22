// Next.js Instrumentation Hook (Official Pattern)
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register(): Promise<void> {
  // Server-side Sentry initialization
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@sentry/nextjs');
    
    init({
      dsn: process.env.SENTRY_DSN,
      
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Development settings - avoid debug mode in Docker to prevent bundle issues
      debug: false,
      
      // Environment
      environment: process.env.NODE_ENV,
      
      // Server-specific settings
      beforeSend(event) {
        // Enhanced error context for development  
        // Note: console.error allowed in instrumentation for critical error visibility
        
        // Add server context
        if (event.request) {
          event.tags = {
            ...event.tags,
            server: 'nextjs',
            route: event.request.url,
          };
        }
        
        return event;
      },
      
      // Tags for filtering
      initialScope: {
        tags: {
          component: 'server',
          version: process.env.npm_package_version,
        },
      },
    });
  }
  
  // Edge runtime initialization (if needed)
  if (process.env.NEXT_RUNTIME === 'edge') {
    const { init } = await import('@sentry/nextjs');
    
    init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: false,
      environment: process.env.NODE_ENV,
    });
  }
}