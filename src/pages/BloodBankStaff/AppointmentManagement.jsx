import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useResponsive } from "../../utils/responsiveDesign";
import {
  FaCalendarCheck,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaDroplet,
  FaPlus,
  FaTimeline,
  FaUsers,
  FaHeartPulse,
  FaBell,
  FaUser,
  FaMagnifyingGlass,
  FaCheck,
  FaXmark,
  FaClock,
  FaCircleInfo,
  FaAward,
  FaLocationDot,
  FaStethoscope,
  FaCircleCheck,
  FaFloppyDisk,
  FaFileMedical,
  FaBuilding,
} from "react-icons/fa6";

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

function AppointmentManagement() {
  const { user } = useUser();
  const navigate = useNavigate();
  const screenSize = useResponsive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [unitsCollected, setUnitsCollected] = useState("1");

  const isMobile = screenSize === 'xs' || screenSize === 'sm';
  const isTablet = screenSize === 'md';
  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 68 : SIDEBAR_W);

  const nav = [
    { key:"bloodbank-dashboard", icon:<FaChartLine/>, label:"Dashboard", path:"/bloodbank-dashboard" },
    { key:"bloodbank-inventory", icon:<FaDroplet/>, label:"Blood Inventory", path:"/bloodbank-inventory" },
    { key:"bloodbank-add-stock", icon:<FaPlus/>, label:"Add Blood Stock", path:"/bloodbank-add-stock" },
    { key:"bloodbank-stock-history", icon:<FaClock/>, label:"Stock History", path:"/bloodbank-stock-history" },
    { key:"bloodbank-requests", icon:<FaStethoscope/>, label:"Blood Requests", path:"/bloodbank-requests" },
    { key:"donation-requests", icon:<FaHeartPulse/>, label:"Donation Requests", path:"/donation-requests" },
    { key:"campaign-management", icon:<FaAward/>, label:"Campaign Management", path:"/campaign-management" },
    { key:"appointment-management", icon:<FaCalendarCheck/>, label:"Appointments", path:"/appointment-management" },
    { key:"bloodbank-donors", icon:<FaUsers/>, label:"Donor List", path:"/bloodbank-donors" },
    { key:"bloodbank-details", icon:<FaLocationDot/>, label:"Blood Bank Details", path:"/bloodbank-details" },
    { key:"bloodbank-reports", icon:<FaCircleInfo/>, label:"Reports", path:"/bloodbank-reports" },
    { key:"bloodbank-notifications", icon:<FaBell/>, label:"Notifications", path:"/bloodbank-notifications" },
    { key:"bloodbank-profile", icon:<FaUser/>, label:"Profile", path:"/bloodbank-profile" },
  ];

  const active = "appointment-management";

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/bloodbank/appointments`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setLoading(false);
    }
  };

  const handleCompleteDonation = async () => {
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/bloodbank/appointments/${selectedAppointment._id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedBy: user?.id,
          completedDate: new Date().toISOString(),
          notes: completionNotes,
          unitsCollected: parseInt(unitsCollected),
        }),
      });
      if (response.ok) {
        setAppointments(appointments.map(apt => 
          apt._id === selectedAppointment._id ? { ...apt, status: "Completed" } : apt
        ));
        setShowCompleteModal(false);
        setSelectedAppointment(null);
        setCompletionNotes("");
        setUnitsCollected("1");
      }
    } catch (error) {
      console.error("Error completing donation:", error);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/bloodbank/appointments/${appointmentId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        setAppointments(appointments.map(apt => 
          apt._id === appointmentId ? { ...apt, status: "Cancelled" } : apt
        ));
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      Approved: { bg: `${GREEN}15`, color: GREEN, icon: <FaCheck /> },
      Completed: { bg: `${BLUE}15`, color: BLUE, icon: <FaCircleCheck /> },
      Cancelled: { bg: `${RED}15`, color: RED, icon: <FaXmark /> },
      Pending: { bg: `${YELLOW}15`, color: YELLOW, icon: <FaClock /> },
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

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.donorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.bloodGroup?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.bloodBankName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading appointments...</p>
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
              <FaCalendarCheck style={{ marginRight: 12, color: BLUE }} />
              Appointment Management
            </h1>
            <p style={{ fontSize: "1rem", color: SLATE_L }}>
              Manage approved blood donation appointments and complete donations
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
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: GREEN, marginBottom: 8 }}>
                {appointments.filter(a => a.status === "Approved").length}
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
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: BLUE, marginBottom: 8 }}>
                {appointments.filter(a => a.status === "Completed").length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Completed Donations
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
                {appointments.filter(a => a.status === "Approved").length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Pending Completion
              </div>
            </div>
            <div style={{
              background: WHITE,
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              padding: "24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: RED, marginBottom: 8 }}>
                {appointments.filter(a => a.status === "Cancelled").length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Cancelled
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
                placeholder="Search by donor name, blood group, or location..."
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
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </motion.div>

          {/* Appointment List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {filteredAppointments.length === 0 ? (
              <div style={{
                background: WHITE,
                borderRadius: 12,
                border: `1px solid ${BORDER}`,
                padding: "60px 20px",
                textAlign: "center",
                color: SLATE_L,
              }}>
                <FaCalendarCheck style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.3 }} />
                <p style={{ fontSize: "1rem" }}>No appointments found</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {filteredAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment._id}
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
                      background: `${BG_COLOR[appointment.bloodGroup] || RED}15`,
                      color: BG_COLOR[appointment.bloodGroup] || RED,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                    }}>
                      {appointment.bloodGroup}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, margin: 0 }}>
                          {appointment.donorName}
                        </h3>
                        <StatusBadge status={appointment.status} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 20, color: SLATE_L, fontSize: "0.9rem", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <FaCalendarCheck />
                          {new Date(appointment.preferredDate).toLocaleDateString()} at {appointment.preferredTime}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <FaLocationDot />
                          {appointment.location}
                        </div>
                      </div>
                      {appointment.doctor && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: SLATE_L, fontSize: "0.9rem" }}>
                          <FaStethoscope />
                          Dr. {appointment.doctor}
                        </div>
                      )}
                    </div>
                    {appointment.status === "Approved" && (
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowCompleteModal(true);
                          }}
                          style={{
                            padding: "10px 20px",
                            background: GREEN,
                            color: WHITE,
                            border: "none",
                            borderRadius: 8,
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <FaFloppyDisk /> Complete
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appointment._id)}
                          style={{
                            padding: "10px 20px",
                            background: RED,
                            color: WHITE,
                            border: "none",
                            borderRadius: 8,
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <FaXmark /> Cancel
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Complete Donation Modal */}
      {showCompleteModal && selectedAppointment && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: WHITE,
              borderRadius: 16,
              maxWidth: 500,
              width: "100%",
              padding: "32px",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, marginBottom: 24 }}>
              Complete Donation
            </h2>

            <div style={{
              padding: "16px",
              background: `${GREEN}10`,
              borderRadius: 8,
              border: `1px solid ${GREEN}30`,
              marginBottom: 24,
            }}>
              <div style={{ fontSize: "0.9rem", color: SLATE, marginBottom: 8 }}>
                <strong>Donor:</strong> {selectedAppointment.donorName}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE, marginBottom: 8 }}>
                <strong>Blood Group:</strong> {selectedAppointment.bloodGroup}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE }}>
                <strong>Appointment:</strong> {new Date(selectedAppointment.preferredDate).toLocaleDateString()} at {selectedAppointment.preferredTime}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: SLATE, marginBottom: 8 }}>
                  Units Collected *
                </label>
                <input
                  type="number"
                  value={unitsCollected}
                  onChange={(e) => setUnitsCollected(e.target.value)}
                  min="1"
                  max="2"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    fontSize: "0.95rem",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: SLATE, marginBottom: 8 }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Any additional notes about the donation..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    fontSize: "0.95rem",
                    minHeight: 80,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{
                padding: "12px",
                background: `${BLUE}10`,
                borderRadius: 8,
                border: `1px solid ${BLUE}30`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", color: NAVY2 }}>
                  <FaCircleInfo style={{ color: BLUE }} />
                  <span>A certificate will be automatically generated for the donor upon completion.</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setSelectedAppointment(null);
                    setCompletionNotes("");
                    setUnitsCollected("1");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: SMOKE,
                    color: NAVY2,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteDonation}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: GREEN,
                    color: WHITE,
                    border: "none",
                    borderRadius: 8,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Complete Donation
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AppointmentManagement;
