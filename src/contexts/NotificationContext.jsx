import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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
  const [isRinging, setIsRinging] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('hemocare_sound_enabled') !== 'false';
    } catch (_) {
      return true;
    }
  });

  const lastSoundTimeRef = useRef(0);
  const ringTimeoutRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  const userId = user?.id || localStorage.getItem("clerkId") || "";
  const userRole = (user?.unsafeMetadata?.role || localStorage.getItem("userRole") || "patient").toLowerCase().trim();

  // Multi-tab synchronization via BroadcastChannel
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("hemocare_notifications");
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === "MARK_READ" && payload?.id) {
          setNotifications(prev => prev.map(n => ((n._id === payload.id || n.id === payload.id) ? { ...n, isRead: true, read: true } : n)));
          setUnreadCount(prev => Math.max(0, prev - 1));
        } else if (type === "MARK_ALL_READ") {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
          setUnreadCount(0);
        } else if (type === "SOUND_TOGGLE" && typeof payload?.enabled === "boolean") {
          setSoundEnabled(payload.enabled);
        } else if (type === "NEW_NOTIFICATION" && payload) {
          triggerBellRing();
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  // Sound preference toggle
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('hemocare_sound_enabled', String(next));
      } catch (_) {}
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: "SOUND_TOGGLE", payload: { enabled: next } });
      }
      return next;
    });
  }, []);

  // Subtle ringing bell animation trigger
  const triggerBellRing = useCallback(() => {
    setIsRinging(true);
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    ringTimeoutRef.current = setTimeout(() => {
      setIsRinging(false);
    }, 1400);
  }, []);

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
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Harmonic medical chime fallback via Web Audio API (zero file dependencies, 100% reliable)
  const playChimeFallback = useCallback((isCritical = false) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (isCritical) {
        // High alert double pulse (A5: 880Hz, C6: 1046.5Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(880, now);
        gain1.gain.setValueAtTime(0.4, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.18);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1046.5, now + 0.12);
        gain2.gain.setValueAtTime(0.45, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.35);
        return;
      }

      // Standard harmonic clinical chime: Note 1: E5 (659.25 Hz)
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

  // Primary sound player with instant fallback & overlapping prevention
  const playNotificationSound = useCallback((priority = "Normal") => {
    if (!soundEnabled) return;

    // Prevent overlapping sounds within 750ms
    const now = Date.now();
    if (now - lastSoundTimeRef.current < 750) {
      return;
    }
    lastSoundTimeRef.current = now;

    const isCritical = priority === "Critical" || priority === "critical";

    try {
      const soundFile = isCritical ? '/CriticalAlarm.mp3' : '/Notify%20Sound.mp3';
      const audio = new Audio(soundFile);
      audio.volume = isCritical ? 0.95 : 0.85;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          playChimeFallback(isCritical);
        });
      }
    } catch (_) {
      playChimeFallback(isCritical);
    }
  }, [soundEnabled, playChimeFallback]);

  // Display toast notification popup & store in persistent notification state & DB
  const showNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const isCritical = notification.priority === "Critical" || notification.type === "critical" || notification.type === "error";
    const isHigh = notification.priority === "High" || notification.type === "warning" || notification.type === "alert";

    const newToast = {
      id,
      type: isCritical ? 'critical' : isHigh ? 'warning' : (notification.type || 'info'),
      priority: notification.priority || (isCritical ? 'Critical' : isHigh ? 'High' : 'Normal'),
      title: notification.title || 'Notification',
      message: notification.message || '',
      senderName: notification.senderName || notification.senderRole || '',
      senderRole: notification.senderRole || '',
      requestId: notification.requestId || '',
      actionUrl: notification.actionUrl || '',
      relatedEntityType: notification.relatedEntityType || 'System',
      duration: notification.duration || (isCritical ? 10000 : isHigh ? 8000 : 6000),
      playSound: notification.playSound !== false,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      ...notification
    };

    // 1. Show onscreen toast popup
    setToasts(prev => [newToast, ...prev]);

    // 2. Play sound only if allowed and enabled
    if (newToast.playSound) {
      playNotificationSound(newToast.priority);
    }

    // 3. Trigger visual bell ring animation
    triggerBellRing();

    // 4. Store in persistent notification state for the notification page & bell
    const notifId = notification._id || notification.id || `notif_${id}`;
    setNotifications(prev => {
      if (prev.some(n => (n._id && n._id === notifId) || (n.id && n.id === notifId))) {
        return prev;
      }
      return [
        {
          _id: notifId,
          id: notifId,
          title: newToast.title,
          message: newToast.message,
          notificationType: newToast.notificationType || (isCritical ? 'Alert' : 'General'),
          type: newToast.type,
          priority: newToast.priority,
          createdAt: newToast.createdAt,
          date: newToast.date,
          isRead: false,
          read: false,
          recipientUserId: userId,
          senderName: newToast.senderName,
          senderRole: newToast.senderRole,
          requestId: newToast.requestId,
          actionUrl: newToast.actionUrl || "",
          relatedEntityType: newToast.relatedEntityType,
          ...notification,
        },
        ...prev
      ];
    });
    setUnreadCount(prev => prev + 1);

    // Broadcast to other open tabs
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: "NEW_NOTIFICATION", payload: newToast });
    }

    // 5. Save to backend database if this was a purely client-triggered notification
    if (userId && !notification.skipPersist && !notification._id) {
      apiFetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUserId: userId,
          recipientRole: userRole,
          title: newToast.title,
          message: newToast.message,
          notificationType: newToast.notificationType || newToast.type || 'System',
          priority: newToast.priority,
          actionUrl: newToast.actionUrl || "",
          requestId: newToast.requestId || "",
          relatedEntityType: newToast.relatedEntityType || "System",
        })
      }).catch(() => {});
    }

    // 6. Auto dismiss ONLY the onscreen toast popup (persistent notification stays in DB & bell)
    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, newToast.duration);
    }
  }, [userId, userRole, playNotificationSound, triggerBellRing]);

  const dismissNotification = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setToasts([]);
  }, []);

  // Fetch real notifications and unread count from backend database
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
    setNotifications(prev => prev.map(n => ((n._id === id || n.id === id) ? { ...n, isRead: true, read: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: "MARK_READ", payload: { id } });
    }

    try {
      await apiFetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "PUT" });
    } catch (_) {}
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
    setUnreadCount(0);

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: "MARK_ALL_READ" });
    }

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
        reconnectionAttempts: 10,
        reconnectionDelay: 1500,
      });

      const joinAllRooms = () => {
        // Join all possible IDs for this user
        const idsToJoin = new Set([userId]);
        try {
          const clerkId = localStorage.getItem("clerkId");
          const localUid = localStorage.getItem("userId");
          const patientId = localStorage.getItem("patientId");
          const donorId = localStorage.getItem("donorId");
          const staffId = localStorage.getItem("hospitalStaffId");
          const bbStaffId = localStorage.getItem("bloodBankStaffId");
          const adminId = localStorage.getItem("adminId");

          if (clerkId) idsToJoin.add(clerkId);
          if (localUid) idsToJoin.add(localUid);
          if (patientId) idsToJoin.add(patientId);
          if (donorId) idsToJoin.add(donorId);
          if (staffId) idsToJoin.add(staffId);
          if (bbStaffId) idsToJoin.add(bbStaffId);
          if (adminId) idsToJoin.add(adminId);
        } catch (_) {}

        idsToJoin.forEach((id) => {
          if (id) socket.emit("join-user-room", id);
        });

        if (userRole) {
          socket.emit("join-role-room", userRole);
          if (userRole === "hospital_staff" || userRole === "hospital") {
            socket.emit("join-role-room", "hospital_staff");
          } else if (userRole === "blood_bank_staff" || userRole === "blood_bank") {
            socket.emit("join-role-room", "blood_bank_staff");
            socket.emit("join-staff-room");
          } else if (userRole === "administrator" || userRole === "admin" || userRole === "super_admin") {
            socket.emit("join-role-room", "administrator");
            socket.emit("join-role-room", "admin");
          }
        }
      };

      socket.on("connect", joinAllRooms);
      socket.on("reconnect", joinAllRooms);

      // Listen for direct personal notifications
      socket.on("notification", (incomingNotif) => {
        showNotification({
          ...incomingNotif,
          skipPersist: true,
        });
      });

      socket.on("notification:new", (incomingNotif) => {
        showNotification({
          ...incomingNotif,
          skipPersist: true,
        });
      });

      // Listen for role-wide notifications
      socket.on("role-notification", (incomingNotif) => {
        if (incomingNotif.recipientUserId !== userId) {
          showNotification({
            ...incomingNotif,
            skipPersist: true,
          });
        }
      });

      // Listen for notification read status from another tab or action
      socket.on("notification:read", ({ notificationId, id }) => {
        const targetId = notificationId || id;
        if (targetId) {
          setNotifications(prev => prev.map(n => ((n._id === targetId || n.id === targetId) ? { ...n, isRead: true, read: true } : n)));
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      });

      socket.on("notification:all-read", () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
        setUnreadCount(0);
      });

      socket.on("notification:count", ({ count }) => {
        if (typeof count === "number") {
          setUnreadCount(count);
        }
      });

      // Listen for new messages
      socket.on("new-message", (incomingMsg) => {
        if (incomingMsg.senderUserId !== userId) {
          showNotification({
            title: `New Message from ${incomingMsg.senderName || incomingMsg.senderRole || "Colleague"}`,
            message: incomingMsg.text || incomingMsg.message || "You have received a new message.",
            type: "info",
            priority: "Normal",
            relatedEntityType: "Message",
            requestId: incomingMsg.requestId || "",
            skipPersist: true,
          });
        }
      });
    } catch (err) {
      console.warn("Socket.io connection warning in NotificationContext:", err.message);
    }

    // Polling fallback every 20 seconds to guarantee fresh synchronization across tabs
    const interval = setInterval(() => {
      fetchNotifications();
    }, 20000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId, userRole, fetchNotifications, showNotification]);

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
    isRinging,
    soundEnabled,
    toggleSound,
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
