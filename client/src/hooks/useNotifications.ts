import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'listing_created' | 'listing_matched' | 'message_received' | 'alert_triggered' | 'pickup_scheduled';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

const STORAGE_KEY = 'notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }, [notifications]);

  // Listen for notification update events
  useEffect(() => {
    const handleNotificationUpdate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setNotifications(parsed);
        }
      } catch (error) {
        console.error('Failed to refresh notifications:', error);
      }
    };

    window.addEventListener('notificationUpdated', handleNotificationUpdate);
    return () => window.removeEventListener('notificationUpdated', handleNotificationUpdate);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    console.log('Adding notification:', newNotification);
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      console.log('Updated notifications:', updated);
      return updated;
    });
    return newNotification.id;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };
}
