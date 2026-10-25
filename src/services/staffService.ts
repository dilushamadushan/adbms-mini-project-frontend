import apiClient from '@/lib/apiClient';
import {
  StaffMember,
  CreateStaffPayload,
  UpdateStaffPayload,
  DeleteStaffResponse,
  UpdateUserStatusResponse,
} from '@/types';

export const staffService = {
  /**
   * Get all staff members
   * GET /users/staff (or /staff)
   */
  getStaff: async (): Promise<StaffMember[]> => {
    try {
      const response = await apiClient.get<StaffMember[]>('/users/staff');
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const fallback = await apiClient.get<StaffMember[]>('/staff');
        return fallback.data;
      }
      throw err;
    }
  },

  /**
   * Get a single staff member by id (staff_id or user_id)
   * GET /users/staff/{id} (or /staff/{id})
   */
  getStaffById: async (id: number | string): Promise<StaffMember> => {
    try {
      const response = await apiClient.get<StaffMember>(`/users/staff/${id}`);
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const fallback = await apiClient.get<StaffMember>(`/staff/${id}`);
        return fallback.data;
      }
      throw err;
    }
  },

  /**
   * Add a new staff member
   * POST /users/staff (or /staff)
   */
  createStaff: async (payload: CreateStaffPayload): Promise<StaffMember> => {
    try {
      const response = await apiClient.post<StaffMember>('/users/staff', payload);
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const fallback = await apiClient.post<StaffMember>('/staff', payload);
        return fallback.data;
      }
      throw err;
    }
  },

  /**
   * Edit staff member details
   * PUT / PATCH /users/staff/{id} (or /staff/{id})
   */
  updateStaff: async (id: number | string, payload: UpdateStaffPayload): Promise<StaffMember> => {
    try {
      const response = await apiClient.patch<StaffMember>(`/users/staff/${id}`, payload);
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 405) {
        // Method not allowed on PATCH, try PUT
        const putRes = await apiClient.put<StaffMember>(`/users/staff/${id}`, payload);
        return putRes.data;
      } else if (status === 404) {
        try {
          const fallback = await apiClient.patch<StaffMember>(`/staff/${id}`, payload);
          return fallback.data;
        } catch {
          const fallbackPut = await apiClient.put<StaffMember>(`/staff/${id}`, payload);
          return fallbackPut.data;
        }
      }
      throw err;
    }
  },

  /**
   * Hard Delete staff member permanently
   * DELETE /users/staff/{id} (or /staff/{id})
   */
  deleteStaff: async (id: number | string): Promise<DeleteStaffResponse> => {
    try {
      const response = await apiClient.delete<DeleteStaffResponse>(`/users/staff/${id}`);
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const fallback = await apiClient.delete<DeleteStaffResponse>(`/staff/${id}`);
        return fallback.data;
      }
      throw err;
    }
  },

  /**
   * Deactivate staff member (Soft Delete)
   * DELETE /users/staff/{id}?soft=true
   */
  deactivateStaff: async (id: number | string): Promise<DeleteStaffResponse> => {
    try {
      const response = await apiClient.delete<DeleteStaffResponse>(`/users/staff/${id}`, {
        params: { soft: true },
      });
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const fallback = await apiClient.delete<DeleteStaffResponse>(`/staff/${id}`, {
          params: { soft: true },
        });
        return fallback.data;
      }
      throw err;
    }
  },

  /**
   * Toggle Active / Inactive Status
   * PATCH /users/{user_id}/status
   */
  updateStatus: async (userId: number, isActive: boolean): Promise<UpdateUserStatusResponse> => {
    const response = await apiClient.patch<UpdateUserStatusResponse>(`/users/${userId}/status`, {
      is_active: isActive,
    });
    return response.data;
  },
};
