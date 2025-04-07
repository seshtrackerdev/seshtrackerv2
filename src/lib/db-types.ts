export type ConsumptionMethod = 'vape' | 'flower' | 'edible' | 'topical';
export type SessionType = 'recreational' | 'medical' | 'experimental';
export type StrainType = 'sativa' | 'indica' | 'hybrid';
export type StockMovementType = 'purchase' | 'consumption' | 'adjustment';
export type LayoutType = 'grid' | 'list' | 'custom';
export type WidgetType = 'session_timeline' | 'inventory_status' | 'consumption_trends';
export type ReportType = 'inventory' | 'sessions' | 'efficacy';

export interface User {
  user_id: string; // e.g., usr_xxxxxxxxxxxxxxxxxxxxxxxx
  external_id: string; // Kush.Observer UUID
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface Session {
  session_id: string; // e.g., sesh_xxxxxxxxxxxxxxxxxxxxxxxx
  user_id: string;
  start_time: number; // Unix timestamp
  duration_minutes: number;
  consumption_method: ConsumptionMethod;
  effects: string[]; // Stored as JSON
  notes?: string;
  strain_id?: string;
  session_type: SessionType;
}

export interface Strain {
  strain_id: string; // e.g., str_xxxxxxxxxxxxxxxxxxxxxxxx
  user_id: string;
  name: string;
  type: StrainType;
  thc_percent?: number;
  cbd_percent?: number;
  current_quantity_grams: number;
  optimal_storage_temp?: string;
  harvest_date?: number; // Unix timestamp
}

export interface StockMovement {
  movement_id: string; // e.g., stock_xxxxxxxxxxxxxxxxxxxxxxxx
  strain_id: string;
  quantity_change: number;
  movement_type: StockMovementType;
  movement_date: number; // Unix timestamp
  note?: string;
}

export interface Dashboard {
  dashboard_id: string; // e.g., dash_xxxxxxxxxxxxxxxxxxxxxxxx
  user_id: string;
  layout_type: LayoutType;
  last_accessed: number; // Unix timestamp
}

export interface DashboardWidget {
  widget_id: string; // e.g., widget_xxxxxxxxxxxxxxxxxxxxxxxx
  dashboard_id: string;
  widget_type: WidgetType;
  widget_position: number;
  widget_config: Record<string, any>; // Stored as JSON
}

export interface Report {
  report_id: string; // e.g., rep_xxxxxxxxxxxxxxxxxxxxxxxx
  user_id: string;
  report_type: ReportType;
  parameters: Record<string, any>; // Stored as JSON
  generated_at: number; // Unix timestamp
  saved_config: Record<string, any>; // Stored as JSON
} 