import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/Notify Sound.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Audio creation failed:', err);
    }
  }, []);

  const showNotification = useCallback(async (notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: notification.type || 'info', // success, error, warning, info
      title: notification.title || 'Notification',
      message: notification.message || '',
      duration: notification.duration || 5000,
      playSound: notification.playSound !== false, // default to true
      read: false,
      date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD for backend compatibility
      category: notification.type || 'info',
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play sound if enabled
    if (newNotification.playSound) {
      playNotificationSound();
    }

    // Auto dismiss after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, newNotification.duration);
    }

    // Save to MongoDB for persistent storage in PatientNotifications
    if (user?.id) {
      try {
        const email = user?.emailAddresses?.[0]?.emailAddress;
        const response = await fetch(`http://localhost:5000/api/patient/${user.id}/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            notification: newNotification,
            email 
          }),
        });
        if (!response.ok) {
          console.error('Failed to save notification to MongoDB');
        }
      } catch (error) {
        console.error('Error saving notification to MongoDB:', error);
      }
    }
  }, [playNotificationSound, user?.id, user?.emailAddresses]);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    showNotification,
    dismissNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
