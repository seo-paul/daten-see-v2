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
  interactions: Set<any>;
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
    console.log('🎬 Started React profiling session');
  }

  stopRecording(): void {
    this.isRecording = false;
    console.log('🛑 Stopped React profiling session');
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
      console.log('📊 No profiling data collected');
      return;
    }

    console.group('📊 React Profiler Report');
    
    this.profileData.forEach((sessions, componentId) => {
      if (sessions.length === 0) return;

      const totalSessions = sessions.length;
      const mounts = sessions.filter(s => s.phase === 'mount').length;
      const updates = sessions.filter(s => s.phase === 'update').length;
      
      const durations = sessions.map(s => s.actualDuration);
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      console.group(`🔍 ${componentId}`);
      console.log(`Total renders: ${totalSessions} (${mounts} mounts, ${updates} updates)`);
      console.log(`Avg duration: ${avgDuration.toFixed(2)}ms`);
      console.log(`Min/Max duration: ${minDuration.toFixed(2)}ms / ${maxDuration.toFixed(2)}ms`);
      
      // Highlight performance issues
      if (avgDuration > 16) {
        console.warn(`⚠️ Average render time exceeds 16ms budget`);
      }
      if (updates > mounts * 3) {
        console.warn(`⚠️ High update-to-mount ratio (${(updates/mounts).toFixed(1)}:1)`);
      }
      
      console.groupEnd();
    });

    console.groupEnd();
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

  return function ProfilerWrapper({ children }: { children: React.ReactNode }) {
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
        console.log(`⏱️ ${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
        
        if (actualDuration > baseDuration * 1.5) {
          console.warn(`🐌 ${id} render was ${((actualDuration/baseDuration) * 100).toFixed(0)}% slower than expected`);
        }
      }

      // Track interactions if enabled (disabled in current React version)
      if (trackInteractions) {
        console.log(`🖱️ ${id} interactions: [tracking disabled in current React version]`);
      }
    }, [logToConsole, trackInteractions]);

    return React.createElement(React.Profiler, { id: componentId, onRender, children });
  };
}

/**
 * HOC for automatic profiler wrapping
 */
export function withProfiler<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  options: {
    id?: string;
    logToConsole?: boolean;
    trackInteractions?: boolean;
  } = {}
) {
  const componentId = options.id || Component.displayName || Component.name || 'Component';
  const ProfilerWrapper = createProfilerWrapper(componentId, options);

  const ProfiledComponent = React.forwardRef<any, P>((props, ref) => 
    React.createElement(ProfilerWrapper, { children: React.createElement(Component, { ...props, ref } as P & { ref?: any }) })
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
  startProfiling: () => {
    profilerStore.startRecording();
    
    // Enable React DevTools profiling if available
    if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('🔧 React DevTools detected - profiling data will be available in DevTools');
    }
  },

  /**
   * Stop profiling and generate report
   */
  stopProfiling: () => {
    profilerStore.stopRecording();
  },

  /**
   * Export profiling data for external analysis
   */
  exportProfilingData: () => {
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
      
      console.log('📥 Profiling data exported to file');
    }
    
    return data;
  },

  /**
   * Get current profiling statistics
   */
  getProfilingStats: () => {
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
  clearProfilingData: () => {
    const allData = profilerStore.getProfileData();
    if (allData instanceof Map) {
      allData.clear();
    }
    console.log('🧹 Profiling data cleared');
  },
};

/**
 * Development console commands
 * Add these to window for easy access in dev console
 */
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).reactProfiling = devToolsUtils;
  
  console.log(`
🛠️ React Profiling Utils Available:
   • window.reactProfiling.startProfiling()
   • window.reactProfiling.stopProfiling()  
   • window.reactProfiling.exportProfilingData()
   • window.reactProfiling.getProfilingStats()
   • window.reactProfiling.clearProfilingData()
  `);
}

export default devToolsUtils;