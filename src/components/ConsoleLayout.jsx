import React, { useState, useEffect } from "react";
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
    FaSun,
    FaMoon,
    FaHandHoldingMedical,
    FaBars,
    FaMagnifyingGlass,
    FaHospital
} from "react-icons/fa6";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "./ConsoleLayout.css";

/* Design Tokens matching Dashboard */
const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const RED_DARK = "#8B0000";
const RED_GLOW = "rgba(196,18,48,0.15)";
const SLATE = "#1E293B";
const SLATE_MD = "#334155";
const SLATE_LT = "#64748B";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";
const BORDER = "#E2E8F0";
const SIDEBAR_W = 260;

function ConsoleLayout({ children, title, subtitle, activeTab }) {
    const { isLoaded: userLoaded, user } = useUser();
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem("dashboard-theme") || "light");
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
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
                    // Update localStorage with API data
                    localStorage.setItem("userFullName", data.fullName || "");
                    localStorage.setItem("userEmail", data.email || "");
                    localStorage.setItem("userRole", data.role || "donor");
                } else {
                    // Fallback to localStorage
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
                        // Final fallback to Clerk user data
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
                // Fallback to localStorage if API fails
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
                    // Final fallback to Clerk user data
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
                <p style={{ color:SLATE_LT, fontWeight:600 }}>Loading operations console…</p>
            </div>
        );
    }

    const displayName = profile?.fullName || user?.fullName || "User";
    const displayRole = profile?.role || "donor";
    const initials = user?.firstName ? `${user.firstName[0]}${user.lastName?.[0]||""}` : "U";

    const navItems = [
        { key:"dashboard",       icon:<FaChartLine/>,        label:"Dashboard"       },
        { key:"patients",        icon:<FaUsers/>,            label:"Patients"        },
        { key:"doctors",         icon:<FaUserDoctor/>,       label:"Doctors"         },
        { key:"donors",          icon:<FaHandHoldingMedical/>,label:"Donors"         },
        { key:"blood-inventory", icon:<FaDroplet/>,          label:"Blood Inventory" },
        { key:"blood-requests",  icon:<FaHeartPulse/>,       label:"Blood Requests"  },
        { key:"appointments",    icon:<FaCalendarDays/>,     label:"Appointments"    },
        { key:"hospitals",       icon:<FaHospital/>,         label:"Hospitals"       },
        { key:"reports",         icon:<FaClipboardList/>,    label:"Reports"         },
        { key:"settings",        icon:<FaGear/>,             label:"Settings"        },
    ];

    const notifications = [
        { icon:"🚨", text:"Emergency O- request — 2 units needed", time:"2m ago", urgent:true },
        { icon:"✅", text:"Donor intake completed — A+ blood processed", time:"15m ago", urgent:false },
        { icon:"⚠️", text:"B- stock below threshold (12 units)", time:"1h ago", urgent:false },
    ];

    return (
        <div style={{ fontFamily:FONT, background:SMOKE, minHeight:"100vh" }}>
            {/* Global keyframes */}
            <style>{`
                @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
                @keyframes spin{to{transform:rotate(360deg)}}
                *,:before,:after{box-sizing:border-box;}
                ::-webkit-scrollbar{width:6px;}
                ::-webkit-scrollbar-track{background:${SMOKE};}
                ::-webkit-scrollbar-thumb{background:${BORDER};border-radius:3px;}
                ::-webkit-scrollbar-thumb:hover{background:${SLATE_LT};}
            `}</style>

            {/* Sidebar */}
            <aside style={{
                position:"fixed", left:0, top:0, bottom:0, width:collapsed ? 68 : SIDEBAR_W,
                background:SLATE, zIndex:200, transition:"width 0.3s cubic-bezier(.4,0,.2,1)",
                display:"flex", flexDirection:"column", boxShadow:"4px 0 24px rgba(0,0,0,0.08)"
            }}>
                {/* Logo */}
                <div style={{ padding:collapsed ? 20 : 24, display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ 
                        width:40, height:40, borderRadius:12, 
                        background:`linear-gradient(135deg,${RED},${RED_DARK})`, 
                        display:"flex", alignItems:"center", justifyContent:"center", 
                        color:WHITE, fontSize:"1.2rem", flexShrink:0 
                    }}>
                        <FaDroplet/>
                    </div>
                    {!collapsed && (
                        <span style={{ fontWeight:900, color:WHITE, fontSize:"1.1rem", letterSpacing:"-0.02em" }}>
                            Hemo<span style={{ color:RED }}>Care</span>
                        </span>
                    )}
                </div>

                {/* Nav */}
                <nav style={{ flex:1, padding:collapsed ? 16 : 20, overflowY:"auto" }}>
                    {navItems.map(({ key, icon, label }) => {
                        const isActive = activeTab === `/${key}`;
                        return (
                            <div key={key} onClick={() => navigate(`/${key}`)}
                                style={{
                                    display:"flex", alignItems:"center", gap:12,
                                    padding:collapsed ? 12 : "12px 16px",
                                    borderRadius:12,
                                    background:isActive ? RED : "transparent",
                                    color:isActive ? WHITE : SLATE_MD,
                                    cursor:"pointer", transition:"all 0.2s",
                                    marginBottom:6, fontSize:"0.9rem", fontWeight:isActive ? 700 : 500
                                }}
                                onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                                onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = "transparent"; }}
                            >
                                <span style={{ fontSize:"1.05rem" }}>{icon}</span>
                                {!collapsed && <span>{label}</span>}
                            </div>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding:collapsed ? 16 : 20, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                    <div onClick={handleLogout}
                        style={{
                            display:"flex", alignItems:"center", gap:12,
                            padding:collapsed ? 12 : "12px 16px",
                            borderRadius:12,
                            color:SLATE_MD, cursor:"pointer", transition:"all 0.2s",
                            fontSize:"0.9rem", fontWeight:500
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        <FaRightFromBracket style={{ fontSize:"1.05rem" }}/>
                        {!collapsed && <span>Sign Out</span>}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft:collapsed ? 68 : SIDEBAR_W, transition:"margin-left 0.3s cubic-bezier(.4,0,.2,1)" }}>
                {/* Topbar */}
                <header style={{
                    position:"fixed", top:0, left:collapsed ? 68 : SIDEBAR_W, right:0, height:72, zIndex:100,
                    background:"rgba(255,255,255,0.97)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${BORDER}`,
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"0 28px", boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
                    transition:"left 0.3s cubic-bezier(.4,0,.2,1)"
                }}>
                    {/* Left */}
                    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                        <button onClick={() => setCollapsed(!collapsed)} style={{ width:40, height:40, border:`1px solid ${BORDER}`, borderRadius:12, background:SMOKE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_MD, fontSize:"1.1rem", transition:"all 0.25s" }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = RED}
                            onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                        >
                            <FaBars/>
                        </button>
                        <div>
                            <h1 style={{ fontFamily:FONT, fontWeight:800, fontSize:"1.4rem", color:SLATE, letterSpacing:"-0.01em", lineHeight:1 }}>{title}</h1>
                            <p style={{ color:SLATE_LT, fontSize:"0.85rem", marginTop:2 }}>{subtitle}</p>
                        </div>
                    </div>

                    {/* Right */}
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        {/* Search */}
                        <div style={{ display:"flex", alignItems:"center", gap:10, background:SMOKE, border:`1px solid ${BORDER}`, borderRadius:14, padding:"10px 16px", transition:"all 0.25s" }}>
                            <FaMagnifyingGlass style={{ color:SLATE_LT, fontSize:"0.95rem" }}/>
                            <input placeholder="Search..." style={{ border:"none", background:"transparent", fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none", width:120 }}/>
                        </div>

                        {/* Theme */}
                        <button onClick={toggleTheme} style={{ width:42, height:42, borderRadius:12, border:`1px solid ${BORDER}`, background:SMOKE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_MD, fontSize:"1rem", transition:"all 0.25s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = SLATE_MD; }}
                        >
                            {theme === "dark" ? <FaSun/> : <FaMoon/>}
                        </button>

                        {/* Notification */}
                        <div style={{ position:"relative" }}>
                            <button onClick={() => { setNotifOpen(o => !o); setProfileDropdownOpen(false); }}
                                style={{ width:42, height:42, borderRadius:12, border:`1px solid ${BORDER}`, background:SMOKE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_MD, fontSize:"1rem", position:"relative", transition:"all 0.25s" }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = RED}
                                onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                            >
                                <FaBell/>
                                <span style={{ position:"absolute", top:-2, right:-2, background:RED, color:WHITE, fontSize:"0.65rem", fontWeight:800, minWidth:18, height:18, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>{notifications.length}</span>
                            </button>
                            {notifOpen && (
                                <div style={{ position:"absolute", right:0, top:50, width:340, background:WHITE, border:`1px solid ${BORDER}`, borderRadius:18, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", zIndex:300, overflow:"hidden", animation:"fadeUp 0.2s ease" }}>
                                    <div style={{ padding:"16px 20px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:SMOKE }}>
                                        <span style={{ fontWeight:800, color:SLATE, fontSize:"0.95rem" }}>Notifications</span>
                                        <span style={{ background:RED, color:WHITE, fontSize:"0.7rem", fontWeight:800, padding:"3px 8px", borderRadius:12 }}>{notifications.length}</span>
                                    </div>
                                    {notifications.map((n,i) => (
                                        <div key={i} style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER}`, display:"flex", gap:12, cursor:"pointer", background:n.urgent?"rgba(196,18,48,0.05)":WHITE,
                                            transition:"background 0.15s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                                            onMouseLeave={e => e.currentTarget.style.background = n.urgent?"rgba(196,18,48,0.05)":WHITE}
                                        >
                                            <span style={{ fontSize:"1.15rem", flexShrink:0 }}>{n.icon}</span>
                                            <div>
                                                <p style={{ fontSize:"0.88rem", color:SLATE, fontWeight:n.urgent?700:500, lineHeight:1.4 }}>{n.text}</p>
                                                <span style={{ fontSize:"0.78rem", color:SLATE_LT }}>{n.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Avatar */}
                        <div style={{ position:"relative" }}>
                            <button onClick={() => { setProfileDropdownOpen(o => !o); setNotifOpen(false); }}
                                style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,${RED},${RED_DARK})`, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:WHITE, fontWeight:800, fontSize:"0.95rem", transition:"all 0.25s" }}
                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                            >
                                {initials}
                            </button>
                            {profileDropdownOpen && (
                                <div style={{ position:"absolute", right:0, top:52, width:300, background:WHITE, border:`1px solid ${BORDER}`, borderRadius:18, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", zIndex:300, overflow:"hidden", animation:"fadeUp 0.2s ease" }}>
                                    <div style={{ padding:"20px 22px", borderBottom:`1px solid ${BORDER}`, background:SMOKE }}>
                                        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                                            <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${RED},${RED_DARK})`, display:"flex", alignItems:"center", justifyContent:"center", color:WHITE, fontWeight:800, fontSize:"1.2rem" }}>
                                                {initials}
                                            </div>
                                            <div style={{ flex:1 }}>
                                                <p style={{ fontWeight:800, color:SLATE, fontSize:"1rem", lineHeight:1.2 }}>{displayName}</p>
                                                <span style={{ background:RED_GLOW, color:RED, fontWeight:700, fontSize:"0.72rem", padding:"4px 12px", borderRadius:14, marginTop:6, display:"inline-block", textTransform:"capitalize" }}>{displayRole.replace("_"," ")}</span>
                                            </div>
                                        </div>
                                        <p style={{ color:SLATE_LT, fontSize:"0.85rem", marginTop:10, wordBreak:"break-all" }}>{profile?.email || user?.primaryEmailAddress?.emailAddress}</p>
                                    </div>
                                    
                                    <div style={{ padding:"10px 0" }}>
                                        {["👤 My Profile","⚙️ Settings"].map((l,i) => (
                                            <div key={l} onClick={() => { if(i===0) navigate("/profile"); else navigate("/settings"); }} style={{ padding:"16px 22px", cursor:"pointer", color:SLATE, fontSize:"0.9rem", fontWeight:500, display:"flex", alignItems:"center", gap:12, transition:"background 0.15s" }}
                                                onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                                                onMouseLeave={e => e.currentTarget.style.background = WHITE}
                                            >{l}</div>
                                        ))}
                                    </div>
                                    
                                    <div style={{ borderTop:`1px solid ${BORDER}`, padding:"14px 22px" }}>
                                        <div onClick={handleLogout} style={{ color:RED, fontWeight:700, fontSize:"0.9rem", cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>🏠 Back to Home</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div style={{ marginTop:72, padding:"28px 28px 48px" }}>
                    {children}
                </div>
            </main>
        </div>
    );
}

export default ConsoleLayout;
