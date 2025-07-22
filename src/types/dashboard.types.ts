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