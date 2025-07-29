'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';

import { formatTooltip, CHART_COLORS } from '@/lib/charts/config';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export interface PieChartProps {
  data: ChartData<'pie'>;
  title?: string;
  height?: number;
  showLegend?: boolean;
  showTooltips?: boolean;
  showPercentages?: boolean;
  doughnut?: boolean;
  centerText?: string;
  centerValue?: string;
  className?: string;
}

/**
 * Professional Pie Chart Component
 * Optimized for part-to-whole data visualization
 */
export function PieChart({
  data,
  title,
  height = 300,
  showLegend = true,
  showTooltips = true,
  showPercentages = true,
  doughnut = false,
  centerText,
  centerValue,
  className = '',
}: PieChartProps): React.ReactElement {
  
  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    
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
        position: 'bottom' as const,
        labels: {
          font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 12,
            weight: 400,
          },
          color: CHART_COLORS.textPrimary,
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: (chart) => {
            const { datasets } = chart.data;
            if (datasets.length > 0) {
              const dataset = datasets[0];
              const labels = chart.data.labels || [];
              const data = dataset.data as number[];
              const total = data.reduce((sum, value) => sum + value, 0);
              
              return labels.map((label, index) => {
                const value = data[index];
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: showPercentages ? `${label} (${percentage}%)` : label as string,
                  fillStyle: Array.isArray(dataset.backgroundColor) 
                    ? dataset.backgroundColor[index] 
                    : dataset.backgroundColor || CHART_COLORS.dataColors[index],
                  strokeStyle: Array.isArray(dataset.borderColor)
                    ? dataset.borderColor[index]
                    : dataset.borderColor || CHART_COLORS.background,
                  lineWidth: 2,
                  pointStyle: 'circle',
                  index,
                };
              });
            }
            return [];
          },
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
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum: number, data: number) => sum + data, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatTooltip(context)} (${percentage}%)`;
          },
        },
      },
    },
    
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 800,
    },
    
    interaction: {
      intersect: false,
    },
  };

  // Apply styling to dataset
  const styledData: ChartData<'pie'> = {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || CHART_COLORS.dataColors,
      borderColor: dataset.borderColor || CHART_COLORS.background,
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverOffset: 8,
    })),
  };

  const ChartComponent = doughnut ? Doughnut : Pie;

  return (
    <div 
      className={`w-full bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-4 ${className}`}
      style={{ height: height + 40 }} // Add padding for container
    >
      <div className="w-full h-full relative">
        <ChartComponent 
          data={styledData} 
          options={options}
          aria-label={title || 'Pie chart'}
        />
        
        {/* Center text for doughnut charts */}
        {doughnut && (centerText || centerValue) && (
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
 * Doughnut Chart with center value display
 */
export function DoughnutChart({
  data,
  title,
  centerText,
  centerValue,
  height = 300,
  className = '',
}: {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  centerText?: string;
  centerValue?: string;
  height?: number;
  className?: string;
}): React.ReactElement {
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const displayValue = centerValue || total.toLocaleString('de-DE');
  const displayText = centerText || 'Gesamt';
  
  const chartData: ChartData<'pie'> = {
    labels: data.map(item => item.label),
    datasets: [{
      data: data.map(item => item.value),
      backgroundColor: data.map((item, index) => 
        item.color || CHART_COLORS.dataColors[index]
      ),
      borderColor: CHART_COLORS.background,
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverOffset: 8,
    }],
  };

  return (
    <PieChart
      data={chartData}
      title={title || undefined}
      height={height}
      doughnut={true}
      centerText={displayText}
      centerValue={displayValue}
      className={className}
    />
  );
}

/**
 * Simple donut progress indicator
 */
export function DonutProgress({
  value,
  maxValue,
  label,
  color = CHART_COLORS.primary,
  size = 120,
  className = '',
}: {
  value: number;
  maxValue: number;
  label?: string;
  color?: string;
  size?: number;
  className?: string;
}): React.ReactElement {
  
  const percentage = Math.min((value / maxValue) * 100, 100);
  const remaining = 100 - percentage;
  
  const chartData: ChartData<'doughnut'> = {
    labels: ['Erreicht', 'Verbleibend'],
    datasets: [{
      data: [percentage, remaining],
      backgroundColor: [color, '#F5EFE7'],
      borderColor: CHART_COLORS.background,
      borderWidth: 0,
      // cutout: '75%', // Removed - not supported in this dataset type
    }],
  };
  
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: {
      animateRotate: true,
      duration: 1000,
    },
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xl font-bold text-[#3d3d3d]">
          {percentage.toFixed(0)}%
        </div>
        {label && (
          <div className="text-xs text-[#5d5d5d] text-center mt-1">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}