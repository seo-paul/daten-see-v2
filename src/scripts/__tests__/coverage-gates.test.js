/**
 * Coverage Gates Tests
 * Tests the coverage gates implementation for AI Safety
 */

const { 
  checkFileCoverage, 
  getThresholdForFile, 
  COVERAGE_THRESHOLDS, 
  GLOBAL_MINIMUMS 
} = require('../../../scripts/coverage-gates');

describe('Coverage Gates Implementation', () => {
  describe('Threshold Detection', () => {
    it('should identify critical files correctly', () => {
      const criticalFiles = [
        'src/lib/auth/token.ts',
        'src/contexts/AuthContext.tsx',
        'src/lib/api/client.ts',
        'src/hooks/useDashboards.ts'
      ];

      criticalFiles.forEach(filePath => {
        const threshold = getThresholdForFile(filePath);
        expect(threshold.category).toBe('critical');
        expect(threshold.statements).toBe(90);
        expect(threshold.branches).toBe(85);
      });
    });

    it('should identify core files correctly', () => {
      const coreFiles = [
        'src/components/auth/LoginForm.tsx',
        'src/components/dashboard/DashboardCard.tsx',
        'src/lib/tanstack-query/config.ts',
        'src/lib/monitoring/logger.config.ts'
      ];

      coreFiles.forEach(filePath => {
        const threshold = getThresholdForFile(filePath);
        expect(threshold.category).toBe('core');
        expect(threshold.statements).toBe(80);
        expect(threshold.branches).toBe(75);
      });
    });

    it('should identify UI files correctly', () => {
      const uiFiles = [
        'src/components/ui/Button.tsx',
        'src/components/brand/Logo.tsx',
        'src/components/layout/MainLayout.tsx'
      ];

      uiFiles.forEach(filePath => {
        const threshold = getThresholdForFile(filePath);
        expect(threshold.category).toBe('ui');
        expect(threshold.statements).toBe(60);
        expect(threshold.branches).toBe(50);
      });
    });

    it('should exclude test files and stories', () => {
      const excludedFiles = [
        'src/components/__tests__/Button.test.tsx',
        'src/components/Button.stories.tsx',
        'src/types/api.d.ts',
        'src/app/dashboard/page.tsx',
        'src/app/layout.tsx'
      ];

      excludedFiles.forEach(filePath => {
        const threshold = getThresholdForFile(filePath);
        expect(threshold).toBeNull();
      });
    });

    it('should fall back to global minimums for unmatched files', () => {
      const unmatchedFiles = [
        'src/some/random/file.ts',
        'src/new/feature/component.tsx'
      ];

      unmatchedFiles.forEach(filePath => {
        const threshold = getThresholdForFile(filePath);
        expect(threshold.category).toBe('global');
        expect(threshold.statements).toBe(GLOBAL_MINIMUMS.statements);
      });
    });
  });

  describe('Coverage Validation', () => {
    it('should pass files with adequate coverage', () => {
      const mockFileCoverage = {
        statements: { pct: 95 },
        branches: { pct: 90 },
        functions: { pct: 95 },
        lines: { pct: 95 }
      };

      const result = checkFileCoverage('src/lib/auth/token.ts', mockFileCoverage);
      
      expect(result.passed).toBe(true);
      expect(result.category).toBe('critical');
      expect(result.failures).toEqual([]);
      expect(result.excluded).toBe(false);
    });

    it('should fail files with inadequate coverage', () => {
      const mockFileCoverage = {
        statements: { pct: 70 }, // Below 90% critical threshold
        branches: { pct: 60 },   // Below 85% critical threshold
        functions: { pct: 95 },  // Above threshold
        lines: { pct: 85 }       // Below 90% critical threshold
      };

      const result = checkFileCoverage('src/lib/auth/token.ts', mockFileCoverage);
      
      expect(result.passed).toBe(false);
      expect(result.category).toBe('critical');
      expect(result.failures).toHaveLength(3);
      expect(result.excluded).toBe(false);

      // Check specific failures
      const failureMetrics = result.failures.map(f => f.metric);
      expect(failureMetrics).toContain('statements');
      expect(failureMetrics).toContain('branches');
      expect(failureMetrics).toContain('lines');
      expect(failureMetrics).not.toContain('functions');
    });

    it('should calculate coverage gaps correctly', () => {
      const mockFileCoverage = {
        statements: { pct: 75 }, // 15% gap from 90%
        branches: { pct: 70 },   // 15% gap from 85%
        functions: { pct: 85 },  // 5% gap from 90%
        lines: { pct: 80 }       // 10% gap from 90%
      };

      const result = checkFileCoverage('src/lib/auth/token.ts', mockFileCoverage);
      
      expect(result.passed).toBe(false);
      expect(result.failures).toHaveLength(4);

      // Check gap calculations
      const statementsFailure = result.failures.find(f => f.metric === 'statements');
      expect(statementsFailure.gap).toBe(15);

      const branchesFailure = result.failures.find(f => f.metric === 'branches');
      expect(branchesFailure.gap).toBe(15);

      const functionsFailure = result.failures.find(f => f.metric === 'functions');
      expect(functionsFailure.gap).toBe(5);

      const linesFailure = result.failures.find(f => f.metric === 'lines');
      expect(linesFailure.gap).toBe(10);
    });

    it('should handle UI files with lower thresholds', () => {
      const mockFileCoverage = {
        statements: { pct: 65 }, // Above 60% UI threshold
        branches: { pct: 55 },   // Above 50% UI threshold
        functions: { pct: 65 },  // Above 60% UI threshold
        lines: { pct: 65 }       // Above 60% UI threshold
      };

      const result = checkFileCoverage('src/components/ui/Button.tsx', mockFileCoverage);
      
      expect(result.passed).toBe(true);
      expect(result.category).toBe('ui');
      expect(result.failures).toEqual([]);
    });

    it('should exclude specified files from coverage requirements', () => {
      const mockFileCoverage = {
        statements: { pct: 0 },
        branches: { pct: 0 },
        functions: { pct: 0 },
        lines: { pct: 0 }
      };

      const result = checkFileCoverage('src/components/__tests__/Button.test.tsx', mockFileCoverage);
      
      expect(result.passed).toBe(true);
      expect(result.excluded).toBe(true);
    });
  });

  describe('Configuration Validation', () => {
    it('should have valid coverage thresholds', () => {
      // Check that all threshold categories have required metrics
      const requiredMetrics = ['statements', 'branches', 'functions', 'lines'];
      
      Object.entries(COVERAGE_THRESHOLDS).forEach(([, config]) => {
        requiredMetrics.forEach(metric => {
          expect(config[metric]).toBeDefined();
          expect(typeof config[metric]).toBe('number');
          expect(config[metric]).toBeGreaterThan(0);
          expect(config[metric]).toBeLessThanOrEqual(100);
        });

        // Check files array exists
        expect(Array.isArray(config.files)).toBe(true);
        expect(config.files.length).toBeGreaterThan(0);
      });
    });

    it('should have reasonable threshold ordering', () => {
      // Critical should have highest thresholds
      expect(COVERAGE_THRESHOLDS.critical.statements).toBeGreaterThan(COVERAGE_THRESHOLDS.core.statements);
      expect(COVERAGE_THRESHOLDS.critical.statements).toBeGreaterThan(COVERAGE_THRESHOLDS.ui.statements);
      
      // Core should be higher than UI
      expect(COVERAGE_THRESHOLDS.core.statements).toBeGreaterThan(COVERAGE_THRESHOLDS.ui.statements);
      
      // UI should be higher than utils
      expect(COVERAGE_THRESHOLDS.ui.statements).toBeGreaterThan(COVERAGE_THRESHOLDS.utils.statements);
    });

    it('should have global minimums below category thresholds', () => {
      // Global minimums should be achievable fallbacks
      expect(GLOBAL_MINIMUMS.statements).toBeLessThan(COVERAGE_THRESHOLDS.utils.statements);
      expect(GLOBAL_MINIMUMS.branches).toBeLessThan(COVERAGE_THRESHOLDS.utils.branches);
      expect(GLOBAL_MINIMUMS.functions).toBeLessThan(COVERAGE_THRESHOLDS.utils.functions);
      expect(GLOBAL_MINIMUMS.lines).toBeLessThan(COVERAGE_THRESHOLDS.utils.lines);
    });
  });

  describe('AI Safety Requirements', () => {
    it('should enforce high coverage for authentication code', () => {
      const authFiles = [
        'src/lib/auth/token.ts',
        'src/contexts/AuthContext.tsx'
      ];

      authFiles.forEach(filePath => {
        const threshold = getThresholdForFile(filePath);
        
        // Auth code should require very high coverage for security
        expect(threshold.statements).toBeGreaterThanOrEqual(90);
        expect(threshold.branches).toBeGreaterThanOrEqual(85);
        expect(threshold.functions).toBeGreaterThanOrEqual(90);
        expect(threshold.lines).toBeGreaterThanOrEqual(90);
      });
    });

    it('should enforce high coverage for API integration code', () => {
      const apiFiles = [
        'src/lib/api/client.ts',
        'src/lib/api/dashboard.ts'
      ];

      apiFiles.forEach(filePath => {
        const threshold = getThresholdForFile(filePath);
        
        // API code should require high coverage to prevent data corruption
        expect(threshold.statements).toBeGreaterThanOrEqual(90);
        expect(threshold.branches).toBeGreaterThanOrEqual(85);
      });
    });

    it('should allow reasonable coverage for UI components', () => {
      const uiFiles = [
        'src/components/ui/Button.tsx',
        'src/components/brand/Logo.tsx'
      ];

      uiFiles.forEach(filePath => {
        const threshold = getThresholdForFile(filePath);
        
        // UI components can have lower coverage as they're less critical
        expect(threshold.statements).toBeLessThanOrEqual(60);
        expect(threshold.branches).toBeLessThanOrEqual(50);
      });
    });

    it('should completely exclude non-testable files', () => {
      const nonTestableFiles = [
        'src/app/page.tsx',                    // Next.js pages
        'src/app/layout.tsx',                  // Next.js layouts
        'src/components/Button.stories.tsx',  // Storybook stories
        'src/types/global.d.ts',              // TypeScript definitions
        'src/__tests__/setup.ts'              // Test setup files
      ];

      nonTestableFiles.forEach(filePath => {
        const threshold = getThresholdForFile(filePath);
        expect(threshold).toBeNull();
      });
    })
  });
});