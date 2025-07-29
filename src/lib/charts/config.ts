/**
 * Chart.js Configuration for Design System v2.3
 * Shared configuration and theming for all chart components
 */

import type {
  ChartOptions,
  TooltipItem,
} from 'chart.js';

// Design System v2.3 Colors
export const CHART_COLORS = {
  // Primary brand colors
  primary: '#2F4F73',
  primaryLight: '#365C83',
  
  // Background colors (beige palette)
  background: '#FDF9F3',
  backgroundSecondary: '#FBF5ED',
  backgroundTertiary: '#F5EFE7',
  
  // Text colors
  textPrimary: '#3d3d3d',
  textSecondary: '#5d5d5d',
  textMuted: '#7d7d7d',
  
  // Border colors
  border: '#E6D7B8',
  borderLight: '#F0E5C8',
  
  // Chart data colors - professional business palette
  dataColors: [
    '#2F4F73', // Primary blue
    '#4A7C59', // Forest green
    '#C5A572', // Gold
    '#8B4B6B', // Plum
    '#5B7FA6', // Light blue
    '#7A6B3A', // Olive
    '#B85450', // Rust red
    '#6B8B73', // Sage green
  ],
  
  // Status colors
  success: '#4A7C59',
  warning: '#C5A572',
  error: '#B85450',
  info: '#5B7FA6',
} as const;

/**
 * Default Chart.js options aligned with Design System v2.3
 */
export const getDefaultChartOptions = (type: 'line' | 'bar' | 'pie' | 'doughnut' = 'line'): ChartOptions => ({
  responsive: true,
  maintainAspectRatio: false,
  
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        font: {
          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          size: 12,
          weight: 400,
        },
        color: CHART_COLORS.textPrimary,
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    
    tooltip: {
      backgroundColor: CHART_COLORS.background,
      titleColor: CHART_COLORS.textPrimary,
      bodyColor: CHART_COLORS.textSecondary,
      borderColor: CHART_COLORS.border,
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      titleFont: {
        family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        size: 13,
        weight: 600,
      },
      bodyFont: {
        family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        size: 12,
        weight: 400,
      },
      displayColors: true,
      boxPadding: 4,
    },
  },
  
  // Scales configuration for line and bar charts
  ...(type === 'line' || type === 'bar' ? {
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: CHART_COLORS.borderLight,
        },
        ticks: {
          font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 11,
            weight: 400,
          },
          color: CHART_COLORS.textMuted,
          padding: 8,
        },
      },
      
      y: {
        display: true,
        grid: {
          display: true,
          color: CHART_COLORS.borderLight,
        },
        ticks: {
          font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 11,
            weight: 400,
          },
          color: CHART_COLORS.textMuted,
          padding: 8,
        },
      },
    },
  } : {}),
  
  // Animation configuration
  animation: {
    duration: 750,
    easing: 'easeInOutCubic',
  },
  
  // Interaction configuration
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
});

/**
 * Generate chart dataset with Design System theming
 */
export function createChartDataset({
  label,
  data,
  type = 'line',
  colorIndex = 0,
}: {
  label: string;
  data: number[];
  type?: 'line' | 'bar';
  colorIndex?: number;
}) {
  const color = CHART_COLORS.dataColors[colorIndex % CHART_COLORS.dataColors.length];
  
  const baseDataset = {
    label,
    data,
    borderColor: color,
    backgroundColor: type === 'line' ? `${color}15` : `${color}80`,
  };
  
  if (type === 'line') {
    return {
      ...baseDataset,
      borderWidth: 2,
      pointBackgroundColor: color,
      pointBorderColor: CHART_COLORS.background,
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.3,
    };
  }
  
  if (type === 'bar') {
    return {
      ...baseDataset,
      borderWidth: 0,
      borderRadius: 4,
      borderSkipped: false,
    };
  }
  
  return baseDataset;
}

/**
 * Format numbers for chart displays (German formatting)
 */
export function formatChartValue(value: number, type: 'currency' | 'percentage' | 'number' = 'number'): string {
  const formatter = new Intl.NumberFormat('de-DE', {
    ...(type === 'currency' && {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }),
    ...(type === 'percentage' && {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }),
    ...(type === 'number' && {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }),
  });
  
  return formatter.format(type === 'percentage' ? value / 100 : value);
}

/**
 * Custom tooltip formatter for consistent styling
 */
export function formatTooltip(tooltipItem: TooltipItem<any>): string {
  const { dataset, parsed } = tooltipItem;
  const value = parsed.y ?? parsed;
  
  // Detect value type based on dataset label or data patterns
  const label = dataset.label?.toLowerCase() || '';
  let valueType: 'currency' | 'percentage' | 'number' = 'number';
  
  if (label.includes('revenue') || label.includes('cost') || label.includes('€')) {
    valueType = 'currency';
  } else if (label.includes('rate') || label.includes('%') || (typeof value === 'number' && value <= 1)) {
    valueType = 'percentage';
  }
  
  return formatChartValue(value, valueType);
}

/**
 * Generate mock data for chart development
 */
export function generateMockData(points: number = 12): {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }>;
} {
  const labels = Array.from({ length: points }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (points - 1 - i));
    return date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
  });
  
  const datasets = [
    {
      label: 'Umsatz',
      data: Array.from({ length: points }, () => Math.floor(Math.random() * 50000) + 10000),
      backgroundColor: `${CHART_COLORS.dataColors[0]}80`,
      borderColor: CHART_COLORS.dataColors[0],
    },
    {
      label: 'Kosten',
      data: Array.from({ length: points }, () => Math.floor(Math.random() * 30000) + 5000),
      backgroundColor: `${CHART_COLORS.dataColors[1]}80`,
      borderColor: CHART_COLORS.dataColors[1],
    },
  ];
  
  return { labels, datasets };
}