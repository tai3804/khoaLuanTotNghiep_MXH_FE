import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { NotificationItem, NotificationSetting } from '../types/notification';
import { notificationService } from '../services/notificationService';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  settings: NotificationSetting | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (id: string) => void;
  updateSettings: (newSettings: Partial<NotificationSetting>) => Promise<boolean>;
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showInfo } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<NotificationSetting | null>(null);

  const stompClientRef = useRef<Client | null>(null);
  const soundEnabledRef = useRef<boolean>(true);

  // Play audio chime using Web Audio API (safe, no external assets needed)
  const playNotificationSound = useCallback(() => {
    try {
      if (!soundEnabledRef.current) return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Fetch initial notifications and unread badge count
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [notifData, count] = await Promise.all([
        notificationService.getNotifications(1, 30),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifData.content);
      setUnreadCount(count);
    } catch (err) {
      console.error('[NotificationContext] Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Dismiss notification locally
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Fetch user settings
  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const s = await notificationService.getSettings();
      setSettings(s);
      soundEnabledRef.current = s.sound;
    } catch (err) {
      console.error('[NotificationContext] Failed to load settings:', err);
    }
  }, [isAuthenticated]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSetting>) => {
    try {
      const updated = await notificationService.updateSettings(newSettings);
      if (updated) {
        setSettings(updated);
        soundEnabledRef.current = updated.sound;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await notificationService.markAsRead(id);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    await notificationService.markAllAsRead();
  }, []);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchSettings();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setSettings(null);
    }
  }, [isAuthenticated, fetchNotifications, fetchSettings]);

  // UC-NO06: Realtime WebSocket connection via STOMP
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('token');
    const userId = user.id;
    if (!userId) return;

    // Connect directly to notification service websocket (port 8083) to avoid duplicate CORS headers from gateway
    const wsUrl = import.meta.env.VITE_NOTIFICATION_WS_URL || 'http://localhost:8083/ws-notifications';

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        access_token: token || '',
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log('[Notification WebSocket] Connected to broker');

        // Subscribe to user's realtime notification feed
        client.subscribe(`/topic/notifications.${userId}`, (msg) => {
          try {
            const newNotif: NotificationItem = JSON.parse(msg.body);
            setNotifications((prev) => {
              if (prev.some((n) => n.id === newNotif.id)) return prev;
              return [newNotif, ...prev];
            });
            setUnreadCount((prev) => prev + 1);

            // Audio chime & toast notification
            playNotificationSound();
            showInfo(newNotif.title ? `${newNotif.title}: ${newNotif.content}` : newNotif.content);
          } catch (e) {
            console.error('[Notification WebSocket] Parse error:', e);
          }
        });

        // Subscribe to user's realtime unread count
        client.subscribe(`/topic/notifications.count.${userId}`, (msg) => {
          try {
            const data = JSON.parse(msg.body);
            if (typeof data.unreadCount === 'number') {
              setUnreadCount(data.unreadCount);
            }
          } catch (e) {
            console.error('[Notification WebSocket] Count parse error:', e);
          }
        });
      },
      onStompError: (frame) => {
        console.warn('[Notification WebSocket] STOMP error:', frame);
      },
    });

    client.activate();
    stompClientRef.current = client;

    // Polling fallback every 20s to ensure consistent sync
    const pollInterval = setInterval(() => {
      notificationService.getUnreadCount().then(setUnreadCount).catch(() => {});
    }, 20000);

    return () => {
      clearInterval(pollInterval);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [isAuthenticated, user, playNotificationSound, showInfo]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        settings,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        updateSettings,
        playNotificationSound,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
