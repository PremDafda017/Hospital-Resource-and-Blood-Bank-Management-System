import React, { useEffect, useState } from "react";
import { FaCreditCard, FaSpinner, FaCircleCheck, FaCircleXmark } from "react-icons/fa6";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const NAVY = "#0F172A";
const SLATE = "#64748B";
const BORDER = "#E2E8F0";
const WHITE = "#FFFFFF";

function RazorpayPayment({
  amount,
  currency = "INR",
  name = "HemoCare",
  description = "Payment",
  orderId,
  prefill = {},
  onSuccess,
  onFailure,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load Razorpay script
    const loadScript = () => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setError("Failed to load payment gateway");
      document.body.appendChild(script);
    };

    loadScript();
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      setError("Payment gateway is loading. Please wait...");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if we have a valid Razorpay key
      const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
      
      if (!razorpayKey || razorpayKey === "rzp_test_demo_key" || razorpayKey.includes("YOUR_KEY")) {
        // Mock payment for testing without valid Razorpay key
        console.log("Using mock payment for testing");
        setTimeout(() => {
          setLoading(false);
          if (onSuccess) {
            onSuccess({
              razorpay_payment_id: "pay_demo_" + Date.now(),
              razorpay_order_id: "order_demo_" + Date.now(),
              razorpay_signature: "demo_signature",
            });
          }
        }, 1500);
        return;
      }

      // Create order on backend first (in production)
      // For now, we'll proceed with frontend-only payment
      const options = {
        key: razorpayKey,
        amount: amount * 100, // Amount in paisa
        currency: currency,
        name: name,
        description: description,
        // order_id: orderId, // Commented out for test mode - will show warning but allows demo payments
        image: "https://your-logo-url.com/logo.png",
        handler: function (response) {
          // Payment successful
          setLoading(false);
          if (onSuccess) {
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
          }
        },
        prefill: {
          name: prefill.name || "",
          email: prefill.email || "",
          contact: prefill.contact || "",
        },
        notes: {
          address: prefill.address || "",
        },
        theme: {
          color: RED,
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            if (onFailure) {
              onFailure({ message: "Payment cancelled by user" });
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setLoading(false);
        const errorMessage = response.error.description || "Payment failed";
        setError(errorMessage);
        if (onFailure) {
          onFailure({
            code: response.error.code,
            description: response.error.description,
            source: response.error.source,
            step: response.error.step,
            reason: response.error.reason,
          });
        }
      });

      rzp.open();
    } catch (err) {
      setLoading(false);
      setError("Failed to initiate payment. Please try again.");
      console.error("Payment error:", err);
      if (onFailure) {
        onFailure({ message: "Failed to initiate payment" });
      }
    }
  };

  return (
    <div style={{ fontFamily: FONT }}>
      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            fontSize: "0.9rem",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaCircleXmark />
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={disabled || loading || !scriptLoaded}
        style={{
          width: "100%",
          padding: "16px 24px",
          borderRadius: "10px",
          background: disabled || loading ? SLATE : RED,
          color: WHITE,
          border: "none",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: disabled || loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          transition: "all 0.2s",
          opacity: disabled || loading ? 0.6 : 1,
        }}
      >
        {loading ? (
          <>
            <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
            Processing...
          </>
        ) : !scriptLoaded ? (
          <>
            <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
            Loading Payment...
          </>
        ) : (
          <>
            <FaCreditCard />
            Pay ₹{amount}
          </>
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default RazorpayPayment;