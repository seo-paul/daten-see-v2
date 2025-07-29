/**
 * Mock Data Module
 * Centralized mock data for development and demos
 */

import type { SimpleChartData } from '@/components/charts';
import type { DashboardWidget } from '@/types/dashboard.types';
import type { Layouts } from 'react-grid-layout';

import mockData from './dashboard-widgets.json';

export const mockLineData: SimpleChartData = mockData.lineChartData;
export const mockBarData: SimpleChartData = mockData.barChartData;
export const mockPieData: SimpleChartData = mockData.pieChartData;

export const demoWidgets: DashboardWidget[] = mockData.demoWidgets as DashboardWidget[];
export const demoLayouts: Layouts = mockData.demoLayouts as Layouts;