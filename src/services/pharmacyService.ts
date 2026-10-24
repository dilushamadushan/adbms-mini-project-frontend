import apiClient from '@/lib/apiClient';

export interface Medicine {
  medicine_id: number;
  med_name: string;
  generic_name?: string | null;

  unit_price: number;
  stock_qty: number;
  reorder_level: number;
  expiry_date?: string | null;
  is_active: boolean;
  days_to_expiry?: number;
  stock_status?: 'IN_STOCK' | 'LOW_STOCK' | 'EXPIRING_SOON' | 'EXPIRED' | 'OUT_OF_STOCK';
  inventory_value?: number;
}

export interface MedicinePayload {
  med_name: string;
  generic_name?: string;
  unit_price: number;
  stock_qty?: number;
  reorder_level?: number;
  expiry_date?: string;
  is_active?: boolean;
}

export interface StockReceiptPayload {
  medicine_id: number;
  quantity: number;
  expiry_date: string;
  received_by: number;
}

export interface StockReceiptItem {
  receipt_id: number;
  medicine_id: number;
  med_name: string;
  generic_name?: string | null;
  quantity: number;
  expiry_date: string;
  received_by: number;
  received_by_name?: string | null;
  received_at: string;
}

export interface LowStockAlert {
  medicine_id: number;
  med_name: string;
  generic_name?: string;
  stock_qty: number;
  reorder_level: number;
  unit_price: number;
  expiry_date: string;
  deficit_quantity: number;
}

export interface ExpiringMedicine {
  medicine_id: number;
  med_name: string;
  generic_name?: string;
  stock_qty: number;
  unit_price: number;
  expiry_date: string;
  days_left: number;
  urgency_status: 'EXPIRED' | 'EXPIRING_SOON';
}

export interface TopDispensedMedicine {
  medicine_id: number;
  med_name: string;
  generic_name?: string;
  current_stock: number;
  total_dispense_events: number;
  total_units_dispensed: number;
  total_revenue_generated: number;
}

export interface DailyDispensingReport {
  report_date: string;
  total_dispensations: number;
  total_units: number;
  total_revenue: number;
}

export interface PharmacyDashboardKpis {
  total_medicines: number;
  total_stock_units: number;
  low_stock_count: number;
  expired_count: number;
  expiring_soon_count: number;
  total_inventory_valuation: number;
  today_units_dispensed: number;
  today_revenue: number;
}

