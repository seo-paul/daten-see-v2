'use client';

import { 
  Package, 
  GitBranch,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Activity
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import QueryPerformanceDashboard from '@/components/dev/QueryPerformanceDashboard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, WidgetCard } from '@/components/ui/Card';

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

// Metric Row Component using Design System
interface MetricRowProps {
  label: string;
  value: string | number;
  status?: 'success' | 'warning' | 'error' | 'neutral';
}

function MetricRow({ label, value, status = 'neutral' }: MetricRowProps): React.ReactElement {
  const statusColors = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-danger',
    neutral: 'text-text-primary',
  };

  return (
    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-surface-secondary">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <span className={`text-sm font-bold ${statusColors[status]}`}>{value}</span>
    </div>
  );
}

// Status Badge Component
interface StatusBadgeProps {
  score: number;
  status: string;
}

function StatusBadge({ score }: StatusBadgeProps): React.ReactElement {
  const getStatusConfig = (score: number): { color: string; bg: string; border: string; icon: React.ElementType } => {
    if (score >= 90) return { color: 'text-success', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle };
    if (score >= 80) return { color: 'text-success', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle };
    if (score >= 70) return { color: 'text-warning', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle };
    return { color: 'text-danger', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle };
  };

  const config = getStatusConfig(score);
  const StatusIcon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${config.bg} ${config.border}`}>
      <StatusIcon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-semibold ${config.color}`}>
        Score: {score}/100
      </span>
    </div>
  );
}

// Action Item Card Component
interface ActionItemProps {
  type: 'critical' | 'medium' | 'low' | 'info' | 'success';
  title: string;
  description: string;
  icon: React.ElementType;
}

