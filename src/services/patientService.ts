import apiClient from '@/lib/apiClient';
import { Patient } from '@/types';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export const patientService = {
  
  getAll: (search?: string) =>
    apiClient.get<PaginatedResponse<Patient>>('/patients', { params: { search } }),

  
  getById: (id: string) =>
    apiClient.get<ApiResponse<Patient>>(`/patients/${id}`),

  
  create: (data: Omit<Patient, 'id'>) =>
    apiClient.post<ApiResponse<Patient>>('/patients', data),

  
  update: (id: string, data: Partial<Patient>) =>
    apiClient.patch<ApiResponse<Patient>>(`/patients/${id}`, data),
};
