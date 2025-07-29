/**
 * Auto-Testing System - Shared Types
 * 
 * Isolated debugging types that don't pollute production code
 */

export interface DebugOperation {
  timestamp: string;
  operation: 'delete' | 'create' | 'edit' | 'duplicate';
  widgetId: string;
  widgetType: string;
  dashboardId: string;
  success: boolean;
  error?: string;
  context: {
    widgetCount: number;
    isLastWidget: boolean;
    renderTime?: number;
    memoryUsage?: number;
    stackTrace?: string;
  };
}

export interface DebugSession {
  sessionId: string;
  startTime: string;
  operations: DebugOperation[];
  errors: DebugError[];
  summary: DebugSummary;
}

export interface DebugError {
  timestamp: string;
  error: string;
  stackTrace: string;
  context: Record<string, any>;
}

export interface DebugSummary {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  successRate: string;
  commonErrors: string[];
  performanceMetrics: {
    averageRenderTime: number;
    memoryTrend: 'increasing' | 'stable' | 'decreasing';
  };
}

export interface ConsoleMessage {
  timestamp: string;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  args: any[];
  stackTrace?: string;
}