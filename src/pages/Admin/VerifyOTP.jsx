import React, { useState, useEffect, useRef } from "react";
import "../Home/VerifyOTP.css";
import { useSignUp, useSignIn } from "@clerk/clerk-react";
import { FaShieldHalved, FaCircleCheck, FaDroplet } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import {
  roleToDashboardPath,
  persistAuthSession,
} from "../../utils/authUtils";

const API_LOCAL = "http://127.0.0.1:5000";
const API_REMOTE = "https://hospital-resource-and-blood-bank.onrender.com";

function VerifyOTP() {
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const { isLoaded: signInLoaded, setActive } = useSignIn();
  const navigate = useNavigate();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [infoNotice, setInfoNotice] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputs = useRef([]);
  const pendingEmail = localStorage.getItem("pendingEmail") || "";
  const pendingFullName = localStorage.getItem("pendingFullName") || "HRBMS Administrator";
  const pendingRole =
    localStorage.getItem("pendingRole") ||
    localStorage.getItem("userRole") ||
    "administrator";

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5 && inputs.current[index + 1]) {
      inputs.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0 && inputs.current[index - 1]) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();

    const newCode = ["", "", "", "", "", ""];
    pasted.split("").forEach((digit, i) => {
      newCode[i] = digit;
    });
    setCode(newCode);

    const nextIndex = Math.min(pasted.length, 5);
    inputs.current[nextIndex]?.focus();
  };

  const saveProfileToDatabase = async ({ clerkId, fullName, email, role }) => {
    const payload = JSON.stringify({ clerkId, fullName, email, role });
    const headers = { "Content-Type": "application/json" };

    const endpoints = [
      `${API_LOCAL}/api/users/create-profile`,
      `${API_REMOTE}/api/users/create-profile`,
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, { method: "POST", headers, body: payload });
        if (res.ok) {
          console.log(`[HRBMS Admin] Profile successfully synced to backend: ${url}`);
          return true;
        }
      } catch (err) {
        console.warn(`[HRBMS Admin] Could not reach ${url}:`, err.message);
      }
    }
    return false;
  };

  const completeActivation = async (clerkId, sessionId) => {
    if (!clerkId || !sessionId) {
      setError("Authentication failed: Missing verification credentials.");
      return;
    }

    const email = pendingEmail || signUp?.emailAddress || "";
    const fullName = pendingFullName || "HRBMS Administrator";
    const role = (pendingRole || "administrator").toLowerCase().trim();

    try {
      await saveProfileToDatabase({
        clerkId,
        fullName,
        email,
        role,
      });
    } catch (e) {
      console.warn("DB admin profile sync fallback:", e);
    }

    persistAuthSession({
      clerkId,
      fullName,
      email,
      role,
    });

    localStorage.removeItem("pendingEmail");
    localStorage.removeItem("pendingFullName");
    localStorage.removeItem("pendingRole");
    localStorage.removeItem("quotaExceeded");

    if (setActive && typeof setActive === "function") {
      try {
        await setActive({ session: sessionId });
      } catch (err) {
        console.warn("Admin setActive error:", err);
      }
    }

    setSuccess(true);
    setError("");
    setInfoNotice("");

    setTimeout(() => {
      navigate(roleToDashboardPath(role));
    }, 1200);
  };

  const verifyOTP = async () => {
    const otp = code.join("").trim();

    if (!signUpLoaded || !signUp) {
      setError("Authentication service is initializing. Please wait.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: otp,
      });

      const createdSessionId = completeSignUp?.createdSessionId;

      if (completeSignUp?.status === "complete" && createdSessionId) {
        const clerkId = completeSignUp.createdUserId;
        await completeActivation(clerkId, createdSessionId);
      } else {
        setError("Verification could not be completed. Please enter a valid code.");
      }
    } catch (err) {
      console.warn("Clerk Admin OTP verification error:", err);
      const rawMsg = err?.errors?.[0]?.message || err?.message || "";
      setError(rawMsg || "Invalid verification code. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!signUpLoaded || !signUp) {
      setError("Auth is still initializing. Please wait.");
      return;
    }

    try {
      setLoading(true);
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setTimer(60);
      setError("");
      setInfoNotice("A new 6-digit code has been sent to your email.");
    } catch (err) {
      const rawMsg = err?.errors?.[0]?.message || err?.message || "";
      setError("Failed to resend OTP: " + (rawMsg || "Please try again later."));
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = pendingEmail
    ? pendingEmail.replace(/(.{2}).+(@.+)/, "$1••••$2")
    : "your registered email";

  return (
    <div className="verify-shell">
      <div className="verify-bg-grid" aria-hidden="true" />
      <div id="clerk-captcha" />

      <div className="verify-card">
        <div className={`verify-icon-ring ${success ? "is-success" : ""}`}>
          <div className="verify-icon-pulse" />
          {success ? <FaCircleCheck /> : <FaShieldHalved />}
        </div>

        <h1>{success ? "Verified" : "Verify Admin Email"}</h1>

        <p>
          {success ? (
            "Your identity has been confirmed. Redirecting to admin console…"
          ) : (
            <>
              We sent a 6-digit code to <strong>{maskedEmail}</strong>
            </>
          )}
        </p>

        {infoNotice && (
          <div
            style={{
              background: "rgba(59, 130, 246, 0.12)",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              color: "#93C5FD",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginBottom: "16px",
              textAlign: "left",
              lineHeight: 1.45,
            }}
          >
            ℹ️ {infoNotice}
          </div>
        )}

        {error && (
          <div className="verify-error" role="alert">
            {error}
          </div>
        )}

        {success ? (
          <div className="success-text">
            <span className="success-bar" />
            Redirecting to admin console…
          </div>
        ) : (
          <>
            <div className="otp-box" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value.replace(/\D/g, ""), index)}
                  onKeyDown={(e) => handleBackspace(e, index)}
                  aria-label={`Digit ${index + 1} of 6`}
                />
              ))}
            </div>

            <button
              className="verify-btn"
              onClick={verifyOTP}
              disabled={loading}
            >
              {loading ? <span className="btn-spinner" /> : "Verify email"}
            </button>

            <div className="resend-area">
              {timer > 0 ? (
                <span>
                  Resend code in <strong>{timer}s</strong>
                </span>
              ) : (
                <button className="resend-btn" onClick={resendOTP} disabled={loading}>
                  Resend code
                </button>
              )}
            </div>
          </>
        )}

        <div className="verify-footer-mark">
          <FaDroplet /> HRBMS Secure Verification
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
