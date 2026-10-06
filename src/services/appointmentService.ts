import apiClient from '@/lib/apiClient';
import { Appointment } from '@/types';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export const appointmentService = {
  
  getAll: (params?: { date?: string; doctorId?: string; patientId?: string }) =>
    apiClient.get<PaginatedResponse<Appointment>>('/appointments', { params }),

  
  getById: (id: string) =>
    apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`),

  
  create: (data: Omit<Appointment, 'id'>) =>
    apiClient.post<ApiResponse<Appointment>>('/appointments', data),

  
  updateStatus: (id: string, status: Appointment['status']) =>
    apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status }),

  
  cancel: (id: string) =>
    apiClient.delete(`/appointments/${id}`),
};
