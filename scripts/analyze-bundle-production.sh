#!/bin/bash
# Production Bundle Analysis Script
# Builds production container and analyzes bundle sizes

set -e

echo "🏭 Starting Production Bundle Analysis..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
docker-compose down || true

# Build production container with bundle analyzer
echo "📦 Building production container with bundle analyzer..."
NEXT_CONFIG_FILE=next.config.bundle-analyzer.js ANALYZE=true docker-compose -f docker-compose.yml build --target builder

# Run production build to generate static files
echo "🔨 Running production build..."
docker run --rm \
  -v "$(pwd):/app" \
  -w /app \
  -e NEXT_CONFIG_FILE=next.config.bundle-analyzer.js \
  -e ANALYZE=true \
  daten-see-v2-app:latest \
  sh -c "npm run build"

# Wait for build to complete
sleep 5

# Check if build succeeded
if [ ! -d ".next" ]; then
    echo "❌ Production build failed - .next directory not found"
    exit 1
fi

echo "📊 Production Bundle Analysis Results:"

# JavaScript Bundle Analysis
echo ""
echo "🏆 JavaScript Bundles (Top 10 largest):"
if [ -d ".next/static/js" ]; then
    find .next/static/js -name "*.js" -type f -exec ls -lah {} \; | sort -k5 -hr | head -10
    
    # Calculate total JS size
    JS_TOTAL=$(find .next/static/js -name "*.js" -type f -exec stat -f%z {} \; | awk '{sum += $1} END {print sum/1024/1024}')
    echo "📈 Total JavaScript: ${JS_TOTAL}MB"
else
    echo "⚠️  No JavaScript bundles found"
    JS_TOTAL="0"
fi

# CSS Bundle Analysis  
echo ""
echo "🎨 CSS Bundles:"
if [ -d ".next/static/css" ]; then
    find .next/static/css -name "*.css" -type f -exec ls -lah {} \; | sort -k5 -hr
    
    # Calculate total CSS size
    CSS_TOTAL=$(find .next/static/css -name "*.css" -type f -exec stat -f%z {} \; | awk '{sum += $1} END {print sum/1024/1024}')
    echo "📈 Total CSS: ${CSS_TOTAL}MB"
else
    echo "⚠️  No CSS bundles found"
    CSS_TOTAL="0"
fi

# Bundle Size Validation
echo ""
echo "⚖️  Bundle Size Validation:"

