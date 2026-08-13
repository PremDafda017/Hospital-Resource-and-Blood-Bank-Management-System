import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHandHoldingHeart,
  FaCertificate,
  FaCalendar,
  FaHeartPulse,
  FaBell,
  FaUser,
  FaDroplet,
  FaPlus,
  FaArrowRight,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaHouse,
  FaTrophy,
  FaPenToSquare,
  FaClock,
  FaClockRotateLeft,
  FaAward,
  FaGear,
  FaCircleCheck,
  FaHourglass,
  FaTriangleExclamation,
  FaBullhorn,
  FaSyringe,
} from "react-icons/fa6";
import EligibilityChecker from "./EligibilityChecker";
import DonationCampaigns from "./DonationCampaigns";
import AppointmentManagement from "./AppointmentManagement";
import DonationHistory from "./DonationHistory";
import CertificateGenerator from "./CertificateGenerator";
import Notifications from "./Notifications";

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
const GREEN = "#16A34A";
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

function DonorDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (location.state?.applicationSubmitted) {
      setActiveView("eligibility");
    }
  }, [location.state]);

  const nav = [
    { key: "dashboard", icon: <FaHouse />, label: "Dashboard", path: "/donor-dashboard" },
    { key: "eligibility", icon: <FaHeartPulse />, label: "Eligibility Checker", path: "/donor-dashboard" },
    { key: "campaigns", icon: <FaBullhorn />, label: "Campaigns", path: "/donor-dashboard" },
    { key: "appointments", icon: <FaCalendar />, label: "My Appointments", path: "/donor-dashboard" },
    { key: "history", icon: <FaClockRotateLeft />, label: "Donation History", path: "/donor-dashboard" },
    { key: "certificates", icon: <FaCertificate />, label: "Certificates", path: "/donor-dashboard" },
    { key: "notifications", icon: <FaBell />, label: "Notifications", path: "/donor-dashboard" },
    { key: "profile", icon: <FaUser />, label: "My Profile", path: "/donor-profile" },
  ];

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  // Donor data - initialize with mock data for display
  const [donorProfile, setDonorProfile] = useState({
    bloodGroup: "O+",
    totalDonations: 5,
    profile: { bloodGroup: "O+" }
  });
  const [donorApplication, setDonorApplication] = useState({ status: "Verified" });
  const [donationHistory, setDonationHistory] = useState([
    { _id: 1, bloodBankName: "City Hospital", date: "2023-12-01", bloodGroup: "O+", status: "Completed" },
    { _id: 2, bloodBankName: "Red Cross Center", date: "2023-09-15", bloodGroup: "O+", status: "Completed" }
  ]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([
    { _id: 1, bloodBankName: "City Blood Bank", date: "2024-01-15", time: "10:00 AM", status: "Scheduled" }
  ]);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Welcome to the Donor Portal", time: "Just now", read: false },
    { id: 2, message: "You are eligible to donate blood", time: "2 hours ago", read: true },
  ]);
  const [certificates, setCertificates] = useState([
    { _id: 1, certificateNumber: "CERT-001", donationDate: "2023-12-01", status: "Verified" }
  ]);
  const [rewards, setRewards] = useState(null);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [eligibility, setEligibility] = useState({ eligible: true, nextEligibleDate: "Eligible Now" });
  
  // Dashboard summary data - initialize with default values
  const [eligibilityStatus, setEligibilityStatus] = useState("Eligible");
  const [isEligible, setIsEligible] = useState(true);
  const [lastDonationDate, setLastDonationDate] = useState("2023-12-01");
  const [nextEligibleDate, setNextEligibleDate] = useState("Eligible Now");

  useEffect(() => {
    if (user?.id) {
      loadDonorData();
    }
  }, [user]);

  const loadDonorData = async () => {
    try {
      // Load dashboard data from backend
      const dashboardResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/${user.id}/dashboard`);
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setDonorProfile(dashboardData.donor);
        setDonorApplication(dashboardData.application);
        setUpcomingAppointments(dashboardData.appointments || []);
        setDonationHistory(dashboardData.recentDonations || []);
        setRewards(dashboardData.reward);
        setEmergencyRequests(dashboardData.emergencyRequests || []);
        setCampaigns(dashboardData.campaigns || []);
        setEligibility(dashboardData.eligibility);
        
        // Calculate dashboard summary
        calculateEligibilityStatus(dashboardData);
      } else {
        // Check if application exists
        const appResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/application/${user.id}`);
        if (appResponse.ok) {
          const appData = await appResponse.json();
          setDonorApplication(appData);
          if (appData.status === "Pending Verification") {
            setActiveView("eligibility");
          }
        }
        
        // Load donor profile
        const profileResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/${user.id}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setDonorProfile(profileData);
        }
      }

      // Load certificates
      const certificatesResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/${user.id}/certificates`);
      if (certificatesResponse.ok) {
        const certificatesData = await certificatesResponse.json();
        setCertificates(certificatesData);
      }

      // Placeholder notifications
      setNotifications([
        { id: 1, message: "Welcome to the Donor Portal", time: "Just now", read: false },
        { id: 2, message: "You are eligible to donate blood", time: "2 hours ago", read: true },
      ]);
    } catch (error) {
      console.error('Error loading donor data:', error);
      // Set default values on error
      setDonorProfile({
        bloodGroup: "Not Set",
        totalDonations: 0,
        lastDonationDate: null,
        nextEligibleDate: null,
      });
      // Set mock data for display
      setUpcomingAppointments([
        { _id: 1, bloodBankName: "City Blood Bank", date: "2024-01-15", time: "10:00 AM", status: "Scheduled" }
      ]);
      setDonationHistory([
        { _id: 1, bloodBankName: "City Hospital", date: "2023-12-01", bloodGroup: "O+", status: "Completed" }
      ]);
      setCertificates([
        { _id: 1, certificateNumber: "CERT-001", donationDate: "2023-12-01", status: "Verified" }
      ]);
      setNotifications([
        { id: 1, message: "Welcome to the Donor Portal", time: "Just now", read: false },
        { id: 2, message: "You are eligible to donate blood", time: "2 hours ago", read: true },
      ]);
      setEligibilityStatus("Eligible");
      setIsEligible(true);
      setLastDonationDate("2023-12-01");
      setNextEligibleDate("Eligible Now");
    } finally {
      setLoading(false);
    }
  };

  const calculateEligibilityStatus = (dashboardData) => {
    const donor = dashboardData.donor;
    const recentDonations = dashboardData.recentDonations || [];
    
    // Check eligibility based on age, weight, last donation, etc.
    const age = donor?.profile?.age || 0;
    const weight = donor?.profile?.weight || 0;
    const lastDonation = recentDonations.length > 0 ? recentDonations[0].date : null;
    
    let eligible = true;
    let reason = "";
    
    // Age check (18-65)
    if (age < 18 || age > 65) {
      eligible = false;
      reason = age < 18 ? "Age below 18" : "Age above 65";
    }
    
    // Weight check (minimum 50kg)
    if (weight < 50) {
      eligible = false;
      reason = "Weight below 50kg";
    }
    
    // Last donation check (minimum 90 days)
    if (lastDonation) {
      const lastDate = new Date(lastDonation);
      const today = new Date();
      const daysSinceDonation = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceDonation < 90) {
        eligible = false;
        reason = `Wait ${90 - daysSinceDonation} more days`;
        setLastDonationDate(lastDonation);
        
        const nextEligible = new Date(lastDate);
        nextEligible.setDate(nextEligible.getDate() + 90);
        setNextEligibleDate(nextEligible.toISOString().split('T')[0]);
      } else {
        setLastDonationDate(lastDonation);
        setNextEligibleDate("Eligible Now");
      }
    } else {
      setLastDonationDate("Never");
      setNextEligibleDate("Eligible Now");
    }
    
    setIsEligible(eligible);
    setEligibilityStatus(eligible ? "Eligible" : reason || "Not Eligible");
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
      "Scheduled": "#2563EB",
      "Completed": "#16A34A",
      "Cancelled": "#DC2626",
      "Pending": "#F59E0B",
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
            {!sidebarCollapsed && <span>Donor Portal</span>}
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
              onClick={() => {
                if (item.key === "profile") {
                  navigate(item.path);
                } else {
                  setActiveView(item.key);
                }
              }}
              style={{
                width:"100%",
                display:"flex",
                alignItems:"center",
                gap:12,
                padding:"12px 16px",
                borderRadius:8,
                border:"none",
                background: activeView === item.key ? RED : "transparent",
                color:WHITE,
                cursor:"pointer",
                marginBottom:4,
                transition:"all 0.2s",
                fontSize: "0.9rem"
              }}
              onMouseEnter={e => {
                if (activeView !== item.key) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={e => {
                if (activeView !== item.key) e.currentTarget.style.background = "transparent";
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

          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: isMobile ? 24 : 32 }}
          >
            <h1 style={{ fontSize: isMobile ? "1.75rem" : "2.25rem", fontWeight: 800, color: NAVY2, marginBottom: 8 }}>
              Welcome, {user?.firstName || "Donor"}
            </h1>
            <p style={{ fontSize: isMobile ? "0.95rem" : "1rem", color: SLATE_L, marginBottom: 16 }}>
              {donorApplication?.status === "Pending Verification" 
                ? "Your application is under review. We'll notify you once verified."
                : donorApplication?.status === "Rejected"
                ? `Your application was rejected. Reason: ${donorApplication.rejectionReason}`
                : "Thank you for your contribution to saving lives."
              }
            </p>
            {donorApplication?.status === "Verified" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/donor-profile")}
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
                  gap: 8
                }}
              >
                <FaCircleCheck />
                Update Profile
              </motion.button>
            )}
               
          </motion.div>

          {/* Application Status Banner */}
          {donorApplication && donorApplication.status === "Pending Verification" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "#FEF3C7",
                border: "2px solid #F59E0B",
                borderRadius: 12,
                padding: "20px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#F59E0B20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F59E0B",
                fontSize: "1.5rem",
              }}>
                <FaHourglass />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#92400E", margin: "0 0 4px 0" }}>
                  Application Under Review
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#B45309", margin: 0 }}>
                  Your donor application is being reviewed by our medical team. This process typically takes 1-2 business days.
                </p>
              </div>
            </motion.div>
          )}

          {donorApplication && donorApplication.status === "Rejected" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "#FEE2E2",
                border: "2px solid #DC2626",
                borderRadius: 12,
                padding: "20px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#DC262620",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#DC2626",
                fontSize: "1.5rem",
              }}>
                <FaTriangleExclamation />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#991B1B", margin: "0 0 4px 0" }}>
                  Application Rejected
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#B91C1C", margin: 0 }}>
                  Reason: {donorApplication.rejectionReason || "Not specified"}
                </p>
              </div>
            </motion.div>
          )}

          {/* Render different views based on activeView */}
          {activeView === "dashboard" && (
            <>
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(3, 1fr)" : "repeat(3, 1fr)", gap: isMobile ? 12 : 20, marginBottom: isMobile ? 24 : 32 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <StatCard icon={<FaHeartPulse />} value={eligibilityStatus} label="Eligibility Status" color={isEligible ? "#16A34A" : "#DC2626"} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <StatCard icon={<FaCalendar />} value={upcomingAppointments.length > 0 ? upcomingAppointments[0].date : "None"} label="Upcoming Appointment" color="#7C3AED" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <StatCard icon={<FaHandHoldingHeart />} value={donorProfile?.totalDonations || 0} label="Total Donations" color="#C41230" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <StatCard icon={<FaClockRotateLeft />} value={lastDonationDate} label="Last Donation Date" color="#2563EB" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <StatCard icon={<FaCalendar />} value={nextEligibleDate} label="Next Eligible Date" color="#16A34A" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <StatCard icon={<FaCertificate />} value={certificates.length} label="Certificates Earned" color="#F59E0B" />
                </motion.div>
              </motion.div>

              {/* Blood Group Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  background: WHITE,
                  borderRadius: 12,
                  border: `1px solid ${BORDER}`,
                  padding: isMobile ? "20px" : "24px",
                  marginBottom: isMobile ? 24 : 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: isMobile ? 16 : 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: isMobile ? 60 : 80,
                    height: isMobile ? 60 : 80,
                    borderRadius: 16,
                    background: `${BG_COLOR[donorProfile?.profile?.bloodGroup] || RED}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{
                      fontSize: isMobile ? "1.5rem" : "2rem",
                      fontWeight: 800,
                      color: BG_COLOR[donorProfile?.profile?.bloodGroup] || RED,
                    }}>
                      {donorProfile?.profile?.bloodGroup || "Not Set"}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: isMobile ? "1rem" : "1.2rem", fontWeight: 700, color: NAVY2, margin: "0 0 4px 0" }}>
                      Your Blood Group
                    </h3>
                    <p style={{ color: SLATE_L, fontSize: isMobile ? "0.85rem" : "0.9rem", margin: 0 }}>
                      {donorProfile?.profile?.bloodGroup ? "Your blood type is registered in our system" : "Complete your profile to set your blood group"}
                    </p>
                  </div>
                </div>
                {!donorProfile?.profile?.bloodGroup && (
                  <button
                    onClick={() => navigate("/donor-profile")}
                    style={{
                      background: RED,
                      color: WHITE,
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 20px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Set Blood Group
                  </button>
                )}
              </motion.div>

              {/* Main Content Grid */}
              <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: isMobile ? 16 : 24 }}>
                {/* Left Column */}
                <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
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
                    onClick={() => setActiveView("appointments")}
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
                    {upcomingAppointments.length === 0 ? (
                      <div style={{ textAlign:"center", padding:"40px 20px", color:SLATE_L }}>
                        <FaCalendar style={{ fontSize:"2.5rem", marginBottom:12, opacity:0.3 }} />
                        <p>No appointments scheduled</p>
                        <button
                      onClick={() => setActiveView("appointments")}
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
                      Book Appointment
                    </button>
                      </div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                        {upcomingAppointments.map((appointment) => (
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
                                <FaCalendar />
                              </div>
                              <div>
                                <div style={{ fontWeight:600, color:NAVY2, fontSize:"0.9rem" }}>
                                  {appointment.bloodBankName || appointment.location}
                                </div>
                                <div style={{ fontSize:"0.85rem", color:SLATE_L }}>
                                  {appointment.date} at {appointment.time}
                                </div>
                              </div>
                            </div>
                            <StatusPill status={appointment.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Eligibility Status */}
                  <div style={{
                    background:WHITE,
                    borderRadius:12,
                    border:`1px solid ${BORDER}`,
                    padding:"24px",
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                      <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:NAVY2, margin:0 }}>
                        Eligibility Status
                      </h2>
                      <button
                    onClick={() => setActiveView("eligibility")}
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
                    Check Again <FaArrowRight />
                  </button>
                    </div>
                    <div style={{
                      padding:"20px",
                      background: isEligible ? `${GREEN}08` : `${RED}08`,
                      borderRadius:8,
                      border: `1px solid ${isEligible ? GREEN : RED}30`,
                      display:"flex",
                      alignItems:"center",
                      gap:16,
                    }}>
                      <div style={{
                        width:56,
                        height:56,
                        borderRadius:12,
                        background: isEligible ? `${GREEN}20` : `${RED}20`,
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        color: isEligible ? GREEN : RED,
                        fontSize:"1.5rem",
                      }}>
                        {isEligible ? <FaCircleCheck /> : <FaHourglass />}
                      </div>
                      <div>
                        <div style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, marginBottom:4 }}>
                          {eligibilityStatus}
                        </div>
                        <div style={{ fontSize:"0.9rem", color:SLATE_L }}>
                          {isEligible 
                            ? "You are eligible to donate blood today!" 
                            : `Next eligible date: ${nextEligibleDate}`
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* My Certificates */}
                  <div style={{
                    background:WHITE,
                    borderRadius:12,
                    border:`1px solid ${BORDER}`,
                    padding:"24px",
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                      <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:NAVY2, margin:0 }}>
                        My Certificates
                      </h2>
                      <button
                    onClick={() => setActiveView("certificates")}
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
                    {certificates.length === 0 ? (
                      <div style={{ textAlign:"center", padding:"40px 20px", color:SLATE_L }}>
                        <FaCertificate style={{ fontSize:"2.5rem", marginBottom:12, opacity:0.3 }} />
                        <p>No certificates earned yet</p>
                      </div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                        {certificates.slice(0, 3).map((cert) => (
                          <div
                            key={cert._id || cert.id}
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
                                background:`${"#F59E0B"}15`,
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                color:"#F59E0B",
                              }}>
                                <FaCertificate />
                              </div>
                              <div>
                                <div style={{ fontWeight:600, color:NAVY2, fontSize:"0.9rem" }}>
                                  {cert.certificateNumber || `Certificate #${cert.id}`}
                                </div>
                                <div style={{ fontSize:"0.85rem", color:SLATE_L }}>
                                  {cert.donationDate ? new Date(cert.donationDate).toLocaleDateString() : cert.createdAt}
                                </div>
                              </div>
                            </div>
                            <StatusPill status={cert.status || "Verified"} />
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
                    onClick={() => setActiveView("notifications")}
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
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {notifications.length === 0 ? (
                        <div style={{ textAlign:"center", padding:"40px 20px", color:SLATE_L }}>
                          <FaBell style={{ fontSize:"2.5rem", marginBottom:12, opacity:0.3 }} />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
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
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div style={{
                    background:WHITE,
                    borderRadius:12,
                    border:`1px solid ${BORDER}`,
                    padding:"24px",
                  }}>
                    <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:NAVY2, margin:"0 0 20px 0" }}>
                      Quick Stats
                    </h2>
                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ color:SLATE_L, fontSize:"0.9rem" }}>Total Donations</span>
                        <span style={{ fontWeight:700, color:NAVY2, fontSize:"1.1rem" }}>{donorProfile?.totalDonations || 0}</span>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ color:SLATE_L, fontSize:"0.9rem" }}>Lives Saved</span>
                        <span style={{ fontWeight:700, color:GREEN, fontSize:"1.1rem" }}>{(donorProfile?.totalDonations || 0) * 3}</span>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ color:SLATE_L, fontSize:"0.9rem" }}>Last Donation</span>
                        <span style={{ fontWeight:700, color:NAVY2, fontSize:"1.1rem" }}>{lastDonationDate}</span>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ color:SLATE_L, fontSize:"0.9rem" }}>Next Eligible</span>
                        <span style={{ fontWeight:700, color:isEligible ? GREEN : RED, fontSize:"1.1rem" }}>{nextEligibleDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Eligibility View */}
          {activeView === "eligibility" && <EligibilityChecker />}

          {/* Campaigns View */}
          {activeView === "campaigns" && <DonationCampaigns />}

          {/* Appointments View */}
          {activeView === "appointments" && <AppointmentManagement />}

          {/* History View */}
          {activeView === "history" && <DonationHistory />}

          {/* Certificates View */}
          {activeView === "certificates" && <CertificateGenerator />}

          {/* Notifications View */}
          {activeView === "notifications" && <Notifications />}

          {/* Settings View Placeholder */}
          {activeView === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: WHITE,
                borderRadius: 12,
                border: `1px solid ${BORDER}`,
                padding: "48px",
                textAlign: "center",
              }}
            >
              <div style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `${RED}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                color: RED,
                fontSize: "2rem",
              }}>
                <FaClockRotateLeft />
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, marginBottom: 12 }}>
                Settings
              </h2>
              <p style={{ color: SLATE_L, fontSize: "1rem" }}>
                Settings panel coming soon. Manage your account preferences here.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DonorDashboard;
