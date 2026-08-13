import React, { useState, useEffect, useCallback, useRef } from "react";
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
  FaEye,
  FaPen,
  FaTrash,
  FaCheck,
  FaXmark,
  FaRotateRight,
  FaCheckDouble,
  FaLock,
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

function HospitalBloodRequests() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterBloodGroup, setFilterBloodGroup] = useState("All");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [alarmSound, setAlarmSound] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyAcknowledged, setEmergencyAcknowledged] = useState(false);
  const audioRef = useRef(null);

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

  const active = "hospital-blood-requests";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  const loadBloodRequests = useCallback(async () => {
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/blood-requests`);
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
    const hasForwardedCritical = bloodRequests.some(req => req.urgency === 'Critical' && req.status === 'Forwarded');
    
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
    
    // Show emergency modal for critical requests (but not if already forwarded or acknowledged)
    if (hasCritical && !hasForwardedCritical && !showEmergencyModal && !emergencyAcknowledged) {
      setShowEmergencyModal(true);
    }
    
    // Reset acknowledged flag when no critical requests
    if (!hasCritical) {
      setEmergencyAcknowledged(false);
    }
    
    // Only play sound if there are critical requests that are NOT forwarded
    if (hasCritical && !hasForwardedCritical) {
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

  const filteredRequests = bloodRequests.filter(req => 
    (req.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.hospital?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.bloodGroup?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterUrgency === "All" || req.urgency === filterUrgency) &&
    (filterStatus === "All" || req.status === filterStatus) &&
    (filterBloodGroup === "All" || req.bloodGroup === filterBloodGroup)
  );

  const handleStatusUpdate = async (requestId, newStatus, patientClerkId) => {
    try {
      let endpoint = '';
      let body = {};

      switch (newStatus) {
        case 'Under Verification':
          endpoint = `https://hospital-resource-and-blood-bank.onrender.com/api/blood-requests/${requestId}/status/under-verification`;
          body = {
            hospitalId: user?.id || "",
            hospitalName: "Hospital",
            verifiedBy: user?.id || "",
            verifiedByName: user?.fullName || "Hospital Staff"
          };
          break;
        case 'Forwarded':
          endpoint = `https://hospital-resource-and-blood-bank.onrender.com/api/blood-requests/${requestId}/status/forwarded`;
          body = {
            bloodBankId: "",
            bloodBankName: "Blood Bank",
            forwardedBy: user?.id || "",
            forwardedByName: user?.fullName || "Hospital Staff"
          };
          break;
        case 'Completed':
          endpoint = `https://hospital-resource-and-blood-bank.onrender.com/api/blood-requests/${requestId}/status/completed`;
          body = {
            issuedBy: user?.id || "",
            issuedByName: user?.fullName || "Hospital Staff"
          };
          break;
        case 'Rejected':
          endpoint = `https://hospital-resource-and-blood-bank.onrender.com/api/blood-requests/${requestId}/status/rejected`;
          body = {
            rejectedBy: user?.id || "",
            rejectedByName: user?.fullName || "Hospital Staff",
            rejectionReason: "Request rejected"
          };
          break;
        default:
          console.error('Unknown status:', newStatus);
          return;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // Reload blood requests
        const reloadResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/blood-requests`);
        if (reloadResponse.ok) {
          const data = await reloadResponse.json();
          setBloodRequests(data);
          setLastRefresh(new Date());
        }
      }
    } catch (error) {
      console.error('Error updating blood request:', error);
    }
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/blood-requests`);
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

  const BloodBadge = ({ group }) => (
    <span style={{
      padding: "6px 14px",
      borderRadius: 8,
      background: `${BG_COLOR[group] || RED}15`,
      color: BG_COLOR[group] || RED,
      fontSize: "0.85rem",
      fontWeight: 600
    }}>
      {group}
    </span>
  );

  const UrgencyBadge = ({ urgency }) => {
    const colors = {
      "Critical": "#FEE2E2",
      "High": "#FEF3C7",
      "Medium": "#DBEAFE",
      "Low": "#DCFCE7"
    };
    const textColors = {
      "Critical": "#DC2626",
      "High": "#D97706",
      "Medium": "#2563EB",
      "Low": "#16A34A"
    };
    return (
      <span style={{
        padding:"4px 12px",
        borderRadius:12,
        fontSize:"0.75rem",
        fontWeight:600,
        background:colors[urgency] || "#F3F4F6",
        color:textColors[urgency] || "#6B7280"
      }}>
        {urgency}
      </span>
    );
  };

  const StatusPill = ({ status }) => {
    const colors = {
      "Pending": "#FEF3C7",
      "Under Verification": "#E0E7FF",
      "Forwarded": "#DBEAFE",
      "Blood Ready": "#DCFCE7",
      "Rejected": "#FEE2E2",
      "Completed": "#E0E7FF"
    };
    const textColors = {
      "Pending": "#D97706",
      "Under Verification": "#4F46E5",
      "Forwarded": "#2563EB",
      "Blood Ready": "#16A34A",
      "Rejected": "#DC2626",
      "Completed": "#4F46E5"
    };
    return (
      <span style={{
        padding:"4px 12px",
        borderRadius:12,
        fontSize:"0.75rem",
        fontWeight:600,
        background:colors[status] || "#F3F4F6",
        color:textColors[status] || "#6B7280"
      }}>
        {status}
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading blood requests...</p>
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
                Hospital Blood Requests
              </h1>
              <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
                Manage all blood requests from patients
              </p>
            </div>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <button
                onClick={handleManualRefresh}
                style={{
                  background:WHITE,
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  padding:"8px 16px",
                  display:"flex",
                  alignItems:"center",
                  gap:8,
                  cursor:"pointer",
                  fontSize:"0.9rem",
                  color:NAVY2,
                  transition:"all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                onMouseLeave={e => e.currentTarget.style.background = WHITE}
              >
                <FaRotateRight /> Refresh
              </button>
              <div style={{
                display:"flex",
                alignItems:"center",
                gap:8,
                background:WHITE,
                border:`1px solid ${BORDER}`,
                borderRadius:8,
                padding:"8px 16px"
              }}>
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  style={{ cursor:"pointer" }}
                />
                <label htmlFor="autoRefresh" style={{ fontSize:"0.9rem", color:NAVY2, cursor:"pointer" }}>
                  Auto-refresh ({countdown}s)
                </label>
              </div>
              {lastRefresh && (
                <span style={{ fontSize:"0.8rem", color:SLATE_L }}>
                  Last: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
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
                  placeholder="Search requests..."
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
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                style={{
                  background:WHITE,
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  padding:"8px 16px",
                  fontSize:"0.9rem",
                  color:NAVY2,
                  cursor:"pointer"
                }}
              >
                <option value="All">All Urgency</option>
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  background:WHITE,
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  padding:"8px 16px",
                  fontSize:"0.9rem",
                  color:NAVY2,
                  cursor:"pointer"
                }}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Forwarded">Forwarded</option>
                <option value="Blood Ready">Blood Ready</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                value={filterBloodGroup}
                onChange={(e) => setFilterBloodGroup(e.target.value)}
                style={{
                  background:WHITE,
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  padding:"8px 16px",
                  fontSize:"0.9rem",
                  color:NAVY2,
                  cursor:"pointer"
                }}
              >
                <option value="All">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Blood Requests Table */}
          <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>All Blood Requests ({filteredRequests.length})</h2>
            </div>
            {filteredRequests.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:SLATE_L }}>
                <FaHeartPulse style={{ fontSize:"3rem", marginBottom:16, opacity:0.3 }} />
                <p style={{ fontSize:"1rem", marginBottom:16 }}>No blood requests found</p>
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:SMOKE, borderBottom:`1px solid ${BORDER}` }}>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Request ID</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Patient</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Blood Group</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Units</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Hospital</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Date</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Urgency</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Status</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Payment</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr 
                        key={req._id || req.id} 
                        style={{ 
                          borderBottom:`1px solid ${BORDER}`, 
                          transition:"background 0.2s",
                          animation: req.urgency === 'Critical' && req.status !== 'Completed' && req.status !== 'Rejected' ? 'criticalBlink 1s infinite' : 'none'
                        }} 
                        onMouseEnter={e => e.currentTarget.style.background = SMOKE} 
                        onMouseLeave={e => e.currentTarget.style.background = WHITE}
                      >
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2, fontWeight:600 }}>#{req.requestNumber || req.id}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{req.patientName}</td>
                        <td style={{ padding:"16px 24px" }}><BloodBadge group={req.bloodGroup} /></td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{req.units}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>{req.hospitalName || req.hospital}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding:"16px 24px" }}><UrgencyBadge urgency={req.urgency} /></td>
                        <td style={{ padding:"16px 24px" }}><StatusPill status={req.status} /></td>
                        <td style={{ padding:"16px 24px" }}>
                          {req.paymentStatus === 'Paid' ? (
                            <div style={{ display:"flex", alignItems:"center", gap:4, color:"#16A34A", fontWeight:600 }}>
                              <FaCheckDouble /> Paid
                            </div>
                          ) : (
                            <span style={{ color:SLATE_L, fontSize:"0.85rem" }}>Unpaid</span>
                          )}
                        </td>
                        <td style={{ padding:"16px 24px" }}>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            {req.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(req._id, "Under Verification", req.patientClerkId)}
                                  style={{
                                    background:WHITE,
                                    border:`1px solid ${BORDER}`,
                                    padding:"6px 12px",
                                    borderRadius:6,
                                    cursor:"pointer",
                                    fontSize:"0.85rem",
                                    color:"#4F46E5",
                                    display:"flex",
                                    alignItems:"center",
                                    gap:4
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                                  onMouseLeave={e => e.currentTarget.style.background = WHITE}
                                >
                                  <FaEye /> Start Verification
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(req._id, "Rejected", req.patientClerkId)}
                                  style={{
                                    background:WHITE,
                                    border:`1px solid ${BORDER}`,
                                    padding:"6px 12px",
                                    borderRadius:6,
                                    cursor:"pointer",
                                    fontSize:"0.85rem",
                                    color:"#DC2626",
                                    display:"flex",
                                    alignItems:"center",
                                    gap:4
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                                  onMouseLeave={e => e.currentTarget.style.background = WHITE}
                                >
                                  <FaXmark /> Reject
                                </button>
                              </>
                            )}
                            {req.status === "Under Verification" && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(req._id, "Forwarded", req.patientClerkId)}
                                  style={{
                                    background:WHITE,
                                    border:`1px solid ${BORDER}`,
                                    padding:"6px 12px",
                                    borderRadius:6,
                                    cursor:"pointer",
                                    fontSize:"0.85rem",
                                    color:"#2563EB",
                                    display:"flex",
                                    alignItems:"center",
                                    gap:4
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                                  onMouseLeave={e => e.currentTarget.style.background = WHITE}
                                >
                                  <FaArrowRight /> Forward to Blood Bank
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(req._id, "Rejected", req.patientClerkId)}
                                  style={{
                                    background:WHITE,
                                    border:`1px solid ${BORDER}`,
                                    padding:"6px 12px",
                                    borderRadius:6,
                                    cursor:"pointer",
                                    fontSize:"0.85rem",
                                    color:"#DC2626",
                                    display:"flex",
                                    alignItems:"center",
                                    gap:4
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                                  onMouseLeave={e => e.currentTarget.style.background = WHITE}
                                >
                                  <FaXmark /> Reject
                                </button>
                              </>
                            )}
                            {req.status === "Blood Ready" && (
                              <>
                                {req.paymentStatus === 'Paid' ? (
                                  <button
                                    onClick={() => handleStatusUpdate(req._id, "Completed", req.patientClerkId)}
                                    style={{
                                      background:WHITE,
                                      border:`1px solid ${BORDER}`,
                                      padding:"6px 12px",
                                      borderRadius:6,
                                      cursor:"pointer",
                                      fontSize:"0.85rem",
                                      color:"#4F46E5",
                                      display:"flex",
                                      alignItems:"center",
                                      gap:4
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                                    onMouseLeave={e => e.currentTarget.style.background = WHITE}
                                  >
                                    <FaCheck /> Issue Blood / Complete
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    style={{
                                      background:SMOKE,
                                      border:`1px solid ${BORDER}`,
                                      padding:"6px 12px",
                                      borderRadius:6,
                                      cursor:"not-allowed",
                                      fontSize:"0.85rem",
                                      color:SLATE_L,
                                      display:"flex",
                                      alignItems:"center",
                                      gap:4
                                    }}
                                    title="Patient must complete payment first"
                                  >
                                    <FaLock /> Payment Required
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
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
    </div>
  );
}

export default HospitalBloodRequests;
