import React, { useState, useEffect, useRef } from "react";
import {
  FaUsers, FaUserDoctor, FaDroplet, FaHeartPulse, FaBell,
  FaClipboardList, FaRightFromBracket, FaChartLine,
  FaGear, FaCalendarDays, FaHandHoldingMedical,
  FaSun, FaMoon, FaHospital,
  FaBars,
} from "react-icons/fa6";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────
   DESIGN TOKENS (Exact match with Dashboard.jsx)
───────────────────────────────────────────────── */
const FONT    = "'Inter','Segoe UI',system-ui,sans-serif";
const RED     = "#C41230";
const RED_DK  = "#8B0000";
const NAVY    = "#0F172A";
const SLATE   = "#334155";
const SLATE_L = "#64748B";
const BORDER  = "#E2E8F0";
const SMOKE   = "#F8FAFC";
const WHITE   = "#FFFFFF";

const SIDEBAR_W   = 260;
const SIDEBAR_COL = NAVY;

const BG_COLOR = {
  "A+":"#16A34A","A-":"#15803D","B+":"#2563EB","B-":"#1D4ED8",
  "AB+":"#7C3AED","AB-":"#6D28D9","O+":RED,"O-":RED_DK
};

/* ─────────────────────────────────────────────────
   TINY HELPERS (Exact match with Dashboard.jsx)
───────────────────────────────────────────────── */
function BloodBadge({ group, size = "sm" }) {
  const pad = size === "lg" ? "6px 14px" : "3px 9px";
  const fs  = size === "lg" ? "0.85rem" : "0.72rem";
  return (
    <span style={{ background:BG_COLOR[group]||RED, color:WHITE, fontWeight:800, fontSize:fs, padding:pad, borderRadius:20, whiteSpace:"nowrap" }}>
      {group}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    "Available"   : ["#16A34A","#DCFCE7"],
    "Low Stock"   : ["#D97706","#FEF3C7"],
    "Critical"    : [RED,"#FEE2E2"],
    "Pending"     : ["#D97706","#FEF3C7"],
    "Approved"    : ["#16A34A","#DCFCE7"],
    "Dispatched"  : ["#2563EB","#DBEAFE"],
    "Completed"   : ["#64748B","#F1F5F9"],
  };
  const [fg, bg] = map[status] || ["#64748B","#F1F5F9"];
  return (
    <span style={{ color:fg, background:bg, fontWeight:700, fontSize:"0.74rem", padding:"4px 10px", borderRadius:20, whiteSpace:"nowrap" }}>
      {status}
    </span>
  );
}

