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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
  const audioCtxRef = useRef(null);
  const recentToastsRef = useRef(new Map());

  const userId = user?.id || localStorage.getItem("clerkId") || "";
  const userRole = (user?.unsafeMetadata?.role || localStorage.getItem("userRole") || "patient").toLowerCase().trim();
  const userEmail = user?.primaryEmailAddress?.emailAddress || localStorage.getItem("userEmail") || "";

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

  // Persistent Web Audio context initializer (resumed on any user gesture to satisfy browser autoplay policies)
  const getOrCreateAudioContext = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch (_) {
      return null;
    }
  }, []);

  useEffect(() => {
    const unlockHandler = () => {
      getOrCreateAudioContext();
    };

    window.addEventListener('click', unlockHandler);
    window.addEventListener('keydown', unlockHandler);
    window.addEventListener('touchstart', unlockHandler);

    return () => {
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
    };
  }, [getOrCreateAudioContext]);

  // Harmonic medical chime via Web Audio API (zero external dependencies, 100% reliable)
  const playChimeFallback = useCallback((isCritical = false) => {
    try {
      const ctx = getOrCreateAudioContext();
      if (!ctx) return;

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
      gain1.gain.setValueAtTime(0.3, now);
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
      console.warn('Web Audio chime synthesis note:', err.message);
    }
  }, [getOrCreateAudioContext]);

  // Primary sound player with instant fallback & overlapping prevention
  const playNotificationSound = useCallback((priority = "Normal") => {
    if (!soundEnabled) return;

    // Prevent overlapping sounds within 500ms
    const now = Date.now();
    if (now - lastSoundTimeRef.current < 500) {
      return;
    }
    lastSoundTimeRef.current = now;

    const isCritical = priority === "Critical" || priority === "critical";

    try {
      const soundFile = isCritical ? '/CriticalAlarm.mp3' : '/notify.mp3';
      const audio = new Audio(soundFile);
      audio.volume = isCritical ? 0.95 : 0.85;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser policy blocked MP3 autoplay, synthesize chime via Web Audio
          playChimeFallback(isCritical);
        });
      }
    } catch (_) {
      playChimeFallback(isCritical);
    }
  }, [soundEnabled, playChimeFallback]);

  // Display toast notification popup & update notification center
  const showNotification = useCallback((notification) => {
    const title = notification.title || 'Notification';
    const message = notification.message || '';
    const dedupeKey = `${title}_${message}`;
    const now = Date.now();

    // Prevent identical toasts from popping up twice within 4 seconds
    const lastSeen = recentToastsRef.current.get(dedupeKey);
    if (lastSeen && now - lastSeen < 4000) {
      return;
    }
    recentToastsRef.current.set(dedupeKey, now);

    // Garbage-collect old dedupe keys
    if (recentToastsRef.current.size > 50) {
      for (const [k, v] of recentToastsRef.current.entries()) {
        if (now - v > 15000) recentToastsRef.current.delete(k);
      }
    }

    const id = Date.now() + Math.random();
    const isCritical = notification.priority === "Critical" || notification.type === "critical" || notification.type === "error";
    const isHigh = notification.priority === "High" || notification.type === "warning" || notification.type === "alert";

    const newToast = {
      id,
      type: isCritical ? 'critical' : isHigh ? 'warning' : (notification.type || 'info'),
      priority: notification.priority || (isCritical ? 'Critical' : isHigh ? 'High' : 'Normal'),
      title,
      message,
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

    // 4. Determine if this should be added to the persistent Notification Bell list
    // True notifications: from server/socket, have _id, have relatedEntityType (BloodRequest, Appointment, Donation, etc.), or explicitly flagged
    const isTrueNotification = Boolean(
      notification._id ||
      notification.fromServer ||
      notification.skipPersist ||
      notification.addToBell ||
      (notification.relatedEntityType && notification.relatedEntityType !== 'System') ||
      (notification.notificationType && notification.notificationType !== 'System')
    );

    if (isTrueNotification && notification.isToastOnly !== true) {
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
    }

    // 5. Only persist to backend if explicitly requested by a feature (NEVER auto-persist generic UI toasts)
    if (notification.persistToBackend === true && userId) {
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

    // 6. Auto dismiss the onscreen toast popup after duration
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

  // Fetch real notifications and unread count from backend database with deduplication
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const roleParam = userRole ? `&role=${encodeURIComponent(userRole)}` : "";
      const res = await apiFetch(`/api/notifications/${encodeURIComponent(userId)}?limit=100${roleParam}`);
      if (res && res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.notifications || [];

        // Deduplicate notifications by title, message and time bucket
        const seen = new Set();
        const cleanList = [];
        for (const item of rawList) {
          const timeBucket = item.createdAt ? Math.floor(new Date(item.createdAt).getTime() / 60000) : 0;
          const key = `${item.title}_${item.message}_${timeBucket}`;
          if (!seen.has(key)) {
            seen.add(key);
            cleanList.push(item);
          }
        }

        const count = typeof data.unreadCount === "number" ? data.unreadCount : cleanList.filter(n => !n.isRead && !n.read).length;
        setNotifications(cleanList);
        setUnreadCount(count);
      }
    } catch (err) {
      console.warn("Could not fetch notifications from server:", err.message);
    }
  }, [userId, userRole]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id) => {
    if (!id) return;
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
    // 1. Optimistic UI update immediately
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
    setUnreadCount(0);

    // 2. Broadcast to other tabs
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: "MARK_ALL_READ" });
    }

    // 3. Sync with backend
    if (userId) {
      try {
        const roleParam = userRole ? `?role=${encodeURIComponent(userRole)}` : "";
        await apiFetch(`/api/notifications/mark-all-read/${encodeURIComponent(userId)}${roleParam}`, {
          method: "PUT",
        });
      } catch (err) {
        console.warn("Server mark-all-read note:", err.message);
      }
    }
  }, [userId, userRole]);

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
        if (userEmail) idsToJoin.add(userEmail);

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
          fromServer: true,
          skipPersist: true,
        });
      });

      socket.on("notification:new", (incomingNotif) => {
        showNotification({
          ...incomingNotif,
          fromServer: true,
          skipPersist: true,
        });
      });

      // Listen for role-wide notifications
      socket.on("role-notification", (incomingNotif) => {
        if (incomingNotif.recipientUserId !== userId) {
          showNotification({
            ...incomingNotif,
            fromServer: true,
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

      // Real-time Status Update and Auto-Refresh Event Listeners
      const handleStatusRefresh = (payload) => {
        setRefreshTrigger((prev) => prev + 1);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hemocare:refresh-data", { detail: payload }));
          window.dispatchEvent(new CustomEvent("hemocare:status-updated", { detail: payload }));
        }
        fetchNotifications();
      };

      socket.on("request:statusUpdated", handleStatusRefresh);
      socket.on("appointment:statusUpdated", handleStatusRefresh);
      socket.on("donation:statusUpdated", handleStatusRefresh);
      socket.on("data:refresh", handleStatusRefresh);
      socket.on("blood-request-updated", handleStatusRefresh);

      // Listen for incoming real-time chat messages
      socket.on("new-message", (incomingMsg) => {
        if (incomingMsg.senderUserId !== userId) {
          showNotification({
            title: `New Message from ${incomingMsg.senderName || incomingMsg.senderRole || "Colleague"}`,
            message: incomingMsg.text || incomingMsg.message || "You have received a new message.",
            type: "info",
            priority: "High",
            relatedEntityType: "Message",
            requestId: incomingMsg.requestId || "",
            senderName: incomingMsg.senderName || incomingMsg.senderRole || "",
            senderRole: incomingMsg.senderRole || "",
            senderUserId: incomingMsg.senderUserId || "",
            fromServer: true,
            skipPersist: true,
            playSound: true,
          });
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hemocare:refresh-data", { detail: { entity: "messages", ...incomingMsg } }));
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
  }, [userId, userRole, userEmail, fetchNotifications, showNotification]);

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
    refreshTrigger,
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
