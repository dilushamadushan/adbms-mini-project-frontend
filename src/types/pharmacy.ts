// Pharmacy Data Models and API Contracts

export interface PendingPrescriptionItem {
  rx_id: number | string;
  patient_name: string;
  allergies?: string | string[] | null;
  medicine_name: string;
  dosage: string;
  quantity: number;
  prescribing_doctor: string;
  prescribed_date: string;
}

export interface PharmacyQueueResponse {
  items: PendingPrescriptionItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  oldest_waiting_time?: string; // e.g. "45 mins ago" or ISO timestamp
  pending_count?: number;
}

export interface PrescriptionDetail {
  rx_id: number | string;
  patient_name: string;
  allergies?: string | string[] | null;
  medicine_id?: number | string;
  medicine_name: string;
  dosage: string;
  duration: string;
  quantity: number;
  current_stock: number;
  unit_price: number;
  expiry_date: string; // ISO date e.g. "2026-11-30"
  prescribing_doctor?: string;
  prescribed_date?: string;
  dispense_status?: 'Pending' | 'Dispensed' | string;
}

export interface DispensePayload {
  rx_id: number | string;
  quantity: number;
}

export interface DispenseSuccessResponse {
  success: boolean;
  message?: string;
  rx_id: number | string;
  medicine_name: string;
  quantity: number;
  dispensed_at: string;
  pharmacist_name?: string;
}

export type InventoryStatus = 'OK' | 'Low Stock' | 'Expiring Soon' | 'Expired';

export interface InventoryItem {
  medicine_id: number;
  medicine_name: string;
  stock_quantity: number;
  reorder_level: number;
  unit_price: number;
  expiry_date: string;
  status: InventoryStatus;
}

export interface InventorySummary {
  total_medicines: number;
  low_stock_count: number;
  expiring_soon_count: number;
  expired_count: number;
}

export interface InventoryResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  summary: InventorySummary;
}

export interface RestockPayload {
  medicine_id: number;
  quantity: number;
  new_expiry_date: string;
}

export interface DispensationRecord {
  dispensation_id: number | string;
  date_time: string;
  patient: string;
  medicine: string;
  quantity: number;
  pharmacist_name: string;
}

export interface DispensationsResponse {
  items: DispensationRecord[];
  total: number;
  page: number;
  page_size: number;
}

export interface MostDispensedItem {
  rank: number;
  medicine_name: string;
  dispensed_count: number;
}

export interface MonthlyTotalItem {
  month: string;
  quantity: number;
  running_total: number;
}

export interface RevenueRollupItem {
  medicine_name: string;
  quantity: number;
  unit_price: number;
  total_revenue: number;
}

export interface RevenueRollup {
  items: RevenueRollupItem[];
  subtotal: number;
  grand_total: number;
}

export interface RunningOutSoonItem {
  medicine_id?: number;
  medicine_name: string;
  current_stock: number;
  predicted_days_left: number; // <= 14 days
  daily_consumption_rate?: number;
}

export interface PharmacyReportsResponse {
  most_dispensed: MostDispensedItem[];
  monthly_totals: MonthlyTotalItem[];
  revenue_rollup: RevenueRollup;
  running_out_soon: RunningOutSoonItem[];
}

export interface MedicineCatalogItem {
  medicine_id: number;
  name: string;
  current_stock: number;
  unit_price?: number;
  unit?: string;
}
