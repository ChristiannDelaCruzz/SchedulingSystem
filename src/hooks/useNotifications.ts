// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { mockNotifications } from '../mocks/notifications';
import type { AppNotification, NotificationType } from '../types';

interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

// Module-level in-memory store so all hook instances share state
let cachedNotifications: AppNotification[] = [...mockNotifications];
const subscribers = new Set<() => void>();

const notifySubscribers = () => {
  subscribers.forEach((fn) => fn());
};

export function useNotifications(): UseNotificationsReturn {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter for the current user (fallback to admin's notifications if none)
  const getUserNotifications = useCallback((): AppNotification[] => {
    if (!user) return [];
    const mine = cachedNotifications.filter((n) => n.user_id === user.id);
    return mine.length > 0 ? mine : cachedNotifications;
  }, [user]);

  // Sync from cache
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const sync = () => {
      setNotifications(getUserNotifications());
    };

    sync();
    setIsLoading(false);

    subscribers.add(sync);
    return () => {
      subscribers.delete(sync);
    };
  }, [isAuthenticated, getUserNotifications]);

  const refresh = useCallback(() => {
    setNotifications(getUserNotifications());
  }, [getUserNotifications]);

  const markAsRead = useCallback((id: string) => {
    cachedNotifications = cachedNotifications.map((n) =>
      n.id === id ? { ...n, is_read: true } : n
    );
    notifySubscribers();
  }, []);

  const markAllAsRead = useCallback(() => {
    cachedNotifications = cachedNotifications.map((n) => ({ ...n, is_read: true }));
    notifySubscribers();
  }, []);

  const deleteNotification = useCallback((id: string) => {
    cachedNotifications = cachedNotifications.filter((n) => n.id !== id);
    notifySubscribers();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

// ============================================
// Helper — used by other modules to push a new notification
// ============================================
export function pushNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'info',
  category: AppNotification['category'] = 'system',
  actionUrl?: string
) {
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: userId,
    title,
    message,
    type,
    category,
    is_read: false,
    action_url: actionUrl,
    created_at: new Date().toISOString(),
  };
  cachedNotifications = [newNotif, ...cachedNotifications];
  notifySubscribers();
}