'use client';

/**
 * Web Vitals Display Component
 * Shows real-time Core Web Vitals metrics
 */

import React from 'react';

import { useWebVitals } from '@/lib/performance/web-vitals';

interface WebVitalsDisplayProps {
  className?: string;
  showDetails?: boolean;
}

export function WebVitalsDisplay({ className = '', showDetails = false }: WebVitalsDisplayProps): React.ReactElement {
  const { metrics, score, summary } = useWebVitals();

  if (process.env.NODE_ENV !== 'development') {
    return React.createElement('div', null); // Empty in production
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case 'good': return '#10b981';
      case 'needs-improvement': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return React.createElement('div', {
    className: `fixed bottom-4 left-4 bg-[#FDF9F3] border border-[#E6D7B8] rounded-lg shadow-lg p-4 z-50 ${className}`,
    style: { minWidth: '280px', fontSize: '12px' }
  },
    // Header
    React.createElement('div', {
      className: 'flex items-center justify-between mb-3'
    },
      React.createElement('h3', {
        className: 'font-semibold text-[#3d3d3d]',
        style: { fontSize: '14px' }
      }, '🎯 Core Web Vitals'),
      React.createElement('div', {
        className: 'px-2 py-1 rounded text-white font-bold',
        style: { 
          backgroundColor: getScoreColor(score),
          fontSize: '12px'
        }
      }, score.toString())
    ),

    // Metrics
    React.createElement('div', {
      className: 'space-y-2'
    },
      metrics.map(metric => 
        React.createElement('div', {
          key: metric.name,
          className: 'flex items-center justify-between'
        },
          React.createElement('span', {
            className: 'text-[#5d5d5d]'
          }, metric.name),
          React.createElement('div', {
            className: 'flex items-center gap-2'
          },
            React.createElement('span', {
              className: 'font-mono'
            }, `${metric.value.toFixed(1)}${metric.name === 'CLS' ? '' : 'ms'}`),
            React.createElement('div', {
              className: 'w-2 h-2 rounded-full',
              style: { backgroundColor: getRatingColor(metric.rating) }
            })
          )
        )
      )
    ),

    // Details (if enabled)
    showDetails && summary.recommendations.length > 0 && React.createElement('div', {
      className: 'mt-3 pt-3 border-t border-gray-200'
    },
      React.createElement('div', {
        className: 'text-xs text-[#5d5d5d] mb-2'
      }, 'Recommendations:'),
      React.createElement('ul', {
        className: 'text-xs text-[#5d5d5d] space-y-1'
      },
        summary.recommendations.slice(0, 3).map((rec, index) =>
          React.createElement('li', {
            key: index,
            className: 'flex items-start gap-1'
          },
            React.createElement('span', null, '•'),
            React.createElement('span', null, rec)
          )
        )
      )
    ),

    // Legend
    React.createElement('div', {
      className: 'mt-3 pt-3 border-t border-[#E6D7B8] flex items-center gap-4 text-xs'
    },
      React.createElement('div', {
        className: 'flex items-center gap-1'
      },
        React.createElement('div', {
          className: 'w-2 h-2 rounded-full bg-green-500'
        }),
        React.createElement('span', {
          className: 'text-[#5d5d5d]'
        }, 'Good')
      ),
      React.createElement('div', {
        className: 'flex items-center gap-1'
      },
        React.createElement('div', {
          className: 'w-2 h-2 rounded-full bg-yellow-500'
        }),
        React.createElement('span', {
          className: 'text-[#5d5d5d]'
        }, 'Needs Improvement')
      ),
      React.createElement('div', {
        className: 'flex items-center gap-1'
      },
        React.createElement('div', {
          className: 'w-2 h-2 rounded-full bg-red-500'
        }),
        React.createElement('span', {
          className: 'text-[#5d5d5d]'
        }, 'Poor')
      )
    )
  );
}

export default WebVitalsDisplay;