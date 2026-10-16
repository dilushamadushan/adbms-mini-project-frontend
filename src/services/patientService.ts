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
}

export const patientService = {

  getMyProfile: async (): Promise<PatientProfile> => {
    const response = await apiClient.get<PatientProfile>('/users/patient/me');
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
