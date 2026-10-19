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

export const patientService = {

  getMyProfile: async (): Promise<PatientProfile> => {
    const response = await apiClient.get<PatientProfile>('/users/patient/me');
    return response.data;
  },

<<<<<<< HEAD
  register: async (payload: RegisterPatientPayload): Promise<RegisteredPatient> => {
    const response = await apiClient.post<RegisteredPatient>('/users/patient', payload);
    return response.data;
  },

  getReceptionistRecords: async (search?: string): Promise<PatientProfile[]> => {
    const response = await apiClient.get<PatientProfile[]>('/users/records', { params: { search } });
=======
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
>>>>>>> 1c1436bb3ef2e98a6c7df405434db4da31c1b5bd
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

