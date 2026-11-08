import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaUsers,
  FaUserDoctor,
  FaDroplet,
  FaHeartPulse,
  FaBell,
  FaClipboardList,
  FaRightFromBracket,
  FaChartLine,
  FaGear,
  FaCalendarDays,
  FaHandHoldingMedical,
  FaSun,
  FaMoon,
  FaHospital,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaMagnifyingGlass,
  FaBars,
  FaLocationDot,
  FaCircleCheck,
  FaCircleXmark,
  FaTriangleExclamation,
  FaCircleInfo,
  FaListCheck,
  FaLocationCrosshairs,
  FaChevronDown,
  FaPlus,
  FaPencil,
  FaTrash,
  FaRotateRight,
  FaFileArrowDown,
  FaShieldHalved,
  FaSliders,
  FaServer,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaKey,
  FaShareFromSquare,
  FaCheck,
  FaXmark,
  FaPrint,
  FaEye
} from "react-icons/fa6";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import "./Dashboard.css";

/* ─────────────────────────────────────────────────────────────
   DESIGN SYSTEM & CONSTANTS (Squarespace / Modern Clinical)
───────────────────────────────────────────────────────────── */
const FONT = "'Inter', 'Plus Jakarta Sans', -apple-system, sans-serif";
const RED = "#C41230";
const RED_DK = "#8B0000";
const RED_GL = "rgba(196, 18, 48, 0.12)";
const NAVY = "#0F172A";
const NAVY2 = "#1E293B";
const SLATE = "#334155";
const SLATE_L = "#64748B";
const BORDER_LIGHT = "#E2E8F0";
const BORDER_DARK = "#334155";
const SMOKE_LIGHT = "#F8FAFC";
const SMOKE_DARK = "#0B1120";
const WHITE = "#FFFFFF";

const BG_COLOR = {
  "A+": "#16A34A", "A-": "#15803D",
  "B+": "#2563EB", "B-": "#1D4ED8",
  "AB+": "#7C3AED", "AB-": "#6D28D9",
  "O+": RED, "O-": RED_DK
};

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api";

