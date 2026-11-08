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
import {
  roleToDashboardPath,
  persistAuthSession,
  resolveUserRole,
} from "../../utils/authUtils";

const NETWORK_NODES = [
  { id: "n1", x: 70,  y: 90,  label: "Apex General",    type: "hospital" },
  { id: "n2", x: 230, y: 50,  label: "Riverside Bank",  type: "bank" },
  { id: "n3", x: 360, y: 140, label: "St. Mary's",      type: "hospital" },
  { id: "n4", x: 150, y: 220, label: "Central Lab",     type: "lab" },
  { id: "n5", x: 320, y: 250, label: "North Clinic",    type: "hospital" },
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
        const to   = NETWORK_NODES.find((n) => n.id === b);
        return (
          <line
            key={i}
            x1={from.x} y1={from.y}
            x2={to.x}   y2={to.y}
            className="network-link"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        );
      })}

      {NETWORK_NODES.map((node, i) => (
        <g key={node.id} className="network-node-group">
          <circle cx={node.x} cy={node.y} r="26" fill="url(#nodeGlow)" />
          <circle
            cx={node.x} cy={node.y} r="6"
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

export default function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user } = useUser();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData]  = useState({ email: "", password: "", remember: false });
  const [loading, setLoading]    = useState(false);
  const [error, setError]        = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email    = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!isLoaded) {
      setError("Auth is still initializing. Please wait a moment.");
      return;
    }

    setLoading(true);
    setError("");

    // ── 1. Try Clerk sign-in ──────────────────────────────────────────────
    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        // Retrieve actual Clerk user ID immediately upon session activation
        let clerkId = window.Clerk?.user?.id || window.Clerk?.session?.user?.id;
        if (!clerkId && window.Clerk?.client?.sessions) {
          const session = window.Clerk.client.sessions.find((s) => s.id === result.createdSessionId);
          clerkId = session?.user?.id;
        }
        if (!clerkId) {
          clerkId = user?.id;
        }

        // Fetch user's actual saved role from database (database is single source of truth)
        const { role: resolvedRole, profile: profileData } = await resolveUserRole({
          clerkId,
          email,
          clerkUser: window.Clerk?.user || user,
        });

        // Determine definitive role - NEVER default to "donor"
        const finalRole = resolvedRole || "patient";
        const fullName =
          profileData?.fullName ||
          window.Clerk?.user?.fullName ||
          user?.fullName ||
          "";

        persistAuthSession({
          clerkId: clerkId || profileData?.clerkId,
          fullName,
          email,
          role: finalRole,
        });

        navigate(roleToDashboardPath(finalRole));
        return;
      }

      if (result.status === "needs_first_factor" || result.status === "needs_second_factor") {
        setError("Additional verification is required. Please check your email.");
      } else {
        setError("Sign-in could not be completed. Please try again.");
      }
    } catch (clerkErr) {
      console.warn("Clerk sign-in failed:", clerkErr);

      const rawMsg = clerkErr?.errors?.[0]?.message || clerkErr?.message || "";
      const code   = clerkErr?.errors?.[0]?.code    || "";

      // ── 2. Fallback: DB session when Clerk quota / network fails ──────
      const isQuotaOrNetworkError =
        clerkErr?.status === 403 ||
        rawMsg.toLowerCase().includes("quota") ||
        rawMsg.toLowerCase().includes("exceeded") ||
        rawMsg.toLowerCase().includes("network");

      if (isQuotaOrNetworkError) {
        const { role: resolvedRole, profile: profileData } = await resolveUserRole({
          clerkId: null,
          email,
          clerkUser: null,
        });

        if (profileData || resolvedRole) {
          const role = resolvedRole || profileData?.role || "patient";
          persistAuthSession({
            clerkId: profileData?.clerkId || "usr_local_" + Date.now().toString(36),
            fullName: profileData?.fullName || "HRBMS User",
            email: profileData?.email || email,
            role,
          });
          navigate(roleToDashboardPath(role));
          return;
        }
        setError("Service is temporarily at capacity. Please try again shortly.");
        setLoading(false);
        return;
      }

      // ── 3. Human-readable Clerk error messages ────────────────────────
      if (code === "form_password_incorrect" || rawMsg.toLowerCase().includes("password")) {
        setError("Incorrect password. Please try again.");
      } else if (
        code === "form_identifier_not_found" ||
        rawMsg.toLowerCase().includes("identifier") ||
        rawMsg.toLowerCase().includes("not found")
      ) {
        setError("No account found for this email. Please register first.");
      } else if (rawMsg.toLowerCase().includes("locked")) {
        setError("Your account has been locked after too many failed attempts. Please contact support.");
      } else {
        setError(rawMsg || "Sign-in failed. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* ── LEFT RAIL ── */}
      <div className="auth-rail">
        <div className="auth-rail-top">
          <div className="brand-mark">
            <span className="brand-icon"><FaDroplet /></span>
            <span className="brand-name">HRBMS</span>
          </div>
          <span className="rail-status">
            <span className="pulse-dot" /> Network Online
          </span>
        </div>

        <div className="auth-rail-mid">
          <h1 className="rail-heading">
            One platform.<br />Every blood drop tracked.
          </h1>
          <p className="rail-sub">
            Coordinate hospitals, blood banks, and donor networks in real time — from intake to transfusion.
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

      {/* ── RIGHT STAGE ── */}
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
            {/* Required for Clerk bot-protection / Smart CAPTCHA */}
            <div id="clerk-captcha" />

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
                  onClick={() => setShowPassword((v) => !v)}
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

            <button className="btn-primary" disabled={loading || !isLoaded}>
              {loading ? <span className="btn-spinner" /> : "Sign in"}
            </button>
          </form>

          <div className="auth-card-foot">
            New to HRBMS?{" "}
            <button className="link-accent" onClick={() => navigate("/register")}>
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
