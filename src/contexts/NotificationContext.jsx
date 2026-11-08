import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { io } from 'socket.io-client';
import { API_BASE_URL, apiFetch } from '../utils/apiConfig';
import RequestMessageModal from '../components/RequestMessageModal';

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
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeConversation, setActiveConversation] = useState(null);

  const userId = user?.id || localStorage.getItem("clerkId") || "";
  const userRole = (user?.unsafeMetadata?.role || localStorage.getItem("userRole") || "patient").toLowerCase().trim();

  // Auto-unlock Web Audio context on the first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        }
      } catch (_) {}
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Harmonic medical chime fallback via Web Audio API (zero file dependencies, 100% reliable)
  const playChimeFallback = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.28, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.22);

      // Note 2: B5 (987.77 Hz) - harmonic sparkle
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.08);
      gain2.gain.setValueAtTime(0.35, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.45);
    } catch (err) {
      console.warn('Web Audio chime synthesis failed:', err);
    }
  }, []);

  // Primary sound player with instant fallback
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/Notify%20Sound.mp3');
      audio.volume = 0.85;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          playChimeFallback();
        });
      }
    } catch (err) {
      playChimeFallback();
    }
  }, [playChimeFallback]);

  // Display toast notification popup & store in persistent notification state & DB
  const showNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: notification.type || 'info',
      title: notification.title || 'Notification',
      message: notification.message || '',
      duration: notification.duration || 5000,
      playSound: notification.playSound !== false,
      date: new Date().toISOString().split('T')[0],
      ...notification
    };

    // 1. Show onscreen toast popup
    setToasts(prev => [newToast, ...prev]);

    // 2. Play sound
    if (newToast.playSound) {
      playNotificationSound();
    }

    // 3. Store permanently in notifications state for the notification page & bell
    setNotifications(prev => {
      const notifId = notification._id || notification.id || `notif_${id}`;
      if (prev.some(n => (n._id && n._id === notifId) || (n.id && n.id === notifId))) {
        return prev;
      }
      return [
        {
          _id: notifId,
          id: notifId,
          title: newToast.title,
          message: newToast.message,
          notificationType: newToast.type === 'error' || newToast.type === 'critical' ? 'Alert' : 'General',
          type: newToast.type,
          priority: newToast.type === 'critical' ? 'Critical' : 'Normal',
          createdAt: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          isRead: false,
          read: false,
          recipientUserId: userId,
          actionUrl: newToast.actionUrl || "",
          ...notification,
        },
        ...prev
      ];
    });
    setUnreadCount(prev => prev + 1);

    // 4. Save to backend database so it persists across page reloads & visits
    if (userId && !notification.skipPersist && !notification._id) {
      apiFetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUserId: userId,
          recipientRole: userRole,
          title: newToast.title,
          message: newToast.message,
          notificationType: newToast.category || newToast.type || 'System',
          priority: newToast.type === 'critical' ? 'Critical' : 'Normal',
          actionUrl: newToast.actionUrl || "",
        })
      }).catch(() => {});
    }

    // 5. Auto dismiss ONLY the onscreen toast popup (persistent notification stays intact)
    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, newToast.duration);
    }
  }, [userId, userRole, playNotificationSound]);

  const dismissNotification = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setToasts([]);
  }, []);

  // Fetch real notifications from backend database
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const roleParam = userRole ? `&role=${encodeURIComponent(userRole)}` : "";
      const res = await apiFetch(`/api/notifications/${encodeURIComponent(userId)}?limit=100${roleParam}`);
      if (res && res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.notifications || [];
        const count = typeof data.unreadCount === "number" ? data.unreadCount : list.filter(n => !n.isRead && !n.read).length;
        setNotifications(list);
        setUnreadCount(count);
      }
    } catch (err) {
      console.warn("Could not fetch notifications from server:", err.message);
    }
  }, [userId, userRole]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => (n._id === id || n.id === id ? { ...n, isRead: true, read: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await apiFetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "PUT" });
    } catch (_) {}
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
    setUnreadCount(0);
    if (userId) {
      try {
        await apiFetch(`/api/notifications/mark-all-read/${encodeURIComponent(userId)}`, { method: "PUT" });
      } catch (_) {}
    }
  }, [userId]);

  // Socket.IO Real-time Connection for notifications & messages
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    let socket;
    try {
      socket = io(API_BASE_URL, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1500,
      });

      socket.on("connect", () => {
        socket.emit("join-user-room", userId);
        if (userRole) {
          socket.emit("join-role-room", userRole);
        }
      });

      // Listen for direct personal notifications
      socket.on("notification", (incomingNotif) => {
        showNotification({
          ...incomingNotif,
          skipPersist: true,
          type: incomingNotif.priority === "Critical" ? "critical" : incomingNotif.priority === "High" ? "warning" : "info",
        });
      });

      // Listen for role-wide notifications
      socket.on("role-notification", (incomingNotif) => {
        if (incomingNotif.recipientUserId !== userId) {
          showNotification({
            ...incomingNotif,
            skipPersist: true,
            type: incomingNotif.priority === "Critical" ? "critical" : "info",
          });
        }
      });

      // Listen for new messages
      socket.on("new-message", (incomingMsg) => {
        if (incomingMsg.senderUserId !== userId) {
          playNotificationSound();
        }
      });
    } catch (err) {
      console.warn("Socket.io connection warning in NotificationContext:", err.message);
    }

    // Polling fallback every 20 seconds to guarantee fresh notifications across tabs
    const interval = setInterval(() => {
      fetchNotifications();
    }, 20000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId, userRole, fetchNotifications, showNotification, playNotificationSound]);

  // Request Conversation Modal controls
  const openConversation = useCallback((details) => {
    setActiveConversation(details);
  }, []);

  const closeConversation = useCallback(() => {
    setActiveConversation(null);
  }, []);

  const value = {
    toasts,
    notifications,
    unreadCount,
    showNotification,
    playNotificationSound,
    dismissNotification,
    clearAllNotifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    openConversation,
    closeConversation,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {activeConversation && (
        <RequestMessageModal
          isOpen={!!activeConversation}
          onClose={closeConversation}
          requestId={activeConversation.requestId}
          requestNumber={activeConversation.requestNumber}
          bloodGroup={activeConversation.bloodGroup}
          units={activeConversation.units}
          patientName={activeConversation.patientName}
          recipientRole={activeConversation.recipientRole}
          recipientUserId={activeConversation.recipientUserId}
          recipientName={activeConversation.recipientName}
        />
      )}
    </NotificationContext.Provider>
  );
};
