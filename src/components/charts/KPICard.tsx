'use client';

import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react';

import { CHART_COLORS, formatChartValue } from '@/lib/charts/config';
import { TrendLineChart } from './LineChart';
import { DonutProgress } from './PieChart';

export interface KPICardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  target?: number;
  unit?: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  trendData?: number[];
  showProgress?: boolean;
  icon?: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Professional KPI Card Component
 * Displays key metrics with trend indicators and progress visualization
 */
export function KPICard({
  title,
  value,
  previousValue,
  target,
  unit = 'number',
  trend,
  trendValue,
  trendData,
  showProgress = false,
  icon,
  color = CHART_COLORS.primary,
  size = 'md',
  className = '',
}: KPICardProps): React.ReactElement {
  
  // Calculate trend if not provided
  const calculatedTrend = trend || (previousValue && typeof value === 'number' 
    ? value > previousValue ? 'up' : value < previousValue ? 'down' : 'neutral'
    : 'neutral'
  );
  
  // Calculate trend percentage if not provided
  const calculatedTrendValue = trendValue || (
    previousValue && typeof value === 'number' && previousValue > 0
      ? ((value - previousValue) / previousValue) * 100
      : 0
  );
  
  // Format the main value
  const formattedValue = typeof value === 'string' 
    ? value 
    : formatChartValue(value, unit);
  
  // Format trend value
  const formattedTrendValue = Math.abs(calculatedTrendValue).toFixed(1);
  
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-4',
      title: 'text-sm',
      value: 'text-2xl',
      trend: 'text-xs',
      icon: 'w-5 h-5',
    },
    md: {
      container: 'p-6',
      title: 'text-base',
      value: 'text-3xl',
      trend: 'text-sm',
      icon: 'w-6 h-6',
    },
    lg: {
      container: 'p-8',
      title: 'text-lg',
      value: 'text-4xl',
      trend: 'text-base',
      icon: 'w-8 h-8',
    },
  };
  
  const config = sizeConfig[size];
  
  // Trend colors
  const trendColors = {
    up: CHART_COLORS.success,
    down: CHART_COLORS.error,
    neutral: CHART_COLORS.textMuted,
  };
  
  const trendColor = trendColors[calculatedTrend];
  
  // Trend icons
  const TrendIcon = calculatedTrend === 'up' 
    ? ArrowUpIcon 
    : calculatedTrend === 'down' 
    ? ArrowDownIcon 
    : MinusIcon;

  return (
    <div 
      className={`
        bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] 
        hover:shadow-md transition-all duration-200
        ${config.container} ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-medium text-[#3d3d3d] ${config.title}`}>
          {title}
        </h3>
        {icon && (
          <div 
            className={`${config.icon} flex-shrink-0`}
            style={{ color }}
          >
            {icon}
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="space-y-4">
        {/* Value and Trend */}
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <div className={`font-bold text-[#3d3d3d] ${config.value}`}>
              {formattedValue}
            </div>
            
            {/* Trend Indicator */}
            {(calculatedTrendValue !== 0 || trend) && (
              <div className={`flex items-center mt-2 ${config.trend}`}>
                <TrendIcon 
                  className="w-3 h-3 mr-1" 
                  style={{ color: trendColor }}
                />
                <span style={{ color: trendColor }}>
                  {formattedTrendValue}%
                </span>
                <span className="text-[#5d5d5d] ml-1">
                  vs. vorherige Periode
                </span>
              </div>
            )}
          </div>
          
          {/* Trend Chart */}
          {trendData && trendData.length > 0 && (
            <div className="w-20 ml-4">
              <TrendLineChart 
                data={trendData}
                color={trendColor}
                height={40}
              />
            </div>
          )}
        </div>
        
        {/* Progress towards target */}
        {showProgress && target && typeof value === 'number' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5d5d5d]">Ziel</span>
              <span className="text-[#3d3d3d] font-medium">
                {formatChartValue(target, unit)}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="w-full bg-[#F5EFE7] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((value / target) * 100, 100)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
              <div className="w-12">
                <DonutProgress
                  value={value}
                  maxValue={target}
                  color={color}
                  size={40}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact KPI Card for dashboard grids
 */
export function CompactKPICard({
  title,
  value,
  change,
  changeType = 'percentage',
  trend = 'neutral',
  color = CHART_COLORS.primary,
  className = '',
}: {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  className?: string;
}): React.ReactElement {
  
  const TrendIcon = trend === 'up' 
    ? ArrowUpIcon 
    : trend === 'down' 
    ? ArrowDownIcon 
    : MinusIcon;
  
  const trendColors = {
    up: CHART_COLORS.success,
    down: CHART_COLORS.error,
    neutral: CHART_COLORS.textMuted,
  };
  
  const formattedValue = typeof value === 'string' 
    ? value 
    : value.toLocaleString('de-DE');
  
  const formattedChange = change 
    ? changeType === 'percentage' 
      ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
      : `${change > 0 ? '+' : ''}${change.toLocaleString('de-DE')}`
    : null;

  return (
    <div 
      className={`
        bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-4
        hover:shadow-sm transition-shadow duration-200
        ${className}
      `}
    >
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-[#5d5d5d] truncate">
          {title}
        </h4>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-[#3d3d3d]">
            {formattedValue}
          </div>
          
          {formattedChange && (
            <div 
              className="flex items-center text-xs font-medium"
              style={{ color: trendColors[trend] }}
            >
              <TrendIcon className="w-3 h-3 mr-1" />
              {formattedChange}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * KPI Grid Layout for multiple metrics
 */
export function KPIGrid({
  metrics,
  columns = 4,
  className = '',
}: {
  metrics: Array<{
    title: string;
    value: number | string;
    previousValue?: number;
    unit?: 'currency' | 'percentage' | 'number';
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
    icon?: React.ReactNode;
  }>;
  columns?: number;
  className?: string;
}): React.ReactElement {
  
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns as keyof typeof gridCols] || gridCols[4]} ${className}`}>
      {metrics.map((metric, index) => (
        <KPICard
          key={index}
          title={metric.title}
          value={metric.value}
          previousValue={metric.previousValue}
          unit={metric.unit}
          trend={metric.trend}
          color={metric.color}
          icon={metric.icon}
          size="sm"
        />
      ))}
    </div>
  );
}