import { useState, useEffect, useCallback } from 'react';

export interface Alert {
  id: string;
  keywords: string;
  category?: string;
  radiusKm: number;
  userId: string;
  createdAt: string;
  isActive: boolean;
}

const ALERTS_STORAGE_KEY = 'user_alerts';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Load alerts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAlerts(parsed);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  }, []);

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  }, [alerts]);

  const createAlert = useCallback((alertData: Omit<Alert, 'id' | 'createdAt' | 'isActive'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    setAlerts(prev => [newAlert, ...prev]);
    return newAlert.id;
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, isActive: !alert.isActive }
          : alert
      )
    );
  }, []);

  const getActiveAlerts = useCallback(() => {
    return alerts.filter(alert => alert.isActive);
  }, [alerts]);

  return {
    alerts,
    createAlert,
    deleteAlert,
    toggleAlert,
    getActiveAlerts,
  };
}
