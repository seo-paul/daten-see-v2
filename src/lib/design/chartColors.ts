/**
 * DATEN-SEE Chart.js Color Integration
 * Standard chart color palette following design system hierarchy
 */

import { designTokens } from './tokens';

// Standard Chart Color Palette (dunkel → hell, wie im Design System)
export const chartColors = [
  '#2F4F73', // Primary Blue - Hauptfarbe
  '#365C83', // Blue Shade 1 - Sekundäre Aktionen
  '#3D6992', // Blue Shade 2 - Tertiäre Elemente  
  '#4375A2', // Blue Shade 3 - Akzente
  '#4A82B1', // Blue Shade 4 - Hellste Variante
] as const;

// Chart Colors mit 50% Opacity für Backgrounds
export const chartBackgroundColors = chartColors.map(color => color + '80');

// Chart Colors mit 80% Opacity für Borders
export const chartBorderColors = chartColors.map(color => color + 'CC');

// Success Green für positive Werte
export const successColor = designTokens.colors.semantic.success; // #457345

// Extended Chart Palette (für mehr als 5 Datensätze)
export const extendedChartColors = [
  ...chartColors,
  successColor,     // Grün für zusätzliche positive Daten
  '#f59e0b',       // Warning orange
  '#6b7280',       // Neutral gray
  '#8b5cf6',       // Purple
  '#ec4899',       // Pink
] as const;

/**
 * Chart.js Default Configuration
 * Applies DATEN-SEE design system to Chart.js instances
 */
export const defaultChartConfig = {
  plugins: {
    legend: {
      labels: {
        color: designTokens.colors.text.primary, // #3d3d3d - Text Dark
        font: {
          family: designTokens.typography.fontFamily.body[0], // Poppins
          size: 14,
          weight: '400',
        },
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: designTokens.colors.surface.primary,
      titleColor: designTokens.colors.text.primary,
      bodyColor: designTokens.colors.text.secondary,
      borderColor: designTokens.colors.border.primary,
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      titleFont: {
        family: designTokens.typography.fontFamily.body[0],
        size: 14,
        weight: '600', // Poppins SemiBold
      },
      bodyFont: {
        family: designTokens.typography.fontFamily.body[0],
        size: 13,
        weight: '400',
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: designTokens.colors.border.primary,
        borderDash: [2, 4],
      },
      ticks: {
        color: designTokens.colors.text.tertiary,
        font: {
          family: designTokens.typography.fontFamily.body[0],
          size: 12,
        },
      },
    },
    y: {
      grid: {
        color: designTokens.colors.border.primary,
        borderDash: [2, 4],
      },
      ticks: {
        color: designTokens.colors.text.tertiary,
        font: {
          family: designTokens.typography.fontFamily.body[0],
          size: 12,
        },
      },
    },
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
      borderWidth: 2,
    },
    line: {
      borderWidth: 2,
      tension: 0.1, // Slight curve for smoother lines
    },
    bar: {
      borderRadius: 4,
      borderSkipped: false,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
} as const;

/**
 * Utility Functions for Chart Configuration
 */

// Generate dataset with DATEN-SEE colors
export function createDataset(
  label: string, 
  data: number[], 
  colorIndex: number = 0,
  type: 'line' | 'bar' | 'doughnut' = 'line'
) {
  const color = chartColors[colorIndex % chartColors.length];
  const backgroundColor = type === 'doughnut' 
    ? chartColors.slice(0, data.length)
    : color + '20'; // 12.5% opacity for areas
  
  return {
    label,
    data,
    backgroundColor,
    borderColor: color,
    borderWidth: 2,
    pointBackgroundColor: color,
    pointBorderColor: designTokens.colors.surface.primary,
    pointBorderWidth: 2,
    fill: type === 'line' ? false : true,
  };
}

// Create multiple datasets with automatic color assignment
export function createMultipleDatasets(
  datasets: Array<{ label: string; data: number[] }>,
  type: 'line' | 'bar' | 'doughnut' = 'line'
) {
  return datasets.map((dataset, index) => 
    createDataset(dataset.label, dataset.data, index, type)
  );
}

// Chart colors for specific use cases
export const chartColorsByUse = {
  // Für Performance Metrics (Grün = gut, Rot = schlecht)
  performance: {
    good: successColor,
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  
  // Für A/B Testing (Primäre Blautöne)
  comparison: [
    chartColors[0], // Primary Blue
    chartColors[2], // Blue Shade 2  
  ],
  
  // Für Multi-Channel Analytics
  channels: chartColors,
  
  // Für Zeitreihen mit Trend
  timeSeries: {
    current: chartColors[0],     // Primary Blue
    previous: chartColors[3],    // Blue Shade 3 (lighter)
    trend: successColor,         // Green für Trend-Linie
  },
} as const;

export default {
  chartColors,
  chartBackgroundColors,
  chartBorderColors,
  extendedChartColors,
  defaultChartConfig,
  createDataset,
  createMultipleDatasets,
  chartColorsByUse,
};