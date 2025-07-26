/**
 * Enhanced Sentry Utilities for BI SaaS Platform
 * Advanced error tracking, performance monitoring, and user analytics
 */

import * as Sentry from '@sentry/nextjs';

// Types for enhanced error context
export interface EnhancedErrorContext {
  userId?: string;
  tenantId?: string;
  dashboardId?: string;
  widgetId?: string;
  dataSourceId?: string;
  userAction?: string;
  featureFlag?: string;
  apiEndpoint?: string;
  queryKey?: string;
  componentName?: string;
  errorBoundary?: string;
}

export interface PerformanceMetrics {
  renderTime?: number;
  queryTime?: number;
  bundleSize?: number;
  memoryUsage?: number;
  networkLatency?: number;
  cacheHitRate?: number;
}

export interface BusinessMetrics {
  dashboardsCreated?: number;
  widgetsAdded?: number;
  dataSourcesConnected?: number;
  queriesExecuted?: number;
  usersActive?: number;
  sessionDuration?: number;
}

/**
 * Enhanced error capture with business context
 */
export function captureEnhancedError(
  error: Error,
  context: EnhancedErrorContext = {},
  level: 'fatal' | 'error' | 'warning' | 'info' = 'error'
): string {
  return Sentry.captureException(error, {
    level,
    tags: {
      // Business context tags
      tenantId: context.tenantId || 'unknown',
      feature: context.dashboardId ? 'dashboard' : context.widgetId ? 'widget' : 'general',
      userAction: context.userAction || 'unknown',
      errorSource: context.componentName || context.errorBoundary || 'unknown',
    },
    contexts: {
      business: {
        userId: context.userId,
        tenantId: context.tenantId,
        dashboardId: context.dashboardId,
        widgetId: context.widgetId,
        dataSourceId: context.dataSourceId,
        featureFlag: context.featureFlag,
      },
      technical: {
        apiEndpoint: context.apiEndpoint,
        queryKey: context.queryKey,
        componentName: context.componentName,
        errorBoundary: context.errorBoundary,
        timestamp: new Date().toISOString(),
      },
    },
    extra: {
      // Additional context
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      buildVersion: process.env.npm_package_version || '0.1.0',
    },
  });
}

/**
 * Track business events for analytics
 */
export function trackBusinessEvent(
  eventName: string,
  properties: BusinessMetrics & EnhancedErrorContext = {},
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  Sentry.addBreadcrumb({
    category: 'business',
    message: eventName,
    level,
    data: {
      ...properties,
      timestamp: new Date().toISOString(),
    },
  });

  // Also send as event for analytics
  Sentry.captureMessage(eventName, {
    level,
    tags: {
      category: 'business_analytics',
      tenantId: properties.tenantId || 'unknown',
      userId: properties.userId || 'anonymous',
    },
    contexts: {
      business_metrics: properties as Record<string, unknown>,
    },
  });
}

/**
 * Track performance metrics with business context
 */
