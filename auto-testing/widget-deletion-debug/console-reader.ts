/**
 * Console Reader - Automatic Browser Console Monitoring
 * 
 * Intercepts and analyzes console messages automatically
 * WITHOUT requiring manual console inspection
 */

import type { ConsoleMessage, DebugOperation, DebugError } from '../shared/types';

export class AutoConsoleReader {
  private messages: ConsoleMessage[] = [];
  private operations: DebugOperation[] = [];
  private errors: DebugError[] = [];
  private originalConsole: Record<string, Function> = {};
  
  constructor() {
    this.interceptConsole();
  }

  /**
   * Intercept all console methods to automatically capture output
   */
  private interceptConsole(): void {
    const consoleMethods = ['log', 'warn', 'error', 'info'] as const;
    
    consoleMethods.forEach(method => {
      this.originalConsole[method] = console[method];
      
      console[method] = (...args: any[]) => {
        // Capture message
        const message: ConsoleMessage = {
          timestamp: new Date().toISOString(),
          level: method,
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '),
          args,
          stackTrace: method === 'error' ? new Error().stack : undefined
        };
        
        this.messages.push(message);
        this.analyzeMessage(message);
        
        // Keep last 100 messages
        if (this.messages.length > 100) {
          this.messages = this.messages.slice(-100);
        }
        
        // Call original console method
        this.originalConsole[method].apply(console, args);
      };
    });
  }

  /**
   * Analyze console messages for widget operations
   */
  private analyzeMessage(message: ConsoleMessage): void {
    const text = message.message.toLowerCase();
    
    // Detect widget deletion operations
    if (text.includes('delete') && text.includes('widget')) {
      this.extractWidgetOperation(message);
    }
    
    // Detect errors
    if (message.level === 'error' || text.includes('error')) {
      this.extractError(message);
    }
  }

  /**
   * Extract widget operation data from console messages
   */
  private extractWidgetOperation(message: ConsoleMessage): void {
    try {
      // Pattern matching for widget operations
      const widgetIdMatch = message.message.match(/widget[:\s]+([^\s,]+)/i);
      const operationMatch = message.message.match(/(delete|create|edit|duplicate)/i);
      
      if (widgetIdMatch && operationMatch) {
        const operation: DebugOperation = {
          timestamp: message.timestamp,
          operation: operationMatch[1].toLowerCase() as any,
          widgetId: widgetIdMatch[1],
          widgetType: 'unknown', // Will be enhanced by component wrapper
          dashboardId: 'dash-1', // Default for testing
          success: !message.message.includes('failed') && !message.message.includes('error'),
          context: {
            widgetCount: 0,
            isLastWidget: false,
            renderTime: this.extractNumber(message.message, /(\d+\.?\d*)\s*ms/),
            memoryUsage: this.extractNumber(message.message, /memory[:\s]+(\d+)/i),
          }
        };
        
        this.operations.push(operation);
      }
    } catch (error) {
      // Silent fail - don't break normal console operation
    }
  }

  /**
   * Extract error information
   */
  private extractError(message: ConsoleMessage): void {
    const error: DebugError = {
      timestamp: message.timestamp,
      error: message.message,
      stackTrace: message.stackTrace || '',
      context: {
        args: message.args,
        level: message.level
      }
    };
    
    this.errors.push(error);
  }

  /**
   * Extract numeric values from text
   */
  private extractNumber(text: string, pattern: RegExp): number | undefined {
    const match = text.match(pattern);
    return match ? parseFloat(match[1]) : undefined;
  }

  /**
   * Get current analysis results
   */
  getAnalysis() {
    const successful = this.operations.filter(op => op.success);
    const failed = this.operations.filter(op => !op.success);
    
    return {
      totalMessages: this.messages.length,
      totalOperations: this.operations.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      successRate: this.operations.length > 0 
        ? `${(successful.length / this.operations.length * 100).toFixed(1)}%`
        : '0%',
      recentOperations: this.operations.slice(-10),
      recentErrors: this.errors.slice(-5),
      commonErrors: this.getCommonErrors()
    };
  }

  /**
   * Analyze common error patterns
   */
  private getCommonErrors(): string[] {
    const errorCounts: Record<string, number> = {};
    
    this.errors.forEach(error => {
      // Normalize error message
      const normalized = error.error.toLowerCase()
        .replace(/widget-\d+/g, 'widget-X')
        .replace(/\d+/g, 'N');
      
      errorCounts[normalized] = (errorCounts[normalized] || 0) + 1;
    });
    
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([error, count]) => `${error} (${count}x)`);
  }

  /**
   * Restore original console methods
   */
  restore(): void {
    Object.keys(this.originalConsole).forEach(method => {
      (console as any)[method] = this.originalConsole[method];
    });
  }

  /**
   * Clear collected data
   */
  clear(): void {
    this.messages = [];
    this.operations = [];
    this.errors = [];
  }
}