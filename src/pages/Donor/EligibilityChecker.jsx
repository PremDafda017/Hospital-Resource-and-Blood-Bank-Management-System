import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHeartPulse,
  FaCircleCheck,
  FaCircleXmark,
  FaClock,
  FaWeightScale,
  FaCalendar,
  FaUser,
  FaSpinner,
  FaCalendarPlus,
  FaTrophy,
  FaBell,
  FaArrowRight,
  FaCircleInfo,
  FaCheck,
  FaXmark,
} from "react-icons/fa6";
import { useNotification } from "../../contexts/NotificationContext";

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

const EligibilityChecker = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  
  const [donorInfo, setDonorInfo] = useState({
    fullName: "",
    donorId: "",
    bloodGroup: "",
    age: "",
    gender: "",
    weight: "",
    lastDonationDate: "",
    nextEligibleDate: "",
  });

  const [eligibility, setEligibility] = useState({
    isEligible: false,
    score: 0,
    factors: [],
    nextEligibleDate: null,
    daysRemaining: 0,
  });

  const [medicalStatus, setMedicalStatus] = useState({
    noFever: true,
    noSurgery: true,
    noIllness: true,
    noInfection: true,
    noBloodDisease: true,
    noMedication: true,
    noTattoo: true,
    noPregnancy: true,
  });

  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    preferredDate: "",
    preferredTime: "",
    lastDonation: "",
    bloodBankName: "",
    location: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Calculate donation gap eligibility based on form input
  const calculateDonationGapEligibility = () => {
    if (!appointmentForm.lastDonation) {
      return {
        isEligible: true,
        status: "passed",
        value: "First time donor",
        requirement: "N/A",
        daysSinceDonation: null,
      };
    }

    const lastDate = new Date(appointmentForm.lastDonation);
    const today = new Date();
    const daysSinceDonation = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    const waitingDays = 84; // 3 months

    if (daysSinceDonation >= waitingDays) {
      return {
        isEligible: true,
        status: "passed",
        value: `${daysSinceDonation} days passed`,
        requirement: `${waitingDays} days minimum (3 months)`,
        daysSinceDonation,
      };
    } else {
      const daysRemaining = waitingDays - daysSinceDonation;
      return {
        isEligible: false,
        status: "failed",
        value: `${daysSinceDonation} days passed`,
        requirement: `${waitingDays} days minimum (3 months) - ${daysRemaining} days remaining`,
        daysSinceDonation,
      };
    }
  };

  const donationGapEligibility = calculateDonationGapEligibility();

  useEffect(() => {
    if (user?.id) {
      loadDonorData();
    }
  }, [user]);

  // Listen for profile updates and reload eligibility data
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user?.id) {
        loadDonorData();
      }
    };

    window.addEventListener('storage', handleProfileUpdate);
    
    // Also check for the specific localStorage key
    const checkProfileUpdate = setInterval(() => {
      const updateTimestamp = localStorage.getItem('donor_profile_updated');
      if (updateTimestamp && !window.lastProfileUpdate) {
        window.lastProfileUpdate = updateTimestamp;
        loadDonorData();
      } else if (updateTimestamp && window.lastProfileUpdate !== updateTimestamp) {
        window.lastProfileUpdate = updateTimestamp;
        loadDonorData();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleProfileUpdate);
      clearInterval(checkProfileUpdate);
    };
  }, [user]);

  const loadDonorData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          const age = data.profile.dateOfBirth 
            ? new Date().getFullYear() - new Date(data.profile.dateOfBirth).getFullYear() 
            : "";
          
          setDonorInfo({
            fullName: `${data.profile.firstName} ${data.profile.lastName}`,
            donorId: data.donorId || `DON-${user.id.slice(0, 8)}`,
            bloodGroup: data.profile.bloodGroup || "Unknown",
            age: age,
            gender: data.profile.gender || "",
            weight: data.profile.weight || "",
            lastDonationDate: data.lastDonationDate || "",
            nextEligibleDate: calculateNextEligibleDate(data.lastDonationDate, data.profile.gender),
          });

          // Calculate eligibility
          calculateEligibility(age, data.profile.weight, data.profile.gender, data.lastDonationDate);
        }
      }
    } catch (error) {
      console.error("Error loading donor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextEligibleDate = (lastDonationDate, gender) => {
    if (!lastDonationDate) return null;
    
    const lastDate = new Date(lastDonationDate);
    const waitingDays = gender === 'Female' ? 120 : 90;
    const nextEligible = new Date(lastDate);
    nextEligible.setDate(nextEligible.getDate() + waitingDays);
    return nextEligible.toISOString().split('T')[0];
  };

  const calculateEligibility = (age, weight, gender, lastDonationDate) => {
    const factors = [];
    let score = 0;
    let isEligible = true;
    let nextEligibleDate = null;
    let daysRemaining = 0;

    // Age check (18-65)
    if (age >= 18 && age <= 65) {
      factors.push({
        name: "Age",
        status: "passed",
        value: `${age} years`,
        requirement: "18-65 years",
        icon: <FaUser />,
      });
      score += 25;
    } else {
      factors.push({
        name: "Age",
        status: "failed",
        value: `${age} years`,
        requirement: "18-65 years",
        icon: <FaUser />,
      });
      isEligible = false;
    }

    // Weight check (minimum 50kg)
    if (weight >= 50) {
      factors.push({
        name: "Weight",
        status: "passed",
        value: `${weight} kg`,
        requirement: "Minimum 50 kg",
        icon: <FaWeightScale />,
      });
      score += 25;
    } else {
      factors.push({
        name: "Weight",
        status: "failed",
        value: `${weight} kg`,
        requirement: "Minimum 50 kg",
        icon: <FaWeightScale />,
      });
      isEligible = false;
    }

    // Last donation gap check
    const waitingDays = 84; // 3 months (12 weeks) = 84 days
    if (lastDonationDate) {
      const lastDate = new Date(lastDonationDate);
      const today = new Date();
      const daysSinceDonation = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceDonation >= waitingDays) {
        factors.push({
          name: "Last Donation Gap",
          status: "passed",
          value: `${daysSinceDonation} days passed`,
          requirement: `${waitingDays} days minimum (3 months)`,
          icon: <FaCalendar />,
        });
        score += 25;
      } else {
        daysRemaining = waitingDays - daysSinceDonation;
        const nextEligible = new Date(lastDate);
        nextEligible.setDate(nextEligible.getDate() + waitingDays);
        nextEligibleDate = nextEligible.toISOString().split('T')[0];
        
        factors.push({
          name: "Last Donation Gap",
          status: "failed",
          value: `${daysSinceDonation} days passed`,
          requirement: `${waitingDays} days minimum (3 months)`,
          icon: <FaCalendar />,
        });
        isEligible = false;
      }
    } else {
      factors.push({
        name: "Last Donation Gap",
        status: "passed",
        value: "First time donor",
        requirement: "N/A",
        icon: <FaCalendar />,
      });
      score += 25;
    }

    // Medical status check
    const medicalChecks = [
      { key: "noFever", label: "No fever in last 24 hours", icon: <FaHeartPulse /> },
      { key: "noSurgery", label: "No major surgery in last 6 months", icon: <FaHeartPulse /> },
      { key: "noIllness", label: "No serious illness", icon: <FaHeartPulse /> },
      { key: "noInfection", label: "No active infection", icon: <FaHeartPulse /> },
      { key: "noBloodDisease", label: "No blood-related disease", icon: <FaHeartPulse /> },
      { key: "noMedication", label: "Not taking medication", icon: <FaHeartPulse /> },
      { key: "noTattoo", label: "No tattoo/piercing in last 6 months", icon: <FaHeartPulse /> },
      { key: "noPregnancy", label: "Not pregnant (for females)", icon: <FaHeartPulse /> },
    ];

    let medicalPassed = 0;
    medicalChecks.forEach(check => {
      if (medicalStatus[check.key]) {
        medicalPassed++;
      }
    });

    if (medicalPassed === medicalChecks.length) {
      factors.push({
        name: "Medical Status",
        status: "passed",
        value: "All clear",
        requirement: "No health issues",
        icon: <FaHeartPulse />,
      });
      score += 25;
    } else {
      factors.push({
        name: "Medical Status",
        status: "failed",
        value: `${medicalPassed}/${medicalChecks.length} checks passed`,
        requirement: "All health checks must pass",
        icon: <FaHeartPulse />,
      });
      isEligible = false;
    }

    setEligibility({
      isEligible,
      score,
      factors,
      nextEligibleDate,
      daysRemaining,
    });
  };

  const handleRequestAppointment = () => {
    setShowAppointmentForm(true);
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    
    // Check donation gap eligibility
    if (!donationGapEligibility.isEligible) {
      showNotification({ 
        type: "error", 
        title: "Not Eligible", 
        message: `You must wait ${donationGapEligibility.requirement} before donating again. Current: ${donationGapEligibility.value}.` 
      });
      return;
    }
    
    setSubmitting(true);

    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/${user.id}/appointment-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          donorId: donorInfo.donorId,
          donorName: donorInfo.fullName,
          bloodGroup: donorInfo.bloodGroup,
          requestType: "Appointment",
          preferredDate: appointmentForm.preferredDate,
          preferredTime: appointmentForm.preferredTime,
          lastDonation: appointmentForm.lastDonation,
          bloodBankName: appointmentForm.bloodBankName,
          location: appointmentForm.location,
          notes: appointmentForm.notes,
        }),
      });

      if (response.ok) {
        showNotification({ type: "success", title: "Success", message: "Appointment request submitted successfully! Blood Bank Staff will review your request." });
        setShowAppointmentForm(false);
        setAppointmentForm({
          preferredDate: "",
          preferredTime: "",
          lastDonation: "",
          bloodBankName: "",
          location: "",
          notes: "",
        });
        navigate("/donor/appointments");
      } else {
        showNotification({ type: "error", title: "Error", message: "Failed to submit appointment request. Please try again." });
      }
    } catch (error) {
      console.error("Error requesting appointment:", error);
      showNotification({ type: "error", title: "Error", message: "Failed to submit appointment request. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinCampaign = () => {
    navigate("/donor/campaigns");
  };

  const handleNotifyMe = async () => {
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/${user.id}/notify-eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextEligibleDate: eligibility.nextEligibleDate,
        }),
      });

      if (response.ok) {
        showNotification({ type: "success", title: "Success", message: "You will be notified when you become eligible to donate!" });
      } else {
        showNotification({ type: "error", title: "Error", message: "Failed to set notification. Please try again." });
      }
    } catch (error) {
      console.error("Error setting notification:", error);
      showNotification({ type: "error", title: "Error", message: "Failed to set notification. Please try again." });
    }
  };

  const ProgressCircle = ({ score, isEligible }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    
    return (
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <svg width={120} height={120} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={60}
            cy={60}
            r={45}
            stroke={isEligible ? `${GREEN}20` : `${RED}20`}
            strokeWidth={8}
            fill="none"
          />
          <circle
            cx={60}
            cy={60}
            r={45}
            stroke={isEligible ? GREEN : RED}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
          />
        </svg>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: isEligible ? GREEN : RED }}>
            {score}%
          </div>
          <div style={{ fontSize: "0.7rem", color: SLATE_L }}>
            Score
          </div>
        </div>
      </div>
    );
  };

  const FactorCard = ({ factor }) => {
    const isPassed = factor.status === "passed";
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px",
          borderRadius: 12,
          background: isPassed ? `${GREEN}10` : `${RED}10`,
          border: `1px solid ${isPassed ? GREEN : RED}20`,
          marginBottom: 12,
          transition: "all 0.2s",
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: isPassed ? GREEN : RED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: WHITE,
          fontSize: "1.1rem",
        }}>
          {isPassed ? <FaCheck /> : <FaXmark />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 8,
            fontWeight: 700, 
            color: NAVY2, 
            fontSize: "0.95rem", 
            marginBottom: 4 
          }}>
            {factor.icon}
            {factor.name}
          </div>
          <div style={{ fontSize: "0.85rem", color: SLATE_L }}>
            {factor.value} • Required: {factor.requirement}
          </div>
        </div>
        <div style={{
          padding: "6px 12px",
          borderRadius: 20,
          background: isPassed ? GREEN : RED,
          color: WHITE,
          fontSize: "0.75rem",
          fontWeight: 600,
        }}>
          {isPassed ? "PASS" : "FAIL"}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: SMOKE, 
        fontFamily: FONT, 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <FaSpinner style={{ 
            animation: "spin 1s linear infinite", 
            fontSize: "3rem", 
            marginBottom: 16,
            color: RED 
          }} />
          <p style={{ color: SLATE_L, fontSize: "1rem" }}>
            Loading eligibility information...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: SMOKE, fontFamily: FONT, padding: "24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: `${RED}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: RED,
            fontSize: "2rem",
          }}>
            <FaHeartPulse />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: NAVY2, marginBottom: 8 }}>
            Eligibility Checker
          </h1>
          <p style={{ fontSize: "1rem", color: SLATE_L }}>
            Check if you're eligible to donate blood
          </p>
        </motion.div>

        {/* Donor Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: WHITE,
            borderRadius: 16,
            border: `1px solid ${BORDER}`,
            padding: "24px",
            marginBottom: 24,
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, marginBottom: 16 }}>
            Donor Information
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}>
            <InfoItem label="Full Name" value={donorInfo.fullName} />
            <InfoItem label="Donor ID" value={donorInfo.donorId} />
            <InfoItem label="Blood Group" value={donorInfo.bloodGroup} />
            <InfoItem label="Age" value={`${donorInfo.age} years`} />
            <InfoItem label="Gender" value={donorInfo.gender} />
            <InfoItem label="Weight" value={`${donorInfo.weight} kg`} />
            <InfoItem label="Last Donation" value={donorInfo.lastDonationDate || "None"} />
            <InfoItem label="Next Eligible" value={donorInfo.nextEligibleDate || "N/A"} />
          </div>
        </motion.div>

        {/* Overall Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: WHITE,
            borderRadius: 16,
            border: `2px solid ${eligibility.isEligible ? GREEN : RED}`,
            padding: "32px",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <ProgressCircle score={eligibility.score} isEligible={eligibility.isEligible} />
          </div>
          
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 20,
            background: eligibility.isEligible ? `${GREEN}15` : `${RED}15`,
            color: eligibility.isEligible ? GREEN : RED,
            fontSize: "0.9rem",
            fontWeight: 700,
            marginBottom: 16,
          }}>
            {eligibility.isEligible ? <FaCircleCheck /> : <FaCircleXmark />}
            {eligibility.isEligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
          </div>

          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: NAVY2, marginBottom: 12 }}>
            {eligibility.isEligible 
              ? "✅ Congratulations! You are eligible to donate blood"
              : "❌ Currently Not Eligible"
            }
          </h2>
          <p style={{ fontSize: "1rem", color: SLATE_L, maxWidth: "600px", margin: "0 auto 24px" }}>
            {eligibility.isEligible
              ? "You satisfy all donation requirements. You can now request a blood donation appointment or participate in an active donation campaign."
              : "You cannot donate blood at this time. Please resolve the following issues before requesting an appointment."
            }
          </p>

          {/* Action Buttons */}
          {eligibility.isEligible ? (
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRequestAppointment}
                style={{
                  padding: "14px 28px",
                  background: GREEN,
                  color: WHITE,
                  border: "none",
                  borderRadius: 10,
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
              >
                <FaCalendarPlus />
                Request Appointment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinCampaign}
                style={{
                  padding: "14px 28px",
                  background: WHITE,
                  color: NAVY2,
                  border: `2px solid ${BORDER}`,
                  borderRadius: 10,
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
              >
                <FaTrophy />
                Join Campaign
              </motion.button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {eligibility.nextEligibleDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: "16px 24px",
                    borderRadius: 10,
                    background: `${YELLOW}10`,
                    border: `1px solid ${YELLOW}30`,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <FaClock style={{ color: YELLOW, fontSize: "1.2rem" }} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: 2 }}>
                      Next Eligible Date
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: NAVY2 }}>
                      {eligibility.nextEligibleDate}
                    </div>
                  </div>
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNotifyMe}
                style={{
                  padding: "14px 28px",
                  background: BLUE,
                  color: WHITE,
                  border: "none",
                  borderRadius: 10,
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
              >
                <FaBell />
                Notify Me When Eligible
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Appointment Request Form Modal */}
        <AnimatePresence>
          {showAppointmentForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAppointmentForm(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: WHITE,
                  borderRadius: 16,
                  border: `1px solid ${BORDER}`,
                  padding: "32px",
                  maxWidth: "500px",
                  width: "100%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: NAVY2, margin: 0 }}>
                    New Appointment Request
                  </h2>
                  <button
                    onClick={() => setShowAppointmentForm(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: SLATE_L,
                      padding: 4,
                      borderRadius: 4,
                    }}
                  >
                    <FaXmark style={{ fontSize: "1.2rem" }} />
                  </button>
                </div>

                <form onSubmit={handleAppointmentSubmit}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Preferred Date */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: NAVY2, marginBottom: 8 }}>
                        Preferred Date <span style={{ color: RED }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={appointmentForm.preferredDate}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, preferredDate: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: `1px solid ${BORDER}`,
                          fontSize: "1rem",
                          fontFamily: FONT,
                        }}
                      />
                    </div>

                    {/* Preferred Time */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: NAVY2, marginBottom: 8 }}>
                        Preferred Time <span style={{ color: RED }}>*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={appointmentForm.preferredTime}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, preferredTime: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: `1px solid ${BORDER}`,
                          fontSize: "1rem",
                          fontFamily: FONT,
                        }}
                      />
                    </div>

                    {/* Last Donation */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: NAVY2, marginBottom: 8 }}>
                        Last Donation
                      </label>
                      <input
                        type="date"
                        value={appointmentForm.lastDonation}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, lastDonation: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: `1px solid ${BORDER}`,
                          fontSize: "1rem",
                          fontFamily: FONT,
                        }}
                      />
                      
                      {/* Dynamic Eligibility Check */}
                      {appointmentForm.lastDonation && (
                        <div style={{
                          marginTop: 12,
                          padding: "12px 16px",
                          borderRadius: 8,
                          background: donationGapEligibility.isEligible ? `${GREEN}10` : `${RED}10`,
                          border: `1px solid ${donationGapEligibility.isEligible ? GREEN : RED}20`,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: donationGapEligibility.isEligible ? GREEN : RED,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: WHITE,
                            fontSize: "0.9rem",
                          }}>
                            {donationGapEligibility.isEligible ? <FaCheck /> : <FaXmark />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: NAVY2, marginBottom: 2 }}>
                              Eligibility Criteria: Last Donation Gap
                            </div>
                            <div style={{ fontSize: "0.8rem", color: SLATE_L }}>
                              {donationGapEligibility.value} • Required: {donationGapEligibility.requirement}
                            </div>
                          </div>
                          <div style={{
                            padding: "4px 10px",
                            borderRadius: 12,
                            background: donationGapEligibility.isEligible ? GREEN : RED,
                            color: WHITE,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                          }}>
                            {donationGapEligibility.status.toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Blood Bank Name */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: NAVY2, marginBottom: 8 }}>
                        Blood Bank Name <span style={{ color: RED }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter blood bank name"
                        value={appointmentForm.bloodBankName}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, bloodBankName: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: `1px solid ${BORDER}`,
                          fontSize: "1rem",
                          fontFamily: FONT,
                        }}
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: NAVY2, marginBottom: 8 }}>
                        Location <span style={{ color: RED }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter location/address"
                        value={appointmentForm.location}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, location: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: `1px solid ${BORDER}`,
                          fontSize: "1rem",
                          fontFamily: FONT,
                        }}
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: NAVY2, marginBottom: 8 }}>
                        Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Any additional notes"
                        value={appointmentForm.notes}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: `1px solid ${BORDER}`,
                          fontSize: "1rem",
                          fontFamily: FONT,
                          resize: "vertical",
                        }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => setShowAppointmentForm(false)}
                        disabled={submitting}
                        style={{
                          flex: 1,
                          padding: "14px 24px",
                          background: WHITE,
                          color: NAVY2,
                          border: `2px solid ${BORDER}`,
                          borderRadius: 10,
                          fontSize: "1rem",
                          fontWeight: 600,
                          cursor: submitting ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          flex: 1,
                          padding: "14px 24px",
                          background: GREEN,
                          color: WHITE,
                          border: "none",
                          borderRadius: 10,
                          fontSize: "1rem",
                          fontWeight: 600,
                          cursor: submitting ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        {submitting ? (
                          <>
                            <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FaArrowRight />
                            Submit Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Eligibility Factors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: WHITE,
            borderRadius: 16,
            border: `1px solid ${BORDER}`,
            padding: "24px",
            marginBottom: 24,
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, marginBottom: 20 }}>
            Eligibility Criteria
          </h3>
          {eligibility.factors.map((factor, index) => (
            <FactorCard key={index} factor={factor} />
          ))}
        </motion.div>

        {/* Medical Status Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: WHITE,
            borderRadius: 16,
            border: `1px solid ${BORDER}`,
            padding: "24px",
            marginBottom: 24,
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, marginBottom: 16 }}>
            Medical Status
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
            {[
              { key: "noFever", label: "No fever in last 24 hours" },
              { key: "noSurgery", label: "No major surgery in last 6 months" },
              { key: "noIllness", label: "No serious illness" },
              { key: "noInfection", label: "No active infection" },
              { key: "noBloodDisease", label: "No blood-related disease" },
              { key: "noMedication", label: "Not taking medication" },
              { key: "noTattoo", label: "No tattoo/piercing in last 6 months" },
              { key: "noPregnancy", label: "Not pregnant (for females)" },
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: medicalStatus[item.key] ? `${GREEN}10` : `${RED}10`,
                  border: `1px solid ${medicalStatus[item.key] ? GREEN : RED}20`,
                }}
              >
                {medicalStatus[item.key] ? (
                  <FaCheck style={{ color: GREEN }} />
                ) : (
                  <FaXmark style={{ color: RED }} />
                )}
                <span style={{ 
                  fontSize: "0.9rem", 
                  fontWeight: 500,
                  color: medicalStatus[item.key] ? NAVY2 : RED 
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Eligibility Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: WHITE,
            borderRadius: 16,
            border: `1px solid ${BORDER}`,
            padding: "24px",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, marginBottom: 16 }}>
            <FaCircleInfo style={{ marginRight: 8, color: BLUE }} />
            Eligibility Guidelines
          </h3>
          <ul style={{ 
            color: SLATE_L, 
            fontSize: "0.95rem", 
            lineHeight: 1.8, 
            paddingLeft: 20,
            margin: 0 
          }}>
            <li style={{ marginBottom: 8 }}><strong>Age:</strong> Must be between 18-65 years old</li>
            <li style={{ marginBottom: 8 }}><strong>Weight:</strong> Minimum 50kg</li>
            <li style={{ marginBottom: 8 }}><strong>Last Donation Gap:</strong> Must wait 3 months (12 weeks/84 days) between donations</li>
            <li style={{ marginBottom: 8 }}><strong>Medical Conditions:</strong> No fever, surgery, serious illness, infection, or blood-related disease</li>
            <li style={{ marginBottom: 8 }}><strong>Medication:</strong> Should not be taking any medication that affects blood donation</li>
            <li style={{ marginBottom: 8 }}><strong>Tattoo/Piercing:</strong> No tattoo or piercing in the last 6 months</li>
            <li><strong>Pregnancy:</strong> Not pregnant (for females)</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <div style={{ fontSize: "0.8rem", color: SLATE_L, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: "1rem", fontWeight: 600, color: NAVY2 }}>{value}</div>
  </div>
);

export default EligibilityChecker;
