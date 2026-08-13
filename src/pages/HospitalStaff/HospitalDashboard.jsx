import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  FaBox,
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

function HospitalDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const active = "hospital-dashboard";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  // Hospital data loaded from MongoDB
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bloodInventory, setBloodInventory] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (user?.id) {
      // Load hospital data from MongoDB
      const loadHospitalData = async () => {
        try {
          // Load patients
          const patientResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/all`);
          if (patientResponse.ok) {
            const patientData = await patientResponse.json();
            const patientsArray = Array.isArray(patientData) ? patientData : [];
            setTotalPatients(patientsArray.length);
          }
          
          // Load doctors
          const doctorResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/doctors`);
          if (doctorResponse.ok) {
            const doctorData = await doctorResponse.json();
            const doctorsArray = Array.isArray(doctorData) ? doctorData : [];
            setTotalDoctors(doctorsArray.length);
          }
          
          // Load appointments
          const appointmentResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/appointments`);
          if (appointmentResponse.ok) {
            const appointmentData = await appointmentResponse.json();
            const appointmentsArray = Array.isArray(appointmentData) ? appointmentData : [];
            
            // Filter appointments for today
            const today = new Date().toISOString().split('T')[0];
            const todayAppointments = appointmentsArray.filter(apt => apt.appointmentDate === today);
            setTotalAppointments(todayAppointments.length);
            
            // Create recent activity from appointments
            const appointmentActivity = appointmentsArray.slice(0, 3).map(apt => ({
              type: 'appointment',
              patientName: apt.patientName || 'Unknown',
              action: 'Booked appointment',
              details: `${apt.department} - ${apt.appointmentDate}`,
              date: apt.createdAt,
              status: apt.status
            }));
            setRecentActivity(appointmentActivity);
          }
          
          // Load blood requests
          const bloodRequestResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/blood-requests`);
          if (bloodRequestResponse.ok) {
            const bloodRequestData = await bloodRequestResponse.json();
            const bloodRequestsArray = Array.isArray(bloodRequestData) ? bloodRequestData : [];
            setBloodRequests(bloodRequestsArray);
          }
          
          // Load blood inventory
          const inventoryResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/blood-inventory`);
          if (inventoryResponse.ok) {
            const inventoryData = await inventoryResponse.json();
            setBloodInventory(inventoryData || []);
          }
          
        } catch (error) {
          console.error('Error loading hospital data:', error);
        }
        setLoading(false);
      };
      loadHospitalData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const StatCard = ({ icon, value, label, color, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -5, scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
      style={{
        background: WHITE,
        borderRadius: 12,
        padding: "20px",
        border: `1px solid ${BORDER}`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        cursor: "pointer"
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: delay + 0.2, ease: "easeOut" }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          fontSize: "1.5rem"
        }}
      >
        {icon}
      </motion.div>
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
          style={{ fontSize: "1.8rem", fontWeight: 800, color: NAVY2, lineHeight: 1 }}
        >
          {value}
        </motion.div>
        <div style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>{label}</div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: SMOKE,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center" }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: 48,
              height: 48,
              border: "3px solid #E2E8F0",
              borderTopColor: RED,
              borderRadius: "50%",
              margin: "0 auto 16px",
            }}
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ color: SLATE_L, fontSize: "0.9rem" }}
          >
            Loading dashboard...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div style={{ fontFamily: FONT, background: SMOKE, minHeight: "100vh", display: "flex" }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 300,
            background: RED,
            color: WHITE,
            border: "none",
            borderRadius: 8,
            padding: 12,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(196,18,48,0.3)"
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaBars style={{ fontSize: "1.2rem" }} />
        </motion.button>
      )}

      {/* Mobile Menu Overlay */}
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
            zIndex: 250
          }}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={isMobile ? { x: -300 } : {}}
        animate={isMobile ? (mobileMenuOpen ? { x: 0 } : { x: -300 }) : {}}
        transition={{ duration: 0.3 }}
        style={{
          width: isMobile ? 280 : w,
          minHeight: "100vh",
          background: SIDEBAR_COL,
          position: isMobile ? "fixed" : "fixed",
          top: 0,
          left: 0,
          zIndex: isMobile ? 260 : 200,
          display: "flex",
          flexDirection: "column",
          transition: isMobile ? "transform 0.3s ease" : "width 0.3s ease"
        }}
      >
        <div style={{
          height: 64,
          borderBottom: `1px solid rgba(255,255,255,0.1)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 20px" : (sidebarCollapsed ? "0 16px" : "0 24px")
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: WHITE,
            fontWeight: 700,
            fontSize: isMobile ? "1rem" : "1.1rem"
          }}>
            <FaDroplet style={{ color: RED, fontSize: "1.4rem" }} />
            {(!sidebarCollapsed || isMobile) && <span>Hospital Staff</span>}
          </div>
          {!isMobile && (
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
              background: "none",
              border: "none",
              color: WHITE,
              cursor: "pointer",
              padding: 4,
              borderRadius: 4
            }}>
              <FaBars />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, padding: isMobile ? "16px" : "16px 12px", overflowY: "auto" }}>
          {nav.map((item) => (
            <motion.button
              key={item.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileMenuOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: isMobile ? "14px 16px" : "12px 16px",
                borderRadius: 8,
                border: "none",
                background: active === item.key ? RED : "transparent",
                color: WHITE,
                cursor: "pointer",
                marginBottom: 4,
                fontSize: isMobile ? "0.95rem" : "0.9rem"
              }}
            >
              <span style={{ fontSize: "1.1rem", minWidth: 20 }}>{item.icon}</span>
              {(!sidebarCollapsed || isMobile) && <span>{item.label}</span>}
            </motion.button>
          ))}
        </nav>

        <div style={{ padding: isMobile ? "16px" : "16px 12px", borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          <SignOutButton>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: isMobile ? "14px 16px" : "12px 16px",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                color: WHITE,
                cursor: "pointer",
                fontSize: isMobile ? "0.95rem" : "0.9rem"
              }}
            >
              <span style={{ fontSize: "1.1rem", minWidth: 20 }}><FaRightFromBracket /></span>
              {(!sidebarCollapsed || isMobile) && <span>Logout</span>}
            </motion.button>
          </SignOutButton>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main style={{ marginLeft: isMobile ? 0 : w, flex: 1, minHeight: "100vh" }}>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ padding: isMobile ? "80px 16px 24px" : "24px 32px" }}
        >
          <motion.div style={{ marginBottom: isMobile ? 24 : 32 }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 style={{ fontSize: isMobile ? "1.4rem" : "1.8rem", fontWeight: 800, color: NAVY2, margin: "0 0 8px 0" }}>
              Hospital Dashboard
            </h1>
            <p style={{ color: SLATE_L, fontSize: isMobile ? "0.9rem" : "1rem", margin: 0 }}>
              Welcome back! Here's your hospital overview.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(240px, 1fr))",
              gap: isMobile ? 12 : 20,
              marginBottom: isMobile ? 24 : 32
            }}
          >
            <StatCard icon={<FaUsers />} value={totalPatients} label="Total Patients" color="#2563EB" delay={0.1} />
            <StatCard icon={<FaStethoscope />} value={totalDoctors} label="Total Doctors" color="#16A34A" delay={0.2} />
            <StatCard icon={<FaCalendarDays />} value={totalAppointments} label="Appointments Today" color="#F59E0B" delay={0.3} />
            <StatCard icon={<FaHeartPulse />} value={bloodRequests.length} label="Blood Requests" color={RED} delay={0.4} />
          </motion.div>

          {/* Blood Inventory Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden", marginBottom: isMobile ? 24 : 32 }}
          >
            <div style={{ padding: isMobile ? "16px" : "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 0 }}>
              <h2 style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight: 700, color: NAVY2, margin: 0 }}>Blood Inventory Summary</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/hospital-blood-inventory")}
                style={{
                  background: RED,
                  color: WHITE,
                  border: "none",
                  padding: isMobile ? "8px 12px" : "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: isMobile ? "0.8rem" : "0.85rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap"
                }}
              >
                Manage Inventory <FaArrowRight style={{ fontSize: "0.7rem" }} />
              </motion.button>
            </div>
            <div style={{ padding: isMobile ? "16px" : "24px" }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: isMobile ? 8 : 16
                }}
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bloodGroup, index) => (
                  <motion.div
                    key={bloodGroup}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + (index * 0.05), duration: 0.3 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    style={{
                      background: SMOKE,
                      borderRadius: 8,
                      padding: isMobile ? 12 : 16,
                      textAlign: "center",
                      border: `1px solid ${BORDER}`,
                      cursor: "pointer"
                    }}
                  >
                    <div style={{
                      padding: isMobile ? "4px 8px" : "6px 12px",
                      borderRadius: 6,
                      background: `${BG_COLOR[bloodGroup] || RED}15`,
                      color: BG_COLOR[bloodGroup] || RED,
                      fontSize: isMobile ? "0.8rem" : "0.9rem",
                      fontWeight: 700,
                      marginBottom: isMobile ? 6 : 8,
                      display: "inline-block"
                    }}>
                      {bloodGroup}
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + (index * 0.05) }}
                      style={{ fontSize: isMobile ? "1.2rem" : "1.5rem", fontWeight: 800, color: NAVY2 }}
                    >
                      {bloodInventory.find(inv => inv.bloodGroup === bloodGroup)?.units || 0}
                    </motion.div>
                    <div style={{ fontSize: isMobile ? "0.7rem" : "0.75rem", color: SLATE_L, marginTop: 4 }}>Units</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden", marginBottom: isMobile ? 24 : 32 }}
          >
            <div style={{ padding: isMobile ? "16px" : "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight: 700, color: NAVY2, margin: 0 }}>Recent Activity</h2>
            </div>
            {recentActivity.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
                style={{ textAlign: "center", padding: isMobile ? "40px 20px" : "60px 20px", color: SLATE_L }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaBell style={{ fontSize: isMobile ? "2.5rem" : "3rem", marginBottom: 16, opacity: 0.3 }} />
                </motion.div>
                <p style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>No recent activity</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + (index * 0.1), duration: 0.3 }}
                    whileHover={{ x: 5, background: SMOKE }}
                    style={{
                      padding: isMobile ? "12px 16px" : "16px 24px",
                      borderBottom: index < recentActivity.length - 1 ? `1px solid ${BORDER}` : "none",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: isMobile ? 12 : 16,
                      cursor: "pointer"
                    }}
                  >
                    <motion.div
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      style={{
                        width: isMobile ? 36 : 40,
                        height: isMobile ? 36 : 40,
                        borderRadius: 8,
                        background: activity.type === 'blood_request' ? `${RED}15` : `${NAVY}15`,
                        color: activity.type === 'blood_request' ? RED : NAVY,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        flexShrink: 0
                      }}
                    >
                      {activity.type === 'blood_request' ? <FaHeartPulse /> : <FaCalendarDays />}
                    </motion.div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: isMobile ? "0.85rem" : "0.95rem", fontWeight: 600, color: NAVY2, marginBottom: 4 }}>
                        {activity.patientName} - {activity.action}
                      </div>
                      <div style={{ fontSize: isMobile ? "0.8rem" : "0.85rem", color: SLATE_L, wordBreak: "break-word" }}>
                        {activity.details}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: SLATE_L }}>
                        {activity.date ? new Date(activity.date).toLocaleDateString() : 'Today'}
                      </div>
                      {activity.urgency && (
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: isMobile ? "0.65rem" : "0.7rem",
                            fontWeight: 600,
                            background: activity.urgency === 'Critical' ? `${RED}15` : `${NAVY}15`,
                            color: activity.urgency === 'Critical' ? RED : NAVY,
                            marginTop: 4,
                            display: "inline-block"
                          }}
                        >
                          {activity.urgency}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Recent Blood Requests */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}
          >
            <div style={{ padding: isMobile ? "16px" : "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 0 }}>
              <h2 style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight: 700, color: NAVY2, margin: 0 }}>Recent Blood Requests</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/hospital-blood-requests")}
                style={{
                  background: RED,
                  color: WHITE,
                  border: "none",
                  padding: isMobile ? "8px 12px" : "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: isMobile ? "0.8rem" : "0.85rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap"
                }}
              >
                View All <FaArrowRight style={{ fontSize: "0.7rem" }} />
              </motion.button>
            </div>
            {bloodRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                style={{ textAlign: "center", padding: isMobile ? "40px 20px" : "60px 20px", color: SLATE_L }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaHeartPulse style={{ fontSize: isMobile ? "2.5rem" : "3rem", marginBottom: 16, opacity: 0.3 }} />
                </motion.div>
                <p style={{ fontSize: isMobile ? "0.9rem" : "1rem", marginBottom: 16 }}>No blood requests yet</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                style={{ overflowX: "auto" }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? "600px" : "auto" }}>
                  <thead>
                    <tr style={{ background: SMOKE, borderBottom: `1px solid ${BORDER}` }}>
                      <th style={{ padding: isMobile ? "12px 16px" : "16px 24px", textAlign: "left", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Request ID</th>
                      <th style={{ padding: isMobile ? "12px 16px" : "16px 24px", textAlign: "left", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Blood Group</th>
                      <th style={{ padding: isMobile ? "12px 16px" : "16px 24px", textAlign: "left", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Units</th>
                      <th style={{ padding: isMobile ? "12px 16px" : "16px 24px", textAlign: "left", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Hospital</th>
                      <th style={{ padding: isMobile ? "12px 16px" : "16px 24px", textAlign: "left", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</th>
                      <th style={{ padding: isMobile ? "12px 16px" : "16px 24px", textAlign: "left", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(bloodRequests) ? bloodRequests.slice(0, 5).map((request, index) => (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 + (index * 0.1), duration: 0.3 }}
                        whileHover={{ background: SMOKE, scale: 1.01 }}
                        style={{ borderBottom: `1px solid ${BORDER}`, cursor: "pointer" }}
                      >
                        <td style={{ padding: isMobile ? "12px 16px" : "16px 24px", fontSize: isMobile ? "0.85rem" : "0.9rem", color: NAVY2, fontWeight: 600 }}>#{request.id}</td>
                        <td style={{ padding: isMobile ? "12px 16px" : "16px 24px" }}>
                          <motion.span
                            whileHover={{ scale: 1.1 }}
                            style={{
                              padding: isMobile ? "4px 10px" : "6px 14px",
                              borderRadius: 8,
                              background: `${BG_COLOR[request.bloodGroup] || RED}15`,
                              color: BG_COLOR[request.bloodGroup] || RED,
                              fontSize: isMobile ? "0.75rem" : "0.85rem",
                              fontWeight: 600,
                              display: "inline-block"
                            }}
                          >
                            {request.bloodGroup}
                          </motion.span>
                        </td>
                        <td style={{ padding: isMobile ? "12px 16px" : "16px 24px", fontSize: isMobile ? "0.85rem" : "0.9rem", color: NAVY2 }}>{request.units}</td>
                        <td style={{ padding: isMobile ? "12px 16px" : "16px 24px", fontSize: isMobile ? "0.85rem" : "0.9rem", color: NAVY2 }}>{request.hospital}</td>
                        <td style={{ padding: isMobile ? "12px 16px" : "16px 24px", fontSize: isMobile ? "0.85rem" : "0.9rem", color: SLATE_L }}>{request.date}</td>
                        <td style={{ padding: isMobile ? "12px 16px" : "16px 24px" }}>
                          <motion.span
                            whileHover={{ scale: 1.1 }}
                            style={{
                              padding: isMobile ? "3px 10px" : "4px 12px",
                              borderRadius: 12,
                              fontSize: isMobile ? "0.7rem" : "0.75rem",
                              fontWeight: 600,
                              background: request.status === "Pending" ? "#FEF3C7" : request.status === "Approved" ? "#DCFCE7" : "#FEE2E2",
                              color: request.status === "Pending" ? "#D97706" : request.status === "Approved" ? "#16A34A" : "#DC2626",
                              display: "inline-block"
                            }}
                          >
                            {request.status}
                          </motion.span>
                        </td>
                      </motion.tr>
                    )) : null}
                  </tbody>
                </table>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default HospitalDashboard;
