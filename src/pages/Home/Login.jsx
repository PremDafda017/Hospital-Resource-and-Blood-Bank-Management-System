import React, { useState } from "react";
import "./Login.css";
import { useSignIn, useUser } from "@clerk/clerk-react";
import {
  FaEye,
  FaEyeSlash,
  FaDroplet,
  FaShieldHalved,
  FaChartLine,
  FaHospital,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const NETWORK_NODES = [
  { id: "n1", x: 70, y: 90, label: "Apex General", type: "hospital" },
  { id: "n2", x: 230, y: 50, label: "Riverside Bank", type: "bank" },
  { id: "n3", x: 360, y: 140, label: "St. Mary's", type: "hospital" },
  { id: "n4", x: 150, y: 220, label: "Central Lab", type: "lab" },
  { id: "n5", x: 320, y: 250, label: "North Clinic", type: "hospital" },
];

const NETWORK_LINKS = [
  ["n1", "n2"],
  ["n2", "n3"],
  ["n2", "n4"],
  ["n4", "n5"],
  ["n3", "n5"],
];

function NetworkVisualization() {
  return (
    <svg
      className="network-svg"
      viewBox="0 0 420 300"
      role="img"
      aria-label="Live network of connected hospitals and blood banks"
    >
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
      </defs>

      {NETWORK_LINKS.map(([a, b], i) => {
        const from = NETWORK_NODES.find((n) => n.id === a);
        const to = NETWORK_NODES.find((n) => n.id === b);
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className="network-link"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        );
      })}

      {NETWORK_NODES.map((node, i) => (
        <g key={node.id} className="network-node-group">
          <circle cx={node.x} cy={node.y} r="26" fill="url(#nodeGlow)" />
          <circle
            cx={node.x}
            cy={node.y}
            r="6"
            className="network-node-dot"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
          <text x={node.x} y={node.y - 16} className="network-node-label">
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user } = useUser();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded) return;

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === "complete") {
        await setActive({
          session: result.createdSessionId,
        });

        // Fetch user role from backend after successful login
        try {
          const clerkId = user?.id;
          if (clerkId) {
            const profileResponse = await fetch(`http://127.0.0.1:5000/api/users/profile/${clerkId}`);
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              const userRole = profileData.role;
              
              // Store user data in localStorage for dashboard to use
              localStorage.setItem("userFullName", profileData.fullName || "");
              localStorage.setItem("userEmail", profileData.email || "");
              localStorage.setItem("userRole", userRole || "");

              // Redirect based on role
              switch (userRole) {
                case "administrator":
                  navigate("/admin-dashboard");
                  break;
                case "patient":
                  navigate("/patient-dashboard");
                  break;
                case "hospital_staff":
                  navigate("/hospital-dashboard");
                  break;
                case "blood_bank_staff":
                  navigate("/bloodbank-dashboard");
                  break;
                case "donor":
                  navigate("/donor-dashboard");
                  break;
                default:
                  navigate("/");
              }
              return;
            }
          }
        } catch (profileErr) {
          console.error("Failed to fetch user profile:", profileErr);
          // Fallback to home page if profile fetch fails
        }

        // Fallback to home page if no role found
        navigate("/");
      } else if (result.status === "needs_first_factor" || result.status === "needs_second_factor") {
        setError("Additional verification required. Please check your email.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.errors?.[0]?.message;
      const errorStatus = err.status;
      
      if (errorStatus === 422) {
        // 422 typically means the resource exists but can't be processed
        // This could mean the email exists but wrong credentials, or email doesn't exist
        if (errorMessage?.includes("identifier") || errorMessage?.includes("form_identifier")) {
          setError("Email not found. Please check your email or create an account.");
        } else if (errorMessage?.includes("password")) {
          setError("Incorrect password. Please try again.");
        } else if (errorMessage?.includes("email_address") && errorMessage?.includes("taken")) {
          setError("This email is already registered. Please log in instead.");
        } else {
          setError(errorMessage || "Login failed. Please try again.");
        }
      } else if (errorMessage?.includes("identifier")) {
        setError("Email not found. Please check your email or create an account.");
      } else if (errorMessage?.includes("password")) {
        setError("Incorrect password. Please try again.");
      } else {
        setError(errorMessage || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* LEFT — Live network / system identity panel */}
      <div className="auth-rail">
        <div className="auth-rail-top">
          <div className="brand-mark">
            <span className="brand-icon">
              <FaDroplet />
            </span>
            <span className="brand-name">HRBMS</span>
          </div>
          <span className="rail-status">
            <span className="pulse-dot" /> Network Online
          </span>
        </div>

        <div className="auth-rail-mid">
          <h1 className="rail-heading">
            One platform.
            <br />
            Every blood drop tracked.
          </h1>
          <p className="rail-sub">
            Coordinate hospitals, blood banks, and donor networks in real time
            — from intake to transfusion.
          </p>

          <NetworkVisualization />
        </div>

        <div className="auth-rail-bottom">
          <div className="rail-metric">
            <FaShieldHalved />
            <div>
              <strong>HIPAA-aligned</strong>
              <span>Encrypted records</span>
            </div>
          </div>
          <div className="rail-metric">
            <FaChartLine />
            <div>
              <strong>AI demand model</strong>
              <span>Predictive stock alerts</span>
            </div>
          </div>
          <div className="rail-metric">
            <FaHospital />
            <div>
              <strong>Multi-site</strong>
              <span>Unified inventory</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Auth card */}
      <div className="auth-stage">
        <div className="auth-card">
          <div className="auth-card-head">
            <h2>Sign in</h2>
            <p>Access your operations console</p>
          </div>

          {error && (
            <div className="auth-alert" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@hospital.org"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="field-with-action">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
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
            </div>

            <div className="field-row">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                <span>Keep me signed in</span>
              </label>

              <button type="button" className="link-muted">
                Forgot password?
              </button>
            </div>

            <button className="btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : "Sign in"}
            </button>
          </form>

          <div className="auth-card-foot">
            New to HRBMS?
            <button className="link-accent" onClick={() => navigate("/register")}>
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;