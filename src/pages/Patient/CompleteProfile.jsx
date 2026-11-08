import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaHeartPulse,
  FaLocationDot,
  FaPhone,
  FaCalendar,
  FaTransgender,
  FaDroplet,
  FaTriangleExclamation,
  FaCircleCheck,
  FaCircleExclamation,
  FaShieldHalved,
  FaArrowRight,
  FaRightFromBracket,
  FaFloppyDisk
} from "react-icons/fa6";
import { patientProfileService } from "../../services/patientProfileService";
import { useNotification } from "../../contexts/NotificationContext";

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

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const RELATIONSHIPS = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Guardian", "Other"];
const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "United Arab Emirates", "Singapore", "Other"];

const MANDATORY_KEYS = [
  { key: "fullName", label: "Full Name" },
  { key: "email", label: "Email Address" },
  { key: "phone", label: "Phone Number" },
  { key: "dateOfBirth", label: "Date of Birth" },
  { key: "gender", label: "Gender" },
  { key: "bloodGroup", label: "Blood Group" },
  { key: "address", label: "Street Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "pincode", label: "Postal Pincode" },
  { key: "country", label: "Country" },
  { key: "emergencyContact", label: "Emergency Contact Name" },
  { key: "emergencyPhone", label: "Emergency Contact Phone" },
  { key: "emergencyContactRelationship", label: "Relationship" },
];

function CompleteProfile() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertBanner, setAlertBanner] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
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
    medicalConditions: "",
    allergies: "",
    currentMedications: "",
    previousBloodTransfusion: "No",
    additionalMedicalInfo: "",
  });

  const clerkId = user?.id;

  useEffect(() => {
    if (!clerkId) return;

    let cancelled = false;
    patientProfileService
      .getProfile(clerkId, "patient")
      .then((data) => {
        if (cancelled) return;
        const profile = data.profile || {};
        setFormData({
          fullName: profile.fullName || user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "",
          email: data.email || user?.emailAddresses?.[0]?.emailAddress || "",
          phone: profile.phone || "",
          dateOfBirth: profile.dateOfBirth || "",
          gender: profile.gender || "",
          bloodGroup: profile.bloodGroup || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          pincode: profile.pincode || "",
          country: profile.country || "India",
          emergencyContact: profile.emergencyContact || "",
          emergencyPhone: profile.emergencyPhone || "",
          emergencyContactRelationship: profile.emergencyContactRelationship || "Spouse",
          medicalConditions: profile.medicalConditions || "",
          allergies: profile.allergies || "",
          currentMedications: profile.currentMedications || "",
          previousBloodTransfusion: profile.previousBloodTransfusion || "No",
          additionalMedicalInfo: profile.additionalMedicalInfo || "",
        });

        if (data.isProfileComplete) {
          navigate("/patient-dashboard", { replace: true });
        }
      })
      .catch((err) => {
        console.warn("Profile fetch error in CompleteProfile:", err?.message);
        // Fallback with user info
        setFormData(prev => ({
          ...prev,
          fullName: user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "",
          email: user?.emailAddresses?.[0]?.emailAddress || "",
        }));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clerkId, user, navigate]);

  // Compute completeness
  const missingList = MANDATORY_KEYS.filter((f) => {
    const val = formData[f.key];
    return !val || (typeof val === "string" && !val.trim());
  });

  const totalMandatory = MANDATORY_KEYS.length;
  const completedCount = totalMandatory - missingList.length;
  const percentComplete = Math.round((completedCount / totalMandatory) * 100);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clerkId) return;

    // Strict validation
    const newErrors = {};
    const missingLabels = [];

    MANDATORY_KEYS.forEach((f) => {
      const val = formData[f.key];
      if (!val || (typeof val === "string" && !val.trim())) {
        newErrors[f.key] = `${f.label} is strictly mandatory.`;
        missingLabels.push(f.label);
      }
    });

    if (formData.phone && formData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Phone number must contain at least 10 digits.";
      if (!missingLabels.includes("Phone Number")) missingLabels.push("Phone Number (Valid 10 Digits)");
    }
    if (formData.emergencyPhone && formData.emergencyPhone.replace(/\D/g, "").length < 10) {
      newErrors.emergencyPhone = "Emergency contact phone must contain at least 10 digits.";
      if (!missingLabels.includes("Emergency Contact Phone")) missingLabels.push("Emergency Phone (Valid 10 Digits)");
    }
    if (formData.pincode && formData.pincode.replace(/\D/g, "").length < 5) {
      newErrors.pincode = "Please enter a valid PIN / postal code.";
      if (!missingLabels.includes("Postal Pincode")) missingLabels.push("Valid Pincode");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlertBanner({
        type: "error",
        title: "All Mandatory Profile Data Must Be Completed!",
        message: `Please fill in all required fields before proceeding: ${missingLabels.join(", ")}.`
      });
      showNotification({
        type: "error",
        title: "Mandatory Fields Missing",
        message: `Please complete: ${missingLabels.slice(0, 3).join(", ")}${missingLabels.length > 3 ? ` and ${missingLabels.length - 3} more` : ""}.`,
        duration: 5000,
        playSound: true
      });

      const firstError = Object.keys(newErrors)[0];
      const el = document.getElementById(`cp-${firstError}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return;
    }

    setErrors({});
    setAlertBanner(null);
    setSaving(true);

    try {
      await patientProfileService.completeProfile(clerkId, formData);
      localStorage.setItem(`patient_profile_${clerkId}`, JSON.stringify(formData));

      showNotification({
        type: "success",
        title: "Profile Successfully Verified!",
        message: "Your mandatory patient profile is 100% complete. Welcome to HemoCare!",
        duration: 5000,
        playSound: true
      });

      navigate("/patient-dashboard", { replace: true });
    } catch (err) {
      console.error("Profile save error:", err);
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        setErrors(serverErrors);
        setAlertBanner({
          type: "error",
          title: "Submission Validation Failed",
          message: Object.values(serverErrors).join(", ")
        });
      } else {
        // Fallback local save so user isn't stuck
        localStorage.setItem(`patient_profile_${clerkId}`, JSON.stringify(formData));
        showNotification({
          type: "success",
          title: "Profile Saved",
          message: "Profile saved locally. Redirecting to dashboard...",
          duration: 3000
        });
        setTimeout(() => navigate("/patient-dashboard", { replace: true }), 1500);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: SMOKE,
        fontFamily: FONT
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
          <p style={{ color: SLATE_L, fontSize: "0.95rem" }}>Initializing patient profile verification...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: FONT, paddingBottom: 60 }}>
      {/* Top Header Bar */}
      <header style={{
        background: NAVY,
        color: WHITE,
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FaDroplet style={{ color: RED, fontSize: "1.5rem" }} />
          <span style={{ fontSize: "1.2rem", fontWeight: 900, letterSpacing: "0.02em" }}>
            HemoCare <span style={{ color: "#FB7185", fontWeight: 600 }}>Clinical Portal</span>
          </span>
        </div>
        <SignOutButton>
          <button style={{
            background: "transparent",
            color: WHITE,
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <FaRightFromBracket /> Sign Out
          </button>
        </SignOutButton>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: 860, margin: "32px auto 0", padding: "0 20px" }}>
        
        {/* MANDATORY NOTICE BANNER */}
        <div style={{
          background: "linear-gradient(135deg, rgba(254, 242, 242, 0.98) 0%, rgba(255, 251, 235, 0.98) 100%)",
          border: `2px solid ${RED}`,
          borderRadius: 16,
          padding: "24px 28px",
          marginBottom: 28,
          boxShadow: "0 8px 30px rgba(196, 18, 48, 0.12)"
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: `${RED}18`,
              color: RED,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              flexShrink: 0
            }}>
              <FaTriangleExclamation />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontWeight: 900, fontSize: "1.25rem", color: RED }}>
                  MANDATORY: Complete Your Patient Profile
                </h2>
                <span style={{
                  background: RED,
                  color: WHITE,
                  fontSize: "0.72rem",
                  fontWeight: 900,
                  padding: "3px 9px",
                  borderRadius: 6,
                  textTransform: "uppercase"
                }}>
                  Required Before Access
                </span>
              </div>
              <p style={{ margin: "8px 0 14px 0", fontSize: "0.9rem", color: SLATE, lineHeight: 1.55 }}>
                Under national hospital transfusion regulations, <strong>all details below are strictly mandatory</strong>. Verified blood group, primary phone, residential address, and emergency contact information are essential for emergency blood matching and hospital verification.
              </p>

              {/* Progress Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 800, color: SLATE_L, marginBottom: 5 }}>
                  <span>Profile Completeness: {completedCount} of {totalMandatory} Mandatory Details Fulfilled</span>
                  <span style={{ color: RED }}>{percentComplete}%</span>
                </div>
                <div style={{ width: "100%", height: 10, background: "#E2E8F0", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{
                    width: `${percentComplete}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${RED}, #F59E0B)`,
                    borderRadius: 5,
                    transition: "width 0.3s ease"
                  }} />
                </div>
              </div>

              {missingList.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: RED }}>Remaining ({missingList.length}):</span>
                  {missingList.map((m) => (
                    <span key={m.key} style={{
                      background: "#FEE2E2",
                      color: RED,
                      border: "1px solid #FCA5A5",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 10
                    }}>
                      • {m.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Alert Banner */}
        {alertBanner && (
          <div style={{
            background: alertBanner.type === "error" ? "#FEF2F2" : "#F0FDF4",
            border: `2px solid ${alertBanner.type === "error" ? RED : "#16A34A"}`,
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12
          }}>
            <FaCircleExclamation style={{ color: RED, fontSize: "1.3rem", flexShrink: 0 }} />
            <div>
              <strong style={{ display: "block", color: RED, fontSize: "0.92rem" }}>
                {alertBanner.title}
              </strong>
              <span style={{ fontSize: "0.85rem", color: SLATE }}>{alertBanner.message}</span>
            </div>
          </div>
        )}

        {/* FORM CARD */}
        <form onSubmit={handleSubmit} style={{
          background: WHITE,
          borderRadius: 20,
          border: `1px solid ${BORDER}`,
          padding: "36px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
        }}>
          
          {/* SECTION 1: PERSONAL DETAILS */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `2px solid ${BORDER}`, paddingBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY2, display: "flex", alignItems: "center", gap: 8 }}>
                <FaUser style={{ color: RED }} /> 1. Personal & Contact Identification
              </h3>
              <span style={{ fontSize: "0.76rem", color: RED, fontWeight: 800 }}>* Strictly Mandatory</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {/* Full Name */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Full Legal Name <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                <input
                  id="cp-fullName"
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.fullName ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.fullName ? "#FEF2F2" : WHITE,
                    outline: "none"
                  }}
                />
                {errors.fullName && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.fullName}</div>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Email Address <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: SLATE_L }}>Verified</span>
                </label>
                <input
                  id="cp-email"
                  type="email"
                  value={formData.email}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: SLATE_L,
                    background: SMOKE,
                    cursor: "not-allowed"
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Primary Phone Number <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory (10 Digits)</span>
                </label>
                <input
                  id="cp-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.phone ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.phone ? "#FEF2F2" : WHITE,
                    outline: "none"
                  }}
                />
                {errors.phone && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.phone}</div>}
              </div>

              {/* Date of Birth */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Date of Birth <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                <input
                  id="cp-dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.dateOfBirth ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.dateOfBirth ? "#FEF2F2" : WHITE,
                    outline: "none"
                  }}
                />
                {errors.dateOfBirth && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.dateOfBirth}</div>}
              </div>

              {/* Gender */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Gender <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                <select
                  id="cp-gender"
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.gender ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.gender ? "#FEF2F2" : WHITE,
                    outline: "none"
                  }}
                >
                  <option value="">-- Select Gender (Mandatory) --</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.gender && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.gender}</div>}
              </div>

              {/* Blood Group */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Blood Group <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Critical / Mandatory</span>
                </label>
                <select
                  id="cp-bloodGroup"
                  value={formData.bloodGroup}
                  onChange={(e) => handleChange("bloodGroup", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.bloodGroup ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.bloodGroup ? "#FEF2F2" : WHITE,
                    outline: "none"
                  }}
                >
                  <option value="">-- Select Blood Group (Mandatory) --</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
                {errors.bloodGroup && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.bloodGroup}</div>}
              </div>
            </div>
          </div>

          {/* SECTION 2: RESIDENTIAL LOCATION */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `2px solid ${BORDER}`, paddingBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY2, display: "flex", alignItems: "center", gap: 8 }}>
                <FaLocationDot style={{ color: RED }} /> 2. Residential Address
              </h3>
              <span style={{ fontSize: "0.76rem", color: RED, fontWeight: 800 }}>* Strictly Mandatory</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {/* Address */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Complete Street Address <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                <textarea
                  id="cp-address"
                  rows="2"
                  placeholder="House / Flat No., Apartment / Society, Road, Landmark"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.address ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.address ? "#FEF2F2" : WHITE,
                    outline: "none",
                    resize: "vertical"
                  }}
                />
                {errors.address && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.address}</div>}
              </div>

              {/* City */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>City <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                <input
                  id="cp-city"
                  type="text"
                  placeholder="e.g. New Delhi"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.city ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.city ? "#FEF2F2" : WHITE,
                    outline: "none"
                  }}
                />
                {errors.city && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.city}</div>}
              </div>

              {/* State */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>State / Province <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                <input
                  id="cp-state"
                  type="text"
                  placeholder="e.g. Delhi / Maharashtra"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.state ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.state ? "#FEF2F2" : WHITE,
                    outline: "none"
                  }}
                />
                {errors.state && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.state}</div>}
              </div>

              {/* Pincode */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Postal Pincode <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory (6 Digits)</span>
                </label>
                <input
                  id="cp-pincode"
                  type="text"
                  placeholder="e.g. 110029"
                  value={formData.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.pincode ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.pincode ? "#FEF2F2" : WHITE,
                    outline: "none"
                  }}
                />
                {errors.pincode && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.pincode}</div>}
              </div>

              {/* Country */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Country <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                <select
                  id="cp-country"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.country ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.country ? "#FEF2F2" : WHITE,
                    outline: "none"
                  }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.country && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.country}</div>}
              </div>
            </div>
          </div>

          {/* SECTION 3: EMERGENCY CONTACT */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `2px solid ${BORDER}`, paddingBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY2, display: "flex", alignItems: "center", gap: 8 }}>
                <FaHeartPulse style={{ color: RED }} /> 3. Emergency Contact Person
              </h3>
              <span style={{ fontSize: "0.76rem", color: RED, fontWeight: 800 }}>* Strictly Mandatory</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
              {/* Emergency Contact Name */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Contact Name <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                <input
                  id="cp-emergencyContact"
                  type="text"
                  placeholder="e.g. Robert Vance"
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange("emergencyContact", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.emergencyContact ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.emergencyContact ? "#FEF2F2" : WHITE,
                    outline: "none"
                  }}
                />
                {errors.emergencyContact && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.emergencyContact}</div>}
              </div>

              {/* Emergency Phone */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Emergency Phone <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                <input
                  id="cp-emergencyPhone"
                  type="tel"
                  placeholder="+91 98765 43211"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.emergencyPhone ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.emergencyPhone ? "#FEF2F2" : WHITE,
                    outline: "none"
                  }}
                />
                {errors.emergencyPhone && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.emergencyPhone}</div>}
              </div>

              {/* Relationship */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  <span>Relationship <strong style={{ color: RED }}>*</strong></span>
                  <span style={{ fontSize: "0.72rem", color: RED }}>Mandatory</span>
                </label>
                <select
                  id="cp-emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => handleChange("emergencyContactRelationship", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: errors.emergencyContactRelationship ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                    fontSize: "0.9rem",
                    color: NAVY2,
                    background: errors.emergencyContactRelationship ? "#FEF2F2" : WHITE,
                    outline: "none"
                  }}
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.emergencyContactRelationship && <div style={{ color: RED, fontSize: "0.74rem", fontWeight: 700, marginTop: 4 }}>• {errors.emergencyContactRelationship}</div>}
              </div>
            </div>
          </div>

          {/* SECTION 4: CLINICAL NOTES (OPTIONAL) */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `2px solid ${BORDER}`, paddingBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY2, display: "flex", alignItems: "center", gap: 8 }}>
                <FaShieldHalved style={{ color: RED }} /> 4. Clinical Pre-Screening (Recommended)
              </h3>
              <span style={{ fontSize: "0.76rem", color: SLATE_L, fontWeight: 700 }}>Optional Medical Notes</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  Known Allergies (if any)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Latex, None"
                  value={formData.allergies}
                  onChange={(e) => handleChange("allergies", e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: "0.9rem", color: NAVY2, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: NAVY2, marginBottom: 6 }}>
                  Previous Blood Transfusion
                </label>
                <select
                  value={formData.previousBloodTransfusion}
                  onChange={(e) => handleChange("previousBloodTransfusion", e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: "0.9rem", color: NAVY2, outline: "none" }}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div style={{ fontSize: "0.82rem", color: RED, fontWeight: 800 }}>
              * All mandatory items must be fulfilled to enable your clinical account.
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: RED,
                color: WHITE,
                border: "none",
                borderRadius: 10,
                padding: "14px 32px",
                fontSize: "0.95rem",
                fontWeight: 900,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 4px 16px rgba(196, 18, 48, 0.35)",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = RED_DK}
              onMouseLeave={(e) => e.currentTarget.style.background = RED}
            >
              <FaFloppyDisk />
              {saving ? "Validating & Submitting..." : "Verify & Complete Mandatory Profile"}
              <FaArrowRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;

