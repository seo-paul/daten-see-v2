/**
 * API-compatible Dashboard Widget Interface
 * Used for server communication with position/size data
 */
export interface ApiDashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: Record<string, unknown>;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  widgets: ApiDashboardWidget[];
  settings: DashboardSettings;
}

/**
 * Grid Widget Interface (for UI components)
 * Used by dashboard grid system - no position needed (handled by react-grid-layout)
 */
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  dataSource?: string;
}

/**
 * Re-export WidgetConfig from API types for consistency
 */
export type { WidgetConfig } from './api';


export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DashboardSettings {
  backgroundColor: string;
  gridSize: number;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}

/**
 * Re-export unified types from API types
 * This ensures compatibility between API and Grid systems
 */
export type { WidgetType } from './api';

/**
 * Grid Layout Widget Interface (DEPRECATED)
 * Use DashboardWidget instead - this alias maintained for backward compatibility
 * @deprecated Use DashboardWidget interface instead
 */
export type GridWidget = DashboardWidget;

export interface CreateDashboardRequest {
  name: string;
  description: string;
  isPublic: boolean;
}

export interface UpdateDashboardRequest {
  id: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
  settings?: Partial<DashboardSettings>;
}

export interface DashboardListItem {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  updatedAt: Date;
  widgetCount: number;
}