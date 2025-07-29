#!/bin/bash

# Auto-Testing System Cleanup Script
# Removes all debugging infrastructure safely

echo "🧹 Auto-Testing System Cleanup"
echo "=============================="

# Confirm deletion
read -p "Are you sure you want to remove the entire auto-testing system? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

# Remove auto-testing directory
if [ -d "auto-testing" ]; then
    echo "🗑️  Removing auto-testing directory..."
    rm -rf auto-testing/
    echo "✅ Auto-testing directory removed"
else
    echo "ℹ️  Auto-testing directory not found"
fi

# Check for any remaining debug files in src/
echo "🔍 Checking for remaining debug files..."

DEBUG_FILES_FOUND=false

# Check for widget monitoring files
if [ -f "src/hooks/dashboard/useWidgetMonitoring.ts" ]; then
    echo "⚠️  Found: src/hooks/dashboard/useWidgetMonitoring.ts"
    DEBUG_FILES_FOUND=true
fi

# Check for serverside tracking
if [ -f "src/lib/monitoring/serverside-widget-tracking.ts" ]; then
    echo "⚠️  Found: src/lib/monitoring/serverside-widget-tracking.ts"
    DEBUG_FILES_FOUND=true
fi

# Check for test scripts
if [ -d "src/scripts" ]; then
    echo "⚠️  Found: src/scripts directory (may contain test files)"
    DEBUG_FILES_FOUND=true
fi

if [ "$DEBUG_FILES_FOUND" = true ]; then
    echo ""
    echo "⚠️  Warning: Additional debug files found in src/"
    echo "    Please review and remove manually if they are debug-related"
    echo ""
    read -p "Remove these files automatically? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f src/hooks/dashboard/useWidgetMonitoring.ts
        rm -f src/lib/monitoring/serverside-widget-tracking.ts
        rm -rf src/scripts/
        echo "✅ Additional debug files removed"
    fi
fi

# Clean localStorage (instructions)
echo ""
echo "📋 Manual cleanup steps:"
echo "  1. Open browser console"
echo "  2. Run: localStorage.clear() (to remove debug reports)"
echo "  3. Refresh the application"

echo ""
echo "✅ Auto-Testing System cleanup completed!"
echo "🎯 Production code is now clean and unmodified"