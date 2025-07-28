#!/usr/bin/env node

/**
 * Coverage Gates Implementation
 * AI Safety Infrastructure - Prevents deployment of under-tested code
 * 
 * CRITICAL for AI Safety - ensures code coverage never drops below safe thresholds
 */

const fs = require('fs');
const path = require('path');

// Coverage thresholds for different file types
const COVERAGE_THRESHOLDS = {
  // Critical business logic - highest coverage required
  critical: {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90,
    files: [
      'src/lib/auth/**',
      'src/contexts/**',
      'src/lib/api/**',
      'src/hooks/**'
    ]
  },
  
  // Core application logic - high coverage required
  core: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
    files: [
      'src/components/auth/**',
      'src/components/dashboard/**',
      'src/lib/tanstack-query/**',
      'src/lib/monitoring/**'
    ]
  },
  
  // UI components - moderate coverage acceptable
  ui: {
    statements: 60,
    branches: 50,
    functions: 60,
    lines: 60,
    files: [
      'src/components/ui/**',
      'src/components/brand/**',
      'src/components/layout/**'
    ]
  },
  
  // Configuration and utilities - basic coverage
  utils: {
    statements: 50,
    branches: 40,
    functions: 50,
    lines: 50,
    files: [
      'src/lib/utils/**',
      'src/types/**',
      'src/config/**'
    ]
  }
};

// Global minimum thresholds (fallback)
const GLOBAL_MINIMUMS = {
  statements: 35,
  branches: 30,
  functions: 35,
  lines: 35
};

// Files to exclude from coverage requirements
const EXCLUDED_FILES = [
  '**/*.d.ts',
  '**/*.stories.js',
  '**/*.stories.jsx', 
  '**/*.stories.ts',
  '**/*.stories.tsx',
  '**/__tests__/**',
  '**/__mocks__/**',
  '**/node_modules/**',
  'src/app/**/page.tsx',           // Next.js pages (UI focused)
  'src/app/**/layout.tsx',         // Next.js layouts (UI focused)
  'src/app/**/loading.tsx',        // Next.js loading components
  'src/app/**/error.tsx',          // Next.js error components
];

/**
 * Load coverage summary from Jest output
 */
function loadCoverageSummary() {
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  
  if (!fs.existsSync(coveragePath)) {
    console.error('❌ Coverage summary not found. Run tests with coverage first: npm run test:coverage');
    process.exit(1);
  }
  
  try {
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    return coverage;
  } catch (error) {
    console.error('❌ Failed to parse coverage summary:', error.message);
    process.exit(1);
  }
}

/**
 * Check if file matches any pattern in array
 */
function matchesPatterns(filePath, patterns) {
  return patterns.some(pattern => {
    // Simple pattern matching that handles the most common cases
    
    // Exact match
    if (pattern === filePath) {
      return true;
    }
    
    // Handle **/__tests__/** specifically
    if (pattern === '**/__tests__/**') {
      return filePath.includes('/__tests__/');
    }
    
    // Handle **/__mocks__/** specifically
    if (pattern === '**/__mocks__/**') {
      return filePath.includes('/__mocks__/');
    }
    
    // Handle ** at start with specific extension patterns
    if (pattern.startsWith('**/')) {
      const suffix = pattern.slice(3);
      
      // For file patterns like **/*.d.ts
      if (suffix.includes('*')) {
        // Convert to simple regex
        const regexSuffix = suffix
          .replace(/\./g, '\\.')
          .replace(/\*/g, '[^/]*');
        const regex = new RegExp(regexSuffix + '$');
        const fileName = filePath.split('/').pop() || '';
        return regex.test(fileName);
      }
      
      return filePath.endsWith('/' + suffix) || filePath.includes('/' + suffix);
    }
    
    // Handle ** at end (e.g., "src/components/**")
    if (pattern.endsWith('/**')) {
      const prefix = pattern.slice(0, -3);
      return filePath.startsWith(prefix + '/');
    }
    
    // Handle patterns with ** in middle (e.g., "src/app/**/page.tsx")
    if (pattern.includes('**/')) {
      const parts = pattern.split('**/');
      if (parts.length === 2) {
        const [prefix, suffix] = parts;
        return filePath.startsWith(prefix) && filePath.endsWith(suffix);
      }
    }
    
    // Handle single * (e.g., "*.test.js")
    // Convert to regex, escaping dots but keeping * as wildcard
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  });
}

/**
 * Determine coverage threshold for a file
 */
function getThresholdForFile(filePath) {
  // Check if file should be excluded
  if (matchesPatterns(filePath, EXCLUDED_FILES)) {
    return null;
  }
  
  // Find matching threshold category
  for (const [category, config] of Object.entries(COVERAGE_THRESHOLDS)) {
    if (matchesPatterns(filePath, config.files)) {
      return { category, ...config };
    }
  }
  
  // Return global minimums as fallback
  return { category: 'global', ...GLOBAL_MINIMUMS };
}

/**
 * Check individual file coverage
 */
function checkFileCoverage(filePath, fileCoverage) {
  const threshold = getThresholdForFile(filePath);
  
  if (!threshold) {
    return { passed: true, excluded: true };
  }
  
  const failures = [];
  const metrics = ['statements', 'branches', 'functions', 'lines'];
  
  for (const metric of metrics) {
    const actual = fileCoverage[metric].pct;
    const required = threshold[metric];
    
    if (actual < required) {
      failures.push({
        metric,
        actual,
        required,
        gap: required - actual
      });
    }
  }
  
  return {
    passed: failures.length === 0,
    category: threshold.category,
    failures,
    excluded: false
  };
}

/**
 * Generate coverage report with recommendations
 */
