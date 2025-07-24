#!/bin/bash
# Bundle Analysis Script - Docker-First Approach
# Uses Next.js Bundle Analyzer with manual size validation

set -e

echo "🔍 Starting Bundle Analysis (Docker-First)..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next

# Build with bundle analyzer in Docker
echo "📦 Building with bundle analyzer in Docker..."
NEXT_CONFIG_FILE=next.config.bundle-analyzer.js ANALYZE=true ./scripts/quick-restart.sh

# Wait for build to complete and container to be ready
echo "⏳ Waiting for build to complete..."
sleep 10

# Check if Docker container is running
CONTAINER_ID=$(docker ps -q --filter "name=daten-see")
if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Docker container not running. Build may have failed."
    exit 1
fi

# Copy build artifacts from Docker container for analysis
echo "📋 Copying build artifacts from Docker container..."
docker cp $CONTAINER_ID:/app/.next ./ || echo "⚠️  Could not copy .next from container, checking local build..."

# Check if build succeeded
if [ ! -d ".next" ]; then
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

echo "📊 Bundle Analysis Results:"

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
echo "📈 Generating detailed bundle report..."

# Create performance docs directory
mkdir -p docs/performance

# Generate comprehensive bundle analysis report
cat > docs/performance/bundle-analysis.md << EOF
# Bundle Analysis Report

**Generated:** $(date)
**Build:** Docker-based with Next.js Bundle Analyzer

## Summary

### Size Overview
- **Total JavaScript:** ${JS_TOTAL}MB
- **Total CSS:** ${CSS_TOTAL}MB
- **Violations:** $TOTAL_VIOLATIONS bundles exceed limits

### JavaScript Bundles
\`\`\`
$(find .next/static/js -name "*.js" -type f -exec ls -lah {} \; | sort -k5 -hr | head -10)
\`\`\`

### CSS Bundles
\`\`\`
$(find .next/static/css -name "*.css" -type f -exec ls -lah {} \; | sort -k5 -hr)
\`\`\`

## Size Limits

| Asset Type | Limit | Status |
|------------|-------|--------|
| JavaScript per chunk | 250KB | $([ $JS_VIOLATIONS -eq 0 ] && echo "✅ Pass" || echo "❌ $JS_VIOLATIONS violations") |
| CSS per file | 50KB | $([ $CSS_VIOLATIONS -eq 0 ] && echo "✅ Pass" || echo "❌ $CSS_VIOLATIONS violations") |

## Optimization Recommendations

### Immediate Actions
- [ ] Review large JavaScript chunks for code splitting opportunities
- [ ] Implement dynamic imports for non-critical features  
- [ ] Check for duplicate dependencies in vendor bundles
- [ ] Optimize CSS by removing unused styles

### Performance Improvements
- [ ] Enable tree shaking for better dead code elimination
- [ ] Implement route-based code splitting
- [ ] Use React.lazy() for component-level splitting
- [ ] Consider moving large third-party libraries to CDN

### Monitoring
- [ ] Set up automated bundle size monitoring in CI/CD
- [ ] Track bundle size changes in pull requests
- [ ] Monitor Core Web Vitals in production

## Next Steps

1. **Interactive Analysis:** Check browser for bundle analyzer visualization
2. **Code Splitting:** Implement lazy loading for large components
3. **Vendor Optimization:** Split large third-party libraries
4. **Monitoring:** Set up bundle size tracking in CI/CD

## Commands

\`\`\`bash
# Run bundle analysis
./scripts/analyze-bundle.sh

# View current bundles
find .next/static -name "*.js" -o -name "*.css" | xargs ls -lah

# Docker bundle analysis
ANALYZE=true ./scripts/quick-restart.sh
\`\`\`
EOF

echo "📋 Detailed report saved to docs/performance/bundle-analysis.md"

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
echo "✨ Bundle Analysis Complete!"
echo ""
echo "📊 Results Summary:"
echo "   • JavaScript: ${JS_TOTAL}MB total"
echo "   • CSS: ${CSS_TOTAL}MB total" 
echo "   • Size violations: $TOTAL_VIOLATIONS"
echo "   • Detailed report: docs/performance/bundle-analysis.md"
echo ""
echo "🔍 Next Steps:"
echo "   1. Review bundle-analysis.md for optimization recommendations"
echo "   2. Open .next/analyze/*.html for interactive bundle exploration"
echo "   3. Implement code splitting for oversized bundles"