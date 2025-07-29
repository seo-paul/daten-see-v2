/**
 * Component Monitor - Production Component Wrapper
 * 
 * Wraps production components to monitor behavior WITHOUT modifying them
 * Uses Proxy pattern to intercept function calls
 */

import type { DebugOperation } from '../shared/types';
import { AutoConsoleReader } from './console-reader';

export class ComponentMonitor {
  private consoleReader: AutoConsoleReader;
  private operations: DebugOperation[] = [];
  private startTime: number;
  
  constructor() {
    this.consoleReader = new AutoConsoleReader();
    this.startTime = Date.now();
    this.setupGlobalDebugUtils();
  }

  /**
   * Wrap any function to monitor its execution
   */
  wrapFunction<T extends Function>(fn: T, context: {
    name: string;
    operation?: 'delete' | 'create' | 'edit' | 'duplicate';
    widgetId?: string;
    widgetType?: string;
  }): T {
    const monitor = this;
    
    return (function(...args: any[]) {
      const startTime = performance.now();
      
      console.log(`🔍 AUTO-MONITOR: ${context.name} called`, {
        args: args.length,
        timestamp: new Date().toISOString(),
        widgetId: context.widgetId
      });
      
      try {
        const result = fn.apply(this, args);
        const duration = performance.now() - startTime;
        
        // Log successful operation
        if (context.operation && context.widgetId) {
          monitor.logOperation({
            timestamp: new Date().toISOString(),
            operation: context.operation,
            widgetId: context.widgetId,
            widgetType: context.widgetType || 'unknown',
            dashboardId: 'dash-1',
            success: true,
            context: {
              widgetCount: 0, // Will be enhanced
              isLastWidget: false,
              renderTime: duration,
              memoryUsage: (performance as any).memory?.usedJSHeapSize,
            }
          });
        }
        
        console.log(`✅ AUTO-MONITOR: ${context.name} completed in ${duration.toFixed(2)}ms`);
        
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        // Log failed operation
        if (context.operation && context.widgetId) {
          monitor.logOperation({
            timestamp: new Date().toISOString(),
            operation: context.operation,
            widgetId: context.widgetId,
            widgetType: context.widgetType || 'unknown',
            dashboardId: 'dash-1',
            success: false,
            error: (error as Error).message,
            context: {
              widgetCount: 0,
              isLastWidget: false,
              renderTime: duration,
              memoryUsage: (performance as any).memory?.usedJSHeapSize,
              stackTrace: (error as Error).stack,
            }
          });
        }
        
        console.error(`❌ AUTO-MONITOR: ${context.name} failed after ${duration.toFixed(2)}ms`, error);
        throw error;
      }
    }) as unknown as T;
  }

  /**
   * Monitor React component props for function calls
   */
  wrapComponentProps<T extends Record<string, any>>(props: T, componentName: string): T {
    const wrappedProps = { ...props };
    
    // Wrap function props
    Object.keys(props).forEach(key => {
      if (typeof props[key] === 'function' && key.startsWith('on')) {
        const operation = this.extractOperationFromPropName(key);
        
        wrappedProps[key] = this.wrapFunction(props[key], {
          name: `${componentName}.${key}`,
          operation,
          widgetId: this.extractWidgetId(props),
          widgetType: this.extractWidgetType(props),
        });
      }
    });
    
    return wrappedProps;
  }

  /**
   * Extract operation type from prop name
   */
  private extractOperationFromPropName(propName: string): DebugOperation['operation'] | undefined {
    if (propName.includes('Delete')) return 'delete';
    if (propName.includes('Create') || propName.includes('Add')) return 'create';
    if (propName.includes('Edit')) return 'edit';
    if (propName.includes('Duplicate')) return 'duplicate';
    return undefined;
  }

  /**
   * Extract widget ID from props
   */
  private extractWidgetId(props: any): string | undefined {
    return props.widget?.id || props.widgetId || props.id;
  }

  /**
   * Extract widget type from props
   */
  private extractWidgetType(props: any): string | undefined {
    return props.widget?.type || props.widgetType || props.type;
  }

  /**
   * Log operation for analysis
   */
  private logOperation(operation: DebugOperation): void {
    this.operations.push(operation);
    
    // Keep last 50 operations
    if (this.operations.length > 50) {
      this.operations = this.operations.slice(-50);
    }
  }