function AnimatedCounter({ target }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let n = 0;
        const step = Math.max(1, Math.ceil(target / 50));
        const t = setInterval(() => { n += step; if (n >= target) { setVal(target); clearInterval(t); } else setVal(n); }, 25);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

/* ─────────────────────────────────────────────────
   SIDEBAR (Exact match with Dashboard.jsx)
───────────────────────────────────────────────── */
function Sidebar({ active, navigate, onLogout, collapsed }) {
  const nav = [
    { key:"dashboard",       icon:<FaChartLine/>,        label:"Dashboard"       },
    { key:"patients",        icon:<FaUsers/>,            label:"Patients"        },
    { key:"doctors",         icon:<FaUserDoctor/>,       label:"Doctors"         },
    { key:"donors",          icon:<FaHandHoldingMedical/>,label:"Donors"         },
    { key:"blood-inventory", icon:<FaDroplet/>,          label:"Blood Inventory" },
    { key:"blood-banks",     icon:<FaHospital/>,         label:"Blood Banks"     },
    { key:"appointments",    icon:<FaCalendarDays/>,     label:"Appointments"    },
    { key:"settings",        icon:<FaGear/>,             label:"Settings"        },
  ];

  const w = collapsed ? 68 : SIDEBAR_W;

  return (
    <aside style={{
      width:w, minHeight:"100vh", background:SIDEBAR_COL,
      position:"fixed", top:0, left:0, zIndex:200,
      display:"flex", flexDirection:"column",
      transition:"width 0.3s cubic-bezier(.4,0,.2,1)",
      overflow:"hidden", boxShadow:"4px 0 30px rgba(0,0,0,0.2)"
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "24px 0" : "24px 20px", display:"flex", alignItems:"center", gap:10, height:72, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${RED},${RED_DK})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", flexShrink:0, margin: collapsed ? "0 auto" : 0 }}>🩸</div>
        {!collapsed && <span style={{ fontWeight:900, color:WHITE, fontSize:"1.15rem", whiteSpace:"nowrap" }}>Hemo<span style={{ color:RED }}>Care</span></span>}
      </div>

      {/* Section label */}
      {!collapsed && <div style={{ padding:"20px 20px 8px", color:"rgba(255,255,255,0.3)", fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.1em" }}>NAVIGATION</div>}

      {/* Nav items */}
      <nav style={{ flex:1, padding: collapsed ? "8px 6px" : "8px 12px", overflowY:"auto" }}>
        {nav.map(({ key, icon, label }) => {
          const isActive = active === key;
          return (
            <div key={key} onClick={() => navigate(`/${key}`)}
              title={collapsed ? label : ""}
              style={{
                display:"flex", alignItems:"center", gap:12, padding: collapsed ? "12px 0" : "11px 14px",
                borderRadius:10, margin:"2px 0", cursor:"pointer",
                background: isActive ? `linear-gradient(135deg,${RED}CC,${RED_DK})` : "transparent",
                color: isActive ? WHITE : "rgba(255,255,255,0.55)",
                fontWeight: isActive ? 700 : 500, fontSize:"0.88rem",
                transition:"all 0.2s", justifyContent: collapsed ? "center" : "flex-start",
                boxShadow: isActive ? `0 4px 16px ${RED}40` : "none"
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = WHITE; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isActive ? WHITE : "rgba(255,255,255,0.55)"; }}
            >
              <span style={{ fontSize:"1rem", flexShrink:0 }}>{icon}</span>
              {!collapsed && <span>{label}</span>}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: collapsed ? "16px 6px" : "16px 12px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div onClick={onLogout}
          style={{ display:"flex", alignItems:"center", gap:12, padding: collapsed ? "12px 0" : "11px 14px", borderRadius:10, cursor:"pointer", color:"rgba(255,100,100,0.7)", fontWeight:600, fontSize:"0.88rem", transition:"all 0.2s", justifyContent: collapsed ? "center" : "flex-start" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#FCA5A5"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,100,100,0.7)"; }}
        >
          <FaRightFromBracket style={{ flexShrink:0 }}/>{!collapsed && <span>Sign Out</span>}
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────
   TOPBAR (Exact match with Dashboard.jsx)
───────────────────────────────────────────────── */
function Topbar({ displayName, displayRole, user, profile, theme, toggleTheme, sidebarCollapsed, toggleSidebar }) {
  const navigate = useNavigate();
  const [dropdown, setDropdown] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user?.firstName ? `${user.firstName[0]}${user.lastName?.[0]||""}` : "U";

  const notifications = [
    { icon:"🚨", text:"Emergency O- request — 2 units needed", time:"2m ago", urgent:true },
    { icon:"✅", text:"Donor intake completed — A+ blood processed", time:"15m ago", urgent:false },
    { icon:"⚠️", text:"B- stock below threshold (12 units)", time:"1h ago", urgent:false },
  ];

  return (
    <header style={{
      position:"fixed", top:0, left:sidebarCollapsed?68:SIDEBAR_W, right:0, height:72,
      background:WHITE, borderBottom:`1px solid ${BORDER}`, zIndex:100,
      display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px",
      transition:"left 0.3s cubic-bezier(.4,0,.2,1)"
    }}>
      {/* Left: Toggle + Page Title placeholder */}
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <button onClick={toggleSidebar}
          style={{ width:40, height:40, borderRadius:10, border:`1px solid ${BORDER}`, background:SMOKE, color:SLATE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = BORDER; }}
          onMouseLeave={e => { e.currentTarget.style.background = SMOKE; }}
        >
          <FaBars />
        </button>
      </div>

      {/* Right: Theme + Notifs + Profile */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme}
          style={{ width:40, height:40, borderRadius:10, border:`1px solid ${BORDER}`, background:SMOKE, color:SLATE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = BORDER; }}
          onMouseLeave={e => { e.currentTarget.style.background = SMOKE; }}
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>

        {/* Notifications */}
        <div style={{ position:"relative" }}>
          <button onClick={() => setNotifOpen(!notifOpen)}
            style={{ width:40, height:40, borderRadius:10, border:`1px solid ${BORDER}`, background:SMOKE, color:SLATE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", position:"relative" }}
            onMouseEnter={e => { e.currentTarget.style.background = BORDER; }}
            onMouseLeave={e => { e.currentTarget.style.background = SMOKE; }}
          >
            <FaBell />
            <span style={{ position:"absolute", top:-2, right:-2, width:18, height:18, background:RED, color:WHITE, borderRadius:"50%", fontSize:"0.65rem", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>3</span>
          </button>

          {notifOpen && (
            <div style={{ position:"absolute", top:48, right:0, width:320, background:WHITE, borderRadius:16, border:`1px solid ${BORDER}`, boxShadow:"0 8px 32px rgba(0,0,0,0.12)", zIndex:150, maxHeight:400, overflowY:"auto" }}>
              <div style={{ padding:"16px", borderBottom:`1px solid ${BORDER}`, fontWeight:700, color:SLATE, fontSize:"0.9rem" }}>Notifications</div>
              {notifications.map((n,i) => (
                <div key={i} style={{ padding:"12px 16px", borderBottom:i<notifications.length-1?`1px solid ${BORDER}`:"none", display:"flex", gap:12, alignItems:"flex-start", cursor:"pointer", transition:"background 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = SMOKE; }}
                  onMouseLeave={e => { e.currentTarget.style.background = WHITE; }}
                >
                  <span style={{ fontSize:"1.1rem" }}>{n.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.85rem", color:SLATE, marginBottom:2 }}>{n.text}</div>
                    <div style={{ fontSize:"0.75rem", color:SLATE_L }}>{n.time}</div>
                  </div>
                  {n.urgent && <div style={{ width:8, height:8, background:RED, borderRadius:"50%", flexShrink:0 }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position:"relative" }}>
          <button onClick={() => setDropdown(!dropdown)}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 12px 6px 6px", borderRadius:12, border:`1px solid ${BORDER}`, background:SMOKE, cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = BORDER; }}
            onMouseLeave={e => { e.currentTarget.style.background = SMOKE; }}
          >
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${RED},${RED_DK})`, color:WHITE, fontWeight:700, fontSize:"0.9rem", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {initials}
            </div>
            <div style={{ textAlign:"left", lineHeight:1.2 }}>
              <div style={{ fontSize:"0.85rem", fontWeight:700, color:SLATE }}>{displayName}</div>
              <div style={{ fontSize:"0.7rem", color:SLATE_L, textTransform:"capitalize" }}>{displayRole}</div>
            </div>
          </button>

          {dropdown && (
            <div style={{ position:"absolute", top:48, right:0, width:200, background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, boxShadow:"0 8px 32px rgba(0,0,0,0.12)", zIndex:150, overflow:"hidden" }}>
              <div onClick={() => { navigate("/settings"); setDropdown(false); }}
                style={{ padding:"12px 16px", fontSize:"0.85rem", color:SLATE, cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"background 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = SMOKE; }}
                onMouseLeave={e => { e.currentTarget.style.background = WHITE; }}
              >
                <FaGear /> Settings
              </div>
              <div onClick={() => { navigate("/profile"); setDropdown(false); }}
                style={{ padding:"12px 16px", fontSize:"0.85rem", color:SLATE, cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"background 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = SMOKE; }}
                onMouseLeave={e => { e.currentTarget.style.background = WHITE; }}
              >
                👤 Profile
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────
   MAIN DASHBOARD LAYOUT COMPONENT
───────────────────────────────────────────────── */
function DashboardLayout({ children, activeTab, title, subtitle }) {
  const { isLoaded: userLoaded, user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("dashboard-theme") || "light");
  const [collapsed, setCollapsed] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("dashboard-theme", newTheme);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userLoaded || !user) return;
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/users/profile/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          localStorage.setItem("userFullName", data.fullName || "");
          localStorage.setItem("userEmail", data.email || "");
          localStorage.setItem("userRole", data.role || "donor");
        } else {
          const storedName = localStorage.getItem("userFullName");
          const storedEmail = localStorage.getItem("userEmail");
          const storedRole = localStorage.getItem("userRole");
          if (storedName || storedEmail || storedRole) {
            setProfile({
              fullName: storedName || user?.fullName || "",
              email: storedEmail || user?.primaryEmailAddress?.emailAddress || "",
              role: storedRole || "donor"
            });
          } else {
            const clerkName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
            setProfile({
              fullName: clerkName,
              email: user?.primaryEmailAddress?.emailAddress || "",
              role: "donor"
            });
            localStorage.setItem("userFullName", clerkName);
            localStorage.setItem("userEmail", user?.primaryEmailAddress?.emailAddress || "");
            localStorage.setItem("userRole", "donor");
          }
        }
      } catch (err) {
        console.error("Error fetching user profile from MongoDB:", err);
        const storedName = localStorage.getItem("userFullName");
        const storedEmail = localStorage.getItem("userEmail");
        const storedRole = localStorage.getItem("userRole");
        if (storedName || storedEmail || storedRole) {
          setProfile({
            fullName: storedName || user?.fullName || "",
            email: storedEmail || user?.primaryEmailAddress?.emailAddress || "",
            role: storedRole || "donor"
          });
        } else {
          const clerkName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
          setProfile({
            fullName: clerkName,
            email: user?.primaryEmailAddress?.emailAddress || "",
            role: "donor"
          });
          localStorage.setItem("userFullName", clerkName);
          localStorage.setItem("userEmail", user?.primaryEmailAddress?.emailAddress || "");
          localStorage.setItem("userRole", "donor");
        }
      }
    };

    fetchProfile();
  }, [user, userLoaded]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (!userLoaded) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:FONT, gap:12, background:SMOKE }}>
        <div style={{ width:48, height:48, borderRadius:"50%", border:`3px solid ${BORDER}`, borderTopColor:RED, animation:"spin 0.9s linear infinite" }}/>
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        <p style={{ color:SLATE_L, fontWeight:600 }}>Loading operations console…</p>
      </div>
    );
  }

  const displayName = profile?.fullName || user?.fullName || "User";
  const displayRole = profile?.role || "donor";

  const sidebarW = collapsed ? 68 : SIDEBAR_W;

  return (
    <div style={{ fontFamily:FONT, background:theme==="dark"?NAVY:SMOKE, minHeight:"100vh", color:theme==="dark"?WHITE:SLATE }}>
      {/* Global keyframes */}
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *,:before,:after{box-sizing:border-box;}
        ::-webkit-scrollbar{width:6px;}
        ::-webkit-scrollbar-track{background:${theme==="dark"?NAVY:SMOKE};}
        ::-webkit-scrollbar-thumb{background:${BORDER};border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:${SLATE};}
      `}</style>

      <Sidebar active={activeTab} navigate={navigate} onLogout={handleLogout} collapsed={collapsed} />
      <Topbar displayName={displayName} displayRole={displayRole} user={user} profile={profile} theme={theme} toggleTheme={toggleTheme} sidebarCollapsed={collapsed} toggleSidebar={() => setCollapsed(!collapsed)} />

      {/* Main Content */}
      <main style={{ marginLeft:sidebarW, marginTop:72, padding:"32px", transition:"margin-left 0.3s cubic-bezier(.4,0,.2,1)" }}>
        {/* Page Header */}
        <div style={{ marginBottom:32, animation:"fadeUp 0.4s ease-out" }}>
          <h1 style={{ fontSize:"1.75rem", fontWeight:800, color:theme==="dark"?WHITE:SLATE, marginBottom:8 }}>{title}</h1>
          {subtitle && <p style={{ fontSize:"0.95rem", color:theme==="dark"?"rgba(255,255,255,0.6)":SLATE_L }}>{subtitle}</p>}
        </div>

        {/* Page Content */}
        <div style={{ animation:"fadeUp 0.5s ease-out 0.1s both" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
export { BloodBadge, StatusPill, AnimatedCounter };
