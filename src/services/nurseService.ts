import apiClient from '@/lib/apiClient';

export interface AssignedWardItem {
  ward_id: number;
  ward_name: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
}

export interface WardBedItem {
  bed_id: number;
  bed_number: string;
  ward_id: number;
  bed_status: 'Available' | 'Occupied' | 'Cleaning';
  current_patient_id?: number | null;
  patient_name?: string | null;
  gender?: string | null;
  dob?: string | null;
  blood_group?: string | null;
  allergies?: string | null;
  admission_id?: number | null;
  admitted_at?: string | null;
  admission_reason?: string | null;
  attending_doctor_name?: string | null;
  discharge_id?: number | null;
  discharge_status?: string | null;
  vitals_status?: 'CRITICAL' | 'MODERATE' | 'STABLE' | null;
  latest_bp?: string | null;
  latest_pulse?: number | null;
  latest_temperature?: number | null;
  latest_spo2?: number | null;
  latest_resp_rate?: number | null;
  latest_vitals_summary?: string | null;
  latest_vitals_time?: string | null;
}

export interface WardOverviewResponse {
  ward_id: number;
  ward_name: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  cleaning_beds: number;
  occupancy_rate: number;
  beds: WardBedItem[];
  assigned_wards?: AssignedWardItem[];
}

export interface DashboardStatsResponse {
  ward_id: number;
  ward_name: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  cleaning_beds: number;
  active_shift: string;
  critical_patients_count: number;
  medications_due_count: number;
  pending_orders_count: number;
}

export interface UnassignedAdmissionItem {
  admission_id: number;
  patient_id: number;
  patient_name: string;
  gender?: string | null;
  dob?: string | null;
  blood_group?: string | null;
  allergies?: string | null;
  admission_reason?: string | null;
  admitted_at?: string | null;
  guardian_name?: string | null;
  guardian_contact?: string | null;
  attending_doctor_name?: string | null;
  target_ward_id?: number | null;
}

export interface VitalsLogItem {
  vital_id: number;
  patient_id: number;
  bp?: string | null;
  pulse?: number | null;
  temperature?: number | null;
  spo2?: number | null;
  resp_rate?: number | null;
  blood_sugar?: number | null;
  weight?: number | null;
  recorded_at?: string | null;
  recorded_by_name?: string | null;
}

export interface VitalsLogCreatePayload {
  bp: string;
  pulse: number;
  temperature: number;
  spo2?: number;
  resp_rate?: number;
  blood_sugar?: number;
  weight?: number;
}

export interface VitalsLogResponse {
  vital_id: number;
  patient_id: number;
  bp: string;
  pulse: number;
  temperature: number;
  spo2?: number | null;
  resp_rate?: number | null;
  blood_sugar?: number | null;
  weight?: number | null;
  recorded_at: string;
  recorded_by_name?: string | null;
  current_status?: string;
}

export interface BedDetailResponse {
  bed_id: number;
  bed_number: string;
  ward_id: number;
  ward_name: string;
  bed_status: 'Available' | 'Occupied' | 'Cleaning';
  patient_id?: number | null;
  patient_name?: string | null;
  dob?: string | null;
  age?: number | null;
  blood_group?: string | null;
  emergency_contact?: string | null;
  allergies?: string | null;
  admission_id?: number | null;
  admitted_at?: string | null;
  admission_reason?: string | null;
  attending_doctor?: string | null;
  discharge_id?: number | null;
  discharge_status?: 'Authorized' | 'Discharged' | null;
  discharge_notes?: string | null;
  recent_vitals: VitalsLogItem[];
}

export interface WardPatientItem {
  patient_id: number;
  patient_name: string;
  dob: string;
  age?: number | null;
  blood_group?: string | null;
  allergies?: string | null;
  admission_id?: number | null;
  admitted_at?: string | null;
  admission_reason?: string | null;
  bed_id?: number | null;
  bed_number?: string | null;
  ward_id?: number | null;
  ward_name?: string | null;
  attending_doctor?: string | null;
  discharge_id?: number | null;
  discharge_status?: string | null;
  vitals_status?: string | null;
}

