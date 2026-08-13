import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  FaBullhorn,
  FaCalendar,
  FaLocationDot,
  FaUsers,
  FaDroplet,
  FaCircleCheck,
  FaXmark,
  FaClock,
  FaTriangleExclamation,
  FaCircleInfo,
  FaHeart,
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

const DonationCampaigns = () => {
  const { user } = useUser();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [participatingCampaigns, setParticipatingCampaigns] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load campaigns
      const campaignsResponse = await fetch("http://localhost:5000/api/campaigns");
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setCampaigns(campaignsData);
      }

      // Load emergency requests
      const emergencyResponse = await fetch("http://localhost:5000/api/emergency-requests");
      if (emergencyResponse.ok) {
        const emergencyData = await emergencyResponse.json();
        setEmergencyRequests(emergencyData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  const handleParticipate = async (campaignId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/donor/${user.id}/campaigns/${campaignId}/participate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          donorName: user?.fullName || user?.firstName,
          donorEmail: user?.emailAddresses?.[0]?.emailAddress,
        }),
      });

      if (response.ok) {
        showNotification({ type: "success", title: "Success", message: "Campaign participation request submitted! Blood Bank Staff will review your request." });
        setParticipatingCampaigns([...participatingCampaigns, campaignId]);
      } else {
        const error = await response.json();
        showNotification({ type: "error", title: "Error", message: error.message || "Failed to register for campaign" });
      }
    } catch (error) {
      console.error("Error participating in campaign:", error);
      showNotification({ type: "error", title: "Error", message: "Failed to register for campaign" });
    }
  };

  const handleEmergencyResponse = async (requestId, accepted) => {
    try {
      const response = await fetch(`http://localhost:5000/api/emergency-requests/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorId: user.id,
          donorName: user?.fullName || user?.firstName,
          accepted,
        }),
      });

      if (response.ok) {
        showNotification({ type: "success", title: "Success", message: accepted ? "Thank you for accepting! We'll contact you soon." : "Response recorded." });
        setEmergencyRequests(emergencyRequests.filter(r => r._id !== requestId));
      } else {
        showNotification({ type: "error", title: "Error", message: "Failed to record response" });
      }
    } catch (error) {
      console.error("Error responding to emergency:", error);
      showNotification({ type: "error", title: "Error", message: "Failed to record response" });
    }
  };

  const UrgencyBadge = ({ urgency }) => {
    const styles = {
      Critical: { bg: RED, color: WHITE, icon: <FaTriangleExclamation /> },
      Urgent: { bg: YELLOW, color: NAVY2, icon: <FaClock /> },
      Normal: { bg: GREEN, color: WHITE, icon: <FaClock /> },
    };
    const style = styles[urgency] || styles.Normal;

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 20,
        background: style.bg,
        color: style.color,
        fontSize: "0.85rem",
        fontWeight: 600,
      }}>
        <FaXmark />
        {urgency}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: SMOKE,
        fontFamily: FONT,
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading campaigns...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: SMOKE, fontFamily: FONT, padding: "24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: NAVY2, marginBottom: 8 }}>
            <FaBullhorn style={{ marginRight: 12, color: RED }} />
            Donation Campaigns & Requests
          </h1>
          <p style={{ fontSize: "1rem", color: SLATE_L }}>
            Join blood donation campaigns and respond to emergency requests
          </p>
        </motion.div>

        {/* Emergency Requests Section */}
        {emergencyRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 40 }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <FaTriangleExclamation style={{ color: RED }} />
              Emergency Blood Requests
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 20 }}>
              {emergencyRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    background: WHITE,
                    borderRadius: 16,
                    border: "2px solid #DC2626",
                    padding: "24px",
                    boxShadow: "0 4px 20px rgba(220, 38, 38, 0.1)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <UrgencyBadge urgency={request.urgency} />
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      background: `${RED}15`,
                      color: RED,
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}>
                      {request.bloodGroup}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: NAVY2, marginBottom: 12 }}>
                    {request.hospitalName}
                  </h3>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: SLATE_L, fontSize: "0.9rem", marginBottom: 8 }}>
                    <FaLocationDot />
                    {request.location}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: SLATE_L, fontSize: "0.9rem", marginBottom: 16 }}>
                    <FaUsers />
                    {request.unitsNeeded} units needed
                  </div>

                  <p style={{ color: SLATE, fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 20 }}>
                    {request.description}
                  </p>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={() => handleEmergencyResponse(request._id, true)}
                      style={{
                        flex: 1,
                        padding: "12px 20px",
                        background: GREEN,
                        color: WHITE,
                        border: "none",
                        borderRadius: 8,
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <FaCircleCheck />
                      Accept
                    </button>
                    <button
                      onClick={() => handleEmergencyResponse(request._id, false)}
                      style={{
                        flex: 1,
                        padding: "12px 20px",
                        background: "#FEE2E2",
                        color: "#DC2626",
                        border: "none",
                        borderRadius: 8,
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <FaXmark />
                      Decline
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Active Campaigns Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <FaBullhorn style={{ color: BLUE }} />
            Active Campaigns
          </h2>

          {campaigns.length === 0 ? (
            <div style={{
              background: WHITE,
              borderRadius: 16,
              border: `1px solid ${BORDER}`,
              padding: "60px 20px",
              textAlign: "center",
              color: SLATE_L,
            }}>
              <FaBullhorn style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.3 }} />
              <p style={{ fontSize: "1rem" }}>No active campaigns at the moment</p>
              <p style={{ fontSize: "0.9rem", marginTop: 8 }}>Check back later for upcoming blood donation drives</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
              {campaigns.map((campaign, index) => (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    background: WHITE,
                    borderRadius: 16,
                    border: `1px solid ${BORDER}`,
                    overflow: "hidden",
                    transition: "all 0.3s",
                  }}
                  whileHover={{ transform: "translateY(-4px)", boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
                >
                  {/* Campaign Image/Header */}
                  <div style={{
                    height: 160,
                    background: `linear-gradient(135deg, ${RED} 0%, ${BLUE} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: WHITE,
                    padding: 24,
                    position: "relative",
                  }}>
                    <div style={{ textAlign: "center" }}>
                      <FaDroplet style={{ fontSize: "3rem", marginBottom: 12 }} />
                      <h3 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
                        {campaign.title}
                      </h3>
                    </div>
                    {campaign.bookedSlots >= campaign.availableSlots && (
                      <div style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        padding: "6px 12px",
                        background: "rgba(0,0,0,0.5)",
                        borderRadius: 20,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}>
                        Fully Booked
                      </div>
                    )}
                  </div>

                  {/* Campaign Details */}
                  <div style={{ padding: 24 }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: SLATE_L, fontSize: "0.9rem", marginBottom: 8 }}>
                        <FaCalendar />
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: SLATE_L, fontSize: "0.9rem" }}>
                        <FaLocationDot />
                        {campaign.location}
                      </div>
                    </div>

                    <p style={{ color: SLATE, fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 20 }}>
                      {campaign.description}
                    </p>

                    {/* Slots Progress */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>
                          Registration Progress
                        </span>
                        <span style={{ fontSize: "0.85rem", color: NAVY2, fontWeight: 600 }}>
                          {campaign.bookedSlots}/{campaign.availableSlots}
                        </span>
                      </div>
                      <div style={{
                        height: 8,
                        background: SMOKE,
                        borderRadius: 4,
                        overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%",
                          width: `${(campaign.bookedSlots / campaign.availableSlots) * 100}%`,
                          background: campaign.bookedSlots >= campaign.availableSlots ? RED : GREEN,
                          borderRadius: 4,
                          transition: "width 0.3s",
                        }} />
                      </div>
                    </div>

                    {/* Participate Button */}
                    {participatingCampaigns.includes(campaign._id) ? (
                      <button
                        disabled
                        style={{
                          width: "100%",
                          padding: "14px 20px",
                          background: YELLOW,
                          color: WHITE,
                          border: "none",
                          borderRadius: 8,
                          fontSize: "1rem",
                          fontWeight: 600,
                          cursor: "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <FaClock />
                        Waiting for Approval
                      </button>
                    ) : campaign.bookedSlots >= campaign.availableSlots ? (
                      <button
                        disabled
                        style={{
                          width: "100%",
                          padding: "14px 20px",
                          background: SLATE,
                          color: WHITE,
                          border: "none",
                          borderRadius: 8,
                          fontSize: "1rem",
                          fontWeight: 600,
                          cursor: "not-allowed",
                        }}
                      >
                        Fully Booked
                      </button>
                    ) : (
                      <button
                        onClick={() => handleParticipate(campaign._id)}
                        style={{
                          width: "100%",
                          padding: "14px 20px",
                          background: RED,
                          color: WHITE,
                          border: "none",
                          borderRadius: 8,
                          fontSize: "1rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = "#B91C1C"}
                        onMouseOut={(e) => e.currentTarget.style.background = RED}
                      >
                        <FaHeart />
                        Register Now
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 40,
            padding: "24px",
            background: `${BLUE}10`,
            borderRadius: 12,
            border: `1px solid ${BLUE}30`,
          }}
        >
          <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <FaCircleInfo style={{ color: BLUE }} />
            About Blood Donation Campaigns
          </h4>
          <ul style={{ color: SLATE, fontSize: "0.95rem", lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Campaigns are organized blood donation drives at specific locations</li>
            <li>Register early to secure your slot as slots are limited</li>
            <li>Emergency requests require immediate response and are prioritized</li>
            <li>You'll receive confirmation details after registration</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default DonationCampaigns;
