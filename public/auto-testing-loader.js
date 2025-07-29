/**
 * Auto-Testing System Loader
 * Loads the debugging system in the browser automatically
 */

// Check if we're in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  
  // Auto-Testing System Implementation (Inline for Direct Loading)
  class AutoTestingSystem {
    constructor() {
      this.consoleMessages = [];
      this.operations = [];
      this.errors = [];
      this.originalConsole = {};
      this.startTime = Date.now();
      this.sessionId = `debug-session-${Date.now()}`;
    }

    init() {
      console.log('🚀 AUTO-TESTING SYSTEM INITIALIZING...');
      this.interceptConsole();
      this.setupGlobalUtils();
      console.log('✅ AUTO-TESTING SYSTEM READY');
      console.log('🧪 Use window.autoTesting.getAnalysis() to see current analysis');
      console.log('📊 Use window.autoTesting.testWidgetDeletion() to run test scenarios');
    }

    interceptConsole() {
      const methods = ['log', 'warn', 'error', 'info'];
      
      methods.forEach(method => {
        this.originalConsole[method] = console[method];
        
        console[method] = (...args) => {
          // Capture message
          const message = {
            timestamp: new Date().toISOString(),
            level: method,
            message: args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '),
            args
          };
          
          this.consoleMessages.push(message);
          this.analyzeMessage(message);
          
          // Keep last 100 messages
          if (this.consoleMessages.length > 100) {
            this.consoleMessages = this.consoleMessages.slice(-100);
          }
          
          // Call original console method
          this.originalConsole[method].apply(console, args);
        };
      });
    }

    analyzeMessage(message) {
      const text = message.message.toLowerCase();
      
      // Detect widget operations
      if (text.includes('widget') && (text.includes('delete') || text.includes('filter') || text.includes('remove'))) {
        this.extractWidgetOperation(message);
      }
      
      // Detect errors
      if (message.level === 'error' || text.includes('error') || text.includes('failed')) {
        this.extractError(message);
      }
    }

    extractWidgetOperation(message) {
      try {
        const text = message.message;
        const widgetIdMatch = text.match(/widget[:\s-]+([^\s,\)]+)/i);
        const operationMatch = text.match(/(delete|create|edit|duplicate|filter|remove)/i);
        
        if (widgetIdMatch && operationMatch) {
          const operation = {
            timestamp: message.timestamp,
            operation: operationMatch[1].toLowerCase(),
            widgetId: widgetIdMatch[1],
            success: !text.includes('failed') && !text.includes('error'),
            message: text,
            level: message.level
          };
          
          this.operations.push(operation);
          
          // Keep last 50 operations
          if (this.operations.length > 50) {
            this.operations = this.operations.slice(-50);
          }
        }
      } catch (error) {
        // Silent fail
      }
    }

    extractError(message) {
      const error = {
        timestamp: message.timestamp,
        error: message.message,
        level: message.level,
        context: { args: message.args }
      };
      
      this.errors.push(error);
      
      // Keep last 20 errors
      if (this.errors.length > 20) {
        this.errors = this.errors.slice(-20);
      }
    }

    setupGlobalUtils() {
      window.autoTesting = {
        getAnalysis: () => {
          const successful = this.operations.filter(op => op.success);
          const failed = this.operations.filter(op => !op.success);
          
          return {
            sessionId: this.sessionId,
            sessionDuration: `${((Date.now() - this.startTime) / 1000).toFixed(1)}s`,
            
            operations: {
              total: this.operations.length,
              successful: successful.length,
              failed: failed.length,
              successRate: this.operations.length > 0 
                ? `${(successful.length / this.operations.length * 100).toFixed(1)}%`
                : '0%',
              recent: this.operations.slice(-10)
            },
            
            console: {
              totalMessages: this.consoleMessages.length,
              recentMessages: this.consoleMessages.slice(-10),
              errorMessages: this.consoleMessages.filter(m => m.level === 'error').slice(-5)
            },
            
            errors: {
              total: this.errors.length,
              recent: this.errors.slice(-5),
              commonPatterns: this.getCommonErrorPatterns()
            },
            
            recommendations: this.generateRecommendations()
          };
        },

        testWidgetDeletion: () => {
          console.log('🧪 TESTING: Starting widget deletion test...');
          
          // Check if we're on dashboard page
          if (!window.location.pathname.includes('/dashboard/')) {
            console.warn('⚠️ Not on dashboard page. Please navigate to /dashboard/dash-1');
            return;
          }
          
          // Look for delete buttons
          const deleteButtons = document.querySelectorAll('.delete-widget-btn, [title*="löschen"], [aria-label*="löschen"]');
          console.log(`🔍 Found ${deleteButtons.length} delete buttons`);
          
          if (deleteButtons.length === 0) {
            console.warn('⚠️ No delete buttons found. Make sure edit mode is active.');
            return;
          }
          
          // Simulate clicking first delete button
          const firstButton = deleteButtons[0];
          console.log('🎯 Clicking first delete button...');
          
          // Get widget info before deletion
          const widgetContainer = firstButton.closest('.widget-container, [class*="widget"]');
          const widgetId = widgetContainer ? widgetContainer.querySelector('[class*="widget"]')?.id || 'unknown' : 'unknown';
          
          console.log(`🗑️ Attempting to delete widget: ${widgetId}`);
          
          // Track before state
          const beforeCount = document.querySelectorAll('.widget-container, [class*="widget"]').length;
          console.log(`📊 Widget count before deletion: ${beforeCount}`);
          
          // Click the button
          firstButton.click();
          
          // Check after state with delay
          setTimeout(() => {
            const afterCount = document.querySelectorAll('.widget-container, [class*="widget"]').length;
            console.log(`📊 Widget count after deletion: ${afterCount}`);
            
            if (afterCount < beforeCount) {
              console.log('✅ Widget deletion appears successful');
            } else {
              console.error('❌ Widget deletion failed - count unchanged');
            }
            
            // Generate analysis
            console.log('📋 Analysis:', this.getAnalysis());
          }, 1000);
        },

        clearData: () => {
          this.consoleMessages = [];
          this.operations = [];
          this.errors = [];
          console.log('🧹 Auto-testing data cleared');
        },

        exportReport: () => {
          const analysis = this.getAnalysis();
          const blob = new Blob([JSON.stringify(analysis, null, 2)], {
            type: 'application/json'
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `widget-debug-report-${this.sessionId}.json`;
          a.click();
          URL.revokeObjectURL(url);
          console.log('📥 Report exported');
        },

        debugClickEvents: () => {
          console.log('🔍 DEBUGGING: Analyzing click event handlers...');
          
          // Find all delete buttons
          const deleteButtons = document.querySelectorAll('.delete-widget-btn, [title*="löschen"], [aria-label*="löschen"]');
          console.log(`Found ${deleteButtons.length} delete buttons`);
          
          deleteButtons.forEach((button, index) => {
            const style = window.getComputedStyle(button);
            const rect = button.getBoundingClientRect();
            
            console.log(`🔍 Button ${index + 1}:`);
            console.log(`  - Tag: ${button.tagName}`);
            console.log(`  - Class: ${button.className}`);
            console.log(`  - Title: ${button.title}`);
            console.log(`  - onClick Handler: ${button.onclick ? '✅ EXISTS' : '❌ MISSING'}`);
            console.log(`  - Disabled: ${button.disabled}`);
            console.log(`  - CSS pointer-events: ${style.pointerEvents}`);
            console.log(`  - CSS display: ${style.display}`);
            console.log(`  - CSS visibility: ${style.visibility}`);
            console.log(`  - CSS z-index: ${style.zIndex}`);
            console.log(`  - Position: x=${rect.x}, y=${rect.y}, width=${rect.width}, height=${rect.height}`);
            console.log(`  - Parent: ${button.parentElement?.className}`);
            console.log(`  - HTML: ${button.innerHTML}`);
            console.log('---');
            
            // Add manual click listener for debugging
            button.addEventListener('click', (e) => {
              const clickTime = Date.now();
              console.log('🎯 MANUAL CLICK DETECTED on button', index + 1, {
                type: e.type,
                bubbles: e.bubbles,
                cancelable: e.cancelable,
                defaultPrevented: e.defaultPrevented,
                targetTagName: e.target?.tagName,
                targetClassName: e.target?.className,
                currentTargetTagName: e.currentTarget?.tagName,
                timestamp: clickTime
              });
              
              // Track widget count before and after
              const widgetsBefore = document.querySelectorAll('.widget-container, [class*="widget"]').length;
              console.log(`📊 BEFORE CLICK: ${widgetsBefore} widgets`);
              
              // Check widget count after short delays to track the deletion
              setTimeout(() => {
                const widgets100ms = document.querySelectorAll('.widget-container, [class*="widget"]').length;
                console.log(`📊 AFTER 100ms: ${widgets100ms} widgets (${widgets100ms < widgetsBefore ? '✅ DELETED' : '❌ NOT DELETED'})`);
              }, 100);
              
              setTimeout(() => {
                const widgets500ms = document.querySelectorAll('.widget-container, [class*="widget"]').length;
                console.log(`📊 AFTER 500ms: ${widgets500ms} widgets (${widgets500ms < widgetsBefore ? '✅ DELETED' : '❌ NOT DELETED'})`);
              }, 500);
              
              setTimeout(() => {
                const widgets1000ms = document.querySelectorAll('.widget-container, [class*="widget"]').length;
                console.log(`📊 AFTER 1000ms: ${widgets1000ms} widgets (${widgets1000ms < widgetsBefore ? '✅ DELETED' : '❌ NOT DELETED'})`);
                console.log('---');
              }, 1000);
              
            }, { capture: true, passive: false });
          });
          
          // Check for overlays
          const overlays = document.querySelectorAll('[class*="overlay"], [class*="modal"], [style*="z-index"]');
          console.log(`Found ${overlays.length} potential overlay elements`);
          
          return {
            deleteButtons: deleteButtons.length,
            overlays: overlays.length,
            editMode: document.querySelector('[class*="edit-mode"]') ? true : false
          };
        },

        inspectWidget: (widgetId) => {
          console.log(`🔍 INSPECTING WIDGET: ${widgetId}`);
          
          const widgetElement = document.querySelector(`[id="${widgetId}"], [class*="${widgetId}"]`);
          if (!widgetElement) {
            console.warn(`Widget ${widgetId} not found in DOM`);
            return;
          }
          
          const deleteButton = widgetElement.querySelector('.delete-widget-btn, [title*="löschen"]');
          console.log('Delete button:', {
            exists: !!deleteButton,
            tagName: deleteButton?.tagName,
            className: deleteButton?.className,
            onClick: deleteButton?.onclick ? 'Handler exists' : 'No handler',
            visible: deleteButton ? window.getComputedStyle(deleteButton).display !== 'none' : false,
            clickable: deleteButton ? window.getComputedStyle(deleteButton).pointerEvents !== 'none' : false
          });
        }
      };
    }

    getCommonErrorPatterns() {
      const errorTexts = this.errors.map(e => e.error.toLowerCase());
      const patterns = {};
      
      errorTexts.forEach(text => {
        // Normalize error text
        const normalized = text
          .replace(/widget-\d+/g, 'widget-X')
          .replace(/\d+/g, 'N')
          .substring(0, 100);
        
        patterns[normalized] = (patterns[normalized] || 0) + 1;
      });
      
      return Object.entries(patterns)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([pattern, count]) => `${pattern} (${count}x)`);
    }

    generateRecommendations() {
      const successful = this.operations.filter(op => op.success);
      const failed = this.operations.filter(op => !op.success);
      const recommendations = [];
      
      const successRate = this.operations.length > 0 
        ? (successful.length / this.operations.length * 100)
        : 0;
      
      if (successRate < 50) {
        recommendations.push('🚨 CRITICAL: <50% success rate - major widget deletion issue');
      }
      
      if (this.errors.length > 5) {
        recommendations.push('⚠️ High error frequency - check console for specific issues');
      }
      
      if (this.operations.length === 0) {
        recommendations.push('🔍 No widget operations detected - try testing manually first');
      }
      
      const hasRaceCondition = this.errors.some(e => 
        e.error.includes('race') || e.error.includes('reappear')
      );
      if (hasRaceCondition) {
        recommendations.push('🔄 Race condition detected - review initialization logic');
      }
      
      return recommendations;
    }
  }

  // Initialize the system
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.autoTestingSystem) {
      window.autoTestingSystem = new AutoTestingSystem();
      window.autoTestingSystem.init();
    }
  });

  // If DOM is already loaded
  if (document.readyState !== 'loading') {
    if (!window.autoTestingSystem) {
      window.autoTestingSystem = new AutoTestingSystem();
      window.autoTestingSystem.init();
    }
  }
}