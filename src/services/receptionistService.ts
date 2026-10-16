import apiClient from '@/lib/apiClient';

export interface RecepAppointmentRecord {
  apt_id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  dept_id: number;
  dept_name: string;
  apt_date: string;
  time_slot: string;
  status: string;
}

export type ReceptionistOverviewAppointment = Pick<
  RecepAppointmentRecord,
  'apt_id' | 'patient_name' | 'doctor_name' | 'dept_name' | 'time_slot' | 'status'
>;

export interface ReceptionistOverview {
  total_patients: number;
  active_admissions: number;
  appointments_today: number;
  appointments: ReceptionistOverviewAppointment[];
}

export interface AvailableBed {
  bed_id: number;
  bed_number: string;
  ward_id: number;
  ward_name: string;
}

export interface WardRecord {
  ward_id: number;
  ward_name: string;
}

export interface AdmissionRecord {
  admission_id: number;
  patient_id: number;
  patient_name: string;
  ward_id: number;
  ward_name: string;
  admitted_doctor_id: number;
  admitted_doctor_name: string;
  guardian_name: string;
  guardian_relationship: string;
  guardian_contact: string;
  gender: 'Female' | 'Male' | null;
  bed_id: number | null;
  bed_number: string | null;
  admitted_at: string;
  admission_reason: string;
  status: 'Pending' | 'Admitted' | 'Discharge Authorized' | 'Discharged';
  discharge_authorized_by: number | null;
  discharge_authorized_at: string | null;
  discharge_notes: string | null;
  bill_id: number | null;
  room_charges: number | null;
  treatment_charges: number | null;
  other_charges: number | null;
  total_amount: number | null;
  amount_paid: number | null;
  payment_method: string | null;
  payment_status: 'Unpaid' | 'Partially Paid' | 'Paid' | null;
}

export interface AdmissionInput {
  patient_id: number;
  ward_id: number;
  admitted_doctor_id: number;
  admission_reason: string;
  guardian_name: string;
  guardian_relationship: string;
  guardian_contact: string;
  gender: 'Female' | 'Male';
}

export interface RecepPatientRecord {
  patient_id: number;
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  blood_group: string | null;
  emergency_contact: string | null;
  allergies: string | null;
  raw_password?: string | null;
}

export interface RecepAppointmentInput {
  patient_id: number;
  doctor_id: number;
  dept_id: number;
  apt_date: string;
  time_slot: string;
}

export interface DischargeBillInput {
  room_charges: number;
  treatment_charges: number;
  other_charges: number;
  amount_paid: number;
  payment_method: string | null;
}

export const receptionistService = {
  getOverview: async (): Promise<ReceptionistOverview> => {
    const response = await apiClient.get<ReceptionistOverview>('/receptionist/overview');
    return response.data;
  },

  getAvailableBeds: async (): Promise<AvailableBed[]> => {
    const response = await apiClient.get<AvailableBed[]>('/receptionist/beds/available');
    return response.data;
  },

  getWards: async (): Promise<WardRecord[]> => {
    const response = await apiClient.get<WardRecord[]>('/receptionist/wards');
    return response.data;
  },

  getAdmissions: async (activeOnly = true): Promise<AdmissionRecord[]> => {
    const response = await apiClient.get<AdmissionRecord[]>('/receptionist/admissions', {
      params: { active_only: activeOnly },
    });
    return response.data;
  },

  admitPatient: async (payload: AdmissionInput): Promise<AdmissionRecord> => {
    const response = await apiClient.post<AdmissionRecord>('/receptionist/admissions', payload);
    return response.data;
  },

  assignAdmissionBed: async (admissionId: number, bedId: number): Promise<AdmissionRecord> => {
    const response = await apiClient.patch<AdmissionRecord>(
      `/receptionist/admissions/${admissionId}/bed`,
      { bed_id: bedId },
    );
    return response.data;
  },

  registerPatient: async (payload: Omit<RecepPatientRecord, 'patient_id' | 'user_id' | 'username' | 'raw_password'>): Promise<RecepPatientRecord> => {
    const response = await apiClient.post<RecepPatientRecord>('/receptionist/patients', payload);
    return response.data;
  },

  getPatients: async (search?: string): Promise<RecepPatientRecord[]> => {
    const response = await apiClient.get<RecepPatientRecord[]>('/receptionist/patients', {
      params: { search },
    });
    return response.data;
  },

  getAppointments: async (params?: { patientId?: number; date?: string }): Promise<RecepAppointmentRecord[]> => {
    const response = await apiClient.get<RecepAppointmentRecord[]>('/receptionist/appointments', {
      params: { patient_id: params?.patientId, date: params?.date },
    });
    return response.data;
  },

  createAppointment: async (payload: RecepAppointmentInput): Promise<RecepAppointmentRecord> => {
    const response = await apiClient.post<RecepAppointmentRecord>('/receptionist/appointments', payload);
    return response.data;
  },

  rescheduleAppointment: async (appointmentId: number, aptDate: string, timeSlot: string): Promise<RecepAppointmentRecord> => {
    const response = await apiClient.patch<RecepAppointmentRecord>(
      `/receptionist/appointments/${appointmentId}/schedule`,
      { apt_date: aptDate, time_slot: timeSlot },
    );
    return response.data;
  },

  updateAppointmentStatus: async (appointmentId: number, status: 'Scheduled' | 'Cancelled'): Promise<RecepAppointmentRecord> => {
    const response = await apiClient.patch<RecepAppointmentRecord>(
      `/receptionist/appointments/${appointmentId}/status`,
      { status },
    );
    return response.data;
  },

  calculateDischargeBill: async (
    admissionId: number,
    payload: DischargeBillInput,
  ): Promise<{ message: string; admission: AdmissionRecord }> => {
    const response = await apiClient.post<{ message: string; admission: AdmissionRecord }>(
      `/receptionist/admissions/${admissionId}/discharge-bill`,
      payload,
    );
    return response.data;
  },

  payDischargeBalance: async (
    admissionId: number,
    amount: number,
    paymentMethod: string,
  ): Promise<{ message: string; admission: AdmissionRecord }> => {
    const response = await apiClient.post<{ message: string; admission: AdmissionRecord }>(
      `/receptionist/admissions/${admissionId}/payments`,
      { amount, payment_method: paymentMethod },
    );
    return response.data;
  },

  authorizeDischarge: async (admissionId: number, dischargeNotes: string): Promise<AdmissionRecord> => {
    const response = await apiClient.patch<AdmissionRecord>(
      `/receptionist/admissions/${admissionId}/authorize-discharge`,
      { discharge_notes: dischargeNotes },
    );
    return response.data;
  },
};
