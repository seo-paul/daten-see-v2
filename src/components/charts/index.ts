/**
 * Chart Components Export
 * Professional business intelligence charts with Design System v2.3 theming
 */

// Simple chart components (fallback)
export { SimpleChart, SimpleKPICard } from './SimpleChart';

// Chart.js wrapper components (primary)
export {
  DashboardLineChart,
  DashboardBarChart,
  DashboardPieChart,
  DashboardDoughnutChart,
  DashboardKPICard,
  type SimpleChartData,
  type ChartWrapperProps,
} from './ChartWrapper';

// Original Chart.js components (TypeScript issues - deferred)
// export { LineChart, MultiLineChart, TrendLineChart } from './LineChart';
// export { BarChart, StackedBarChart, GroupedBarChart, MetricBarChart } from './BarChart';
// export { PieChart, DoughnutChart, DonutProgress } from './PieChart';
// export { KPICard, CompactKPICard, KPIGrid } from './KPICard';

// Chart configuration and utilities
export { 
  CHART_COLORS, 
  getDefaultChartOptions, 
  createChartDataset, 
  formatChartValue, 
  formatTooltip, 
  generateMockData 
} from '@/lib/charts/config';

// Re-export types for convenience
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';
export type ChartUnit = 'currency' | 'percentage' | 'number';
export type TrendDirection = 'up' | 'down' | 'neutral';