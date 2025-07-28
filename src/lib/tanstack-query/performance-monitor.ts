/**
 * TanStack Query Performance Monitor
 * Automatic performance tracking and optimization suggestions
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';

import { devLogger } from '@/lib/development/logger';

interface PerformanceMetrics {
  queryCount: number;
  mutationCount: number;
  cacheSize: number;
  staleCacheRatio: number;
  errorRate: number;
  averageFetchTime: number;
  memoryUsage: number;
  observerCount: number;
}

interface PerformanceIssue {
  type: 'high-cache-usage' | 'frequent-refetches' | 'stale-queries' | 'error-prone-queries' | 'memory-leak';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  queryKeys?: (readonly unknown[])[];
  suggestion: string;
}

interface PerformanceMonitorOptions {
  enabled?: boolean;
  intervalMs?: number;
  maxCacheSize?: number;
  maxStaleRatio?: number;
  maxErrorRate?: number;
  onIssueDetected?: (issue: PerformanceIssue) => void;
  autoOptimize?: boolean;
}

/**
 * Hook for monitoring TanStack Query performance
 */
export function useQueryPerformanceMonitor(options: PerformanceMonitorOptions = {}): {
  metrics: PerformanceMetrics | null;
  issues: PerformanceIssue[];
  startMonitoring: () => void;
  stopMonitoring: () => void;
  optimizeCache: () => void;
  generateReport: () => string;
} {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsRef = useRef<PerformanceMetrics | null>(null);
  const issuesRef = useRef<PerformanceIssue[]>([]);

  const {
    enabled = true,
    intervalMs = 5000,
    maxCacheSize = 50 * 1024 * 1024, // 50MB
    maxStaleRatio = 0.3, // 30%
    maxErrorRate = 0.1, // 10%
    onIssueDetected,
    autoOptimize = false,
  } = options;

  // Collect performance metrics
  const collectMetrics = useCallback((): PerformanceMetrics => {
    const queries = queryClient.getQueryCache().getAll();
    const mutations = queryClient.getMutationCache().getAll();

    // Calculate cache size
    const cacheSize = queries.reduce((total, query) => {
      try {
        return total + new Blob([JSON.stringify(query.state.data || {})]).size;
      } catch {
        return total;
      }
    }, 0);

    // Calculate stale cache ratio
    const staleQueries = queries.filter(q => q.isStale()).length;
    const staleCacheRatio = queries.length > 0 ? staleQueries / queries.length : 0;

    // Calculate error rate
    const errorQueries = queries.filter(q => q.state.status === 'error').length;
    const errorRate = queries.length > 0 ? errorQueries / queries.length : 0;

    // Calculate average fetch time (approximation)
    const totalFetchTime = queries.reduce((total, query) => {
      const lastFetch = query.state.dataUpdatedAt;
      const now = Date.now();
      return total + (lastFetch > 0 ? now - lastFetch : 0);
    }, 0);
    const averageFetchTime = queries.length > 0 ? totalFetchTime / queries.length : 0;

    // Count observers
    const observerCount = queries.reduce((total, query) => total + query.getObserversCount(), 0);

    // Estimate memory usage
    const memoryUsage = cacheSize + (mutations.length * 1024); // Rough estimation

    return {
      queryCount: queries.length,
      mutationCount: mutations.length,
      cacheSize,
      staleCacheRatio,
      errorRate,
      averageFetchTime,
      memoryUsage,
      observerCount,
    };
  }, [queryClient]);

  // Analyze performance issues
  const analyzeIssues = useCallback((metrics: PerformanceMetrics): PerformanceIssue[] => {
    const issues: PerformanceIssue[] = [];
    const queries = queryClient.getQueryCache().getAll();

    // High cache usage
    if (metrics.cacheSize > maxCacheSize) {
      issues.push({
        type: 'high-cache-usage',
        severity: metrics.cacheSize > maxCacheSize * 2 ? 'critical' : 'high',
        message: `Cache size is ${Math.round(metrics.cacheSize / 1024 / 1024)}MB, exceeding ${Math.round(maxCacheSize / 1024 / 1024)}MB limit`,
        suggestion: 'Consider implementing cache garbage collection or reducing staleTime for less critical queries',
      });
    }

    // High stale cache ratio
    if (metrics.staleCacheRatio > maxStaleRatio) {
      const staleQueries = queries.filter(q => q.isStale());
      issues.push({
        type: 'stale-queries',
        severity: metrics.staleCacheRatio > 0.5 ? 'high' : 'medium',
        message: `${Math.round(metrics.staleCacheRatio * 100)}% of queries are stale`,
        queryKeys: staleQueries.map(q => q.queryKey),
        suggestion: 'Consider increasing staleTime for stable data or implementing better cache invalidation',
      });
    }

    // High error rate
    if (metrics.errorRate > maxErrorRate) {
      const errorQueries = queries.filter(q => q.state.status === 'error');
      issues.push({
        type: 'error-prone-queries',
        severity: metrics.errorRate > 0.2 ? 'critical' : 'high',
        message: `${Math.round(metrics.errorRate * 100)}% of queries are failing`,
        queryKeys: errorQueries.map(q => q.queryKey),
        suggestion: 'Review error handling and consider implementing better retry strategies',
      });
    }

    // Frequent refetches (queries with high update count)
    const frequentQueries = queries.filter(q => q.state.dataUpdateCount > 10);
    if (frequentQueries.length > 0) {
      issues.push({
        type: 'frequent-refetches',
        severity: 'medium',
        message: `${frequentQueries.length} queries have been refetched more than 10 times`,
        queryKeys: frequentQueries.map(q => q.queryKey),
        suggestion: 'Consider increasing staleTime or implementing proper dependency management',
      });
    }

    // Memory leak detection (queries with 0 observers but still cached)
    const orphanedQueries = queries.filter(q => q.getObserversCount() === 0 && q.state.dataUpdatedAt > 0);
    if (orphanedQueries.length > queries.length * 0.2) {
      issues.push({
        type: 'memory-leak',
        severity: 'high',
        message: `${orphanedQueries.length} queries are cached but have no active observers`,
        queryKeys: orphanedQueries.map(q => q.queryKey),
        suggestion: 'Consider reducing cacheTime or implementing proper cleanup',
      });
    }

    return issues;
  }, [queryClient, maxCacheSize, maxStaleRatio, maxErrorRate]);

  // Auto-optimization
  const optimizeCache = useCallback((): void => {
    const queries = queryClient.getQueryCache().getAll();
    
    // Remove queries with no observers and old data
    const cutoffTime = Date.now() - (30 * 60 * 1000); // 30 minutes ago
    queries.forEach(query => {
      if (query.getObserversCount() === 0 && query.state.dataUpdatedAt < cutoffTime) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });

    // Clear error queries that are older than 5 minutes
    const errorCutoff = Date.now() - (5 * 60 * 1000);
    queries.forEach(query => {
      if (query.state.status === 'error' && query.state.errorUpdatedAt < errorCutoff) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });

    devLogger.success('Query cache optimized');
  }, [queryClient]);

  // Generate performance report
  const generateReport = (): string => {
    const metrics = metricsRef.current;
    const issues = issuesRef.current;

    if (!metrics) return 'No metrics available';

    const report = `
🚀 TanStack Query Performance Report
=====================================

📊 Cache Metrics:
  - Total Queries: ${metrics.queryCount}
  - Total Mutations: ${metrics.mutationCount}
  - Cache Size: ${Math.round(metrics.cacheSize / 1024)}KB
  - Memory Usage: ${Math.round(metrics.memoryUsage / 1024)}KB
  - Active Observers: ${metrics.observerCount}

⚡ Performance Metrics:
  - Stale Cache Ratio: ${Math.round(metrics.staleCacheRatio * 100)}%
  - Error Rate: ${Math.round(metrics.errorRate * 100)}%
  - Avg Fetch Age: ${Math.round(metrics.averageFetchTime / 1000 / 60)}min

🔍 Issues Detected: ${issues.length}
${issues.map(issue => `
  - ${issue.type.toUpperCase()} (${issue.severity}): ${issue.message}
    💡 ${issue.suggestion}
`).join('')}

${issues.length === 0 ? '✅ No performance issues detected!' : '⚠️  Consider addressing the issues above for better performance.'}
    `.trim();

    return report;
  };

  // Start monitoring
  const startMonitoring = useCallback((): void => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      const metrics = collectMetrics();
      const issues = analyzeIssues(metrics);

      metricsRef.current = metrics;
      issuesRef.current = issues;

      // Notify about new issues
      issues.forEach(issue => {
        if (onIssueDetected) {
          onIssueDetected(issue);
        }
      });

      // Auto-optimize if enabled
      if (autoOptimize && issues.some(i => i.severity === 'high' || i.severity === 'critical')) {
        optimizeCache();
      }

      // Log critical issues in development
      const criticalIssues = issues.filter(i => i.severity === 'critical');
      if (criticalIssues.length > 0) {
        devLogger.error('Critical query performance issues detected', { criticalIssues });
      }
    }, intervalMs);
  }, [intervalMs, collectMetrics, analyzeIssues, onIssueDetected, autoOptimize, optimizeCache]);

  // Stop monitoring
  const stopMonitoring = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto-start monitoring if enabled
  useEffect(() => {
    if (enabled) {
      startMonitoring();
    }

    return (): void => {
      stopMonitoring();
    };
  }, [enabled, startMonitoring, stopMonitoring]);

  return {
    metrics: metricsRef.current,
    issues: issuesRef.current,
    startMonitoring,
    stopMonitoring,
    optimizeCache,
    generateReport,
  };
}

/**
 * Development-only hook for automatic performance monitoring
 */
export function useDevQueryMonitor(options: PerformanceMonitorOptions = {}): void {
  const monitor = useQueryPerformanceMonitor({
    ...options,
    enabled: process.env.NODE_ENV === 'development' && (options.enabled ?? true),
    onIssueDetected: (issue) => {
      devLogger.warn(`Query Performance Issue: ${issue.message}`, {
        type: issue.type,
        severity: issue.severity,
        suggestion: issue.suggestion,
        queryKeys: issue.queryKeys,
      });
      
      if (options.onIssueDetected) {
        options.onIssueDetected(issue);
      }
    },
  });

  // Expose to window for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).queryMonitor = {
        generateReport: monitor.generateReport,
        optimizeCache: monitor.optimizeCache,
        getMetrics: (): typeof monitor.metrics => monitor.metrics,
        getIssues: (): typeof monitor.issues => monitor.issues,
      };
    }
  }, [monitor]);
}