import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

function PatientDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const active = "patient-dashboard";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  // Patient data loaded from backend API
  const [myRequests, setMyRequests] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadPatientData();
    }
  }, [user]);

  const loadPatientData = async () => {
    try {
      // Load blood requests from backend (same endpoint as PatientBloodRequests)
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const bloodRequestsResponse = await fetch(`http://localhost:5000/api/patient/${user.id}?email=${email}`);
      if (bloodRequestsResponse.ok) {
        const data = await bloodRequestsResponse.json();
        setMyRequests(data.bloodRequests || []);

        // Generate reports from completed blood requests
        const completedRequests = (data.bloodRequests || []).filter(req => 
          req.status === 'Completed' || req.status === 'Blood Ready'
        );
        
        const bloodRequestReports = completedRequests.map((req) => ({
          id: `br-${req._id || req.id}`,
          name: `Blood Request Receipt - ${req.bloodGroup}`,
          date: req.completedAt || req.updatedAt || req.createdAt,
          type: "Blood Request",
          status: "Available",
          requestId: req._id || req.id,
          bloodGroup: req.bloodGroup,
          units: req.units,
          hospital: req.hospitalName || req.hospital,
          amount: req.amount || 0
        }));

        setMyReports(bloodRequestReports);
      }

      // Load appointments from backend
      const appointmentsResponse = await fetch(`http://localhost:5000/api/appointments/patient/${user.id}`);
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setMyAppointments(appointmentsData);
      }

      // For notifications, we'll use placeholder data
      setNotifications([
        { id: 1, message: "Welcome to the Patient Portal", time: "Just now", read: false },
        { id: 2, message: "Your profile has been updated", time: "2 hours ago", read: true },
      ]);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, value, label, color }) => (
    <div style={{
      background: WHITE,
      borderRadius: 12,
      padding: isMobile ? "16px" : "20px",
      border: `1px solid ${BORDER}`,
      display: "flex",
      alignItems: "center",
      gap: isMobile ? 12 : 16,
      cursor: "default"
    }}>
      <div style={{
        width: isMobile ? 40 : 48,
        height: isMobile ? 40 : 48,
        borderRadius: 12,
        background: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color,
        fontSize: isMobile ? "1.1rem" : "1.3rem",
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: isMobile ? "1.5rem" : "1.8rem", fontWeight: 800, color: NAVY2, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: SLATE_L, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );

  const BloodBadge = ({ group }) => (
    <span style={{
      padding: "4px 10px",
      borderRadius: 6,
      background: `${BG_COLOR[group] || RED}15`,
      color: BG_COLOR[group] || RED,
      fontSize: "0.75rem",
      fontWeight: 700,
    }}>
      {group}
    </span>
  );

  const StatusPill = ({ status }) => {
    const colors = {
      "Pending": "#F59E0B",
      "Completed": "#16A34A",
      "Scheduled": "#2563EB",
      "Available": "#16A34A",
      "Cancelled": "#DC2626",
    };
    return (
      <span style={{
        padding: "4px 10px",
        borderRadius: 6,
        background: `${colors[status] || "#64748B"}15`,
        color: colors[status] || "#64748B",
        fontSize: "0.75rem",
        fontWeight: 600,
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading your dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:FONT }}>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 999
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? (mobileMenuOpen ? 260 : 0) : w,
        background:SIDEBAR_COL, color:WHITE,
        display:"flex", flexDirection:"column", transition:"width 0.3s ease",
        position: isMobile ? "fixed" : "fixed", height:"100vh", zIndex:1000,
        overflowX: "hidden"
      }}>
        <div style={{
          padding: sidebarCollapsed ? "0 16px" : "0 24px",
          height:64, display:"flex", alignItems:"center", justifyContent:"space-between",
          borderBottom:"1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            color:WHITE, fontWeight:700, fontSize:"1.1rem"
          }}>
            <FaDroplet style={{ color:RED, fontSize:"1.4rem" }} />
            {!sidebarCollapsed && <span>Patient Portal</span>}
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

        <div style={{ padding:"16px 12px", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
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
              fontSize:"0.9rem",
              transition:"all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize:"1.1rem" }}><FaRightFromBracket /></span>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: isMobile ? 0 : w, flex:1, minHeight:"100vh", background:SMOKE, overflowX:"hidden" }}>
        <div style={{ padding: isMobile ? "16px" : "24px 32px", maxWidth:"100%", overflowX:"hidden" }}>
          {/* Mobile Header */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}
            >
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  padding: "10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FaBars style={{ fontSize: "1.2rem", color: NAVY2 }} />
              </button>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: NAVY2,
                fontWeight: 700,
                fontSize: "1rem"
              }}>
                <FaDroplet style={{ color: RED, fontSize: "1.2rem" }} />
                <span>HRBMS</span>
              </div>
            </motion.div>
          )}
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: isMobile ? 24 : 32, display:"flex", justifyContent:"space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 16 : 0 }}
          >
            <div>
              <h1 style={{ fontSize: isMobile ? "1.5rem" : "1.8rem", fontWeight:800, color:NAVY2, margin:"0 0 8px 0" }}>
                Patient Dashboard
              </h1>
              <p style={{ color:SLATE_L, fontSize: isMobile ? "0.9rem" : "1rem", margin:0 }}>
                Welcome back, {user?.firstName || "Patient"}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/book-appointment-wizard")}
              style={{
                background: RED,
                color: WHITE,
                border: "none",
                borderRadius: 10,
                padding: isMobile ? "12px 20px" : "12px 24px",
                fontSize: isMobile ? "0.85rem" : "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: isMobile ? "100%" : "auto",
                justifyContent: "center"
              }}
            >
              <FaPlus />
              Book New Appointment
            </motion.button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 12 : 20, marginBottom: isMobile ? 24 : 32 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <StatCard icon={<FaHeartPulse />} value={myRequests.length} label="Blood Requests" color={RED} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <StatCard icon={<FaFileMedical />} value={myReports.length} label="Medical Reports" color="#2563EB" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <StatCard icon={<FaCalendarDays />} value={myAppointments.length} label="Appointments" color="#7C3AED" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <StatCard icon={<FaDroplet />} value={myRequests.filter(r => r.status === "Completed").length} label="Completed Requests" color="#16A34A" />
            </motion.div>
          </motion.div>

          {/* Main Content Grid */}
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: isMobile ? 16 : 24 }}>
            {/* Left Column */}
            <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
              {/* My Blood Requests */}
              <div style={{
                background:WHITE,
                borderRadius:12,
                border:`1px solid ${BORDER}`,
                padding:"24px",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:NAVY2, margin:0 }}>
                    My Blood Requests
                  </h2>
                  <button
                    onClick={() => navigate("/blood-requests")}
                    style={{
                      background:"transparent",
                      border:"none",
                      color:RED,
                      fontSize:"0.85rem",
                      fontWeight:600,
                      cursor:"pointer",
                      display:"flex",
                      alignItems:"center",
                      gap:4,
                    }}
                  >
                    View All <FaArrowRight />
                  </button>
                </div>
                {myRequests.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 20px", color:SLATE_L }}>
                    <FaHeartPulse style={{ fontSize:"2.5rem", marginBottom:12, opacity:0.3 }} />
                    <p>No blood requests yet</p>
                    <button
                      onClick={() => navigate("/blood-requests")}
                      style={{
                        marginTop:16,
                        background:RED,
                        color:WHITE,
                        border:"none",
                        borderRadius:8,
                        padding:"10px 20px",
                        fontSize:"0.85rem",
                        fontWeight:600,
                        cursor:"pointer",
                      }}
                    >
                      Create Request
                    </button>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {myRequests.map((request) => (
                      <div
                        key={request._id || request.id}
                        style={{
                          padding:"16px",
                          background:SMOKE,
                          borderRadius:8,
                          border:`1px solid ${BORDER}`,
                          display:"flex",
                          justifyContent:"space-between",
                          alignItems:"center",
                        }}
                      >
                        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                          <BloodBadge group={request.bloodGroup} />
                          <div>
                            <div style={{ fontWeight:600, color:NAVY2, fontSize:"0.9rem" }}>
                              {request.units} unit{request.units > 1 ? "s" : ""}
                            </div>
                            <div style={{ fontSize:"0.8rem", color:SLATE_L }}>
                              {request.hospitalName || request.hospital} • {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : request.date}
                            </div>
                          </div>
                        </div>
                        <StatusPill status={request.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* My Appointments */}
              <div style={{
                background:WHITE,
                borderRadius:12,
                border:`1px solid ${BORDER}`,
                padding:"24px",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:NAVY2, margin:0 }}>
                    My Appointments
                  </h2>
                  <button
                    onClick={() => navigate("/appointments")}
                    style={{
                      background:"transparent",
                      border:"none",
                      color:RED,
                      fontSize:"0.85rem",
                      fontWeight:600,
                      cursor:"pointer",
                      display:"flex",
                      alignItems:"center",
                      gap:4,
                    }}
                  >
                    View All <FaArrowRight />
                  </button>
                </div>
                {myAppointments.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 20px", color:SLATE_L }}>
                    <FaCalendarDays style={{ fontSize:"2.5rem", marginBottom:12, opacity:0.3 }} />
                    <p>No upcoming appointments</p>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {myAppointments.map((appointment) => (
                      <div
                        key={appointment._id || appointment.id}
                        style={{
                          padding:"16px",
                          background:SMOKE,
                          borderRadius:8,
                          border:`1px solid ${BORDER}`,
                          display:"flex",
                          justifyContent:"space-between",
                          alignItems:"center",
                        }}
                      >
                        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                          <div style={{
                            width:40,
                            height:40,
                            borderRadius:8,
                            background:`${RED}15`,
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            color:RED,
                          }}>
                            <FaCalendarDays />
                          </div>
                          <div>
                            <div style={{ fontWeight:600, color:NAVY2, fontSize:"0.9rem" }}>
                              {appointment.department || appointment.type}
                            </div>
                            <div style={{ fontSize:"0.8rem", color:SLATE_L }}>
                              {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : appointment.date} at {appointment.appointmentTime || appointment.time}
                            </div>
                            <div style={{ fontSize:"0.75rem", color:SLATE_L }}>
                              {appointment.hospitalName || appointment.hospital}
                            </div>
                          </div>
                        </div>
                        <StatusPill status={appointment.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
              {/* Notifications */}
              <div style={{
                background:WHITE,
                borderRadius:12,
                border:`1px solid ${BORDER}`,
                padding:"24px",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:NAVY2, margin:0 }}>
                    Notifications
                  </h2>
                  <button
                    onClick={() => navigate("/notifications")}
                    style={{
                      background:"transparent",
                      border:"none",
                      color:RED,
                      fontSize:"0.85rem",
                      fontWeight:600,
                      cursor:"pointer",
                    }}
                  >
                    View All
                  </button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      style={{
                        padding:"12px",
                        background: notification.read ? SMOKE : `${RED}08`,
                        borderRadius:8,
                        border: notification.read ? `1px solid ${BORDER}` : `1px solid ${RED}30`,
                        display:"flex",
                        gap:12,
                        alignItems:"flex-start",
                      }}
                    >
                      <div style={{
                        width:8,
                        height:8,
                        borderRadius:"50%",
                        background: notification.read ? SLATE_L : RED,
                        flexShrink:0,
                        marginTop:6,
                      }} />
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:"0.85rem", color:NAVY2, fontWeight:500, margin:0, lineHeight:1.4 }}>
                          {notification.message}
                        </p>
                        <span style={{ fontSize:"0.75rem", color:SLATE_L }}>{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PatientDashboard;
