#!/bin/bash
# TypeScript Strict Mode Error Fixing Script
# Systematically fixes TypeScript strict mode errors

set -e

echo "🔧 Starting TypeScript Strict Mode Error Fixing..."

CONTAINER_ID=$(docker ps -q --filter "name=daten-see")
if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Docker container not running"
    exit 1
fi

# Create typescript error report
echo "📊 Generating TypeScript error report..."
docker exec $CONTAINER_ID npm run typecheck 2>&1 | tee typescript-errors.log || true

# Count errors by category
echo ""
echo "📈 Error Analysis:"
echo "   • Module resolution errors: $(grep "Cannot find module" typescript-errors.log | wc -l || echo 0)"
echo "   • Implicit any errors: $(grep "implicitly has an 'any' type" typescript-errors.log | wc -l || echo 0)"
echo "   • Unused variable errors: $(grep "is declared but its value is never read" typescript-errors.log | wc -l || echo 0)"
echo "   • Optional property errors: $(grep "exactOptionalPropertyTypes" typescript-errors.log | wc -l || echo 0)"
echo "   • Override modifier errors: $(grep "override modifier" typescript-errors.log | wc -l || echo 0)"

# Fix strategy breakdown
echo ""
echo "🎯 Fix Strategy:"
echo "   1. Fix module resolution (@/ path issues)"
echo "   2. Add explicit types for implicit any"
echo "   3. Remove unused variables/parameters"
echo "   4. Fix optional property types"
echo "   5. Add override modifiers to class methods"

# Priority file list for fixing
echo ""
echo "🏆 Priority Files to Fix (most critical first):"
grep -E "src/(app|components|lib|shared|store)" typescript-errors.log | \
  cut -d'(' -f1 | sort | uniq -c | sort -nr | head -10 || echo "No specific files identified"

echo ""
echo "📋 Fixing Instructions:"
echo ""
echo "1. **Module Resolution Errors** (@ imports):"
echo "   - These are likely path mapping issues"
echo "   - Verify all @/ imports point to existing files"
echo ""
echo "2. **Implicit Any Errors** (missing types):"
echo "   - Add explicit parameter types: (param: any) → (param: SomeType)"
echo "   - Add return types to functions: function() → function(): ReturnType"
echo ""
echo "3. **Unused Variables** (declared but not used):"
echo "   - Remove unused imports and variables"
echo "   - Prefix with underscore if needed: unused → _unused"
echo ""
echo "4. **Optional Properties** (exactOptionalPropertyTypes):"
echo "   - Change optional?: Type → optional?: Type | undefined"
echo "   - Fix object assignments with undefined properties"
echo ""
echo "5. **Override Modifiers** (class inheritance):"
echo "   - Add override to overridden methods: method() → override method()"

# Generate fixing checklist
echo ""
echo "✅ Fixing Checklist:"
echo "   • [ ] Fix playwright.config.ts workers type"
echo "   • [ ] Fix missing @/ module imports"
echo "   • [ ] Add explicit types to function parameters"
echo "   • [ ] Remove unused variables and imports"
echo "   • [ ] Fix optional property assignments"
echo "   • [ ] Add override modifiers to class methods"
echo "   • [ ] Test after each category fix"

# Clean up
rm -f typescript-errors.log

echo ""
echo "🚀 Next Steps:"
echo "   1. Start with highest priority files"
echo "   2. Fix one category at a time"
echo "   3. Run 'npm run typecheck' after each fix"
echo "   4. Focus on files with most errors first"
echo ""
echo "💡 Pro Tip: Use 'docker exec container_name npm run typecheck | head -20'"
echo "   to see just the first 20 errors and work through them systematically"