/**
 * Error Boundary Hook
 * Enhanced hooks for error boundary management and reporting
 */

import { useCallback, useRef, useState } from 'react';

import { appLogger } from '@/lib/monitoring/logger.config';

interface ErrorBoundaryConfig {
  maxRetries?: number;
  retryDelay?: number;
  enableAutoRetry?: boolean;
  onError?: (error: Error) => void;
  onRetry?: (retryCount: number) => void;
  onMaxRetriesReached?: () => void;
}

interface ErrorBoundaryState {
  errorCount: number;
  lastErrorTime?: number;
  isRecovering: boolean;
}

/**
 * Hook for managing error boundary behavior
 */
export function useErrorBoundary(config: ErrorBoundaryConfig = {}): {
  errorCount: number;
  lastErrorTime?: number;
  isRecovering: boolean;
  reportError: (error: Error, errorInfo?: Record<string, unknown>) => void;
  startRecovery: () => void;
  completeRecovery: () => void;
  resetErrorCount: () => void;
} {
  const [state, setState] = useState<ErrorBoundaryState>({
    errorCount: 0,
    isRecovering: false,
  });
  
  const stateRef = useRef(state);
  stateRef.current = state;

  const reportError = useCallback((error: Error, errorInfo?: Record<string, unknown>) => {
    const { onError } = config;
    
    setState(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1,
      lastErrorTime: Date.now(),
    }));

    appLogger.error('Error boundary error reported', {
      error,
      errorCount: stateRef.current.errorCount + 1,
      ...errorInfo,
    });

    if (onError) {
      onError(error);
    }
  }, [config]);

  const startRecovery = useCallback(() => {
    setState(prev => ({ ...prev, isRecovering: true }));
  }, []);

  const completeRecovery = useCallback(() => {
    setState(prev => ({ ...prev, isRecovering: false }));
  }, []);

  const resetErrorCount = useCallback(() => {
    setState({
      errorCount: 0,
      isRecovering: false,
    });
  }, []);

  return {
    ...state,
    reportError,
    startRecovery,
    completeRecovery,
    resetErrorCount,
  };
}

/**
 * Hook for error boundary analytics and monitoring
 */
export function useErrorBoundaryAnalytics(): {
  analytics: {
    totalErrors: number;
    recoveredErrors: number;
    failedRecoveries: number;
    averageRecoveryTime: number;
  };
  trackError: () => void;
  trackRecovery: (recoveryTime: number) => void;
  trackFailedRecovery: () => void;
} {
  const [analytics, setAnalytics] = useState({
    totalErrors: 0,
    recoveredErrors: 0,
    failedRecoveries: 0,
    averageRecoveryTime: 0,
  });

  const trackError = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      totalErrors: prev.totalErrors + 1,
    }));
  }, []);

  const trackRecovery = useCallback((recoveryTime: number) => {
    setAnalytics(prev => ({
      ...prev,
      recoveredErrors: prev.recoveredErrors + 1,
      averageRecoveryTime: (prev.averageRecoveryTime + recoveryTime) / 2,
    }));
  }, []);

  const trackFailedRecovery = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      failedRecoveries: prev.failedRecoveries + 1,
    }));
  }, []);

  return {
    analytics,
    trackError,
    trackRecovery,
    trackFailedRecovery,
  };
}

/**
 * Hook for creating error boundary configurations
 */
export function useErrorBoundaryConfig(level: 'page' | 'widget' | 'component'): () => ErrorBoundaryConfig {
  return useCallback((): ErrorBoundaryConfig => {
    const baseConfig: ErrorBoundaryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      enableAutoRetry: false,
    };

    switch (level) {
      case 'page':
        return {
          ...baseConfig,
          maxRetries: 2,
          enableAutoRetry: true,
          onError: (error: Error): void => {
            appLogger.error('Page-level error occurred', { error, level });
          },
        };

      case 'widget':
        return {
          ...baseConfig,
          maxRetries: 3,
          enableAutoRetry: true,
          retryDelay: 500,
          onError: (error: Error): void => {
            appLogger.warn('Widget-level error occurred', { error, level });
          },
        };

      case 'component':
        return {
          ...baseConfig,
          maxRetries: 1,
          enableAutoRetry: false,
          onError: (error: Error): void => {
            appLogger.info('Component-level error occurred', { error, level });
          },
        };

      default:
        return baseConfig;
    }
  }, [level]);
}

/**
 * Utility function to check if error is recoverable
 */
export function isRecoverableError(error: Error): boolean {
  const recoverableErrors = [
    'ChunkLoadError',
    'Loading chunk',
    'Network request failed',
    'fetch is not defined',
    'NetworkError',
    'TimeoutError',
    'AbortError',
  ];

  return recoverableErrors.some(errorType => 
    error.name.includes(errorType) || 
    error.message.includes(errorType)
  );
}

/**
 * Utility function to get error severity
 */
export function getErrorSeverity(
  error: Error, 
  level: 'page' | 'widget' | 'component',
  retryCount: number
): 'low' | 'medium' | 'high' | 'critical' {
  // Critical errors that crash entire pages
  if (level === 'page') return 'critical';
  
  // High-priority errors
  if (error.name.includes('TypeError') || error.name.includes('ReferenceError')) {
    return 'high';
  }
  
  // Network-related errors are usually medium severity
  if (isRecoverableError(error)) {
    return retryCount >= 2 ? 'high' : 'medium';
  }
  
  // Component-level errors are usually low-medium severity
  if (level === 'component') {
    return retryCount >= 1 ? 'medium' : 'low';
  }
  
  return 'medium';
}