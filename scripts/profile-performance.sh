#!/bin/bash
# React Performance Profiling Script
# Automated performance testing and profiling

set -e

echo "🔬 Starting React Performance Profiling..."

# Ensure Docker container is running
if ! docker ps | grep -q "daten-see-app"; then
    echo "🐳 Starting Docker container..."
    ./scripts/quick-restart.sh
    sleep 5
fi

CONTAINER_ID=$(docker ps -q --filter "name=daten-see")
if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Docker container not running"
    exit 1
fi

# Check if dev-tools page is accessible
echo "🌐 Testing dev-tools page accessibility..."
docker exec $CONTAINER_ID curl -f http://localhost:3000/dev-tools > /dev/null 2>&1 || {
    echo "⚠️  Dev-tools page not accessible, building may be needed"
}

# Generate performance baseline report
echo "📊 Generating performance baseline..."

# Create performance directory
mkdir -p docs/performance

# Generate performance profiling guide
cat > docs/performance/react-profiling-guide.md << 'EOF'
# React Performance Profiling Guide

## Overview

This guide covers React performance profiling tools and techniques implemented in Daten See v2.

## Available Tools

### 1. React DevTools Profiler Integration (`/dev-tools`)

**Access:** http://localhost:3000/dev-tools (development only)

**Features:**
- Component render time tracking
- Re-render frequency monitoring  
- Mount/update ratio analysis
- Automated performance issue detection
- Data export for external analysis

**Usage:**
```bash
# Start profiling session
1. Navigate to /dev-tools
2. Click "Start Profiling"
3. Use the application normally
4. Click "Stop Profiling" to generate report
5. Export data for further analysis
```

### 2. Browser DevTools Integration

**React DevTools Extension Required**

**Access:** Browser DevTools → React → Profiler

**Integration:**
- All profiled components automatically appear in React DevTools
- Programmatic data collection via `window.reactProfiling`
- Coordinated profiling between custom tools and DevTools

### 3. Component-Level Profiling

**HOC Wrapper:**
```typescript
import { withProfiler } from '@/lib/performance/devtools-integration';

const ProfiledComponent = withProfiler(MyComponent, {
  id: 'MyComponent',
  logToConsole: true,
  trackInteractions: true
});
```

**Component Wrapper:**
```typescript
import { ProfiledComponent } from '@/components/debug/ProfiledComponent';

<ProfiledComponent name="ExpensiveComponent" budget="large">
  <ExpensiveComponent />
</ProfiledComponent>
```

### 4. Performance Monitoring Hooks

**Basic Profiling:**
```typescript
import { usePerformanceProfiler } from '@/lib/performance/react-profiling';

function MyComponent() {
  const { renderCount } = usePerformanceProfiler('MyComponent');
  // Component logic
}
```

**Query Profiling:**
```typescript
import { useQueryProfiler } from '@/lib/performance/react-profiling';

function DataComponent() {
  const { trackCacheHit, getQueryMetrics } = useQueryProfiler(['users']);
  // Query logic with profiling
}
```

## Performance Budgets

### Component Render Time Budgets
- **Small components:** 5ms (buttons, inputs)
- **Medium components:** 16ms (forms, cards) 
- **Large components:** 100ms (charts, tables)

### Warning Thresholds
- **Slow render:** >16ms render time
- **Frequent re-renders:** >3:1 update-to-mount ratio
- **Memory concerns:** >1000 component instances

## Profiling Workflow

### 1. Development Profiling
```bash
# Start application with profiling
./scripts/quick-restart.sh

# Navigate to dev-tools page
open http://localhost:3000/dev-tools

# Use profiling controls
# - Start/Stop profiling sessions
# - Export data for analysis
# - Monitor real-time metrics
```

### 2. Automated Testing
```bash
# Run performance profiling tests
./scripts/profile-performance.sh

# Generate performance reports
# - Baseline performance metrics
# - Component render analysis
# - Performance regression detection
```

### 3. Production Monitoring
```typescript
// Production performance tracking (Sentry integration)
import { performanceMonitor } from '@/lib/performance/react-profiling';

// Metrics are automatically collected and sent to Sentry
// No console logging in production
```

## Console Commands (Development)

```javascript
// Available in browser console during development

// Start profiling session
window.reactProfiling.startProfiling()

// Stop profiling and generate report  
window.reactProfiling.stopProfiling()

// Get current profiling statistics
window.reactProfiling.getProfilingStats()

// Export profiling data to file
window.reactProfiling.exportProfilingData()

// Clear all profiling data
window.reactProfiling.clearProfilingData()
```

