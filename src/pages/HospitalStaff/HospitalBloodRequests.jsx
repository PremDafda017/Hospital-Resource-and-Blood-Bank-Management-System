import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FaHeartPulse,
  FaFileMedical,
  FaCalendarDays,
  FaBell,
  FaDroplet,
  FaArrowRight,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaUsers,
  FaStethoscope,
  FaMagnifyingGlass,
  FaEye,
  FaCheck,
  FaXmark,
  FaRotateRight,
  FaCheckDouble,
  FaLock,
  FaVolumeHigh,
  FaCommentDots,
} from "react-icons/fa6";
import { apiFetch } from "../../utils/apiConfig";
import { useNotification } from "../../contexts/NotificationContext";
import NotificationBell from "../../components/NotificationBell";

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
const SIDEBAR_W = 260;
const SIDEBAR_COL = NAVY;

const BG_COLOR = {
  "A+": "#16A34A",
  "A-": "#15803D",
  "B+": "#2563EB",
  "B-": "#1D4ED8",
  "AB+": "#7C3AED",
  "AB-": "#6D28D9",
  "O+": RED,
  "O-": RED_DK,
};

// Web Audio synthesizer emergency siren fallback
function playSirenFallback() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(function (err) { console.warn(err); });
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    gain.gain.setValueAtTime(0.2, ctx.currentTime);

    let high = true;
    const interval = setInterval(function () {
      try {
        osc.frequency.setValueAtTime(high ? 880 : 660, ctx.currentTime);
        high = !high;
      } catch (err) {
        console.warn(err);
      }
    }, 350);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    return {
      stop: function () {
        clearInterval(interval);
        try {
          osc.stop();
          ctx.close().catch(function (err) { console.warn(err); });
        } catch (err) {
          console.warn(err);
        }
      },
    };
  } catch (e) {
    return null;
  }
}