# Check JavaScript bundle sizes (250KB limit per chunk)
JS_VIOLATIONS=0
if [ -d ".next/static/js" ]; then
    for file in .next/static/js/*.js; do
        if [ -f "$file" ]; then
            SIZE=$(stat -f%z "$file")
            SIZE_KB=$((SIZE / 1024))
            if [ $SIZE_KB -gt 250 ]; then
                echo "❌ $file: ${SIZE_KB}KB (exceeds 250KB limit)"
                JS_VIOLATIONS=$((JS_VIOLATIONS + 1))
            else
                echo "✅ $file: ${SIZE_KB}KB (within limit)"
            fi
        fi
    done
fi

# Check CSS bundle sizes (50KB limit per file)
CSS_VIOLATIONS=0
if [ -d ".next/static/css" ]; then
    for file in .next/static/css/*.css; do
        if [ -f "$file" ]; then
            SIZE=$(stat -f%z "$file")
            SIZE_KB=$((SIZE / 1024))
            if [ $SIZE_KB -gt 50 ]; then
                echo "❌ $file: ${SIZE_KB}KB (exceeds 50KB limit)"
                CSS_VIOLATIONS=$((CSS_VIOLATIONS + 1))
            else
                echo "✅ $file: ${SIZE_KB}KB (within limit)"
            fi
        fi
    done
fi

# Overall validation result
TOTAL_VIOLATIONS=$((JS_VIOLATIONS + CSS_VIOLATIONS))
if [ $TOTAL_VIOLATIONS -eq 0 ]; then
    echo ""
    echo "✅ All bundles within size limits!"
else
    echo ""
    echo "⚠️  $TOTAL_VIOLATIONS bundle(s) exceed size limits"
fi

# Generate detailed report
echo ""
echo "📈 Generating production bundle report..."

# Create performance docs directory
mkdir -p docs/performance

# Generate comprehensive bundle analysis report
cat > docs/performance/production-bundle-analysis.md << EOF
# Production Bundle Analysis Report

**Generated:** $(date)
**Build Type:** Production with Next.js Bundle Analyzer
**Environment:** Docker Container

## Summary

### Size Overview
- **Total JavaScript:** ${JS_TOTAL}MB
- **Total CSS:** ${CSS_TOTAL}MB
- **Total Violations:** $TOTAL_VIOLATIONS bundles exceed limits

### JavaScript Bundles (Production)
\`\`\`
$([ -d ".next/static/js" ] && find .next/static/js -name "*.js" -type f -exec ls -lah {} \; | sort -k5 -hr | head -10 || echo "No JavaScript bundles found")
\`\`\`

### CSS Bundles (Production)
\`\`\`
$([ -d ".next/static/css" ] && find .next/static/css -name "*.css" -type f -exec ls -lah {} \; | sort -k5 -hr || echo "No CSS bundles found")
\`\`\`

### Chunks Analysis
$([ -d ".next/static/chunks" ] && echo "\`\`\`" && find .next/static/chunks -name "*.js" -type f -exec ls -lah {} \; | sort -k5 -hr | head -5 && echo "\`\`\`" || echo "No chunks directory found")

## Performance Assessment

| Asset Type | Limit | Current | Status |
|------------|-------|---------|--------|
| JavaScript per chunk | 250KB | Max chunk size | $([ $JS_VIOLATIONS -eq 0 ] && echo "✅ Pass" || echo "❌ $JS_VIOLATIONS violations") |
| CSS per file | 50KB | Max file size | $([ $CSS_VIOLATIONS -eq 0 ] && echo "✅ Pass" || echo "❌ $CSS_VIOLATIONS violations") |
| Total JavaScript | < 2MB | ${JS_TOTAL}MB | $(awk 'BEGIN{print ('${JS_TOTAL}' < 2) ? "✅ Pass" : "⚠️ Warning"}') |
| Total CSS | < 200KB | ${CSS_TOTAL}MB | $(awk 'BEGIN{print ('${CSS_TOTAL}' < 0.2) ? "✅ Pass" : "⚠️ Warning"}') |

## Bundle Optimization Status

### ✅ Currently Implemented
- Multi-stage Docker build for production optimization
- Next.js automatic code splitting
- CSS optimization and minification
- Static asset compression
- Tree shaking for unused code elimination

### 🔄 Optimization Recommendations

#### Immediate Actions (if violations exist)
- [ ] Implement dynamic imports for large components
- [ ] Split vendor libraries into separate chunks
- [ ] Optimize image assets and use Next.js Image component
- [ ] Remove unused CSS and JavaScript

#### Advanced Optimizations
- [ ] Implement Service Worker for aggressive caching
- [ ] Use CDN for large third-party libraries
- [ ] Implement route-based code splitting
- [ ] Add bundle size monitoring to CI/CD pipeline

#### Performance Monitoring
- [ ] Set up Core Web Vitals tracking
- [ ] Monitor First Contentful Paint (FCP)
- [ ] Track Time to Interactive (TTI)
- [ ] Implement Real User Monitoring (RUM)

## Interactive Analysis

### Bundle Analyzer Reports
$([ -f ".next/analyze/client.html" ] && echo "- 📱 Client Bundle: .next/analyze/client.html" || echo "- ⚠️ Client bundle analyzer not generated")
$([ -f ".next/analyze/server.html" ] && echo "- 🖥️ Server Bundle: .next/analyze/server.html" || echo "- ⚠️ Server bundle analyzer not generated")

### Commands for Further Analysis

\`\`\`bash
# Run production bundle analysis
./scripts/analyze-bundle-production.sh

# View bundle composition
find .next/static -type f -name "*.js" -o -name "*.css" | xargs ls -lah | sort -k5 -hr

# Analyze specific chunk
npx webpack-bundle-analyzer .next/static/js/[chunk-name].js

# Production build with analyzer
ANALYZE=true docker-compose build --target builder
\`\`\`

## Development vs Production Comparison

| Metric | Development | Production |
|--------|-------------|------------|
| Build Time | Fast (dev mode) | Slower (optimized) |
| Bundle Size | Larger (source maps) | Smaller (minified) |
| Loading Speed | Slower | Faster |
| Debugging | Easy | Harder |

## Action Items

### High Priority
$([ $TOTAL_VIOLATIONS -gt 0 ] && echo "- 🚨 Fix $TOTAL_VIOLATIONS bundle size violations" || echo "- ✅ No immediate size violations")
- 📊 Implement automated bundle size monitoring
- 🎯 Set up performance budgets in CI/CD

### Medium Priority  
- 🔍 Regular bundle analysis automation
- 📈 Core Web Vitals monitoring implementation
- 🚀 Progressive loading strategy for non-critical resources

### Low Priority
- 🧪 Experiment with different bundling strategies
- 📱 Mobile-specific optimizations
- 🌐 CDN implementation for static assets

---

**Next Analysis:** Run this script weekly or after major feature additions to monitor bundle growth.
EOF

echo "📋 Production bundle analysis report saved to docs/performance/production-bundle-analysis.md"

# Check for interactive bundle analyzer
if [ -f ".next/analyze/client.html" ] || [ -f ".next/analyze/server.html" ]; then
    echo ""
    echo "🌐 Interactive Bundle Analyzer Reports Generated:"
    [ -f ".next/analyze/client.html" ] && echo "   📱 Client: .next/analyze/client.html"
    [ -f ".next/analyze/server.html" ] && echo "   🖥️  Server: .next/analyze/server.html"
    echo "   Open these files in your browser for detailed analysis"
else
    echo ""
    echo "📊 Bundle analysis complete. Interactive reports may take a moment to generate."
fi

echo ""
echo "✨ Production Bundle Analysis Complete!"
echo ""
echo "📊 Results Summary:"
echo "   • JavaScript: ${JS_TOTAL}MB total"
echo "   • CSS: ${CSS_TOTAL}MB total" 
echo "   • Size violations: $TOTAL_VIOLATIONS"
echo "   • Detailed report: docs/performance/production-bundle-analysis.md"
echo ""
echo "🔍 Next Steps:"
echo "   1. Review production-bundle-analysis.md for detailed insights"
echo "   2. Open .next/analyze/*.html for interactive bundle exploration"
echo "   3. Implement recommended optimizations for oversized bundles"
echo "   4. Set up automated bundle monitoring in CI/CD pipeline"

# Restart development environment
echo ""
echo "🔄 Restarting development environment..."
./scripts/quick-restart.sh