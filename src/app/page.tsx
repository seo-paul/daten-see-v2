'use client';

import { useEffect } from 'react';

import { appLogger } from '@/lib/monitoring/logger.config';
import { usePerformanceMonitor } from '@/lib/monitoring/performance';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

// Test component to validate error monitoring
function ErrorTestComponent(): React.ReactElement {
  const performance = usePerformanceMonitor('ErrorTestComponent');

  const triggerError = (): void => {
    performance.markStart('error-test');
    appLogger.userAction('trigger-error-test');
    throw new Error('This is a test error to validate Sentry integration');
  };

  const triggerWarning = (): void => {
    appLogger.warn('Test warning triggered by user', {
      action: 'test-warning',
      component: 'error-test-component',
      metadata: {
        timestamp: Date.now(),
        userTriggered: true,
      },
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Error Monitoring Test Controls</h2>
      <p className="text-gray-600">
        These controls help validate that error monitoring is working correctly.
      </p>
      <div className="space-x-4">
        <button
          onClick={triggerError}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Trigger Test Error
        </button>
        <button
          onClick={triggerWarning}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Trigger Test Warning
        </button>
      </div>
    </div>
  );
}

export default function Home(): React.ReactElement {
  const performance = usePerformanceMonitor('HomePage');

  useEffect(() => {
    performance.markStart('page-load');
    
    // Log page view
    appLogger.info('Home page loaded', {
      component: 'home-page',
      action: 'page-view',
    });

    // Test async performance tracking
    performance.trackAsync('initial-data-load', async () => {
      // Simulate data loading
      await new Promise(resolve => setTimeout(resolve, 100));
      return { data: 'loaded' };
    }).then(() => {
      appLogger.info('Initial data load completed');
    });

    // Mark page load complete
    setTimeout(() => {
      performance.markEnd('page-load', {
        route: '/',
        initialLoad: true,
      });
    }, 0);

    return (): void => {
      appLogger.debug('Home page unmounted', {
        component: 'home-page',
        action: 'unmount',
      });
    };
  }, [performance]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          🚀 Daten See v2 - Error Monitoring Active
        </p>
      </div>

      <div className="relative flex place-items-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            SaaS Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Error Monitoring & Debugging Infrastructure Ready
          </p>
          
          {/* Success indicators */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-green-800 font-semibold">✅ Sentry</div>
              <div className="text-green-600">Error Tracking Active</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-green-800 font-semibold">✅ Pino</div>
              <div className="text-green-600">Structured Logging</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-green-800 font-semibold">✅ Error Boundaries</div>
              <div className="text-green-600">React Error Handling</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-green-800 font-semibold">✅ Performance</div>
              <div className="text-green-600">Core Web Vitals</div>
            </div>
          </div>
          
          {/* Error monitoring test section */}
          <ErrorBoundary level="component" context={{ section: 'error-test' }}>
            <div className="bg-white p-6 rounded-lg shadow-lg border">
              <ErrorTestComponent />
            </div>
          </ErrorBoundary>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Week 1{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              🚀
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Foundation + Error Monitoring + Early UI Visibility
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Next Up{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              📱
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Git Setup → Next.js Foundation → Dashboard Layout
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Goal{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              📊
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50 text-balance">
            Market-ready analytics dashboard in 16 weeks
          </p>
        </div>
      </div>
    </main>
  );
}