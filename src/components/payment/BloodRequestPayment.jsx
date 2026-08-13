import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import RazorpayPayment from "./RazorpayPayment";
import {
  FaTruck,
  FaIndianRupeeSign,
  FaCircleCheck,
  FaCircleInfo,
} from "react-icons/fa6";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const NAVY = "#0F172A";
const NAVY2 = "#1E293B";
const SLATE = "#64748B";
const SLATE_L = "#64748B";
const BORDER = "#E2E8F0";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";

function BloodRequestPayment({
  bloodRequest,
  onPaymentSuccess,
  onPaymentFailure,
  onCancel,
}) {
  const { user } = useUser();
  const [needHomeDelivery, setNeedHomeDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [processing, setProcessing] = useState(false);

  const deliveryCharge = 150; // Base delivery charge
  const totalAmount = needHomeDelivery
    ? deliveryCharge
    : 0;

  const handlePaymentSuccess = async (paymentDetails) => {
    setProcessing(true);
    try {
      // Debug: Log the blood request object
      console.log('Blood request object:', bloodRequest);
      console.log('Blood request _id:', bloodRequest._id);

      // Update blood request with payment and delivery details
      const updatedRequest = {
        ...bloodRequest,
        paymentStatus: "Paid",
        paymentId: paymentDetails.razorpay_payment_id,
        paymentAmount: totalAmount,
        homeDelivery: needHomeDelivery,
        deliveryAddress: needHomeDelivery ? deliveryAddress : "",
        // Don't change status - keep current status (e.g., "Blood Ready")
      };

      // Use MongoDB _id for backend compatibility
      const requestId = bloodRequest._id;
      if (!requestId) {
        throw new Error("Blood request _id is missing");
      }

      const response = await fetch(
        `https://hospital-resource-and-blood-bank.onrender.com/api/blood-requests/${requestId}/payment`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRequest),
        }
      );

      if (response.ok) {
        if (onPaymentSuccess) {
          onPaymentSuccess(updatedRequest);
        }
      } else {
        throw new Error("Failed to update blood request");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      if (onPaymentFailure) {
        onPaymentFailure({ message: "Failed to process payment" });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentFailure = (error) => {
    if (onPaymentFailure) {
      onPaymentFailure(error);
    }
  };

  return (
    <div style={{ fontFamily: FONT }}>
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: NAVY2, marginBottom: "12px" }}>
          Delivery Options
        </h3>
        
        <div
          onClick={() => setNeedHomeDelivery(false)}
          style={{
            padding: "20px",
            borderRadius: "12px",
            border: `2px solid ${!needHomeDelivery ? RED : BORDER}`,
            background: !needHomeDelivery ? `${RED}08` : WHITE,
            cursor: "pointer",
            marginBottom: "12px",
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: `2px solid ${!needHomeDelivery ? RED : SLATE}`,
                background: !needHomeDelivery ? RED : WHITE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!needHomeDelivery && <FaCircleCheck style={{ color: WHITE, fontSize: "0.8rem" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: NAVY2, marginBottom: "4px" }}>
                Self Pickup
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L }}>
                Visit the blood bank to collect your blood units
              </div>
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#16A34A" }}>
              Free
            </div>
          </div>
        </div>

        <div
          onClick={() => setNeedHomeDelivery(true)}
          style={{
            padding: "20px",
            borderRadius: "12px",
            border: `2px solid ${needHomeDelivery ? RED : BORDER}`,
            background: needHomeDelivery ? `${RED}08` : WHITE,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: `2px solid ${needHomeDelivery ? RED : SLATE}`,
                background: needHomeDelivery ? RED : WHITE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {needHomeDelivery && <FaCircleCheck style={{ color: WHITE, fontSize: "0.8rem" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: NAVY2, marginBottom: "4px" }}>
                Home Delivery
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L }}>
                Get blood delivered to your doorstep
              </div>
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: NAVY2 }}>
              ₹{deliveryCharge}
            </div>
          </div>
        </div>
      </div>

      {needHomeDelivery && (
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: NAVY2, marginBottom: "8px" }}>
            Delivery Address
          </label>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Enter your complete delivery address"
            rows={3}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: `1px solid ${BORDER}`,
              fontSize: "0.95rem",
              outline: "none",
              fontFamily: FONT,
              resize: "vertical",
            }}
          />
        </div>
      )}

      <div style={{ background: WHITE, borderRadius: "12px", padding: "20px", border: `1px solid ${BORDER}`, marginBottom: "24px" }}>
        <h4 style={{ fontSize: "1rem", fontWeight: 600, color: NAVY2, marginBottom: "16px" }}>
          Order Summary
        </h4>
        
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: SLATE }}>Blood Group</span>
            <span style={{ color: NAVY2, fontWeight: 500 }}>{bloodRequest.bloodGroup}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: SLATE }}>Units</span>
            <span style={{ color: NAVY2, fontWeight: 500 }}>{bloodRequest.units}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: SLATE }}>Hospital</span>
            <span style={{ color: NAVY2, fontWeight: 500 }}>{bloodRequest.hospital}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: SLATE }}>Urgency</span>
            <span style={{ color: NAVY2, fontWeight: 500 }}>{bloodRequest.urgency}</span>
          </div>
        </div>

        <div style={{ height: "1px", background: BORDER, margin: "16px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "1rem", fontWeight: 600, color: NAVY2 }}>Total Amount</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 700, color: RED }}>
            {totalAmount === 0 ? "Free" : `₹${totalAmount}`}
          </span>
        </div>

        {totalAmount > 0 && (
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: SLATE_L }}>
            <FaCircleInfo />
            Includes delivery charges
          </div>
        )}
      </div>

      {totalAmount > 0 ? (
        <RazorpayPayment
          amount={totalAmount}
          currency="INR"
          name="HemoCare"
          description={`Blood Delivery - ${bloodRequest.bloodGroup} (${bloodRequest.units} units)`}
          prefill={{
            name: user?.fullName || "",
            email: user?.emailAddresses?.[0]?.emailAddress || "",
            contact: "",
          }}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          disabled={processing || (needHomeDelivery && !deliveryAddress.trim())}
        />
      ) : (
        <button
          onClick={() => handlePaymentSuccess({ razorpay_payment_id: "free_delivery" })}
          disabled={processing}
          style={{
            width: "100%",
            padding: "16px 24px",
            borderRadius: "10px",
            background: processing ? SLATE : RED,
            color: WHITE,
            border: "none",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: processing ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "all 0.2s",
          }}
        >
          <FaCircleCheck />
          {processing ? "Processing..." : "Confirm Order"}
        </button>
      )}

      <button
        onClick={onCancel}
        disabled={processing}
        style={{
          width: "100%",
          padding: "12px 24px",
          borderRadius: "10px",
          background: WHITE,
          color: NAVY2,
          border: `1px solid ${BORDER}`,
          fontSize: "0.95rem",
          fontWeight: 500,
          cursor: processing ? "not-allowed" : "pointer",
          marginTop: "12px",
          transition: "all 0.2s",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

export default BloodRequestPayment;