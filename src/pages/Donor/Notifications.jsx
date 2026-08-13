import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell,
  FaCheck,
  FaXmark,
  FaCalendar,
  FaDroplet,
  FaAward,
  FaTriangleExclamation,
  FaCircleInfo,
  FaHeart,
  FaFilter,
  FaTrash,
  FaCheckDouble,
} from "react-icons/fa6";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const GREEN = "#16A34A";
const BLUE = "#2563EB";
const YELLOW = "#F59E0B";
const NAVY = "#0F172A";
const NAVY2 = "#1E293B";
const SLATE = "#334155";
const SLATE_L = "#64748B";
const BORDER = "#E2E8F0";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";

const Notifications = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/donor/${user.id}/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        // Fallback to mock data if API not available
        const mockNotifications = [
          {
            id: 1,
            type: "appointment_approved",
            title: "Appointment Approved",
            message: "Your blood donation appointment has been approved by Blood Bank Staff",
            time: "2 hours ago",
            read: false,
            icon: <FaCalendar />,
            color: GREEN,
          },
          {
            id: 2,
            type: "eligibility",
            title: "Eligibility Update",
            message: "You are now eligible to donate blood again!",
            time: "1 day ago",
            read: false,
            icon: <FaDroplet />,
            color: RED,
          },
          {
            id: 3,
            type: "campaign_approved",
            title: "Campaign Participation Approved",
            message: "Your participation in the World Blood Donor Day campaign has been approved",
            time: "2 days ago",
            read: true,
            icon: <FaAward />,
            color: YELLOW,
          },
          {
            id: 4,
            type: "appointment_reminder",
            title: "Appointment Reminder",
            message: "Reminder: Your blood donation appointment is tomorrow at 10:00 AM",
            time: "3 days ago",
            read: true,
            icon: <FaBell />,
            color: BLUE,
          },
          {
            id: 5,
            type: "donation_completed",
            title: "Donation Completed",
            message: "Your blood donation has been completed successfully. Certificate generated!",
            time: "1 week ago",
            read: true,
            icon: <FaHeart />,
            color: RED,
          },
          {
            id: 6,
            type: "certificate_generated",
            title: "Certificate Generated",
            message: "Your blood donation certificate is now available for download",
            time: "1 week ago",
            read: true,
            icon: <FaAward />,
            color: YELLOW,
          },
        ];
        setNotifications(mockNotifications);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setLoading(false);
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const NotificationIcon = ({ icon, color }) => (
    <div style={{
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: `${color}15`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: color,
      fontSize: "1rem",
    }}>
      {icon}
    </div>
  );

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: SMOKE,
        fontFamily: FONT,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48,
            height: 48,
            border: "3px solid #E2E8F0",
            borderTopColor: RED,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading notifications...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: SMOKE, fontFamily: FONT, padding: "24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}
        >
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: NAVY2, marginBottom: 8 }}>
              <FaBell style={{ marginRight: 12, color: RED }} />
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: 12,
                  padding: "4px 12px",
                  background: RED,
                  color: WHITE,
                  borderRadius: 20,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}>
                  {unreadCount}
                </span>
              )}
            </h1>
            <p style={{ fontSize: "1rem", color: SLATE_L }}>
              Stay updated with your donation activities
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: "12px 20px",
                background: BLUE,
                color: WHITE,
                border: "none",
                borderRadius: 8,
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FaCheckDouble />
              Mark All Read
            </button>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: WHITE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            padding: "16px",
            marginBottom: 24,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              background: filter === "all" ? RED : SMOKE,
              color: filter === "all" ? WHITE : NAVY2,
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              background: filter === "unread" ? RED : SMOKE,
              color: filter === "unread" ? WHITE : NAVY2,
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter("read")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              background: filter === "read" ? RED : SMOKE,
              color: filter === "read" ? WHITE : NAVY2,
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Read
          </button>
          <div style={{ flex: 1 }} />
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                background: WHITE,
                color: SLATE,
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FaTrash />
              Clear All
            </button>
          )}
        </motion.div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: WHITE,
              borderRadius: 16,
              border: `1px solid ${BORDER}`,
              padding: "60px 20px",
              textAlign: "center",
              color: SLATE_L,
            }}
          >
            <FaBell style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.3 }} />
            <p style={{ fontSize: "1rem" }}>No notifications</p>
            <p style={{ fontSize: "0.9rem", marginTop: 8 }}>
              {notifications.length === 0 ? "You're all caught up!" : "Try adjusting your filters"}
            </p>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: WHITE,
                  borderRadius: 12,
                  border: notification.read ? `1px solid ${BORDER}` : `2px solid ${RED}`,
                  padding: "20px",
                  display: "flex",
                  gap: 16,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                whileHover={{ transform: "translateX(4px)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                onClick={() => markAsRead(notification.id)}
              >
                <NotificationIcon icon={notification.icon} color={notification.color} />
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: NAVY2, margin: 0 }}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: RED,
                      }} />
                    )}
                  </div>
                  <p style={{ fontSize: "0.95rem", color: SLATE, marginBottom: 8 }}>
                    {notification.message}
                  </p>
                  <div style={{ fontSize: "0.85rem", color: SLATE_L }}>
                    {notification.time}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  style={{
                    padding: "8px",
                    background: "transparent",
                    border: "none",
                    color: SLATE_L,
                    cursor: "pointer",
                    borderRadius: 6,
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = SMOKE}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <FaXmark />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 32,
            padding: "24px",
            background: `${BLUE}10`,
            borderRadius: 12,
            border: `1px solid ${BLUE}30`,
          }}
        >
          <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <FaFilter style={{ color: BLUE }} />
            Notification Preferences
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Appointment reminders", default: true },
              { label: "Eligibility updates", default: true },
              { label: "Emergency blood requests", default: true },
              { label: "Campaign announcements", default: true },
              { label: "Reward notifications", default: true },
              { label: "Newsletter updates", default: false },
            ].map((pref, index) => (
              <label key={index} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  defaultChecked={pref.default}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: "0.95rem", color: NAVY2 }}>{pref.label}</span>
              </label>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