function ActionItemCard({ type, title, description, icon: Icon }: ActionItemProps): React.ReactElement {
  const typeConfig = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', iconColor: 'text-red-600' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', iconColor: 'text-yellow-600' },
    low: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', iconColor: 'text-orange-600' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', iconColor: 'text-blue-600' },
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', iconColor: 'text-green-600' },
  };

  const config = typeConfig[type];

  return (
    <div className={`p-4 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <span className={`font-semibold text-sm ${config.text}`}>{title}</span>
      </div>
      <p className={`text-sm ${config.text}`}>{description}</p>
    </div>
  );
}

export default function AdvancedDashboardPage(): React.ReactElement {
  const [metrics, setMetrics] = useState<RealMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMetrics = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('/debugging-dashboard/data/real-metrics.json?t=' + Date.now());
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch {
      // Error loading metrics
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000);
    return (): void => clearInterval(interval);
  }, [loadMetrics]);

  const formatTimestamp = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleString('de-DE');
    } catch {
      return timestamp;
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page">
        <Card className="max-w-md w-full" variant="elevated">
          <CardContent className="flex items-center gap-4 p-8">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Lade Dashboard...</h2>
              <p className="text-text-secondary">Projekt-Metriken werden aktualisiert</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page">
      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
        
        {/* Header */}
        <Card variant="elevated" size="lg">
          <CardHeader actions={
            <Button
              variant="primary"
              context="page"
              onClick={loadMetrics}
              loading={isLoading}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Aktualisieren
            </Button>
          }>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <CardTitle className="text-3xl font-display text-text-primary">
                  {metrics.project_overview.name}
                </CardTitle>
                <CardDescription className="text-lg">
                  Advanced Development Dashboard · Real-time Metrics
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-text-secondary" />
                <span className="text-text-secondary">
                  Letzte Aktualisierung: {formatTimestamp(metrics.last_updated)}
                </span>
              </div>
              <StatusBadge score={metrics.overall_score} status={metrics.overall_status} />
            </div>
          </CardContent>
        </Card>

        {/* TanStack Query Performance Dashboard */}
        <WidgetCard
          title="TanStack Query Performance"
          description="Real-time Query Cache Monitoring"
        >
          <QueryPerformanceDashboard />
        </WidgetCard>

        {/* Critical Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Code Quality */}
          <WidgetCard
            title="Code Quality"
            description="ESLint, TypeScript & Test Coverage"
          >
            <div className="mb-4">
              <StatusBadge score={metrics.code_quality.score} status="quality" />
            </div>
            <div className="space-y-3">
              <MetricRow 
                label="ESLint Errors" 
                value={metrics.code_quality.eslint_errors}
                status={metrics.code_quality.eslint_errors === 0 ? 'success' : 'error'}
              />
              <MetricRow 
                label="TypeScript Errors" 
                value={metrics.code_quality.typescript_errors}
                status={metrics.code_quality.typescript_errors === 0 ? 'success' : 'error'}
              />
              <MetricRow 
                label="Test Coverage" 
                value={`${metrics.code_quality.test_coverage}%`}
                status={metrics.code_quality.test_coverage >= 70 ? 'success' : 'warning'}
              />
              <MetricRow 
                label="ESLint Warnings" 
                value={metrics.code_quality.eslint_warnings}
                status={metrics.code_quality.eslint_warnings === 0 ? 'success' : 'warning'}
              />
            </div>
          </WidgetCard>

          {/* Project Overview */}
          <WidgetCard
            title="Projekt-Übersicht"
            description="Codebase Statistics"
          >
            <div className="space-y-3">
              <MetricRow label="Gesamt Dateien" value={metrics.project_overview.total_files} />
              <MetricRow label="Code-Zeilen" value={metrics.project_overview.total_lines.toLocaleString()} />
              <MetricRow label="TypeScript Dateien" value={metrics.project_overview.typescript_files} />
              <MetricRow label="Komponenten" value={metrics.project_overview.components} />
              <MetricRow label="Pages" value={metrics.project_overview.pages} />
              <MetricRow label="API Routes" value={metrics.project_overview.api_routes} />
            </div>
          </WidgetCard>

          {/* Infrastructure */}
          <WidgetCard
            title="Infrastructure"
            description="System & Build Status"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-surface-secondary">
                <span className="text-sm font-medium text-text-secondary">Docker Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    metrics.infrastructure.docker_status === 'running' ? 'bg-success' : 'bg-danger'
                  }`} />
                  <span className={`text-sm font-bold capitalize ${
                    metrics.infrastructure.docker_status === 'running' ? 'text-success' : 'text-danger'
                  }`}>
                    {metrics.infrastructure.docker_status}
                  </span>
                </div>
              </div>
              <MetricRow label="Container" value={metrics.infrastructure.docker_containers} />
              <MetricRow label="Bundle Size" value={`${metrics.performance.bundle_size_mb} MB`} />
              <MetricRow 
                label="Dependencies" 
                value={metrics.dependencies.total}
                status={metrics.dependencies.outdated > 0 ? 'warning' : 'success'}
              />
            </div>
          </WidgetCard>

        </div>

        {/* Extended Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <WidgetCard title="Testing">
            <div className="space-y-3">
              <MetricRow label="Test Dateien" value={metrics.testing.test_files} />
              <MetricRow label="E2E Tests" value={metrics.testing.e2e_test_files} />
              <MetricRow 
                label="Coverage" 
                value={`${metrics.testing.test_coverage}%`}
                status={metrics.testing.test_coverage >= 70 ? 'success' : 'warning'}
              />
            </div>
          </WidgetCard>

          <WidgetCard title="Error Handling">
            <div className="space-y-3">
              <MetricRow label="Try/Catch" value={metrics.error_handling.try_catch_blocks} />
              <MetricRow label="Error Boundaries" value={metrics.error_handling.error_boundaries} />
              <MetricRow 
                label="Console Logs" 
                value={metrics.code_quality.console_logs}
                status={metrics.code_quality.console_logs === 0 ? 'success' : 'warning'}
              />
            </div>
          </WidgetCard>

          <WidgetCard title="Performance">
            <div className="space-y-3">
              <MetricRow label="Lazy Imports" value={metrics.performance.lazy_imports} />
              <MetricRow label="Memoization" value={metrics.performance.memoization_usage} />
              <MetricRow label="TanStack Queries" value={metrics.api_integration.tanstack_queries} />
            </div>
          </WidgetCard>

          <WidgetCard title="Security & A11y">
            <div className="space-y-3">
              <MetricRow 
                label="Unsafe Patterns" 
                value={metrics.security.unsafe_patterns}
                status={metrics.security.unsafe_patterns === 0 ? 'success' : 'error'}
              />
              <MetricRow label="ARIA Attributes" value={metrics.accessibility.aria_attributes} />
              <MetricRow label="Alt Texts" value={metrics.accessibility.alt_texts} />
            </div>
          </WidgetCard>

        </div>

        {/* Action Items */}
        <WidgetCard
          title="Action Items"
          description="Prioritized improvements based on current metrics"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.code_quality.eslint_errors > 0 && (
              <ActionItemCard
                type="critical"
                title="Critical"
                description={`${metrics.code_quality.eslint_errors} ESLint Errors beheben`}
                icon={XCircle}
              />
            )}
            
            {metrics.code_quality.typescript_errors > 0 && (
              <ActionItemCard
                type="critical"
                title="Critical"
                description={`${metrics.code_quality.typescript_errors} TypeScript Errors beheben`}
                icon={XCircle}
              />
            )}
            
            {metrics.code_quality.test_coverage < 70 && (
              <ActionItemCard
                type="medium"
                title="Medium Priority"
                description={`Test Coverage auf 70%+ erhöhen (aktuell: ${metrics.code_quality.test_coverage}%)`}
                icon={AlertTriangle}
              />
            )}
            
            {metrics.dependencies.outdated > 0 && (
              <ActionItemCard
                type="low"
                title="Low Priority"
                description={`${metrics.dependencies.outdated} Dependencies aktualisieren`}
                icon={Package}
              />
            )}
            
            {metrics.git.files_changed > 0 && (
              <ActionItemCard
                type="info"
                title="Info"
                description={`${metrics.git.files_changed} geänderte Dateien committen`}
                icon={GitBranch}
              />
            )}
            
            {metrics.code_quality.eslint_errors === 0 && metrics.code_quality.typescript_errors === 0 && (
              <ActionItemCard
                type="success"
                title="Excellent"
                description="Keine kritischen Code-Qualitätsprobleme! 🎉"
                icon={CheckCircle}
              />
            )}
          </div>
        </WidgetCard>

        {/* Development Tips */}
        <Card variant="flat" className="bg-primary-50 border-primary-200">
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-primary-900">Development Tipp</span>
            </div>
            <p className="text-primary-800">
              Führe <code className="bg-primary-100 px-2 py-1 rounded font-mono text-sm">./scripts/collect-real-metrics.sh</code> aus, 
              um die Dashboard-Metriken zu aktualisieren. 
              Verwende <code className="bg-primary-100 px-2 py-1 rounded font-mono text-sm">window.queryDebug</code> in der Browser-Konsole 
              für TanStack Query Debugging.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}