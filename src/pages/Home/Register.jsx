import React, { useState } from "react";
import "./Register.css";
import { useSignUp } from "@clerk/clerk-react";
import {
  FaDroplet,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaUserDoctor,
  FaUserNurse,
  FaHandHoldingMedical,
  FaUserShield,
  FaCheck,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const STEPS = ["Identity", "Role", "Security", "Confirm"];

const ROLES = [
  { value: "donor", label: "Donor", icon: <FaHandHoldingMedical />, description: "Save lives by donating blood", emoji: "❤️" },
  { value: "patient", label: "Patient", icon: <FaUser />, description: "Request blood and manage health", emoji: "🧑" },
  { value: "hospital_staff", label: "Hospital Staff", icon: <FaUserNurse />, description: "Manage hospital operations", emoji: "🏥" },
  { value: "blood_bank_staff", label: "Blood Bank Staff", icon: <FaUserDoctor />, description: "Manage blood inventory", emoji: "🩸" },
  { value: "administrator", label: "Administrator", icon: <FaUserShield />, description: "Full system access", emoji: "👑" },
];

function getPasswordStrength(password) {
  if (!password) return { label: "", score: 0, tips: [] };
  
  const tips = [];
  let score = 0;

  if (password.length < 8) {
    tips.push("Add more characters (minimum 8)");
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    tips.push("Add uppercase letters");
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    tips.push("Add lowercase letters");
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    tips.push("Add numbers");
  } else {
    score += 1;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    tips.push("Add special characters (!@#$%)");
  } else {
    score += 1;
  }

  // Check for common patterns
  if (/^[a-zA-Z]+$/.test(password)) {
    tips.push("Avoid letters only");
  }
  if (/^[0-9]+$/.test(password)) {
    tips.push("Avoid numbers only");
  }
  if (/123|abc|qwerty|password|admin/i.test(password)) {
    tips.push("Avoid common patterns");
    score = Math.max(1, score - 2);
  }

  if (score >= 5) return { label: "Very Strong", score: 4, tips: [] };
  if (score >= 4) return { label: "Strong", score: 3, tips: [] };
  if (score >= 2) return { label: "Medium", score: 2, tips };
  return { label: "Weak", score: 1, tips };
}

function Register() {
  const { isLoaded, signUp } = useSignUp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    adminAccessCode: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBreachWarning, setShowBreachWarning] = useState(false);

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const selectRole = (value) => {
    setFormData({ ...formData, role: value });
  };

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (!formData.fullName.trim() || !formData.email.trim()) {
        setError("Please fill in your name and email.");
        return false;
      }
    }
    if (step === 1) {
      if (!formData.role) {
        setError("Please select a role to continue.");
        return false;
      }
      if (formData.role === "administrator" && !formData.adminAccessCode.trim()) {
        setError("Please enter the Admin Access Code to register as Administrator.");
        return false;
      }
      if (formData.role === "administrator" && formData.adminAccessCode.trim() !== "ADMIN2024") {
        setError("Invalid Admin Access Code. Please contact the Super Admin.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.password || formData.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded || !signUp) {
      setError("Auth is still initializing. Please wait.");
      return;
    }

    if (!formData.terms) {
      setError("Please accept Terms & Conditions.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      localStorage.setItem("pendingEmail", formData.email);
      localStorage.setItem("pendingFullName", formData.fullName);
      localStorage.setItem("pendingRole", formData.role);

      setSuccess("Account created. Verification code sent.");

      setTimeout(() => {
        navigate("/verify-otp");
      }, 1100);
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err?.errors?.[0]?.message;
      
      // Handle password breach detection
      if (errorMessage?.includes("data breach") || errorMessage?.includes("found in an online data breach")) {
        setShowBreachWarning(true);
        setError("");
      } else if (errorMessage?.includes("email_address")) {
        if (errorMessage?.includes("already exists") || errorMessage?.includes("taken")) {
          setError("This email is already registered. Please login instead.");
        } else if (errorMessage?.includes("invalid")) {
          setError("Please enter a valid email address.");
        } else {
          setError(errorMessage || "Email registration failed.");
        }
      } else if (errorMessage?.includes("password")) {
        if (errorMessage?.includes("too short") || errorMessage?.includes("length")) {
          setError("Password must be at least 8 characters.");
        } else {
          setError(errorMessage || "Password is invalid.");
        }
      } else {
        setError(errorMessage || err?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* LEFT RAIL */}
      <div className="auth-rail">
        <div className="auth-rail-top">
          <div className="brand-mark">
            <span className="brand-icon">
              <FaDroplet />
            </span>
            <span className="brand-name">HRBMS</span>
          </div>
        </div>

        <div className="auth-rail-mid">
          <h1 className="rail-heading">
            Built for the
            <br />
            speed of an emergency.
          </h1>
          <p className="rail-sub">
            Every account links into one live inventory — so a request at 3am
            finds the nearest unit, instantly.
          </p>

          <ul className="rail-checklist">
            <li>
              <FaCheck /> Role-based access for every team
            </li>
            <li>
              <FaCheck /> Real-time blood stock across sites
            </li>
            <li>
              <FaCheck /> AI-assisted demand forecasting
            </li>
            <li>
              <FaCheck /> Audit-ready activity history
            </li>
          </ul>
        </div>

        <div className="auth-rail-bottom register-rail-bottom">
          <span className="rail-status">
            <span className="pulse-dot" /> 5 roles supported · 1 unified record
          </span>
        </div>
      </div>

      {/* RIGHT STAGE */}
      <div className="auth-stage">
        <div className="auth-card register-card">
          <div className="auth-card-head">
            <h2>Create your account</h2>
            <p>Start managing healthcare resources</p>
          </div>

          {/* Step progress */}
          <div className="step-track" role="list">
            {STEPS.map((label, i) => (
              <div
                key={label}
                role="listitem"
                className={`step-node ${i < step ? "done" : ""} ${i === step ? "active" : ""}`}
              >
                <span className="step-dot">{i < step ? <FaCheck /> : i + 1}</span>
                <span className="step-label">{label}</span>
              </div>
            ))}
          </div>

          {error && <div className="auth-alert">{error}</div>}
          {success && <div className="auth-alert success">{success}</div>}
          
          {showBreachWarning && (
            <div className="auth-alert warning" style={{ background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: "1.2rem" }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", marginBottom: 4 }}>Password Security Alert</strong>
                  <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.4 }}>
                    This password has been found in online data breaches. For your account safety, please choose a different, more secure password.
                  </p>
                  <div style={{ marginTop: 8, fontSize: "0.8rem", color: "#78350F" }}>
                    <strong>Tips for a secure password:</strong>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                      <li>Use at least 12 characters</li>
                      <li>Mix letters, numbers, and symbols</li>
                      <li>Avoid common words or patterns</li>
                      <li>Use a unique password for each account</li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBreachWarning(false)}
                    style={{
                      marginTop: 12,
                      padding: "6px 12px",
                      background: "#F59E0B",
                      border: "none",
                      borderRadius: 6,
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      cursor: "pointer"
                    }}
                  >
                    I'll use a different password
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {step === 0 && (
              <div className="step-panel">
                <div className="field">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="e.g. Aanya Mehta"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@hospital.org"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="step-panel">
                <span className="step-panel-label">Select your role</span>
                <div className="role-grid">
                  {ROLES.map((r) => (
                    <button
                      type="button"
                      key={r.value}
                      className={`role-card ${formData.role === r.value ? "selected" : ""}`}
                      onClick={() => selectRole(r.value)}
                    >
                      <div className="role-card-content">
                        <div className="role-icon-wrapper">
                          <span className="role-icon">{r.icon}</span>
                          {formData.role === r.value && <span className="role-checkmark"><FaCheck /></span>}
                        </div>
                        <div className="role-info">
                          <span className="role-emoji">{r.emoji}</span>
                          <span className="role-label">{r.label}</span>
                          <span className="role-description">{r.description}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {formData.role === "administrator" && (
                  <div className="field" style={{ marginTop: "20px" }}>
                    <label htmlFor="adminAccessCode">Admin Access Code</label>
                    <input
                      id="adminAccessCode"
                      type="text"
                      name="adminAccessCode"
                      placeholder="Enter admin access code"
                      value={formData.adminAccessCode}
                      onChange={handleChange}
                      style={{
                        fontFamily: "monospace",
                        letterSpacing: "2px",
                        textTransform: "uppercase"
                      }}
                    />
                    <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "4px" }}>
                      Contact Super Admin to get the access code
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="step-panel">
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <div className="field-with-action">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="field-action"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formData.password && (
                    <>
                      <div className="strength-track">
                        <div className={`strength-fill s${strength.score}`} />
                        <span className={`strength-text s${strength.score}`}>
                          {strength.label}
                        </span>
                      </div>
                      {strength.tips.length > 0 && (
                        <div style={{ 
                          marginTop: 8, 
                          padding: "8px 12px", 
                          background: "#FEF3C7", 
                          border: "1px solid #F59E0B", 
                          borderRadius: 6, 
                          fontSize: "0.75rem", 
                          color: "#92400E" 
                        }}>
                          <strong>To strengthen your password:</strong>
                          <ul style={{ margin: "4px 0 0 12px", padding: 0 }}>
                            {strength.tips.map((tip, i) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <div className="field-with-action">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="field-action"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-panel">
                <div className="review-box">
                  <div className="review-row">
                    <span>Name</span>
                    <strong>{formData.fullName || "—"}</strong>
                  </div>
                  <div className="review-row">
                    <span>Email</span>
                    <strong>{formData.email || "—"}</strong>
                  </div>
                  <div className="review-row">
                    <span>Role</span>
                    <strong style={{ textTransform: "capitalize" }}>
                      {formData.role.replace("_", " ") || "—"}
                    </strong>
                  </div>
                </div>

                <label className="checkbox-row terms-row">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                  />
                  <span>I accept the Terms & Conditions and Privacy Policy</span>
                </label>
              </div>
            )}

            <div className="step-actions">
              {step > 0 && (
                <button type="button" className="btn-ghost" onClick={goBack}>
                  Back
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <button type="button" className="btn-primary" onClick={goNext}>
                  Continue
                </button>
              ) : (
                <button className="btn-primary" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : "Create account"}
                </button>
              )}
            </div>
          </form>

          <div className="auth-card-foot">
            Already have an account?
            <button className="link-accent" onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;