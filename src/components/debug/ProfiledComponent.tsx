/**
 * Profiled Component Wrapper
 * HOC for automatic performance profiling of components
 */

import React from 'react';
import { usePerformanceProfiler, checkPerformanceBudget, performanceMonitor } from '@/lib/performance/react-profiling';

export interface ProfiledComponentProps {
  children?: React.ReactNode;
  budget?: 'small' | 'medium' | 'large';
  name?: string;
}

/**
 * Higher-Order Component for automatic performance profiling
 */
export function withProfiling<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    budget?: 'small' | 'medium' | 'large';
    name?: string;
  } = {}
) {
  const componentName = options.name || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  const budget = options.budget || 'medium';

  const ProfiledComponent = React.forwardRef<any, P>((props, ref) => {
    const renderStart = React.useRef<number>();
    const { renderCount } = usePerformanceProfiler(componentName);

    // Start timing before render
    renderStart.current = performance.now();

    // Effect to measure render time after render
    React.useEffect(() => {
      if (renderStart.current) {
        const renderTime = performance.now() - renderStart.current;
        
        // Record metric for monitoring
        performanceMonitor.recordMetric(`${componentName}-render-time`, renderTime);
        
        // Check performance budget
        checkPerformanceBudget(budget, renderTime, componentName);
        
        // Log render performance in development
        if (process.env.NODE_ENV === 'development') {
          if (renderTime > 16) {
            console.warn(`🐌 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms (render #${renderCount})`);
          } else if (renderTime > 5) {
            console.log(`⏱️ ${componentName}: ${renderTime.toFixed(2)}ms (render #${renderCount})`);
          }
        }
      }
    });

    return <WrappedComponent {...(props as any)} ref={ref} />;
  });

  ProfiledComponent.displayName = `Profiled(${componentName})`;
  return ProfiledComponent;
}

/**
 * Component wrapper for performance profiling
 * Use this to wrap individual components for monitoring
 */
export function ProfiledComponent({ 
  children, 
  budget = 'medium', 
  name = 'ProfiledComponent' 
}: ProfiledComponentProps): React.ReactElement {
  const renderStart = React.useRef<number>();
  usePerformanceProfiler(name);

  renderStart.current = performance.now();

  React.useEffect(() => {
    if (renderStart.current) {
      const renderTime = performance.now() - renderStart.current;
      performanceMonitor.recordMetric(`${name}-render-time`, renderTime);
      checkPerformanceBudget(budget, renderTime, name);
    }
  });

  return <>{children}</>;
}

/**
 * Profiled memo wrapper
 * Automatically profiles memoized components
 */
export function createProfiledMemo<T extends React.ComponentType<any>>(
  Component: T,
  options: {
    name?: string;
    budget?: 'small' | 'medium' | 'large';
    propsAreEqual?: (prevProps: React.ComponentProps<T>, nextProps: React.ComponentProps<T>) => boolean;
  } = {}
): T {
  const componentName = options.name || Component.displayName || Component.name || 'Component';
  const budget = options.budget || 'medium';
  
  const ProfiledMemoComponent = React.memo(
    withProfiling(Component, { name: `Memo(${componentName})`, budget }),
    options.propsAreEqual as any
  );

  // Track memo effectiveness
  const memoStats = {
    renderCount: 0,
    memoSkips: 0,
  };

  const EnhancedMemoComponent = React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    memoStats.renderCount += 1;

    React.useEffect(() => {
      if (process.env.NODE_ENV === 'development' && memoStats.renderCount > 5) {
        const effectiveness = ((memoStats.renderCount - memoStats.memoSkips) / memoStats.renderCount) * 100;
        if (effectiveness < 50) {
          console.warn(`📊 ${componentName} memo effectiveness: ${effectiveness.toFixed(1)}%`);
        }
      }
    });

    return <ProfiledMemoComponent ref={ref} {...props} />;
  });

  EnhancedMemoComponent.displayName = `ProfiledMemo(${componentName})`;
  return EnhancedMemoComponent as unknown as T;
}

/**
 * Performance-aware component boundary
 * Catches and reports performance issues
 */
export class PerformanceBoundary extends React.Component<
  {
    children: React.ReactNode;
    name?: string;
    onPerformanceIssue?: (issue: {
      type: 'slow-render' | 'memory-leak' | 'frequent-rerenders';
      componentName: string;
      details: any;
    }) => void;
  },
  {
    renderCount: number;
    slowRenders: number;
  }
> {
  private renderTimes: number[] = [];
  private lastRenderTime = 0;

  constructor(props: any) {
    super(props);
    this.state = {
      renderCount: 0,
      slowRenders: 0,
    };
  }

  override componentDidMount() {
    this.lastRenderTime = performance.now();
  }

  override componentDidUpdate() {
    const now = performance.now();
    const renderTime = now - this.lastRenderTime;
    
    this.renderTimes.push(renderTime);
    this.setState(prevState => ({
      renderCount: prevState.renderCount + 1,
      slowRenders: renderTime > 16 ? prevState.slowRenders + 1 : prevState.slowRenders,
    }));

    // Keep only last 10 render times
    if (this.renderTimes.length > 10) {
      this.renderTimes.shift();
    }

    // Check for performance issues
    this.checkPerformanceIssues(renderTime);
    
    this.lastRenderTime = now;
  }

  private checkPerformanceIssues(renderTime: number) {
    const { name = 'PerformanceBoundary', onPerformanceIssue } = this.props;
    const { renderCount, slowRenders } = this.state;

    // Detect slow renders
    if (renderTime > 50) {
      onPerformanceIssue?.({
        type: 'slow-render',
        componentName: name,
        details: { renderTime, renderCount },
      });
    }

    // Detect frequent re-renders
    if (renderCount > 20 && renderCount % 10 === 0) {
      onPerformanceIssue?.({
        type: 'frequent-rerenders',
        componentName: name,
        details: { renderCount, slowRenders, avgRenderTime: this.getAverageRenderTime() },
      });
    }
  }

  private getAverageRenderTime(): number {
    if (this.renderTimes.length === 0) return 0;
    return this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
  }

  override render() {
    return this.props.children;
  }
}

export default ProfiledComponent;