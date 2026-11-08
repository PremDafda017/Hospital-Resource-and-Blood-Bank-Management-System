import React, { useState, useEffect, useCallback } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaBell, FaCheck, FaTrash, FaCalendar, FaDroplet,
  FaAward, FaTriangleExclamation, FaCircleInfo, FaCheckDouble,
  FaCommentDots, FaGear, FaArrowUpRightFromSquare, FaMagnifyingGlass,
  FaHouse, FaHeartPulse, FaBullhorn, FaClockRotateLeft, FaCertificate,
  FaUser, FaBars, FaRightFromBracket
} from "react-icons/fa6";
import { apiFetch } from "../../utils/apiConfig";
import { useNotification } from "../../contexts/NotificationContext";
import NotificationPreferencesModal from "../../components/NotificationPreferencesModal";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const NAVY = "#0F172A";
const NAVY2 = "#1E293B";
const SLATE = "#334155";
const SLATE_L = "#64748B";
const BORDER = "#E2E8F0";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";
const SIDEBAR_W = 260;
const SIDEBAR_COL = NAVY;

export default function DonorNotifications() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { openConversation } = useNotification();

  const isStandalone = location.pathname.includes("donor-notifications");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPrefsModal, setShowPrefsModal] = useState(false);

  const userId = user?.id || localStorage.getItem("clerkId") || "";

  const donorNav = [
    { key: "dashboard", icon: <FaHouse />, label: "Dashboard", path: "/donor-dashboard" },
    { key: "eligibility", icon: <FaHeartPulse />, label: "Eligibility Checker", path: "/donor-dashboard" },
    { key: "campaigns", icon: <FaBullhorn />, label: "Campaigns", path: "/donor-dashboard" },
    { key: "appointments", icon: <FaCalendar />, label: "My Appointments", path: "/donor-dashboard" },
    { key: "history", icon: <FaClockRotateLeft />, label: "Donation History", path: "/donor-dashboard" },
    { key: "certificates", icon: <FaCertificate />, label: "Certificates", path: "/donor-dashboard" },
    { key: "notifications", icon: <FaBell />, label: "Notifications", path: "/donor-notifications" },
    { key: "profile", icon: <FaUser />, label: "My Profile", path: "/donor-profile" },
  ];

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const endpoint = `/api/notifications/${encodeURIComponent(userId)}?tab=${activeTab}&search=${encodeURIComponent(searchQuery)}&limit=100&role=donor`;
      const res = await apiFetch(endpoint);
      if (res && res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.notifications || [];
        setNotifications(list);
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : list.filter((n) => !n.isRead && !n.read).length);
      }
    } catch (err) {
      console.error("Error loading donor notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab, searchQuery]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await apiFetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "PUT" });
    } catch (e) {}
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    setUnreadCount(0);
    try {
      await apiFetch(`/api/notifications/mark-all-read/${encodeURIComponent(userId)}`, { method: "PUT" });
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id && n.id !== id));
    try {
      await apiFetch(`/api/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (e) {}
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  const content = (
    <div style={{ fontFamily: FONT, padding: isStandalone ? "24px 32px" : "24px 0", maxWidth: isStandalone ? "100%" : 1000, margin: "0 auto", width: "100%" }}>
      {/* Header bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: NAVY, margin: 0 }}>Donor Notification Center</h2>
          <p style={{ fontSize: "0.82rem", color: SLATE_L, margin: "4px 0 0 0" }}>Track donation appointments, certificate updates & blood center announcements</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setShowPrefsModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              background: WHITE,
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
      </div>

      {/* Tabs & Search */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, background: WHITE, padding: 4, borderRadius: 10, border: `1px solid ${BORDER}` }}>
          {[
            { id: "all", label: "All" },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "appointments", label: "Appointments" },
            { id: "donations", label: "Donations & Certificates" },
            { id: "messages", label: "Messages" },
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

      {/* Notifications List */}
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
          <h3 style={{ margin: 0, color: SLATE, fontSize: "1.1rem" }}>No Notifications</h3>
          <p style={{ margin: 0, color: SLATE_L, fontSize: "0.85rem", maxWidth: 420 }}>
            {activeTab === "unread" ? "You have read all your notifications." : "Appointment approvals, completed donation certificates, and blood center announcements will be listed here."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifications.map((notif) => {
            const isUnread = !notif.isRead && !notif.read;
            const isCritical = notif.priority === "Critical" || notif.notificationType?.includes("Reject");
            const isSuccess = notif.priority === "High" || notif.notificationType?.includes("Approve") || notif.notificationType?.includes("Completed");

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
                }}
              >
                <div style={{ display: "flex", gap: 16, flex: 1 }}>
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
                    {isCritical ? <FaTriangleExclamation /> : notif.relatedEntityType === "Donation" ? <FaAward /> : notif.relatedEntityType === "Message" ? <FaCommentDots /> : <FaCalendar />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: NAVY }}>{notif.title}</span>
                      {isUnread && (
                        <span style={{ background: RED, color: WHITE, fontSize: "0.65rem", fontWeight: 800, padding: "2px 7px", borderRadius: 8, textTransform: "uppercase" }}>
                          Unread
                        </span>
                      )}
                      {notif.requestId && (
                        <span style={{ background: SMOKE, border: `1px solid ${BORDER}`, color: SLATE_L, fontSize: "0.68rem", fontWeight: 600, padding: "2px 8px", borderRadius: 6 }}>
                          ID: {notif.requestId}
                        </span>
                      )}
                    </div>

                    <p style={{ margin: "4px 0 10px 0", color: SLATE, fontSize: "0.88rem", lineHeight: 1.45 }}>{notif.message}</p>

                    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: "0.75rem", color: SLATE_L, flexWrap: "wrap" }}>
                      <span>🕒 {notif.createdAt ? new Date(notif.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : notif.date || "Today"}</span>
                      {notif.senderName && (
                        <span>👤 Center: <strong>{notif.senderName}</strong></span>
                      )}
                      {notif.emailStatus && (
                        <span>✉️ Email Status: <strong style={{ color: notif.emailStatus === "sent" ? "#16A34A" : "#D97706" }}>{notif.emailStatus}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {notif.requestId && (
                    <button
                      onClick={() =>
                        openConversation({
                          requestId: notif.requestId,
                          requestNumber: notif.requestId,
                          recipientRole: "blood_bank_staff",
                          recipientUserId: "blood_bank_staff_general",
                          recipientName: "Blood Bank Officer",
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

                  <button
                    onClick={() => navigate(notif.actionUrl || "/donor-dashboard")}
                    title="Open Action"
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
                    <span>Open</span>
                    <FaArrowUpRightFromSquare style={{ fontSize: "0.65rem" }} />
                  </button>

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

      {/* Preferences Modal */}
      <NotificationPreferencesModal isOpen={showPrefsModal} onClose={() => setShowPrefsModal(false)} />
    </div>
  );

  if (isStandalone) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: FONT, background: SMOKE }}>
        {/* Sidebar */}
        <aside
          style={{
            width: w,
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
          <div
            style={{
              height: 64,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: sidebarCollapsed ? "0 16px" : "0 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: WHITE,
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              <FaDroplet style={{ color: RED, fontSize: "1.4rem" }} />
              {!sidebarCollapsed && <span>Donor Portal</span>}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: "none",
                border: "none",
                color: WHITE,
                cursor: "pointer",
                padding: 4,
                borderRadius: 4,
              }}
            >
              <FaBars />
            </button>
          </div>

          <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
            {donorNav.map((item) => {
              const isActive = item.key === "notifications";
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.path)}
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
                  {!sidebarCollapsed && <span>{item.label}</span>}
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
                {!sidebarCollapsed && <span>Logout</span>}
              </button>
            </SignOutButton>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ marginLeft: w, flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", transition: "margin-left 0.3s" }}>
          {content}
        </main>
      </div>
    );
  }

  return content;
}
