/**
 * Report Generator - Automatic Analysis and Reporting
 * 
 * Generates comprehensive reports that Claude can read directly
 * WITHOUT requiring manual interaction
 */

import type { DebugSession, DebugSummary } from '../shared/types';

export class ReportGenerator {
  private sessionId: string;
  private startTime: string;

  constructor() {
    this.sessionId = `debug-session-${Date.now()}`;
    this.startTime = new Date().toISOString();
  }

  /**
   * Generate comprehensive debug report
   */
  generateReport(consoleAnalysis: any, monitorAnalysis: any): DebugSession {
    const report: DebugSession = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      operations: [
        ...consoleAnalysis.recentOperations,
        ...monitorAnalysis.recentOperations
      ],
      errors: consoleAnalysis.recentErrors,
      summary: this.generateSummary(consoleAnalysis, monitorAnalysis)
    };

    return report;
  }

  /**
   * Generate executive summary
   */
  private generateSummary(consoleAnalysis: any, monitorAnalysis: any): DebugSummary {
    const totalOps = consoleAnalysis.totalOperations + monitorAnalysis.totalOperations;
    const successfulOps = consoleAnalysis.successfulOperations + monitorAnalysis.successfulOperations;
    const failedOps = consoleAnalysis.failedOperations + monitorAnalysis.failedOperations;

    return {
      totalOperations: totalOps,
      successfulOperations: successfulOps,
      failedOperations: failedOps,
      successRate: totalOps > 0 ? `${(successfulOps / totalOps * 100).toFixed(1)}%` : '0%',
      commonErrors: [
        ...consoleAnalysis.commonErrors,
        ...this.extractMonitorErrors(monitorAnalysis)
      ],
      performanceMetrics: {
        averageRenderTime: monitorAnalysis.averageRenderTime || 0,
        memoryTrend: this.analyzeMemoryTrend(monitorAnalysis.recentOperations)
      }
    };
  }

  /**
   * Extract error patterns from monitor data
   */
  private extractMonitorErrors(monitorAnalysis: any): string[] {
    const errors: string[] = [];
    
    if (monitorAnalysis.successRate && parseFloat(monitorAnalysis.successRate) < 50) {
      errors.push('Component operation failure rate >50%');
    }
    
    if (monitorAnalysis.averageRenderTime > 100) {
      errors.push(`Slow performance: ${monitorAnalysis.averageRenderTime.toFixed(1)}ms average`);
    }
    
    return errors;
  }

  /**
   * Analyze memory usage trend
   */
  private analyzeMemoryTrend(operations: any[]): 'increasing' | 'stable' | 'decreasing' {
    if (!operations || operations.length < 2) return 'stable';
    
    const memoryValues = operations
      .map(op => op.context?.memoryUsage)
      .filter(Boolean)
      .slice(-5); // Last 5 operations
    
    if (memoryValues.length < 2) return 'stable';
    
    const first = memoryValues[0];
    const last = memoryValues[memoryValues.length - 1];
    const percentChange = ((last - first) / first) * 100;
    
    if (percentChange > 10) return 'increasing';
    if (percentChange < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * Generate automated fix recommendations
   */
  generateRecommendations(summary: DebugSummary): string[] {
    const recommendations: string[] = [];
    
    // Success rate analysis
    if (parseFloat(summary.successRate) < 30) {
      recommendations.push('🚨 CRITICAL: <30% success rate - fundamental issue in widget deletion logic');
    } else if (parseFloat(summary.successRate) < 70) {
      recommendations.push('⚠️ WARNING: <70% success rate - intermittent issues detected');
    }
    
    // Error pattern analysis
    summary.commonErrors.forEach(error => {
      if (error.includes('race')) {
        recommendations.push('🔄 Fix race condition in useEffect dependencies');
      }
      if (error.includes('not found') || error.includes('undefined')) {
        recommendations.push('🔍 Fix state synchronization - widget not found in store');
      }
      if (error.includes('reappeared')) {
        recommendations.push('🔄 Fix re-initialization logic - prevent widget resurrection');
      }
    });
    
    // Performance analysis
    if (summary.performanceMetrics.averageRenderTime > 100) {
      recommendations.push('⚡ Optimize render performance - average >100ms');
    }
    
    if (summary.performanceMetrics.memoryTrend === 'increasing') {
      recommendations.push('🧠 Memory leak detected - investigate component cleanup');
    }
    
    // Default recommendations if no specific issues found
    if (recommendations.length === 0 && parseFloat(summary.successRate) < 100) {
      recommendations.push('🔍 Review console logs for specific error patterns');
      recommendations.push('🧪 Test widget deletion in different scenarios');
    }
    
    return recommendations;
  }

  /**
   * Generate markdown report for easy reading
   */
  generateMarkdownReport(session: DebugSession): string {
    const recommendations = this.generateRecommendations(session.summary);
    
    return `# Widget Deletion Debug Report

## Session Information
- **Session ID**: ${session.sessionId}
- **Start Time**: ${session.startTime}
- **Duration**: ${((Date.now() - new Date(session.startTime).getTime()) / 1000).toFixed(1)}s

## Summary
- **Total Operations**: ${session.summary.totalOperations}
- **Success Rate**: ${session.summary.successRate}
- **Failed Operations**: ${session.summary.failedOperations}
- **Average Render Time**: ${session.summary.performanceMetrics.averageRenderTime.toFixed(1)}ms
- **Memory Trend**: ${session.summary.performanceMetrics.memoryTrend}

## Common Errors
${session.summary.commonErrors.map(error => `- ${error}`).join('\n')}

## Recent Operations
${session.operations.slice(-5).map(op => 
  `- **${op.operation.toUpperCase()}** ${op.widgetId} (${op.widgetType}) - ${op.success ? '✅ Success' : '❌ Failed'}`
).join('\n')}

## Automated Recommendations
${recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps
1. Review the identified issues above
2. Implement recommended fixes
3. Re-run the test to verify improvements
4. Clean up auto-testing system when complete

---
*Generated automatically by Auto-Testing System*
*Time: ${new Date().toISOString()}*
`;
  }

  /**
   * Save report to localStorage for persistence
   */
  saveReport(session: DebugSession): void {
    try {
      const reportKey = `auto-testing-report-${this.sessionId}`;
      localStorage.setItem(reportKey, JSON.stringify(session));
      
      // Also save as markdown
      const markdownReport = this.generateMarkdownReport(session);
      localStorage.setItem(`${reportKey}-markdown`, markdownReport);
      
      console.log(`📄 Report saved to localStorage: ${reportKey}`);
    } catch (error) {
      console.warn('Failed to save report to localStorage:', error);
    }
  }

  /**
   * Export report as downloadable file
   */
  exportReport(session: DebugSession, format: 'json' | 'markdown' = 'json'): void {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'markdown') {
        content = this.generateMarkdownReport(session);
        filename = `widget-debug-report-${this.sessionId}.md`;
        mimeType = 'text/markdown';
      } else {
        content = JSON.stringify(session, null, 2);
        filename = `widget-debug-report-${this.sessionId}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`📥 Report exported: ${filename}`);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  }
}