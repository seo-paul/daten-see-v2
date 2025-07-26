/**
 * Development Logger for Sentry Integration
 * Replaces console.log with proper logging that integrates with Sentry
 */

import * as Sentry from '@sentry/nextjs';

interface LogContext {
  component?: string;
  operation?: string;
  eventId?: string;
  level?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Development-only logger that integrates with Sentry
 */
class DevelopmentLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  info(message: string, context: LogContext = {}): void {
    if (!this.isDevelopment) return;

    // Add breadcrumb to Sentry
    Sentry.addBreadcrumb({
      category: 'development',
      message,
      level: 'info',
      data: context,
    });

    // Log to console with structured format
    this.logToConsole('INFO', message, context);
  }

  error(message: string, context: LogContext = {}): void {
    if (!this.isDevelopment) return;

    // Add breadcrumb to Sentry
    Sentry.addBreadcrumb({
      category: 'development',
      message,
      level: 'error',
      data: context,
    });

    this.logToConsole('ERROR', message, context);
  }

  debug(message: string, context: LogContext = {}): void {
    if (!this.isDevelopment) return;

    Sentry.addBreadcrumb({
      category: 'development',
      message,
      level: 'debug',
      data: context,
    });

    this.logToConsole('DEBUG', message, context);
  }

  /**
   * Log error boundary events
   */
  errorBoundary(level: string, error: Error, eventId: string | null, componentStack?: string): void {
    if (!this.isDevelopment) return;

    const message = `Error Boundary: ${level}`;
    const context: LogContext = {
      component: 'error-boundary',
      level,
      eventId: eventId || 'unknown',
      metadata: {
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack,
      },
    };

    this.error(message, context);
  }

  /**
   * Log Sentry initialization events
   */
  sentryInit(runtime: 'client' | 'server' | 'edge', success: boolean): void {
    if (!this.isDevelopment) return;

    const message = `Sentry ${runtime} monitoring ${success ? 'initialized' : 'failed'}`;
    const context: LogContext = {
      component: 'sentry',
      operation: 'initialization',
      metadata: { runtime, success },
    };

    if (success) {
      this.info(message, context);
    } else {
      this.error(message, context);
    }
  }

  private logToConsole(level: string, message: string, context: LogContext): void {
    // Development logger is allowed to use console for debugging output
    /* eslint-disable no-console */
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] ${level}:`;
    
    if (Object.keys(context).length > 0) {
      // Use console.group for structured logging
      console.group(`🔧 ${prefix} ${message}`);
      Object.entries(context).forEach(([key, value]) => {
        console.log(`  ${key}:`, value);
      });
      console.groupEnd();
    } else {
      console.log(`🔧 ${prefix} ${message}`);
    }
    /* eslint-enable no-console */
  }
}

// Singleton instance
export const devLogger = new DevelopmentLogger();

export default devLogger;