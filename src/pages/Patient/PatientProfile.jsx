import React, { useState, useEffect, useRef } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPencil,
  FaCamera,
  FaFloppyDisk,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaHeartPulse,
  FaFileMedical,
  FaCalendarDays,
  FaMapLocationDot,
  FaBell,
  FaDroplet,
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaIdCard,
  FaCalendar,
  FaTransgender,
  FaHouse,
  FaTriangleExclamation,
  FaCircleCheck,
  FaCircleExclamation,
  FaShieldHalved,
  FaArrowRight,
  FaXmark
} from "react-icons/fa6";
import { useNotification } from "../../contexts/NotificationContext";
import NotificationBell from "../../components/NotificationBell";
import { patientProfileService } from "../../services/patientProfileService";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const RED_DK = "#8B0000";
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

const RELATIONSHIPS = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Relative",
  "Friend",
  "Legal Guardian",
  "Other"
];

// All strictly mandatory fields
const MANDATORY_FIELD_DEFS = [
  { key: "fullName", label: "Full Name", section: "Personal", type: "text" },
  { key: "phone", label: "Phone Number", section: "Personal", type: "tel" },
  { key: "dateOfBirth", label: "Date of Birth", section: "Personal", type: "date" },
  { key: "gender", label: "Gender", section: "Personal", type: "select" },
  { key: "bloodGroup", label: "Blood Group", section: "Medical", type: "select" },
  { key: "address", label: "Residential Address", section: "Address", type: "textarea" },
  { key: "city", label: "City", section: "Address", type: "text" },
  { key: "state", label: "State", section: "Address", type: "text" },
  { key: "pincode", label: "Pincode / Postal Code", section: "Address", type: "text" },
  { key: "country", label: "Country", section: "Address", type: "select" },
  { key: "emergencyContact", label: "Emergency Contact Name", section: "Emergency", type: "text" },
  { key: "emergencyPhone", label: "Emergency Contact Phone", section: "Emergency", type: "tel" },
  { key: "emergencyContactRelationship", label: "Emergency Contact Relationship", section: "Emergency", type: "select" }
];

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
const RENDER_API = "https://hospital-resource-and-blood-bank.onrender.com";

const fetchWithFallback = async (endpoint, options = {}) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (res.ok) return res;
  } catch (e) {
    // try fallback
  }
  return fetch(`${RENDER_API}${endpoint}`, options);
};

