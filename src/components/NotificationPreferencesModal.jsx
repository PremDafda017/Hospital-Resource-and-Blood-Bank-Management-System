import React, { useState, useEffect } from "react";
import { FaXmark, FaCheck, FaGear, FaEnvelope, FaBell, FaVolumeHigh, FaHeartPulse, FaCalendarCheck } from "react-icons/fa6";
import { useUser } from "@clerk/clerk-react";
import { apiFetch } from "../utils/apiConfig";

const RED = "#C41230";
const NAVY = "#0F172A";
const SLATE = "#334155";
const BORDER = "#E2E8F0";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";

export default function NotificationPreferencesModal({ isOpen, onClose }) {
  const { user } = useUser();
  const userId = user?.id || localStorage.getItem("clerkId") || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    bloodRequestAlerts: true,
    appointmentAlerts: true,
    messageAlerts: true,
    stockAlerts: true,
    soundAlerts: true,
  });

  useEffect(() => {
    if (!isOpen || !userId) return;

    const loadPrefs = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/notification-preferences/${encodeURIComponent(userId)}`);
        if (res && res.ok) {
          const data = await res.json();
          if (data && data.preferences) {
            setPrefs(data.preferences);
          }
        }
      } catch (err) {
        console.warn("Could not load notification preferences:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPrefs();
  }, [isOpen, userId]);

  const handleToggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/notification-preferences/${encodeURIComponent(userId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res && res.ok) {
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          onClose();
        }, 800);
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const toggleItems = [
    { key: "emailNotifications", label: "SMTP Email Delivery", desc: "Receive official notifications and updates on your registered email address.", icon: <FaEnvelope style={{ color: RED }} /> },
    { key: "inAppNotifications", label: "In-App Notification Center", desc: "Store notifications in your portal and show badge count on topbar bell.", icon: <FaBell style={{ color: "#2563EB" }} /> },
    { key: "bloodRequestAlerts", label: "Blood Requisition Updates", desc: "Alerts when blood requests are submitted, verified, ready, or rejected.", icon: <FaHeartPulse style={{ color: RED }} /> },
    { key: "appointmentAlerts", label: "Appointment & Intake Alerts", desc: "Alerts when appointments are scheduled, confirmed, or completed.", icon: <FaCalendarCheck style={{ color: "#16A34A" }} /> },
    { key: "messageAlerts", label: "Direct & Request Messages", desc: "Alerts when you receive messages from Hospital Staff, Blood Bank, or Patient.", icon: <FaBell style={{ color: "#7C3AED" }} /> },
    { key: "soundAlerts", label: "Harmonic Sound Chime", desc: "Play medical sound chime on incoming real-time notifications.", icon: <FaVolumeHigh style={{ color: "#D97706" }} /> },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          backgroundColor: WHITE,
          borderRadius: 16,
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
          border: `1px solid ${BORDER}`,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            background: NAVY,
            color: WHITE,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${RED}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FaGear style={{ fontSize: "1.1rem", color: "#F87171" }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>Notification Preferences</div>
              <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>Configure delivery channels & sound alerts</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            <FaXmark />
          </button>
        </div>

        {/* Preferences List */}
        <div style={{ padding: "20px 24px", maxHeight: "65vh", overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>
              Loading preferences...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {toggleItems.map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: SMOKE,
                    border: `1px solid ${BORDER}`,
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }}>
                    <div style={{ marginTop: 2, fontSize: "1rem" }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: SLATE }}>{item.label}</div>
                      <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 2, lineHeight: 1.35 }}>{item.desc}</div>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <label
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: 44,
                      height: 24,
                      flexShrink: 0,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!prefs[item.key]}
                      onChange={() => handleToggle(item.key)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: prefs[item.key] ? RED : "#CBD5E1",
                        transition: "0.2s",
                        borderRadius: 24,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: '""',
                          height: 18,
                          width: 18,
                          left: prefs[item.key] ? 23 : 3,
                          bottom: 3,
                          backgroundColor: WHITE,
                          transition: "0.2s",
                          borderRadius: "50%",
                        }}
                      />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            background: SMOKE,
            borderTop: `1px solid ${BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 18px",
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              color: SLATE,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "9px 22px",
              background: savedSuccess ? "#16A34A" : RED,
              color: WHITE,
              border: "none",
              borderRadius: 8,
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "background 0.2s",
            }}
          >
            {savedSuccess ? (
              <>
                <FaCheck />
                <span>Saved!</span>
              </>
            ) : (
              <span>{saving ? "Saving..." : "Save Preferences"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