  /**
   * Setup global debugging utilities
   */
  private setupGlobalDebugUtils(): void {
    (window as any).autoTesting = {
      getAnalysis: () => {
        const consoleAnalysis = this.consoleReader.getAnalysis();
        const monitorAnalysis = this.getMonitorAnalysis();
        
        return {
          sessionDuration: `${((Date.now() - this.startTime) / 1000).toFixed(1)}s`,
          console: consoleAnalysis,
          monitor: monitorAnalysis,
          combined: this.getCombinedAnalysis(consoleAnalysis, monitorAnalysis)
        };
      },
      
      clearData: () => {
        this.consoleReader.clear();
        this.operations = [];
        console.log('🧹 AUTO-TESTING: All monitoring data cleared');
      },
      
      getCurrentOperations: () => this.operations,
      
      simulateWidgetDeletion: (widgetId: string) => {
        console.log('🧪 SIMULATION: Widget deletion started', widgetId);
        setTimeout(() => {
          console.log('✅ SIMULATION: Widget deletion completed', widgetId);
        }, 100);
      },
      
      exportReport: () => {
        const analysis = (window as any).autoTesting.getAnalysis();
        const blob = new Blob([JSON.stringify(analysis, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `widget-debug-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    };
    
    console.log('🚀 AUTO-TESTING: Monitoring system active');
    console.log('📊 Use window.autoTesting.getAnalysis() for real-time analysis');
  }

  /**
   * Get monitor-specific analysis
   */
  private getMonitorAnalysis() {
    const successful = this.operations.filter(op => op.success);
    const failed = this.operations.filter(op => !op.success);
    
    return {
      totalOperations: this.operations.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      successRate: this.operations.length > 0 
        ? `${(successful.length / this.operations.length * 100).toFixed(1)}%`
        : '0%',
      averageRenderTime: successful.length > 0
        ? successful.reduce((sum, op) => sum + (op.context.renderTime || 0), 0) / successful.length
        : 0,
      recentOperations: this.operations.slice(-5)
    };
  }

  /**
   * Combine console and monitor analysis
   */
  private getCombinedAnalysis(consoleAnalysis: any, monitorAnalysis: any) {
    return {
      totalSources: 2,
      overallSuccessRate: this.calculateOverallSuccessRate(consoleAnalysis, monitorAnalysis),
      criticalIssues: this.identifyCriticalIssues(consoleAnalysis, monitorAnalysis),
      recommendations: this.generateRecommendations(consoleAnalysis, monitorAnalysis)
    };
  }

  /**
   * Calculate overall success rate from multiple sources
   */
  private calculateOverallSuccessRate(consoleAnalysis: any, monitorAnalysis: any): string {
    const totalOps = consoleAnalysis.totalOperations + monitorAnalysis.totalOperations;
    const totalSuccess = consoleAnalysis.successfulOperations + monitorAnalysis.successfulOperations;
    
    return totalOps > 0 ? `${(totalSuccess / totalOps * 100).toFixed(1)}%` : '0%';
  }

  /**
   * Identify critical issues
   */
  private identifyCriticalIssues(consoleAnalysis: any, monitorAnalysis: any): string[] {
    const issues: string[] = [];
    
    if (parseFloat(consoleAnalysis.successRate) < 50) {
      issues.push('Console operations have <50% success rate');
    }
    
    if (parseFloat(monitorAnalysis.successRate) < 50) {
      issues.push('Component operations have <50% success rate');
    }
    
    if (consoleAnalysis.recentErrors.length > 3) {
      issues.push('High error frequency detected');
    }
    
    return issues;
  }

  /**
   * Generate automated recommendations
   */
  private generateRecommendations(consoleAnalysis: any, monitorAnalysis: any): string[] {
    const recommendations: string[] = [];
    
    if (consoleAnalysis.commonErrors.some((err: string) => err.includes('race'))) {
      recommendations.push('Race condition detected - review useEffect dependencies');
    }
    
    if (monitorAnalysis.averageRenderTime > 100) {
      recommendations.push('Slow render times - optimize component performance');
    }
    
    if (consoleAnalysis.commonErrors.some((err: string) => err.includes('not found'))) {
      recommendations.push('State synchronization issue - check store updates');
    }
    
    return recommendations;
  }

  /**
   * Cleanup monitoring
   */
  destroy(): void {
    this.consoleReader.restore();
    delete (window as any).autoTesting;
    console.log('🧹 AUTO-TESTING: Monitoring system deactivated');
  }
}