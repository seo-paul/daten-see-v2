'use client';

/**
 * Development Tools Page
 * React DevTools profiling interface and performance monitoring
 */

import { Play, Square, Download, Trash2, BarChart3, Settings } from 'lucide-react';
import React from 'react';

import { MainLayout } from '@/components/layout/MainLayout';
import { NavbarButton } from '@/components/ui/Button';
import { devToolsUtils } from '@/lib/performance/devtools-integration';
import { performanceMonitor } from '@/lib/performance/react-profiling';
import { PerformanceDevPanel } from '@/lib/performance/react-profiling';

export default function DevToolsPage(): React.ReactElement {
  const [isRecording, setIsRecording] = React.useState(false);
  const [profilingStats, setProfilingStats] = React.useState<Record<string, any>>({});
  const [performanceMetrics, setPerformanceMetrics] = React.useState<Record<string, any>>({});

  // Update stats periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProfilingStats(devToolsUtils.getProfilingStats());
      setPerformanceMetrics(performanceMonitor.getAllMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStartProfiling = () => {
    devToolsUtils.startProfiling();
    setIsRecording(true);
  };

  const handleStopProfiling = () => {
    devToolsUtils.stopProfiling();
    setIsRecording(false);
  };

  const handleExportData = () => {
    devToolsUtils.exportProfilingData();
  };

  const handleClearData = () => {
    devToolsUtils.clearProfilingData();
    performanceMonitor.clear();
    setProfilingStats({});
    setPerformanceMetrics({});
  };

  if (process.env.NODE_ENV !== 'development') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Dev Tools - Development Only
            </h1>
            <p className="text-gray-600">
              This page is only available in development mode.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            React DevTools & Performance Profiling
          </h1>
          <p className="text-gray-600">
            Monitor React component performance and analyze rendering behavior
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Profiling Controls
          </h2>
          
          <div className="flex flex-wrap gap-4">
            {!isRecording ? (
              <NavbarButton
                leftIcon={<Play className="w-4 h-4" />}
                onClick={handleStartProfiling}
                variant="primary"
              >
                Start Profiling
              </NavbarButton>
            ) : (
              <NavbarButton
                leftIcon={<Square className="w-4 h-4" />}
                onClick={handleStopProfiling}
                variant="secondary"
              >
                Stop Profiling
              </NavbarButton>
            )}

            <NavbarButton
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportData}
              variant="secondary"
            >
              Export Data
            </NavbarButton>

            <NavbarButton
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleClearData}
              variant="secondary"
            >
              Clear Data
            </NavbarButton>
          </div>

          {isRecording && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                <span className="text-green-800 font-medium">
                  Recording profiling data...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* React Profiling Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              React Profiling Stats
            </h2>
            
            {Object.keys(profilingStats).length === 0 ? (
              <p className="text-gray-500 italic">
                No profiling data available. Start profiling to see component stats.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(profilingStats).map(([componentId, stats]: [string, any]) => (
                  <div key={componentId} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <h3 className="font-medium text-gray-800 mb-2">{componentId}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Renders:</span>
                        <span className="ml-2 font-medium">{stats.renderCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Duration:</span>
                        <span className="ml-2 font-medium">{stats.avgDuration.toFixed(2)}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Mounts:</span>
                        <span className="ml-2 font-medium">{stats.mountCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Updates:</span>
                        <span className="ml-2 font-medium">{stats.updateCount}</span>
                      </div>
                    </div>
                    
                    {/* Performance indicators */}
                    <div className="mt-2 flex gap-2">
                      {stats.avgDuration > 16 && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          Slow Render
                        </span>
                      )}
                      {stats.updateCount > stats.mountCount * 3 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Frequent Updates
                        </span>
                      )}
                      {stats.avgDuration <= 5 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Optimal
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Performance Metrics
            </h2>
            
            {Object.keys(performanceMetrics).length === 0 ? (
              <p className="text-gray-500 italic">
                No performance metrics available yet.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(performanceMetrics).map(([name, data]: [string, any]) => (
                  data && (
                    <div key={name} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <h3 className="font-medium text-gray-800 mb-2">{name}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Count:</span>
                          <span className="ml-2 font-medium">{data.count}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Average:</span>
                          <span className="ml-2 font-medium">{data.avg.toFixed(2)}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Min:</span>
                          <span className="ml-2 font-medium">{data.min.toFixed(2)}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Max:</span>
                          <span className="ml-2 font-medium">{data.max.toFixed(2)}ms</span>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            How to Use React DevTools Profiling
          </h2>
          
          <div className="space-y-3 text-blue-700">
            <div>
              <strong>1. Browser DevTools:</strong>
              <p className="text-sm mt-1">
                Open Chrome/Firefox DevTools → React tab → Profiler. 
                This page provides additional programmatic profiling data.
              </p>
            </div>
            
            <div>
              <strong>2. Console Commands:</strong>
              <p className="text-sm mt-1">
                Use <code className="bg-blue-100 px-1 rounded">window.reactProfiling</code> in the console
                for programmatic access to profiling utilities.
              </p>
            </div>
            
            <div>
              <strong>3. Component Profiling:</strong>
              <p className="text-sm mt-1">
                Wrap components with <code className="bg-blue-100 px-1 rounded">withProfiler()</code> HOC 
                or use <code className="bg-blue-100 px-1 rounded">ProfiledComponent</code> wrapper for automatic profiling.
              </p>
            </div>
            
            <div>
              <strong>4. Performance Indicators:</strong>
              <ul className="text-sm mt-1 ml-4 list-disc">
                <li><span className="text-red-600">Slow Render:</span> Component takes &gt;16ms to render</li>
                <li><span className="text-yellow-600">Frequent Updates:</span> High update-to-mount ratio</li>
                <li><span className="text-green-600">Optimal:</span> Component renders efficiently</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Performance Panel */}
      <PerformanceDevPanel />
    </MainLayout>
  );
}