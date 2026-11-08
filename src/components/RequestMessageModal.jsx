import React, { useState, useEffect, useRef } from "react";
import { FaXmark, FaPaperPlane, FaUserDoctor, FaHospital, FaUser, FaShieldHalved } from "react-icons/fa6";
import { useUser } from "@clerk/clerk-react";
import { apiFetch, API_BASE_URL } from "../utils/apiConfig";
import { io } from "socket.io-client";

const RED = "#C41230";
const NAVY = "#0F172A";
const SLATE = "#334155";
const BORDER = "#E2E8F0";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";

export default function RequestMessageModal({
  isOpen,
  onClose,
  requestId,
  requestNumber = "",
  bloodGroup = "",
  units = "",
  patientName = "",
  recipientRole = "",
  recipientUserId = "",
  recipientName = "",
}) {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const currentUserId = user?.id || localStorage.getItem("clerkId") || localStorage.getItem("userId") || "user_guest";
  const currentRole = (user?.unsafeMetadata?.role || localStorage.getItem("userRole") || "patient").toLowerCase().trim();
  const currentName = user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '') || localStorage.getItem("userFullName") || "User";
  const currentEmail = user?.primaryEmailAddress?.emailAddress || localStorage.getItem("userEmail") || "";

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isOpen || !requestId) return;

    let socket;
    try {
      socket = io(API_BASE_URL, { transports: ["websocket", "polling"] });
      socket.emit("join-conversation", requestId);

      socket.on("new-message", (incomingMsg) => {
        if (incomingMsg.requestId === requestId) {
          setMessages((prev) => {
            // Prevent duplicate message
            if (prev.some((m) => (m._id && m._id === incomingMsg._id) || (m.messageId && m.messageId === incomingMsg.messageId))) {
              return prev;
            }
            return [...prev, incomingMsg];
          });
          setTimeout(scrollToBottom, 100);
        }
      });
    } catch (e) {
      console.warn("Socket connection error in MessageModal:", e);
    }

    // Load initial conversation history
    const loadMessages = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/messages/request/${encodeURIComponent(requestId)}`);
        if (res && res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error("Error loading request messages:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    return () => {
      if (socket) {
        socket.emit("leave-conversation", requestId);
        socket.disconnect();
      }
    };
  }, [isOpen, requestId]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newText.trim() || sending) return;

    const messageText = newText.trim();
    setSending(true);

    // Resolve target recipient details if not explicitly passed
    let targetRole = recipientRole;
    let targetUserId = recipientUserId;
    let targetName = recipientName;

    if (!targetUserId) {
      if (currentRole === "patient") {
        targetRole = "hospital_staff";
        targetUserId = "hospital_staff_general";
        targetName = "Hospital Staff";
      } else if (currentRole === "hospital_staff" || currentRole === "hospital" || currentRole === "doctor") {
        targetRole = "blood_bank_staff";
        targetUserId = "blood_bank_staff_general";
        targetName = "Blood Bank Officer";
      } else if (currentRole === "blood_bank_staff" || currentRole === "blood_bank") {
        targetRole = "hospital_staff";
        targetUserId = "hospital_staff_general";
        targetName = "Hospital Staff";
      } else {
        targetRole = "hospital_staff";
        targetUserId = "hospital_staff_general";
        targetName = "Staff";
      }
    }

    try {
      const payload = {
        requestId,
        requestNumber: requestNumber || requestId,
        senderUserId: currentUserId,
        senderRole: currentRole,
        senderName: currentName,
        senderEmail: currentEmail,
        recipientUserId: targetUserId,
        recipientRole: targetRole,
        recipientName: targetName,
        message: messageText,
      };

      const res = await apiFetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res && res.ok) {
        const data = await res.json();
        const sent = data.data;
        setMessages((prev) => {
          if (prev.some((m) => m._id === sent._id)) return prev;
          return [...prev, sent];
        });
        setNewText("");
        setTimeout(scrollToBottom, 100);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Message send failed:", errData);
        alert(errData.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Network error: Could not deliver message to the server.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const getRoleIcon = (role) => {
    switch ((role || "").toLowerCase()) {
      case "hospital_staff":
      case "hospital":
      case "doctor":
        return <FaUserDoctor style={{ color: "#2563EB" }} />;
      case "blood_bank_staff":
      case "blood_bank":
        return <FaHospital style={{ color: RED }} />;
      case "administrator":
      case "admin":
        return <FaShieldHalved style={{ color: "#7C3AED" }} />;
      default:
        return <FaUser style={{ color: "#16A34A" }} />;
    }
  };

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
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          height: 600,
          maxHeight: "90vh",
          backgroundColor: WHITE,
          borderRadius: 16,
          boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: `1px solid ${BORDER}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            background: NAVY,
            color: WHITE,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #C41230",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: "1.05rem" }}>Request Discussion</span>
              <span
                style={{
                  background: "rgba(255,255,255,0.15)",
                  padding: "2px 8px",
                  borderRadius: 12,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                }}
              >
                {requestNumber || requestId}
              </span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#94A3B8", marginTop: 4 }}>
              {bloodGroup && <span style={{ color: "#F87171", fontWeight: 700, marginRight: 8 }}>{bloodGroup} ({units || 1} Units)</span>}
              {patientName && <span>Patient: {patientName}</span>}
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
              padding: 6,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaXmark />
          </button>
        </div>

        {/* Message Thread Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
            background: SMOKE,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B", fontSize: "0.9rem" }}>
              Loading conversation history...
            </div>
          ) : messages.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#64748B",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ fontSize: "1.8rem" }}>💬</div>
              <div style={{ fontWeight: 700, color: SLATE }}>No messages yet for this requisition</div>
              <div style={{ fontSize: "0.82rem", maxWidth: 360 }}>
                Start a thread between Patient, Hospital Staff, and Blood Bank Staff regarding allocation, status, or special instructions.
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.senderUserId === currentUserId;
              return (
                <div
                  key={msg._id || i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                      fontSize: "0.74rem",
                      color: "#64748B",
                    }}
                  >
                    {!isMine && getRoleIcon(msg.senderRole)}
                    <span style={{ fontWeight: 700, color: isMine ? RED : SLATE }}>
                      {isMine ? "You" : msg.senderName}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        padding: "1px 6px",
                        background: isMine ? "rgba(196,18,48,0.08)" : "#E2E8F0",
                        color: isMine ? RED : "#475569",
                        borderRadius: 8,
                        textTransform: "uppercase",
                      }}
                    >
                      {(msg.senderRole || "").replace("_", " ")}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "10px 14px",
                      borderRadius: 14,
                      borderTopRightRadius: isMine ? 2 : 14,
                      borderTopLeftRadius: !isMine ? 2 : 14,
                      background: isMine ? NAVY : WHITE,
                      color: isMine ? WHITE : SLATE,
                      fontSize: "0.88rem",
                      lineHeight: 1.45,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      border: isMine ? "none" : `1px solid ${BORDER}`,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Input Footer */}
        <form
          onSubmit={handleSend}
          style={{
            padding: "14px 18px",
            background: WHITE,
            borderTop: `1px solid ${BORDER}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <input
            type="text"
            placeholder="Type your message or clinical inquiry..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            disabled={sending}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              fontSize: "0.88rem",
              outline: "none",
              color: SLATE,
              background: SMOKE,
              transition: "border 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = RED)}
            onBlur={(e) => (e.target.style.borderColor = BORDER)}
          />
          <button
            type="submit"
            disabled={sending || !newText.trim()}
            style={{
              padding: "10px 18px",
              backgroundColor: sending || !newText.trim() ? "#94A3B8" : RED,
              color: WHITE,
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: sending || !newText.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "background-color 0.2s",
            }}
          >
            <span>Send</span>
            <FaPaperPlane style={{ fontSize: "0.78rem" }} />
          </button>
        </form>
      </div>
    </div>
  );
}

