import React, { useState } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimeline,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaDroplet,
  FaPlus,
  FaHeartPulse,
  FaUsers,
  FaFileMedical,
  FaBell,
  FaUser,
  FaBuilding,
  FaAward,
  FaCalendarCheck,
  FaMagnifyingGlass,
  FaEye,
  FaXmark
} from "react-icons/fa6";
import { stockHistoryData } from "../../data/indianBloodBankData";
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

function BloodBankStockHistory() {
  const { user } = useUser();
  const navigate = useNavigate();
  const screenSize = useResponsive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { stockHistory } = useBloodBank();

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

  const active = "bloodbank-stock-history";

  // Use real stock history from context, fallback to static data if empty
  const displayStockHistory = stockHistory.length > 0 ? stockHistory : stockHistoryData;

  // Function to determine expiry status
  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { status: "Unknown", color: "#94A3B8", bg: "#F1F5F9" };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { status: "Expired", color: "#DC2626", bg: "#FEE2E2" };
    } else if (diffDays <= 7) {
      return { status: `Expiring in ${diffDays} day${diffDays > 1 ? 's' : ''}`, color: "#F59E0B", bg: "#FEF3C7" };
    } else {
      return { status: "Valid", color: "#16A34A", bg: "#DCFCE7" };
    }
  };

  const handleViewDetails = (history) => {
    setSelectedHistory(history);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHistory(null);
  };

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
              Stock History
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
                <h1 style={{ fontSize:isTablet ? "1.2rem" : "1.4rem", fontWeight:700, color:NAVY2, margin:0 }}>Stock History</h1>
                <p style={{ fontSize:isTablet ? "0.8rem" : "0.85rem", color:SLATE_L, margin:"4px 0 0 0" }}>View blood stock movement history</p>
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
          <div style={{ display:"flex", gap:isMobile ? 12 : 16, marginBottom:isMobile ? 16 : 24, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:isMobile ? "100%" : 250 }}>
              <div style={{ position:"relative" }}>
                <FaMagnifyingGlass style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:SLATE_L }} />
                <input
                  type="text"
                  placeholder="Search stock history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width:"100%", padding:isMobile ? "8px 12px 8px 40" : "10px 12px 10px 40", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ padding:isMobile ? "8px 12px" : "10px 16px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2, background:WHITE, minWidth:isMobile ? "100%" : "auto" }}
            >
              <option value="All">All Types</option>
              <option value="Added">Added</option>
              <option value="Expired">Expired</option>
              <option value="Issued">Issued</option>
            </select>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}
          >
            <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:isMobile ? "600px" : "auto" }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${BORDER}`, background:SMOKE }}>
                    <th style={{ padding:isMobile ? "10px 12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Date</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Blood Group</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Type</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Units</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Expiry Date</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Expiry Status</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Donor/Recipient</th>
                    <th style={{ padding:isMobile ? "10px 12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayStockHistory.filter(h => 
                    (filterType === "All" || h.type === filterType) &&
                    (h.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    h.type.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).map((history, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      style={{ borderBottom:`1px solid ${BORDER}` }}
                    >
                      <td style={{ padding:isMobile ? "10px 12px" : "16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}>{history.date}</td>
                      <td style={{ padding:isMobile ? "10px 12px" : "16px" }}>
                        <span style={{
                          padding:isMobile ? "3px 8px" : "4px 10px",
                          borderRadius:6,
                          background:`${BG_COLOR[history.bloodGroup]}15`,
                          color:BG_COLOR[history.bloodGroup],
                          fontSize:isMobile ? "0.7rem" : "0.75rem",
                          fontWeight:600
                        }}>
                          {history.bloodGroup}
                        </span>
                      </td>
                      <td style={{ padding:isMobile ? "10px 12px" : "16px" }}>
                        <span style={{
                          padding:isMobile ? "3px 8px" : "4px 10px",
                          borderRadius:6,
                          background:history.type === "Added" ? "#DCFCE7" : history.type === "Expired" ? "#FEE2E2" : "#FEE2E2",
                          color:history.type === "Added" ? "#16A34A" : "#DC2626",
                          fontSize:isMobile ? "0.7rem" : "0.75rem",
                          fontWeight:600
                        }}>
                          {history.type}
                        </span>
                      </td>
                      <td style={{ padding:isMobile ? "10px 12px" : "16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}>{history.units}</td>
                      <td style={{ padding:isMobile ? "10px 12px" : "16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}>{history.expiryDate || "-"}</td>
                      <td style={{ padding:isMobile ? "10px 12px" : "16px" }}>
                        {(() => {
                          const expiryStatus = getExpiryStatus(history.expiryDate);
                          return (
                            <span style={{
                              padding:isMobile ? "3px 8px" : "4px 10px",
                              borderRadius:6,
                              background:expiryStatus.bg,
                              color:expiryStatus.color,
                              fontSize:isMobile ? "0.7rem" : "0.75rem",
                              fontWeight:600
                            }}>
                              {expiryStatus.status}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding:isMobile ? "10px 12px" : "16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}>{history.donor}</td>
                      <td style={{ padding:isMobile ? "10px 12px" : "16px" }}>
                        <button
                          onClick={() => handleViewDetails(history)}
                          style={{
                            background:`${RED}15`,
                            border:"none",
                            padding:isMobile ? "6px 10px" : "8px 12px",
                            borderRadius:6,
                            cursor:"pointer",
                            color:RED,
                            fontSize:isMobile ? "0.75rem" : "0.8rem",
                            fontWeight:600,
                            transition:"all 0.2s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = `${RED}25`}
                          onMouseLeave={e => e.currentTarget.style.background = `${RED}15`}
                        >
                          <FaEye /> {!isMobile && <span style={{ marginLeft:6 }}>View</span>}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && selectedHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              style={{
                position:"fixed",
                top:0,
                left:0,
                right:0,
                bottom:0,
                background:"rgba(0,0,0,0.5)",
                zIndex:1000,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                padding:isMobile ? 16 : 32
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background:WHITE,
                  borderRadius:12,
                  padding:isMobile ? 20 : 32,
                  maxWidth:isMobile ? "100%" : 500,
                  width:"100%",
                  maxHeight:"90vh",
                  overflowY:"auto"
                }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                  <h2 style={{ fontSize:isMobile ? "1.2rem" : "1.4rem", fontWeight:700, color:NAVY2, margin:0 }}>Stock History Details</h2>
                  <button onClick={handleCloseModal} style={{ background:"none", border:"none", cursor:"pointer", color:SLATE_L }}>
                    <FaXmark style={{ fontSize:isMobile ? "1.2rem" : "1.4rem" }} />
                  </button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "repeat(2, 1fr)", gap:16 }}>
                  <div>
                    <div style={{ fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, marginBottom:4 }}>Date</div>
                    <div style={{ fontSize:isMobile ? "0.9rem" : "1rem", fontWeight:600, color:NAVY2 }}>{selectedHistory.date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, marginBottom:4 }}>Blood Group</div>
                    <div style={{ fontSize:isMobile ? "0.9rem" : "1rem", fontWeight:600, color:NAVY2 }}>{selectedHistory.bloodGroup}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, marginBottom:4 }}>Type</div>
                    <div style={{ fontSize:isMobile ? "0.9rem" : "1rem", fontWeight:600, color:NAVY2 }}>{selectedHistory.type}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, marginBottom:4 }}>Units</div>
                    <div style={{ fontSize:isMobile ? "0.9rem" : "1rem", fontWeight:600, color:NAVY2 }}>{selectedHistory.units}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, marginBottom:4 }}>Expiry Date</div>
                    <div style={{ fontSize:isMobile ? "0.9rem" : "1rem", fontWeight:600, color:NAVY2 }}>{selectedHistory.expiryDate || "Not specified"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, marginBottom:4 }}>Expiry Status</div>
                    {(() => {
                      const expiryStatus = getExpiryStatus(selectedHistory.expiryDate);
                      return (
                        <span style={{
                          padding:"4px 10px",
                          borderRadius:6,
                          background:expiryStatus.bg,
                          color:expiryStatus.color,
                          fontSize:"0.85rem",
                          fontWeight:600
                        }}>
                          {expiryStatus.status}
                        </span>
                      );
                    })()}
                  </div>
                  <div>
                    <div style={{ fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, marginBottom:4 }}>Donor/Recipient</div>
                    <div style={{ fontSize:isMobile ? "0.9rem" : "1rem", fontWeight:600, color:NAVY2 }}>{selectedHistory.donor}</div>
                  </div>
                  {selectedHistory.batchId && (
                    <div>
                      <div style={{ fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, marginBottom:4 }}>Batch ID</div>
                      <div style={{ fontSize:isMobile ? "0.9rem" : "1rem", fontWeight:600, color:NAVY2 }}>{selectedHistory.batchId}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default BloodBankStockHistory;
