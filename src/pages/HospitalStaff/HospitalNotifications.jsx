import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FaHeartPulse,
  FaFileMedical,
  FaCalendarDays,
  FaMapLocationDot,
  FaBell,
  FaUser,
  FaDroplet,
  FaPlus,
  FaArrowRight,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaHouse,
  FaUsers,
  FaStethoscope,
  FaMagnifyingGlass,
  FaCheck,
  FaTrash,
} from "react-icons/fa6";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const RED_DK = "#8B0000";
const RED_GL = "rgba(196,18,48,0.12)";
const NAVY = "#0F172A";
const NAVY2 = "#1E293B";
const SLATE = "#334155";
const SLATE_L = "#64748B";
const BORDER = "#E2E8F0";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";
const SIDEBAR_W = 260;
const SIDEBAR_COL = NAVY;

function HospitalNotifications() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const nav = [
    { key:"hospital-dashboard", icon:<FaChartLine/>, label:"Dashboard", path:"/hospital-dashboard" },
    { key:"hospital-patients", icon:<FaUsers/>, label:"Patients", path:"/hospital-patients" },
    { key:"hospital-doctors", icon:<FaStethoscope/>, label:"Doctors", path:"/hospital-doctors" },
    { key:"hospital-appointments", icon:<FaCalendarDays/>, label:"Appointments", path:"/hospital-appointments" },
    { key:"hospital-blood-requests", icon:<FaHeartPulse/>, label:"Blood Requests", path:"/hospital-blood-requests" },
    { key:"hospital-blood-inventory", icon:<FaDroplet/>, label:"Blood Inventory", path:"/hospital-blood-inventory" },
    { key:"hospital-reports", icon:<FaFileMedical/>, label:"Reports", path:"/hospital-reports" },
    { key:"hospital-notifications", icon:<FaBell/>, label:"Notifications", path:"/hospital-notifications" },
  ];

  const active = "hospital-notifications";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    // Load hospital notifications from localStorage or create sample
    const loadNotifications = async () => {
      try {
        const savedNotifications = JSON.parse(localStorage.getItem('hospitalNotifications') || '[]');
        if (savedNotifications.length === 0) {
          // Create sample notifications
          const sampleNotifications = [
            {
              id: 1,
              title: "New Blood Request",
              message: "Patient John Doe has requested 2 units of A+ blood",
              type: "urgent",
              read: false,
              date: new Date().toISOString()
            },
            {
              id: 2,
              title: "Appointment Scheduled",
              message: "New appointment scheduled for tomorrow at 10:00 AM",
              type: "info",
              read: false,
              date: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 3,
              title: "Inventory Alert",
              message: "O- blood group is running low (3 units remaining)",
              type: "warning",
              read: true,
              date: new Date(Date.now() - 7200000).toISOString()
            }
          ];
          localStorage.setItem('hospitalNotifications', JSON.stringify(sampleNotifications));
          setNotifications(sampleNotifications);
        } else {
          setNotifications(savedNotifications);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      }
      setLoading(false);
    };
    loadNotifications();
  }, []);

  const filteredNotifications = notifications.filter(notif => 
    notif.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notif.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updatedNotifications);
    localStorage.setItem('hospitalNotifications', JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('hospitalNotifications', JSON.stringify(updatedNotifications));
  };

  const deleteNotification = (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      const updatedNotifications = notifications.filter(n => n.id !== id);
      setNotifications(updatedNotifications);
      localStorage.setItem('hospitalNotifications', JSON.stringify(updatedNotifications));
    }
  };

  const TypeBadge = ({ type }) => {
    const colors = {
      "urgent": "#FEE2E2",
      "warning": "#FEF3C7",
      "info": "#DBEAFE",
      "success": "#DCFCE7"
    };
    const textColors = {
      "urgent": "#DC2626",
      "warning": "#D97706",
      "info": "#2563EB",
      "success": "#16A34A"
    };
    return (
      <span style={{
        padding:"4px 12px",
        borderRadius:12,
        fontSize:"0.75rem",
        fontWeight:600,
        background:colors[type] || "#F3F4F6",
        color:textColors[type] || "#6B7280"
      }}>
        {type}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: SMOKE,
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
    <div style={{ fontFamily: FONT, background: SMOKE, minHeight: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{
        width:w, minHeight:"100vh", background:SIDEBAR_COL,
        position:"fixed", top:0, left:0, zIndex:200,
        display:"flex", flexDirection:"column",
        transition:"width 0.3s ease"
      }}>
        <div style={{
          height:64, borderBottom:`1px solid rgba(255,255,255,0.1)`,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding: sidebarCollapsed ? "0 16px" : "0 24px"
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            color:WHITE, fontWeight:700, fontSize:"1.1rem"
          }}>
            <FaDroplet style={{ color:RED, fontSize:"1.4rem" }} />
            {!sidebarCollapsed && <span>Hospital Staff</span>}
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
            background:"none", border:"none", color:WHITE,
            cursor:"pointer", padding:4, borderRadius:4
          }}>
            <FaBars />
          </button>
        </div>

        <nav style={{ flex:1, padding:"16px 12px", overflowY:"auto" }}>
          {nav.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              style={{
                width:"100%",
                display:"flex",
                alignItems:"center",
                gap:12,
                padding:"12px 16px",
                borderRadius:8,
                border:"none",
                background: active === item.key ? RED : "transparent",
                color:WHITE,
                cursor:"pointer",
                marginBottom:4,
                transition:"all 0.2s",
                fontSize: "0.9rem"
              }}
              onMouseEnter={e => {
                if (active !== item.key) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={e => {
                if (active !== item.key) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize:"1.1rem", minWidth:20 }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding:"16px 12px", borderTop:`1px solid rgba(255,255,255,0.1)` }}>
          <SignOutButton>
            <button style={{
              width:"100%",
              display:"flex",
              alignItems:"center",
              gap:12,
              padding:"12px 16px",
              borderRadius:8,
              border:"none",
              background:"transparent",
              color:WHITE,
              cursor:"pointer",
              transition:"all 0.2s",
              fontSize: "0.9rem"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize:"1.1rem", minWidth:20 }}><FaRightFromBracket /></span>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft:w, flex:1, minHeight:"100vh" }}>
        <div style={{ padding:"24px 32px" }}>
          <div style={{ marginBottom:32, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <h1 style={{ fontSize:"1.8rem", fontWeight:800, color:NAVY2, margin:"0 0 8px 0" }}>
                Hospital Notifications
              </h1>
              <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
                Manage hospital notifications and alerts
              </p>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <div style={{
                background:WHITE,
                border:`1px solid ${BORDER}`,
                borderRadius:8,
                padding:"8px 16px",
                display:"flex",
                alignItems:"center",
                gap:8
              }}>
                <FaMagnifyingGlass style={{ color:SLATE_L }} />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border:"none",
                    outline:"none",
                    fontSize:"0.9rem",
                    width:200
                  }}
                />
              </div>
              <button
                onClick={markAllAsRead}
                style={{
                  background:WHITE,
                  border:`1px solid ${BORDER}`,
                  padding:"8px 16px",
                  borderRadius:6,
                  cursor:"pointer",
                  fontSize:"0.85rem",
                  fontWeight:600,
                  display:"flex",
                  alignItems:"center",
                  gap:6,
                  color:NAVY2
                }}
              >
                <FaCheck /> Mark All Read
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>All Notifications ({filteredNotifications.length})</h2>
              <span style={{ fontSize:"0.85rem", color:SLATE_L }}>
                {notifications.filter(n => !n.read).length} unread
              </span>
            </div>
            {filteredNotifications.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:SLATE_L }}>
                <FaBell style={{ fontSize:"3rem", marginBottom:16, opacity:0.3 }} />
                <p style={{ fontSize:"1rem", marginBottom:16 }}>No notifications found</p>
              </div>
            ) : (
              <div>
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding:"20px 24px",
                      borderBottom:`1px solid ${BORDER}`,
                      background:notif.read ? WHITE : "#F8FAFC",
                      transition:"background 0.2s",
                      display:"flex",
                      alignItems:"flex-start",
                      gap:16
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                    onMouseLeave={e => e.currentTarget.style.background = notif.read ? WHITE : "#F8FAFC"}
                  >
                    <div style={{
                      width:40,
                      height:40,
                      borderRadius:8,
                      background:notif.read ? "#E2E8F0" : RED,
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      color:notif.read ? SLATE_L : WHITE,
                      fontSize:"1.1rem",
                      flexShrink:0
                    }}>
                      <FaBell />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                        <h3 style={{ fontSize:"1rem", fontWeight:700, color:NAVY2, margin:0 }}>{notif.title}</h3>
                        <TypeBadge type={notif.type} />
                      </div>
                      <p style={{ fontSize:"0.9rem", color:SLATE, margin:"0 0 8px 0" }}>{notif.message}</p>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontSize:"0.8rem", color:SLATE_L }}>
                          {new Date(notif.date).toLocaleString()}
                        </span>
                        <div style={{ display:"flex", gap:8 }}>
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              style={{
                                background:WHITE,
                                border:`1px solid ${BORDER}`,
                                padding:"4px 12px",
                                borderRadius:6,
                                cursor:"pointer",
                                fontSize:"0.8rem",
                                color:NAVY2,
                                display:"flex",
                                alignItems:"center",
                                gap:4
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                              onMouseLeave={e => e.currentTarget.style.background = WHITE}
                            >
                              <FaCheck /> Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            style={{
                              background:WHITE,
                              border:`1px solid ${BORDER}`,
                              padding:"4px 12px",
                              borderRadius:6,
                              cursor:"pointer",
                              fontSize:"0.8rem",
                              color:"#DC2626",
                              display:"flex",
                              alignItems:"center",
                              gap:4
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                            onMouseLeave={e => e.currentTarget.style.background = WHITE}
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default HospitalNotifications;