function generateCoverageReport(results) {
  const totalFiles = results.length;
  const passedFiles = results.filter(r => r.result.passed).length;
  const excludedFiles = results.filter(r => r.result.excluded).length;
  const failedFiles = results.filter(r => !r.result.passed && !r.result.excluded).length;
  
  console.log('\n📊 Coverage Gates Report');
  console.log('========================\n');
  
  console.log(`Total Files Analyzed: ${totalFiles}`);
  console.log(`✅ Passed: ${passedFiles}`);
  console.log(`❌ Failed: ${failedFiles}`);
  console.log(`⏭️  Excluded: ${excludedFiles}\n`);
  
  if (failedFiles > 0) {
    console.log('❌ COVERAGE FAILURES:');
    console.log('====================\n');
    
    // Group failures by category
    const failuresByCategory = {};
    
    results
      .filter(r => !r.result.passed && !r.result.excluded)
      .forEach(({ filePath, result }) => {
        if (!failuresByCategory[result.category]) {
          failuresByCategory[result.category] = [];
        }
        failuresByCategory[result.category].push({ filePath, result });
      });
    
    for (const [category, failures] of Object.entries(failuresByCategory)) {
      console.log(`📁 ${category.toUpperCase()} FILES:`);
      
      failures.forEach(({ filePath, result }) => {
        console.log(`   ${filePath}`);
        result.failures.forEach(failure => {
          console.log(`     ${failure.metric}: ${failure.actual}% (need ${failure.required}%, gap: ${failure.gap.toFixed(1)}%)`);
        });
        console.log('');
      });
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('===================\n');
    
    // Provide specific recommendations
    const criticalFailures = results.filter(r => !r.result.passed && r.result.category === 'critical');
    const coreFailures = results.filter(r => !r.result.passed && r.result.category === 'core');
    
    if (criticalFailures.length > 0) {
      console.log('🚨 CRITICAL: These files handle authentication, API calls, or core business logic.');
      console.log('   High test coverage is essential for security and reliability.');
      criticalFailures.forEach(({ filePath }) => {
        console.log(`   - Add comprehensive tests for ${filePath}`);
      });
      console.log('');
    }
    
    if (coreFailures.length > 0) {
      console.log('⚠️  CORE: These files contain important application logic.');
      console.log('   Improve test coverage to prevent regressions.');
      coreFailures.forEach(({ filePath }) => {
        console.log(`   - Add integration tests for ${filePath}`);
      });
      console.log('');
    }
    
    console.log('📝 Quick wins:');
    console.log('   1. Add happy path tests for main functions');
    console.log('   2. Test error handling scenarios');
    console.log('   3. Add edge case validation');
    console.log('');
  } else {
    console.log('✅ All files meet coverage requirements!');
    console.log('');
  }
  
  return failedFiles === 0;
}

/**
 * Check global coverage thresholds
 */
function checkGlobalCoverage(coverage) {
  const global = coverage.total;
  const failures = [];
  
  for (const [metric, threshold] of Object.entries(GLOBAL_MINIMUMS)) {
    const actual = global[metric].pct;
    if (actual < threshold) {
      failures.push({
        metric,
        actual,
        threshold,
        gap: threshold - actual
      });
    }
  }
  
  if (failures.length > 0) {
    console.log('🌍 GLOBAL COVERAGE FAILURES:');
    console.log('============================\n');
    
    failures.forEach(failure => {
      console.log(`${failure.metric}: ${failure.actual}% (minimum: ${failure.threshold}%, gap: ${failure.gap.toFixed(1)}%)`);
    });
    console.log('');
    
    return false;
  }
  
  console.log('✅ Global coverage thresholds met!');
  console.log('');
  return true;
}

/**
 * Save coverage gate results for CI/CD
 */
function saveCoverageGateResults(passed, results) {
  const output = {
    timestamp: new Date().toISOString(),
    passed,
    summary: {
      totalFiles: results.length,
      passedFiles: results.filter(r => r.result.passed).length,
      failedFiles: results.filter(r => !r.result.passed && !r.result.excluded).length,
      excludedFiles: results.filter(r => r.result.excluded).length,
    },
    failures: results
      .filter(r => !r.result.passed && !r.result.excluded)
      .map(({ filePath, result }) => ({
        filePath,
        category: result.category,
        failures: result.failures
      }))
  };
  
  const outputPath = path.join(process.cwd(), 'coverage', 'coverage-gates.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`📄 Coverage gate results saved to: ${outputPath}`);
  console.log('');
}

/**
 * Main coverage gate check
 */
function main() {
  console.log('🔒 AI Safety Coverage Gates');
  console.log('===========================\n');
  
  // Load coverage data
  const coverage = loadCoverageSummary();
  
  // Check individual file coverage
  const results = [];
  
  for (const [filePath, fileCoverage] of Object.entries(coverage)) {
    if (filePath === 'total') continue;
    
    const result = checkFileCoverage(filePath, fileCoverage);
    results.push({ filePath, result });
  }
  
  // Generate detailed report
  const filesPassed = generateCoverageReport(results);
  
  // Check global coverage
  const globalPassed = checkGlobalCoverage(coverage);
  
  // Overall result
  const overallPassed = filesPassed && globalPassed;
  
  // Save results for CI/CD integration
  saveCoverageGateResults(overallPassed, results);
  
  // Summary
  if (overallPassed) {
    console.log('🎉 ALL COVERAGE GATES PASSED!');
    console.log('Code is ready for deployment.');
    process.exit(0);
  } else {
    console.log('🚫 COVERAGE GATES FAILED!');
    console.log('Please improve test coverage before deployment.');
    console.log('');
    console.log('💡 TIP: Run `npm run test:coverage` to generate detailed coverage report.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkFileCoverage,
  getThresholdForFile,
  COVERAGE_THRESHOLDS,
  GLOBAL_MINIMUMS
};