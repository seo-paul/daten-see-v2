/**
 * React DevTools Integration
 * Utilities for integrating with React DevTools Profiler
 */

import React, { ProfilerOnRenderCallback } from 'react';

/**
 * React DevTools Profiler integration
 * Provides programmatic access to profiling data
 */
export interface ProfilerData {
  id: string;
  phase: 'mount' | 'update' | 'nested-update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: Set<unknown>;
}

/**
 * Global profiler data store
 */
class ProfilerDataStore {
  private static instance: ProfilerDataStore;
  private profileData: Map<string, ProfilerData[]> = new Map();
  private isRecording = false;

  static getInstance(): ProfilerDataStore {
    if (!ProfilerDataStore.instance) {
      ProfilerDataStore.instance = new ProfilerDataStore();
    }
    return ProfilerDataStore.instance;
  }

  startRecording(): void {
    this.isRecording = true;
    this.profileData.clear();
    if (process.env.NODE_ENV === 'development') {
      // Started React profiling session
    }
  }

  stopRecording(): void {
    this.isRecording = false;
    if (process.env.NODE_ENV === 'development') {
      // Stopped React profiling session
    }
    this.generateReport();
  }

  recordProfileData(data: ProfilerData): void {
    if (!this.isRecording) return;

    if (!this.profileData.has(data.id)) {
      this.profileData.set(data.id, []);
    }
    this.profileData.get(data.id)!.push(data);
  }

  getProfileData(componentId?: string): ProfilerData[] | Map<string, ProfilerData[]> {
    if (componentId) {
      return this.profileData.get(componentId) || [];
    }
    return this.profileData;
  }

  private generateReport(): void {
    if (this.profileData.size === 0) {
      if (process.env.NODE_ENV === 'development') {
        // No profiling data collected
      }
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      // React Profiler Report
    }
    
    this.profileData.forEach((sessions) => {
      if (sessions.length === 0) return;

      const mounts = sessions.filter(s => s.phase === 'mount').length;
      const updates = sessions.filter(s => s.phase === 'update').length;
      
      const durations = sessions.map(s => s.actualDuration);
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

      if (process.env.NODE_ENV === 'development') {
        // Component profiling data collected
        // Total renders: (${mounts} mounts, ${updates} updates)
        // Avg duration: ${avgDuration.toFixed(2)}ms
        
        // Highlight performance issues
        if (avgDuration > 16) {
          // Average render time exceeds 16ms budget
        }
        if (updates > mounts * 3) {
          // High update-to-mount ratio detected
        }
        
        // End component group
      }
    });

    if (process.env.NODE_ENV === 'development') {
      // End profiler report
    }
  }

  exportData(): string {
    const data = Array.from(this.profileData.entries()).map(([id, sessions]) => ({
      componentId: id,
      sessions: sessions.map(session => ({
        phase: session.phase,
        actualDuration: session.actualDuration,
        baseDuration: session.baseDuration,
        startTime: session.startTime,
        commitTime: session.commitTime,
      }))
    }));

    return JSON.stringify(data, null, 2);
  }
}

export const profilerStore = ProfilerDataStore.getInstance();

/**
 * React Profiler component wrapper
 * Automatically integrates with our profiling system
 */
export function createProfilerWrapper(
  componentId: string,
  options: {
    logToConsole?: boolean;
    trackInteractions?: boolean;
  } = {}
) {
  const { logToConsole = false, trackInteractions = false } = options;

  return function ProfilerWrapper({ children }: { children: React.ReactNode }): React.ReactElement {
    const onRender: ProfilerOnRenderCallback = React.useCallback((
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime
    ) => {
      const profileData: ProfilerData = {
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        interactions: new Set(), // Empty set for compatibility
      };

      // Record data for analysis
      profilerStore.recordProfileData(profileData);

      // Optional console logging
      if (logToConsole && process.env.NODE_ENV === 'development') {
        // ${id} (${phase}): ${actualDuration.toFixed(2)}ms
        
        if (actualDuration > baseDuration * 1.5) {
          // ${id} render was ${((actualDuration/baseDuration) * 100).toFixed(0)}% slower than expected
        }
      }

      // Track interactions if enabled (disabled in current React version)
      if (trackInteractions) {
        // ${id} interactions: [tracking disabled in current React version]
      }
    }, []);

    return React.createElement(React.Profiler, { id: componentId, onRender }, children);
  };
}

/**
 * HOC for automatic profiler wrapping
 */
export function withProfiler<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  options: {
    id?: string;
    logToConsole?: boolean;
    trackInteractions?: boolean;
  } = {}
): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<unknown>> {
  const componentId = options.id || Component.displayName || Component.name || 'Component';
  const ProfilerWrapper = createProfilerWrapper(componentId, options);

  const ProfiledComponent = React.forwardRef<unknown, P>((props, ref) => 
    // eslint-disable-next-line react/no-children-prop
    React.createElement(
      ProfilerWrapper, 
      { children: React.createElement(Component, { ...props, ref } as P & { ref?: unknown }) }
    )
  );

  ProfiledComponent.displayName = `WithProfiler(${componentId})`;
  return ProfiledComponent;
}

/**
 * DevTools performance monitoring utilities
 */
export const devToolsUtils = {
  /**
   * Start profiling session
   */
  startProfiling: (): void => {
    profilerStore.startRecording();
    
    // Enable React DevTools profiling if available
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      if (process.env.NODE_ENV === 'development') {
        // React DevTools detected - profiling data will be available in DevTools
      }
    }
  },

  /**
   * Stop profiling and generate report
   */
  stopProfiling: (): void => {
    profilerStore.stopRecording();
  },

  /**
   * Export profiling data for external analysis
   */
  exportProfilingData: (): string => {
    const data = profilerStore.exportData();
    
    // Create downloadable file in development
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `react-profiling-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (process.env.NODE_ENV === 'development') {
        // Profiling data exported to file
      }
    }
    
    return data;
  },

  /**
   * Get current profiling statistics
   */
  getProfilingStats: (): Record<string, {
    renderCount: number;
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
    mountCount: number;
    updateCount: number;
  }> => {
    const allData = profilerStore.getProfileData() as Map<string, ProfilerData[]>;
    const stats: Record<string, {
      renderCount: number;
      avgDuration: number;
      maxDuration: number;
      minDuration: number;
      mountCount: number;
      updateCount: number;
    }> = {};

    allData.forEach((sessions, componentId) => {
      if (sessions.length === 0) return;

      const durations = sessions.map(s => s.actualDuration);
      const mounts = sessions.filter(s => s.phase === 'mount').length;
      const updates = sessions.filter(s => s.phase === 'update').length;

      stats[componentId] = {
        renderCount: sessions.length,
        avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        maxDuration: Math.max(...durations),
        minDuration: Math.min(...durations),
        mountCount: mounts,
        updateCount: updates,
      };
    });

    return stats;
  },

  /**
   * Clear all profiling data
   */
  clearProfilingData: (): void => {
    const allData = profilerStore.getProfileData();
    if (allData instanceof Map) {
      allData.clear();
    }
    if (process.env.NODE_ENV === 'development') {
      // Profiling data cleared
    }
  },
};

/**
 * Development console commands
 * Add these to window for easy access in dev console
 */
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).reactProfiling = devToolsUtils;
  
  if (process.env.NODE_ENV === 'development') {
    // React Profiling Utils Available via window.reactProfiling
  }
}

export default devToolsUtils;