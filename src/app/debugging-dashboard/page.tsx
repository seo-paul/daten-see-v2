'use client';

import { 
  AlertCircle, 
  FileCode, 
  Package, 
  GitBranch,
  Database,
  TrendingUp,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TestTube,
  Shield,
  Zap,
  MessageSquare,
  Bug
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface RealMetrics {
  timestamp: string;
  overall_status: string;
  overall_score: number;
  project_overview: {
    name: string;
    total_files: number;
    total_lines: number;
    typescript_files: number;
    javascript_files: number;
    components: number;
    pages: number;
    api_routes: number;
    largest_file_lines: number;
    average_file_size: number;
  };
  code_quality: {
    eslint_errors: number;
    eslint_warnings: number;
    typescript_errors: number;
    test_coverage: number;
    score: number;
    console_logs: number;
    debug_statements: number;
    todo_comments: number;
    comments_ratio: number;
  };
  testing: {
    test_files: number;
    e2e_test_files: number;
    test_coverage: number;
  };
  error_handling: {
    try_catch_blocks: number;
    error_boundaries: number;
  };
  performance: {
    lazy_imports: number;
    memoization_usage: number;
    bundle_size_mb: string;
  };
  security: {
    unsafe_patterns: number;
    env_variables: number;
  };
  accessibility: {
    aria_attributes: number;
    alt_texts: number;
  };
  state_management: {
    usestate_hooks: number;
    useeffect_hooks: number;
    context_providers: number;
  };
  api_integration: {
    fetch_calls: number;
    tanstack_queries: number;
  };
  dependencies: {
    total: number;
    dev: number;
    outdated: number;
  };
  infrastructure: {
    docker_status: string;
    docker_containers: number;
    docker_files: number;
    build_scripts: number;
  };
  documentation: {
    readme_files: number;
    comments_ratio: number;
  };
  git: {
    total_commits: number;
    files_changed: number;
    current_branch: string;
  };
  last_updated: string;
}

export default function SimpleDashboardPage(): React.ReactElement {
  const [metrics, setMetrics] = useState<RealMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMetrics = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('/debugging-dashboard/data/real-metrics.json?t=' + Date.now());
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        // Metrics loaded successfully
      } else {
        // Failed to fetch metrics
      }
    } catch {
      // Error loading metrics
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000); // Update every minute
    return (): void => clearInterval(interval);
  }, [loadMetrics]);

  const formatTimestamp = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleString('de-DE');
    } catch {
      return timestamp;
    }
  };

  const getStatusColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'needs-improvement':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-lg text-gray-600">Lade Projekt-Metriken...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Projekt Dashboard - {metrics.project_overview.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Echte Kennzahlen und aktueller Projektstatus
              </p>
            </div>
            <button
              onClick={loadMetrics}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Aktualisieren
            </button>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Zuletzt aktualisiert: {formatTimestamp(metrics.last_updated)}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(metrics.overall_status)}
              <span className={`font-semibold ${getStatusColor(metrics.overall_score)}`}>
                Gesamt-Score: {metrics.overall_score}/100
              </span>
            </div>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Code Quality */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Code-Qualität</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ESLint Errors</span>
                <span className="font-bold text-red-600">{metrics.code_quality.eslint_errors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ESLint Warnings</span>
                <span className="font-bold text-yellow-600">{metrics.code_quality.eslint_warnings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">TypeScript Errors</span>
                <span className="font-bold text-red-600">{metrics.code_quality.typescript_errors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Test Coverage</span>
                <span className="font-bold">{metrics.code_quality.test_coverage}%</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Qualitäts-Score</span>
                  <span className={`font-bold ${getStatusColor(metrics.code_quality.score)}`}>
                    {metrics.code_quality.score}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileCode className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Projekt-Übersicht</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gesamt Dateien</span>
                <span className="font-bold">{metrics.project_overview.total_files}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Code-Zeilen</span>
                <span className="font-bold">{metrics.project_overview.total_lines.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">TypeScript</span>
                <span className="font-bold">{metrics.project_overview.typescript_files} Dateien</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Komponenten</span>
                <span className="font-bold">{metrics.project_overview.components}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pages</span>
                <span className="font-bold">{metrics.project_overview.pages}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">API Routes</span>
                <span className="font-bold">{metrics.project_overview.api_routes}</span>
              </div>
            </div>
          </div>

          {/* Dependencies */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Dependencies</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Produktiv-Dependencies</span>
                <span className="font-bold">{metrics.dependencies.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Dev-Dependencies</span>
                <span className="font-bold">{metrics.dependencies.dev}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Veraltete Packages</span>
                <span className={`font-bold ${metrics.dependencies.outdated > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {metrics.dependencies.outdated}
                </span>
              </div>
            </div>
          </div>

          {/* Git Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Git Status</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Aktueller Branch</span>
                <span className="font-bold font-mono text-sm">{metrics.git.current_branch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gesamt Commits</span>
                <span className="font-bold">{metrics.git.total_commits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Geänderte Dateien</span>
                <span className={`font-bold ${metrics.git.files_changed > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {metrics.git.files_changed}
                </span>
              </div>
            </div>
          </div>

          {/* Docker & Bundle */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-cyan-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Infrastructure</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Docker Status</span>
                <span className={`font-bold ${metrics.infrastructure.docker_status === 'running' ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.infrastructure.docker_status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Container</span>
                <span className="font-bold">{metrics.infrastructure.docker_containers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bundle Size</span>
                <span className="font-bold">{metrics.performance.bundle_size_mb} MB</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Aktuelle Prioritäten</h2>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-900">🔴 {metrics.code_quality.eslint_errors} ESLint Errors beheben</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-900">🔴 {metrics.code_quality.typescript_errors} TypeScript Errors beheben</p>
              </div>
              {metrics.dependencies.outdated > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-900">🟠 {metrics.dependencies.outdated} Dependencies updaten</p>
                </div>
              )}
              {metrics.git.files_changed > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900">🟡 {metrics.git.files_changed} Dateien committen</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Extended Debugging Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Testing & Debugging */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TestTube className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Testing</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Test Dateien</span>
                <span className="font-bold">{metrics.testing.test_files}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">E2E Tests</span>
                <span className="font-bold">{metrics.testing.e2e_test_files}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Coverage</span>
                <span className="font-bold">{metrics.testing.test_coverage}%</span>
              </div>
            </div>
          </div>

          {/* Error Handling & Debugging */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Bug className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Debugging</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Console Logs</span>
                <span className={`font-bold ${metrics.code_quality.console_logs > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {metrics.code_quality.console_logs}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Debug Statements</span>
                <span className={`font-bold ${metrics.code_quality.debug_statements > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.code_quality.debug_statements}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Try/Catch Blocks</span>
                <span className="font-bold text-blue-600">{metrics.error_handling.try_catch_blocks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Error Boundaries</span>
                <span className="font-bold text-purple-600">{metrics.error_handling.error_boundaries}</span>
              </div>
            </div>
          </div>

          {/* Performance Patterns */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Performance</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lazy Imports</span>
                <span className="font-bold text-green-600">{metrics.performance.lazy_imports}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Memoization</span>
                <span className="font-bold text-blue-600">{metrics.performance.memoization_usage}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bundle Size</span>
                <span className="font-bold">{metrics.performance.bundle_size_mb} MB</span>
              </div>
            </div>
          </div>

          {/* Security & Accessibility */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Security & A11y</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Unsafe Patterns</span>
                <span className={`font-bold ${metrics.security.unsafe_patterns > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.security.unsafe_patterns}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ARIA Attributes</span>
                <span className="font-bold text-purple-600">{metrics.accessibility.aria_attributes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Alt Texts</span>
                <span className="font-bold text-blue-600">{metrics.accessibility.alt_texts}</span>
              </div>
            </div>
          </div>

        </div>

        {/* State Management & API */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* State Management Complexity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileCode className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">State Management</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">useState Hooks</span>
                <span className="font-bold">{metrics.state_management.usestate_hooks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">useEffect Hooks</span>
                <span className="font-bold">{metrics.state_management.useeffect_hooks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Context Providers</span>
                <span className="font-bold">{metrics.state_management.context_providers}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hook Density</span>
                  <span className="font-bold text-indigo-600">
                    {Math.round((metrics.state_management.usestate_hooks + metrics.state_management.useeffect_hooks) / metrics.project_overview.components * 10) / 10}/component
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* API & Network Integration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">API Integration</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fetch Calls</span>
                <span className="font-bold">{metrics.api_integration.fetch_calls}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">TanStack Queries</span>
                <span className="font-bold text-blue-600">{metrics.api_integration.tanstack_queries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Migration Progress</span>
                <span className={`font-bold ${metrics.api_integration.tanstack_queries > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.api_integration.tanstack_queries > 0 ? 'Started' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Code Quality Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Code Quality Details</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.code_quality.todo_comments}</div>
              <div className="text-gray-600">TODO Comments</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{metrics.code_quality.comments_ratio}%</div>
              <div className="text-gray-600">Comments Ratio</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{metrics.project_overview.largest_file_lines}</div>
              <div className="text-gray-600">Largest File (lines)</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{metrics.project_overview.average_file_size}</div>
              <div className="text-gray-600">Avg File Size</div>
            </div>
          </div>
        </div>

        {/* Update Info */}
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-900">
            💡 Tipp: Führe <code className="bg-blue-100 px-2 py-1 rounded">./scripts/collect-real-metrics.sh</code> aus, um die Metriken zu aktualisieren.
          </p>
        </div>

      </div>
    </div>
  );
}