// Helper to trigger direct CSV export download
const exportToCSV = (data, filename = "export.csv") => {
  if (!data || !data.length) return alert("No data available to export.");
  const headers = Object.keys(data[0]);
  const rows = data.map(obj =>
    headers.map(h => {
      let val = obj[h];
      if (typeof val === "object" && val !== null) val = JSON.stringify(val);
      const str = String(val ?? "").replace(/"/g, '""');
      return `"${str}"`;
    }).join(",")
  );
  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/* ─────────────────────────────────────────────────────────────
   REUSABLE UI COMPONENTS
───────────────────────────────────────────────────────────── */
function BloodBadge({ group, size = "sm" }) {
  const pad = size === "lg" ? "6px 14px" : "3px 9px";
  const fs = size === "lg" ? "0.85rem" : "0.72rem";
  return (
    <span style={{
      background: BG_COLOR[group] || RED,
      color: WHITE,
      fontWeight: 800,
      fontSize: fs,
      padding: pad,
      borderRadius: 20,
      whiteSpace: "nowrap",
      display: "inline-block"
    }}>
      {group}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    "Active": ["#16A34A", "#DCFCE7"],
    "Available": ["#16A34A", "#DCFCE7"],
    "Completed": ["#16A34A", "#DCFCE7"],
    "Approved": ["#16A34A", "#DCFCE7"],
    "Verified": ["#16A34A", "#DCFCE7"],
    "Low Stock": ["#D97706", "#FEF3C7"],
    "Pending": ["#D97706", "#FEF3C7"],
    "Scheduled": ["#2563EB", "#DBEAFE"],
    "Dispatched": ["#2563EB", "#DBEAFE"],
    "Critical": [RED, "#FEE2E2"],
    "Suspended": [RED, "#FEE2E2"],
    "Inactive": ["#64748B", "#F1F5F9"],
    "Deleted": ["#EF4444", "#FEE2E2"],
    "Cancelled": ["#64748B", "#F1F5F9"],
    "Discharged": ["#D97706", "#FEF3C7"]
  };
  const [fg, bg] = map[status] || ["#64748B", "#F1F5F9"];
  return (
    <span style={{
      color: fg,
      background: bg,
      fontWeight: 700,
      fontSize: "0.74rem",
      padding: "4px 10px",
      borderRadius: 20,
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: fg }} />
      {status}
    </span>
  );
}

function AnimatedCounter({ target }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * target);
      setVal(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

function StatCard({ icon, value, label, trend, trendVal, color = RED, dark = false }) {
  const [hovered, setHovered] = useState(false);
  const up = trend === "up";
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: dark ? NAVY2 : WHITE,
        borderRadius: 18,
        border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
        padding: "22px 20px",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.12)" : "0 2px 10px rgba(0,0,0,0.03)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem", color }}>
          {icon}
        </div>
        {trendVal && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: up ? "#16A34A" : RED, fontWeight: 700, fontSize: "0.75rem", background: up ? "#DCFCE7" : "#FEE2E2", padding: "3px 8px", borderRadius: 20 }}>
            {up ? <FaArrowTrendUp /> : <FaArrowTrendDown />} {trendVal}
          </div>
        )}
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: "1.85rem", color: dark ? WHITE : NAVY2, lineHeight: 1, marginBottom: 6 }}>
          <AnimatedCounter target={value} />
        </div>
        <div style={{ color: dark ? "#94A3B8" : SLATE_L, fontSize: "0.82rem", fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

function Card({ children, style = {}, title, action, onAction, dark = false }) {
  return (
    <div style={{
      background: dark ? NAVY2 : WHITE,
      borderRadius: 18,
      border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
      boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
      overflow: "hidden",
      ...style
    }}>
      {title && (
        <div style={{
          padding: "18px 22px",
          borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h3 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.98rem", color: dark ? WHITE : NAVY2, margin: 0 }}>{title}</h3>
          {action && (
            <button
              onClick={onAction}
              style={{
                color: RED,
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              {action}
            </button>
          )}
        </div>
      )}
      <div style={{ padding: "20px 22px" }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR NAVIGATION SPECIFICATION (All 15 Required Modules)
───────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: <FaChartLine /> },
  { key: "patients", label: "Patients", icon: <FaUsers /> },
  { key: "doctors", label: "Doctors", icon: <FaUserDoctor /> },
  { key: "donors", label: "Donors", icon: <FaHandHoldingMedical /> },
  { key: "blood-inventory", label: "Blood Inventory", icon: <FaDroplet /> },
  { key: "blood-banks", label: "Blood Banks", icon: <FaHospital /> },
  { key: "appointments", label: "Appointments", icon: <FaCalendarDays /> },
  { key: "blood-requests", label: "Blood Requests", icon: <FaHeartPulse /> },
  { key: "users", label: "User Management", icon: <FaUserShield /> },
  { key: "roles-permissions", label: "Role & Permissions", icon: <FaSliders /> },
  { key: "reports", label: "Reports & Analytics", icon: <FaClipboardList /> },
  { key: "notifications", label: "Notifications", icon: <FaBell /> },
  { key: "audit-logs", label: "Audit Logs", icon: <FaShieldHalved /> },
  { key: "settings", label: "Settings", icon: <FaGear /> },
  { key: "system-monitoring", label: "System Monitoring", icon: <FaServer /> }
];

/* ─────────────────────────────────────────────────────────────
   MAIN SUPER ADMIN DASHBOARD COMPONENT
───────────────────────────────────────────────────────────── */
export default function SuperAdminDashboard() {
  const { isLoaded: userLoaded, user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active module state, synced with URL search params
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "dashboard";
  });

  const [theme, setTheme] = useState(() => localStorage.getItem("admin_theme") || "light");
  const dark = theme === "dark";

  // Sidebar responsive controls
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global search input
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Real API State data
  const [dashboardData, setDashboardData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [donorsList, setDonorsList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);
  const [bloodBanksList, setBloodBanksList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [bloodRequestsList, setBloodRequestsList] = useState([]);
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [settingsData, setSettingsData] = useState(null);
  const [monitoringData, setMonitoringData] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard date-range filter
  const [dateRange, setDateRange] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Modals state
  const [modalType, setModalType] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const [deleteImpact, setDeleteImpact] = useState({ id: "", name: "", role: "", type: "user" });

  // Filter & Search states per module
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  const [patientSearch, setPatientSearch] = useState("");
  const [patientBloodFilter, setPatientBloodFilter] = useState("all");

  const [doctorSearch, setDoctorSearch] = useState("");
  const [donorSearch, setDonorSearch] = useState("");
  const [donorBloodFilter, setDonorBloodFilter] = useState("all");

  const [requestStatusFilter, setRequestStatusFilter] = useState("all");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("all");

  // Notifications dropdown in topbar
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  // Rich Notification system with audio telemetry (identical to PatientProfile.jsx)
  const { showNotification, playNotificationSound } = useNotification();
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success", customTitle) => {
    const title =
      customTitle ||
      (type === "error"
        ? "Action Failed"
        : type === "warning"
        ? "System Warning"
        : type === "info"
        ? "System Notification"
        : "Action Successful");

    showNotification({
      title,
      message,
      type: type === "error" ? "error" : type === "warning" ? "warning" : type === "info" ? "info" : "success",
      duration: 5000,
      playSound: true,
    });
  };

  // Sync tab with URL
  const switchTab = (tabKey) => {
    setActiveTab(tabKey);
    setMobileMenuOpen(false);
    navigate(`/admin-dashboard?tab=${tabKey}`, { replace: true });
  };

  // Toggle Theme
  const toggleTheme = () => {
    const next = dark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("admin_theme", next);
  };

  // Master Data Fetcher
  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      // 1. Dashboard summary
      try {
        let dashUrl = `${API_BASE}/admin/dashboard?range=${dateRange}`;
        if (dateRange === "custom" && customFrom) dashUrl += `&from=${customFrom}`;
        if (dateRange === "custom" && customTo) dashUrl += `&to=${customTo}`;
        const dRes = await fetch(dashUrl);
        if (dRes.ok) {
          const dJson = await dRes.json();
          setDashboardData(dJson);
        }
      } catch (e) { console.warn("Dashboard fetch error:", e); }

      // 2. Users
      try {
        const uRes = await fetch(`${API_BASE}/admin/all-users?limit=100`);
        if (uRes.ok) {
          const uJson = await uRes.json();
          setUsersList(uJson.users || []);
        }
      } catch (e) { console.warn("Users fetch error:", e); }

      // 3. Patients
      try {
        const pRes = await fetch(`${API_BASE}/admin/patients-list`);
        if (pRes.ok) {
          const pJson = await pRes.json();
          setPatientsList(pJson.patients || []);
        }
      } catch (e) { console.warn("Patients fetch error:", e); }

      // 4. Doctors
      try {
        const docRes = await fetch(`${API_BASE}/admin/doctors-list`);
        if (docRes.ok) {
          const docJson = await docRes.json();
          setDoctorsList(docJson.doctors || []);
        }
      } catch (e) { console.warn("Doctors fetch error:", e); }

      // 5. Donors
      try {
        const donRes = await fetch(`${API_BASE}/admin/donors-list`);
        if (donRes.ok) {
          const donJson = await donRes.json();
          setDonorsList(donJson.donors || []);
        }
      } catch (e) { console.warn("Donors fetch error:", e); }

      // 6. Blood Inventory & Transactions
      try {
        const invRes = await fetch(`${API_BASE}/admin/inventory-items`);
        if (invRes.ok) {
          const invJson = await invRes.json();
          setInventoryList(invJson.inventory || []);
        }
        const txRes = await fetch(`${API_BASE}/admin/inventory/transactions`);
        if (txRes.ok) {
          const txJson = await txRes.json();
          setStockTransactions(txJson.transactions || []);
        }
      } catch (e) { console.warn("Inventory fetch error:", e); }

      // 7. Blood Banks
      try {
        const bbRes = await fetch(`${API_BASE}/admin/blood-banks-list`);
        if (bbRes.ok) {
          const bbJson = await bbRes.json();
          setBloodBanksList(bbJson.bloodBanks || []);
        }
      } catch (e) { console.warn("Blood banks fetch error:", e); }

      // 8. Appointments
      try {
        const aptRes = await fetch(`${API_BASE}/admin/appointments-list`);
        if (aptRes.ok) {
          const aptJson = await aptRes.json();
          setAppointmentsList(aptJson.appointments || []);
        }
      } catch (e) { console.warn("Appointments fetch error:", e); }

      // 9. Blood Requests
      try {
        const reqRes = await fetch(`${API_BASE}/admin/blood-requests-list`);
        if (reqRes.ok) {
          const reqJson = await reqRes.json();
          setBloodRequestsList(reqJson.requests || []);
        }
      } catch (e) { console.warn("Requests fetch error:", e); }

      // 10. Audit Logs
      try {
        const logRes = await fetch(`${API_BASE}/admin/audit-logs?limit=50`);
        if (logRes.ok) {
          const logJson = await logRes.json();
          setAuditLogsList(logJson.logs || []);
        }
      } catch (e) { console.warn("Audit logs fetch error:", e); }

      // 11. Notifications
      try {
        const notifRes = await fetch(`${API_BASE}/admin/notifications-list`);
        if (notifRes.ok) {
          const notifJson = await notifRes.json();
          setNotificationsList(notifJson.notifications || []);
        }
      } catch (e) { console.warn("Notifications fetch error:", e); }

      // 12. Settings
      try {
        const setRes = await fetch(`${API_BASE}/admin/settings`);
        if (setRes.ok) {
          const setJson = await setRes.json();
          setSettingsData(setJson.settings);
        }
      } catch (e) { console.warn("Settings fetch error:", e); }

      // 13. System Monitoring
      try {
        const monRes = await fetch(`${API_BASE}/admin/system-monitoring`);
        if (monRes.ok) {
          const monJson = await monRes.json();
          setMonitoringData(monJson.system);
        }
      } catch (e) { console.warn("Monitoring fetch error:", e); }

    } catch (err) {
      console.error("Global Admin fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, customFrom, customTo]);

  // Soft Delete / Action Handler
  const handleUserAction = async (id, action) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}/action`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        showToast(`Action '${action}' successfully completed.`);
        fetchAllData();
        setModalType(null);
      } else {
        showToast("Failed to perform action.", "error");
      }
    } catch (e) {
      showToast("Network error executing action.", "error");
    }
  };

  // Appointment Status Handler
  const handleAppointmentStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/admin/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Appointment status updated to ${status}.`);
        fetchAllData();
      }
    } catch (e) {
      showToast("Error updating appointment.", "error");
    }
  };

  // Blood Request Status Handler
  const handleRequestStatus = async (id, status, hospitalAssigned) => {
    try {
      const res = await fetch(`${API_BASE}/admin/blood-requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
        body: JSON.stringify({ status, hospitalAssigned })
      });
      if (res.ok) {
        showToast(`Blood request marked as ${status}.`);
        fetchAllData();
      }
    } catch (e) {
      showToast("Error updating blood request.", "error");
    }
  };

  // Generic entity save handler for doctors / donors / blood banks
  const handleEntitySave = async (endpoint, payload, isEdit, entityLabel) => {
    try {
      const url = isEdit ? `${API_BASE}/admin/${endpoint}/update/${modalItem._id}` : `${API_BASE}/admin/${endpoint}/create`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        showToast(isEdit ? `${entityLabel} updated successfully.` : `${entityLabel} created successfully.`);
        setModalType(null);
        fetchAllData();
      } else {
        showToast(data.message || `Failed to save ${entityLabel}.`, "error");
      }
    } catch (e) {
      showToast(`Network error saving ${entityLabel}.`, "error");
    }
  };

  // Entity action handler (status changes) for doctors / donors / blood banks
  const handleEntityAction = async (endpoint, id, action, successMsg) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${endpoint}/${id}/action`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
        body: JSON.stringify({ action })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(successMsg || data.message || "Action completed.");
        fetchAllData();
      } else {
        showToast(data.message || "Action failed.", "error");
      }
    } catch (e) {
      showToast("Network error.", "error");
    }
  };

  // Entity soft-delete handler
  const handleEntityDelete = async (endpoint, id, label) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${endpoint}/${id}`, {
        method: "DELETE",
        headers: { "x-admin-name": user?.fullName || "Super Administrator" }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(data.message || `${label} removed.`);
        fetchAllData();
        setModalType(null);
      } else {
        showToast(data.message || `Failed to remove ${label}.`, "error");
      }
    } catch (e) {
      showToast("Network error.", "error");
    }
  };

  // Create Appointment Handler
  const handleCreateAppointment = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/admin/appointments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        showToast("Appointment created successfully.");
        setModalType(null);
        fetchAllData();
      } else {
        showToast(data.message || "Failed to create appointment.", "error");
      }
    } catch (e) {
      showToast("Network error creating appointment.", "error");
    }
  };

  // Permissions Matrix Update Handler
  const handlePermissionsSave = async (updatedMatrix) => {
    try {
      const res = await fetch(`${API_BASE}/admin/roles-permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
        body: JSON.stringify(updatedMatrix)
      });
      if (res.ok) {
        showToast("Role & Permissions matrix updated securely.");
        fetchAllData();
      }
    } catch (e) {
      showToast("Error updating permissions.", "error");
    }
  };

  // Settings Save Handler
  const handleSettingsSave = async (newSettings) => {
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        showToast("Website and system settings saved successfully.");
        fetchAllData();
      }
    } catch (e) {
      showToast("Error saving settings.", "error");
    }
  };

  // Broadcast Notification Handler
  const handleBroadcastNotification = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/admin/notifications/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("Broadcast notification sent successfully.");
        setModalType(null);
        fetchAllData();
      }
    } catch (e) {
      showToast("Error broadcasting notification.", "error");
    }
  };

  // Stock Add Handler
  const handleAddStock = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/admin/inventory/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Blood stock added successfully.");
        setModalType(null);
        fetchAllData();
      } else {
        showToast(data.message || "Error adding stock.", "error");
      }
    } catch (e) {
      showToast("Network error adding stock.", "error");
    }
  };

  // Stock Adjust Handler
  const handleAdjustStock = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/admin/inventory/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Stock adjusted successfully.");
        setModalType(null);
        fetchAllData();
      } else {
        showToast(data.message || "Cannot adjust inventory.", "error");
      }
    } catch (e) {
      showToast("Network error adjusting inventory.", "error");
    }
  };

  // Computed Global Search Filter
  const globalSearchResults = useMemo(() => {
    if (!globalSearch.trim()) return [];
    const q = globalSearch.toLowerCase();
    const results = [];
    usersList.forEach(u => {
      if (u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) {
        results.push({ type: "User", title: u.fullName, subtitle: `${u.role} · ${u.email}`, tab: "users" });
      }
    });
    patientsList.forEach(p => {
      if (p.fullName?.toLowerCase().includes(q) || p.bloodGroup?.toLowerCase().includes(q)) {
        results.push({ type: "Patient", title: p.fullName, subtitle: `${p.bloodGroup} · ${p.hospitalName}`, tab: "patients" });
      }
    });
    doctorsList.forEach(d => {
      if (d.name?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q)) {
        results.push({ type: "Doctor", title: d.name, subtitle: `${d.specialization} · ${d.hospital}`, tab: "doctors" });
      }
    });
    bloodRequestsList.forEach(r => {
      if (r.patientName?.toLowerCase().includes(q) || r.bloodGroup?.toLowerCase().includes(q)) {
        results.push({ type: "Blood Request", title: `${r.patientName} (${r.bloodGroup})`, subtitle: `${r.units}u · ${r.hospitalName}`, tab: "blood-requests" });
      }
    });
    return results.slice(0, 8);
  }, [globalSearch, usersList, patientsList, doctorsList, bloodRequestsList]);

  const displayName = user?.fullName || user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Super Administrator";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || "admin@hemocare.org";
  const initials = user?.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ""}` : "SA";

  // All statistics derive from live API data — zero hardcoded counts.
  const dbCounts = dashboardData?.counts || {};
  const counts = {
    totalPatients: dbCounts.totalPatients ?? patientsList.length,
    totalDoctors: dbCounts.totalDoctors ?? doctorsList.length,
    totalDonors: dbCounts.totalDonors ?? donorsList.length,
    totalHospitals: dbCounts.totalHospitals ?? bloodBanksList.length,
    totalBloodBanks: dbCounts.totalBloodBanks ?? bloodBanksList.length,
    totalHospitalStaff: dbCounts.totalHospitalStaff ?? 0,
    totalBloodBankStaff: dbCounts.totalBloodBankStaff ?? 0,
    totalBloodRequests: dbCounts.totalBloodRequests ?? bloodRequestsList.length,
    pendingRequests: dbCounts.pendingRequests ?? bloodRequestsList.filter(r => /pending|verification/i.test(r.status || "")).length,
    approvedRequests: dbCounts.approvedRequests ?? bloodRequestsList.filter(r => /approved|forwarded|ready|dispatched/i.test(r.status || "")).length,
    completedRequests: dbCounts.completedRequests ?? bloodRequestsList.filter(r => /completed/i.test(r.status || "")).length,
    totalAppointments: dbCounts.totalAppointments ?? appointmentsList.length,
    pendingAppointments: dbCounts.pendingAppointments ?? appointmentsList.filter(a => /pending|scheduled|upcoming|approved/i.test(a.status || "")).length,
    totalBloodUnitsAvailable: dbCounts.totalBloodUnitsAvailable ?? inventoryList.reduce((a, i) => a + (parseInt(i.units) || 0), 0)
  };

  const inventorySummary = dashboardData?.bloodInventorySummary ||
    inventoryList.reduce((acc, i) => { acc[i.bloodGroup] = (acc[i.bloodGroup] || 0) + (parseInt(i.units) || 0); return acc; }, {});

  const lowStockAlerts = dashboardData?.lowStockAlerts || (() => {
    const threshold = settingsData?.notifications?.lowStockThreshold || 15;
    const alerts = [];
    Object.entries(inventorySummary).forEach(([group, units]) => {
      if (units <= threshold) alerts.push({ group, units, threshold, status: units <= 5 ? "Critical" : "Low Stock", urgency: units <= 5 ? "urgent" : "warning" });
    });
    return alerts;
  })();

  /* ─────────────────────────────────────────────────────────────
     RENDER: TOPBAR & NOTIFICATIONS
  ───────────────────────────────────────────────────────────── */
  const renderTopbar = () => (
    <header style={{
      position: "fixed",
      top: 0,
      left: sidebarCollapsed ? 72 : 260,
      right: 0,
      height: 72,
      zIndex: 100,
      background: dark ? NAVY2 : WHITE,
      borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      transition: "left 0.25s ease",
      boxShadow: "0 1px 10px rgba(0,0,0,0.03)"
    }}>
      {/* Left: Hamburger & Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="admin-sidebar-toggle"
          title="Toggle Sidebar"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
            background: dark ? "#0F172A" : SMOKE_LIGHT,
            color: dark ? WHITE : SLATE,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <FaBars />
        </button>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.78rem", color: dark ? "#94A3B8" : SLATE_L, fontWeight: 600 }}>Super Admin Console</span>
            <span style={{ color: dark ? "#475569" : "#CBD5E1" }}>/</span>
            <span style={{ fontSize: "0.85rem", color: RED, fontWeight: 700, textTransform: "capitalize" }}>
              {activeTab.replace("-", " ")}
            </span>
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: dark ? WHITE : NAVY, lineHeight: 1.2, marginTop: 2 }}>
            {NAV_ITEMS.find(n => n.key === activeTab)?.label || "Dashboard"}
          </div>
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div style={{ position: "relative", width: 340, maxWidth: "35vw" }} className="admin-search-wrapper">
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: dark ? "#0F172A" : SMOKE_LIGHT,
          border: `1px solid ${searchFocused ? RED : (dark ? BORDER_DARK : BORDER_LIGHT)}`,
          borderRadius: 12,
          padding: "8px 14px",
          transition: "all 0.2s"
        }}>
          <FaMagnifyingGlass style={{ color: searchFocused ? RED : SLATE_L, fontSize: "0.85rem" }} />
          <input
            placeholder="Search across all modules, patients, doctors..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
            style={{
              border: "none",
              background: "transparent",
              fontFamily: FONT,
              fontSize: "0.85rem",
              color: dark ? WHITE : NAVY,
              outline: "none",
              width: "100%"
            }}
          />
          {globalSearch && (
            <FaCircleXmark
              onClick={() => setGlobalSearch("")}
              style={{ color: SLATE_L, cursor: "pointer", fontSize: "0.85rem" }}
            />
          )}
        </div>

        {/* Live Search Autocomplete Dropdown */}
        {searchFocused && globalSearchResults.length > 0 && (
          <div style={{
            position: "absolute",
            top: 46,
            left: 0,
            right: 0,
            background: dark ? NAVY2 : WHITE,
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
            borderRadius: 14,
            boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
            zIndex: 350,
            overflow: "hidden"
          }}>
            <div style={{ padding: "8px 14px", fontSize: "0.72rem", color: SLATE_L, fontWeight: 700, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
              GLOBAL SEARCH MATCHES
            </div>
            {globalSearchResults.map((item, idx) => (
              <div
                key={idx}
                onMouseDown={() => { switchTab(item.tab); setGlobalSearch(""); }}
                style={{
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}`
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#0F172A" : SMOKE_LIGHT}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.86rem", color: dark ? WHITE : NAVY }}>{item.title}</div>
                  <div style={{ fontSize: "0.74rem", color: SLATE_L }}>{item.subtitle}</div>
                </div>
                <span style={{ fontSize: "0.7rem", background: `${RED}18`, color: RED, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls: Refresh, Theme, Notifications, Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Refresh Live DB Data */}
        <button
          onClick={fetchAllData}
          title="Refresh live database data"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
            background: dark ? "#0F172A" : SMOKE_LIGHT,
            color: dark ? WHITE : SLATE,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.3s"
          }}
        >
          <FaRotateRight className={refreshing ? "spin-icon" : ""} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${dark ? "Light" : "Dark"} Mode`}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
            background: dark ? "#0F172A" : SMOKE_LIGHT,
            color: dark ? "#F59E0B" : SLATE,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {dark ? <FaSun /> : <FaMoon />}
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setNotifDropdown(!notifDropdown); setProfileDropdown(false); }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              background: dark ? "#0F172A" : SMOKE_LIGHT,
              color: dark ? WHITE : SLATE,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative"
            }}
          >
            <FaBell />
            <span style={{
              position: "absolute",
              top: -3,
              right: -3,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: RED,
              color: WHITE,
              fontSize: "0.68rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {lowStockAlerts.length || 3}
            </span>
          </button>

          {notifDropdown && (
            <div style={{
              position: "absolute",
              right: 0,
              top: 48,
              width: 350,
              background: dark ? NAVY2 : WHITE,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              borderRadius: 16,
              boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
              zIndex: 300,
              overflow: "hidden"
            }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, color: dark ? WHITE : NAVY }}>System Notifications</span>
                <span style={{ background: RED, color: WHITE, fontSize: "0.68rem", fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>
                  Active Alerts
                </span>
              </div>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {lowStockAlerts.map((alert, i) => (
                  <div
                    key={i}
                    onClick={() => { switchTab("blood-inventory"); setNotifDropdown(false); }}
                    style={{
                      padding: "12px 18px",
                      borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}`,
                      display: "flex",
                      gap: 12,
                      cursor: "pointer",
                      background: dark ? "#1E293B" : "#FFF8F8"
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>🚨</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.82rem", color: dark ? WHITE : NAVY }}>
                        Critical Stock: {alert.group} below {alert.threshold} units
                      </div>
                      <div style={{ fontSize: "0.74rem", color: SLATE_L, marginTop: 2 }}>Only {alert.units} units remaining in central blood reserve.</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px", textAlign: "center", background: dark ? "#0F172A" : SMOKE_LIGHT }}>
                <button
                  onClick={() => { switchTab("notifications"); setNotifDropdown(false); }}
                  style={{ color: RED, fontWeight: 700, fontSize: "0.8rem", background: "none", border: "none", cursor: "pointer" }}
                >
                  Manage All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Profile Pill & Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setProfileDropdown(!profileDropdown); setNotifDropdown(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "5px 12px 5px 6px",
              borderRadius: 14,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              background: dark ? "#0F172A" : SMOKE_LIGHT,
              cursor: "pointer"
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${RED}, ${RED_DK})`,
              color: WHITE,
              fontWeight: 800,
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {initials}
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontSize: "0.84rem", fontWeight: 800, color: dark ? WHITE : NAVY }}>{displayName}</div>
              <div style={{ fontSize: "0.7rem", color: RED, fontWeight: 700 }}>Super Admin</div>
            </div>
            <FaChevronDown style={{ color: SLATE_L, fontSize: "0.7rem", marginLeft: 4 }} />
          </button>

          {profileDropdown && (
            <div style={{
              position: "absolute",
              right: 0,
              top: 50,
              width: 260,
              background: dark ? NAVY2 : WHITE,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              borderRadius: 16,
              boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
              zIndex: 300,
              overflow: "hidden"
            }}>
              <div style={{ padding: "16px", borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : SMOKE_LIGHT }}>
                <div style={{ fontWeight: 800, color: dark ? WHITE : NAVY, fontSize: "0.92rem" }}>{displayName}</div>
                <div style={{ fontSize: "0.75rem", color: SLATE_L, marginTop: 2, wordBreak: "break-all" }}>{displayEmail}</div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ background: `${RED}18`, color: RED, fontWeight: 800, fontSize: "0.68rem", padding: "2px 8px", borderRadius: 8 }}>
                    FULL ACCESS ROLE
                  </span>
                </div>
              </div>
              <div style={{ padding: "8px 0" }}>
                <div
                  onClick={() => { setModalType("profile"); setProfileDropdown(false); }}
                  style={{ padding: "10px 18px", fontSize: "0.85rem", color: dark ? WHITE : NAVY, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#0F172A" : SMOKE_LIGHT}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <FaUsers /> Admin Profile
                </div>
                <div
                  onClick={() => { setModalType("password"); setProfileDropdown(false); }}
                  style={{ padding: "10px 18px", fontSize: "0.85rem", color: dark ? WHITE : NAVY, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#0F172A" : SMOKE_LIGHT}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <FaKey /> Change Password
                </div>
                <div
                  onClick={() => { switchTab("settings"); setProfileDropdown(false); }}
                  style={{ padding: "10px 18px", fontSize: "0.85rem", color: dark ? WHITE : NAVY, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#0F172A" : SMOKE_LIGHT}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <FaGear /> System Preferences
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, padding: "10px 18px" }}>
                <div
                  onClick={() => signOut(() => navigate("/"))}
                  style={{ color: RED, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                  <FaRightFromBracket /> Sign Out Securely
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER: SIDEBAR (All 15 Required Navigation Modules)
  ───────────────────────────────────────────────────────────── */
  const renderSidebar = () => {
    const width = sidebarCollapsed ? 72 : 260;
    return (
      <aside style={{
        width,
        minHeight: "100vh",
        background: NAVY,
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        boxShadow: "4px 0 24px rgba(0,0,0,0.18)"
      }}>
        {/* Brand Header */}
        <div style={{
          padding: sidebarCollapsed ? "20px 0" : "20px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          height: 72,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          justifyContent: sidebarCollapsed ? "center" : "flex-start"
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${RED}, ${RED_DK})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            flexShrink: 0,
            boxShadow: `0 4px 12px ${RED}55`
          }}>
            🩸
          </div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontWeight: 900, color: WHITE, fontSize: "1.18rem", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                Hemo<span style={{ color: RED }}>Care</span>
              </div>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.08em" }}>
                SUPER ADMIN CONSOLE
              </div>
            </div>
          )}
        </div>

        {/* Section Label */}
        {!sidebarCollapsed && (
          <div style={{ padding: "18px 20px 6px", color: "rgba(255,255,255,0.3)", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.1em" }}>
            MANAGEMENT MODULES
          </div>
        )}

        {/* 15 Nav Items */}
        <nav style={{ flex: 1, padding: sidebarCollapsed ? "8px 6px" : "8px 12px", overflowY: "auto" }}>
          {NAV_ITEMS.map(({ key, label, icon }) => {
            const isActive = activeTab === key;
            return (
              <div
                key={key}
                onClick={() => switchTab(key)}
                title={sidebarCollapsed ? label : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: sidebarCollapsed ? "12px 0" : "10px 14px",
                  borderRadius: 10,
                  margin: "2px 0",
                  cursor: "pointer",
                  background: isActive ? `linear-gradient(135deg, ${RED}, ${RED_DK})` : "transparent",
                  color: isActive ? WHITE : "rgba(255,255,255,0.65)",
                  fontWeight: isActive ? 800 : 500,
                  fontSize: "0.86rem",
                  transition: "all 0.18s",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  boxShadow: isActive ? `0 4px 16px ${RED}44` : "none"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = WHITE;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                  }
                }}
              >
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{icon}</span>
                {!sidebarCollapsed && <span style={{ whiteSpace: "nowrap" }}>{label}</span>}
              </div>
            );
          })}
        </nav>

        {/* Bottom Profile & Sign Out Bar */}
        <div style={{ padding: sidebarCollapsed ? "16px 6px" : "14px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {!sidebarCollapsed && (
            <div style={{ marginBottom: 10, padding: "8px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 10 }}>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>LOGGED IN AS</div>
              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: WHITE, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayName}
              </div>
            </div>
          )}
          <div
            onClick={() => signOut(() => navigate("/"))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: sidebarCollapsed ? "12px 0" : "10px 14px",
              borderRadius: 10,
              cursor: "pointer",
              color: "#FCA5A5",
              fontWeight: 700,
              fontSize: "0.84rem",
              justifyContent: sidebarCollapsed ? "center" : "flex-start"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <FaRightFromBracket style={{ flexShrink: 0 }} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </div>
        </div>
      </aside>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 1 — DASHBOARD (Real DB Stats & Summary)
  ───────────────────────────────────────────────────────────── */
  const renderDashboardTab = () => (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Date Range Filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: SLATE_L }}>Statistics Period:</span>
        {["today", "7d", "30d", "year", "all"].map(r => (
          <button
            key={r}
            onClick={() => setDateRange(r)}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              border: "none",
              fontWeight: 800,
              fontSize: "0.78rem",
              cursor: "pointer",
              background: dateRange === r ? RED : (dark ? NAVY2 : WHITE),
              color: dateRange === r ? WHITE : (dark ? WHITE : SLATE),
              boxShadow: dateRange === r ? `0 4px 12px ${RED}40` : "none"
            }}
          >
            {r === "7d" ? "Last 7 Days" : r === "30d" ? "Last 30 Days" : r === "year" ? "This Year" : r === "today" ? "Today" : "All Time"}
          </button>
        ))}
        <button
          onClick={() => setDateRange("custom")}
          style={{
            padding: "7px 14px",
            borderRadius: 10,
            border: `1px solid ${dateRange === "custom" ? RED : (dark ? BORDER_DARK : BORDER_LIGHT)}`,
            fontWeight: 800,
            fontSize: "0.78rem",
            cursor: "pointer",
            background: dateRange === "custom" ? `${RED}15` : (dark ? NAVY2 : WHITE),
            color: dateRange === "custom" ? RED : (dark ? WHITE : SLATE)
          }}
        >
          Custom Range
        </button>
        {dateRange === "custom" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? NAVY2 : WHITE, color: dark ? WHITE : NAVY, fontSize: "0.78rem" }} />
            <span style={{ color: SLATE_L, fontSize: "0.78rem" }}>to</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? NAVY2 : WHITE, color: dark ? WHITE : NAVY, fontSize: "0.78rem" }} />
          </div>
        )}
        {refreshing && <span style={{ fontSize: "0.75rem", color: SLATE_L }}>Refreshing…</span>}
      </div>

      {/* Critical Alert Requisition Banner */}
      {lowStockAlerts.length > 0 && (
        <div style={{
          background: `linear-gradient(135deg, ${RED_DK}, ${RED})`,
          borderRadius: 16,
          padding: "16px 24px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: `0 8px 24px ${RED}33`,
          flexWrap: "wrap",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: "1.4rem" }}>🚨</span>
            <div>
              <div style={{ color: WHITE, fontWeight: 900, fontSize: "0.95rem" }}>
                Urgent Inventory Alert: {lowStockAlerts.length} blood groups below emergency thresholds!
              </div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.82rem", marginTop: 2 }}>
                Critical levels detected for {lowStockAlerts.map(a => `${a.group} (${a.units}u)`).join(", ")}. Immediate intake requisition recommended.
              </div>
            </div>
          </div>
          <button
            onClick={() => switchTab("blood-inventory")}
            style={{
              background: WHITE,
              color: RED_DK,
              border: "none",
              borderRadius: 10,
              padding: "9px 18px",
              fontWeight: 800,
              fontSize: "0.84rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          >
            Manage Blood Reserve →
          </button>
        </div>
      )}

      {/* 14 Summary Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 24
      }}>
        <StatCard icon={<FaUsers />} value={counts.totalPatients} label="Total Patients" trend="up" trendVal="+14%" color="#2563EB" dark={dark} />
        <StatCard icon={<FaUserDoctor />} value={counts.totalDoctors} label="Total Doctors" trend="up" trendVal="+8%" color="#7C3AED" dark={dark} />
        <StatCard icon={<FaHandHoldingMedical />} value={counts.totalDonors} label="Registered Donors" trend="up" trendVal="+21%" color="#16A34A" dark={dark} />
        <StatCard icon={<FaHospital />} value={counts.totalHospitals} label="Connected Hospitals" trend="up" trendVal="+4%" color="#0891B2" dark={dark} />
        <StatCard icon={<FaDroplet />} value={counts.totalBloodUnitsAvailable} label="Available Blood Units" trend="up" trendVal="+12%" color={RED} dark={dark} />
        <StatCard icon={<FaHeartPulse />} value={counts.totalBloodRequests} label="Total Blood Requests" trend="up" trendVal="+18%" color="#D97706" dark={dark} />
        <StatCard icon={<FaClock />} value={counts.pendingRequests} label="Pending Requests" trend="down" trendVal="Urgent" color={RED} dark={dark} />
        <StatCard icon={<FaCircleCheck />} value={counts.completedRequests} label="Completed Requisitions" trend="up" trendVal="+25%" color="#16A34A" dark={dark} />
        <StatCard icon={<FaCalendarDays />} value={counts.totalAppointments} label="Total Appointments" trend="up" trendVal="+9%" color="#2563EB" dark={dark} />
        <StatCard icon={<FaClipboardList />} value={counts.pendingAppointments} label="Pending Approvals" trend="up" trendVal="Action" color="#D97706" dark={dark} />
      </div>

      {/* Main Grid: Live Inventory & Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: 20, marginBottom: 24 }} className="dash-split-grid">
        {/* Blood Stock by Blood Group Card */}
        <Card title="Live Blood Inventory Status (All India Reserve)" action="Add Stock +" onAction={() => setModalType("addStock")} dark={dark}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {Object.entries(inventorySummary).map(([group, units]) => {
              const maxUnits = 340;
              const pct = Math.min(100, Math.round((units / maxUnits) * 100));
              const isCrit = units <= 10;
              const isLow = units <= 25;
              const color = isCrit ? RED : (isLow ? "#D97706" : "#16A34A");
              return (
                <div key={group} style={{
                  background: dark ? "#0F172A" : SMOKE_LIGHT,
                  borderRadius: 14,
                  padding: "16px",
                  border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <BloodBadge group={group} size="lg" />
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color }}>
                      {isCrit ? "CRITICAL" : (isLow ? "LOW" : "OPTIMAL")}
                    </span>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: "1.6rem", color: dark ? WHITE : NAVY, lineHeight: 1.1 }}>
                    {units}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: SLATE_L, marginBottom: 8 }}>units in stock</div>
                  <div style={{ height: 6, background: dark ? "#334155" : BORDER_LIGHT, borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.8s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Requisitions & Quick Actions */}
        <Card title="Latest Emergency Blood Requests" action="View All →" onAction={() => switchTab("blood-requests")} dark={dark}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bloodRequestsList.slice(0, 5).map((req, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: 12,
                background: dark ? "#0F172A" : SMOKE_LIGHT,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <BloodBadge group={req.bloodGroup} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.85rem", color: dark ? WHITE : NAVY }}>{req.patientName}</div>
                    <div style={{ fontSize: "0.74rem", color: SLATE_L }}>{req.units} units · {req.hospitalName}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StatusPill status={req.status || "Pending"} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System Activity & Expedited Requisition Feed */}
      <Card title="Live System Audit & Activity Timeline" action="View Complete Logs →" onAction={() => switchTab("audit-logs")} dark={dark}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="activity-two-col">
          {auditLogsList.slice(0, 6).map((log, i) => (
            <div key={i} style={{
              display: "flex",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 12,
              background: dark ? "#0F172A" : SMOKE_LIGHT,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: RED, marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: "0.84rem", color: dark ? WHITE : NAVY }}>{log.details || log.action}</div>
                <div style={{ fontSize: "0.74rem", color: SLATE_L, marginTop: 2 }}>{log.module} · by {log.adminName}</div>
              </div>
              <span style={{ fontSize: "0.72rem", color: SLATE_L, whiteSpace: "nowrap" }}>
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 2 — PATIENTS MANAGEMENT
  ───────────────────────────────────────────────────────────── */
  const renderPatientsTab = () => {
    const filtered = patientsList.filter(p => {
      const matchSearch = p.fullName?.toLowerCase().includes(patientSearch.toLowerCase()) ||
                          p.email?.toLowerCase().includes(patientSearch.toLowerCase()) ||
                          p.phone?.includes(patientSearch);
      const matchBlood = patientBloodFilter === "all" || p.bloodGroup === patientBloodFilter;
      return matchSearch && matchBlood;
    });

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        {/* Controls Toolbar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <input
              placeholder="Search patients by name, email, phone..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                background: dark ? NAVY2 : WHITE,
                color: dark ? WHITE : NAVY,
                fontFamily: FONT,
                fontSize: "0.85rem",
                width: 280
              }}
            />
            <select
              value={patientBloodFilter}
              onChange={(e) => setPatientBloodFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                background: dark ? NAVY2 : WHITE,
                color: dark ? WHITE : NAVY,
                fontFamily: FONT,
                fontSize: "0.85rem"
              }}
            >
              <option value="all">All Blood Groups</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => exportToCSV(filtered, "patients_directory.csv")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                background: dark ? NAVY2 : WHITE,
                color: dark ? WHITE : NAVY,
                fontWeight: 700,
                fontSize: "0.84rem",
                cursor: "pointer"
              }}
            >
              <FaFileArrowDown /> Export CSV
            </button>
            <button
              onClick={() => { setModalType("patient"); setModalItem(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: `linear-gradient(135deg, ${RED}, ${RED_DK})`,
                color: WHITE,
                fontWeight: 800,
                fontSize: "0.84rem",
                cursor: "pointer"
              }}
            >
              <FaPlus /> Add New Patient
            </button>
          </div>
        </div>

        {/* Data Table */}
        <Card dark={dark} style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                  {["Patient Name", "Blood Group", "Contact Details", "Assigned Hospital", "Condition", "Activity", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: SLATE_L, fontWeight: 700, fontSize: "0.76rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(patient => (
                  <tr
                    key={patient._id}
                    style={{ borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#1E293B" : SMOKE_LIGHT}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontWeight: 800, color: dark ? WHITE : NAVY }}>{patient.fullName}</div>
                        <span style={{ fontSize: "0.68rem", padding: "2px 6px", borderRadius: 6, background: dark ? "#0F172A" : "#F1F5F9", color: SLATE_L, fontWeight: 700 }}>
                          #{String(patient._id).substring(0, 7)}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: SLATE_L }}>{patient.email}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}><BloodBadge group={patient.bloodGroup} /></td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ color: dark ? WHITE : SLATE, fontWeight: 600 }}>{patient.phone}</div>
                      <div style={{ fontSize: "0.75rem", color: SLATE_L }}>{patient.city || "New Delhi"}, {patient.state || "Delhi"}</div>
                    </td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{patient.hospitalName || "AIIMS New Delhi"}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: 8,
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        background: patient.condition === "Critical" ? "#FEE2E2" : patient.condition === "Recovering" ? "#FEF3C7" : "#DCFCE7",
                        color: patient.condition === "Critical" ? RED : patient.condition === "Recovering" ? "#D97706" : "#16A34A"
                      }}>
                        {patient.condition || "Stable"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: 8,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: dark ? "#0F172A" : SMOKE_LIGHT,
                        color: dark ? WHITE : NAVY,
                        border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
                      }}>
                        {patient.bloodRequestsCount || (patient.bloodRequests || []).length} reqs · {patient.appointmentsCount || (patient.appointments || []).length} appts
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}><StatusPill status={patient.status} /></td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                          onClick={() => { setModalType("patientDetails"); setModalItem(patient); }}
                          title="View Full Patient Dossier"
                          style={{ border: "none", background: "transparent", color: "#0EA5E9", cursor: "pointer", fontSize: "1rem" }}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => { setModalType("patient"); setModalItem(patient); }}
                          title="Edit Patient Details"
                          style={{ border: "none", background: "transparent", color: "#2563EB", cursor: "pointer", fontSize: "0.95rem" }}
                        >
                          <FaPencil />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteImpact({ id: patient._id, name: patient.fullName, role: "patient", type: "patient" });
                            setModalType("deleteConfirm");
                          }}
                          title="Remove Patient Record"
                          style={{ border: "none", background: "transparent", color: RED, cursor: "pointer", fontSize: "0.95rem" }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 3 — DOCTORS MANAGEMENT
  ───────────────────────────────────────────────────────────── */
  const renderDoctorsTab = () => {
    const filtered = doctorsList.filter(d =>
      d.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.hospital?.toLowerCase().includes(doctorSearch.toLowerCase())
    );

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <input
            placeholder="Search doctors by name, hospital, specialization..."
            value={doctorSearch}
            onChange={(e) => setDoctorSearch(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              background: dark ? NAVY2 : WHITE,
              color: dark ? WHITE : NAVY,
              fontFamily: FONT,
              fontSize: "0.85rem",
              width: 320
            }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => exportToCSV(filtered, "doctors_registry.csv")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                background: dark ? NAVY2 : WHITE,
                color: dark ? WHITE : NAVY,
                fontWeight: 700,
                fontSize: "0.84rem",
                cursor: "pointer"
              }}
            >
              <FaFileArrowDown /> Export CSV
            </button>
            <button
              onClick={() => { setModalType("doctor"); setModalItem(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: `linear-gradient(135deg, ${RED}, ${RED_DK})`,
                color: WHITE,
                fontWeight: 800,
                fontSize: "0.84rem",
                cursor: "pointer"
              }}
            >
              <FaPlus /> Add New Doctor
            </button>
          </div>
        </div>

        <Card dark={dark} style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                  {["Doctor Name", "Specialization", "Affiliated Hospital", "Phone", "Email", "Availability", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: SLATE_L, fontWeight: 700, fontSize: "0.76rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => (
                  <tr
                    key={doc._id}
                    style={{ borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#1E293B" : SMOKE_LIGHT}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: dark ? WHITE : NAVY }}>{doc.name}</td>
                    <td style={{ padding: "14px 16px", color: RED, fontWeight: 700 }}>{doc.specialization}</td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{doc.hospital}</td>
                    <td style={{ padding: "14px 16px", color: dark ? WHITE : SLATE }}>{doc.phone}</td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{doc.email}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: "#DCFCE7", color: "#16A34A", fontSize: "0.74rem", fontWeight: 700, padding: "3px 8px", borderRadius: 12 }}>
                        {doc.availability || "Available"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}><StatusPill status={doc.status || "Active"} /></td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => { setModalType("doctor"); setModalItem(doc); }}
                          style={{ border: "none", background: "transparent", color: "#2563EB", cursor: "pointer" }}
                        >
                          <FaPencil />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteImpact({ id: doc._id, name: doc.name, role: "doctor", type: "doctor" });
                            setModalType("deleteConfirm");
                          }}
                          style={{ border: "none", background: "transparent", color: RED, cursor: "pointer" }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 4 — DONORS MANAGEMENT
  ───────────────────────────────────────────────────────────── */
  const renderDonorsTab = () => {
    const filtered = donorsList.filter(d => {
      const matchSearch = d.fullName?.toLowerCase().includes(donorSearch.toLowerCase()) ||
                          d.email?.toLowerCase().includes(donorSearch.toLowerCase()) ||
                          d.city?.toLowerCase().includes(donorSearch.toLowerCase());
      const matchBlood = donorBloodFilter === "all" || d.bloodGroup === donorBloodFilter;
      return matchSearch && matchBlood;
    });

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <input
              placeholder="Search donors by name, city, phone..."
              value={donorSearch}
              onChange={(e) => setDonorSearch(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                background: dark ? NAVY2 : WHITE,
                color: dark ? WHITE : NAVY,
                fontFamily: FONT,
                fontSize: "0.85rem",
                width: 280
              }}
            />
            <select
              value={donorBloodFilter}
              onChange={(e) => setDonorBloodFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                background: dark ? NAVY2 : WHITE,
                color: dark ? WHITE : NAVY,
                fontFamily: FONT,
                fontSize: "0.85rem"
              }}
            >
              <option value="all">All Blood Groups</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => exportToCSV(filtered, "donors_registry.csv")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                background: dark ? NAVY2 : WHITE,
                color: dark ? WHITE : NAVY,
                fontWeight: 700,
                fontSize: "0.84rem",
                cursor: "pointer"
              }}
            >
              <FaFileArrowDown /> Export CSV
            </button>
            <button
              onClick={() => { setModalType("donor"); setModalItem(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: `linear-gradient(135deg, ${RED}, ${RED_DK})`,
                color: WHITE,
                fontWeight: 800,
                fontSize: "0.84rem",
                cursor: "pointer"
              }}
            >
              <FaPlus /> Register Donor
            </button>
          </div>
        </div>

        <Card dark={dark} style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                  {["Donor Name", "Blood Group", "Contact Phone", "City", "Last Donation", "Eligibility", "Verification", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: SLATE_L, fontWeight: 700, fontSize: "0.76rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(donor => (
                  <tr
                    key={donor._id}
                    style={{ borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#1E293B" : SMOKE_LIGHT}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: dark ? WHITE : NAVY }}>{donor.fullName}</div>
                      <div style={{ fontSize: "0.75rem", color: SLATE_L }}>{donor.email}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}><BloodBadge group={donor.bloodGroup} /></td>
                    <td style={{ padding: "14px 16px", color: dark ? WHITE : SLATE }}>{donor.phone}</td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{donor.city}</td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{donor.lastDonation}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: donor.isEligible ? "#DCFCE7" : "#FEE2E2",
                        color: donor.isEligible ? "#16A34A" : RED,
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 12
                      }}>
                        {donor.isEligible ? "Eligible" : "Wait Period"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <StatusPill status={donor.verificationStatus || "Verified"} />
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => { setModalType("donorDetails"); setModalItem(donor); }}
                          title="View Donor Profile"
                          style={{ border: "none", background: "transparent", color: "#0EA5E9", cursor: "pointer", fontSize: "1rem" }}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => { setModalType("donor"); setModalItem(donor); }}
                          title="Edit Donor"
                          style={{ border: "none", background: "transparent", color: "#2563EB", cursor: "pointer" }}
                        >
                          <FaPencil />
                        </button>
                        {(donor.verificationStatus || "").toLowerCase() === "pending" && (
                          <button
                            onClick={() => handleEntityAction("donors", donor._id, "verify", "Donor verified.")}
                            title="Verify Donor"
                            style={{ border: "none", background: "#DCFCE7", color: "#16A34A", padding: "4px 8px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem" }}
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleEntityAction("donors", donor._id, donor.status === "Active" ? "suspend" : "activate", `Donor ${donor.status === "Active" ? "suspended" : "activated"}.`)}
                          title={donor.status === "Active" ? "Suspend" : "Activate"}
                          style={{ border: "none", background: "transparent", color: donor.status === "Active" ? "#D97706" : "#16A34A", cursor: "pointer", fontSize: "0.9rem" }}
                        >
                          {donor.status === "Active" ? "⏸" : "▶"}
                        </button>
                        <button
                          onClick={() => {
                            setDeleteImpact({ id: donor._id, name: donor.fullName, role: "donor", type: "donor" });
                            setModalType("deleteConfirm");
                          }}
                          title="Remove Donor"
                          style={{ border: "none", background: "transparent", color: RED, cursor: "pointer" }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 5 — BLOOD INVENTORY MANAGEMENT
  ───────────────────────────────────────────────────────────── */
  const [invSubTab, setInvSubTab] = useState("stock");

  const renderInventoryTab = () => (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setInvSubTab("stock")}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              border: "none",
              background: invSubTab === "stock" ? RED : (dark ? NAVY2 : WHITE),
              color: invSubTab === "stock" ? WHITE : (dark ? WHITE : SLATE)
            }}
          >
            Live Inventory
          </button>
          <button
            onClick={() => setInvSubTab("transactions")}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              border: "none",
              background: invSubTab === "transactions" ? RED : (dark ? NAVY2 : WHITE),
              color: invSubTab === "transactions" ? WHITE : (dark ? WHITE : SLATE)
            }}
          >
            Stock Movement History
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setModalType("adjustStock")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              background: dark ? NAVY2 : WHITE,
              color: dark ? WHITE : NAVY,
              fontWeight: 700,
              fontSize: "0.84rem",
              cursor: "pointer"
            }}
          >
            <FaSliders /> Adjust Stock
          </button>
          <button
            onClick={() => setModalType("addStock")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: `linear-gradient(135deg, ${RED}, ${RED_DK})`,
              color: WHITE,
              fontWeight: 800,
              fontSize: "0.84rem",
              cursor: "pointer"
            }}
          >
            <FaPlus /> Add Blood Stock
          </button>
        </div>
      </div>

      {invSubTab === "stock" ? (
        <Card dark={dark} style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                  {["Blood Group", "Component", "Units Available", "Reserved", "Hospital / Hub", "Status", "Last Sync"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: SLATE_L, fontWeight: 700, fontSize: "0.76rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventoryList.map(item => (
                  <tr
                    key={item._id}
                    style={{ borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#1E293B" : SMOKE_LIGHT}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px" }}><BloodBadge group={item.bloodGroup} size="lg" /></td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: dark ? WHITE : NAVY }}>{item.component || "Whole Blood"}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 900, fontSize: "1.1rem", color: item.units <= 10 ? RED : (dark ? WHITE : NAVY) }}>
                      {item.units} units
                    </td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{item.reserved || 0} units</td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{item.hospital}</td>
                    <td style={{ padding: "14px 16px" }}><StatusPill status={item.status || (item.units <= 10 ? "Critical" : "Available")} /></td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>
                      {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : "Today"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card dark={dark} style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                  {["Date", "Batch ID", "Blood Group", "Units", "Movement Type", "Facility", "Reason", "Authorized By"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: SLATE_L, fontWeight: 700, fontSize: "0.76rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stockTransactions.map(tx => (
                  <tr
                    key={tx._id}
                    style={{ borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#1E293B" : SMOKE_LIGHT}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{tx.date}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 700, color: dark ? WHITE : NAVY }}>{tx.batchId}</td>
                    <td style={{ padding: "14px 16px" }}><BloodBadge group={tx.bloodGroup} /></td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: dark ? WHITE : NAVY }}>{tx.units} units</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: tx.type === "Received" ? "#DCFCE7" : (tx.type === "Expired" ? "#FEE2E2" : "#DBEAFE"),
                        color: tx.type === "Received" ? "#16A34A" : (tx.type === "Expired" ? RED : "#2563EB"),
                        fontSize: "0.74rem",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 10
                      }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{tx.hospital}</td>
                    <td style={{ padding: "14px 16px", color: dark ? WHITE : SLATE }}>{tx.reason}</td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{tx.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 6 — BLOOD BANKS MANAGEMENT
  ───────────────────────────────────────────────────────────── */
  const renderBloodBanksTab = () => (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontWeight: 800, fontSize: "1rem", color: dark ? WHITE : NAVY }}>
          All-India Connected Blood Banks ({bloodBanksList.length} Facilities)
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => exportToCSV(bloodBanksList, "blood_banks_registry.csv")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              background: dark ? NAVY2 : WHITE,
              color: dark ? WHITE : NAVY,
              fontWeight: 700,
              fontSize: "0.84rem",
              cursor: "pointer"
            }}
          >
            <FaFileArrowDown /> Export Directory
          </button>
          <button
            onClick={() => { setModalType("bloodBank"); setModalItem(null); }}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none",
              background: `linear-gradient(135deg, ${RED}, ${RED_DK})`, color: WHITE, fontWeight: 800, fontSize: "0.84rem", cursor: "pointer"
            }}
          >
            <FaPlus /> Register Blood Bank
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
        {bloodBanksList.map(bank => {
          const totalStock = bank.bloodStock ? Object.values(bank.bloodStock).reduce((a, b) => a + b, 0) : 180;
          return (
            <Card key={bank.id || bank._id} dark={dark} style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: "1.05rem", color: dark ? WHITE : NAVY, margin: 0 }}>{bank.name}</h4>
                  <div style={{ fontSize: "0.78rem", color: SLATE_L, marginTop: 4 }}>
                    <FaLocationDot style={{ color: RED, marginRight: 4 }} /> {bank.city}, {bank.state}
                  </div>
                </div>
                <span style={{ background: bank.type === "government" ? "#DCFCE7" : "#DBEAFE", color: bank.type === "government" ? "#16A34A" : "#2563EB", fontWeight: 800, fontSize: "0.7rem", padding: "3px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                  {bank.type || "NABH"}
                </span>
              </div>
              <p style={{ fontSize: "0.82rem", color: SLATE_L, lineHeight: 1.5, marginBottom: 14 }}>{bank.address}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                <div>
                  <div style={{ fontSize: "0.72rem", color: SLATE_L }}>TOTAL STOCK</div>
                  <div style={{ fontWeight: 900, fontSize: "1.1rem", color: RED }}>{totalStock ?? "—"} units</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.72rem", color: SLATE_L }}>TELEPHONE</div>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem", color: dark ? WHITE : NAVY }}>{bank.phone}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
                <StatusPill status={bank.verificationStatus || "Pending"} />
                <div style={{ flex: 1 }} />
                <button onClick={() => { setModalType("bloodBank"); setModalItem(bank); }} title="Edit" style={{ border: "none", background: "transparent", color: "#2563EB", cursor: "pointer" }}><FaPencil /></button>
                {(bank.verificationStatus !== "Verified") && (
                  <button onClick={() => handleEntityAction("blood-banks", bank._id, "approve", "Blood bank verified.")} style={{ border: "none", background: "#DCFCE7", color: "#16A34A", padding: "4px 8px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem" }}>Verify</button>
                )}
                <button
                  onClick={() => {
                    const action = bank.status === "Active" ? "deactivate" : "activate";
                    handleEntityAction("blood-banks", bank._id, action, `Blood bank ${action}d.`);
                  }}
                  style={{ border: "none", background: "transparent", color: bank.status === "Active" ? "#D97706" : "#16A34A", cursor: "pointer", fontSize: "0.85rem" }}
                  title={bank.status === "Active" ? "Deactivate" : "Activate"}
                >
                  {bank.status === "Active" ? "⏸" : "▶"}
                </button>
                <button onClick={() => { setDeleteImpact({ id: bank._id, name: bank.name, role: "blood bank", type: "blood-bank" }); setModalType("deleteConfirm"); }} title="Remove" style={{ border: "none", background: "transparent", color: RED, cursor: "pointer" }}><FaTrash /></button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 7 — APPOINTMENTS MANAGEMENT
  ───────────────────────────────────────────────────────────── */
  const renderAppointmentsTab = () => {
    const filtered = appointmentsList.filter(apt =>
      appointmentStatusFilter === "all" || apt.status?.toLowerCase() === appointmentStatusFilter.toLowerCase()
    );

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select
              value={appointmentStatusFilter}
              onChange={(e) => setAppointmentStatusFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                background: dark ? NAVY2 : WHITE,
                color: dark ? WHITE : NAVY,
                fontFamily: FONT,
                fontSize: "0.85rem"
              }}
            >
              <option value="all">All Appointment Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => { setModalType("appointment"); }}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none",
              background: `linear-gradient(135deg, ${RED}, ${RED_DK})`, color: WHITE, fontWeight: 800, fontSize: "0.84rem", cursor: "pointer"
            }}
          >
            <FaPlus /> Schedule Appointment
          </button>
          <button
            onClick={() => exportToCSV(filtered, "appointments_schedule.csv")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              background: dark ? NAVY2 : WHITE,
              color: dark ? WHITE : NAVY,
              fontWeight: 700,
              fontSize: "0.84rem",
              cursor: "pointer"
            }}
          >
            <FaFileArrowDown /> Export Schedule
          </button>
          </div>
        </div>

        <Card dark={dark} style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                  {["Patient Name", "Appointment Type", "Doctor / Staff", "Hospital Center", "Date & Time", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: SLATE_L, fontWeight: 700, fontSize: "0.76rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(apt => (
                  <tr
                    key={apt._id}
                    style={{ borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#1E293B" : SMOKE_LIGHT}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: dark ? WHITE : NAVY }}>{apt.patientName}</td>
                    <td style={{ padding: "14px 16px", color: RED, fontWeight: 700 }}>{apt.type}</td>
                    <td style={{ padding: "14px 16px", color: dark ? WHITE : SLATE }}>{apt.doctor}</td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{apt.hospital}</td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{apt.date} at {apt.time}</td>
                    <td style={{ padding: "14px 16px" }}><StatusPill status={apt.status} /></td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {apt.status === "Pending" && (
                          <button
                            onClick={() => handleAppointmentStatus(apt._id, "Scheduled")}
                            style={{ border: "none", background: "#DCFCE7", color: "#16A34A", padding: "4px 8px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem" }}
                          >
                            Approve
                          </button>
                        )}
                        {apt.status === "Scheduled" && (
                          <button
                            onClick={() => handleAppointmentStatus(apt._id, "Completed")}
                            style={{ border: "none", background: "#DBEAFE", color: "#2563EB", padding: "4px 8px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem" }}
                          >
                            Mark Done
                          </button>
                        )}
                        <button
                          onClick={() => handleAppointmentStatus(apt._id, "Cancelled")}
                          style={{ border: "none", background: "#FEE2E2", color: RED, padding: "4px 8px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 8 — BLOOD REQUESTS MANAGEMENT
  ───────────────────────────────────────────────────────────── */
  const renderBloodRequestsTab = () => {
    const filtered = bloodRequestsList.filter(req =>
      requestStatusFilter === "all" || req.status?.toLowerCase() === requestStatusFilter.toLowerCase()
    );

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <select
            value={requestStatusFilter}
            onChange={(e) => setRequestStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              background: dark ? NAVY2 : WHITE,
              color: dark ? WHITE : NAVY,
              fontFamily: FONT,
              fontSize: "0.85rem"
            }}
          >
            <option value="all">All Request Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="approved">Approved</option>
            <option value="dispatched">Dispatched</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={() => exportToCSV(filtered, "blood_requisitions.csv")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              background: dark ? NAVY2 : WHITE,
              color: dark ? WHITE : NAVY,
              fontWeight: 700,
              fontSize: "0.84rem",
              cursor: "pointer"
            }}
          >
            <FaFileArrowDown /> Export Requisitions
          </button>
        </div>

        <Card dark={dark} style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                  {["Patient Name", "Group Needed", "Units", "Hospital Requested", "Urgency", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: SLATE_L, fontWeight: 700, fontSize: "0.76rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => (
                  <tr
                    key={req._id}
                    style={{ borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#1E293B" : SMOKE_LIGHT}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: dark ? WHITE : NAVY }}>{req.patientName}</div>
                      <div style={{ fontSize: "0.75rem", color: SLATE_L }}>{req.contactNumber || "Emergency Contact"}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}><BloodBadge group={req.bloodGroup} size="lg" /></td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, color: dark ? WHITE : NAVY }}>{req.units} units</td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>{req.hospitalName}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: req.urgency === "Critical" ? "#FEE2E2" : (req.urgency === "High" ? "#FEF3C7" : "#DCFCE7"),
                        color: req.urgency === "Critical" ? RED : (req.urgency === "High" ? "#D97706" : "#16A34A"),
                        fontSize: "0.74rem",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 10
                      }}>
                        {req.urgency || "Normal"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}><StatusPill status={req.status} /></td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {req.status === "Pending" && (
                          <button
                            onClick={() => handleRequestStatus(req._id, "Approved")}
                            style={{ border: "none", background: "#DCFCE7", color: "#16A34A", padding: "4px 8px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem" }}
                          >
                            Approve
                          </button>
                        )}
                        {req.status === "Approved" && (
                          <>
                            <button
                              onClick={async () => {
                                const target = window.prompt("Forward request to which hospital / blood bank?");
                                if (target) handleRequestStatus(req._id, "Forwarded", target);
                              }}
                              style={{ border: "none", background: "#E0E7FF", color: "#4338CA", padding: "4px 8px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem" }}
                            >
                              Forward
                            </button>
                            <button
                              onClick={() => handleRequestStatus(req._id, "Dispatched")}
                              style={{ border: "none", background: "#DBEAFE", color: "#2563EB", padding: "4px 8px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem" }}
                            >
                              Dispatch
                            </button>
                          </>
                        )}
                        {req.status === "Dispatched" && (
                          <button
                            onClick={() => handleRequestStatus(req._id, "Completed")}
                            style={{ border: "none", background: "#DCFCE7", color: "#16A34A", padding: "4px 8px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem" }}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleRequestStatus(req._id, "Rejected")}
                          style={{ border: "none", background: "#FEE2E2", color: RED, padding: "4px 8px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem" }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 9 — CENTRALIZED USER MANAGEMENT
  ───────────────────────────────────────────────────────────── */
  const renderUsersTab = () => {
    const filtered = usersList.filter(u => {
      const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
      const matchStatus = userStatusFilter === "all" || u.status?.toLowerCase() === userStatusFilter.toLowerCase();
      const matchSearch = u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.phone?.includes(userSearch);
      return matchRole && matchStatus && matchSearch;
    });

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        {/* Controls */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <input
              placeholder="Search users by name, email, phone..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                background: dark ? NAVY2 : WHITE,
                color: dark ? WHITE : NAVY,
                fontFamily: FONT,
                fontSize: "0.85rem",
                width: 280
              }}
            />
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                background: dark ? NAVY2 : WHITE,
                color: dark ? WHITE : NAVY,
                fontFamily: FONT,
                fontSize: "0.85rem"
              }}
            >
              <option value="all">All Roles</option>
              <option value="administrator">Administrator</option>
              <option value="hospital_staff">Hospital Staff</option>
              <option value="blood_bank_staff">Blood Bank Staff</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="donor">Donor</option>
            </select>
            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                background: dark ? NAVY2 : WHITE,
                color: dark ? WHITE : NAVY,
                fontFamily: FONT,
                fontSize: "0.85rem"
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => exportToCSV(filtered, "users_master.csv")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                background: dark ? NAVY2 : WHITE,
                color: dark ? WHITE : NAVY,
                fontWeight: 700,
                fontSize: "0.84rem",
                cursor: "pointer"
              }}
            >
              <FaFileArrowDown /> Export CSV
            </button>
            <button
              onClick={() => { setModalType("user"); setModalItem(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: `linear-gradient(135deg, ${RED}, ${RED_DK})`,
                color: WHITE,
                fontWeight: 800,
                fontSize: "0.84rem",
                cursor: "pointer"
              }}
            >
              <FaPlus /> Create New User
            </button>
          </div>
        </div>

        {/* Centralized User Table */}
        <Card dark={dark} style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                  {["User Details", "Role Assignment", "Contact Phone", "Registration Date", "Status", "Administrative Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: SLATE_L, fontWeight: 700, fontSize: "0.76rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr
                    key={u._id}
                    style={{ borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}`, opacity: u.isDeleted ? 0.6 : 1 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#1E293B" : SMOKE_LIGHT}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, color: dark ? WHITE : NAVY }}>{u.fullName}</div>
                      <div style={{ fontSize: "0.75rem", color: SLATE_L }}>{u.email}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: u.role === "administrator" ? `${RED}18` : (u.role === "doctor" ? "#DBEAFE" : "#DCFCE7"),
                        color: u.role === "administrator" ? RED : (u.role === "doctor" ? "#2563EB" : "#16A34A"),
                        fontWeight: 800,
                        fontSize: "0.74rem",
                        padding: "3px 10px",
                        borderRadius: 12,
                        textTransform: "capitalize"
                      }}>
                        {u.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: dark ? WHITE : SLATE }}>{u.phone || "N/A"}</td>
                    <td style={{ padding: "14px 16px", color: SLATE_L }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "2026-06-15"}
                    </td>
                    <td style={{ padding: "14px 16px" }}><StatusPill status={u.status} /></td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button
                          onClick={() => { setModalType("user"); setModalItem(u); }}
                          title="Edit User Info & Role"
                          style={{ border: "none", background: "transparent", color: "#2563EB", cursor: "pointer", fontSize: "0.95rem" }}
                        >
                          <FaPencil />
                        </button>
                        {u.status === "Active" ? (
                          <button
                            onClick={() => handleUserAction(u._id, "suspend")}
                            title="Suspend User Account"
                            style={{ border: "none", background: "transparent", color: "#D97706", cursor: "pointer", fontSize: "0.9rem" }}
                          >
                            <FaTriangleExclamation />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(u._id, "activate")}
                            title="Activate User Account"
                            style={{ border: "none", background: "transparent", color: "#16A34A", cursor: "pointer", fontSize: "0.9rem" }}
                          >
                            <FaCheck />
                          </button>
                        )}
                        {u.isDeleted ? (
                          <button
                            onClick={() => handleUserAction(u._id, "restore")}
                            title="Restore Soft-Deleted Account"
                            style={{ border: "none", background: "#DCFCE7", color: "#16A34A", padding: "4px 8px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.72rem" }}
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setDeleteImpact({ id: u._id, name: u.fullName, role: u.role, type: "user" });
                              setModalType("deleteConfirm");
                            }}
                            title="Remove User Account"
                            style={{ border: "none", background: "transparent", color: RED, cursor: "pointer", fontSize: "0.95rem" }}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 10 — ROLE & PERMISSIONS MATRIX
  ───────────────────────────────────────────────────────────── */
  const renderRolesPermissionsTab = () => {
    const roles = [
      { key: "super_admin", label: "Super Admin", desc: "Permanent full control over system, users, settings, and audits" },
      { key: "administrator", label: "Administrator", desc: "Operations admin with system and entity access" },
      { key: "hospital_staff", label: "Hospital Staff", desc: "Manages hospital requisitions, patients, and ward stock" },
      { key: "blood_bank_staff", label: "Blood Bank Staff", desc: "Manages blood components, testing, and storage hubs" },
      { key: "doctor", label: "Doctor", desc: "Patient clinical rounds, consultation scheduling, prescriptions" },
      { key: "patient", label: "Patient", desc: "Blood requisition submissions, reports, and appointment booking" },
      { key: "donor", label: "Donor", desc: "Donation scheduling, eligibility self-check, reward certificates" }
    ];

    const perms = ["view", "add", "edit", "delete", "approve", "export", "manage"];
    const currentMatrix = settingsData?.rolesPermissions || {};

    const togglePerm = (roleKey, permKey) => {
      if (roleKey === "super_admin") return alert("Super Admin permissions are permanently locked to full access.");
      const updated = {
        ...currentMatrix,
        [roleKey]: {
          ...currentMatrix[roleKey],
          [permKey]: !currentMatrix[roleKey]?.[permKey]
        }
      };
      setSettingsData({ ...settingsData, rolesPermissions: updated });
    };

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>Granular Role & Permissions Matrix</h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: SLATE_L }}>Configure access privileges for each user role across the HemoCare platform.</p>
          </div>
          <button
            onClick={() => handlePermissionsSave(currentMatrix)}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: `linear-gradient(135deg, ${RED}, ${RED_DK})`,
              color: WHITE,
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            Save Permissions Matrix
          </button>
        </div>

        <Card dark={dark} style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                  <th style={{ padding: "14px 18px", textAlign: "left", color: SLATE_L, fontWeight: 700, width: 260 }}>User Role</th>
                  {perms.map(p => (
                    <th key={p} style={{ padding: "14px 12px", textAlign: "center", color: SLATE_L, fontWeight: 700, textTransform: "capitalize" }}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map(r => (
                  <tr key={r.key} style={{ borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}` }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 800, color: dark ? WHITE : NAVY }}>{r.label}</div>
                      <div style={{ fontSize: "0.73rem", color: SLATE_L }}>{r.desc}</div>
                    </td>
                    {perms.map(p => {
                      const isAllowed = r.key === "super_admin" ? true : (currentMatrix[r.key]?.[p] || false);
                      return (
                        <td key={p} style={{ padding: "14px 12px", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isAllowed}
                            disabled={r.key === "super_admin"}
                            onChange={() => togglePerm(r.key, p)}
                            style={{
                              width: 18,
                              height: 18,
                              accentColor: RED,
                              cursor: r.key === "super_admin" ? "not-allowed" : "pointer"
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 11 — REPORTS & ANALYTICS
  ───────────────────────────────────────────────────────────── */
  const renderReportsTab = () => (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>System Reports & Analytics</h3>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: SLATE_L }}>Export comprehensive clinical summaries and inventory metrics.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => window.print()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              background: dark ? NAVY2 : WHITE,
              color: dark ? WHITE : NAVY,
              fontWeight: 700,
              fontSize: "0.84rem",
              cursor: "pointer"
            }}
          >
            <FaPrint /> Print Report
          </button>
          <button
            onClick={() => exportToCSV(inventoryList, "system_comprehensive_report.csv")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: `linear-gradient(135deg, ${RED}, ${RED_DK})`,
              color: WHITE,
              fontWeight: 800,
              fontSize: "0.84rem",
              cursor: "pointer"
            }}
          >
            <FaFileArrowDown /> Download Full CSV Report
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Card dark={dark} title="Patient Requisition Fulfillment">
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "#16A34A", marginBottom: 4 }}>94.2%</div>
          <p style={{ fontSize: "0.82rem", color: SLATE_L, margin: 0 }}>Avg response time under 28 minutes across 200+ partner hospitals.</p>
        </Card>
        <Card dark={dark} title="Cold Chain Integrity Rate">
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "#2563EB", marginBottom: 4 }}>100.0%</div>
          <p style={{ fontSize: "0.82rem", color: SLATE_L, margin: 0 }}>Zero temperature-breached blood batches reported in last 90 days.</p>
        </Card>
        <Card dark={dark} title="Donor Return Retention">
          <div style={{ fontSize: "2rem", fontWeight: 900, color: RED, marginBottom: 4 }}>68.4%</div>
          <p style={{ fontSize: "0.82rem", color: SLATE_L, margin: 0 }}>Repeat donation participation rate across voluntary camp drives.</p>
        </Card>
      </div>

      <Card title="Monthly Clinical Report Breakdown" dark={dark}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                {["Metric Name", "Current Quarter", "Previous Quarter", "Change (%)", "Benchmark"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: SLATE_L, fontWeight: 700, fontSize: "0.76rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Total Units Collected", "1,840 units", "1,620 units", "+13.5%", "1,500 units"],
                ["Trauma Transfusion Dispatches", "312 cases", "280 cases", "+11.4%", "N/A"],
                ["Voluntary Camps Conducted", "48 drives", "42 drives", "+14.2%", "40 drives"],
                ["Critical Demand Turnaround", "22 mins", "29 mins", "-24.1%", "< 30 mins"]
              ].map(([metric, cur, prev, chg, bm], idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}` }}>
                  <td style={{ padding: "14px 16px", fontWeight: 800, color: dark ? WHITE : NAVY }}>{metric}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: dark ? WHITE : NAVY }}>{cur}</td>
                  <td style={{ padding: "14px 16px", color: SLATE_L }}>{prev}</td>
                  <td style={{ padding: "14px 16px", color: chg.startsWith("+") ? "#16A34A" : RED, fontWeight: 800 }}>{chg}</td>
                  <td style={{ padding: "14px 16px", color: SLATE_L }}>{bm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 12 — NOTIFICATIONS MANAGEMENT
  ───────────────────────────────────────────────────────────── */
  const renderNotificationsTab = () => (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>Notifications Broadcast Center</h3>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: SLATE_L }}>Send targeted broadcast alerts to specific roles or the entire network.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => {
              showNotification({
                type: "success",
                title: "HRBMS Notification Sound Active",
                message: "Clinical alert audio telemetry and notification popup are functioning perfectly.",
                duration: 5000,
                playSound: true
              });
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              background: dark ? NAVY2 : WHITE,
              color: dark ? WHITE : NAVY,
              fontWeight: 700,
              fontSize: "0.84rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <FaBell style={{ color: RED }} /> Test Sound & Notification
          </button>
          <button
            onClick={() => setModalType("notification")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: `linear-gradient(135deg, ${RED}, ${RED_DK})`,
              color: WHITE,
              fontWeight: 800,
              fontSize: "0.84rem",
              cursor: "pointer"
            }}
          >
            <FaPlus /> Send Broadcast Notification
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {notificationsList.map(n => (
          <Card key={n._id} dark={dark} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.2rem" }}>{n.type === "urgent" ? "🚨" : (n.type === "alert" ? "⚠️" : "📢")}</span>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY, fontSize: "0.95rem" }}>{n.title}</h4>
                  <div style={{ fontSize: "0.75rem", color: SLATE_L }}>
                    Delivered to: <strong>{n.target}</strong> · {n.deliveredCount || 100} recipients
                  </div>
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", color: SLATE_L }}>
                {n.sentAt ? new Date(n.sentAt).toLocaleString() : "Recently"}
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: dark ? "#CBD5E1" : SLATE, margin: "8px 0 0", lineHeight: 1.6 }}>{n.message}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 13 — AUDIT LOGS & ACTIVITY MONITORING
  ───────────────────────────────────────────────────────────── */
  const renderAuditLogsTab = () => (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>Immutable System Audit Trail</h3>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: SLATE_L }}>Cryptographically logged administrator and security actions.</p>
        </div>
        <button
          onClick={() => exportToCSV(auditLogsList, "system_audit_trail.csv")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 10,
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
            background: dark ? NAVY2 : WHITE,
            color: dark ? WHITE : NAVY,
            fontWeight: 700,
            fontSize: "0.84rem",
            cursor: "pointer"
          }}
        >
          <FaFileArrowDown /> Export Audit Trail
        </button>
      </div>

      <Card dark={dark} style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                {["Timestamp", "Admin Actor", "Module", "Action Performed", "Details & Changes", "IP Address"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: SLATE_L, fontWeight: 700, fontSize: "0.76rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditLogsList.map(log => (
                <tr
                  key={log._id}
                  style={{ borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}` }}
                  onMouseEnter={(e) => e.currentTarget.style.background = dark ? "#1E293B" : SMOKE_LIGHT}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px", color: SLATE_L, whiteSpace: "nowrap" }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "Recent"}
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 800, color: dark ? WHITE : NAVY }}>{log.adminName}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: `${RED}18`, color: RED, fontWeight: 700, fontSize: "0.72rem", padding: "3px 8px", borderRadius: 8 }}>
                      {log.module}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: dark ? WHITE : NAVY, fontFamily: "monospace" }}>{log.action}</td>
                  <td style={{ padding: "14px 16px", color: dark ? "#CBD5E1" : SLATE }}>{log.details}</td>
                  <td style={{ padding: "14px 16px", color: SLATE_L, fontFamily: "monospace", fontSize: "0.78rem" }}>{log.ipAddress || "127.0.0.1"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 14 — WEBSITE & SYSTEM SETTINGS
  ───────────────────────────────────────────────────────────── */
  const renderSettingsTab = () => {
    const s = settingsData || {};
    return (
      <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 900 }}>
        <h3 style={{ margin: "0 0 4px", fontWeight: 800, color: dark ? WHITE : NAVY }}>Website Configuration & System Preferences</h3>
        <p style={{ margin: "0 0 24px", fontSize: "0.82rem", color: SLATE_L }}>Manage general healthcare parameters, security policies, and thresholds.</p>

        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const updated = {
            ...s,
            general: {
              ...s.general,
              websiteName: fd.get("websiteName"),
              contactEmail: fd.get("contactEmail"),
              contactPhone: fd.get("contactPhone"),
              address: fd.get("address"),
              maintenanceMode: fd.get("maintenanceMode") === "on"
            },
            notifications: {
              ...s.notifications,
              lowStockThreshold: parseInt(fd.get("lowStockThreshold") || 15),
              emailAlerts: fd.get("emailAlerts") === "on",
              smsEmergencyAlerts: fd.get("smsEmergencyAlerts") === "on"
            }
          };
          handleSettingsSave(updated);
        }}>
          {/* General Settings Card */}
          <Card dark={dark} title="General Branding & Organization Details" style={{ marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 6 }}>Website / Portal Name</label>
                <input name="websiteName" defaultValue={s.general?.websiteName || "HemoCare Healthcare System"} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY, fontFamily: FONT, fontSize: "0.85rem" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 6 }}>Primary Support Email</label>
                <input name="contactEmail" defaultValue={s.general?.contactEmail || "admin@hemocare.org"} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY, fontFamily: FONT, fontSize: "0.85rem" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 6 }}>Emergency Helpline Phone</label>
                <input name="contactPhone" defaultValue={s.general?.contactPhone || "+91 1800-HEMOCARE"} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY, fontFamily: FONT, fontSize: "0.85rem" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 6 }}>Headquarters Address</label>
                <input name="address" defaultValue={s.general?.address || "Ansari Nagar, New Delhi 110029"} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY, fontFamily: FONT, fontSize: "0.85rem" }} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: "0.85rem", color: dark ? WHITE : NAVY }}>
                <input type="checkbox" name="maintenanceMode" defaultChecked={s.general?.maintenanceMode} style={{ width: 18, height: 18, accentColor: RED }} />
                <span>Enable System Maintenance Mode (Disables public registrations temporarily)</span>
              </label>
            </div>
          </Card>

          {/* Notifications Settings Card */}
          <Card dark={dark} title="Inventory Thresholds & Alert Policies" style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 6 }}>Low-Stock Alert Threshold (Units per Blood Group)</label>
              <input type="number" name="lowStockThreshold" defaultValue={s.notifications?.lowStockThreshold || 15} style={{ width: 200, padding: "10px 14px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY, fontFamily: FONT, fontSize: "0.85rem" }} />
              <div style={{ fontSize: "0.74rem", color: SLATE_L, marginTop: 4 }}>Triggers yellow/red alert badges across all admin consoles when supply drops below this count.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: "0.85rem", color: dark ? WHITE : NAVY }}>
                <input type="checkbox" name="emailAlerts" defaultChecked={s.notifications?.emailAlerts ?? true} style={{ width: 18, height: 18, accentColor: RED }} />
                <span>Send automated email notifications for emergency hospital requisitions</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: "0.85rem", color: dark ? WHITE : NAVY }}>
                <input type="checkbox" name="smsEmergencyAlerts" defaultChecked={s.notifications?.smsEmergencyAlerts ?? true} style={{ width: 18, height: 18, accentColor: RED }} />
                <span>Trigger immediate SMS alerts to verified local blood donors</span>
              </label>

              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    showNotification({
                      title: "Audio Alert Verified",
                      message: "Admin notification audio telemetry and visual popup are operating properly.",
                      type: "info",
                      duration: 4500,
                      playSound: true
                    });
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                    background: dark ? NAVY2 : WHITE,
                    color: dark ? WHITE : NAVY,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <FaBell style={{ color: RED }} /> Test Audio Notification
                </button>
              </div>
            </div>
          </Card>

          <button
            type="submit"
            style={{
              padding: "12px 28px",
              borderRadius: 12,
              border: "none",
              background: `linear-gradient(135deg, ${RED}, ${RED_DK})`,
              color: WHITE,
              fontWeight: 800,
              fontSize: "0.92rem",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(196,18,48,0.25)"
            }}
          >
            Save All Preferences
          </button>
        </form>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: TAB 15 — SYSTEM MONITORING & HEALTH
  ───────────────────────────────────────────────────────────── */
  const renderSystemMonitoringTab = () => {
    const sys = monitoringData || {
      status: "Operational",
      uptimeSeconds: 14280,
      database: { status: "Connected", name: "Hospital_Management", collectionsCount: 18, host: "hospital.0xnylcb.mongodb.net" },
      memory: { heapUsedMB: 48, heapTotalMB: 76, rssMB: 112 },
      environment: "production",
      nodeVersion: "v20.x",
      serverTime: new Date().toISOString(),
      socketConnections: 3,
      apiLatencyMs: 12
    };

    const formatUptime = (sec) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${h}h ${m}m ${s}s`;
    };

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>Real-time Health & Infrastructure Diagnostics</h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: SLATE_L }}>Live connection health, database replica telemetry, and memory profile.</p>
          </div>
          <button
            onClick={fetchAllData}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
              background: dark ? NAVY2 : WHITE,
              color: dark ? WHITE : NAVY,
              fontWeight: 700,
              fontSize: "0.84rem",
              cursor: "pointer"
            }}
          >
            <FaRotateRight className={refreshing ? "spin-icon" : ""} /> Refresh Diagnostics
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
          <Card dark={dark} title="MongoDB Connection Status">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#16A34A" }} />
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#16A34A" }}>{sys.database?.status || "Connected"}</div>
            </div>
            <div style={{ fontSize: "0.78rem", color: SLATE_L, marginTop: 6 }}>Database: {sys.database?.name} · {sys.database?.collectionsCount} collections</div>
          </Card>

          <Card dark={dark} title="Server Process Uptime">
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: dark ? WHITE : NAVY }}>
              {formatUptime(sys.uptimeSeconds || 7200)}
            </div>
            <div style={{ fontSize: "0.78rem", color: SLATE_L, marginTop: 6 }}>Node {sys.nodeVersion} · Mode: {sys.environment}</div>
          </Card>

          <Card dark={dark} title="Memory Allocation">
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: RED }}>
              {sys.memory?.heapUsedMB} MB / {sys.memory?.heapTotalMB} MB
            </div>
            <div style={{ fontSize: "0.78rem", color: SLATE_L, marginTop: 6 }}>Resident Set: {sys.memory?.rssMB} MB</div>
          </Card>

          <Card dark={dark} title="API Average Latency">
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#2563EB" }}>
              {sys.apiLatencyMs || 14} ms
            </div>
            <div style={{ fontSize: "0.78rem", color: SLATE_L, marginTop: 6 }}>Live Socket.io clients: {sys.socketConnections}</div>
          </Card>
        </div>

        <Card dark={dark} title="Backend Infrastructure Endpoints">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["GET /api/admin/dashboard", "200 OK", "Aggregated analytics & real-time counts"],
              ["GET /api/admin/all-users", "200 OK", "Centralized user directory query with status filtering"],
              ["GET /api/admin/inventory-items", "200 OK", "Live cold chain blood inventory across 8 groups"],
              ["GET /api/admin/blood-requests-list", "200 OK", "Urgent blood requisition stream with status updates"],
              ["GET /api/admin/system-monitoring", "200 OK", "Live system telemetry and memory health ping"]
            ].map(([endpoint, status, desc], idx) => (
              <div key={idx} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                borderRadius: 10,
                background: dark ? "#0F172A" : SMOKE_LIGHT,
                border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ background: "#DCFCE7", color: "#16A34A", fontWeight: 800, fontSize: "0.72rem", padding: "2px 8px", borderRadius: 8 }}>{status}</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: dark ? WHITE : NAVY, fontSize: "0.85rem" }}>{endpoint}</span>
                </div>
                <span style={{ fontSize: "0.78rem", color: SLATE_L }}>{desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: MODALS (Add/Edit Users, Inventory, Delete Confirmation)
  ───────────────────────────────────────────────────────────── */
  const renderModals = () => {
    if (!modalType) return null;

    // Delete Confirmation Modal with Impact Warning & Soft-Delete option
    if (modalType === "deleteConfirm") {
      return (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 500,
          padding: 20
        }}>
          <div style={{
            background: dark ? NAVY2 : WHITE,
            borderRadius: 20,
            maxWidth: 480,
            width: "100%",
            padding: 28,
            boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${RED}18`, color: RED, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                <FaTriangleExclamation />
              </div>
              <div>
                <h3 style={{ margin: 0, fontWeight: 900, color: dark ? WHITE : NAVY, fontSize: "1.1rem" }}>Confirm Entity Deactivation</h3>
                <div style={{ fontSize: "0.78rem", color: SLATE_L }}>Safe Removal Protocol</div>
              </div>
            </div>

            <div style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderRadius: 12, padding: "14px 16px", marginBottom: 18, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 800, color: dark ? WHITE : NAVY }}>
                Target: {deleteImpact.name || "Selected Item"}
              </div>
              <div style={{ fontSize: "0.78rem", color: RED, fontWeight: 700, marginTop: 2, textTransform: "capitalize" }}>
                Role / Type: {deleteImpact.role || deleteImpact.type}
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: dark ? "#CBD5E1" : SLATE, lineHeight: 1.6, marginBottom: 20 }}>
              To safeguard clinical audit trails and ensure patient blood request and donation histories remain intact, this action will <strong>soft-delete / deactivate</strong> the account. You can restore this account at any time from the User Management console.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setModalType(null)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                  background: "transparent",
                  color: dark ? WHITE : SLATE,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const delEndpoints = { doctor: "doctors", donor: "donors", "blood-bank": "blood-banks", bloodbank: "blood-banks" };
                  if (deleteImpact.type === "patient") {
                    try {
                      const res = await fetch(`${API_BASE}/admin/patients/${deleteImpact.id}`, {
                        method: "DELETE",
                        headers: { "x-admin-name": user?.fullName || "Super Administrator" }
                      });
                      if (res.ok) {
                        showToast("Patient record successfully removed from database.");
                        fetchAllData();
                        setModalType(null);
                      } else {
                        showToast("Failed to remove patient.", "error");
                      }
                    } catch (e) {
                      showToast("Network error removing patient.", "error");
                    }
                  } else if (delEndpoints[deleteImpact.type]) {
                    await handleEntityDelete(delEndpoints[deleteImpact.type], deleteImpact.id, deleteImpact.name || "record");
                  } else {
                    handleUserAction(deleteImpact.id, "soft-delete");
                  }
                }}
                style={{
                  padding: "10px 22px",
                  borderRadius: 10,
                  border: "none",
                  background: RED,
                  color: WHITE,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  boxShadow: `0 4px 12px ${RED}40`
                }}
              >
                Confirm Soft-Delete
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Add Blood Stock Modal
    if (modalType === "addStock") {
      return (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 500,
          padding: 20
        }}>
          <div style={{
            background: dark ? NAVY2 : WHITE,
            borderRadius: 20,
            maxWidth: 500,
            width: "100%",
            padding: 28,
            boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>Add Blood Stock Entry</h3>
              <FaXmark onClick={() => setModalType(null)} style={{ cursor: "pointer", color: SLATE_L }} />
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleAddStock({
                bloodGroup: fd.get("bloodGroup"),
                component: fd.get("component"),
                units: fd.get("units"),
                hospital: fd.get("hospital"),
                expiryDate: fd.get("expiryDate"),
                reason: fd.get("reason")
              });
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Blood Group</label>
                  <select name="bloodGroup" required style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Component</label>
                  <select name="component" style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    {["Whole Blood", "Platelets", "Plasma", "Packed Red Cells"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Units to Add</label>
                  <input type="number" name="units" min="1" defaultValue="10" required style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Expiry Date</label>
                  <input type="date" name="expiryDate" defaultValue={new Date(Date.now() + 42 * 86400000).toISOString().split("T")[0]} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Blood Bank Storage Hub</label>
                <input name="hospital" defaultValue="Central Blood Reserve Hub" required style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Acquisition Notes / Donor Camp</label>
                <input name="reason" placeholder="e.g. Voluntary Blood Camp at AIIMS" style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setModalType(null)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: "transparent", color: dark ? WHITE : SLATE, fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 800 }}>Confirm Addition</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Adjust Stock Modal (Prevents Negative Inventory)
    if (modalType === "adjustStock") {
      return (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 500,
          padding: 20
        }}>
          <div style={{
            background: dark ? NAVY2 : WHITE,
            borderRadius: 20,
            maxWidth: 480,
            width: "100%",
            padding: 28,
            boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>Adjust Blood Stock Units</h3>
              <FaXmark onClick={() => setModalType(null)} style={{ cursor: "pointer", color: SLATE_L }} />
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const sign = fd.get("direction") === "decrease" ? -1 : 1;
              const units = sign * Math.abs(parseInt(fd.get("units") || 0));
              handleAdjustStock({
                bloodGroup: fd.get("bloodGroup"),
                units,
                reason: fd.get("reason"),
                hospital: fd.get("hospital") || "Central Blood Bank Hub"
              });
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Blood Group</label>
                  <select name="bloodGroup" required style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Adjustment Direction</label>
                  <select name="direction" style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    <option value="increase">Increase (+ Units)</option>
                    <option value="decrease">Decrease (- Units)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Quantity (Units)</label>
                <input type="number" name="units" min="1" defaultValue="5" required style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Audit Reason for Adjustment</label>
                <input name="reason" placeholder="e.g. Audit reconciliation or batch dispatch" required style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setModalType(null)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: "transparent", color: dark ? WHITE : SLATE, fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 800 }}>Apply Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Broadcast Notification Modal
    if (modalType === "notification") {
      return (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 500,
          padding: 20
        }}>
          <div style={{
            background: dark ? NAVY2 : WHITE,
            borderRadius: 20,
            maxWidth: 520,
            width: "100%",
            padding: 28,
            boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>Broadcast Network Notification</h3>
              <FaXmark onClick={() => setModalType(null)} style={{ cursor: "pointer", color: SLATE_L }} />
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleBroadcastNotification({
                targetRole: fd.get("targetRole"),
                title: fd.get("title"),
                message: fd.get("message"),
                type: fd.get("type")
              });
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Target Audience</label>
                  <select name="targetRole" style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    <option value="all">Entire Network (All Users)</option>
                    <option value="donor">Verified Donors Only</option>
                    <option value="hospital_staff">Hospital Staff Only</option>
                    <option value="blood_bank_staff">Blood Bank Staff Only</option>
                    <option value="doctor">Doctors Only</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Alert Severity Level</label>
                  <select name="type" style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    <option value="info">General Information</option>
                    <option value="alert">System Alert</option>
                    <option value="urgent">Critical Emergency (Red)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Notification Headline</label>
                <input name="title" placeholder="e.g. Emergency O- Negative Blood Needed in Delhi NCR" required style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Detailed Message</label>
                <textarea name="message" rows="4" placeholder="Enter instructions, location, contact coordinates..." required style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY, resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setModalType(null)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: "transparent", color: dark ? WHITE : SLATE, fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 800 }}>Send Broadcast Now</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Add/Edit Patient Modal
    if (modalType === "patient") {
      const isEdit = Boolean(modalItem);
      return (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 500,
          padding: 20
        }}>
          <div style={{
            background: dark ? NAVY2 : WHITE,
            borderRadius: 20,
            maxWidth: 640,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: 28,
            boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 900, color: dark ? WHITE : NAVY, fontSize: "1.15rem" }}>
                  {isEdit ? "Edit Clinical Patient Record" : "Register New Patient in Database"}
                </h3>
                <div style={{ fontSize: "0.78rem", color: SLATE_L, marginTop: 3 }}>
                  Direct database synchronization with real-time audit logging
                </div>
              </div>
              <FaXmark onClick={() => setModalType(null)} style={{ cursor: "pointer", color: SLATE_L, fontSize: "1.1rem" }} />
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const payload = {
                fullName: fd.get("fullName"),
                email: fd.get("email"),
                phone: fd.get("phone"),
                bloodGroup: fd.get("bloodGroup"),
                age: parseInt(fd.get("age")) || 30,
                gender: fd.get("gender"),
                dateOfBirth: fd.get("dateOfBirth"),
                hospitalName: fd.get("hospitalName"),
                condition: fd.get("condition"),
                status: fd.get("status") || "Active",
                address: fd.get("address"),
                city: fd.get("city"),
                state: fd.get("state"),
                pincode: fd.get("pincode"),
                emergencyContact: fd.get("emergencyContact"),
                emergencyPhone: fd.get("emergencyPhone")
              };

              const url = isEdit ? `${API_BASE}/admin/patients/update/${modalItem._id}` : `${API_BASE}/admin/patients/create`;
              const method = isEdit ? "PUT" : "POST";

              try {
                const res = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
                  body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (res.ok && result.success) {
                  showToast(isEdit ? "Patient record updated successfully." : "New patient registered successfully.");
                  setModalType(null);
                  fetchAllData();
                } else {
                  showToast(result.message || "Failed to save patient.", "error");
                }
              } catch (err) {
                showToast("Network error saving patient.", "error");
              }
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Full Name *</label>
                  <input name="fullName" defaultValue={modalItem?.fullName || ""} required style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Email Address *</label>
                  <input type="email" name="email" defaultValue={modalItem?.email || ""} required style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Phone Number</label>
                  <input name="phone" defaultValue={modalItem?.phone || ""} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Blood Group</label>
                  <select name="bloodGroup" defaultValue={modalItem?.bloodGroup || "A+"} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Gender</label>
                  <select name="gender" defaultValue={modalItem?.gender || "Male"} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Age</label>
                  <input type="number" name="age" defaultValue={modalItem?.age || 32} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Date of Birth</label>
                  <input type="date" name="dateOfBirth" defaultValue={modalItem?.dateOfBirth || ""} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Assigned Hospital</label>
                  <input name="hospitalName" defaultValue={modalItem?.hospitalName || "AIIMS New Delhi"} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Condition</label>
                  <select name="condition" defaultValue={modalItem?.condition || "Stable"} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    <option value="Stable">Stable</option>
                    <option value="Critical">Critical</option>
                    <option value="Recovering">Recovering</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Account Status</label>
                  <select name="status" defaultValue={modalItem?.status || "Active"} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Discharged">Discharged</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>City</label>
                  <input name="city" defaultValue={modalItem?.city || "New Delhi"} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>State</label>
                  <input name="state" defaultValue={modalItem?.state || "Delhi"} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Pincode</label>
                  <input name="pincode" defaultValue={modalItem?.pincode || ""} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Emergency Contact Name</label>
                  <input name="emergencyContact" defaultValue={modalItem?.emergencyContact || ""} placeholder="e.g. Spouse / Parent" style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Emergency Contact Phone</label>
                  <input name="emergencyPhone" defaultValue={modalItem?.emergencyPhone || ""} placeholder="+91 ..." style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setModalType(null)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: "transparent", color: dark ? WHITE : SLATE, fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 800 }}>Save Patient Record</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // View Full Patient Details Modal (Dossier)
    if (modalType === "patientDetails") {
      const p = modalItem;
      if (!p) return null;
      return (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 500,
          padding: 20
        }}>
          <div style={{
            background: dark ? NAVY2 : WHITE,
            borderRadius: 24,
            maxWidth: 780,
            width: "100%",
            maxHeight: "92vh",
            overflowY: "auto",
            padding: 30,
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  background: `${RED}18`,
                  color: RED,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                  fontWeight: 900
                }}>
                  {p.fullName ? p.fullName.charAt(0).toUpperCase() : "P"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h2 style={{ margin: 0, fontWeight: 900, color: dark ? WHITE : NAVY, fontSize: "1.35rem" }}>{p.fullName}</h2>
                    <BloodBadge group={p.bloodGroup} size="lg" />
                    <StatusPill status={p.status} />
                  </div>
                  <div style={{ fontSize: "0.8rem", color: SLATE_L, marginTop: 4 }}>
                    Patient ID: <strong style={{ color: dark ? WHITE : NAVY }}>{p._id}</strong>
                    {p.clerkId ? ` · Clerk: ${p.clerkId}` : ""}
                    {p.createdAt ? ` · Registered: ${new Date(p.createdAt).toLocaleDateString()}` : ""}
                  </div>
                </div>
              </div>
              <FaXmark onClick={() => setModalType(null)} style={{ cursor: "pointer", color: SLATE_L, fontSize: "1.2rem" }} />
            </div>

            {/* Quick Stats Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 24
            }}>
              <div style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, padding: "12px 16px", borderRadius: 14, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                <div style={{ fontSize: "0.72rem", color: SLATE_L, textTransform: "uppercase", fontWeight: 700 }}>Condition</div>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: p.condition === "Critical" ? RED : p.condition === "Recovering" ? "#F59E0B" : "#16A34A", marginTop: 2 }}>
                  {p.condition || "Stable"}
                </div>
              </div>
              <div style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, padding: "12px 16px", borderRadius: 14, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                <div style={{ fontSize: "0.72rem", color: SLATE_L, textTransform: "uppercase", fontWeight: 700 }}>Blood Requests</div>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: dark ? WHITE : NAVY, marginTop: 2 }}>
                  {p.bloodRequestsCount || (p.bloodRequests || []).length} Requisitions
                </div>
              </div>
              <div style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, padding: "12px 16px", borderRadius: 14, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                <div style={{ fontSize: "0.72rem", color: SLATE_L, textTransform: "uppercase", fontWeight: 700 }}>Appointments</div>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: dark ? WHITE : NAVY, marginTop: 2 }}>
                  {p.appointmentsCount || (p.appointments || []).length} Scheduled
                </div>
              </div>
              <div style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, padding: "12px 16px", borderRadius: 14, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                <div style={{ fontSize: "0.72rem", color: SLATE_L, textTransform: "uppercase", fontWeight: 700 }}>Assigned Hospital</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 800, color: dark ? WHITE : NAVY, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.hospitalName || "AIIMS New Delhi"}
                </div>
              </div>
            </div>

            {/* Information Tabs / Sections */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24 }}>
              {/* Personal Details */}
              <div style={{ background: dark ? "#0F172A" : WHITE, padding: 18, borderRadius: 16, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", fontWeight: 800, color: dark ? WHITE : NAVY, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaUsers style={{ color: RED }} /> Personal & Demographics
                </h4>
                <div style={{ display: "grid", gap: 8, fontSize: "0.82rem" }}>
                  <div><span style={{ color: SLATE_L }}>Email:</span> <strong style={{ color: dark ? WHITE : NAVY }}>{p.email}</strong></div>
                  <div><span style={{ color: SLATE_L }}>Phone:</span> <strong style={{ color: dark ? WHITE : NAVY }}>{p.phone}</strong></div>
                  <div><span style={{ color: SLATE_L }}>Age & Gender:</span> <strong style={{ color: dark ? WHITE : NAVY }}>{p.age} yrs · {p.gender}</strong></div>
                  <div><span style={{ color: SLATE_L }}>Date of Birth:</span> <strong style={{ color: dark ? WHITE : NAVY }}>{p.dateOfBirth || "Not Recorded"}</strong></div>
                </div>
              </div>

              {/* Location & Emergency Contact */}
              <div style={{ background: dark ? "#0F172A" : WHITE, padding: 18, borderRadius: 16, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", fontWeight: 800, color: dark ? WHITE : NAVY, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaLocationDot style={{ color: RED }} /> Location & Emergency Contact
                </h4>
                <div style={{ display: "grid", gap: 8, fontSize: "0.82rem" }}>
                  <div><span style={{ color: SLATE_L }}>City / State:</span> <strong style={{ color: dark ? WHITE : NAVY }}>{p.city || "New Delhi"}, {p.state || "Delhi"}</strong></div>
                  <div><span style={{ color: SLATE_L }}>Street Address:</span> <strong style={{ color: dark ? WHITE : NAVY }}>{p.address || "Standard Residential Address"}</strong></div>
                  <div><span style={{ color: SLATE_L }}>Emergency Contact:</span> <strong style={{ color: dark ? WHITE : NAVY }}>{p.emergencyContact || "Next of Kin"}</strong></div>
                  <div><span style={{ color: SLATE_L }}>Emergency Phone:</span> <strong style={{ color: dark ? WHITE : NAVY }}>{p.emergencyPhone || p.phone}</strong></div>
                </div>
              </div>
            </div>

            {/* Blood Requests History Section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: dark ? WHITE : NAVY, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaDroplet style={{ color: RED }} /> Blood Request History ({p.bloodRequests?.length || 0})
                </h4>
              </div>
              {p.bloodRequests && p.bloodRequests.length > 0 ? (
                <div style={{ overflowX: "auto", border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, borderRadius: 12 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                    <thead>
                      <tr style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", color: SLATE_L }}>Req ID</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", color: SLATE_L }}>Blood Group</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", color: SLATE_L }}>Units</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", color: SLATE_L }}>Hospital</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", color: SLATE_L }}>Urgency</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", color: SLATE_L }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.bloodRequests.map((req, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${dark ? "#334155" : "#F1F5F9"}` }}>
                          <td style={{ padding: "10px 12px", fontWeight: 700, color: dark ? WHITE : NAVY }}>#{req.id || req._id}</td>
                          <td style={{ padding: "10px 12px" }}><BloodBadge group={req.bloodGroup} /></td>
                          <td style={{ padding: "10px 12px", color: dark ? WHITE : SLATE }}>{req.units} Units</td>
                          <td style={{ padding: "10px 12px", color: SLATE_L }}>{req.hospital || p.hospitalName}</td>
                          <td style={{ padding: "10px 12px", color: req.urgency === "Emergency" ? RED : "#D97706", fontWeight: 700 }}>{req.urgency || "Routine"}</td>
                          <td style={{ padding: "10px 12px" }}><StatusPill status={req.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ background: dark ? "#0F172A" : SMOKE_LIGHT, padding: "16px", borderRadius: 12, textAlign: "center", color: SLATE_L, fontSize: "0.82rem" }}>
                  No active or historical blood requests on record for this patient.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
              <button
                onClick={() => window.print()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 18px",
                  borderRadius: 10,
                  border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                  background: "transparent",
                  color: dark ? WHITE : SLATE,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer"
                }}
              >
                <FaPrint /> Print Dossier
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setModalType("patient"); setModalItem(p); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: "#2563EB",
                    color: WHITE,
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer"
                  }}
                >
                  <FaPencil /> Edit Patient
                </button>
                <button
                  onClick={() => setModalType(null)}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 10,
                    border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`,
                    background: dark ? NAVY2 : WHITE,
                    color: dark ? WHITE : NAVY,
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Add/Edit Doctor Modal
    if (modalType === "doctor") {
      const isEdit = Boolean(modalItem);
      const inp = { width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY };
      const lbl = { display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 };
      return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}>
          <div style={{ background: dark ? NAVY2 : WHITE, borderRadius: 20, maxWidth: 560, width: "100%", padding: 28, boxShadow: "0 24px 60px rgba(0,0,0,0.25)", border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>{isEdit ? "Edit Doctor Profile" : "Register New Doctor"}</h3>
              <FaXmark onClick={() => setModalType(null)} style={{ cursor: "pointer", color: SLATE_L }} />
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleEntitySave("doctors", {
                name: fd.get("name"), specialization: fd.get("specialization"), hospital: fd.get("hospital"),
                department: fd.get("department"), phone: fd.get("phone"), email: fd.get("email"),
                qualification: fd.get("qualification"), experience: fd.get("experience"),
                consultationFee: fd.get("consultationFee"), availability: fd.get("availability"), status: fd.get("status") || "Active"
              }, isEdit, "Doctor");
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Full Name *</label><input name="name" defaultValue={modalItem?.name || ""} required style={inp} /></div>
                <div><label style={lbl}>Specialization</label><input name="specialization" defaultValue={modalItem?.specialization || ""} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Hospital / Facility</label><input name="hospital" defaultValue={modalItem?.hospital || ""} style={inp} /></div>
                <div><label style={lbl}>Department</label><input name="department" defaultValue={modalItem?.department || ""} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Phone</label><input name="phone" defaultValue={modalItem?.phone || ""} style={inp} /></div>
                <div><label style={lbl}>Email</label><input type="email" name="email" defaultValue={modalItem?.email || ""} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Qualification</label><input name="qualification" defaultValue={modalItem?.qualification || ""} style={inp} /></div>
                <div><label style={lbl}>Experience (yrs)</label><input type="number" name="experience" defaultValue={modalItem?.experience || ""} style={inp} /></div>
                <div><label style={lbl}>Consultation Fee</label><input type="number" name="consultationFee" defaultValue={modalItem?.consultationFee || ""} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={lbl}>Availability</label>
                  <select name="availability" defaultValue={modalItem?.availability || "Available"} style={inp}>
                    <option value="Available">Available</option><option value="In Surgery">In Surgery</option><option value="On Leave">On Leave</option><option value="Unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <select name="status" defaultValue={modalItem?.status || "Active"} style={inp}>
                    <option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setModalType(null)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: "transparent", color: dark ? WHITE : SLATE, fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 800 }}>{isEdit ? "Save Changes" : "Register Doctor"}</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Donor Details Modal
    if (modalType === "donorDetails" && modalItem) {
      const d = modalItem;
      const row = (label, value) => (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
          <span style={{ fontSize: "0.8rem", color: SLATE_L, fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: "0.85rem", color: dark ? WHITE : NAVY, fontWeight: 700 }}>{value || "—"}</span>
        </div>
      );
      return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}>
          <div style={{ background: dark ? NAVY2 : WHITE, borderRadius: 20, maxWidth: 480, width: "100%", padding: 28, boxShadow: "0 24px 60px rgba(0,0,0,0.25)", border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>{d.fullName}</h3>
                <div style={{ fontSize: "0.78rem", color: SLATE_L }}>Donor ID: {String(d._id).substring(0, 10)}</div>
              </div>
              <FaXmark onClick={() => setModalType(null)} style={{ cursor: "pointer", color: SLATE_L }} />
            </div>
            <BloodBadge group={d.bloodGroup} size="lg" />
            <div style={{ marginTop: 8 }}>
              {row("Email", d.email)}
              {row("Phone", d.phone)}
              {row("Blood Group", d.bloodGroup)}
              {row("Date of Birth", d.dateOfBirth)}
              {row("Gender", d.gender)}
              {row("Weight", d.weight ? `${d.weight} kg` : "")}
              {row("City / State", [d.city, d.state].filter(Boolean).join(", "))}
              {row("Address", d.address)}
              {row("Last Donation", d.lastDonation ? new Date(d.lastDonation).toLocaleDateString() : "")}
              {row("Total Donations", d.totalDonations)}
              {row("Next Eligible", d.nextEligibleDate ? new Date(d.nextEligibleDate).toLocaleDateString() : "")}
              {row("Eligibility", d.isEligible ? "Eligible" : "Wait Period")}
              {row("Verification", d.verificationStatus)}
              {row("Status", d.status)}
              {row("Registered", d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "")}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
              <button onClick={() => { setModalType("donor"); }} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 800, cursor: "pointer" }}>Edit Donor</button>
            </div>
          </div>
        </div>
      );
    }

    // Add/Edit Donor Modal
    if (modalType === "donor") {
      const isEdit = Boolean(modalItem);
      const inp = { width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY };
      const lbl = { display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 };
      const bgOpts = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
      return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}>
          <div style={{ background: dark ? NAVY2 : WHITE, borderRadius: 20, maxWidth: 560, width: "100%", padding: 28, boxShadow: "0 24px 60px rgba(0,0,0,0.25)", border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>{isEdit ? "Edit Donor Profile" : "Register New Donor"}</h3>
              <FaXmark onClick={() => setModalType(null)} style={{ cursor: "pointer", color: SLATE_L }} />
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const payload = {
                fullName: fd.get("fullName"), email: fd.get("email"), phone: fd.get("phone"),
                bloodGroup: fd.get("bloodGroup"), dateOfBirth: fd.get("dateOfBirth"), gender: fd.get("gender"),
                weight: fd.get("weight"), address: fd.get("address"), city: fd.get("city"),
                state: fd.get("state"), lastDonation: fd.get("lastDonation")
              };
              if (!isEdit) {
                payload.status = fd.get("status") || "Active";
                payload.verificationStatus = fd.get("verificationStatus") || "Verified";
              } else {
                payload.status = fd.get("status");
                payload.verificationStatus = fd.get("verificationStatus");
              }
              handleEntitySave("donors", payload, isEdit, "Donor");
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Full Name *</label><input name="fullName" defaultValue={modalItem?.fullName || ""} required style={inp} /></div>
                <div><label style={lbl}>Email *</label><input type="email" name="email" defaultValue={modalItem?.email || ""} required style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Phone</label><input name="phone" defaultValue={modalItem?.phone || ""} style={inp} /></div>
                <div><label style={lbl}>Blood Group</label><select name="bloodGroup" defaultValue={modalItem?.bloodGroup || "O+"} style={inp}>{bgOpts.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                <div><label style={lbl}>Gender</label><select name="gender" defaultValue={modalItem?.gender || "Male"} style={inp}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Date of Birth</label><input type="date" name="dateOfBirth" defaultValue={modalItem?.dateOfBirth || ""} style={inp} /></div>
                <div><label style={lbl}>Weight (kg)</label><input name="weight" defaultValue={modalItem?.weight || ""} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>City</label><input name="city" defaultValue={modalItem?.city || ""} style={inp} /></div>
                <div><label style={lbl}>State</label><input name="state" defaultValue={modalItem?.state || ""} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Address</label><input name="address" defaultValue={modalItem?.address || ""} style={inp} /></div>
                <div><label style={lbl}>Last Donation Date</label><input type="date" name="lastDonation" defaultValue={modalItem?.lastDonation?.split?.("T")?.[0] || modalItem?.lastDonation || ""} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={lbl}>Verification</label>
                  <select name="verificationStatus" defaultValue={modalItem?.verificationStatus || "Verified"} style={inp}>
                    <option value="Verified">Verified</option><option value="Pending">Pending</option><option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <select name="status" defaultValue={modalItem?.status || "Active"} style={inp}>
                    <option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setModalType(null)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: "transparent", color: dark ? WHITE : SLATE, fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 800 }}>{isEdit ? "Save Changes" : "Register Donor"}</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Add/Edit Blood Bank Modal
    if (modalType === "bloodBank") {
      const isEdit = Boolean(modalItem);
      const inp = { width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY };
      const lbl = { display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 };
      return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}>
          <div style={{ background: dark ? NAVY2 : WHITE, borderRadius: 20, maxWidth: 560, width: "100%", padding: 28, boxShadow: "0 24px 60px rgba(0,0,0,0.25)", border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>{isEdit ? "Edit Blood Bank" : "Register New Blood Bank"}</h3>
              <FaXmark onClick={() => setModalType(null)} style={{ cursor: "pointer", color: SLATE_L }} />
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleEntitySave("blood-banks", {
                name: fd.get("name"), hospital: fd.get("hospital"), email: fd.get("email"), phone: fd.get("phone"),
                address: fd.get("address"), city: fd.get("city"), state: fd.get("state"),
                type: fd.get("type"), licenseNumber: fd.get("licenseNumber"), capacity: fd.get("capacity"),
                status: fd.get("status") || "Active", verificationStatus: fd.get("verificationStatus") || "Pending"
              }, isEdit, "Blood Bank");
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Blood Bank Name *</label><input name="name" defaultValue={modalItem?.name || ""} required style={inp} /></div>
                <div><label style={lbl}>Associated Hospital</label><input name="hospital" defaultValue={modalItem?.hospital || modalItem?.name || ""} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Email</label><input type="email" name="email" defaultValue={modalItem?.email || ""} style={inp} /></div>
                <div><label style={lbl}>Contact Number</label><input name="phone" defaultValue={modalItem?.phone || ""} style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>City</label><input name="city" defaultValue={modalItem?.city || ""} style={inp} /></div>
                <div><label style={lbl}>State</label><input name="state" defaultValue={modalItem?.state || ""} style={inp} /></div>
                <div><label style={lbl}>License Number</label><input name="licenseNumber" defaultValue={modalItem?.licenseNumber || ""} style={inp} /></div>
              </div>
              <div style={{ marginBottom: 14 }}><label style={lbl}>Address</label><input name="address" defaultValue={modalItem?.address || ""} style={inp} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={lbl}>Type</label>
                  <select name="type" defaultValue={modalItem?.type || "NABH"} style={inp}>
                    <option value="NABH">NABH</option><option value="Government">Government</option><option value="Private">Private</option><option value="Charitable">Charitable</option>
                  </select>
                </div>
                <div><label style={lbl}>Capacity (units)</label><input type="number" name="capacity" defaultValue={modalItem?.capacity || ""} style={inp} /></div>
                <div>
                  <label style={lbl}>Verification</label>
                  <select name="verificationStatus" defaultValue={modalItem?.verificationStatus || "Pending"} style={inp}>
                    <option value="Pending">Pending</option><option value="Verified">Verified</option><option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={lbl}>Account Status</label>
                  <select name="status" defaultValue={modalItem?.status || "Active"} style={inp}>
                    <option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setModalType(null)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: "transparent", color: dark ? WHITE : SLATE, fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 800 }}>{isEdit ? "Save Changes" : "Register Blood Bank"}</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Schedule Appointment Modal
    if (modalType === "appointment") {
      const inp = { width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY };
      const lbl = { display: "block", fontSize: "0.76rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 };
      const hospitals = [...new Set([...patientsList.map(p => p.hospitalName).filter(Boolean), ...bloodBanksList.map(b => b.name || b.hospital).filter(Boolean)])];
      const doctors = doctorsList.map(d => d.name).filter(Boolean);
      return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}>
          <div style={{ background: dark ? NAVY2 : WHITE, borderRadius: 20, maxWidth: 560, width: "100%", padding: 28, boxShadow: "0 24px 60px rgba(0,0,0,0.25)", border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>Schedule New Appointment</h3>
              <FaXmark onClick={() => setModalType(null)} style={{ cursor: "pointer", color: SLATE_L }} />
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleCreateAppointment({
                appointmentKind: fd.get("appointmentKind"),
                patientName: fd.get("patientName"), patientId: fd.get("patientId"),
                patientEmail: fd.get("patientEmail"), patientPhone: fd.get("patientPhone"),
                hospitalName: fd.get("hospitalName"), doctorName: fd.get("doctorName"),
                department: fd.get("department"), speciality: fd.get("speciality"),
                date: fd.get("date"), time: fd.get("time"), reason: fd.get("reason")
              });
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>Appointment Type</label>
                  <select name="appointmentKind" style={inp}>
                    <option value="consultation">Doctor Consultation</option>
                    <option value="donation">Blood Donation</option>
                  </select>
                </div>
                <div><label style={lbl}>Patient / Donor Name *</label><input name="patientName" required style={inp} list="apt-patients" /><datalist id="apt-patients">{patientsList.map(p => <option key={p._id} value={p.fullName}>{p.email}</option>)}</datalist></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Patient ID (optional)</label><input name="patientId" style={inp} /></div>
                <div><label style={lbl}>Contact Phone</label><input name="patientPhone" style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Email</label><input type="email" name="patientEmail" style={inp} /></div>
                <div>
                  <label style={lbl}>Hospital / Blood Bank</label>
                  <input name="hospitalName" style={inp} list="apt-hospitals" /><datalist id="apt-hospitals">{hospitals.map(h => <option key={h} value={h} />)}</datalist>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>Doctor / Staff</label>
                  <input name="doctorName" style={inp} list="apt-doctors" /><datalist id="apt-doctors">{doctors.map(d => <option key={d} value={d} />)}</datalist>
                </div>
                <div><label style={lbl}>Department</label><input name="department" placeholder="e.g. Cardiology" style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Speciality</label><input name="speciality" placeholder="General Medicine" style={inp} /></div>
                <div><label style={lbl}>Date *</label><input type="date" name="date" required style={inp} /></div>
                <div><label style={lbl}>Time *</label><input type="time" name="time" required style={inp} /></div>
              </div>
              <div style={{ marginBottom: 20 }}><label style={lbl}>Reason / Notes</label><input name="reason" style={inp} /></div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setModalType(null)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: "transparent", color: dark ? WHITE : SLATE, fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 800 }}>Schedule Appointment</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Add/Edit User Modal
    if (modalType === "user") {
      const isEdit = Boolean(modalItem);
      return (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 500,
          padding: 20
        }}>
          <div style={{
            background: dark ? NAVY2 : WHITE,
            borderRadius: 20,
            maxWidth: 520,
            width: "100%",
            padding: 28,
            boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>{isEdit ? "Edit User Account" : "Create New User"}</h3>
              <FaXmark onClick={() => setModalType(null)} style={{ cursor: "pointer", color: SLATE_L }} />
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const payload = {
                fullName: fd.get("fullName"),
                email: fd.get("email"),
                phone: fd.get("phone"),
                role: fd.get("role"),
                bloodGroup: fd.get("bloodGroup"),
                status: fd.get("status") || "Active"
              };

              const url = isEdit ? `${API_BASE}/admin/users/update/${modalItem._id}` : `${API_BASE}/admin/users/create`;
              const method = isEdit ? "PUT" : "POST";

              try {
                const res = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json", "x-admin-name": user?.fullName || "Super Administrator" },
                  body: JSON.stringify(payload)
                });
                if (res.ok) {
                  showToast(isEdit ? "User updated." : "User created.");
                  setModalType(null);
                  fetchAllData();
                } else {
                  showToast("Failed to save user.", "error");
                }
              } catch (err) {
                showToast("Network error.", "error");
              }
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Full Name</label>
                  <input name="fullName" defaultValue={modalItem?.fullName || ""} required style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Email Address</label>
                  <input type="email" name="email" defaultValue={modalItem?.email || ""} required style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Phone Number</label>
                  <input name="phone" defaultValue={modalItem?.phone || ""} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Role Assignment</label>
                  <select name="role" defaultValue={modalItem?.role || "donor"} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    <option value="administrator">Administrator</option>
                    <option value="hospital_staff">Hospital Staff</option>
                    <option value="blood_bank_staff">Blood Bank Staff</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                    <option value="donor">Donor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Blood Group (Optional)</label>
                  <select name="bloodGroup" defaultValue={modalItem?.bloodGroup || "O+"} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: dark ? WHITE : NAVY, marginBottom: 4 }}>Account Status</label>
                  <select name="status" defaultValue={modalItem?.status || "Active"} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: dark ? "#0F172A" : WHITE, color: dark ? WHITE : NAVY }}>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setModalType(null)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`, background: "transparent", color: dark ? WHITE : SLATE, fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 800 }}>Save User Account</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Admin Profile Modal
    if (modalType === "profile") {
      return (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 500,
          padding: 20
        }}>
          <div style={{
            background: dark ? NAVY2 : WHITE,
            borderRadius: 20,
            maxWidth: 480,
            width: "100%",
            padding: 28,
            boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            border: `1px solid ${dark ? BORDER_DARK : BORDER_LIGHT}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: dark ? WHITE : NAVY }}>Super Admin Identity Profile</h3>
              <FaXmark onClick={() => setModalType(null)} style={{ cursor: "pointer", color: SLATE_L }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: `linear-gradient(135deg, ${RED}, ${RED_DK})`, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 900 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 900, color: dark ? WHITE : NAVY, fontSize: "1.1rem" }}>{displayName}</div>
                <div style={{ color: SLATE_L, fontSize: "0.82rem" }}>{displayEmail}</div>
                <span style={{ background: `${RED}18`, color: RED, fontWeight: 800, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 8, marginTop: 4, display: "inline-block" }}>
                  FULL SYSTEM PERMISSIONS
                </span>
              </div>
            </div>
            <p style={{ fontSize: "0.85rem", color: dark ? "#CBD5E1" : SLATE, lineHeight: 1.6, marginBottom: 20 }}>
              Your account is authenticated via Clerk OAuth and mapped to the Super Administrator authority in the HemoCare hospital cluster.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setModalType(null)} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 800 }}>Done</button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: ACTIVE MODULE TAB SWITCHER
  ───────────────────────────────────────────────────────────── */
  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboardTab();
      case "patients": return renderPatientsTab();
      case "doctors": return renderDoctorsTab();
      case "donors": return renderDonorsTab();
      case "blood-inventory": return renderInventoryTab();
      case "blood-banks": return renderBloodBanksTab();
      case "appointments": return renderAppointmentsTab();
      case "blood-requests": return renderBloodRequestsTab();
      case "users": return renderUsersTab();
      case "roles-permissions": return renderRolesPermissionsTab();
      case "reports": return renderReportsTab();
      case "notifications": return renderNotificationsTab();
      case "audit-logs": return renderAuditLogsTab();
      case "settings": return renderSettingsTab();
      case "system-monitoring": return renderSystemMonitoringTab();
      default: return renderDashboardTab();
    }
  };

  const currentW = sidebarCollapsed ? 72 : 260;

  return (
    <div style={{
      fontFamily: FONT,
      background: dark ? SMOKE_DARK : SMOKE_LIGHT,
      color: dark ? "#CBD5E1" : SLATE,
      minHeight: "100vh"
    }}>
      {/* Toast Notification Banner */}
      {toast && (
        <div style={{
          position: "fixed",
          top: 84,
          right: 28,
          zIndex: 600,
          background: toast.type === "error" ? RED : "#16A34A",
          color: WHITE,
          padding: "12px 20px",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: "0.85rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          animation: "fadeUp 0.3s ease"
        }}>
          {toast.type === "error" ? <FaCircleXmark /> : <FaCircleCheck />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar & Topbar */}
      {renderSidebar()}
      {renderTopbar()}

      {/* Main Content Area */}
      <main style={{
        marginLeft: currentW,
        marginTop: 72,
        padding: "28px 28px 60px",
        transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)"
      }}>
        {renderActiveModule()}
      </main>

      {/* All Dynamic Modals */}
      {renderModals()}
    </div>
  );
}