export interface DischargeCompleteResponse {
  discharge_id: number;
  admission_id: number;
  status: string;
  freed_bed_id?: number | null;
  message: string;
}

export interface MarPrescriptionItem {
  rx_id: number;
  med_name: string;
  dosage: string;
  duration?: string | null;
  rx_status: string;
  doctor_name?: string | null;
  has_allergy_conflict: boolean;
  patient_allergies?: string | null;
  last_status?: string | null;
  last_administered_at?: string | null;
}

export interface MarHistoryItem {
  mar_id: number;
  rx_id: number;
  med_name: string;
  dosage: string;
  status: 'Given' | 'Not Given' | 'Refused' | 'Held';
  reason?: string | null;
  notes?: string | null;
  administered_at: string;
  administered_by_name?: string | null;
}

export interface MarOverviewResponse {
  prescriptions: MarPrescriptionItem[];
  history: MarHistoryItem[];
}

export interface MarAdministerRequest {
  rx_id: number;
  status: 'Given' | 'Not Given' | 'Refused' | 'Held';
  reason?: string;
  notes?: string;
}

export interface DoctorOrderItem {
  order_id: number;
  patient_id: number;
  order_type: 'Medication' | 'Lab' | 'Diet' | 'IV_Fluids' | 'Nursing_Care' | 'Special';
  instruction: string;
  status: 'Pending' | 'Acknowledged' | 'In_Progress' | 'Done';
  doctor_name?: string | null;
  acknowledged_by?: number | null;
  acknowledged_by_name?: string | null;
  acknowledged_at?: string | null;
  completed_by?: number | null;
  completed_at?: string | null;
  created_at: string;
}

export interface NursingNoteItem {
  note_id: number;
  patient_id: number;
  note_type: 'SOAP' | 'General' | 'CarePlan' | 'WoundCare' | 'Diet';
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
  content: string;
  created_at: string;
  nurse_name?: string | null;
}

export interface NursingNoteCreatePayload {
  note_type: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  content: string;
}

export interface IntakeOutputItem {
  io_id: number;
  io_type: 'Intake' | 'Output';
  category: string;
  volume_ml: number;
  notes?: string | null;
  entry_time: string;
  recorded_by_name?: string | null;
}

export interface IntakeOutputSummaryResponse {
  summary_date: string;
  total_intake_ml: number;
  total_output_ml: number;
  net_balance_ml: number;
  entries: IntakeOutputItem[];
}

export interface IntakeOutputCreatePayload {
  io_type: 'Intake' | 'Output';
  category: string;
  volume_ml: number;
  notes?: string;
}


export interface NurseStaffItem {
  staff_id: number;
  user_id: number;
  nurse_name: string;
  username: string;
  specialty?: string | null;
}

