import React, { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaCheckDouble,
  FaDroplet,
  FaCalendarDays,
  FaCommentDots,
  FaTriangleExclamation,
  FaCircleInfo,
  FaArrowRight,
  FaVolumeHigh,
  FaVolumeXmark
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import { useUser } from "@clerk/clerk-react";
import "./NotificationBell.css";

const RED = "#C41230";

function timeAgo(dateString) {
  if (!dateString) return "Recently";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

function getNotificationIcon(type, priority) {
  if (priority === "Critical" || priority === "High" || type?.includes("Alert") || type?.includes("Reject")) {
    return <FaTriangleExclamation style={{ color: "#DC2626" }} />;
  }
  if (type?.includes("Message")) {
    return <FaCommentDots style={{ color: "#2563EB" }} />;
  }
  if (type?.includes("Blood") || type?.includes("Donation") || type?.includes("Stock")) {
    return <FaDroplet style={{ color: RED }} />;
  }
  if (type?.includes("Appointment")) {
    return <FaCalendarDays style={{ color: "#16A34A" }} />;
  }
  return <FaCircleInfo style={{ color: "#0284C7" }} />;
}

export default function NotificationBell({ onNavigateToAll, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    notifications,
    unreadCount,
    isRinging,
    soundEnabled,
    toggleSound,
    markAsRead,
    markAllAsRead,
    openConversation
  } = useNotification();

  const userRole = (user?.unsafeMetadata?.role || localStorage.getItem("userRole") || "patient").toLowerCase().trim();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAllClick = () => {
    setIsOpen(false);
    if (onNavigateToAll) {
      onNavigateToAll();
      return;
    }
    if (userRole === "patient") {
      navigate("/notifications");
    } else if (userRole === "hospital_staff" || userRole === "hospital" || userRole === "doctor") {
      navigate("/hospital-notifications");
    } else if (userRole === "blood_bank_staff" || userRole === "blood_bank" || userRole === "bloodbank") {
      navigate("/bloodbank-notifications");
    } else if (userRole === "donor") {
      navigate("/donor-notifications");
    } else {
      navigate("/admin");
    }
  };

  const handleItemClick = (notif) => {
    const id = notif._id || notif.id;
    if (id) {
      markAsRead(id);
    }

    if (notif.requestId && notif.relatedEntityType === "Message") {
      setIsOpen(false);
      openConversation({
        requestId: notif.requestId,
        requestNumber: notif.requestId,
        recipientRole: notif.senderRole || "",
        recipientUserId: notif.senderUserId || "",
        recipientName: notif.senderName || "",
      });
      return;
    }

    if (notif.actionUrl) {
      setIsOpen(false);
      navigate(notif.actionUrl);
      return;
    }

    // Role-aware intelligent fallback routing
    setIsOpen(false);
    if (notif.relatedEntityType === "BloodRequest" || notif.requestId) {
      if (userRole === "patient") navigate("/blood-requests");
      else if (userRole.includes("hospital")) navigate("/hospital-blood-requests");
      else if (userRole.includes("blood_bank") || userRole.includes("bloodbank")) navigate("/bloodbank-requests");
      else navigate("/admin");
    } else if (notif.relatedEntityType === "Appointment") {
      if (userRole === "patient") navigate("/my-appointments");
      else if (userRole === "donor") navigate("/donor/appointments");
      else if (userRole.includes("hospital")) navigate("/hospital-appointments");
      else if (userRole.includes("blood_bank") || userRole.includes("bloodbank")) navigate("/appointment-management");
      else navigate("/admin");
    } else if (notif.relatedEntityType === "Report") {
      if (userRole === "patient") navigate("/my-reports");
      else if (userRole.includes("hospital")) navigate("/hospital-reports");
      else navigate("/admin");
    }
  };

  return (
    <div className={`notification-bell-container ${className}`} ref={dropdownRef}>
      <button
        className={`notification-bell ${isRinging ? "ringing" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications (${unreadCount} unread)`}
        title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : "Notifications"}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge" aria-live="polite">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h4>Notifications</h4>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    background: `${RED}15`,
                    color: RED,
                    padding: "2px 8px",
                    borderRadius: 12,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Quick Sound Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSound();
                }}
                title={soundEnabled ? "Notification sound is ON (click to mute)" : "Notification sound is MUTED (click to enable)"}
                style={{
                  background: soundEnabled ? "#F1F5F9" : "#FEE2E2",
                  border: "none",
                  color: soundEnabled ? "#475569" : RED,
                  cursor: "pointer",
                  padding: "6px 8px",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  transition: "all 0.15s ease",
                }}
              >
                {soundEnabled ? <FaVolumeHigh /> : <FaVolumeXmark />}
              </button>

              {unreadCount > 0 && (
                <button
                  className="mark-read-btn"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <FaCheckDouble style={{ fontSize: "0.7rem" }} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          <div className="notification-list">
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 8).map((item, idx) => {
                const isUnread = !item.isRead && !item.read;
                return (
                  <div
                    key={item._id || item.id || idx}
                    className={`notification-item ${isUnread ? "unread" : ""}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(item.notificationType || item.type, item.priority)}
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">{item.title}</p>
                      <p className="notification-message">{item.message}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span className="notification-time">
                          {timeAgo(item.createdAt || item.date)}
                        </span>
                        {item.requestId && (
                          <span style={{ fontSize: "0.65rem", color: "#64748B", background: "#F1F5F9", padding: "1px 5px", borderRadius: 4 }}>
                            Ref: {item.requestId}
                          </span>
                        )}
                        {item.senderName && (
                          <span style={{ fontSize: "0.65rem", color: "#64748B" }}>
                            • {item.senderName}
                          </span>
                        )}
                      </div>
                    </div>
                    {isUnread && <div className="notification-indicator" />}
                  </div>
                );
              })
            ) : (
              <div className="notification-empty">
                <FaBell style={{ fontSize: "1.8rem", color: "#CBD5E1", marginBottom: 8 }} />
                <p style={{ margin: 0 }}>No notifications right now</p>
              </div>
            )}
          </div>

          <div
            style={{
              padding: "10px 14px",
              background: "#F8FAFC",
              borderTop: "1px solid #E2E8F0",
              textAlign: "center",
            }}
          >
            <button
              onClick={handleAllClick}
              style={{
                background: "none",
                border: "none",
                color: RED,
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>View All Notifications</span>
              <FaArrowRight style={{ fontSize: "0.7rem" }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
