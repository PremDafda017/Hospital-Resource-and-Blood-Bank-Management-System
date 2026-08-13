import React, { useState, useEffect, useRef } from "react";
import "./VerifyOTP.css";
import { useSignUp, useSignIn } from "@clerk/clerk-react";
import { FaShieldHalved, FaCircleCheck, FaDroplet } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

function VerifyOTP() {
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const { isLoaded: signInLoaded, setActive } = useSignIn();
  const navigate = useNavigate();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputs = useRef([]);
  const pendingEmail = localStorage.getItem("pendingEmail") || "";

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

  const verifyOTP = async () => {
    if (!signUpLoaded || !signInLoaded || !signUp) {
      setError("Auth is still initializing. Please wait.");
      return;
    }

    const otp = code.join("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
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
        const email = pendingEmail || completeSignUp.emailAddress;
        const fullName = localStorage.getItem("pendingFullName") || "John Doe Tester";
        const role = localStorage.getItem("pendingRole") || "donor";

        try {
          const profileResponse = await fetch("http://127.0.0.1:5000/api/users/create-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              clerkId,
              fullName,
              email,
              role,
            }),
          });
          
          if (profileResponse.ok) {
            console.log("Profile created successfully");
          } else {
            console.error("Profile creation failed:", profileResponse.status);
          }
        } catch (dbErr) {
          console.error("Failed to store user profile in MongoDB:", dbErr);
        }

        // Store user data in localStorage for Dashboard to use as fallback
        localStorage.setItem("userFullName", fullName);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", role);

        localStorage.removeItem("pendingEmail");
        localStorage.removeItem("pendingFullName");
        localStorage.removeItem("pendingRole");

        if (setActive && typeof setActive === "function") {
          await setActive({ session: createdSessionId });
        }

        setSuccess(true);
        setTimeout(() => {
          // Navigate to role-specific dashboard
          switch (role) {
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
            case "administrator":
              navigate("/admin-dashboard");
              break;
            default:
              navigate("/");
          }
        }, 1100);
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err) {
      setError(err?.errors?.[0]?.message || err?.message || "Invalid verification code.");
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
    } catch (err) {
      setError("Failed to resend OTP.");
      console.error(err);
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

      <div className="verify-card">
        <div className={`verify-icon-ring ${success ? "is-success" : ""}`}>
          <div className="verify-icon-pulse" />
          {success ? <FaCircleCheck /> : <FaShieldHalved />}
        </div>

        <h1>{success ? "Verified" : "Verify your email"}</h1>

        <p>
          {success ? (
            "Your identity has been confirmed."
          ) : (
            <>
              We sent a 6-digit code to <strong>{maskedEmail}</strong>
            </>
          )}
        </p>

        {error && (
          <div className="verify-error" role="alert">
            {error}
          </div>
        )}

        {success ? (
          <div className="success-text">
            <span className="success-bar" />
            Redirecting to home page…
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

            <button className="verify-btn" onClick={verifyOTP} disabled={loading}>
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