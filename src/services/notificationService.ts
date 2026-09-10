import { api } from './axiosClient';
import { NotificationItem, NotificationSetting } from '../types/notification';

export const notificationService = {
  // UC-NO01 to UC-NO04: Get user notifications
  async getNotifications(page = 1, size = 20): Promise<{ content: NotificationItem[]; totalElements: number; totalPages: number }> {
    try {
      const pageNum = Math.max(1, page || 1);
      const response = await api.get('/notifications', {
        params: { page: pageNum, size, sortBy: 'createdAt', sortDirection: 'DESC' },
      });
      const data = response.data?.data;
      if (Array.isArray(data)) {
        return { content: data, totalElements: data.length, totalPages: 1 };
      }
      return {
        content: data?.content || [],
        totalElements: data?.totalElements || 0,
        totalPages: data?.totalPages || 1,
      };
    } catch (error) {
      console.error('[NotificationService] Failed to fetch notifications:', error);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  },

  // UC-NO04: Get badge unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data?.data?.unreadCount ?? 0;
    } catch (error) {
      console.error('[NotificationService] Failed to get unread count:', error);
      return 0;
    }
  },

  // UC-NO04: Mark single notification as read
  async markAsRead(id: string): Promise<boolean> {
    try {
      await api.put(`/notifications/${id}/read`);
      return true;
    } catch (error) {
      console.error(`[NotificationService] Failed to mark notification ${id} as read:`, error);
      return false;
    }
  },

  // UC-NO04: Mark all notifications as read
  async markAllAsRead(): Promise<boolean> {
    try {
      await api.put('/notifications/read-all');
      return true;
    } catch (error) {
      console.error('[NotificationService] Failed to mark all notifications as read:', error);
      return false;
    }
  },

  // UC-NO05: Get notification settings
  async getSettings(): Promise<NotificationSetting> {
    try {
      const response = await api.get('/notifications/settings');
      return response.data?.data || {
        likePost: true,
        commentPost: true,
        sharePost: true,
        friendRequest: true,
        message: true,
        call: true,
        system: true,
        sound: true,
        emailNotification: true,
      };
    } catch (error) {
      console.error('[NotificationService] Failed to load notification settings:', error);
      return {
        likePost: true,
        commentPost: true,
        sharePost: true,
        friendRequest: true,
        message: true,
        call: true,
        system: true,
        sound: true,
        emailNotification: true,
      };
    }
  },

  // UC-NO05: Update notification settings
  async updateSettings(settings: Partial<NotificationSetting>): Promise<NotificationSetting | null> {
    try {
      const response = await api.put('/notifications/settings', settings);
      return response.data?.data || null;
    } catch (error) {
      console.error('[NotificationService] Failed to update notification settings:', error);
      return null;
    }
  },
};
