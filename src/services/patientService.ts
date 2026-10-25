import apiClient from '@/lib/apiClient';
import { Patient } from '@/types';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export interface PatientProfile {
  patient_id: number;
  user_id: number;
  username: string;
  email: string | null;
  first_name: string;
  last_name: string;
  dob: string | null;
  blood_group: string | null;
  emergency_contact: string | null;
  allergies: string | null;
  created_at?: string | null;
}

export interface RegisterPatientPayload {
  first_name: string;
  last_name: string;
  email: string;
  dob: string;
  blood_group: string | null;
  emergency_contact: string;
  allergies: string;
}

export interface RegisteredPatient extends PatientProfile {
  raw_password: string | null;
}

export interface DoctorDepartmentItem {
  doctor_name: string;
  department_name: string;
}

export interface BookAppointmentData {
  doctor_id: number;
  dept_id: number;
  apt_date: string;
  time_slot: string;
  patient_id?: number;
}

export interface BookAppointmentResult {
  apt_id: number;
  patient_id: number;
  doctor_id: number;
  dept_id: number;
  apt_date: string;
  time_slot: string;
  status: string;
}

export interface UpdatePatientProfilePayload {
  first_name?: string;
  last_name?: string;
  dob?: string;
  emergency_contact?: string;
  email?: string;
}

export interface PatientPrescription {
  rx_id: number;
  record_id: number;
  med_name: string;
  dosage: string;
  duration?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
}

export interface PatientMedicalRecord {
  record_id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  doctor_specialty?: string | null;
  apt_id: number;
  apt_date?: string | null;
  diagnosis: string;
  clinical_notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  prescriptions?: PatientPrescription[];
}

export const patientService = {

  getMyProfile: async (): Promise<PatientProfile> => {
    const response = await apiClient.get<PatientProfile>('/users/patient/me');
    return response.data;
  },

  updateMyProfile: async (data: UpdatePatientProfilePayload): Promise<unknown> => {
    const response = await apiClient.put('/patient/profile', data);
    return response.data;
  },

  getPrescriptions: async (patientId: number | string, status?: string): Promise<PatientPrescription[]> => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') {
      params.append('status', status);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<PatientPrescription[]>(`/patient/prescriptions/${patientId}${queryString}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  getMedicalRecords: async (patientId: number | string): Promise<PatientMedicalRecord[]> => {
    const response = await apiClient.get<PatientMedicalRecord[]>(`/patient/medical-records/${patientId}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  getDoctorDepartments: async (): Promise<DoctorDepartmentItem[]> => {
    const response = await apiClient.get<DoctorDepartmentItem[]>('/patient/doctor-departments');
    return response.data;
  },

  getAvailableSlots: async (doctorName: string, departmentName: string, aptDate: string): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/patient/available-slots', {
      params: {
        doctor_name: doctorName,
        department_name: departmentName,
        apt_date: aptDate,
      },
    });
    return response.data;
  },

  bookAppointment: async (data: BookAppointmentData): Promise<BookAppointmentResult> => {
    const response = await apiClient.post<BookAppointmentResult>('/patient/book-appointment', data);
    return response.data;
  },
  
  getAll: (search?: string) =>
    apiClient.get<PaginatedResponse<Patient>>('/patients', { params: { search } }),

  
  getById: (id: string) =>
    apiClient.get<ApiResponse<Patient>>(`/patients/${id}`),

  
  create: (data: Omit<Patient, 'id'>) =>
    apiClient.post<ApiResponse<Patient>>('/patients', data),

  
  update: (id: string, data: Partial<Patient>) =>
    apiClient.patch<ApiResponse<Patient>>(`/patients/${id}`, data),
};