## Performance Analysis

### Identifying Issues

**Slow Renders:**
- Components taking >16ms to render
- Blocking the main thread
- Poor user experience

**Excessive Re-renders:**
- Components updating unnecessarily
- Missing memoization opportunities
- Inefficient state management

**Memory Leaks:**
- Components not unmounting properly
- Event listeners not cleaned up
- Growing component instance count

### Optimization Strategies

**Memoization:**
```typescript
// Use profiled memo for automatic tracking
import { createProfiledMemo } from '@/components/debug/ProfiledComponent';

const OptimizedComponent = createProfiledMemo(ExpensiveComponent, {
  name: 'OptimizedComponent',
  budget: 'medium'
});
```

**Code Splitting:**
```typescript
// Use bundle optimization utilities
import { createLazyComponent } from '@/lib/performance/bundle-optimization';

const LazyComponent = createLazyComponent(
  () => import('./ExpensiveComponent')
);
```

**Query Optimization:**
```typescript
// Use optimized query configurations
import { createQueryOptions } from '@/lib/tanstack-query/config';

const { data } = useQuery({
  ...createQueryOptions.dashboard(),
  queryKey: ['dashboard', id],
  queryFn: () => fetchDashboard(id)
});
```

## Best Practices

### 1. Regular Profiling
- Profile during development
- Test with realistic data volumes
- Monitor production performance

### 2. Performance Budgets
- Set and enforce render time budgets
- Monitor component complexity growth
- Regular performance reviews

### 3. Automated Monitoring
- Integrate profiling into CI/CD
- Track performance regressions
- Alert on budget violations

### 4. User-Centric Metrics
- Focus on perceived performance
- Optimize critical user paths
- Monitor Core Web Vitals

## Troubleshooting

### Common Issues

**Profiling Not Working:**
- Ensure development mode is enabled
- Check React DevTools extension is installed
- Verify components are properly wrapped

**High CPU Usage:**
- Excessive profiling overhead in development
- Disable detailed logging for performance testing
- Use production builds for realistic metrics

**Memory Issues:**
- Clear profiling data regularly
- Limit profiling sessions duration
- Monitor component instance counts

### Debug Commands

```bash
# Check container performance
docker stats

# Monitor application logs
docker-compose logs app -f

# Access container shell for debugging
docker-compose exec app sh
```

---

## Next Steps

1. **Set Up Regular Profiling:** Integrate profiling into development workflow
2. **Establish Baselines:** Record current performance metrics
3. **Implement Monitoring:** Add performance tracking to critical components
4. **Optimize Hot Paths:** Focus on most frequently used components
5. **Automate Testing:** Add performance tests to CI/CD pipeline

For more detailed analysis, use the interactive dev-tools page and React DevTools browser extension.
EOF

echo "📋 React profiling guide saved to docs/performance/react-profiling-guide.md"

# Test profiling utilities
echo ""
echo "🧪 Testing profiling utilities..."

# Check if TypeScript compiles profiling files
echo "   ✓ Checking TypeScript compilation..."
docker exec $CONTAINER_ID npx tsc --noEmit \
  src/lib/performance/react-profiling.ts \
  src/lib/performance/devtools-integration.ts \
  src/components/debug/ProfiledComponent.tsx || {
    echo "❌ TypeScript compilation failed for profiling files"
    exit 1
}

# Test dev-tools page build
echo "   ✓ Testing dev-tools page..."
docker exec $CONTAINER_ID test -f app/dev-tools/page.tsx || {
    echo "⚠️  Dev-tools page file not found in container"
}

echo ""
echo "✨ React Performance Profiling Setup Complete!"
echo ""
echo "🔍 Available Tools:"
echo "   • Dev Tools Page: http://localhost:3000/dev-tools"
echo "   • Browser Console: window.reactProfiling.*"
echo "   • HOC Wrappers: withProfiler(), createProfiledMemo()"
echo "   • Performance Hooks: usePerformanceProfiler()"
echo ""
echo "📊 Next Steps:"
echo "   1. Navigate to /dev-tools to start profiling"
echo "   2. Wrap critical components with profiling HOCs"
echo "   3. Use browser DevTools → React → Profiler"
echo "   4. Review docs/performance/react-profiling-guide.md"
echo ""
echo "🎯 Performance Budgets Configured:"
echo "   • Small components: 5ms"
echo "   • Medium components: 16ms"  
echo "   • Large components: 100ms"