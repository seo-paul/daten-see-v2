'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ChartData } from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

import { CHART_COLORS } from '@/lib/charts/config';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Simplified Chart Props for Widget Integration
 * These avoid TypeScript complexity while providing full Chart.js features
 */
export interface SimpleChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
}

export interface ChartWrapperProps {
  data: SimpleChartData;
  title?: string;
  height?: number;
  className?: string;
}

// Default options that work with Chart.js
const defaultOptions = {
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
          weight: 400 as any, // Type workaround
        },
        color: CHART_COLORS.textPrimary,
        padding: 20,
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
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: CHART_COLORS.borderLight,
      },
      ticks: {
        font: {
          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          size: 11,
          weight: 400 as any,
        },
        color: CHART_COLORS.textMuted,
      },
    },
    y: {
      grid: {
        display: true,
        color: CHART_COLORS.borderLight,
      },
      ticks: {
        font: {
          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          size: 11,
          weight: 400 as any,
        },
        color: CHART_COLORS.textMuted,
      },
    },
  },
} as const;

/**
 * Convert simple data format to Chart.js format
 */
function convertToChartJSData(data: SimpleChartData, type: 'line' | 'bar' | 'pie'): ChartData<any> {
  return {
    labels: data.labels,
    datasets: data.datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.color || CHART_COLORS.dataColors[index % CHART_COLORS.dataColors.length],
      backgroundColor: type === 'line' 
        ? `${dataset.color || CHART_COLORS.dataColors[index % CHART_COLORS.dataColors.length]}20`
        : type === 'pie'
        ? dataset.color || CHART_COLORS.dataColors[index % CHART_COLORS.dataColors.length]
        : `${dataset.color || CHART_COLORS.dataColors[index % CHART_COLORS.dataColors.length]}90`,
      borderWidth: type === 'pie' ? 2 : type === 'line' ? 2 : 0,
      fill: type === 'line' ? true : undefined,
      tension: type === 'line' ? 0.3 : undefined,
      borderRadius: type === 'bar' ? 6 : undefined,
      borderSkipped: type === 'bar' ? false : undefined,
    })),
  };
}

/**
 * Dashboard Line Chart - Full Chart.js features with simple props
 */
export function DashboardLineChart({ data, title, height = 300, className = '' }: ChartWrapperProps) {
  const chartData = convertToChartJSData(data, 'line');
  
  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      title: title ? {
        display: true,
        text: title,
        font: {
          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          size: 16,
          weight: 600 as any,
        },
        color: CHART_COLORS.textPrimary,
        padding: { bottom: 20 },
      } : { display: false },
    },
  } as any;

  return (
    <div 
      className={`w-full bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-4 ${className}`}
      style={{ height: height + 40 }}
    >
      <div className="w-full h-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

/**
 * Dashboard Bar Chart - Full Chart.js features with simple props
 */
export function DashboardBarChart({ data, title, height = 300, className = '' }: ChartWrapperProps) {
  const chartData = convertToChartJSData(data, 'bar');
  
  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      title: title ? {
        display: true,
        text: title,
        font: {
          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          size: 16,
          weight: 600 as any,
        },
        color: CHART_COLORS.textPrimary,
        padding: { bottom: 20 },
      } : { display: false },
    },
  } as any;

  return (
    <div 
      className={`w-full bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-4 ${className}`}
      style={{ height: height + 40 }}
    >
      <div className="w-full h-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

/**
 * Dashboard Pie Chart - Full Chart.js features with simple props
 */
export function DashboardPieChart({ data, title, height = 300, className = '' }: ChartWrapperProps) {
  const chartData = convertToChartJSData(data, 'pie');
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 12,
            weight: 400 as any,
          },
          color: CHART_COLORS.textPrimary,
          padding: 15,
        },
      },
      title: title ? {
        display: true,
        text: title,
        font: {
          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          size: 16,
          weight: 600 as any,
        },
        color: CHART_COLORS.textPrimary,
        padding: { bottom: 20 },
      } : { display: false },
      tooltip: {
        backgroundColor: CHART_COLORS.background,
        titleColor: CHART_COLORS.textPrimary,
        bodyColor: CHART_COLORS.textSecondary,
        borderColor: CHART_COLORS.border,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
  } as any;

  return (
    <div 
      className={`w-full bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-4 ${className}`}
      style={{ height: height + 40 }}
    >
      <div className="w-full h-full">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}

