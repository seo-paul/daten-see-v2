'use client';

import React from 'react';

import { CHART_COLORS } from '@/lib/charts/config';

/**
 * Temporary Simple Chart Component
 * Simplified version to bypass complex Chart.js TypeScript issues
 * Will be replaced with full Chart.js implementation in 1.3.3
 */

export interface SimpleChartProps {
  title?: string;
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  type?: 'bar' | 'line' | 'pie';
  height?: number;
  className?: string;
}

export function SimpleChart({
  title,
  data,
  type = 'bar',
  height = 300,
  className = '',
}: SimpleChartProps): React.ReactElement {
  
  const maxValue = Math.max(...data.map(item => item.value));
  
  if (type === 'bar') {
    return (
      <div 
        className={`w-full bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-4 ${className}`}
        style={{ height: height + 40 }}
      >
        {title && (
          <h3 className="text-lg font-semibold text-[#3d3d3d] mb-4 text-center">
            {title}
          </h3>
        )}
        <div className="h-full flex items-end justify-around space-x-2 px-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              <div
                className="w-full rounded-t transition-all duration-700 ease-out"
                style={{
                  height: `${(item.value / maxValue) * (height - 100)}px`,
                  backgroundColor: item.color || CHART_COLORS.dataColors[index % CHART_COLORS.dataColors.length],
                  minHeight: '10px',
                }}
              />
              <div className="text-xs text-[#5d5d5d] text-center break-words">
                {item.label}
              </div>
              <div className="text-xs font-medium text-[#3d3d3d]">
                {item.value.toLocaleString('de-DE')}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;
    
    return (
      <div 
        className={`w-full bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-4 ${className}`}
        style={{ height: height + 40 }}
      >
        {title && (
          <h3 className="text-lg font-semibold text-[#3d3d3d] mb-4 text-center">
            {title}
          </h3>
        )}
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-8">
            {/* Simple Pie Representation */}
            <div 
              className="rounded-full border-8 border-[#F5EFE7] relative"
              style={{ width: Math.min(height - 100, 200), height: Math.min(height - 100, 200) }}
            >
              {data.slice(0, 3).map((item, index) => {
                const percentage = (item.value / total) * 100;
                const previousPercentage = cumulativePercentage;
                cumulativePercentage += percentage;
                
                return (
                  <div
                    key={index}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(${item.color || CHART_COLORS.dataColors[index]} ${previousPercentage}% ${cumulativePercentage}%, transparent ${cumulativePercentage}%)`,
                    }}
                  />
                );
              })}
              <div className="absolute inset-4 bg-[#FDF9F3] rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-[#3d3d3d]">
                    {total.toLocaleString('de-DE')}
                  </div>
                  <div className="text-sm text-[#5d5d5d]">
                    Gesamt
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-3">
              {data.map((item, index) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: item.color || CHART_COLORS.dataColors[index % CHART_COLORS.dataColors.length],
                      }}
                    />
                    <div className="text-sm">
                      <div className="font-medium text-[#3d3d3d]">{item.label}</div>
                      <div className="text-[#5d5d5d]">
                        {item.value.toLocaleString('de-DE')} ({percentage}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Line chart as simple connected dots
  if (type === 'line') {
    return (
      <div 
        className={`w-full bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-4 ${className}`}
        style={{ height: height + 40 }}
      >
        {title && (
          <h3 className="text-lg font-semibold text-[#3d3d3d] mb-4 text-center">
            {title}
          </h3>
        )}
        <div className="h-full relative">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="40"
                y1={40 + (i * 32)}
                x2="360"
                y2={40 + (i * 32)}
                stroke="#F0E5C8"
                strokeWidth="1"
              />
            ))}
            
            {/* Data line */}
            <polyline
              fill="none"
              stroke={CHART_COLORS.primary}
              strokeWidth="3"
              points={data.map((item, index) => {
                const x = 40 + (index * (320 / (data.length - 1)));
                const y = 170 - ((item.value / maxValue) * 130);
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points */}
            {data.map((item, index) => {
              const x = 40 + (index * (320 / (data.length - 1)));
              const y = 170 - ((item.value / maxValue) * 130);
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={CHART_COLORS.primary}
                    stroke="#FDF9F3"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y="195"
                    textAnchor="middle"
                    className="text-xs fill-current text-[#5d5d5d]"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  }
  
  return <div>Chart type not supported</div>;
}

/**
 * Simple KPI Card without complex dependencies
 */
export function SimpleKPICard({
  title,
  value,
  previousValue,
  unit = 'number',
  color: _color = CHART_COLORS.primary, // Underscore prefix to mark as intentionally unused
  className = '',
}: {
  title: string;
  value: number;
  previousValue?: number;
  unit?: 'currency' | 'percentage' | 'number';
  color?: string;
  className?: string;
}): React.ReactElement {
  
  const formatValue = (val: number) => {
    if (unit === 'currency') {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(val);
    }
    if (unit === 'percentage') {
      return `${val.toFixed(1)}%`;
    }
    return val.toLocaleString('de-DE');
  };
  
  const trend = previousValue 
    ? value > previousValue ? 'up' : value < previousValue ? 'down' : 'neutral'
    : 'neutral';
  
  const trendPercentage = previousValue && previousValue > 0
    ? ((value - previousValue) / previousValue) * 100
    : 0;
  
  const trendColor = trend === 'up' ? '#4A7C59' : trend === 'down' ? '#B85450' : '#7d7d7d';
  const TrendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';

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
              {TrendIcon} {Math.abs(trendPercentage).toFixed(1)}%
            </span>
            <span className="text-[#5d5d5d]">
              vs. vorherige Periode
            </span>
          </div>
        )}
      </div>
    </div>
  );
}