import apiClient from '@/lib/apiClient';
import { LabOrder } from '@/types';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export const labService = {
  
  getAll: (params?: { patientId?: string; status?: LabOrder['status'] }) =>
    apiClient.get<PaginatedResponse<LabOrder>>('/labs', { params }),

  
  getById: (id: string) =>
    apiClient.get<ApiResponse<LabOrder>>(`/labs/${id}`),

  
  create: (data: Omit<LabOrder, 'id'>) =>
    apiClient.post<ApiResponse<LabOrder>>('/labs', data),

  
  updateStatus: (id: string, status: LabOrder['status'], results?: Record<string, string>) =>
    apiClient.patch<ApiResponse<LabOrder>>(`/labs/${id}/status`, { status, results }),
};