export function trackPerformanceMetrics(
  operation: string,
  metrics: PerformanceMetrics,
  context: EnhancedErrorContext = {}
): void {
  // Create performance transaction
  Sentry.startSpan({
    name: `Performance: ${operation}`,
    op: 'performance.measure',
    attributes: {
      // Performance data
      renderTime: metrics.renderTime,
      queryTime: metrics.queryTime,
      memoryUsage: metrics.memoryUsage,
      networkLatency: metrics.networkLatency,
      cacheHitRate: metrics.cacheHitRate,
      
      // Business context
      tenantId: context.tenantId,
      dashboardId: context.dashboardId,
      widgetId: context.widgetId,
      componentName: context.componentName,
    },
  }, () => {
    // Span automatically ends when callback completes
  });

  // Add breadcrumb for context
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${operation} performance tracked`,
    level: 'info',
    data: {
      ...metrics,
      ...context,
    },
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(
  userId: string,
  tenantId: string,
  email?: string,
  role?: string,
  plan?: string
): void {
  Sentry.setUser({
    id: userId,
    ...(email && { email }),
    ...(email && { username: email.split('@')[0] }),
    data: {
      tenantId,
      role,
      plan,
      lastActive: new Date().toISOString(),
    },
  });

  // Set tenant as tag for filtering
  Sentry.setTag('tenantId', tenantId);
  Sentry.setTag('userRole', role || 'unknown');
  Sentry.setTag('userPlan', plan || 'unknown');
}

/**
 * Track dashboard interactions
 */
export function trackDashboardInteraction(
  action: 'create' | 'edit' | 'delete' | 'view' | 'share',
  dashboardId: string,
  context: EnhancedErrorContext = {}
): void {
  const metrics: BusinessMetrics & EnhancedErrorContext = {
    dashboardId,
    ...context,
    ...(action === 'create' && { dashboardsCreated: 1 }),
  };
  trackBusinessEvent(`dashboard.${action}`, metrics);
}

/**
 * Track widget interactions
 */
export function trackWidgetInteraction(
  action: 'add' | 'edit' | 'delete' | 'resize' | 'move',
  widgetId: string,
  widgetType: string,
  context: EnhancedErrorContext = {}
): void {
  const metrics: BusinessMetrics & EnhancedErrorContext = {
    widgetId,
    userAction: `${action}_${widgetType}`,
    ...context,
    ...(action === 'add' && { widgetsAdded: 1 }),
  };
  trackBusinessEvent(`widget.${action}`, metrics);
}

/**
 * Track data source connections
 */
export function trackDataSourceInteraction(
  action: 'connect' | 'disconnect' | 'sync' | 'error',
  dataSourceId: string,
  dataSourceType: string,
  context: EnhancedErrorContext = {}
): void {
  const metrics: BusinessMetrics & EnhancedErrorContext = {
    dataSourceId,
    userAction: `${action}_${dataSourceType}`,
    ...context,
    ...(action === 'connect' && { dataSourcesConnected: 1 }),
  };
  trackBusinessEvent(`datasource.${action}`, metrics);
}

/**
 * Track API query performance
 */
export function trackApiQueryPerformance(
  endpoint: string,
  duration: number,
  success: boolean,
  cacheHit: boolean = false,
  context: EnhancedErrorContext = {}
): void {
  trackPerformanceMetrics('api_query', {
    queryTime: duration,
    networkLatency: duration,
    cacheHitRate: cacheHit ? 100 : 0,
  }, {
    apiEndpoint: endpoint,
    userAction: success ? 'api_success' : 'api_error',
    ...context,
  });

  // Track as business metric
  trackBusinessEvent('api.query', {
    apiEndpoint: endpoint,
    queriesExecuted: 1,
    ...context,
  }, success ? 'info' : 'warning');
}

/**
 * Track component render performance
 */
export function trackComponentRenderPerformance(
  componentName: string,
  renderTime: number,
  context: EnhancedErrorContext = {}
): void {
  trackPerformanceMetrics('component_render', {
    renderTime,
  }, {
    componentName,
    ...context,
  });

  // Warn on slow renders
  if (renderTime > 16) { // > 16ms is slower than 60fps
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Slow render detected: ${componentName} (${renderTime.toFixed(2)}ms)`,
      level: 'warning',
      data: { componentName, renderTime },
    });
  }
}

/**
 * Create error boundary integration
 */
export function createErrorBoundaryHandler(
  boundaryName: string,
  context: EnhancedErrorContext = {}
): (error: Error, errorInfo: { componentStack: string }) => void {
  return (error: Error, errorInfo: { componentStack: string }) => {
    const errorContext: EnhancedErrorContext = {
      ...context,
      errorBoundary: boundaryName,
    };
    const componentName = errorInfo.componentStack.split('\n')[1]?.trim();
    if (componentName) {
      errorContext.componentName = componentName;
    }
    captureEnhancedError(error, errorContext);
  };
}

/**
 * Monitor session duration
 */
let sessionStartTime: number | null = null;

export function startSession(context: EnhancedErrorContext = {}): void {
  sessionStartTime = Date.now();
  
  trackBusinessEvent('session.start', {
    ...context,
    usersActive: 1,
  });
}

export function endSession(context: EnhancedErrorContext = {}): void {
  if (sessionStartTime) {
    const sessionDuration = Date.now() - sessionStartTime;
    
    trackBusinessEvent('session.end', {
      ...context,
      sessionDuration: Math.round(sessionDuration / 1000), // seconds
    });
    
    sessionStartTime = null;
  }
}

/**
 * Feature flag tracking
 */
export function trackFeatureFlag(
  flagName: string,
  value: boolean | string,
  context: EnhancedErrorContext = {}
): void {
  Sentry.setTag(`feature.${flagName}`, value.toString());
  
  trackBusinessEvent('feature.flag', {
    ...context,
    featureFlag: `${flagName}:${value}`,
  });
}

/**
 * A/B Test tracking
 */
export function trackABTest(
  testName: string,
  variant: string,
  context: EnhancedErrorContext = {}
): void {
  Sentry.setTag(`ab.${testName}`, variant);
  
  trackBusinessEvent('ab.test', {
    ...context,
    featureFlag: `${testName}:${variant}`,
  });
}

const sentryEnhanced = {
  captureEnhancedError,
  trackBusinessEvent,
  trackPerformanceMetrics,
  setUserContext,
  trackDashboardInteraction,
  trackWidgetInteraction,
  trackDataSourceInteraction,
  trackApiQueryPerformance,
  trackComponentRenderPerformance,
  createErrorBoundaryHandler,
  startSession,
  endSession,
  trackFeatureFlag,
  trackABTest,
};

export default sentryEnhanced;