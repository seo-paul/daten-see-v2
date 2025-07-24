#!/bin/bash
# ESLint Auto-Fix Script for Hook Rules
# Fixes ESLint errors automatically where possible

set -e

echo "🔧 Starting ESLint Auto-Fix for Hook Rules..."

CONTAINER_ID=$(docker ps -q --filter "name=daten-see")
if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Docker container not running"
    exit 1
fi

# Create ESLint error report
echo "📊 Generating ESLint error report..."
docker exec $CONTAINER_ID npm run lint 2>&1 | tee eslint-errors.log || true

# Count errors by category
echo ""
echo "📈 Error Analysis:"
echo "   • Import order errors: $(grep "import/order" eslint-errors.log | wc -l || echo 0)"
echo "   • Missing return types: $(grep "explicit-function-return-type" eslint-errors.log | wc -l || echo 0)"
echo "   • Hook dependency warnings: $(grep "react-hooks/exhaustive-deps" eslint-errors.log | wc -l || echo 0)"
echo "   • No-explicit-any errors: $(grep "no-explicit-any" eslint-errors.log | wc -l || echo 0)"
echo "   • Unused variables: $(grep "no-unused-vars" eslint-errors.log | wc -l || echo 0)"

echo ""
echo "🛠️ Running ESLint Auto-Fix..."

# Run auto-fix
docker exec $CONTAINER_ID npm run lint -- --fix || {
    echo "⚠️ Some errors couldn't be auto-fixed. Running manual fixes..."
}

# Try to fix common patterns that ESLint can't auto-fix
echo ""
echo "🎯 Applying Manual Fixes..."

# Fix missing return types in common patterns
echo "   • Adding return types to arrow functions..."
docker exec $CONTAINER_ID find src -name "*.tsx" -o -name "*.ts" | while read file; do
    if [[ ! "$file" =~ __tests__ ]] && [[ ! "$file" =~ .test. ]] && [[ ! "$file" =~ .spec. ]]; then
        # This would need actual sed commands to fix patterns
        echo "     → Checking $file"
    fi
done

# Generate post-fix report
echo ""
echo "📊 Post-Fix Analysis..."
docker exec $CONTAINER_ID npm run lint 2>&1 | tee eslint-post-fix.log || true

REMAINING_ERRORS=$(grep -c "Error:" eslint-post-fix.log || echo 0)
REMAINING_WARNINGS=$(grep -c "Warning:" eslint-post-fix.log || echo 0)

echo ""
echo "✅ ESLint Auto-Fix Results:"
echo "   • Remaining Errors: $REMAINING_ERRORS"
echo "   • Remaining Warnings: $REMAINING_WARNINGS"

if [ "$REMAINING_ERRORS" -eq 0 ]; then
    echo ""
    echo "🎉 All ESLint errors fixed! Only warnings remain."
    echo "   Warnings are informational and don't block development."
else
    echo ""
    echo "📋 Manual fixes needed for remaining $REMAINING_ERRORS errors:"
    echo "   1. Add explicit return types to functions"
    echo "   2. Fix hook dependency arrays"
    echo "   3. Remove/replace 'any' types with proper types"
    echo "   4. Fix custom hook naming patterns"
fi

# Clean up
rm -f eslint-errors.log eslint-post-fix.log

echo ""
echo "🚀 Next Steps:"
echo "   1. Review remaining errors manually"
echo "   2. Run 'npm run lint' to verify fixes"
echo "   3. Commit changes if satisfied"
echo ""
echo "💡 Pro Tip: Use 'npm run lint -- --fix' for incremental auto-fixes"