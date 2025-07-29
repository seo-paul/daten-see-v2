/**
 * Auto-Testing System Initializer
 * 
 * Main entry point for isolated widget debugging
 * ZERO modifications to production code required
 */

import { ComponentMonitor } from './component-monitor';
import { ReportGenerator } from './report-generator';

class AutoTestingSystem {
  private monitor: ComponentMonitor;
  private reportGenerator: ReportGenerator;
  private isActive: boolean = false;

  constructor() {
    this.monitor = new ComponentMonitor();
    this.reportGenerator = new ReportGenerator();
  }

  /**
   * Initialize the auto-testing system
   */
  init(): void {
    if (this.isActive) {
      console.warn('🚨 Auto-testing system already active');
      return;
    }

    this.isActive = true;
    
    console.log('🚀 AUTO-TESTING SYSTEM INITIALIZING...');
    console.log('📊 Monitoring widget deletion operations');
    console.log('🔍 Console interception active');
    console.log('🎯 Component wrapping ready');
    
    // Setup global utilities
    this.setupGlobalUtils();
    
    // Wrap existing React components (if any are already rendered)
    this.wrapExistingComponents();
    
    console.log('✅ AUTO-TESTING SYSTEM READY');
    console.log('');
    console.log('🧪 USAGE:');
    console.log('  - window.autoTesting.getAnalysis() - Get current analysis');
    console.log('  - window.autoTesting.generateReport() - Create detailed report');
    console.log('  - window.autoTesting.exportReport() - Download report');
    console.log('  - window.autoTesting.clearData() - Reset monitoring data');
    console.log('  - window.autoTesting.destroy() - Cleanup system');
    console.log('');
  }

  /**
   * Setup global debugging utilities
   */
  private setupGlobalUtils(): void {
    (window as any).autoTesting = {
      ...((window as any).autoTesting || {}),
      
      generateReport: () => {
        const analysis = (window as any).autoTesting.getAnalysis();
        const session = this.reportGenerator.generateReport(
          analysis.console,
          analysis.monitor
        );
        
        this.reportGenerator.saveReport(session);
        console.log('📄 Detailed report generated and saved');
        return session;
      },
      
      exportReport: (format: 'json' | 'markdown' = 'markdown') => {
        const session = (window as any).autoTesting.generateReport();
        this.reportGenerator.exportReport(session, format);
      },
      
      getRecommendations: () => {
        const session = (window as any).autoTesting.generateReport();
        return this.reportGenerator.generateRecommendations(session.summary);
      },
      
      wrapComponent: <T extends Record<string, any>>(props: T, componentName: string) => {
        return this.monitor.wrapComponentProps(props, componentName);
      },
      
      destroy: () => {
        this.destroy();
      },
      
      // Debugging utilities
      simulateError: (widgetId: string) => {
        console.error(`🧪 SIMULATED ERROR: Widget ${widgetId} deletion failed`, {
          widgetId,
          error: 'Simulated race condition',
          timestamp: new Date().toISOString()
        });
      },
      
      simulateSuccess: (widgetId: string) => {
        console.log(`🧪 SIMULATED SUCCESS: Widget ${widgetId} deleted successfully`, {
          widgetId,
          renderTime: Math.random() * 50 + 10, // 10-60ms
          timestamp: new Date().toISOString()
        });
      },
      
      // Quick test scenarios
      runQuickTest: () => {
        console.log('🧪 Running quick test scenarios...');
        
        // Simulate various scenarios
        (window as any).autoTesting.simulateSuccess('test-widget-1');
        setTimeout(() => (window as any).autoTesting.simulateError('test-widget-2'), 100);
        setTimeout(() => (window as any).autoTesting.simulateSuccess('test-widget-3'), 200);
        
        setTimeout(() => {
          const analysis = (window as any).autoTesting.getAnalysis();
          console.log('🎯 Quick test results:', analysis.combined);
        }, 500);
      }
    };
  }

  /**
   * Attempt to wrap existing components
   */
  private wrapExistingComponents(): void {
    // This is a placeholder - in a real scenario, we might need to
    // monkey-patch React components or use React DevTools hooks
    console.log('🔧 Component wrapping setup complete');
    console.log('💡 Use autoTesting.wrapComponent(props, name) to wrap components manually');
  }

  /**
   * Cleanup and destroy the system
   */
  destroy(): void {
    if (!this.isActive) return;
    
    this.monitor.destroy();
    delete (window as any).autoTesting;
    this.isActive = false;
    
    console.log('🧹 AUTO-TESTING SYSTEM DESTROYED');
    console.log('✅ All monitoring stopped');
    console.log('🧽 Global utilities removed');
  }
}

// Auto-initialize if in development environment
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    const autoTesting = new AutoTestingSystem();
    autoTesting.init();
    
    // Store instance for manual control
    (window as any).autoTestingSystem = autoTesting;
  }, 1000);
}

export { AutoTestingSystem };