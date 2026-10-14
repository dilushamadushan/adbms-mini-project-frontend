import apiClient from '@/lib/apiClient';
import { NotificationItem, NotificationListResponse, NotificationFilters } from '@/types';

export const notificationService = {
  /**
   * Fetch paginated notification list
   */
  getNotifications: async (filters: NotificationFilters = {}): Promise<NotificationListResponse> => {
    const response = await apiClient.get<NotificationListResponse>('/notifications', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Fetch unread notification count for the badge
   */
  getUnreadCount: async (role?: string): Promise<number> => {
    const response = await apiClient.get<{ unread_count: number }>('/notifications/unread-count', {
      params: role ? { role: role.toLowerCase() } : undefined,
    });
    return response.data?.unread_count ?? 0;
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (notificationId: number): Promise<{ notification_id: number; is_read: boolean; message: string }> => {
    const response = await apiClient.patch<{ notification_id: number; is_read: boolean; message: string }>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (role?: string): Promise<{ updated_count: number; message: string }> => {
    const response = await apiClient.patch<{ updated_count: number; message: string }>(
      '/notifications/mark-all-read',
      {},
      {
        params: role ? { role: role.toLowerCase() } : undefined,
      }
    );
    return response.data;
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId: number): Promise<{ notification_id: number; message: string }> => {
    const response = await apiClient.delete<{ notification_id: number; message: string }>(
      `/notifications/${notificationId}`
    );
    return response.data;
  },
};
