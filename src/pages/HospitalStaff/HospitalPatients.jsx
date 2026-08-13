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
  FaMagnifyingGlass,
  FaEye,
  FaPen,
  FaTrash,
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

function HospitalPatients() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const active = "hospital-patients";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    if (user?.id) {
      // Load patients from MongoDB by role 'patient'
      const loadPatients = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/users/role/patient`);
          if (response.ok) {
            const data = await response.json();
            setPatients(Array.isArray(data) ? data : []);
          } else {
            setPatients([]);
          }
        } catch (error) {
          console.error('Error loading patients:', error);
          setPatients([]);
        }
        setLoading(false);
      };
      loadPatients();
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredPatients = Array.isArray(patients) ? patients.filter(patient => 
    patient.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const BloodBadge = ({ group }) => (
    <motion.span
      whileHover={{ scale: 1.1 }}
      style={{
        padding: "6px 14px",
        borderRadius: 8,
        background: `${BG_COLOR[group] || RED}15`,
        color: BG_COLOR[group] || RED,
        fontSize: "0.85rem",
        fontWeight: 600,
        display: "inline-block"
      }}
    >
      {group}
    </motion.span>
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
            Loading patients...
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
          position: "fixed",
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
          <motion.div style={{ marginBottom: isMobile ? 24 : 32, display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 16 : 0 }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div>
              <h1 style={{ fontSize: isMobile ? "1.4rem" : "1.8rem", fontWeight: 800, color: NAVY2, margin: "0 0 8px 0" }}>
                Hospital Patients
              </h1>
              <p style={{ color: SLATE_L, fontSize: isMobile ? "0.9rem" : "1rem", margin: 0 }}>
                Manage all registered patients
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, width: isMobile ? "100%" : "auto" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: isMobile ? "8px 12px" : "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flex: isMobile ? 1 : "auto"
                }}
              >
                <FaMagnifyingGlass style={{ color: SLATE_L }} />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: isMobile ? "0.85rem" : "0.9rem",
                    width: isMobile ? "100%" : 200
                  }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Patients Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}
          >
            <div style={{ padding: isMobile ? "16px" : "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight: 700, color: NAVY2, margin: 0 }}>All Patients ({filteredPatients.length})</h2>
            </div>
            {filteredPatients.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                style={{ textAlign: "center", padding: isMobile ? "40px 20px" : "60px 20px", color: SLATE_L }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaUsers style={{ fontSize: isMobile ? "2.5rem" : "3rem", marginBottom: 16, opacity: 0.3 }} />
                </motion.div>
                <p style={{ fontSize: isMobile ? "0.9rem" : "1rem", marginBottom: 16 }}>No patients found</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ overflowX: "auto" }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? "700px" : "auto" }}>
                  <thead>
                    <tr style={{ background: SMOKE, borderBottom: `1px solid ${BORDER}` }}>
                      <th style={{ padding: isMobile ? "12px 16px" : "16px 24px", textAlign: "left", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>User ID</th>
                      <th style={{ padding: isMobile ? "12px 16px" : "16px 24px", textAlign: "left", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                      <th style={{ padding: isMobile ? "12px 16px" : "16px 24px", textAlign: "left", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                      <th style={{ padding: isMobile ? "12px 16px" : "16px 24px", textAlign: "left", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</th>
                      <th style={{ padding: isMobile ? "12px 16px" : "16px 24px", textAlign: "left", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                      <th style={{ padding: isMobile ? "12px 16px" : "16px 24px", textAlign: "left", fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient, index) => (
                      <motion.tr
                        key={patient._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + (index * 0.05), duration: 0.3 }}
                        whileHover={{ background: SMOKE, scale: 1.01 }}
                        style={{ borderBottom: `1px solid ${BORDER}`, cursor: "pointer" }}
                      >
                        <td style={{ padding: isMobile ? "12px 16px" : "16px 24px", fontSize: isMobile ? "0.75rem" : "0.9rem", color: NAVY2, fontWeight: 600 }}>{patient.clerkId?.slice(0, 8)}...</td>
                        <td style={{ padding: isMobile ? "12px 16px" : "16px 24px", fontSize: isMobile ? "0.85rem" : "0.9rem", color: NAVY2 }}>{patient.fullName || "N/A"}</td>
                        <td style={{ padding: isMobile ? "12px 16px" : "16px 24px", fontSize: isMobile ? "0.75rem" : "0.9rem", color: SLATE_L }}>{patient.email?.slice(0, 20)}...</td>
                        <td style={{ padding: isMobile ? "12px 16px" : "16px 24px", fontSize: isMobile ? "0.85rem" : "0.9rem", color: NAVY2 }}>{patient.role || "N/A"}</td>
                        <td style={{ padding: isMobile ? "12px 16px" : "16px 24px" }}>
                          <motion.span
                            whileHover={{ scale: 1.1 }}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 8,
                              background: patient.isVerified ? `${"#16A34A"}15` : `${"#F59E0B"}15`,
                              color: patient.isVerified ? "#16A34A" : "#F59E0B",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              display: "inline-block"
                            }}
                          >
                            {patient.isVerified ? "Verified" : "Pending"}
                          </motion.span>
                        </td>
                        <td style={{ padding: isMobile ? "12px 16px" : "16px 24px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`/hospital-patient-details/${patient.clerkId}`)}
                              style={{
                                background: WHITE,
                                border: `1px solid ${BORDER}`,
                                padding: isMobile ? "5px 10px" : "6px 12px",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: isMobile ? "0.75rem" : "0.85rem",
                                color: NAVY2,
                                display: "flex",
                                alignItems: "center",
                                gap: 4
                              }}
                            >
                              <FaEye /> View
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
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

export default HospitalPatients;