/**
 * Dashboard Doughnut Chart - With center text support
 */
export function DashboardDoughnutChart({ 
  data, 
  title, 
  height = 300, 
  className = '',
  centerText,
  centerValue 
}: ChartWrapperProps & { centerText?: string; centerValue?: string }) {
  const chartData = convertToChartJSData(data, 'pie');
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 12,
            weight: 400 as any,
          },
          color: CHART_COLORS.textPrimary,
          padding: 15,
        },
      },
      title: title ? {
        display: true,
        text: title,
        font: {
          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          size: 16,
          weight: 600 as any,
        },
        color: CHART_COLORS.textPrimary,
        padding: { bottom: 20 },
      } : { display: false },
      tooltip: {
        backgroundColor: CHART_COLORS.background,
        titleColor: CHART_COLORS.textPrimary,
        bodyColor: CHART_COLORS.textSecondary,
        borderColor: CHART_COLORS.border,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
  } as any;

  return (
    <div 
      className={`w-full bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-4 ${className}`}
      style={{ height: height + 40 }}
    >
      <div className="w-full h-full relative">
        <Doughnut data={chartData} options={options} />
        
        {/* Center text overlay */}
        {(centerText || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue && (
              <div className="text-2xl font-bold text-[#3d3d3d]">
                {centerValue}
              </div>
            )}
            {centerText && (
              <div className="text-sm text-[#5d5d5d] mt-1">
                {centerText}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * KPI Card with Chart.js sparkline
 */
export function DashboardKPICard({
  title,
  value,
  previousValue,
  trend,
  trendData,
  unit = 'number',
  color = CHART_COLORS.primary,
  className = '',
}: {
  title: string;
  value: number;
  previousValue?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendData?: number[];
  unit?: 'currency' | 'percentage' | 'number';
  color?: string;
  className?: string;
}) {
  const formatValue = (val: number) => {
    if (unit === 'currency') {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(val);
    }
    if (unit === 'percentage') {
      return `${val.toFixed(1)}%`;
    }
    return val.toLocaleString('de-DE');
  };

  const trendColor = trend === 'up' ? '#4A7C59' : trend === 'down' ? '#B85450' : '#7d7d7d';
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
  
  const trendPercentage = previousValue && previousValue > 0
    ? ((value - previousValue) / previousValue) * 100
    : 0;

  // Sparkline data
  const sparklineData = trendData ? {
    labels: trendData.map((_, i) => i.toString()),
    datasets: [{
      data: trendData,
      borderColor: color,
      backgroundColor: `${color}20`,
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.3,
      fill: true,
    }],
  } : null;

  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  } as any;

  return (
    <div 
      className={`bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-6 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <h3 className="text-base font-medium text-[#3d3d3d] mb-4">
        {title}
      </h3>
      
      <div className="space-y-3">
        <div className="text-3xl font-bold text-[#3d3d3d]">
          {formatValue(value)}
        </div>
        
        {previousValue && (
          <div className="flex items-center text-sm">
            <span style={{ color: trendColor }} className="mr-1">
              {trendIcon} {Math.abs(trendPercentage).toFixed(1)}%
            </span>
            <span className="text-[#5d5d5d]">
              vs. vorherige Periode
            </span>
          </div>
        )}
        
        {trendData && sparklineData && (
          <div className="h-12 mt-4">
            <Line data={sparklineData} options={sparklineOptions} />
          </div>
        )}
      </div>
    </div>
  );
}