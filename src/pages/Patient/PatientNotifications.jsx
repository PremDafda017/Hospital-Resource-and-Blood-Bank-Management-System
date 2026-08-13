import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaCheck,
  FaTrash,
  FaFilter,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaHeartPulse,
  FaFileMedical,
  FaCalendarDays,
  FaMapLocationDot,
  FaUser,
  FaDroplet,
  FaHouse,
} from "react-icons/fa6";

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

function PatientNotifications() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  const nav = [
    { key:"patient-dashboard", icon:<FaChartLine/>, label:"Dashboard", path:"/patient-dashboard" },
    { key:"appointments", icon:<FaCalendarDays/>, label:"Appointments", path:"/appointments" },
    { key:"blood-requests", icon:<FaHeartPulse/>, label:"My Blood Requests", path:"/blood-requests" },
    { key:"my-appointments", icon:<FaCalendarDays/>, label:"My Appointments", path:"/my-appointments" },
    { key:"blood-banks", icon:<FaMapLocationDot/>, label:"Nearby Blood Banks", path:"/nearby-blood-banks" },
    { key:"notifications", icon:<FaBell/>, label:"Notifications", path:"/notifications" },
    { key:"my-reports", icon:<FaFileMedical/>, label:"My Reports", path:"/my-reports" },
    { key:"profile", icon:<FaUser/>, label:"My Profile", path:"/profile" },
  ];

  const active = "notifications";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    if (user?.id) {
      // Load notifications from MongoDB
      const loadNotifications = async () => {
        try {
          const email = user?.emailAddresses?.[0]?.emailAddress;
          const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}?email=${email}`);
          if (response.ok) {
            const data = await response.json();
            setNotifications(data.notifications || []);
          }
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
        setLoading(false);
      };
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredNotifications = filterType === "all" ? notifications : notifications.filter(n => n.category === filterType);

  const markAsRead = async (id) => {
    const updatedNotifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updatedNotifications);
    
    if (user?.id) {
      try {
        const notification = updatedNotifications.find(n => n.id === id);
        const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}/notifications/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notification }),
        });
        
        if (response.ok) {
          // Reload notifications from MongoDB
          const email = user?.emailAddresses?.[0]?.emailAddress;
          const reloadResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}?email=${email}`);
          if (reloadResponse.ok) {
            const reloadData = await reloadResponse.json();
            setNotifications(reloadData.notifications || []);
          }
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    
    if (user?.id) {
      try {
        // Update each notification individually
        for (const notification of updatedNotifications) {
          await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}/notifications/${notification.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notification }),
          });
        }
        
        // Reload notifications from MongoDB
        const email = user?.emailAddresses?.[0]?.emailAddress;
        const reloadResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}?email=${email}`);
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json();
          setNotifications(reloadData.notifications || []);
        }
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  const deleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      // Delete from MongoDB
      try {
        const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}/notifications/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Reload notifications from MongoDB
          const email = user?.emailAddresses?.[0]?.emailAddress;
          const reloadResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}?email=${email}`);
          if (reloadResponse.ok) {
            const reloadData = await reloadResponse.json();
            setNotifications(reloadData.notifications || []);
          }
        } else {
          alert('Failed to delete notification. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Failed to delete notification. Please try again.');
      }
    }
  };

  const TypeBadge = ({ type }) => {
    const colors = {
      "success": "#16A34A",
      "reminder": "#F59E0B",
      "info": "#2563EB",
      "urgent": "#DC2626",
    };
    const icons = {
      "success": "✅",
      "reminder": "📅",
      "info": "ℹ️",
      "urgent": "🚨",
    };
    return (
      <span style={{
        padding: "4px 10px",
        borderRadius: 6,
        background: `${colors[type] || "#64748B"}15`,
        color: colors[type] || "#64748B",
        fontSize: "0.75rem",
        fontWeight: 600,
      }}>
        {icons[type] || "📢"} {type.charAt(0).toUpperCase() + type.slice(1)}
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading your notifications...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:FONT }}>
      {/* Sidebar */}
      <aside style={{
        width:w, background:SIDEBAR_COL, color:WHITE,
        display:"flex", flexDirection:"column", transition:"width 0.3s ease",
        position:"fixed", height:"100vh", zIndex:1000
      }}>
        <div style={{
          padding: sidebarCollapsed ? "0 16px" : "0 24px",
          height:64, display:"flex", alignItems:"center", justifyContent:"space-between",
          borderBottom:"1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            color:WHITE, fontWeight:700, fontSize:"1.1rem"
          }}>
            <FaDroplet style={{ color:RED, fontSize:"1.4rem" }} />
            {!sidebarCollapsed && <span>Patient Portal</span>}
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

        <div style={{ padding:"16px 12px", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
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
              fontSize:"0.9rem",
              transition:"all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize:"1.1rem" }}><FaRightFromBracket /></span>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft:w, flex:1, minHeight:"100vh", background:SMOKE }}>
        <div style={{ padding:"24px 32px" }}>
          {/* Header */}
          <div style={{ marginBottom:32, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <h1 style={{ fontSize:"1.8rem", fontWeight:800, color:NAVY2, margin:"0 0 8px 0" }}>
                Notifications
              </h1>
              <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
                View your notifications
              </p>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding:"0" }}>
            {filteredNotifications.length === 0 ? (
              <div style={{ textAlign:"center", padding:"48px", color:SLATE_L }}>
                <FaBell style={{ fontSize:48, marginBottom:16 }} />
                <h3 style={{ fontSize:"1.2rem", fontWeight:600, color:NAVY2, margin:"0 0 8px 0" }}>
                  No Notifications
                </h3>
                <p>You don't have any notifications yet.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding:"24px", display:"flex", alignItems:"flex-start", gap:16 }}>
                    <div style={{ width:48, height:48, borderRadius:10, background:`${RED}15`, display:"flex", alignItems:"center", justifyContent:"center", color:RED, fontSize:"1.2rem" }}>
                      <FaBell />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                        <h3 style={{ fontSize:"1rem", fontWeight:700, color:NAVY2, margin:0 }}>{notification.title}</h3>
                        <TypeBadge type={notification.category || "info"} />
                      </div>
                      <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 12px" }}>{notification.message}</p>
                      <div style={{ fontSize:"0.8rem", color:SLATE_L, marginBottom:12 }}>
                        {notification.date || notification.createdAt ? new Date(notification.date || notification.createdAt).toLocaleString() : new Date().toLocaleString()}
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            style={{
                              background:SMOKE,
                              color:NAVY2,
                              border:`1px solid ${BORDER}`,
                              padding:"6px 12px",
                              borderRadius:6,
                              fontSize:"0.85rem",
                              fontWeight:600,
                              cursor:"pointer",
                              display:"flex",
                              alignItems:"center",
                              gap:4
                            }}
                          >
                            <FaCheck /> Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          style={{
                            background:WHITE,
                            color:RED,
                            border:`1px solid ${BORDER}`,
                            padding:"6px 12px",
                            borderRadius:6,
                            fontSize:"0.85rem",
                            fontWeight:600,
                            cursor:"pointer",
                            display:"flex",
                            alignItems:"center",
                            gap:4
                          }}
                        >
                          <FaTrash /> Delete
                        </button>
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

export default PatientNotifications;