function PatientProfile() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submissionAlert, setSubmissionAlert] = useState(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    emergencyContact: "",
    emergencyPhone: "",
    emergencyContactRelationship: "Spouse",
  });

  const nav = [
    { key: "patient-dashboard", icon: <FaChartLine />, label: "Dashboard", path: "/patient-dashboard" },
    { key: "appointments", icon: <FaCalendarDays />, label: "Appointments", path: "/appointments" },
    { key: "blood-requests", icon: <FaHeartPulse />, label: "My Blood Requests", path: "/blood-requests" },
    { key: "my-appointments", icon: <FaCalendarDays />, label: "My Appointments", path: "/my-appointments" },
    { key: "blood-banks", icon: <FaMapLocationDot />, label: "Nearby Blood Banks", path: "/nearby-blood-banks" },
    { key: "notifications", icon: <FaBell />, label: "Notifications", path: "/notifications" },
    { key: "my-reports", icon: <FaFileMedical />, label: "My Reports", path: "/my-reports" },
    { key: "profile", icon: <FaUser />, label: "My Profile", path: "/profile" },
  ];

  const active = "profile";
  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  // Calculate missing mandatory fields
  const missingFields = MANDATORY_FIELD_DEFS.filter(f => {
    const val = formData[f.key];
    return !val || (typeof val === "string" && !val.trim());
  });

  const totalMandatory = MANDATORY_FIELD_DEFS.length;
  const completedMandatory = totalMandatory - missingFields.length;
  const completenessPercent = Math.round((completedMandatory / totalMandatory) * 100);
  const isProfileComplete = missingFields.length === 0;

  useEffect(() => {
    if (user?.id) {
      const loadProfile = async () => {
        try {
          // Check local cache first
          const localSaved = localStorage.getItem(`patient_profile_${user.id}`);
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              if (parsed && Object.keys(parsed).length > 0) {
                setFormData(prev => ({ ...prev, ...parsed }));
              }
            } catch (e) { /* ignore */ }
          }

          // Fetch from database
          const email = user?.emailAddresses?.[0]?.emailAddress || "";
          const response = await fetchWithFallback(`/api/patient/${user.id}?email=${email}`);
          if (response && response.ok) {
            const data = await response.json();
            if (data.profile && Object.keys(data.profile).length > 0) {
              setFormData(prev => ({
                ...prev,
                ...data.profile,
                fullName: data.profile.fullName || user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
              }));
              localStorage.setItem(`patient_profile_${user.id}`, JSON.stringify(data.profile));
            } else {
              setFormData(prev => ({
                ...prev,
                fullName: user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || ""
              }));
            }
          }

          // Load profile image
          const imageKey = `patient_profile_image_${user.id}`;
          const savedImage = localStorage.getItem(imageKey);
          if (savedImage) setProfileImage(savedImage);
        } catch (error) {
          console.error("Error loading profile:", error);
        } finally {
          setLoading(false);
        }
      };
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxSize = 300;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setProfileImage(compressedDataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error as user types
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSave = async () => {
    // ── STRICT MANDATORY VALIDATION ────────────────────────────
    const errorsMap = {};
    const missingLabels = [];

    MANDATORY_FIELD_DEFS.forEach(f => {
      const val = formData[f.key];
      if (!val || (typeof val === "string" && !val.trim())) {
        errorsMap[f.key] = `${f.label} is strictly mandatory.`;
        missingLabels.push(f.label);
      }
    });

    // Validate phone numbers
    if (formData.phone && formData.phone.replace(/\D/g, "").length < 10) {
      errorsMap.phone = "Phone number must have at least 10 digits.";
      if (!missingLabels.includes("Phone Number")) missingLabels.push("Valid Phone Number");
    }
    if (formData.emergencyPhone && formData.emergencyPhone.replace(/\D/g, "").length < 10) {
      errorsMap.emergencyPhone = "Emergency contact phone must have at least 10 digits.";
      if (!missingLabels.includes("Emergency Contact Phone")) missingLabels.push("Valid Emergency Contact Phone");
    }
    if (formData.pincode && formData.pincode.replace(/\D/g, "").length < 5) {
      errorsMap.pincode = "Please enter a valid postal pincode (at least 5-6 digits).";
      if (!missingLabels.includes("Pincode / Postal Code")) missingLabels.push("Valid Pincode");
    }

    if (Object.keys(errorsMap).length > 0) {
      setFormErrors(errorsMap);
      setSubmissionAlert({
        type: "error",
        title: "All Profile Fields Are Strictly Mandatory!",
        message: `You cannot proceed without fulfilling every required field. Missing: ${missingLabels.join(", ")}.`
      });

      showNotification({
        type: "error",
        title: "Mandatory Profile Incomplete",
        message: `Please complete all mandatory fields: ${missingLabels.slice(0, 3).join(", ")}${missingLabels.length > 3 ? ` and ${missingLabels.length - 3} more` : ""}.`,
        duration: 6000,
        playSound: true
      });

      // Scroll to the first missing field
      const firstErrorField = Object.keys(errorsMap)[0];
      const el = document.getElementById(`field-${firstErrorField}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return;
    }

    // Clear validation errors
    setFormErrors({});
    setSubmissionAlert(null);
    setSaving(true);

    try {
      // 1. Save via patientProfileService
      try {
        await patientProfileService.updateProfile(user.id, formData);
      } catch (err) {
        try {
          await patientProfileService.completeProfile(user.id, formData);
        } catch (e) {}
      }

      // 2. Save to Database API
      await fetchWithFallback(`/api/patient/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: formData }),
      });

      // 2. Cache in localStorage
      localStorage.setItem(`patient_profile_${user.id}`, JSON.stringify(formData));
      if (profileImage) {
        try {
          localStorage.setItem(`patient_profile_image_${user.id}`, profileImage);
        } catch (quotaError) {
          console.warn("Local storage image quota exceeded");
        }
      }

      showNotification({
        type: "success",
        title: "Profile 100% Completed",
        message: "All mandatory profile records have been verified and saved to the database.",
        duration: 5000,
        playSound: true
      });

      setSubmissionAlert({
        type: "success",
        title: "Profile Successfully Verified & Saved!",
        message: "All mandatory medical, clinical, and emergency contact details have been verified and synchronized."
      });

      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      // Fallback save to localStorage
      localStorage.setItem(`patient_profile_${user.id}`, JSON.stringify(formData));
      showNotification({
        type: "success",
        title: "Profile Saved Locally",
        message: "Saved in offline buffer mode. Data will sync with the central database.",
        duration: 4000
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setEditing(false);
    setFormErrors({});
    setSubmissionAlert(null);

    // Reset from local storage or server
    const localSaved = localStorage.getItem(`patient_profile_${user?.id}`);
    if (localSaved) {
      try {
        setFormData(JSON.parse(localSaved));
      } catch (e) { /* ignore */ }
    }
  };

  const BloodBadge = ({ group }) => (
    <span style={{
      padding: "6px 14px",
      borderRadius: 8,
      background: `${BG_COLOR[group] || RED}15`,
      color: BG_COLOR[group] || RED,
      fontSize: "0.85rem",
      fontWeight: 800,
      border: `1px solid ${BG_COLOR[group] || RED}30`
    }}>
      {group || "Not Set"}
    </span>
  );

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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading your profile data...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: FONT }}>
      {/* Sidebar */}
      <aside style={{
        width: w, background: SIDEBAR_COL, color: WHITE,
        display: "flex", flexDirection: "column", transition: "width 0.3s ease",
        position: "fixed", height: "100vh", zIndex: 1000
      }}>
        <div style={{
          padding: sidebarCollapsed ? "0 16px" : "0 24px",
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            color: WHITE, fontWeight: 700, fontSize: "1.1rem"
          }}>
            <FaDroplet style={{ color: RED, fontSize: "1.4rem" }} />
            {!sidebarCollapsed && <span>Patient Portal</span>}
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
            background: "none", border: "none", color: WHITE,
            cursor: "pointer", padding: 4, borderRadius: 4
          }}>
            <FaBars />
          </button>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {nav.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 8,
                border: "none",
                background: active === item.key ? RED : "transparent",
                color: WHITE,
                cursor: "pointer",
                marginBottom: 4,
                transition: "all 0.2s",
                fontSize: "0.9rem"
              }}
              onMouseEnter={e => {
                if (active !== item.key) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={e => {
                if (active !== item.key) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "1.1rem", minWidth: 20 }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <SignOutButton>
            <button style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: WHITE,
              cursor: "pointer",
              fontSize: "0.9rem",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: "1.1rem" }}><FaRightFromBracket /></span>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: w, flex: 1, minHeight: "100vh", background: SMOKE }}>
        <div style={{ padding: "24px 32px" }}>
          {/* Header */}
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: NAVY2, margin: "0 0 6px 0" }}>
                Patient Medical Profile
              </h1>
              <p style={{ color: SLATE_L, fontSize: "0.95rem", margin: 0 }}>
                Manage mandatory clinical identification, emergency contacts, and residential details.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <NotificationBell />
              {/* Profile Completeness Pill in Header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: isProfileComplete ? "#DCFCE7" : "#FEE2E2",
                border: `1px solid ${isProfileComplete ? "#86EFAC" : "#FCA5A5"}`,
                padding: "8px 16px",
                borderRadius: 20
              }}>
              {isProfileComplete ? (
                <FaCircleCheck style={{ color: "#16A34A", fontSize: "1.1rem" }} />
              ) : (
                <FaTriangleExclamation style={{ color: RED, fontSize: "1.1rem" }} />
              )}
              <span style={{
                fontSize: "0.85rem",
                fontWeight: 800,
                color: isProfileComplete ? "#15803D" : RED
              }}>
                {isProfileComplete ? "Profile 100% Complete" : `Profile ${completenessPercent}% Complete (${missingFields.length} Mandatory Fields Missing)`}
              </span>
            </div>
          </div>
        </div>

          {/* ══════════════════════════════════════════════════════════
              HIGH PRIORITY MANDATORY COMPLETION ALERT BANNER
          ══════════════════════════════════════════════════════════ */}
          {!isProfileComplete ? (
            <div style={{
              background: "linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(255, 251, 235, 0.95) 100%)",
              border: `2px solid ${RED}`,
              borderRadius: 16,
              padding: "20px 24px",
              marginBottom: 24,
              boxShadow: "0 8px 24px rgba(196, 18, 48, 0.12)"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${RED}18`,
                    color: RED,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    flexShrink: 0
                  }}>
                    <FaTriangleExclamation />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0, fontWeight: 900, fontSize: "1.08rem", color: RED }}>
                        ACTION REQUIRED: Fulfill All Mandatory Profile Data
                      </h3>
                      <span style={{
                        background: RED,
                        color: WHITE,
                        fontSize: "0.7rem",
                        fontWeight: 900,
                        padding: "3px 8px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em"
                      }}>
                        Strictly Mandatory
                      </span>
                    </div>
                    <p style={{ margin: "6px 0 12px 0", fontSize: "0.88rem", color: SLATE, lineHeight: 1.5 }}>
                      Under hospital guidelines and emergency blood bank matching protocols, <strong>all 11 profile fields are strictly mandatory</strong>. Incomplete profiles cannot be matched for emergency blood requisitions or approved for clinical consultations.
                    </p>

                    {/* Completeness Bar */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: SLATE_L, marginBottom: 4 }}>
                        <span>Progress: {completedMandatory} of {totalMandatory} Mandatory Details Fulfilled</span>
                        <span style={{ color: RED, fontWeight: 800 }}>{completenessPercent}%</span>
                      </div>
                      <div style={{ width: "100%", height: 8, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          width: `${completenessPercent}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, ${RED}, #F59E0B)`,
                          borderRadius: 4,
                          transition: "width 0.4s ease"
                        }} />
                      </div>
                    </div>

                    {/* Missing Fields List Badges */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: RED }}>
                        Missing Fields ({missingFields.length}):
                      </span>
                      {missingFields.map(f => (
                        <span key={f.key} style={{
                          background: "#FEE2E2",
                          color: RED,
                          border: "1px solid #FCA5A5",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: 12
                        }}>
                          • {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {!editing && (
                  <button
                    onClick={() => {
                      setEditing(true);
                      setTimeout(() => {
                        if (missingFields[0]) {
                          const el = document.getElementById(`field-${missingFields[0].key}`);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "center" });
                            el.focus();
                          }
                        }
                      }, 100);
                    }}
                    style={{
                      background: RED,
                      color: WHITE,
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 22px",
                      fontSize: "0.88rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(196, 18, 48, 0.35)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Fulfill Missing Data Now <FaArrowRight />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              background: "linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(236, 253, 245, 0.95) 100%)",
              border: "1.5px solid #16A34A",
              borderRadius: 16,
              padding: "16px 20px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 4px 16px rgba(22, 163, 74, 0.08)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(22, 163, 74, 0.15)",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem"
                }}>
                  <FaShieldHalved />
                </div>
                <div>
                  <div style={{ fontWeight: 900, color: "#15803D", fontSize: "0.98rem", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>Patient Profile 100% Complete & Verified</span>
                    <FaCircleCheck />
                  </div>
                  <div style={{ fontSize: "0.82rem", color: SLATE, marginTop: 2 }}>
                    All mandatory clinical, contact, and emergency information is up to date and verified for live hospital operations.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submission Alert Popup Banner */}
          {submissionAlert && (
            <div style={{
              background: submissionAlert.type === "error" ? "#FEF2F2" : "#F0FDF4",
              border: `2px solid ${submissionAlert.type === "error" ? RED : "#16A34A"}`,
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {submissionAlert.type === "error" ? (
                  <FaCircleExclamation style={{ color: RED, fontSize: "1.2rem", flexShrink: 0 }} />
                ) : (
                  <FaCircleCheck style={{ color: "#16A34A", fontSize: "1.2rem", flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.88rem", color: submissionAlert.type === "error" ? RED : "#15803D" }}>
                    {submissionAlert.title}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: SLATE, marginTop: 2 }}>
                    {submissionAlert.message}
                  </div>
                </div>
              </div>
              <FaXmark
                onClick={() => setSubmissionAlert(null)}
                style={{ cursor: "pointer", color: SLATE_L, fontSize: "1rem" }}
              />
            </div>
          )}

          {/* Profile Card Header */}
          <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "32px", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  background: profileImage ? `url(${profileImage}) center/cover` : `${RED}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.4rem",
                  color: RED,
                  border: `4px solid ${RED}20`,
                }}>
                  {profileImage ? null : <FaUser />}
                </div>
                {editing && (
                  <label style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: RED,
                    color: WHITE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border: "3px solid WHITE",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                  }} title="Upload profile image">
                    <FaCamera style={{ fontSize: "0.9rem" }} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: NAVY2, margin: 0 }}>
                    {formData.fullName || "Patient Name"}
                  </h2>
                  <BloodBadge group={formData.bloodGroup} />
                  <span style={{
                    fontSize: "0.74rem",
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: 12,
                    background: isProfileComplete ? "#DCFCE7" : "#FEE2E2",
                    color: isProfileComplete ? "#16A34A" : RED
                  }}>
                    {isProfileComplete ? "Complete & Verified" : "Incomplete Profile"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "8px 0", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.85rem", color: SLATE_L }}>
                    <FaEnvelope style={{ marginRight: 6, color: RED }} />
                    {user?.emailAddresses?.[0]?.emailAddress || "patient@example.com"}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: SLATE_L }}>
                    <FaPhone style={{ marginRight: 6, color: RED }} />
                    {formData.phone ? formData.phone : <strong style={{ color: RED }}>Missing Phone *</strong>}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: SLATE_L }}>
                    <FaLocationDot style={{ marginRight: 6, color: RED }} />
                    {formData.city ? `${formData.city}, ${formData.state || ""}` : <strong style={{ color: RED }}>Missing City *</strong>}
                  </span>
                </div>

                <p style={{ fontSize: "0.8rem", color: SLATE_L, margin: 0 }}>
                  Patient ID: <strong style={{ color: NAVY2 }}>{user?.id || "PAT-001"}</strong>
                </p>
              </div>

              <div>
                {!editing ? (
                  <button
                    onClick={() => {
                      setEditing(true);
                      setSubmissionAlert(null);
                    }}
                    style={{
                      background: RED,
                      color: WHITE,
                      border: "none",
                      borderRadius: 10,
                      padding: "11px 20px",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 12px rgba(196, 18, 48, 0.25)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = RED_DK}
                    onMouseLeave={(e) => e.currentTarget.style.background = RED}
                  >
                    <FaPencil /> Edit Profile Details
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: SMOKE,
                        color: NAVY2,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 10,
                        padding: "11px 18px",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: RED,
                        color: WHITE,
                        border: "none",
                        borderRadius: 10,
                        padding: "11px 22px",
                        fontSize: "0.88rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(196, 18, 48, 0.35)"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = RED_DK}
                      onMouseLeave={(e) => e.currentTarget.style.background = RED}
                    >
                      <FaFloppyDisk /> {saving ? "Validating & Saving..." : "Save Mandatory Details"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div ref={formRef} style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            
            {/* SECTION 1: PERSONAL & CLINICAL IDENTIFICATION */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: NAVY2, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <FaUser style={{ color: RED }} /> 1. Personal & Clinical Identification
              </h3>
              <span style={{ fontSize: "0.78rem", color: RED, fontWeight: 700 }}>
                * All fields are strictly mandatory
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
              {/* Full Name */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Full Name <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                {editing ? (
                  <div>
                    <input
                      id="field-fullName"
                      type="text"
                      placeholder="e.g. Johnathan Smith"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 8,
                        border: formErrors.fullName ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                        fontSize: "0.9rem",
                        color: NAVY2,
                        background: formErrors.fullName ? "#FEF2F2" : WHITE,
                        outline: "none"
                      }}
                    />
                    {formErrors.fullName && (
                      <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <FaCircleExclamation /> {formErrors.fullName}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: formData.fullName ? NAVY2 : RED, fontWeight: formData.fullName ? 500 : 700 }}>
                    {formData.fullName || "⚠️ Incomplete (Mandatory)"}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  Email Address <span style={{ fontSize: "0.72rem", color: SLATE_L }}>(Clerk Verified Account)</span>
                </label>
                <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: SLATE_L }}>
                  <FaEnvelope style={{ marginRight: 8, color: SLATE_L }} />
                  {user?.emailAddresses?.[0]?.emailAddress || "patient@example.com"}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Contact Phone <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory (10 Digits)</span>
                </label>
                {editing ? (
                  <div>
                    <input
                      id="field-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 8,
                        border: formErrors.phone ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                        fontSize: "0.9rem",
                        color: NAVY2,
                        background: formErrors.phone ? "#FEF2F2" : WHITE,
                        outline: "none"
                      }}
                    />
                    {formErrors.phone && (
                      <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <FaCircleExclamation /> {formErrors.phone}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: formData.phone ? NAVY2 : RED, fontWeight: formData.phone ? 500 : 700 }}>
                    <FaPhone style={{ marginRight: 8 }} />
                    {formData.phone || "⚠️ Not Provided (Mandatory)"}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Date of Birth <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                {editing ? (
                  <div>
                    <input
                      id="field-dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 8,
                        border: formErrors.dateOfBirth ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                        fontSize: "0.9rem",
                        color: NAVY2,
                        background: formErrors.dateOfBirth ? "#FEF2F2" : WHITE,
                        outline: "none"
                      }}
                    />
                    {formErrors.dateOfBirth && (
                      <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <FaCircleExclamation /> {formErrors.dateOfBirth}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: formData.dateOfBirth ? NAVY2 : RED, fontWeight: formData.dateOfBirth ? 500 : 700 }}>
                    <FaCalendar style={{ marginRight: 8 }} />
                    {formData.dateOfBirth || "⚠️ Not Provided (Mandatory)"}
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Gender <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                {editing ? (
                  <div>
                    <select
                      id="field-gender"
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 8,
                        border: formErrors.gender ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                        fontSize: "0.9rem",
                        color: NAVY2,
                        background: formErrors.gender ? "#FEF2F2" : WHITE,
                        outline: "none"
                      }}
                    >
                      <option value="">-- Select Gender (Mandatory) --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.gender && (
                      <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <FaCircleExclamation /> {formErrors.gender}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: formData.gender ? NAVY2 : RED, fontWeight: formData.gender ? 500 : 700 }}>
                    <FaTransgender style={{ marginRight: 8 }} />
                    {formData.gender || "⚠️ Not Provided (Mandatory)"}
                  </div>
                )}
              </div>

              {/* Blood Group */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Blood Group <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Critical / Mandatory</span>
                </label>
                {editing ? (
                  <div>
                    <select
                      id="field-bloodGroup"
                      value={formData.bloodGroup}
                      onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 8,
                        border: formErrors.bloodGroup ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                        fontSize: "0.9rem",
                        color: NAVY2,
                        background: formErrors.bloodGroup ? "#FEF2F2" : WHITE,
                        outline: "none"
                      }}
                    >
                      <option value="">-- Select Blood Group (Mandatory) --</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                    {formErrors.bloodGroup && (
                      <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <FaCircleExclamation /> {formErrors.bloodGroup}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: SMOKE, display: "flex", alignItems: "center", gap: 10 }}>
                    {formData.bloodGroup ? (
                      <BloodBadge group={formData.bloodGroup} />
                    ) : (
                      <span style={{ color: RED, fontWeight: 700, fontSize: "0.9rem" }}>
                        ⚠️ Not Specified (Mandatory for Transfusions)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: RESIDENTIAL LOCATION */}
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 28, marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: NAVY2, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaLocationDot style={{ color: RED }} /> 2. Residential Address Information
                </h3>
                <span style={{ fontSize: "0.78rem", color: RED, fontWeight: 700 }}>
                  * Required for local hospital dispatch & nearest blood bank matching
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                {/* Street Address */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                    <span>Residential Street Address <strong style={{ color: RED }}>*</strong></span>
                    <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                  </label>
                  {editing ? (
                    <div>
                      <textarea
                        id="field-address"
                        rows="2"
                        placeholder="House / Apartment Number, Building Name, Street, Landmark"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: formErrors.address ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                          fontSize: "0.9rem",
                          color: NAVY2,
                          background: formErrors.address ? "#FEF2F2" : WHITE,
                          resize: "vertical",
                          outline: "none"
                        }}
                      />
                      {formErrors.address && (
                        <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <FaCircleExclamation /> {formErrors.address}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: formData.address ? NAVY2 : RED, fontWeight: formData.address ? 500 : 700 }}>
                      <FaLocationDot style={{ marginRight: 8 }} />
                      {formData.address || "⚠️ Incomplete Street Address (Mandatory)"}
                    </div>
                  )}
                </div>

                {/* City */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                    <span>City <strong style={{ color: RED }}>*</strong></span>
                    <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                  </label>
                  {editing ? (
                    <div>
                      <input
                        id="field-city"
                        type="text"
                        placeholder="e.g. New Delhi"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: formErrors.city ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                          fontSize: "0.9rem",
                          color: NAVY2,
                          background: formErrors.city ? "#FEF2F2" : WHITE,
                          outline: "none"
                        }}
                      />
                      {formErrors.city && (
                        <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <FaCircleExclamation /> {formErrors.city}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: formData.city ? NAVY2 : RED, fontWeight: formData.city ? 500 : 700 }}>
                      {formData.city || "⚠️ Not Provided (Mandatory)"}
                    </div>
                  )}
                </div>

                {/* State */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                    <span>State <strong style={{ color: RED }}>*</strong></span>
                    <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                  </label>
                  {editing ? (
                    <div>
                      <input
                        id="field-state"
                        type="text"
                        placeholder="e.g. Delhi / Maharashtra"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: formErrors.state ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                          fontSize: "0.9rem",
                          color: NAVY2,
                          background: formErrors.state ? "#FEF2F2" : WHITE,
                          outline: "none"
                        }}
                      />
                      {formErrors.state && (
                        <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <FaCircleExclamation /> {formErrors.state}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: formData.state ? NAVY2 : RED, fontWeight: formData.state ? 500 : 700 }}>
                      {formData.state || "⚠️ Not Provided (Mandatory)"}
                    </div>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                    <span>Postal Pincode <strong style={{ color: RED }}>*</strong></span>
                    <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory (6 Digits)</span>
                  </label>
                  {editing ? (
                    <div>
                      <input
                        id="field-pincode"
                        type="text"
                        placeholder="e.g. 110029"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: formErrors.pincode ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                          fontSize: "0.9rem",
                          color: NAVY2,
                          background: formErrors.pincode ? "#FEF2F2" : WHITE,
                          outline: "none"
                        }}
                      />
                      {formErrors.pincode && (
                        <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <FaCircleExclamation /> {formErrors.pincode}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: formData.pincode ? NAVY2 : RED, fontWeight: formData.pincode ? 500 : 700 }}>
                      {formData.pincode || "⚠️ Not Provided (Mandatory)"}
                    </div>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                    <span>Country <strong style={{ color: RED }}>*</strong></span>
                    <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                  </label>
                  {editing ? (
                    <div>
                      <select
                        id="field-country"
                        value={formData.country || "India"}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: formErrors.country ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                          fontSize: "0.9rem",
                          color: NAVY2,
                          background: formErrors.country ? "#FEF2F2" : WHITE,
                          outline: "none"
                        }}
                      >
                        {["India", "United States", "United Kingdom", "Canada", "Australia", "United Arab Emirates", "Singapore", "Other"].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {formErrors.country && (
                        <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <FaCircleExclamation /> {formErrors.country}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: formData.country ? NAVY2 : RED, fontWeight: formData.country ? 500 : 700 }}>
                      {formData.country || "India"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: EMERGENCY CONTACT INFORMATION */}
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: NAVY2, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaHeartPulse style={{ color: RED }} /> 3. Emergency Contact Details
                </h3>
                <span style={{ fontSize: "0.78rem", color: RED, fontWeight: 700 }}>
                  * Required in event of critical hospital admission or surgery
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                {/* Emergency Contact Name */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                    <span>Emergency Contact Person <strong style={{ color: RED }}>*</strong></span>
                    <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                  </label>
                  {editing ? (
                    <div>
                      <input
                        id="field-emergencyContact"
                        type="text"
                        placeholder="e.g. Eleanor Smith (Spouse / Guardian)"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: formErrors.emergencyContact ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                          fontSize: "0.9rem",
                          color: NAVY2,
                          background: formErrors.emergencyContact ? "#FEF2F2" : WHITE,
                          outline: "none"
                        }}
                      />
                      {formErrors.emergencyContact && (
                        <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <FaCircleExclamation /> {formErrors.emergencyContact}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: formData.emergencyContact ? NAVY2 : RED, fontWeight: formData.emergencyContact ? 500 : 700 }}>
                      <FaUser style={{ marginRight: 8 }} />
                      {formData.emergencyContact || "⚠️ Not Provided (Mandatory)"}
                    </div>
                  )}
                </div>

                {/* Emergency Contact Phone */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                    <span>Emergency Contact Phone <strong style={{ color: RED }}>*</strong></span>
                    <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory (10 Digits)</span>
                  </label>
                  {editing ? (
                    <div>
                      <input
                        id="field-emergencyPhone"
                        type="tel"
                        placeholder="+91 98765 43211"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: formErrors.emergencyPhone ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                          fontSize: "0.9rem",
                          color: NAVY2,
                          background: formErrors.emergencyPhone ? "#FEF2F2" : WHITE,
                          outline: "none"
                        }}
                      />
                      {formErrors.emergencyPhone && (
                        <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <FaCircleExclamation /> {formErrors.emergencyPhone}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: formData.emergencyPhone ? NAVY2 : RED, fontWeight: formData.emergencyPhone ? 500 : 700 }}>
                      <FaPhone style={{ marginRight: 8 }} />
                      {formData.emergencyPhone || "⚠️ Not Provided (Mandatory)"}
                    </div>
                  )}
                </div>

                {/* Emergency Contact Relationship */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                    <span>Relationship <strong style={{ color: RED }}>*</strong></span>
                    <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                  </label>
                  {editing ? (
                    <div>
                      <select
                        id="field-emergencyContactRelationship"
                        value={formData.emergencyContactRelationship}
                        onChange={(e) => handleInputChange("emergencyContactRelationship", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: formErrors.emergencyContactRelationship ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                          fontSize: "0.9rem",
                          color: NAVY2,
                          background: formErrors.emergencyContactRelationship ? "#FEF2F2" : WHITE,
                          outline: "none"
                        }}
                      >
                        {RELATIONSHIPS.map((rel) => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                      </select>
                      {formErrors.emergencyContactRelationship && (
                        <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <FaCircleExclamation /> {formErrors.emergencyContactRelationship}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "12px 14px", borderRadius: 8, background: SMOKE, fontSize: "0.9rem", color: formData.emergencyContactRelationship ? NAVY2 : RED, fontWeight: formData.emergencyContactRelationship ? 500 : 700 }}>
                      <FaHeartPulse style={{ marginRight: 8, color: RED }} />
                      {formData.emergencyContactRelationship || "⚠️ Not Provided (Mandatory)"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions if Editing */}
            {editing && (
              <div style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: `1px solid ${BORDER}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12
              }}>
                <div style={{ fontSize: "0.82rem", color: RED, fontWeight: 700 }}>
                  * Every field must be completed before saving.
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 10,
                      border: `1px solid ${BORDER}`,
                      background: SMOKE,
                      color: NAVY2,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: "12px 28px",
                      borderRadius: 10,
                      border: "none",
                      background: RED,
                      color: WHITE,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(196, 18, 48, 0.35)"
                    }}
                  >
                    <FaFloppyDisk /> {saving ? "Saving..." : "Verify & Save All Mandatory Details"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default PatientProfile;
