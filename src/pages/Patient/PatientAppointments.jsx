import React, { useState } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import PatientAppointmentDashboard from "../../components/patient/PatientAppointmentDashboard";
import {
  FaCalendarDays,
  FaPlus,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaHeartPulse,
  FaFileMedical,
  FaMapLocationDot,
  FaBell,
  FaUser,
  FaDroplet,
  FaHospital,
  FaUserDoctor,
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

function PatientAppointments() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const active = "my-appointments";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  return (
    <div style={{ fontFamily: FONT, background: SMOKE, minHeight: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{
        width:w, minHeight:"100vh", background:SIDEBAR_COL,
        position:"fixed", top:0, left:0, zIndex:200,
        display:"flex", flexDirection:"column",
        transition:"width 0.3s cubic-bezier(.4,0,.2,1)",
        overflow:"hidden", boxShadow:"4px 0 30px rgba(0,0,0,0.2)"
      }}>
        {/* Logo */}
        <div style={{ padding: sidebarCollapsed ? "24px 0" : "24px 20px", display:"flex", alignItems:"center", gap:10, height:72, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${RED},${RED_DK})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", flexShrink:0, margin: sidebarCollapsed ? "0 auto" : 0 }}>🩸</div>
          {!sidebarCollapsed && <span style={{ fontWeight:900, color:WHITE, fontSize:"1.15rem", whiteSpace:"nowrap" }}>Hemo<span style={{ color:RED }}>Care</span></span>}
        </div>

        {/* Section label */}
        {!sidebarCollapsed && <div style={{ padding:"20px 20px 8px", color:"rgba(255,255,255,0.3)", fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.1em" }}>PATIENT MENU</div>}

        {/* Nav items */}
        <nav style={{ flex:1, padding: sidebarCollapsed ? "8px 6px" : "8px 12px", overflowY:"auto" }}>
          {nav.map(({ key, icon, label, path }) => {
            const isActive = active === key;
            return (
              <div key={key} onClick={() => navigate(path)}
                title={sidebarCollapsed ? label : ""}
                style={{
                  display:"flex", alignItems:"center", gap:12, padding: sidebarCollapsed ? "12px 0" : "11px 14px",
                  borderRadius:10, margin:"2px 0", cursor:"pointer",
                  background: isActive ? `linear-gradient(135deg,${RED}CC,${RED_DK})` : "transparent",
                  color: isActive ? WHITE : "rgba(255,255,255,0.55)",
                  fontWeight: isActive ? 700 : 500, fontSize:"0.88rem",
                  transition:"all 0.2s", justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  boxShadow: isActive ? `0 4px 16px ${RED}40` : "none"
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = WHITE; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isActive ? WHITE : "rgba(255,255,255,0.55)"; }}
              >
                <span style={{ fontSize:"1rem", flexShrink:0 }}>{icon}</span>
                {!sidebarCollapsed && <span>{label}</span>}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: sidebarCollapsed ? "16px 6px" : "16px 12px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <SignOutButton>
            <div
              style={{ display:"flex", alignItems:"center", gap:12, padding: sidebarCollapsed ? "12px 0" : "11px 14px", borderRadius:10, cursor:"pointer", color:"rgba(255,100,100,0.7)", fontWeight:600, fontSize:"0.88rem", transition:"all 0.2s", justifyContent: sidebarCollapsed ? "center" : "flex-start" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#FCA5A5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,100,100,0.7)"; }}
            >
              <FaRightFromBracket style={{ flexShrink:0 }}/>{!sidebarCollapsed && <span>Sign Out</span>}
            </div>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex:1, marginLeft:w, minHeight:"100vh", display:"flex", flexDirection:"column", transition:"margin-left 0.3s cubic-bezier(.4,0,.2,1)" }}>
        {/* Topbar */}
        <header style={{
          position:"sticky", top:0, height:72, zIndex:100,
          background:WHITE, borderBottom:`1px solid ${BORDER}`,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 28px", boxShadow:"0 1px 20px rgba(0,0,0,0.05)",
        }}>
          {/* Left */}
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ width:36, height:36, border:`1px solid ${BORDER}`, borderRadius:8, background:SMOKE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_L }}>
              <FaBars/>
            </button>
            <div>
              <h1 style={{ fontSize:"1.3rem", fontWeight:800, color:NAVY2, margin:0, lineHeight:1.2 }}>
                My Appointments
              </h1>
              <p style={{ fontSize:"0.8rem", color:SLATE_L, margin:"2px 0 0 0" }}>
                Manage your medical appointments
              </p>
            </div>
          </div>

          {/* Right */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button
              onClick={() => navigate("/book-appointment-wizard")}
              style={{
                display:"flex",
                alignItems:"center",
                gap:8,
                background:RED,
                color:WHITE,
                border:"none",
                borderRadius:8,
                padding:"10px 16px",
                fontSize:"0.85rem",
                fontWeight:600,
                cursor:"pointer",
                transition:"all 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = RED_DK}
              onMouseLeave={(e) => e.currentTarget.style.background = RED}
            >
              <FaPlus /> Book with Payment
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding:"32px", maxWidth:1400, margin:"0 auto" }}>
          <PatientAppointmentDashboard />
        </div>
      </div>
    </div>
  );
}

export default PatientAppointments;