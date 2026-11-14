import { api } from './axiosClient';
import { NotificationItem, NotificationSetting } from '../types/notification';

const inFlightNotifications = new Map<string, Promise<{ content: NotificationItem[]; totalElements: number; totalPages: number }>>();
let inFlightUnreadCountPromise: Promise<number> | null = null;
let lastUnreadCount = 0;
let lastUnreadCountTime = 0;
const UNREAD_CACHE_TTL_MS = 10_000;

export const notificationService = {
  // UC-NO01 to UC-NO04: Get user notifications
  async getNotifications(page = 1, size = 20): Promise<{ content: NotificationItem[]; totalElements: number; totalPages: number }> {
    const pageNum = Math.max(1, page || 1);
    const key = `${pageNum}:${size}`;
    if (inFlightNotifications.has(key)) {
      return inFlightNotifications.get(key)!;
    }

    const fetchPromise = (async () => {
      try {
        const response = await api.get('/notifications', {
          params: { page: pageNum, size, sortBy: 'createdAt', sortDirection: 'DESC' },
        });
        const data = response.data?.data;
        const rawList = Array.isArray(data) ? data : data?.content || [];
        const content: NotificationItem[] = rawList.map((item: any) => ({
          ...item,
          id: String(item.id),
          isRead: Boolean(item.isRead ?? item.read ?? item.is_read ?? false),
        }));

        return {
          content,
          totalElements: Array.isArray(data) ? data.length : data?.totalElements || content.length,
          totalPages: Array.isArray(data) ? 1 : data?.totalPages || 1,
        };
      } catch (error) {
        console.error('[NotificationService] Failed to fetch notifications:', error);
        return { content: [], totalElements: 0, totalPages: 0 };
      } finally {
        inFlightNotifications.delete(key);
      }
    })();

    inFlightNotifications.set(key, fetchPromise);
    return fetchPromise;
  },

  // UC-NO04: Get badge unread count
  async getUnreadCount(forceRefresh = false): Promise<number> {
    if (!forceRefresh && lastUnreadCountTime > 0 && Date.now() - lastUnreadCountTime < UNREAD_CACHE_TTL_MS) {
      return lastUnreadCount;
    }
    if (inFlightUnreadCountPromise && !forceRefresh) {
      return inFlightUnreadCountPromise;
    }

    inFlightUnreadCountPromise = (async () => {
      try {
        const response = await api.get('/notifications/unread-count');
        const count = response.data?.data?.unreadCount ?? 0;
        lastUnreadCount = count;
        lastUnreadCountTime = Date.now();
        return count;
      } catch (error) {
        console.error('[NotificationService] Failed to get unread count:', error);
        return lastUnreadCount;
      } finally {
        inFlightUnreadCountPromise = null;
      }
    })();

    return inFlightUnreadCountPromise;
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