export const nurseService = {
  getWardOverview: async (wardId?: number): Promise<WardOverviewResponse> => {
    const params = wardId ? { ward_id: wardId } : {};
    const res = await apiClient.get<WardOverviewResponse>('/nurse/ward-overview', { params });
    return res.data;
  },

  getDashboardStats: async (wardId?: number): Promise<DashboardStatsResponse> => {
    const params = wardId ? { ward_id: wardId } : {};
    const res = await apiClient.get<DashboardStatsResponse>('/nurse/dashboard/stats', { params });
    return res.data;
  },

  getUnassignedPatients: async (wardId: number): Promise<UnassignedAdmissionItem[]> => {
    const res = await apiClient.get<UnassignedAdmissionItem[]>(`/nurse/ward/${wardId}/unassigned-patients`);
    return res.data;
  },

  assignPatientToBed: async (bedId: number, admissionId: number): Promise<any> => {
    const res = await apiClient.post(`/nurse/bed/${bedId}/assign-patient`, { admission_id: admissionId });
    return res.data;
  },

  getBedDetails: async (bedId: number | string): Promise<BedDetailResponse> => {
    const res = await apiClient.get<BedDetailResponse>(`/nurse/bed/${bedId}`);
    return res.data;
  },

  recordVitals: async (
    bedId: number | string,
    payload: VitalsLogCreatePayload
  ): Promise<VitalsLogResponse> => {
    const res = await apiClient.post<VitalsLogResponse>(`/nurse/bed/${bedId}/vitals`, payload);
    return res.data;
  },

  updateBedStatus: async (
    bedId: number | string,
    status: 'Available' | 'Cleaning' | 'Occupied'
  ): Promise<{ bed_id: number; status: string }> => {
    const res = await apiClient.patch(`/nurse/bed/${bedId}/status`, { status });
    return res.data;
  },

  completeDischarge: async (admissionId: number): Promise<DischargeCompleteResponse> => {
    const res = await apiClient.post<DischargeCompleteResponse>(
      `/nurse/discharge/${admissionId}/complete`
    );
    return res.data;
  },

  getWardPatients: async (): Promise<WardPatientItem[]> => {
    const res = await apiClient.get<WardPatientItem[]>('/nurse/patients');
    return res.data;
  },

  getPatientMar: async (patientId: number): Promise<MarOverviewResponse> => {
    const res = await apiClient.get<MarOverviewResponse>(`/nurse/patient/${patientId}/mar`);
    return res.data;
  },

  administerMedication: async (
    patientId: number,
    payload: MarAdministerRequest
  ): Promise<any> => {
    const res = await apiClient.post(`/nurse/patient/${patientId}/mar/administer`, payload);
    return res.data;
  },

  getDoctorOrders: async (patientId: number): Promise<DoctorOrderItem[]> => {
    const res = await apiClient.get<DoctorOrderItem[]>(`/nurse/patient/${patientId}/orders`);
    return res.data;
  },

  updateDoctorOrderStatus: async (
    orderId: number,
    status: 'Acknowledged' | 'Done'
  ): Promise<{ order_id: number; status: string }> => {
    const res = await apiClient.patch(`/nurse/orders/${orderId}/status`, { status });
    return res.data;
  },

  getNursingNotes: async (patientId: number): Promise<NursingNoteItem[]> => {
    const res = await apiClient.get<NursingNoteItem[]>(`/nurse/patient/${patientId}/notes`);
    return res.data;
  },

  addNursingNote: async (
    patientId: number,
    payload: NursingNoteCreatePayload
  ): Promise<NursingNoteItem> => {
    const res = await apiClient.post<NursingNoteItem>(`/nurse/patient/${patientId}/notes`, payload);
    return res.data;
  },

  getPatientIo: async (patientId: number, date?: string): Promise<IntakeOutputSummaryResponse> => {
    const params = date ? { date } : {};
    const res = await apiClient.get<IntakeOutputSummaryResponse>(`/nurse/patient/${patientId}/io`, { params });
    return res.data;
  },

  logIntakeOutput: async (
    patientId: number,
    payload: IntakeOutputCreatePayload
  ): Promise<any> => {
    const res = await apiClient.post(`/nurse/patient/${patientId}/io`, payload);
    return res.data;
  },


  getWardNurses: async (): Promise<NurseStaffItem[]> => {
    const res = await apiClient.get<NurseStaffItem[]>('/nurse/ward-nurses');
    return res.data;
  },

  getWardDoctorOrders: async (): Promise<any[]> => {
    const res = await apiClient.get<any[]>('/nurse/ward-orders');
    return res.data;
  },

  getWardMar: async (): Promise<{ prescriptions: any[]; history: any[] }> => {
    const res = await apiClient.get<{ prescriptions: any[]; history: any[] }>('/nurse/ward-mar');
    return res.data;
  },

  getWardNursingNotes: async (): Promise<any[]> => {
    const res = await apiClient.get<any[]>('/nurse/ward-notes');
    return res.data;
  },

  getNurseLabOrders: async (status?: string): Promise<any[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get<any[]>('/nurse/lab-orders', { params });
    return res.data;
  },

  getPendingLabCount: async (): Promise<{ count: number }> => {
    const res = await apiClient.get<{ count: number }>('/nurse/lab-orders/pending-count');
    return res.data;
  },

  completeLabOrder: async (labId: number, resultsText: string): Promise<any> => {
    const res = await apiClient.post<any>(`/nurse/lab-orders/${labId}/complete`, { results_text: resultsText });
    return res.data;
  },
};


