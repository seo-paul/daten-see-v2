import pino from 'pino';

// Check if we're running on the server
const isServer = typeof window === 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

// Development logger configuration
const developmentConfig: pino.LoggerOptions = {
  level: 'debug',
  // Only use pino-pretty transport on server-side in development
  ...(isServer && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss.l',
        ignore: 'pid,hostname',
        singleLine: false,
        hideObject: false,
        // Note: customPrettifiers removed due to Next.js serialization issues
        // Will be re-implemented as server-side only in Task 1.8
      },
    },
  }),
  // Use formatters for client-side logging
  ...(!isServer && {
    formatters: {
      level: (label: string): { level: string } => {
        return { level: label };
      },
    },
  }),
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    isServer,
  },
};

// Production logger configuration  
const productionConfig: pino.LoggerOptions = {
  level: 'info',
  formatters: {
    level: (label: string): { level: string } => {
      return { level: label };
    },
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    service: 'daten-see-dashboard',
    isServer,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

// Create logger instance based on environment
export const logger = pino(
  isDevelopment ? developmentConfig : productionConfig
);

// Typed logging interface for development
export interface LogContext {
  userId?: string;
  sessionId?: string;
  action?: string;
  component?: string;
  duration?: number;
  error?: Error;
  metadata?: Record<string, unknown>;
}

// Enhanced logging methods with Sentry integration
export const appLogger = {
  debug: (message: string, context?: LogContext): void => {
    logger.debug(context, message);
  },
  
  info: (message: string, context?: LogContext): void => {
    logger.info(context, message);
  },
  
  warn: (message: string, context?: LogContext): void => {
    logger.warn(context, message);
    // Send warnings to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      import('@sentry/nextjs').then(Sentry => {
        Sentry.addBreadcrumb({
          message,
          level: 'warning',
          data: context,
        });
      });
    }
  },
  
  error: (message: string, context?: LogContext): void => {
    logger.error(context, message);
    // Send errors to Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.withScope(scope => {
        if (context?.userId) scope.setUser({ id: context.userId });
        if (context?.action) scope.setTag('action', context.action);
        if (context?.component) scope.setTag('component', context.component);
        if (context?.metadata) {
          Object.entries(context.metadata).forEach(([key, value]) => {
            scope.setContext(key, value as Record<string, unknown>);
          });
        }
        
        if (context?.error) {
          Sentry.captureException(context.error);
        } else {
          Sentry.captureMessage(message, 'error');
        }
      });
    });
  },
  
  // Performance logging
  performance: (message: string, duration: number, context?: Omit<LogContext, 'duration'>): void => {
    const perfContext = { ...context, duration };
    logger.info(perfContext, `⚡ ${message} (${duration}ms)`);
    
    // Send performance data to Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.addBreadcrumb({
        message: `${message} completed`,
        level: 'info',
        data: { duration, ...context },
        category: 'performance',
      });
    });
  },
  
  // User action logging
  userAction: (action: string, userId?: string, metadata?: Record<string, unknown>): void => {
    const context: LogContext = {
      userId,
      action,
      component: 'user-interaction',
      metadata,
    };
    logger.info(context, `👤 User action: ${action}`);
  },
  
  // API call logging
  apiCall: (method: string, url: string, duration: number, statusCode: number, context?: LogContext): void => {
    const apiContext: LogContext = {
      ...context,
      action: 'api-call',
      duration,
      metadata: {
        method,
        url,
        statusCode,
        ...context?.metadata,
      },
    };
    
    if (statusCode >= 400) {
      appLogger.error(`🔴 API Error: ${method} ${url}`, apiContext);
    } else {
      appLogger.info(`🌐 API Call: ${method} ${url}`, apiContext);
    }
  },
};

export default appLogger;