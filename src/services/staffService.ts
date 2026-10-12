import apiClient from '@/lib/apiClient';
import { StaffMember, CreateStaffPayload, UpdateUserStatusResponse } from '@/types';

export const staffService = {
  /**
   * Fetch all staff members from backend
   */
  getStaff: async (): Promise<StaffMember[]> => {
    const response = await apiClient.get<StaffMember[]>('/users/staff');
    return response.data;
  },

  /**
   * Register a new staff member and receive generated credentials
   */
  createStaff: async (payload: CreateStaffPayload): Promise<StaffMember> => {
    const response = await apiClient.post<StaffMember>('/users/staff', payload);
    return response.data;
  },

  /**
   * Update active status for a user
   */
  updateStatus: async (userId: number, isActive: boolean): Promise<UpdateUserStatusResponse> => {
    const response = await apiClient.patch<UpdateUserStatusResponse>(`/users/${userId}/status`, {
      is_active: isActive,
    });
    return response.data;
  },
};
