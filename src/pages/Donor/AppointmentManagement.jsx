import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  FaCalendar,
  FaClock,
  FaLocationDot,
  FaCircleCheck,
  FaCircleInfo,
  FaStethoscope,
  FaPlus,
  FaXmark,
  FaEye,
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

const AppointmentManagement = () => {
  const { user } = useUser();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const [approvedAppointments, setApprovedAppointments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    preferredDate: "",
    preferredTime: "",
    bloodBankName: "",
    location: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointment requests from MongoDB using donor-specific endpoint
      const requestsResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/${user.id}/appointment-requests`);
      if (requestsResponse.ok) {
        const donorRequests = await requestsResponse.json();
        setAppointmentRequests(donorRequests);
      } else {
        showNotification({ type: "error", title: "Error", message: "Failed to load appointment requests" });
      }

      // Fetch approved appointments from MongoDB
      const appointmentsResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/${user.id}/appointments`);
      if (appointmentsResponse.ok) {
        const appointments = await appointmentsResponse.json();
        setApprovedAppointments(appointments);
      } else {
        showNotification({ type: "error", title: "Error", message: "Failed to load appointments" });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showNotification({ type: "error", title: "Error", message: "Error loading data. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!formData.preferredDate || !formData.preferredTime || !formData.bloodBankName || !formData.location) {
      showNotification({ type: "error", title: "Error", message: "Please fill in all required fields" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/${user.id}/appointment-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "Appointment",
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          bloodBankName: formData.bloodBankName,
          location: formData.location,
          notes: formData.notes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification({ type: "success", title: "Success", message: "Appointment request submitted successfully!" });
        setShowCreateModal(false);
        setFormData({
          preferredDate: "",
          preferredTime: "",
          bloodBankName: "",
          location: "",
          notes: ""
        });
        // Reload data to get the new request from database
        await loadData();
      } else {
        showNotification({ type: "error", title: "Error", message: data.message || "Failed to submit appointment request" });
      }
    } catch (error) {
      console.error("Error creating request:", error);
      showNotification({ type: "error", title: "Error", message: "Failed to submit appointment request. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;

    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/bloodbank/appointment-requests/${requestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: "Cancelled by donor" }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification({ type: "success", title: "Success", message: "Appointment request cancelled successfully!" });
        // Reload data to get updated status from database
        await loadData();
      } else {
        showNotification({ type: "error", title: "Error", message: data.message || "Failed to cancel request" });
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      showNotification({ type: "error", title: "Error", message: "Failed to cancel request. Please try again." });
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      Pending: { bg: `${YELLOW}15`, color: YELLOW, icon: <FaClock /> },
      Approved: { bg: `${GREEN}15`, color: GREEN, icon: <FaCircleCheck /> },
      Rejected: { bg: `${RED}15`, color: RED, icon: <FaCircleInfo /> },
      Completed: { bg: `${BLUE}15`, color: BLUE, icon: <FaCircleCheck /> },
    };
    const style = styles[status] || styles.Pending;

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
        {style.icon}
        {status}
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading appointments...</p>
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
          style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: NAVY2, marginBottom: 8 }}>
              <FaCalendar style={{ marginRight: 12, color: RED }} />
              My Appointments
            </h1>
            <p style={{ fontSize: "1rem", color: SLATE_L }}>
              Manage your blood donation appointment requests and bookings
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            style={{
              background: RED,
              color: WHITE,
              border: "none",
              borderRadius: 10,
              padding: "12px 24px",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FaPlus />
            New Request
          </motion.button>
        </motion.div>

        {/* Appointment Requests Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: NAVY2, marginBottom: 16 }}>
            Appointment Requests
          </h2>
          {appointmentRequests.length === 0 ? (
            <div style={{
              background: WHITE,
              borderRadius: 16,
              border: `1px solid ${BORDER}`,
              padding: "40px 20px",
              textAlign: "center",
              color: SLATE_L,
            }}>
              <FaCalendar style={{ fontSize: "2.5rem", marginBottom: 12, opacity: 0.3 }} />
              <p>No appointment requests yet</p>
              <p style={{ fontSize: "0.9rem", marginTop: 8 }}>Create your first appointment request to donate blood</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {appointmentRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    background: WHITE,
                    borderRadius: 12,
                    border: `1px solid ${BORDER}`,
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    transition: "all 0.2s",
                  }}
                  whileHover={{ transform: "translateX(4px)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                >
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: 12,
                    background: `${RED}15`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: RED,
                    flexShrink: 0,
                  }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                      {new Date(request.requestedDate).getDate()}
                    </div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}>
                      {new Date(request.requestedDate).toLocaleDateString("en-US", { month: "short" })}
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, margin: 0 }}>
                        {request.bloodBankName || "Blood Bank"}
                      </h3>
                      <StatusBadge status={request.status} />
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 20, color: SLATE_L, fontSize: "0.9rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FaClock />
                        {request.preferredTime || "Not specified"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FaLocationDot />
                        {request.location || "Not specified"}
                      </div>
                    </div>

                    {request.rejectionReason && (
                      <div style={{ marginTop: 8, padding: "8px 12px", background: `${RED}10`, borderRadius: 6, fontSize: "0.85rem", color: RED }}>
                        <FaCircleInfo style={{ marginRight: 4 }} />
                        {request.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => { setSelectedItem(request); setShowViewModal(true); }}
                      style={{
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        padding: "8px 16px",
                        borderRadius: 8,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <FaEye /> View
                    </button>
                    {request.status === "Pending" && (
                      <button
                        onClick={() => handleCancelRequest(request._id)}
                        style={{
                          background: WHITE,
                          border: `1px solid ${RED}`,
                          color: RED,
                          padding: "8px 16px",
                          borderRadius: 8,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <FaXmark /> Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Approved Appointments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: NAVY2, marginBottom: 16 }}>
            Confirmed Appointments
          </h2>
          {approvedAppointments.length === 0 ? (
            <div style={{
              background: WHITE,
              borderRadius: 16,
              border: `1px solid ${BORDER}`,
              padding: "40px 20px",
              textAlign: "center",
              color: SLATE_L,
            }}>
              <FaCalendar style={{ fontSize: "2.5rem", marginBottom: 12, opacity: 0.3 }} />
              <p>No confirmed appointments yet</p>
              <p style={{ fontSize: "0.9rem", marginTop: 8 }}>Your approved requests will appear here</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {approvedAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  style={{
                    background: WHITE,
                    borderRadius: 12,
                    border: `1px solid ${GREEN}30`,
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    transition: "all 0.2s",
                  }}
                  whileHover={{ transform: "translateX(4px)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                >
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: 12,
                    background: `${GREEN}15`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: GREEN,
                    flexShrink: 0,
                  }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                      {new Date(appointment.date).getDate()}
                    </div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}>
                      {new Date(appointment.date).toLocaleDateString("en-US", { month: "short" })}
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, margin: 0 }}>
                        {appointment.bloodBankName}
                      </h3>
                      <StatusBadge status={appointment.status} />
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 20, color: SLATE_L, fontSize: "0.9rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FaClock />
                        {appointment.time}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FaLocationDot />
                        {appointment.location}
                      </div>
                    </div>

                    {appointment.doctor && (
                      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, color: SLATE_L, fontSize: "0.9rem" }}>
                        <FaStethoscope />
                        Dr. {appointment.doctor}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => { setSelectedItem(appointment); setShowViewModal(true); }}
                    style={{
                      background: WHITE,
                      border: `1px solid ${BORDER}`,
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FaEye /> View
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Request Modal */}
     {showCreateModal && (
        <div 
          onClick={() => setShowCreateModal(false)}
          style={{
            position:'fixed',
            top:0,
            left:0,
            right:0,
            bottom:0,
            background:'rgba(0, 0, 0, 0.7)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            zIndex:10000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background:WHITE,
              padding:'32px',
              borderRadius:12,
              maxWidth:'500px',
              width:'90%',
              maxHeight:'80vh',
              overflowY:'auto',
              boxShadow:'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
            <h2 style={{
              fontSize:'20px',
              fontWeight:700,
              color:NAVY2,
              margin:'0 0 24px'
            }}>
              New Appointment Request
            </h2>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                Preferred Date *
              </label>
              <input
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                style={{
                  width:"100%",
                  padding:"12px 16px",
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  fontSize:"0.95rem",
                  outline:"none"
                }}
                required
              />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                Preferred Time *
              </label>
              <input
                type="time"
                value={formData.preferredTime}
                onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                style={{
                  width:"100%",
                  padding:"12px 16px",
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  fontSize:"0.95rem",
                  outline:"none"
                }}
                required
              />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                Blood Bank Name *
              </label>
              <input
                type="text"
                value={formData.bloodBankName}
                onChange={(e) => setFormData({...formData, bloodBankName: e.target.value})}
                placeholder="Enter blood bank name"
                style={{
                  width:"100%",
                  padding:"12px 16px",
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  fontSize:"0.95rem",
                  outline:"none"
                }}
                required
              />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Enter location/address"
                style={{
                  width:"100%",
                  padding:"12px 16px",
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  fontSize:"0.95rem",
                  outline:"none"
                }}
                required
              />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                placeholder="Any additional notes..."
                style={{
                  width:"100%",
                  padding:"12px 16px",
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  fontSize:"0.95rem",
                  outline:"none",
                  resize:"vertical"
                }}
              />
            </div>
            <div style={{ display:"flex", gap:16 }}>
              <button
                onClick={handleCreateRequest}
                disabled={submitting}
                style={{
                  flex:1,
                  background:RED,
                  color:WHITE,
                  border:"none",
                  padding:"12px 24px",
                  borderRadius:8,
                  fontSize:"1rem",
                  fontWeight:600,
                  cursor:submitting ? "not-allowed" : "pointer"
                }}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex:1,
                  background:WHITE,
                  color:NAVY2,
                  border:`1px solid ${BORDER}`,
                  padding:"12px 24px",
                  borderRadius:8,
                  fontSize:"1rem",
                  fontWeight:600,
                  cursor:"pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedItem && (
        <div 
          onClick={() => setShowViewModal(false)}
          style={{
            position:'fixed',
            top:0,
            left:0,
            right:0,
            bottom:0,
            background:'rgba(0, 0, 0, 0.7)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            zIndex:10000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background:WHITE,
              padding:'32px',
              borderRadius:12,
              maxWidth:'600px',
              width:'90%',
              maxHeight:'80vh',
              overflowY:'auto',
              boxShadow:'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
            <h2 style={{
              fontSize:'20px',
              fontWeight:700,
              color:NAVY2,
              margin:'0 0 24px'
            }}>
              {selectedItem.bloodBankName ? 'Appointment Request Details' : 'Appointment Details'}
            </h2>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>ID</p>
              <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                #{selectedItem._id?.slice(-6)}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Blood Bank</p>
              <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                {selectedItem.bloodBankName || selectedItem.hospitalName || "Not Assigned"}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Location</p>
              <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                {selectedItem.location || selectedItem.bloodBankAddress || "Not specified"}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Date</p>
              <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                {new Date(selectedItem.preferredDate || selectedItem.date).toLocaleDateString()}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Time</p>
              <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                {selectedItem.preferredTime || selectedItem.time}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Status</p>
              <StatusBadge status={selectedItem.status} />
            </div>
            {selectedItem.rejectionReason && (
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Rejection Reason</p>
                <p style={{ fontSize:"1rem", color:RED, fontWeight:600, margin:0 }}>
                  {selectedItem.rejectionReason}
                </p>
              </div>
            )}
            {selectedItem.notes && (
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Notes</p>
                <p style={{ fontSize:"1rem", color:NAVY2, margin:0 }}>
                  {selectedItem.notes}
                </p>
              </div>
            )}
            <button
              onClick={() => setShowViewModal(false)}
              style={{
                width:"100%",
                background:NAVY2,
                color:WHITE,
                border:"none",
                padding:"12px 24px",
                borderRadius:8,
                fontSize:"1rem",
                fontWeight:600,
                cursor:"pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
