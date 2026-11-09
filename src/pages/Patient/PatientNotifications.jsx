import React, { useState, useEffect, useCallback } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FaBell, FaCheck, FaTrash, FaBars, FaRightFromBracket,
  FaChartLine, FaHeartPulse, FaFileMedical, FaCalendarDays,
  FaMapLocationDot, FaUser, FaCheckDouble, FaCommentDots,
  FaTriangleExclamation, FaCircleInfo, FaGear, FaArrowUpRightFromSquare,
  FaMagnifyingGlass, FaFilter, FaDroplet, FaXmark
} from "react-icons/fa6";
import { apiFetch } from "../../utils/apiConfig";
import { useNotification } from "../../contexts/NotificationContext";
import NotificationPreferencesModal from "../../components/NotificationPreferencesModal";
import NotificationBell from "../../components/NotificationBell";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const RED_DK = "#8B0000";
const NAVY = "#0F172A";
const NAVY2 = "#1E293B";
const SLATE = "#334155";
const SLATE_L = "#64748B";
const BORDER = "#E2E8F0";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";
const SIDEBAR_W = 260;
const SIDEBAR_COL = NAVY;

export default function PatientNotifications() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { openConversation } = useNotification();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPrefsModal, setShowPrefsModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const userId = user?.id || localStorage.getItem("clerkId") || "";

  const nav = [
    { key: "patient-dashboard", icon: <FaChartLine />, label: "Dashboard", path: "/patient-dashboard" },
    { key: "appointments", icon: <FaCalendarDays />, label: "Appointments", path: "/appointments" },
    { key: "blood-requests", icon: <FaHeartPulse />, label: "My Blood Requests", path: "/blood-requests" },
    { key: "my-appointments", icon: <FaCalendarDays />, label: "My Appointments", path: "/my-appointments" },
    { key: "blood-banks", icon: <FaMapLocationDot />, label: "Nearby Blood Banks", path: "/nearby-blood-banks" },
    { key: "notifications", icon: <FaBell />, label: "Notifications", path: "/notifications" },
    { key: "my-reports", icon: <FaFileMedical />, label: "My Reports", path: "/my-reports" },
    { key: "profile", icon: <FaUser />, label: "My Profile", path: "/profile" },
  ];

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const endpoint = `/api/notifications/${encodeURIComponent(userId)}?tab=${activeTab}&search=${encodeURIComponent(searchQuery)}&limit=100`;
      const res = await apiFetch(endpoint);
      if (res && res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.notifications || [];
        setNotifications(list);
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : list.filter(n => !n.isRead && !n.read).length);
      }
    } catch (err) {
      console.error("Error loading patient notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab, searchQuery]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id) => {
    setNotifications(prev => prev.map(n => (n._id === id || n.id === id ? { ...n, isRead: true, read: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await apiFetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "PUT" });
    } catch (e) {}
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
    setUnreadCount(0);
    try {
      await apiFetch(`/api/notifications/mark-all-read/${encodeURIComponent(userId)}`, { method: "PUT" });
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
    try {
      await apiFetch(`/api/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (e) {}
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: FONT, background: SMOKE }}>
      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: isMobile ? (mobileMenuOpen ? 260 : 0) : w,
          minHeight: "100vh",
          background: SIDEBAR_COL,
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease",
          overflowX: "hidden",
          color: WHITE
        }}
      >
        <div style={{
          padding: isMobile ? "0 20px" : (sidebarCollapsed ? "0 16px" : "0 24px"),
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            color: WHITE, fontWeight: 700, fontSize: isMobile ? "1rem" : "1.1rem"
          }}>
            <FaDroplet style={{ color: RED, fontSize: isMobile ? "1.2rem" : "1.4rem" }} />
            {(!sidebarCollapsed || isMobile) && <span>Patient Portal</span>}
          </div>
          {!isMobile && (
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
              background: "none", border: "none", color: WHITE,
              cursor: "pointer", padding: 4, borderRadius: 4
            }}>
              <FaBars />
            </button>
          )}
          {isMobile && (
            <button onClick={() => setMobileMenuOpen(false)} style={{
              background: "none", border: "none", color: WHITE,
              cursor: "pointer", padding: 4, borderRadius: 4
            }}>
              <FaXmark />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {nav.map((item) => {
            const isActive = item.key === "notifications";
            return (
              <button
                key={item.key}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: isActive ? RED : "transparent",
                  color: WHITE,
                  cursor: "pointer",
                  marginBottom: 4,
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 700 : 500,
                  textAlign: "left"
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: "1.1rem", minWidth: 20 }}>{item.icon}</span>
                {(!sidebarCollapsed || isMobile) && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <SignOutButton>
            <button
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                color: WHITE,
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: "1.1rem", minWidth: 20 }}><FaRightFromBracket /></span>
              {(!sidebarCollapsed || isMobile) && <span>Logout</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ marginLeft: isMobile ? 0 : w, flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", transition: "margin-left 0.3s" }}>
        {/* Top Header */}
        <header
          style={{
            height: 64,
            background: WHITE,
            borderBottom: `1px solid ${BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "0 16px" : "0 32px",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${BORDER}`, background: SMOKE, color: SLATE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <FaBars />
              </button>
            )}
            <div>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: NAVY2, margin: 0 }}>My Notifications</h1>
              <p style={{ fontSize: "0.78rem", color: SLATE_L, margin: 0 }}>Real-time updates on blood requests, appointments & hospital messaging</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <NotificationBell />
            <button
              onClick={() => setShowPrefsModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                background: SMOKE,
                color: SLATE,
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <FaGear />
              <span>Preferences</span>
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: `${RED}10`,
                  border: `1px solid ${RED}30`,
                  color: RED,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <FaCheckDouble />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Container */}
        <div style={{ padding: "28px", maxWidth: 1100, width: "100%", margin: "0 auto" }}>
          {/* Controls Bar */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, background: WHITE, padding: 4, borderRadius: 10, border: `1px solid ${BORDER}` }}>
              {[
                { id: "all", label: "All" },
                { id: "unread", label: `Unread (${unreadCount})` },
                { id: "requests", label: "Blood Requests" },
                { id: "appointments", label: "Appointments" },
                { id: "messages", label: "Messages" },
                { id: "system", label: "System Alerts" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: activeTab === tab.id ? RED : "transparent",
                    color: activeTab === tab.id ? WHITE : SLATE,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", minWidth: 260 }}>
              <FaMagnifyingGlass style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.85rem" }} />
              <input
                type="text"
                placeholder="Search notifications, ID, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 34px",
                  borderRadius: 10,
                  border: `1px solid ${BORDER}`,
                  background: WHITE,
                  fontSize: "0.84rem",
                  color: SLATE,
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Notifications Feed */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: SLATE_L }}>Loading your notifications...</div>
          ) : notifications.length === 0 ? (
            <div
              style={{
                background: WHITE,
                borderRadius: 16,
                border: `1px solid ${BORDER}`,
                padding: "60px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <FaBell style={{ fontSize: "2.8rem", color: "#CBD5E1" }} />
              <h3 style={{ margin: 0, color: SLATE, fontSize: "1.1rem" }}>No Notifications Found</h3>
              <p style={{ margin: 0, color: SLATE_L, fontSize: "0.85rem", maxWidth: 400 }}>
                {activeTab === "unread" ? "You're all caught up! There are no unread notifications right now." : "You will receive updates here whenever there is activity on your blood requests, appointments, or medical reports."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {notifications.map((notif) => {
                const isUnread = !notif.isRead && !notif.read;
                const isCritical = notif.priority === "Critical" || notif.notificationType?.includes("Reject");
                const isSuccess = notif.priority === "High" || notif.notificationType?.includes("Approve") || notif.notificationType?.includes("Ready");

                return (
                  <div
                    key={notif._id || notif.id}
                    style={{
                      background: WHITE,
                      borderRadius: 14,
                      border: isUnread ? `1.5px solid ${RED}60` : `1px solid ${BORDER}`,
                      padding: "18px 22px",
                      boxShadow: isUnread ? "0 4px 16px rgba(196,18,48,0.06)" : "0 2px 6px rgba(0,0,0,0.02)",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 16,
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", gap: 16, flex: 1 }}>
                      {/* Status Icon */}
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: isCritical ? "#FEE2E2" : isSuccess ? "#DCFCE7" : "#EFF6FF",
                          color: isCritical ? "#DC2626" : isSuccess ? "#16A34A" : "#2563EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.1rem",
                          flexShrink: 0,
                        }}
                      >
                        {isCritical ? <FaTriangleExclamation /> : notif.relatedEntityType === "Message" ? <FaCommentDots /> : <FaHeartPulse />}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: "0.95rem", color: NAVY }}>{notif.title}</span>
                          {isUnread && (
                            <span style={{ background: RED, color: WHITE, fontSize: "0.65rem", fontWeight: 800, padding: "2px 7px", borderRadius: 8, textTransform: "uppercase" }}>
                              Unread
                            </span>
                          )}
                          {notif.priority && notif.priority !== "Normal" && (
                            <span style={{ background: isCritical ? "#FEF2F2" : "#FEF3C7", color: isCritical ? "#B91C1C" : "#B45309", fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 8 }}>
                              {notif.priority} Priority
                            </span>
                          )}
                          {notif.requestId && (
                            <span style={{ background: SMOKE, border: `1px solid ${BORDER}`, color: SLATE_L, fontSize: "0.68rem", fontWeight: 600, padding: "2px 8px", borderRadius: 6 }}>
                              Ref: {notif.requestId}
                            </span>
                          )}
                        </div>

                        <p style={{ margin: "4px 0 10px 0", color: SLATE, fontSize: "0.88rem", lineHeight: 1.45 }}>{notif.message}</p>

                        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: "0.75rem", color: SLATE_L }}>
                          <span>🕒 {notif.createdAt ? new Date(notif.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : notif.date || "Today"}</span>
                          {notif.senderName && (
                            <span>👤 From: <strong>{notif.senderName}</strong> {notif.senderRole ? `(${notif.senderRole.replace("_", " ")})` : ""}</span>
                          )}
                          {notif.emailStatus && (
                            <span>✉️ Email: <strong style={{ color: notif.emailStatus === "sent" ? "#16A34A" : "#D97706" }}>{notif.emailStatus}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {notif.requestId && (
                        <button
                          onClick={() =>
                            openConversation({
                              requestId: notif.requestId,
                              requestNumber: notif.requestId,
                              recipientRole: "hospital_staff",
                              recipientUserId: "hospital_staff_general",
                              recipientName: "Hospital Staff",
                            })
                          }
                          title="Open Message Discussion"
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: `${RED}10`,
                            color: RED,
                            border: `1px solid ${RED}30`,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <FaCommentDots />
                          <span>Chat</span>
                        </button>
                      )}

                      {notif.actionUrl && (
                        <button
                          onClick={() => navigate(notif.actionUrl)}
                          title="View Requisition Details"
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: SMOKE,
                            color: SLATE,
                            border: `1px solid ${BORDER}`,
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span>View</span>
                          <FaArrowUpRightFromSquare style={{ fontSize: "0.65rem" }} />
                        </button>
                      )}

                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(notif._id || notif.id)}
                          title="Mark as Read"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: SMOKE,
                            border: `1px solid ${BORDER}`,
                            color: "#16A34A",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FaCheck />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(notif._id || notif.id)}
                        title="Archive Notification"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: SMOKE,
                          border: `1px solid ${BORDER}`,
                          color: "#94A3B8",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FaTrash style={{ fontSize: "0.78rem" }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Preferences Modal */}
      <NotificationPreferencesModal isOpen={showPrefsModal} onClose={() => setShowPrefsModal(false)} />
    </div>
  );
}
