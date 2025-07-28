#!/bin/bash

# Script to update Design System v2.3 colors across all components
# Replaces old colors (bg-white, text-gray) with new beige tokens

echo "🎨 Updating Design System v2.3 colors..."

# List of files to update (excluding design-system page which already has correct colors)
FILES=(
  "src/app/auth-demo/page.tsx"
  "src/components/auth/ProtectedRoute.tsx"
  "src/shared/components/ErrorBoundary.tsx"
  "src/shared/components/specialized/WidgetErrorBoundary.tsx"
  "src/shared/components/specialized/ComponentErrorBoundary.tsx"
  "src/shared/components/specialized/PageErrorBoundary.tsx"
  "src/app/api-test/page.tsx"
  "src/components/dashboard/EditDashboardModal.tsx"
  "src/components/dashboard/CreateDashboardModal.tsx"
  "src/app/dev-tools/page.tsx"
  "src/app/dashboards/page.tsx"
  "src/app/dashboard/page.tsx"
  "src/components/performance/WebVitalsDisplay.tsx"
  "src/components/navigation/Breadcrumbs.tsx"
  "src/components/ErrorBoundary.tsx"
  "src/app/dashboard/[id]/page.tsx"
  "src/app/dashboard/[id]/not-found.tsx"
  "src/app/community/page.tsx"
  "src/components/layout/DashboardGrid.tsx"
  "src/components/layout/DashboardHeader.tsx"
  "src/app/page.tsx"
  "src/app/global-error.tsx"
)

# Define color replacements
declare -A REPLACEMENTS=(
  # Background colors
  ["bg-white"]="bg-[#FDF9F3]"
  ["bg-gray-50"]="bg-[#FEFCF9]"
  ["bg-gray-100"]="bg-[#F6F0E0]"
  ["bg-gray-200"]="bg-[#F3EBD6]"
  ["bg-gray-400"]="bg-[#3d3d3d]/40"
  ["bg-gray-800"]="bg-[#3d3d3d]"
  
  # Text colors  
  ["text-gray-400"]="text-[#3d3d3d]/50"
  ["text-gray-500"]="text-[#3d3d3d]/60"
  ["text-gray-600"]="text-[#3d3d3d]/70"
  ["text-gray-700"]="text-[#3d3d3d]"
  ["text-gray-900"]="text-[#3d3d3d]"
  
  # Border colors
  ["border-gray-100"]="border-[#E6D7B8]"
  ["border-gray-200"]="border-[#E6D7B8]"
  ["border-gray-300"]="border-[#E6D7B8]"
  
  # Placeholder colors
  ["placeholder-gray-400"]="placeholder-[#3d3d3d]/50"
  
  # Blue colors (using Design System v2.3 blue tokens)
  ["bg-blue-50"]="bg-[#FBF5ED]"
  ["bg-blue-100"]="bg-[#F9F2E7]"
  ["bg-blue-600"]="bg-[#2F4F73]"
  ["bg-blue-700"]="bg-[#365C83]"
  ["text-blue-600"]="text-[#2F4F73]"
  ["text-blue-700"]="text-[#365C83]"
  ["border-blue-200"]="border-[#E6D7B8]"
  ["focus:ring-blue-500"]="focus:ring-[#2F4F73]"
  ["focus:border-blue-500"]="focus:border-[#2F4F73]"
  ["hover:bg-blue-100"]="hover:bg-[#F9F2E7]"
  ["hover:bg-blue-700"]="hover:bg-[#365C83]"
)

# Function to update a single file
update_file() {
  local file="$1"
  
  if [[ ! -f "$file" ]]; then
    echo "⚠️  File not found: $file"
    return
  fi
  
  echo "📝 Updating: $file"
  
  # Create a temporary file for replacements
  local temp_file=$(mktemp)
  cp "$file" "$temp_file"
  
  # Apply all replacements
  for old_color in "${!REPLACEMENTS[@]}"; do
    local new_color="${REPLACEMENTS[$old_color]}"
    # Use sed to replace all occurrences
    sed -i.bak "s/${old_color}/${new_color}/g" "$temp_file"
  done
  
  # Check if file was actually changed
  if ! cmp -s "$file" "$temp_file"; then
    mv "$temp_file" "$file"
    echo "  ✅ Updated"
  else
    rm "$temp_file"
    echo "  ➖ No changes needed"
  fi
  
  # Clean up backup file
  [[ -f "${temp_file}.bak" ]] && rm "${temp_file}.bak"
}

# Update all files
for file in "${FILES[@]}"; do
  update_file "$file"
done

echo ""
echo "🎨 Design System v2.3 color update complete!"
echo ""
echo "📋 Summary of changes:"
echo "  • bg-white → bg-[#FDF9F3] (Primary cards)"
echo "  • bg-gray-50 → bg-[#FEFCF9] (Page background)"  
echo "  • text-gray-* → text-[#3d3d3d] variants"
echo "  • border-gray-* → border-[#E6D7B8]"
echo "  • Blue colors → Design System v2.3 blue tokens"
echo ""
echo "🔍 Next steps:"
echo "  1. Run 'npm run lint' to check for issues"
echo "  2. Test components in browser"
echo "  3. Verify visual consistency"