export const pharmacyService = {
  getInventory: async (search?: string, status?: string): Promise<Medicine[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const res = await apiClient.get<Medicine[]>(`/pharmacy/inventory?${params.toString()}`);
    return res.data || [];
  },

  getMedicine: async (id: number): Promise<Medicine> => {
    const res = await apiClient.get<Medicine>(`/pharmacy/inventory/${id}`);
    return res.data;
  },

  createMedicine: async (payload: MedicinePayload): Promise<Medicine> => {
    const res = await apiClient.post<Medicine>('/pharmacy/inventory', payload);
    return res.data;
  },

  updateMedicine: async (id: number, payload: Partial<MedicinePayload>): Promise<Medicine> => {
    const res = await apiClient.put<Medicine>(`/pharmacy/inventory/${id}`, payload);
    return res.data;
  },

  receiveStock: async (payload: StockReceiptPayload): Promise<any> => {
    const res = await apiClient.post('/pharmacy/inventory/stock-receipt', payload);
    return res.data;
  },

  getStockReceipts: async (limit: number = 50): Promise<StockReceiptItem[]> => {
    const res = await apiClient.get<StockReceiptItem[]>(`/pharmacy/inventory/stock-receipts?limit=${limit}`);
    return res.data || [];
  },

  getLowStockAlerts: async (): Promise<LowStockAlert[]> => {
    const res = await apiClient.get<LowStockAlert[]>('/pharmacy/alerts/low-stock');
    return res.data || [];
  },

  getExpiringMedicines: async (days: number = 30): Promise<ExpiringMedicine[]> => {
    const res = await apiClient.get<ExpiringMedicine[]>(`/pharmacy/alerts/expiring?days=${days}`);
    return res.data || [];
  },

  getTopDispensed: async (limit: number = 10): Promise<TopDispensedMedicine[]> => {
    const res = await apiClient.get<TopDispensedMedicine[]>(`/pharmacy/reports/top-dispensed?limit=${limit}`);
    return res.data || [];
  },

  getDailyDispensing: async (startDate?: string, endDate?: string): Promise<DailyDispensingReport[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const res = await apiClient.get<DailyDispensingReport[]>(`/pharmacy/reports/daily-dispensing?${params.toString()}`);
    return res.data || [];
  },

  getDashboardKpis: async (): Promise<PharmacyDashboardKpis> => {
    const res = await apiClient.get<PharmacyDashboardKpis>('/pharmacy/dashboard/kpis');
    return res.data;
  },

  createOrder: async (payload: PurchaseOrderPayload, pharmacistId: number = 5): Promise<PurchaseOrder> => {
    const res = await apiClient.post<PurchaseOrder>(`/pharmacy/orders?pharmacist_id=${pharmacistId}`, payload);
    return res.data;
  },

  getOrders: async (): Promise<PurchaseOrder[]> => {
    const res = await apiClient.get<PurchaseOrder[]>('/pharmacy/orders');
    return res.data || [];
  },

  getOrder: async (orderId: number): Promise<PurchaseOrder> => {
    const res = await apiClient.get<PurchaseOrder>(`/pharmacy/orders/${orderId}`);
    return res.data;
  },

  updateOrderStatus: async (orderId: number, status: string): Promise<PurchaseOrder> => {
    const res = await apiClient.put<PurchaseOrder>(`/pharmacy/orders/${orderId}/status?new_status=${status}`);
    return res.data;
  },

  restockDeliveredOrder: async (orderId: number, staffId: number = 5, batchExpiry?: string): Promise<PurchaseOrder> => {
    const params = new URLSearchParams();
    params.append('staff_id', String(staffId));
    if (batchExpiry) params.append('batch_expiry', batchExpiry);
    const res = await apiClient.post<PurchaseOrder>(`/pharmacy/orders/${orderId}/restock?${params.toString()}`);
    return res.data;
  },

  getPendingPrescriptions: async (): Promise<PrescriptionQueueItem[]> => {
    const res = await apiClient.get<PrescriptionQueueItem[]>('/pharmacy/prescriptions/pending');
    return res.data || [];
  },

  dispensePrescription: async (rxId: number, payload: DispenseRequestPayload): Promise<DispenseResponseResult> => {
    const res = await apiClient.post<DispenseResponseResult>(`/pharmacy/prescriptions/${rxId}/dispense`, payload);
    return res.data;
  },

  getDispensationsHistory: async (limit: number = 50): Promise<DispensationHistoryRecord[]> => {
    const res = await apiClient.get<DispensationHistoryRecord[]>(`/pharmacy/prescriptions/history?limit=${limit}`);
    return res.data || [];
  }
};


export interface PurchaseOrderItemPayload {
  medicine_id: number;
  requested_quantity: number;
}

export interface PurchaseOrderPayload {
  supplier_name?: string;
  expected_delivery_date: string;
  notes?: string;
  items: PurchaseOrderItemPayload[];
}

export interface PurchaseOrderItem {
  item_id: number;
  medicine_id: number;
  med_name: string;
  generic_name?: string;
  requested_quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface PurchaseOrder {
  order_id: number;
  order_number: string;
  pharmacist_id: number;
  pharmacist_name?: string;
  supplier_name: string;
  order_date: string;
  expected_delivery_date: string;
  lead_time_days?: number;
  total_cost: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  notes?: string;
  total_items?: number;
  items?: PurchaseOrderItem[];
}

export interface PrescriptionQueueItem {
  rx_id: number;
  record_id: number;
  med_name: string;
  dosage: string;
  duration?: string;
  prescribed_at?: string;
  patient_id: number;
  patient_name: string;
  allergies?: string | null;
  doctor_name: string;
  medicine_id?: number;
  inventory_med_name?: string;
  stock_qty?: number;
  unit_price?: number;
  is_dispensed: boolean;
  dispense_id?: number | null;
}

export interface DispenseRequestPayload {
  medicine_id: number;
  quantity: number;
  pharmacist_id?: number;
  admission_id?: number;
}

export interface DispenseResponseResult {
  success: boolean;
  message: string;
  dispense_id: number;
  rx_id: number;
  medicine_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  remaining_stock: number;
  dispensed_at: string;
}

export interface DispensationHistoryRecord {
  dispense_id: number;
  rx_id: number;
  patient_name: string;
  doctor_name: string;
  med_name: string;
  quantity: number;
  unit_price_at_sale: number;
  total_revenue: number;
  dispensed_at: string;
  pharmacist_name: string;
}

