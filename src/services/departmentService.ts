import apiClient from '@/lib/apiClient';
import { 
  Department, 
  DepartmentCatalogNode, 
  CreateDepartmentPayload, 
  UpdateDepartmentPayload, 
  DeleteDepartmentResponse 
} from '@/types';

export const departmentService = {
  /**
   * Fetch hierarchical department catalog with nested sub-departments
   */
  getCatalog: async (): Promise<DepartmentCatalogNode[]> => {
    const response = await apiClient.get<DepartmentCatalogNode[]>('/departments/catalog');
    return response.data;
  },

  /**
   * Fetch all departments in a flat list
   */
  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get<Department[]>('/departments');
    return response.data;
  },

  /**
   * Create a new main department or sub-department
   */
  create: async (payload: CreateDepartmentPayload): Promise<Department> => {
    const response = await apiClient.post<Department>('/departments', payload);
    return response.data;
  },

  /**
   * Update department name or parent department
   */
  update: async (deptId: number, payload: UpdateDepartmentPayload): Promise<Department> => {
    const response = await apiClient.patch<Department>(`/departments/${deptId}`, payload);
    return response.data;
  },

  /**
   * Delete a department (protected by DB constraints: no sub-departments and no staff)
   */
  delete: async (deptId: number): Promise<DeleteDepartmentResponse> => {
    const response = await apiClient.delete<DeleteDepartmentResponse>(`/departments/${deptId}`);
    return response.data;
  },
};
