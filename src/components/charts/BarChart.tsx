'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { formatTooltip, CHART_COLORS } from '@/lib/charts/config';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface BarChartProps {
  data: ChartData<'bar'>;
  title?: string;
  height?: number;
  horizontal?: boolean;
  stacked?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltips?: boolean;
  className?: string;
}

/**
 * Professional Bar Chart Component
 * Optimized for comparative data visualization
 */
export function BarChart({
  data,
  title,
  height = 300,
  horizontal = false,
  stacked = false,
  showGrid = true,
  showLegend = true,
  showTooltips = true,
  className = '',
}: BarChartProps): React.ReactElement {
  
  // Chart type is always 'bar', horizontal is controlled by indexAxis
  
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    
    plugins: {
      title: title ? {
        display: true,
        text: title,
        font: {
          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          size: 16,
          weight: 600,
        },
        color: CHART_COLORS.textPrimary,
        padding: {
          bottom: 20,
        },
      } : { display: false },
      
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 12,
            weight: 400,
          },
          color: CHART_COLORS.textPrimary,
          padding: 20,
        },
      },
      
      tooltip: {
        enabled: showTooltips,
        backgroundColor: CHART_COLORS.background,
        titleColor: CHART_COLORS.textPrimary,
        bodyColor: CHART_COLORS.textSecondary,
        borderColor: CHART_COLORS.border,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: formatTooltip,
        },
      },
    },
    
    scales: {
      x: {
        stacked,
        grid: {
          display: showGrid && !horizontal,
          color: '#F0E5C8',
        },
        ticks: {
          font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 11,
            weight: 400,
          },
          color: CHART_COLORS.textMuted,
        },
      },
      y: {
        stacked,
        grid: {
          display: showGrid,
          color: '#F0E5C8',
        },
        ticks: {
          font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 11,
            weight: 400,
          },
          color: CHART_COLORS.textMuted,
        },
      },
    },
    
    animation: {
      duration: 750,
      easing: 'easeInOutCubic',
    },
    
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  // Apply styling to datasets
  const styledData: ChartData<'bar'> = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || `${CHART_COLORS.dataColors[index]}90`,
      borderColor: dataset.borderColor || CHART_COLORS.dataColors[index],
      borderWidth: 0,
      borderRadius: 6,
      borderSkipped: false,
      barThickness: horizontal ? undefined : 'flex',
      maxBarThickness: horizontal ? 30 : 50,
    })),
  };

  return (
    <div 
      className={`w-full bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-4 ${className}`}
      style={{ height: height + 40 }} // Add padding for container
    >
      <div className="w-full h-full">
        <Bar 
          data={styledData} 
          options={options}
          aria-label={title || 'Bar chart'}
        />
      </div>
    </div>
  );
}

/**
 * Stacked Bar Chart for composition analysis
 */
export function StackedBarChart({
  datasets,
  labels,
  title,
  height = 300,
  horizontal = false,
  className = '',
}: {
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
  labels: string[];
  title?: string;
  height?: number;
  horizontal?: boolean;
  className?: string;
}): React.ReactElement {
  
  const chartData: ChartData<'bar'> = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: `${dataset.color || CHART_COLORS.dataColors[index]}90`,
      borderColor: dataset.color || CHART_COLORS.dataColors[index],
      borderWidth: 0,
      borderRadius: 4,
      borderSkipped: false,
    })),
  };

  return (
    <BarChart
      data={chartData}
      title={title}
      height={height}
      horizontal={horizontal}
      stacked={true}
      className={className}
    />
  );
}

/**
 * Grouped Bar Chart for side-by-side comparison
 */
export function GroupedBarChart({
  datasets,
  labels,
  title,
  height = 300,
  className = '',
}: {
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
  labels: string[];
  title?: string;
  height?: number;
  className?: string;
}): React.ReactElement {
  
  const chartData: ChartData<'bar'> = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: `${dataset.color || CHART_COLORS.dataColors[index]}90`,
      borderColor: dataset.color || CHART_COLORS.dataColors[index],
      borderWidth: 0,
      borderRadius: 6,
      borderSkipped: false,
      barPercentage: 0.8,
      categoryPercentage: 0.9,
    })),
  };

  return (
    <BarChart
      data={chartData}
      title={title}
      height={height}
      stacked={false}
      className={className}
    />
  );
}

/**
 * Simple metric bar for dashboard widgets
 */
export function MetricBarChart({
  value,
  maxValue,
  label,
  color = CHART_COLORS.primary,
  height = 20,
  className = '',
}: {
  value: number;
  maxValue: number;
  label?: string;
  color?: string;
  height?: number;
  className?: string;
}): React.ReactElement {
  
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[#3d3d3d]">{label}</span>
          <span className="text-sm text-[#5d5d5d]">
            {value.toLocaleString('de-DE')} / {maxValue.toLocaleString('de-DE')}
          </span>
        </div>
      )}
      <div 
        className="w-full bg-[#F5EFE7] rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}