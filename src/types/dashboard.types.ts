export interface Dashboard {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  widgets: DashboardWidget[];
  settings: DashboardSettings;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: Record<string, unknown>;
}

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

export type WidgetType = 
  | 'chart'
  | 'table' 
  | 'metric'
  | 'text'
  | 'image';

/**
 * Grid Layout Widget Interface
 * Used by dashboard grid system (react-grid-layout)
 * Different from API DashboardWidget which uses position/size objects
 */
export interface GridWidget {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'kpi' | 'text';
  title: string;
  config: Record<string, any>;
  dataSource?: string;
}

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