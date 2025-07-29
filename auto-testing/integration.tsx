/**
 * Auto-Testing Integration for Next.js
 * 
 * Automatically loads the debugging system in development mode
 * WITHOUT modifying any production code
 */

'use client';

import { useEffect } from 'react';

export function AutoTestingIntegration() {
  useEffect(() => {
    // Only load in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Dynamic import to avoid bundling in production
    import('./widget-deletion-debug/init').then((module) => {
      const { AutoTestingSystem } = module;
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (!(window as any).autoTestingSystem) {
          const autoTesting = new AutoTestingSystem();
          autoTesting.init();
          
          // Store instance for manual control
          (window as any).autoTestingSystem = autoTesting;
        }
      }, 1000);
    }).catch((error) => {
      console.warn('Failed to load auto-testing system:', error);
    });
  }, []);

  // This component renders nothing
  return null;
}

/**
 * Usage in layout or pages:
 * 
 * import { AutoTestingIntegration } from '@/auto-testing/integration';
 * 
 * export default function Layout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <AutoTestingIntegration />
 *       </body>
 *     </html>
 *   );
 * }
 */