import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHeartPulse,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaDroplet,
  FaPlus,
  FaTimeline,
  FaUsers,
  FaFileMedical,
  FaBell,
  FaUser,
  FaBuilding,
  FaAward,
  FaCalendarCheck,
  FaMagnifyingGlass,
  FaCheck,
  FaXmark,
  FaRotateRight
} from "react-icons/fa6";
import { indianStates, urgencyLevels } from "../../data/indianBloodBankData";
import { useBloodBank } from "../../contexts/BloodBankContext";
import { useNotification } from "../../contexts/NotificationContext";
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

function BloodBankRequests() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const screenSize = useResponsive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterUrgency, setFilterUrgency] = useState("All");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [alarmSound, setAlarmSound] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyAcknowledged, setEmergencyAcknowledged] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const audioRef = useRef(null);
  const { triggerRefresh, addStockHistoryEntry, addNotification } = useBloodBank();

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

  const active = "bloodbank-requests";
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBloodRequests = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/blood-requests/status/Forwarded`);
      if (response.ok) {
        const data = await response.json();
        setBloodRequests(data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error loading blood requests:', error);
    }
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadBloodRequests();
  }, []);

  // Auto-refresh every 10 seconds with countdown
  useEffect(() => {
    let intervalId;
    let countdownId;
    
    if (autoRefresh) {
      // Countdown timer
      countdownId = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            loadBloodRequests();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (countdownId) clearInterval(countdownId);
    };
  }, [autoRefresh, loadBloodRequests]);

  // Play alarm sound for critical urgency requests
  useEffect(() => {
    const hasCritical = bloodRequests.some(req => req.urgency === 'Critical' && req.status !== 'Completed' && req.status !== 'Rejected' && req.status !== 'Under Verification' && req.status !== 'Blood Ready');
    
    // Inject CSS animation for critical blinking
    const style = document.createElement('style');
    style.textContent = `
      @keyframes criticalBlink {
        0%, 100% { background-color: rgba(220, 38, 38, 0.15); }
        50% { background-color: rgba(37, 99, 235, 0.15); }
      }
    `;
    document.head.appendChild(style);
    
    // Clear any existing alarm interval immediately
    if (alarmSound) {
      clearInterval(alarmSound);
      setAlarmSound(null);
    }
    
    // Show emergency modal for critical requests (but not if acknowledged)
    if (hasCritical && !showEmergencyModal && !emergencyAcknowledged) {
      setShowEmergencyModal(true);
    }
    
    // Reset acknowledged flag when no critical requests
    if (!hasCritical) {
      setEmergencyAcknowledged(false);
    }
    
    if (hasCritical) {
      // Create alarm sound using audio file
      if (!audioRef.current) {
        audioRef.current = new Audio('/CardiacArrest.mp3');
        audioRef.current.volume = 0.5;
        audioRef.current.loop = true;
        audioRef.current.play().catch(err => console.log('Audio play error:', err));
      }
    } else {
      // Stop sound if no critical requests
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      document.head.removeChild(style);
    };
  }, [bloodRequests, showEmergencyModal, emergencyAcknowledged]);

  const handleApprove = async (requestId) => {
    try {
      // Check if request is still in Forwarded status before attempting approval
      const request = bloodRequests.find(req => req._id === requestId);
      if (!request) {
        alert('Request not found');
        return;
      }
      
      if (request.status !== 'Forwarded') {
        alert(`Cannot approve request with status: ${request.status}. Request may have been already processed.`);
        // Refresh to get current status
        loadBloodRequests();
        return;
      }

      const response = await fetch(`http://localhost:5000/api/blood-requests/${requestId}/status/blood-ready`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: user?.id || "",
          approvedByName: user?.fullName || "Blood Bank Staff",
          bloodBagNumber: `BG-${Date.now()}`
        })
      });

      if (response.ok) {
        // Add stock history entry for blood issuance
        const request = bloodRequests.find(r => r._id === requestId);
        if (request) {
          await addStockHistoryEntry({
            date: new Date().toISOString().split('T')[0],
            bloodGroup: request.bloodGroup,
            units: request.units,
            type: "Issued",
            donor: request.patientName,
            bloodBank: "City General Hospital"
          });

          // Add notification
          await addNotification({
            type: "Blood Issued",
            message: `${request.units} units of ${request.bloodGroup} blood issued to ${request.patientName}`,
            date: new Date().toISOString(),
            priority: "info"
          });

          // Show popup notification
          showNotification({
            type: 'success',
            title: 'Blood Request Approved',
            message: `${request.units} units of ${request.bloodGroup} blood has been approved and issued to ${request.patientName}`,
            duration: 5000,
            playSound: true
          });
        }

        // Trigger refresh to update all components
        triggerRefresh();

        // Reload blood requests
        const reloadResponse = await fetch(`http://localhost:5000/api/blood-requests/status/Forwarded`);
        if (reloadResponse.ok) {
          const data = await reloadResponse.json();
          setBloodRequests(data);
          setLastRefresh(new Date());
        }
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        const errorMsg = errorData.message || 'Failed to approve request';
        const details = errorData.available !== undefined ?
          `\n\nAvailable: ${errorData.available} units\nRequested: ${errorData.requested} units\nBlood Group: ${errorData.bloodGroup}` : '';

        showNotification({
          type: 'error',
          title: 'Approval Failed',
          message: `${errorMsg}${details}`,
          duration: 6000,
          playSound: true
        });
      }
    } catch (error) {
      console.error('Error approving blood request:', error);
      showNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Network error occurred while approving request',
        duration: 4000,
        playSound: true
      });
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blood-requests/${requestId}/status/rejected`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectedBy: user?.id || "",
          rejectedByName: user?.fullName || "Blood Bank Staff",
          rejectionReason: "Insufficient inventory or other reason"
        })
      });

      if (response.ok) {
        const request = bloodRequests.find(r => r._id === requestId);
        showNotification({
          type: 'warning',
          title: 'Blood Request Rejected',
          message: request ? `Blood request for ${request.patientName} has been rejected` : 'Blood request has been rejected',
          duration: 4000,
          playSound: true
        });

        // Reload blood requests
        const reloadResponse = await fetch(`http://localhost:5000/api/blood-requests/status/Forwarded`);
        if (reloadResponse.ok) {
          const data = await reloadResponse.json();
          setBloodRequests(data);
          setLastRefresh(new Date());
        }
      }
    } catch (error) {
      console.error('Error rejecting blood request:', error);
      showNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Network error occurred while rejecting request',
        duration: 4000,
        playSound: true
      });
    }
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/blood-requests/status/Forwarded`);
      if (response.ok) {
        const data = await response.json();
        setBloodRequests(data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error loading blood requests:', error);
    }
    setLoading(false);
  };

  const handleEmergencyModalClose = () => {
    console.log('Emergency modal close button clicked');
    setShowEmergencyModal(false);
    if (alarmSound) {
      clearInterval(alarmSound);
      setAlarmSound(null);
      console.log('Alarm sound stopped');
    }
  };

  const filteredRequests = bloodRequests.filter(req => 
    (filterStatus === "All" || req.status === filterStatus) &&
    (filterUrgency === "All" || req.urgency === filterUrgency) &&
    (req.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     req.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     req.bloodGroup?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ fontFamily: FONT, background: SMOKE, minHeight: "100vh", display: "flex" }}>
      {/* Sidebar */}
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

      {/* Main Content */}
      <main style={{ flex:1, marginLeft:sidebarWidth, transition:"margin-left 0.3s ease" }}>
        {/* Mobile Header */}
        {isMobile && (
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              background:WHITE,
              padding: isMobile ? "12px 16px" : "16px 32px",
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
            <h1 style={{ fontSize:isMobile ? "1.1rem" : "1.4rem", fontWeight:700, color:NAVY2, margin:0 }}>
              Blood Requests
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
                <h1 style={{ fontSize:isTablet ? "1.2rem" : "1.4rem", fontWeight:700, color:NAVY2, margin:0 }}>Blood Requests</h1>
                <p style={{ fontSize:isTablet ? "0.8rem" : "0.85rem", color:SLATE_L, margin:"4px 0 0 0" }}>Manage blood requests from hospitals</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:isTablet ? "wrap" : "nowrap" }}>
              <button
                onClick={handleManualRefresh}
                style={{
                  background:WHITE,
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  padding:isTablet ? "8px 12px" : "8px 16px",
                  display:"flex",
                  alignItems:"center",
                  gap:8,
                  cursor:"pointer",
                  fontSize:isTablet ? "0.85rem" : "0.9rem",
                  color:NAVY2,
                  transition:"all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                onMouseLeave={e => e.currentTarget.style.background = WHITE}
              >
                <FaRotateRight /> {!isTablet && <span>Refresh</span>}
              </button>
              <div style={{
                display:"flex",
                alignItems:"center",
                gap:8,
                background:WHITE,
                border:`1px solid ${BORDER}`,
                borderRadius:8,
                padding:isTablet ? "8px 12px" : "8px 16px"
              }}>
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  style={{ cursor:"pointer" }}
                />
                <label htmlFor="autoRefresh" style={{ fontSize:isTablet ? "0.85rem" : "0.9rem", color:NAVY2, cursor:"pointer" }}>
                  {!isTablet && <span>Auto-refresh </span>}({countdown}s)
                </label>
              </div>
              {!isTablet && lastRefresh && (
                <span style={{ fontSize:"0.8rem", color:SLATE_L }}>
                  Last: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
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
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width:"100%", padding:isMobile ? "8px 12px 8px 40" : "10px 12px 10px 40", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding:isMobile ? "8px 12px" : "10px 16px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2, background:WHITE, minWidth:isMobile ? "100%" : "auto" }}
            >
              <option value="All">All Status</option>
              <option value="Forwarded">Forwarded</option>
              <option value="Blood Ready">Blood Ready</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              style={{ padding:isMobile ? "8px 12px" : "10px 16px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2, background:WHITE, minWidth:isMobile ? "100%" : "auto" }}
            >
              <option value="All">All Urgency</option>
              {urgencyLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}
          >
            {loading ? (
              <div style={{ padding:isMobile ? "32px" : "48px", textAlign:"center" }}>
                <div style={{
                  width:isMobile ? 40 : 48, height:isMobile ? 40 : 48, border:"3px solid #E2E8F0", borderTopColor:RED,
                  borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 16px"
                }} />
                <p style={{ color:SLATE_L, fontSize:isMobile ? "0.85rem" : "0.9rem" }}>Loading blood requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div style={{ padding:isMobile ? "32px" : "48px", textAlign:"center" }}>
                <p style={{ color:SLATE_L, fontSize:isMobile ? "0.85rem" : "0.9rem" }}>No blood requests found</p>
              </div>
            ) : (
              <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:isMobile ? "600px" : "auto" }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${BORDER}`, background:SMOKE }}>
                      <th style={{ padding:isMobile ? "12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Request #</th>
                      <th style={{ padding:isMobile ? "12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Patient</th>
                      <th style={{ padding:isMobile ? "12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Blood Group</th>
                      <th style={{ padding:isMobile ? "12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Units</th>
                      <th style={{ padding:isMobile ? "12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Hospital</th>
                      <th style={{ padding:isMobile ? "12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Urgency</th>
                      <th style={{ padding:isMobile ? "12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Status</th>
                      <th style={{ padding:isMobile ? "12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Date</th>
                      <th style={{ padding:isMobile ? "12px" : "16px", textAlign:"left", fontSize:isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req, index) => (
                      <motion.tr
                        key={req._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        style={{
                          borderBottom:`1px solid ${BORDER}`,
                          animation: req.urgency === 'Critical' && req.status !== 'Completed' && req.status !== 'Rejected' ? 'criticalBlink 1s infinite' : 'none'
                        }}
                      >
                        <td style={{ padding:isMobile ? "12px" : "16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2, fontWeight:600 }}>#{req.requestNumber}</td>
                        <td style={{ padding:isMobile ? "12px" : "16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}>{req.patientName}</td>
                        <td style={{ padding:isMobile ? "12px" : "16px" }}>
                          <span style={{
                            padding:isMobile ? "3px 8px" : "4px 10px", borderRadius:6,
                            background:`${BG_COLOR[req.bloodGroup]}15`,
                            color:BG_COLOR[req.bloodGroup], fontSize:isMobile ? "0.7rem" : "0.75rem", fontWeight:600
                          }}>
                            {req.bloodGroup}
                          </span>
                        </td>
                        <td style={{ padding:isMobile ? "12px" : "16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2, fontWeight:600 }}>{req.units}</td>
                        <td style={{ padding:isMobile ? "12px" : "16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}>{req.hospitalName}</td>
                        <td style={{ padding:isMobile ? "12px" : "16px" }}>
                          <span style={{
                            padding:isMobile ? "3px 8px" : "4px 10px", borderRadius:6,
                            background:req.urgency === "Critical" ? "#FEE2E2" : req.urgency === "Moderate" ? "#FEF3C7" : "#DCFCE7",
                            color:req.urgency === "Critical" ? "#DC2626" : req.urgency === "Moderate" ? "#D97706" : "#16A34A",
                            fontSize:isMobile ? "0.7rem" : "0.75rem", fontWeight:600
                          }}>
                            {req.urgency}
                          </span>
                        </td>
                        <td style={{ padding:isMobile ? "12px" : "16px" }}>
                          <span style={{
                            padding:isMobile ? "3px 8px" : "4px 10px", borderRadius:6,
                            background:req.status === "Forwarded" ? "#DBEAFE" : req.status === "Blood Ready" ? "#DCFCE7" : "#FEE2E2",
                            color:req.status === "Forwarded" ? "#2563EB" : req.status === "Blood Ready" ? "#16A34A" : "#DC2626",
                            fontSize:isMobile ? "0.7rem" : "0.75rem", fontWeight:600
                          }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding:isMobile ? "12px" : "16px", fontSize:isMobile ? "0.85rem" : "0.9rem", color:SLATE_L }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding:isMobile ? "12px" : "16px" }}>
                          <div style={{ display:"flex", gap:8, flexWrap:isMobile ? "wrap" : "nowrap" }}>
                            {req.status === "Forwarded" && (
                              <>
                                <button
                                  onClick={() => handleApprove(req._id)}
                                  style={{
                                    background:`${RED}15`, border:"none", padding:isMobile ? "6px 12px" : "8px 16px", borderRadius:6,
                                    cursor:"pointer", color:RED, fontSize:isMobile ? "0.75rem" : "0.85rem", fontWeight:600, transition:"all 0.2s"
                                  }}
                                >
                                  <FaCheck style={{ marginRight:4 }} /> {!isMobile && <span>Approve & Prepare</span>}
                                </button>
                                <button
                                  onClick={() => handleReject(req._id)}
                                  style={{
                                    background:"rgba(220,38,38,0.1)", border:"none", padding:isMobile ? "6px 12px" : "8px 16px", borderRadius:6,
                                    cursor:"pointer", color:"#DC2626", fontSize:isMobile ? "0.75rem" : "0.85rem", fontWeight:600, transition:"all 0.2s"
                                  }}
                                >
                                  <FaXmark style={{ marginRight:4 }} /> {!isMobile && <span>Reject</span>}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
      
      {showEmergencyModal && (
        <div 
          onClick={() => {
            console.log('Overlay clicked');
            setShowEmergencyModal(false);
            if (alarmSound) {
              clearInterval(alarmSound);
              setAlarmSound(null);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div 
            onClick={(e) => {
              e.stopPropagation();
              console.log('Modal content clicked - preventing close');
            }}
            style={{
              background: WHITE,
              padding: '32px',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(220, 38, 38, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FaHeartPulse style={{ fontSize: '32px', color: RED }} />
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: NAVY2,
              margin: '0 0 12px'
            }}>
              EMERGENCY!
            </h2>
            <p style={{
              fontSize: '16px',
              color: SLATE_L,
              margin: '0 0 24px',
              lineHeight: '1.5'
            }}>
              Critical blood request detected. Please take immediate action.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('OK button clicked - closing modal and stopping sound');
                setShowEmergencyModal(false);
                setEmergencyAcknowledged(true);
                // Stop audio directly
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                  audioRef.current = null;
                  console.log('Audio stopped via audioRef');
                }
              }}
              style={{
                background: RED,
                color: WHITE,
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
      
      {showSuccessModal && (
        <div 
          onClick={() => setShowSuccessModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: WHITE,
              padding: '32px',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FaHeartPulse style={{ fontSize: '32px', color: '#22c55e' }} />
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: NAVY2,
              margin: '0 0 12px'
            }}>
              Success!
            </h2>
            <p style={{
              fontSize: '16px',
              color: SLATE_L,
              margin: '0 0 24px',
              lineHeight: '1.5'
            }}>
              {successMessage}
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                background: '#22c55e',
                color: WHITE,
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BloodBankRequests;
