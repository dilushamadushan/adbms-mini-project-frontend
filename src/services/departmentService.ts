import apiClient from '@/lib/apiClient';
import { 
  Department, 
  DepartmentCatalogNode, 
  CreateDepartmentPayload, 
  UpdateDepartmentPayload, 
  DeleteDepartmentResponse 
} from '@/types';

export const departmentService = {

  getCatalog: async (): Promise<DepartmentCatalogNode[]> => {
    const response = await apiClient.get<DepartmentCatalogNode[]>('/departments/catalog');
    return response.data;
  },


  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get<Department[]>('/departments');
    return response.data;
  },


  create: async (payload: CreateDepartmentPayload): Promise<Department> => {
    const response = await apiClient.post<Department>('/departments', payload);
    return response.data;
  },


  update: async (deptId: number, payload: UpdateDepartmentPayload): Promise<Department> => {
    const response = await apiClient.patch<Department>(`/departments/${deptId}`, payload);
    return response.data;
  },

  delete: async (deptId: number): Promise<DeleteDepartmentResponse> => {
    const response = await apiClient.delete<DeleteDepartmentResponse>(`/departments/${deptId}`);
    return response.data;
  },
};
