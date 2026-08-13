import React, { useState } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFileMedical,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaDroplet,
  FaPlus,
  FaTimeline,
  FaHeartPulse,
  FaUsers,
  FaBell,
  FaUser,
  FaBuilding,
  FaAward,
  FaCalendarCheck,
  FaDownload,
  FaXmark
} from "react-icons/fa6";
import { bloodBankReports } from "../../data/indianBloodBankData";
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

function BloodBankReports() {
  const { user } = useUser();
  const navigate = useNavigate();
  const screenSize = useResponsive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const active = "bloodbank-reports";

  const reports = bloodBankReports;

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
                color:WHITE,
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
              Reports
            </h1>
            <div style={{ width:32 }} />
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
                <h1 style={{ fontSize:isTablet ? "1.2rem" : "1.4rem", fontWeight:700, color:NAVY2, margin:0 }}>Reports</h1>
                <p style={{ fontSize:isTablet ? "0.8rem" : "0.85rem", color:SLATE_L, margin:"4px 0 0 0" }}>View and download blood bank reports</p>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : isTablet ? "repeat(auto-fit, minmax(280px, 1fr))" : "repeat(auto-fit, minmax(320px, 1fr))", gap:isMobile ? 16 : 24 }}
          >
            {reports.map((report, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                style={{
                  background:WHITE,
                  borderRadius:12,
                  padding:isMobile ? 20 : 24,
                  border:`1px solid ${BORDER}`,
                  display:"flex",
                  flexDirection:"column"
                }}
              >
                <div style={{
                  width:isMobile ? 48 : 56,
                  height:isMobile ? 48 : 56,
                  borderRadius:12,
                  background:`${RED}15`,
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  color:RED,
                  fontSize:isMobile ? "1.3rem" : "1.5rem",
                  marginBottom:16
                }}>
                  <FaFileMedical />
                </div>
                <div style={{ fontSize:isMobile ? "1rem" : "1.1rem", fontWeight:700, color:NAVY2, marginBottom:8 }}>{report.name}</div>
                <div style={{ fontSize:isMobile ? "0.8rem" : "0.85rem", color:SLATE_L, marginBottom:16 }}>{report.description}</div>
                <button
                  style={{
                    marginTop:"auto",
                    background:RED,
                    border:"none",
                    padding:isMobile ? "8px 16px" : "10px 20px",
                    borderRadius:8,
                    cursor:"pointer",
                    color:WHITE,
                    fontSize:isMobile ? "0.85rem" : "0.9rem",
                    fontWeight:600,
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    gap:8,
                    transition:"all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = RED_DK}
                  onMouseLeave={e => e.currentTarget.style.background = RED}
                >
                  <FaDownload /> Download
                </button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default BloodBankReports;