function HospitalBloodRequests() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { openConversation } = useNotification();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterBloodGroup, setFilterBloodGroup] = useState("All");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [acknowledgedIds, setAcknowledgedIds] = useState(new Set());
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const sirenRef = useRef(null);

  const nav = [
    { key: "hospital-dashboard", icon: <FaChartLine />, label: "Dashboard", path: "/hospital-dashboard" },
    { key: "hospital-patients", icon: <FaUsers />, label: "Patients", path: "/hospital-patients" },
    { key: "hospital-doctors", icon: <FaStethoscope />, label: "Doctors", path: "/hospital-doctors" },
    { key: "hospital-appointments", icon: <FaCalendarDays />, label: "Appointments", path: "/hospital-appointments" },
    { key: "hospital-blood-requests", icon: <FaHeartPulse />, label: "Blood Requests", path: "/hospital-blood-requests" },
    { key: "hospital-blood-inventory", icon: <FaDroplet />, label: "Blood Inventory", path: "/hospital-blood-inventory" },
    { key: "hospital-reports", icon: <FaFileMedical />, label: "Reports", path: "/hospital-reports" },
    { key: "hospital-notifications", icon: <FaBell />, label: "Notifications", path: "/hospital-notifications" },
  ];

  const active = "hospital-blood-requests";
  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  const stopEmergencyAudio = useCallback(function () {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (err) {
        console.warn(err);
      }
      audioRef.current = null;
    }
    if (sirenRef.current) {
      try {
        sirenRef.current.stop();
      } catch (err) {
        console.warn(err);
      }
      sirenRef.current = null;
    }
    setIsAudioBlocked(false);
  }, []);

  const playEmergencyAudio = useCallback(function () {
    if (isMuted) return;
    if (audioRef.current && !audioRef.current.paused) return;

    try {
      const audio = new Audio("/CardiacArrest.mp3");
      audio.volume = 0.85;
      audio.loop = true;
      audioRef.current = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(function () {
            setIsAudioBlocked(false);
          })
          .catch(function (err) {
            console.warn("CardiacArrest.mp3 autoplay blocked by browser policy:", err);
            setIsAudioBlocked(true);

            function resumeHandler() {
              if (audioRef.current && !isMuted) {
                audioRef.current.play().then(function () {
                  setIsAudioBlocked(false);
                }).catch(function () {});
              }
              window.removeEventListener("click", resumeHandler);
              window.removeEventListener("keydown", resumeHandler);
            }
            window.addEventListener("click", resumeHandler, { once: true });
            window.addEventListener("keydown", resumeHandler, { once: true });
          });
      }
    } catch (err) {
      console.warn("Audio element error, using Web Audio siren fallback:", err);
      if (!sirenRef.current) {
        sirenRef.current = playSirenFallback();
      }
    }
  }, [isMuted]);

  const loadBloodRequests = useCallback(async function () {
    const endpoints = [
      "http://127.0.0.1:5000/api/blood-requests",
      "https://hospital-resource-and-blood-bank.onrender.com/api/blood-requests",
    ];

    for (let i = 0; i < endpoints.length; i++) {
      const url = endpoints[i];
      try {
        const response = await fetch(url, { headers: { Accept: "application/json" } });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setBloodRequests(data);
            setLastRefresh(new Date());
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        // Continue to fallback endpoint
      }
    }
    setLoading(false);
  }, []);

  // Initial load
  useEffect(function () {
    loadBloodRequests();
  }, [loadBloodRequests]);

  // Auto-refresh every 10 seconds with countdown
  useEffect(function () {
    let countdownId;

    if (autoRefresh) {
      countdownId = setInterval(function () {
        setCountdown(function (prev) {
          if (prev <= 1) {
            loadBloodRequests();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return function () {
      if (countdownId) clearInterval(countdownId);
    };
  }, [autoRefresh, loadBloodRequests]);

  // Active unhandled critical requests
  const unhandledCriticalRequests = (bloodRequests || []).filter(function (req) {
    if (!req) return false;
    const urgency = String(req.urgency || "").toLowerCase().trim();
    const status = String(req.status || "").toLowerCase().trim();
    const isCritical = urgency === "critical" || urgency === "emergency";
    const isHandled = ["completed", "rejected", "forwarded", "under verification", "blood ready"].indexOf(status) !== -1;
    return isCritical && !isHandled;
  });

  const hasCritical = unhandledCriticalRequests.length > 0;

  // New critical requests that haven't been acknowledged by user
  const unacknowledgedCritical = unhandledCriticalRequests.filter(function (req) {
    const id = String(req._id || req.id || req.requestNumber || "");
    return !acknowledgedIds.has(id);
  });

  // Play alarm sound and show modal whenever there are unacknowledged critical requests
  useEffect(function () {
    if (unacknowledgedCritical.length > 0 && !isMuted) {
      setShowEmergencyModal(true);
      playEmergencyAudio();
    } else if (!hasCritical) {
      stopEmergencyAudio();
      setShowEmergencyModal(false);
      setAcknowledgedIds(new Set());
    }
  }, [unacknowledgedCritical.length, hasCritical, isMuted, playEmergencyAudio, stopEmergencyAudio]);

  const handleAcknowledgeEmergency = function () {
    setShowEmergencyModal(false);
    stopEmergencyAudio();
    setAcknowledgedIds(function (prev) {
      const next = new Set(prev);
      unhandledCriticalRequests.forEach(function (req) {
        next.add(String(req._id || req.id || req.requestNumber || ""));
      });
      return next;
    });
  };

  const handleToggleSoundTest = function () {
    if (audioRef.current && !audioRef.current.paused) {
      stopEmergencyAudio();
    } else {
      setIsMuted(false);
      playEmergencyAudio();
    }
  };

  const filteredRequests = (bloodRequests || []).filter(function (req) {
    if (!req) return false;
    const q = String(searchQuery || "").toLowerCase();
    const pName = String(req.patientName || "").toLowerCase();
    const hosp = String(req.hospital || req.hospitalName || "").toLowerCase();
    const bGroup = String(req.bloodGroup || "").toLowerCase();

    const matchesSearch = !q || pName.indexOf(q) !== -1 || hosp.indexOf(q) !== -1 || bGroup.indexOf(q) !== -1;
    const matchesUrgency = filterUrgency === "All" || req.urgency === filterUrgency;
    const matchesStatus = filterStatus === "All" || req.status === filterStatus;
    const matchesGroup = filterBloodGroup === "All" || req.bloodGroup === filterBloodGroup;

    return matchesSearch && matchesUrgency && matchesStatus && matchesGroup;
  });

  const handleStatusUpdate = async function (requestId, newStatus, patientClerkId) {
    try {
      let endpoint = "";
      let body = {};

      switch (newStatus) {
        case "Under Verification":
          endpoint = `/api/blood-requests/${requestId}/status/under-verification`;
          body = {
            hospitalId: user?.id || "",
            hospitalName: "Hospital",
            verifiedBy: user?.id || "",
            verifiedByName: user?.fullName || "Hospital Staff",
          };
          break;
        case "Forwarded":
          endpoint = `/api/blood-requests/${requestId}/status/forwarded`;
          body = {
            bloodBankId: "",
            bloodBankName: "Blood Bank",
            forwardedBy: user?.id || "",
            forwardedByName: user?.fullName || "Hospital Staff",
          };
          break;
        case "Completed":
          endpoint = `/api/blood-requests/${requestId}/status/completed`;
          body = {
            issuedBy: user?.id || "",
            issuedByName: user?.fullName || "Hospital Staff",
          };
          break;
        case "Rejected":
          const promptReason = window.prompt("Enter rejection reason for patient:", "Incompatible requirements or insufficient stock") || "Request rejected by hospital staff";
          endpoint = `/api/blood-requests/${requestId}/status/rejected`;
          body = {
            rejectedBy: user?.id || "",
            rejectedByName: user?.fullName || "Hospital Staff",
            rejectionReason: promptReason,
          };
          break;
        default:
          console.error("Unknown status:", newStatus);
          return;
      }

      const response = await apiFetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await loadBloodRequests();
      }
    } catch (error) {
      console.error("Error updating blood request:", error);
    }
  };

  const handleManualRefresh = async function () {
    setLoading(true);
    await loadBloodRequests();
    setLoading(false);
  };

  const BloodBadge = ({ group }) => (
    <span
      style={{
        padding: "6px 14px",
        borderRadius: 8,
        background: `${BG_COLOR[group] || RED}15`,
        color: BG_COLOR[group] || RED,
        fontSize: "0.85rem",
        fontWeight: 600,
      }}
    >
      {group}
    </span>
  );

  const UrgencyBadge = ({ urgency }) => {
    const colors = {
      Critical: "#FEE2E2",
      High: "#FEF3C7",
      Medium: "#DBEAFE",
      Low: "#DCFCE7",
    };
    const textColors = {
      Critical: "#DC2626",
      High: "#D97706",
      Medium: "#2563EB",
      Low: "#16A34A",
    };
    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: 12,
          fontSize: "0.75rem",
          fontWeight: 600,
          background: colors[urgency] || "#F3F4F6",
          color: textColors[urgency] || "#6B7280",
        }}
      >
        {urgency}
      </span>
    );
  };

  const StatusPill = ({ status }) => {
    const colors = {
      Pending: "#FEF3C7",
      "Under Verification": "#E0E7FF",
      Forwarded: "#DBEAFE",
      "Blood Ready": "#DCFCE7",
      Rejected: "#FEE2E2",
      Completed: "#E0E7FF",
    };
    const textColors = {
      Pending: "#D97706",
      "Under Verification": "#4F46E5",
      Forwarded: "#2563EB",
      "Blood Ready": "#16A34A",
      Rejected: "#DC2626",
      Completed: "#4F46E5",
    };
    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: 12,
          fontSize: "0.75rem",
          fontWeight: 600,
          background: colors[status] || "#F3F4F6",
          color: textColors[status] || "#6B7280",
        }}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: SMOKE,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid #E2E8F0",
              borderTopColor: RED,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading blood requests...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT, background: SMOKE, minHeight: "100vh", display: "flex" }}>
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes criticalBlink {
          0%, 100% { background-color: rgba(220, 38, 38, 0.15); }
          50% { background-color: rgba(37, 99, 235, 0.15); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
        }
      `}</style>

      {/* Sidebar */}
      <aside
        style={{
          width: w,
          minHeight: "100vh",
          background: SIDEBAR_COL,
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease",
        }}
      >
        <div
          style={{
            height: 64,
            borderBottom: `1px solid rgba(255,255,255,0.1)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: sidebarCollapsed ? "0 16px" : "0 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: WHITE,
              fontWeight: 700,
              fontSize: "1.1rem",
            }}
          >
            <FaDroplet style={{ color: RED, fontSize: "1.4rem" }} />
            {!sidebarCollapsed && <span>Hospital Staff</span>}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: "none",
              border: "none",
              color: WHITE,
              cursor: "pointer",
              padding: 4,
              borderRadius: 4,
            }}
          >
            <FaBars />
          </button>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {nav.map(function (item) {
            return (
              <button
                key={item.key}
                onClick={function () { navigate(item.path); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: active === item.key ? RED : "transparent",
                  color: WHITE,
                  cursor: "pointer",
                  marginBottom: 4,
                  transition: "all 0.2s",
                  fontSize: "0.9rem",
                }}
                onMouseEnter={function (e) {
                  if (active !== item.key) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={function (e) {
                  if (active !== item.key) e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "1.1rem", minWidth: 20 }}>{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          <SignOutButton>
            <button
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                color: WHITE,
                cursor: "pointer",
                transition: "all 0.2s",
                fontSize: "0.9rem",
              }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: "1.1rem", minWidth: 20 }}><FaRightFromBracket /></span>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: w, flex: 1, minHeight: "100vh" }}>
        <div style={{ padding: "24px 32px" }}>
          <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: NAVY2, margin: "0 0 8px 0" }}>
                Hospital Blood Requests
              </h1>
              <p style={{ color: SLATE_L, fontSize: "1rem", margin: 0 }}>
                Manage all blood requests from patients
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <NotificationBell />
              <button
                onClick={handleToggleSoundTest}
                title="Test or toggle emergency alarm sound"
                style={{
                  background: isMuted ? "#FEF2F2" : (audioRef.current && !audioRef.current.paused ? "#FEE2E2" : WHITE),
                  border: `1px solid ${audioRef.current && !audioRef.current.paused ? RED : BORDER}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: audioRef.current && !audioRef.current.paused ? RED : NAVY2,
                  transition: "all 0.2s",
                }}
              >
                <FaVolumeHigh style={{ color: audioRef.current && !audioRef.current.paused ? RED : NAVY2 }} />
                <span>{audioRef.current && !audioRef.current.paused ? "Siren Playing (Stop)" : "Test Emergency Siren"}</span>
              </button>

              <button
                onClick={handleManualRefresh}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  color: NAVY2,
                  transition: "all 0.2s",
                }}
                onMouseEnter={function (e) { e.currentTarget.style.background = SMOKE; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = WHITE; }}
              >
                <FaRotateRight /> Refresh
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                }}
              >
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={function (e) { setAutoRefresh(e.target.checked); }}
                  style={{ cursor: "pointer" }}
                />
                <label htmlFor="autoRefresh" style={{ fontSize: "0.9rem", color: NAVY2, cursor: "pointer" }}>
                  Auto-refresh ({countdown}s)
                </label>
              </div>

              {lastRefresh && (
                <span style={{ fontSize: "0.8rem", color: SLATE_L }}>
                  Last: {lastRefresh.toLocaleTimeString()}
                </span>
              )}

              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FaMagnifyingGlass style={{ color: SLATE_L }} />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={function (e) { setSearchQuery(e.target.value); }}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "0.9rem",
                    width: 180,
                  }}
                />
              </div>

              <select
                value={filterUrgency}
                onChange={function (e) { setFilterUrgency(e.target.value); }}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: "0.9rem",
                  color: NAVY2,
                  cursor: "pointer",
                }}
              >
                <option value="All">All Urgency</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              <select
                value={filterStatus}
                onChange={function (e) { setFilterStatus(e.target.value); }}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: "0.9rem",
                  color: NAVY2,
                  cursor: "pointer",
                }}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Forwarded">Forwarded</option>
                <option value="Blood Ready">Blood Ready</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={filterBloodGroup}
                onChange={function (e) { setFilterBloodGroup(e.target.value); }}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: "0.9rem",
                  color: NAVY2,
                  cursor: "pointer",
                }}
              >
                <option value="All">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Active Emergency Alert Banner */}
          {hasCritical && (
            <div
              style={{
                background: "linear-gradient(90deg, #FEF2F2 0%, #FFF1F2 100%)",
                border: `2px solid ${RED}`,
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                boxShadow: "0 4px 16px rgba(196, 18, 48, 0.12)",
                animation: "pulseGlow 2s infinite",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${RED}18`,
                    color: RED,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    flexShrink: 0,
                  }}
                >
                  <FaHeartPulse />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: RED }}>
                    CODE BLUE ALERT: {unhandledCriticalRequests.length} Active Critical Blood Requisition(s)
                  </div>
                  <div style={{ fontSize: "0.85rem", color: SLATE, marginTop: 2 }}>
                    Immediate triage required. Verify blood availability or forward to regional blood banks.
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {isAudioBlocked && (
                  <button
                    onClick={playEmergencyAudio}
                    style={{
                      background: RED,
                      color: WHITE,
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FaVolumeHigh /> Play Alarm Audio
                  </button>
                )}
                <button
                  onClick={handleAcknowledgeEmergency}
                  style={{
                    background: WHITE,
                    color: RED,
                    border: `1.5px solid ${RED}`,
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Acknowledge & Silence Siren
                </button>
              </div>
            </div>
          )}

          {/* Blood Requests Table */}
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            <div
              style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${BORDER}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, margin: 0 }}>
                All Blood Requests ({filteredRequests.length})
              </h2>
            </div>
            {filteredRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: SLATE_L }}>
                <FaHeartPulse style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.3 }} />
                <p style={{ fontSize: "1rem", marginBottom: 16 }}>No blood requests found</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: SMOKE, borderBottom: `1px solid ${BORDER}` }}>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Request ID</th>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Patient</th>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Blood Group</th>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Units</th>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Hospital</th>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</th>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Urgency</th>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment</th>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, color: SLATE_L, textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(function (req) {
                      const isCritical = String(req.urgency || "").toLowerCase() === "critical";
                      const isHandled = ["completed", "rejected"].indexOf(String(req.status || "").toLowerCase()) !== -1;
                      const doBlink = isCritical && !isHandled;

                      return (
                        <tr
                          key={req._id || req.id}
                          style={{
                            borderBottom: `1px solid ${BORDER}`,
                            transition: "background 0.2s",
                            animation: doBlink ? "criticalBlink 1s infinite" : "none",
                          }}
                          onMouseEnter={function (e) { e.currentTarget.style.background = SMOKE; }}
                          onMouseLeave={function (e) { e.currentTarget.style.background = WHITE; }}
                        >
                          <td style={{ padding: "16px 24px", fontSize: "0.9rem", color: NAVY2, fontWeight: 600 }}>
                            #{req.requestNumber || req.id}
                          </td>
                          <td style={{ padding: "16px 24px", fontSize: "0.9rem", color: NAVY2 }}>
                            {req.patientName}
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <BloodBadge group={req.bloodGroup} />
                          </td>
                          <td style={{ padding: "16px 24px", fontSize: "0.9rem", color: NAVY2 }}>
                            {req.units}
                          </td>
                          <td style={{ padding: "16px 24px", fontSize: "0.9rem", color: SLATE_L }}>
                            {req.hospitalName || req.hospital}
                          </td>
                          <td style={{ padding: "16px 24px", fontSize: "0.9rem", color: SLATE_L }}>
                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "-"}
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <UrgencyBadge urgency={req.urgency} />
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <StatusPill status={req.status} />
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            {req.paymentStatus === "Paid" ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#16A34A", fontWeight: 600 }}>
                                <FaCheckDouble /> Paid
                              </div>
                            ) : (
                              <span style={{ color: SLATE_L, fontSize: "0.85rem" }}>Unpaid</span>
                            )}
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                              <button
                                onClick={function () {
                                  openConversation({
                                    requestId: req._id,
                                    requestNumber: req.requestNumber || req._id,
                                    bloodGroup: req.bloodGroup,
                                    units: req.units,
                                    patientName: req.patientName,
                                    recipientRole: "blood_bank_staff",
                                    recipientUserId: "blood_bank_staff_general",
                                    recipientName: "Blood Bank Officer",
                                  });
                                }}
                                style={{
                                  background: "#EFF6FF",
                                  border: "1px solid #BFDBFE",
                                  padding: "6px 12px",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                  fontSize: "0.82rem",
                                  color: "#2563EB",
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                                title="Chat with Blood Bank or Patient regarding this requisition"
                              >
                                <FaCommentDots /> Discuss
                              </button>
                              {req.status === "Pending" && (
                                <>
                                  <button
                                    onClick={function () { handleStatusUpdate(req._id, "Under Verification", req.patientClerkId); }}
                                    style={{
                                      background: WHITE,
                                      border: `1px solid ${BORDER}`,
                                      padding: "6px 12px",
                                      borderRadius: 6,
                                      cursor: "pointer",
                                      fontSize: "0.85rem",
                                      color: "#4F46E5",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                    onMouseEnter={function (e) { e.currentTarget.style.background = SMOKE; }}
                                    onMouseLeave={function (e) { e.currentTarget.style.background = WHITE; }}
                                  >
                                    <FaEye /> Start Verification
                                  </button>
                                  <button
                                    onClick={function () { handleStatusUpdate(req._id, "Rejected", req.patientClerkId); }}
                                    style={{
                                      background: WHITE,
                                      border: `1px solid ${BORDER}`,
                                      padding: "6px 12px",
                                      borderRadius: 6,
                                      cursor: "pointer",
                                      fontSize: "0.85rem",
                                      color: "#DC2626",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                    onMouseEnter={function (e) { e.currentTarget.style.background = SMOKE; }}
                                    onMouseLeave={function (e) { e.currentTarget.style.background = WHITE; }}
                                  >
                                    <FaXmark /> Reject
                                  </button>
                                </>
                              )}
                              {req.status === "Under Verification" && (
                                <>
                                  <button
                                    onClick={function () { handleStatusUpdate(req._id, "Forwarded", req.patientClerkId); }}
                                    style={{
                                      background: WHITE,
                                      border: `1px solid ${BORDER}`,
                                      padding: "6px 12px",
                                      borderRadius: 6,
                                      cursor: "pointer",
                                      fontSize: "0.85rem",
                                      color: "#2563EB",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                    onMouseEnter={function (e) { e.currentTarget.style.background = SMOKE; }}
                                    onMouseLeave={function (e) { e.currentTarget.style.background = WHITE; }}
                                  >
                                    <FaArrowRight /> Forward to Blood Bank
                                  </button>
                                  <button
                                    onClick={function () { handleStatusUpdate(req._id, "Rejected", req.patientClerkId); }}
                                    style={{
                                      background: WHITE,
                                      border: `1px solid ${BORDER}`,
                                      padding: "6px 12px",
                                      borderRadius: 6,
                                      cursor: "pointer",
                                      fontSize: "0.85rem",
                                      color: "#DC2626",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                    onMouseEnter={function (e) { e.currentTarget.style.background = SMOKE; }}
                                    onMouseLeave={function (e) { e.currentTarget.style.background = WHITE; }}
                                  >
                                    <FaXmark /> Reject
                                  </button>
                                </>
                              )}
                              {req.status === "Blood Ready" && (
                                <>
                                  {req.paymentStatus === "Paid" ? (
                                    <button
                                      onClick={function () { handleStatusUpdate(req._id, "Completed", req.patientClerkId); }}
                                      style={{
                                        background: WHITE,
                                        border: `1px solid ${BORDER}`,
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        cursor: "pointer",
                                        fontSize: "0.85rem",
                                        color: "#4F46E5",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                      }}
                                      onMouseEnter={function (e) { e.currentTarget.style.background = SMOKE; }}
                                      onMouseLeave={function (e) { e.currentTarget.style.background = WHITE; }}
                                    >
                                      <FaCheck /> Issue Blood / Complete
                                    </button>
                                  ) : (
                                    <button
                                      disabled
                                      style={{
                                        background: SMOKE,
                                        border: `1px solid ${BORDER}`,
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        cursor: "not-allowed",
                                        fontSize: "0.85rem",
                                        color: SLATE_L,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                      }}
                                      title="Patient must complete payment first"
                                    >
                                      <FaLock /> Payment Required
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div
          onClick={handleAcknowledgeEmergency}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <div
            onClick={function (e) { e.stopPropagation(); }}
            style={{
              background: WHITE,
              padding: "36px",
              borderRadius: "16px",
              maxWidth: "440px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(196, 18, 48, 0.35)",
              border: `2px solid ${RED}`,
              animation: "pulseGlow 1.5s infinite",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(220, 38, 38, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                color: RED,
                fontSize: "36px",
              }}
            >
              <FaHeartPulse />
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: RED,
                margin: "0 0 10px",
                letterSpacing: "0.04em",
              }}
            >
              CODE BLUE: EMERGENCY!
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: NAVY2,
                fontWeight: 600,
                margin: "0 0 8px",
                lineHeight: "1.5",
              }}
            >
              {unhandledCriticalRequests.length} critical blood requisition(s) pending triage!
            </p>
            <p
              style={{
                fontSize: "13px",
                color: SLATE_L,
                margin: "0 0 24px",
                lineHeight: "1.5",
              }}
            >
              Cardiac Arrest emergency alarm is sounding. Please verify blood stock or dispatch immediately.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={handleAcknowledgeEmergency}
                style={{
                  background: `linear-gradient(135deg, ${RED}, ${RED_DK})`,
                  color: WHITE,
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(196, 18, 48, 0.4)",
                }}
              >
                Acknowledge & Silence Siren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalBloodRequests;
