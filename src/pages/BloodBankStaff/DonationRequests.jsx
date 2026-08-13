import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine,
  FaDroplet,
  FaPlus,
  FaClock,
  FaHeartPulse,
  FaAward,
  FaCalendarCheck,
  FaUsers,
  FaFileMedical,
  FaBell,
  FaUser,
  FaBuilding,
  FaBars,
  FaRightFromBracket,
  FaMagnifyingGlass,
  FaCheck,
  FaXmark,
  FaCertificate,
  FaCalendar,
  FaLocationDot,
  FaCircleCheck,
  FaCircleInfo,
  FaEnvelope,
} from "react-icons/fa6";
import { useNotification } from "../../contexts/NotificationContext";
import { breakpoints, animationVariants, useResponsive } from "../../utils/responsiveDesign";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const GREEN = "#16A34A";
const BLUE = "#2563EB";
const YELLOW = "#F59E0B";
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
  "O-": "#8B0000"
};

function DonationRequests() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const screenSize = useResponsive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const [campaignRequests, setCampaignRequests] = useState([]);
  const [historyRequests, setHistoryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isMobile = screenSize === 'xs' || screenSize === 'sm';
  const isTablet = screenSize === 'md';
  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 68 : SIDEBAR_W);

  const nav = [
    { key:"bloodbank-dashboard", icon:<FaChartLine/>, label:"Dashboard", path:"/bloodbank-dashboard" },
    { key:"bloodbank-inventory", icon:<FaDroplet/>, label:"Blood Inventory", path:"/bloodbank-inventory" },
    { key:"bloodbank-add-stock", icon:<FaPlus/>, label:"Add Blood Stock", path:"/bloodbank-add-stock" },
    { key:"bloodbank-stock-history", icon:<FaClock/>, label:"Stock History", path:"/bloodbank-stock-history" },
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

  const active = "donation-requests";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      // Load ALL appointment requests from MongoDB (not just pending)
      const aptResponse = await fetch(`http://localhost:5000/api/bloodbank/appointment-requests`);
      if (aptResponse.ok) {
        const aptData = await aptResponse.json();
        console.log("Loaded appointment requests:", aptData);
        setAppointmentRequests(aptData);
        // Separate history (non-pending requests)
        setHistoryRequests(aptData.filter(req => ["Approved", "Rejected", "Completed"].includes(req.status)));
      } else {
        showNotification({ type: "error", title: "Error", message: "Failed to load appointment requests" });
      }

      // Load campaign participation requests from MongoDB
      const campResponse = await fetch(`http://localhost:5000/api/bloodbank/campaign-requests`);
      if (campResponse.ok) {
        const campData = await campResponse.json();
        setCampaignRequests(campData);
      } else {
        showNotification({ type: "error", title: "Error", message: "Failed to load campaign requests" });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading requests:", error);
      showNotification({ type: "error", title: "Error", message: "Error loading requests. Please try again." });
      setLoading(false);
    }
  };

  const handleApproveAppointment = async (requestId) => {
    console.log("Approving appointment with ID:", requestId);
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/bloodbank/appointment-requests/${requestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      console.log("Approve response:", data);
      if (response.ok) {
        showNotification({ type: "success", title: "Success", message: "Appointment approved successfully!" });
        // Reload data from MongoDB to get updated status
        await loadRequests();
      } else {
        showNotification({ type: "error", title: "Error", message: data.message || "Failed to approve appointment" });
      }
    } catch (error) {
      console.error("Error approving appointment:", error);
      showNotification({ type: "error", title: "Error", message: "Failed to approve appointment. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectAppointment = async (requestId) => {
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/bloodbank/appointment-requests/${requestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: "Rejected by blood bank staff" }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification({ type: "success", title: "Success", message: "Appointment rejected successfully!" });
        // Reload data from MongoDB to get updated status
        await loadRequests();
      } else {
        showNotification({ type: "error", title: "Error", message: data.message || "Failed to reject appointment" });
      }
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      showNotification({ type: "error", title: "Error", message: "Failed to reject appointment. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveCampaign = async (requestId) => {
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/bloodbank/campaign-requests/${requestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) {
        showNotification({ type: "success", title: "Success", message: "Campaign approved successfully!" });
        // Reload data from MongoDB to get updated status
        await loadRequests();
      } else {
        showNotification({ type: "error", title: "Error", message: data.message || "Failed to approve campaign" });
      }
    } catch (error) {
      console.error("Error approving campaign:", error);
      showNotification({ type: "error", title: "Error", message: "Failed to approve campaign. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectCampaign = async (requestId) => {
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/bloodbank/campaign-requests/${requestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: "Rejected by blood bank staff" }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification({ type: "success", title: "Success", message: "Campaign rejected successfully!" });
        // Reload data from MongoDB to get updated status
        await loadRequests();
      } else {
        showNotification({ type: "error", title: "Error", message: data.message || "Failed to reject campaign" });
      }
    } catch (error) {
      console.error("Error rejecting campaign:", error);
      showNotification({ type: "error", title: "Error", message: "Failed to reject campaign. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateCertificate = async (requestId) => {
    setSubmitting(true);
    try {
      // This endpoint now handles both certificate generation and status update to Completed
      const response = await fetch(`http://localhost:5000/api/bloodbank/appointment-requests/${requestId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showNotification({ type: "success", title: "Success", message: `Certificate generated successfully! Certificate Number: ${data.certificate.certificateNumber}` });
        // Reload data from MongoDB to get updated status
        await loadRequests();
      } else {
        showNotification({ type: "error", title: "Error", message: data.message || "Failed to generate certificate" });
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      showNotification({ type: "error", title: "Error", message: "Failed to generate certificate. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      Pending: { bg: `${YELLOW}15`, color: YELLOW, icon: <FaClock /> },
      Approved: { bg: `${GREEN}15`, color: GREEN, icon: <FaCheck /> },
      Rejected: { bg: `${RED}15`, color: RED, icon: <FaXmark /> },
      Completed: { bg: `${BLUE}15`, color: BLUE, icon: <FaCheck /> },
    };
    const style = styles[status] || styles.Pending;

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 20,
        background: style.bg,
        color: style.color,
        fontSize: "0.85rem",
        fontWeight: 600,
      }}>
        {style.icon}
        {status}
      </div>
    );
  };

  const filteredAppointmentRequests = appointmentRequests.filter(req => {
    const matchesSearch = 
      req.donorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.bloodGroup?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredCampaignRequests = campaignRequests.filter(req => {
    const matchesSearch = 
      req.donorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.campaignName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading requests...</p>
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
        <div style={{ padding:"24px 32px" }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 32 }}
          >
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: NAVY2, marginBottom: 8 }}>
              <FaHeartPulse style={{ marginRight: 12, color: RED }} />
              Donation Requests
            </h1>
            <p style={{ fontSize: "1rem", color: SLATE_L }}>
              Manage donor appointment and campaign participation requests
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              marginBottom: 32,
            }}
          >
            <div style={{
              background: WHITE,
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              padding: "24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: YELLOW, marginBottom: 8 }}>
                {appointmentRequests.filter(r => r.status === "Pending").length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Pending Appointments
              </div>
            </div>
            <div style={{
              background: WHITE,
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              padding: "24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: YELLOW, marginBottom: 8 }}>
                {campaignRequests.filter(r => r.status === "Pending").length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Pending Campaign Requests
              </div>
            </div>
            <div style={{
              background: WHITE,
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              padding: "24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: GREEN, marginBottom: 8 }}>
                {appointmentRequests.filter(r => r.status === "Approved").length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Approved Appointments
              </div>
            </div>
            <div style={{
              background: WHITE,
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              padding: "24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: GREEN, marginBottom: 8 }}>
                {campaignRequests.filter(r => r.status === "Approved").length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Approved Campaigns
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: WHITE,
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              padding: "20px",
              marginBottom: 24,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, minWidth: 250, position: "relative" }}>
              <FaMagnifyingGlass style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: SLATE_L,
              }} />
              <input
                type="text"
                placeholder="Search by donor name or blood group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 40px",
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                fontSize: "0.95rem",
                background: WHITE,
                color: NAVY2,
                cursor: "pointer",
              }}
            >
              <option value="all">All Types</option>
              <option value="appointments">Appointments</option>
              <option value="campaigns">Campaigns</option>
              <option value="history">History</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                fontSize: "0.95rem",
                background: WHITE,
                color: NAVY2,
                cursor: "pointer",
              }}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </motion.div>

          {/* Appointment Requests */}
          {(filterType === "all" || filterType === "appointments") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 32 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: NAVY2 }}>
                  Appointment Requests
                </h2>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  style={{
                    padding: "8px 16px",
                    background: BLUE,
                    color: WHITE,
                    border: "none",
                    borderRadius: 6,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {showHistory ? "Show Pending" : "Show History"}
                </button>
              </div>
              {filteredAppointmentRequests.length === 0 ? (
                <div style={{
                  background: WHITE,
                  borderRadius: 12,
                  border: `1px solid ${BORDER}`,
                  padding: "60px 20px",
                  textAlign: "center",
                  color: SLATE_L,
                }}>
                  <FaCalendarCheck style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.3 }} />
                  <p style={{ fontSize: "1rem" }}>No appointment requests found</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {filteredAppointmentRequests
                    .filter(req => showHistory ? ["Approved", "Rejected", "Completed"].includes(req.status) : req.status === "Pending")
                    .map((request, index) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        background: WHITE,
                        borderRadius: 12,
                        border: `1px solid ${BORDER}`,
                        padding: "24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 24,
                      }}
                    >
                      <div style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: `${BG_COLOR[request.bloodGroup] || RED}15`,
                        color: BG_COLOR[request.bloodGroup] || RED,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        fontWeight: 700,
                      }}>
                        {request.bloodGroup}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, margin: 0 }}>
                            {request.donorName}
                          </h3>
                          <StatusBadge status={request.status} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 20, color: SLATE_L, fontSize: "0.9rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaCalendarCheck />
                            {new Date(request.preferredDate).toLocaleDateString()}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaClock />
                            {request.preferredTime}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaLocationDot />
                            {request.location}
                          </div>
                        </div>
                      </div>
                      {request.status === "Pending" && (
                        <div style={{ display: "flex", gap: 12 }}>
                          <button
                            onClick={() => handleApproveAppointment(request._id)}
                            disabled={submitting}
                            style={{
                              padding: "10px 20px",
                              background: GREEN,
                              color: WHITE,
                              border: "none",
                              borderRadius: 8,
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              cursor: submitting ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectAppointment(request._id)}
                            disabled={submitting}
                            style={{
                              padding: "10px 20px",
                              background: RED,
                              color: WHITE,
                              border: "none",
                              borderRadius: 8,
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              cursor: submitting ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <FaXmark /> Reject
                          </button>
                        </div>
                      )}
                      {request.status === "Approved" && (
                        <div style={{ display: "flex", gap: 12 }}>
                          <button
                            onClick={() => handleGenerateCertificate(request._id)}
                            disabled={submitting}
                            style={{
                              padding: "10px 20px",
                              background: "#8B5CF6",
                              color: WHITE,
                              border: "none",
                              borderRadius: 8,
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              cursor: submitting ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <FaCertificate /> {submitting ? "Processing..." : "Complete & Generate Certificate"}
                          </button>
                        </div>
                      )}
                      {["Rejected", "Completed"].includes(request.status) && (
                        <div style={{
                          padding: "8px 16px",
                          background: request.status === "Completed" ? `${GREEN}15` : `${RED}15`,
                          borderRadius: 8,
                          color: request.status === "Completed" ? GREEN : RED,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}>
                          {request.status}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Campaign Requests */}
          {(filterType === "all" || filterType === "campaigns") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: NAVY2, marginBottom: 16 }}>
                Campaign Participation Requests
              </h2>
              {filteredCampaignRequests.length === 0 ? (
                <div style={{
                  background: WHITE,
                  borderRadius: 12,
                  border: `1px solid ${BORDER}`,
                  padding: "60px 20px",
                  textAlign: "center",
                  color: SLATE_L,
                }}>
                  <FaAward style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.3 }} />
                  <p style={{ fontSize: "1rem" }}>No campaign requests found</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {filteredCampaignRequests.map((request, index) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        background: WHITE,
                        borderRadius: 12,
                        border: `1px solid ${BORDER}`,
                        padding: "24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 24,
                      }}
                    >
                      <div style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: `${BG_COLOR[request.bloodGroup] || RED}15`,
                        color: BG_COLOR[request.bloodGroup] || RED,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        fontWeight: 700,
                      }}>
                        {request.bloodGroup}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, margin: 0 }}>
                            {request.donorName}
                          </h3>
                          <StatusBadge status={request.status} />
                        </div>
                        <div style={{ fontSize: "0.95rem", color: SLATE, marginBottom: 4 }}>
                          Campaign: {request.campaignName}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 20, color: SLATE_L, fontSize: "0.9rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaCalendarCheck />
                            {new Date(request.requestDate).toLocaleDateString()}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaEnvelope />
                            {request.donorEmail}
                          </div>
                        </div>
                      </div>
                      {request.status === "Pending" && (
                        <div style={{ display: "flex", gap: 12 }}>
                          <button
                            onClick={() => handleApproveCampaign(request._id)}
                            disabled={submitting}
                            style={{
                              padding: "10px 20px",
                              background: GREEN,
                              color: WHITE,
                              border: "none",
                              borderRadius: 8,
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              cursor: submitting ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectCampaign(request._id)}
                            disabled={submitting}
                            style={{
                              padding: "10px 20px",
                              background: RED,
                              color: WHITE,
                              border: "none",
                              borderRadius: 8,
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              cursor: submitting ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <FaXmark /> Reject
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DonationRequests;
