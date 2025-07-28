/**
 * Development Logger
 * Production-safe logging for development tools and debugging
 * Eliminates need for ESLint console disables
 */

/* eslint-disable no-console */
// This file is specifically for development logging and console usage is intentional

interface LogData {
  [key: string]: unknown;
}

interface PerformanceData {
  duration?: number;
  metrics?: Record<string, number>;
  queries?: unknown[];
  issues?: unknown[];
}

class DevelopmentLogger {
  private readonly isEnabled: boolean;
  private readonly prefix: string;

  constructor(prefix = 'DevTools') {
    this.isEnabled = process.env.NODE_ENV === 'development';
    this.prefix = prefix;
  }

  /**
   * Standard development log
   */
  log(message: string, data?: LogData): void {
    if (!this.isEnabled) return;
    
    if (data) {
      console.log(`🔍 [${this.prefix}] ${message}`, data);
    } else {
      console.log(`🔍 [${this.prefix}] ${message}`);
    }
  }

  /**
   * Warning for development issues
   */
  warn(message: string, data?: LogData): void {
    if (!this.isEnabled) return;
    
    if (data) {
      console.warn(`⚠️ [${this.prefix}] ${message}`, data);
    } else {
      console.warn(`⚠️ [${this.prefix}] ${message}`);
    }
  }

  /**
   * Error logging for development
   */
  error(message: string, error?: Error | LogData): void {
    if (!this.isEnabled) return;
    
    if (error instanceof Error) {
      console.error(`❌ [${this.prefix}] ${message}`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else if (error) {
      console.error(`❌ [${this.prefix}] ${message}`, error);
    } else {
      console.error(`❌ [${this.prefix}] ${message}`);
    }
  }

  /**
   * Performance monitoring logs
   */
  performance(label: string, data: PerformanceData): void {
    if (!this.isEnabled) return;
    
    console.group(`⚡ [${this.prefix}] Performance: ${label}`);
    
    if (data.duration) {
      console.log(`  Duration: ${data.duration}ms`);
    }
    
    if (data.metrics) {
      console.log('  Metrics:', data.metrics);
    }
    
    if (data.queries) {
      console.log(`  Queries: ${data.queries.length} items`);
    }
    
    if (data.issues && data.issues.length > 0) {
      console.warn(`  Issues: ${data.issues.length} detected`, data.issues);
    }
    
    console.groupEnd();
  }

  /**
   * Network operation logging
   */
  network(operation: string, details: LogData): void {
    if (!this.isEnabled) return;
    
    console.log(`🌐 [${this.prefix}] ${operation}`, details);
  }

  /**
   * Cache operation logging
   */
  cache(operation: string, details: LogData): void {
    if (!this.isEnabled) return;
    
    console.log(`💾 [${this.prefix}] Cache ${operation}`, details);
  }

  /**
   * Query operation logging
   */
  query(operation: string, queryKey: unknown[], details?: LogData): void {
    if (!this.isEnabled) return;
    
    console.log(`🔍 [${this.prefix}] Query ${operation}`, {
      queryKey,
      ...details,
    });
  }

  /**
   * Success operation logging
   */
  success(message: string, data?: LogData): void {
    if (!this.isEnabled) return;
    
    if (data) {
      console.log(`✅ [${this.prefix}] ${message}`, data);
    } else {
      console.log(`✅ [${this.prefix}] ${message}`);
    }
  }

  /**
   * Debug group for complex operations
   */
  group(label: string, fn: () => void): void {
    if (!this.isEnabled) return;
    
    console.group(`📋 [${this.prefix}] ${label}`);
    try {
      fn();
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Table display for structured data
   */
  table(label: string, data: Record<string, unknown>[] | Record<string, unknown>): void {
    if (!this.isEnabled) return;
    
    console.log(`📊 [${this.prefix}] ${label}`);
    console.table(data);
  }
}

// Pre-configured loggers for different areas
export const devLogger = new DevelopmentLogger('DevTools');
export const queryLogger = new DevelopmentLogger('QueryDebug');
export const performanceLogger = new DevelopmentLogger('Performance');
export const cacheLogger = new DevelopmentLogger('Cache');

// Generic logger factory
export const createDevLogger = (prefix: string): DevelopmentLogger => {
  return new DevelopmentLogger(prefix);
};

// Utility functions for common patterns
export const logQueryOperation = (
  operation: string, 
  queryKey: unknown[], 
  data?: LogData
): void => {
  queryLogger.query(operation, queryKey, data);
};

export const logPerformanceIssue = (
  issue: string, 
  severity: 'low' | 'medium' | 'high' | 'critical',
  details?: LogData
): void => {
  const logger = severity === 'critical' || severity === 'high' 
    ? performanceLogger.error 
    : performanceLogger.warn;
    
  logger(`${severity.toUpperCase()}: ${issue}`, details);
};

export const logCacheOperation = (
  operation: 'hit' | 'miss' | 'invalidate' | 'clear' | 'optimize',
  details: LogData
): void => {
  cacheLogger.cache(operation, details);
};

/**
 * Development-only assert function
 * Throws in development, no-op in production
 */
export const devAssert = (condition: boolean, message: string): void => {
  if (process.env.NODE_ENV === 'development' && !condition) {
    throw new Error(`DevAssert: ${message}`);
  }
};

/**
 * Development-only time measurement
 */
export const devTime = (label: string): (() => void) => {
  if (process.env.NODE_ENV !== 'development') {
    return () => {}; // No-op in production
  }
  
  const start = performance.now();
  console.time(`⏱️ [DevTools] ${label}`);
  
  return (): void => {
    const duration = performance.now() - start;
    console.timeEnd(`⏱️ [DevTools] ${label}`);
    
    if (duration > 100) { // Log slow operations
      performanceLogger.warn(`Slow operation detected: ${label}`, { duration });
    }
  };
};