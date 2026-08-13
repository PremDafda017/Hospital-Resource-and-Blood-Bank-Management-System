import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine,
  FaDroplet,
  FaHeartPulse,
  FaUsers,
  FaFileMedical,
  FaBell,
  FaUser,
  FaRightFromBracket,
  FaBars,
  FaHouse,
  FaPlus,
  FaTimeline,
  FaBuilding,
  FaArrowRight,
  FaGear,
  FaChevronDown,
  FaAward,
  FaCalendarCheck,
  FaXmark
} from "react-icons/fa6";
import {
  bloodInventoryData,
  indianHospitalRequests,
  getBloodBankStats
} from "../../data/indianBloodBankData";
import { useBloodBank } from "../../contexts/BloodBankContext";
import { breakpoints, animationVariants, useResponsive } from "../../utils/responsiveDesign";

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

const BG_COLOR = {
  "A+": "#16A34A",
  "A-": "#15803D",
  "B+": "#2563EB",
  "B-": "#1D4ED8",
  "AB+": "#7C3AED",
  "AB-": "#6D28D9",
  "O+": RED,
  "O-": RED_DK
};

function BloodBankDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const screenSize = useResponsive();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { inventory, stockHistory, notifications, loading: contextLoading } = useBloodBank();

  // Auto-collapse sidebar on mobile
  const isMobile = screenSize === 'xs' || screenSize === 'sm';
  const isTablet = screenSize === 'md';
  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 68 : SIDEBAR_W);

  const nav = [
    { key:"bloodbank-dashboard", icon:<FaChartLine/>, label:"Dashboard", path:"/bloodbank-dashboard" },
    { key:"bloodbank-inventory", icon:<FaDroplet/>, label:"Blood Inventory", path:"/bloodbank-inventory" },
    { key:"bloodbank-add-stock", icon:<FaPlus/>, label:"Add Blood Stock", path:"/bloodbank-add-stock" },
    { key:"bloodbank-stock-history", icon:<FaTimeline/>, label:"Stock History", path:"/bloodbank-stock-history" },
    { key:"bloodbank-requests", icon:<FaHeartPulse/>, label:"Blood Requests", path:"/bloodbank-requests" },
    { key:"donation-requests", icon:<FaHeartPulse/>, label:"Donation Requests", path:"/donation-requests" },
    { key:"campaign-management", icon:<FaAward/>, label:"Campaign Management", path:"/campaign-management" },
    { key:"appointment-management", icon:<FaCalendarCheck/>, label:"Appointments", path:"/appointment-management" },
    { key:"bloodbank-donors", icon:<FaUsers/>, label:"Donor List", path:"/bloodbank-donors" },
    { key:"bloodbank-details", icon:<FaBuilding/>, label:"Blood Bank Details", path:"/bloodbank-details" },
    { key:"bloodbank-reports", icon:<FaFileMedical/>, label:"Reports", path:"/bloodbank-reports" },
    { key:"bloodbank-notifications", icon:<FaBell/>, label:"Notifications", path:"/bloodbank-notifications" },
    { key:"bloodbank-profile", icon:<FaUser/>, label:"Profile", path:"/bloodbank-profile" },
  ];

  const active = "bloodbank-dashboard";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  // Calculate stats from real inventory data
  const totalUnits = inventory.reduce((sum, item) => sum + (parseInt(item.units) || 0), 0);
  const criticalStock = inventory.filter(item => parseInt(item.units) < 20).length;
  const lowStock = inventory.filter(item => parseInt(item.units) < 50 && parseInt(item.units) >= 20).length;

  const stats = [
    { title: "Total Blood Units", value: totalUnits.toLocaleString(), icon: <FaDroplet />, color: RED, change: "+12%" },
    { title: "Blood Requests", value: indianHospitalRequests.length, icon: <FaHeartPulse />, color: "#2563EB", change: "+8%" },
    { title: "Active Donors", value: stockHistory.length, icon: <FaUsers />, color: "#16A34A", change: "+5%" },
    { title: "Critical Stock", value: criticalStock, icon: <FaBell />, color: "#F59E0B", change: "-3%" },
  ];

  // Calculate blood groups from real inventory data
  const bloodGroups = inventory.map((item) => {
    const totalUnits = inventory.reduce((sum, d) => sum + (parseInt(d.units) || 0), 0);
    const isCritical = parseInt(item.units) < 20;
    return {
      group: item.bloodGroup,
      units: parseInt(item.units) || 0,
      percentage: totalUnits > 0 ? Math.round((parseInt(item.units) / totalUnits) * 100) : 0,
      critical: isCritical
    };
  });

  const recentRequests = indianHospitalRequests.slice(0, 5);
  const recentActivities = stockHistory.slice(0, 5);

  useEffect(() => {
    setLoading(contextLoading);
  }, [contextLoading]);

  const StatCard = ({ icon, value, label, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: WHITE,
        borderRadius: 12,
        padding: isMobile ? "16px" : "20px",
        border: `1px solid ${BORDER}`,
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 12 : 16,
        transition: "all 0.2s",
        cursor: "pointer"
      }}
    >
      <div style={{
        width: isMobile ? 48 : 56,
        height: isMobile ? 48 : 56,
        borderRadius: 12,
        background: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color,
        fontSize: isMobile ? "1.3rem" : "1.5rem"
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: isMobile ? "1.5rem" : "1.8rem", fontWeight: 800, color: NAVY2, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: isMobile ? "0.8rem" : "0.85rem", color: SLATE_L, fontWeight: 500 }}>{label}</div>
      </div>
    </motion.div>
  );

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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT, background: SMOKE, minHeight: "100vh", display: "flex" }}>
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && (
        <aside style={{
          width:sidebarWidth, minHeight:"100vh", background:SIDEBAR_COL,
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
              {!sidebarCollapsed && <span>Blood Bank Staff</span>}
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
                transition:"all 0.2s",
                fontSize:"0.9rem",
                fontWeight:500
              }}
              onMouseEnter={e => {
                if (active !== item.key) {
                  e.currentTarget.style.background = `${SLATE}22`;
                }
              }}
              onMouseLeave={e => {
                if (active !== item.key) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize:"1.1rem" }}>{item.icon}</span>
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
              color:"#F87171",
              cursor:"pointer",
              transition:"all 0.2s",
              fontSize:"0.9rem",
              fontWeight:500
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${SLATE}22`}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize:"1.1rem" }}><FaRightFromBracket /></span>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <main style={{ flex:1, marginLeft:sidebarWidth, transition:"margin-left 0.3s ease" }}>
        {/* Mobile Header */}
        {isMobile && (
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              background:WHITE,
              padding: "12px 16px",
              borderBottom:`1px solid ${BORDER}`,
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
              position:"sticky",
              top:0,
              zIndex:50
            }}
          >
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background:"none",
                border:"none",
                cursor:"pointer",
                padding:8,
                borderRadius:4,
                color:NAVY2
              }}
            >
              <FaBars style={{ fontSize:"1.2rem" }} />
            </button>
            <h1 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>
              Dashboard
            </h1>
            <button
              onClick={() => navigate("/bloodbank-notifications")}
              style={{
                background:"none",
                border:"none",
                fontSize:"1.2rem",
                cursor:"pointer",
                color:SLATE,
                padding:8,
                position:"relative"
              }}
            >
              <FaBell />
              {notifications.length > 0 && (
                <span style={{
                  position:"absolute",
                  top:0,
                  right:0,
                  width:18,
                  height:18,
                  background:RED,
                  borderRadius:"50%",
                  color:WHITE,
                  fontSize:"0.65rem",
                  fontWeight:700,
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center"
                }}>
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
          </motion.header>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              background:WHITE,
              padding: isTablet ? "12px 20px" : "16px 32px",
              borderBottom:`1px solid ${BORDER}`,
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
              position:"sticky",
              top:0,
              zIndex:50
            }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div>
                <h1 style={{ fontSize:isTablet ? "1.2rem" : "1.4rem", fontWeight:700, color:NAVY2, margin:0 }}>
                  Dashboard
                </h1>
                <p style={{ fontSize:isTablet ? "0.8rem" : "0.85rem", color:SLATE_L, margin:"4px 0 0 0" }}>
                  Welcome back, {user?.firstName || 'User'}
                </p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <button
                onClick={() => navigate("/bloodbank-notifications")}
                style={{
                  background:"none",
                  border:"none",
                  fontSize:"1.2rem",
                  cursor:"pointer",
                  color:SLATE,
                  padding:8,
                  position:"relative"
                }}
              >
                <FaBell />
                {notifications.length > 0 && (
                  <span style={{
                    position:"absolute",
                    top:0,
                    right:0,
                    width:18,
                    height:18,
                    background:RED,
                    borderRadius:"50%",
                    color:WHITE,
                    fontSize:"0.65rem",
                    fontWeight:700,
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center"
                  }}>
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
              <div style={{
                width:40,
                height:40,
                borderRadius:"50%",
              background:`${RED}15`,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              color:RED,
              fontSize:"1rem",
              fontWeight:600
            }}>
              {user?.firstName?.[0] || 'U'}
            </div>
          </div>
        </motion.header>
        )}

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position:"fixed",
                top:0,
                left:0,
                right:0,
                bottom:0,
                background:"rgba(0,0,0,0.5)",
                zIndex:1000
              }}
            >
              <motion.div
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width:260,
                  height:"100%",
                  background:SIDEBAR_COL,
                  padding:"16px"
                }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, color:WHITE, fontWeight:700 }}>
                    <FaDroplet style={{ color:RED }} />
                    <span>Blood Bank</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} style={{ background:"none", border:"none", color:WHITE, cursor:"pointer" }}>
                    <FaXmark />
                  </button>
                </div>
                {nav.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                    style={{
                      width:"100%",
                      display:"flex",
                      alignItems:"center",
                      gap:12,
                      padding:"12px 16px",
                      borderRadius:8,
                      border:"none",
                      background:active === item.key ? `${RED}22` : "transparent",
                      color:active === item.key ? RED : WHITE,
                      cursor:"pointer",
                      marginBottom:8,
                      fontSize:"0.9rem"
                    }}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
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
                    color:"#F87171",
                    cursor:"pointer",
                    marginTop:16
                  }}>
                    <FaRightFromBracket /> Logout
                  </button>
                </SignOutButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ padding:isMobile ? "16px" : isTablet ? "20px" : "32px" }}
        >
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display:"grid", gridTemplateColumns:isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(auto-fit, minmax(200px, 1fr))" : "repeat(auto-fit, minmax(240px, 1fr))", gap:isMobile ? 12 : 20, marginBottom:isMobile ? 20 : 32 }}
          >
            {stats.map((stat, index) => (
              <StatCard key={index} icon={stat.icon} value={stat.value} label={stat.title} color={stat.color} />
            ))}
          </motion.div>

          {/* Blood Groups Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ background:WHITE, borderRadius:12, padding:isMobile ? "16px" : isTablet ? "20px" : "24px", border:`1px solid ${BORDER}`, marginBottom:isMobile ? 20 : 32 }}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:isMobile ? 16 : 20 }}>
              <h2 style={{ fontSize:isMobile ? "1rem" : "1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>Blood Groups Overview</h2>
              <button
                onClick={() => navigate("/bloodbank-inventory")}
                style={{
                  background:"none",
                  border:"none",
                  color:RED,
                  fontSize:isMobile ? "0.8rem" : "0.85rem",
                  fontWeight:600,
                  cursor:"pointer",
                  display:"flex",
                  alignItems:"center",
                  gap:6
                }}
              >
                View All <FaArrowRight />
              </button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:isMobile ? "repeat(4, 1fr)" : "repeat(auto-fit, minmax(100px, 1fr))", gap:isMobile ? 8 : 16 }}>
              {bloodGroups.map((bg, index) => (
                <div key={index} style={{
                  background:bg.critical ? "#FEE2E2" : `${BG_COLOR[bg.group]}15`,
                  borderRadius:8,
                  padding:isMobile ? 12 : 16,
                  textAlign:"center",
                  border:bg.critical ? "2px solid #DC2626" : `1px solid ${BG_COLOR[bg.group]}30`,
                  position:"relative"
                }}>
                  {bg.critical && (
                    <div style={{
                      position:"absolute", top:8, right:8,
                      width:8, height:8, borderRadius:"50%",
                      background:"#DC2626"
                    }} />
                  )}
                  <div style={{ fontSize:isMobile ? "1.2rem" : "1.5rem", fontWeight:800, color:bg.critical ? "#DC2626" : BG_COLOR[bg.group], marginBottom:4 }}>{bg.group}</div>
                  <div style={{ fontSize:isMobile ? "1.4rem" : "1.8rem", fontWeight:700, color:NAVY2, marginBottom:4 }}>{bg.units}</div>
                  <div style={{ fontSize:isMobile ? "0.7rem" : "0.75rem", color:SLATE_L }}>{bg.percentage}%</div>
                  {bg.critical && (
                    <div style={{ fontSize:isMobile ? "0.65rem" : "0.7rem", color:"#DC2626", fontWeight:600, marginTop:4 }}>CRITICAL</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ background:WHITE, borderRadius:12, padding:isMobile ? "16px" : isTablet ? "20px" : "24px", border:`1px solid ${BORDER}`, marginBottom:isMobile ? 20 : 32 }}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:isMobile ? 16 : 20 }}>
              <h2 style={{ fontSize:isMobile ? "1rem" : "1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>Recent Blood Requests</h2>
              <button
                onClick={() => navigate("/bloodbank-requests")}
                style={{
                  background:"none",
                  border:"none",
                  color:RED,
                  fontSize:isMobile ? "0.8rem" : "0.85rem",
                  fontWeight:600,
                  cursor:"pointer",
                  display:"flex",
                  alignItems:"center",
                  gap:6
                }}
              >
                View All <FaArrowRight />
              </button>
            </div>
            <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:isMobile ? "600px" : "auto" }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${BORDER}` }}>
                    <th style={{ padding:isMobile ? "10px 12px" : "12px 16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Patient</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "12px 16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Blood Group</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "12px 16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Units</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "12px 16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Hospital</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "12px 16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Urgency</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "12px 16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Status</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "12px 16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((request, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      style={{ borderBottom:`1px solid ${BORDER}` }}
                    >
                      <td style={{ padding:isMobile ? "10px 12px" : "12px 16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2, fontWeight:600 }}>{request.patient}</td>
                      <td style={{ padding:isMobile ? "10px 12px" : "12px 16px" }}>
                        <span style={{
                          padding:isMobile ? "3px 8px" : "4px 10px",
                          borderRadius:6,
                          background:`${BG_COLOR[request.bloodGroup]}15`,
                          color:BG_COLOR[request.bloodGroup],
                          fontSize:"0.75rem",
                          fontWeight:600
                        }}>
                          {request.bloodGroup}
                        </span>
                      </td>
                      <td style={{ padding:isMobile ? "10px 12px" : "12px 16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}>{request.units}</td>
                      <td style={{ padding:isMobile ? "10px 12px" : "12px 16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}>{request.hospital}</td>
                      <td style={{ padding:isMobile ? "10px 12px" : "12px 16px" }}>
                        <span style={{
                          padding:isMobile ? "3px 8px" : "4px 10px",
                          borderRadius:6,
                          background:request.urgency === "Critical" ? "#FEE2E2" : request.urgency === "Moderate" ? "#FEF3C7" : "#DCFCE7",
                          color:request.urgency === "Critical" ? "#DC2626" : request.urgency === "Moderate" ? "#D97706" : "#16A34A",
                          fontSize:isMobile ? "0.7rem" : "0.75rem",
                          fontWeight:600
                        }}>
                          {request.urgency}
                        </span>
                      </td>
                      <td style={{ padding:isMobile ? "10px 12px" : "12px 16px" }}>
                        <span style={{
                          padding:isMobile ? "3px 8px" : "4px 10px",
                          borderRadius:6,
                          background:request.status === "Pending" ? "#FEF3C7" : request.status === "Approved" ? "#DCFCE7" : "#DBEAFE",
                          color:request.status === "Pending" ? "#D97706" : request.status === "Approved" ? "#16A34A" : "#2563EB",
                          fontSize:isMobile ? "0.7rem" : "0.75rem",
                          fontWeight:600
                        }}>
                          {request.status}
                        </span>
                      </td>
                      <td style={{ padding:isMobile ? "10px 12px" : "12px 16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:SLATE_L }}>{request.date}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{ background:WHITE, borderRadius:12, padding:isMobile ? "16px" : isTablet ? "20px" : "24px", border:`1px solid ${BORDER}` }}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:isMobile ? 16 : 20 }}>
              <h2 style={{ fontSize:isMobile ? "1rem" : "1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>Recent Activities</h2>
              <button
                onClick={() => navigate("/bloodbank-stock-history")}
                style={{
                  background:"none",
                  border:"none",
                  color:RED,
                  fontSize:isMobile ? "0.8rem" : "0.85rem",
                  fontWeight:600,
                  cursor:"pointer",
                  display:"flex",
                  alignItems:"center",
                  gap:6
                }}
              >
                View All <FaArrowRight />
              </button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:isMobile ? 10 : 12 }}>
              {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  style={{
                    display:"flex",
                    alignItems:"center",
                    gap:isMobile ? 12 : 16,
                    padding:isMobile ? 12 : 16,
                    borderRadius:8,
                    background:SMOKE,
                    border:`1px solid ${BORDER}`
                  }}
                >
                  <div style={{
                    width:isMobile ? 36 : 40,
                    height:isMobile ? 36 : 40,
                    borderRadius:8,
                    background:activity.type === "Added" ? "#DCFCE7" : "#FEE2E2",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    color:activity.type === "Added" ? "#16A34A" : "#DC2626",
                    fontSize:isMobile ? "0.9rem" : "1rem"
                  }}>
                    {activity.type === "Added" ? <FaPlus /> : <FaHeartPulse />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:isMobile ? "0.85rem" : "0.95rem", fontWeight:600, color:NAVY2, marginBottom:4 }}>
                      {activity.type === "Added" ? `Blood Added` : `Blood Issued`}
                    </div>
                    <div style={{ fontSize:isMobile ? "0.8rem" : "0.85rem", color:SLATE_L }}>
                      {activity.units} units of {activity.bloodGroup} {activity.type === "Added" ? `by ${activity.donor}` : `to ${activity.donor}`}
                    </div>
                  </div>
                  <div style={{ fontSize:isMobile ? "0.75rem" : "0.8rem", color:SLATE_L, fontWeight:500 }}>
                    {activity.date}
                  </div>
                </motion.div>
              )) : (
                <div style={{ padding:isMobile ? 24 : 32, textAlign:"center", color:SLATE_L, fontSize:isMobile ? "0.85rem" : "0.9rem" }}>
                  No recent activities
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default BloodBankDashboard;
