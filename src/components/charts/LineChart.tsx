'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { getDefaultChartOptions, formatTooltip, CHART_COLORS } from '@/lib/charts/config';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface LineChartProps {
  data: ChartData<'line'>;
  title?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltips?: boolean;
  curved?: boolean;
  filled?: boolean;
  className?: string;
}

/**
 * Professional Line Chart Component
 * Optimized for time series data and trend visualization
 */
export function LineChart({
  data,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltips = true,
  curved = true,
  filled = true,
  className = '',
}: LineChartProps): React.ReactElement {
  
  const options: ChartOptions<'line'> = {
    ...getDefaultChartOptions('line'),
    
    plugins: {
      ...getDefaultChartOptions('line').plugins,
      
      title: title ? {
        display: true,
        text: title,
        font: {
          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          size: 16,
          weight: '600',
        },
        color: CHART_COLORS.textPrimary,
        padding: {
          bottom: 20,
        },
      } : { display: false },
      
      legend: {
        ...getDefaultChartOptions('line').plugins?.legend,
        display: showLegend,
      },
      
      tooltip: {
        ...getDefaultChartOptions('line').plugins?.tooltip,
        enabled: showTooltips,
        callbacks: {
          label: formatTooltip,
        },
      },
    },
    
    scales: {
      x: {
        ...getDefaultChartOptions('line').scales?.x,
        grid: {
          ...getDefaultChartOptions('line').scales?.x?.grid,
          display: showGrid,
        },
      },
      y: {
        ...getDefaultChartOptions('line').scales?.y,
        grid: {
          ...getDefaultChartOptions('line').scales?.y?.grid,
          display: showGrid,
        },
      },
    },
  };

  // Apply styling to datasets
  const styledData: ChartData<'line'> = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      tension: curved ? 0.3 : 0,
      fill: filled,
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: dataset.borderColor || CHART_COLORS.dataColors[index],
      pointBorderColor: CHART_COLORS.background,
      pointBorderWidth: 2,
      backgroundColor: dataset.backgroundColor || `${CHART_COLORS.dataColors[index]}15`,
      borderColor: dataset.borderColor || CHART_COLORS.dataColors[index],
    })),
  };

  return (
    <div 
      className={`w-full bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-4 ${className}`}
      style={{ height: height + 40 }} // Add padding for container
    >
      <div className="w-full h-full">
        <Line 
          data={styledData} 
          options={options}
          aria-label={title || 'Line chart'}
        />
      </div>
    </div>
  );
}

/**
 * Line Chart with multiple datasets for comparison
 */
export function MultiLineChart({
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
  
  const chartData: ChartData<'line'> = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.color || CHART_COLORS.dataColors[index],
      backgroundColor: `${dataset.color || CHART_COLORS.dataColors[index]}15`,
      tension: 0.3,
      fill: true,
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: dataset.color || CHART_COLORS.dataColors[index],
      pointBorderColor: CHART_COLORS.background,
      pointBorderWidth: 2,
    })),
  };

  return (
    <LineChart
      data={chartData}
      title={title}
      height={height}
      className={className}
    />
  );
}

/**
 * Simple trend line for KPI cards
 */
export function TrendLineChart({
  data,
  color = CHART_COLORS.primary,
  height = 60,
  className = '',
}: {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}): React.ReactElement {
  
  const chartData: ChartData<'line'> = {
    labels: data.map((_, index) => index.toString()),
    datasets: [{
      data,
      borderColor: color,
      backgroundColor: `${color}20`,
      tension: 0.4,
      fill: true,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 0,
    }],
  };

  const options: ChartOptions<'line'> = {
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
    animation: { duration: 400 },
    interaction: { intersect: false },
  };

  return (
    <div 
      className={`w-full ${className}`}
      style={{ height }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
}