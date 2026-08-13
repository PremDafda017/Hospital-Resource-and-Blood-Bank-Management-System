import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarDays,
  FaEye,
  FaXmark,
  FaDownload,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaHeartPulse,
  FaFileMedical,
  FaMapLocationDot,
  FaBell,
  FaUser,
  FaDroplet,
  FaHospital,
  FaUserDoctor,
  FaCircleCheck,
  FaClock,
  FaCircleXmark,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { useNotification } from "../../contexts/NotificationContext";

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

function MyAppointments() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const nav = [
    { key:"patient-dashboard", icon:<FaChartLine/>, label:"Dashboard", path:"/patient-dashboard" },
    { key:"appointments", icon:<FaCalendarDays/>, label:"Appointments", path:"/appointments" },
    { key:"blood-requests", icon:<FaHeartPulse/>, label:"My Blood Requests", path:"/blood-requests" },
    { key:"my-appointments", icon:<FaCalendarDays/>, label:"My Appointments", path:"/my-appointments" },
    { key:"blood-banks", icon:<FaMapLocationDot/>, label:"Nearby Blood Banks", path:"/nearby-blood-banks" },
    { key:"notifications", icon:<FaBell/>, label:"Notifications", path:"/notifications" },
    { key:"my-reports", icon:<FaFileMedical/>, label:"My Reports", path:"/my-reports" },
    { key:"profile", icon:<FaUser/>, label:"My Profile", path:"/profile" },
  ];

  const active = "my-appointments";

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    if (user?.id) {
      const loadAppointments = async () => {
        try {
          const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/appointments/patient/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setAppointments(data);
          }
        } catch (error) {
          console.error('Error loading appointments:', error);
        }
        setLoading(false);
      };
      loadAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    setModalLoading(true);
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/appointments/${selectedAppointment._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelledBy: user.id,
          cancellationReason: cancellationReason || "Cancelled by patient"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel appointment');
      }

      // Show success notification
      showNotification({
        type: 'warning',
        title: 'Appointment Cancelled',
        message: 'Your appointment has been cancelled successfully',
        duration: 4000,
        playSound: true
      });

      // Reload appointments
      const reloadResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/appointments/patient/${user.id}`);
      if (reloadResponse.ok) {
        const reloadData = await reloadResponse.json();
        setAppointments(reloadData);
      }

      setShowCancelModal(false);
      setCancellationReason("");
      setSelectedAppointment(null);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Cancellation Failed',
        message: error.message || "Failed to cancel appointment",
        duration: 4000,
        playSound: true
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleDownloadPrescription = (appointment) => {
    // For now, just show an alert. In a real implementation, this would generate/download a PDF
    if (appointment.prescription && appointment.prescription.diagnosis) {
      alert(`Prescription for ${appointment.appointmentNumber}:\n\nDiagnosis: ${appointment.prescription.diagnosis}\nNotes: ${appointment.prescription.notes}\n\nMedicines: ${appointment.prescription.medicines.map(m => `${m.name} - ${m.dosage}`).join('\n')}`);
    } else {
      alert("No prescription available for this appointment yet.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return { bg: "#FEF3C7", color: "#D97706" };
      case "Approved": return { bg: "#DBEAFE", color: "#2563EB" };
      case "Completed": return { bg: "#DCFCE7", color: "#16A34A" };
      case "Rejected": return { bg: "#FEE2E2", color: "#DC2626" };
      case "Cancelled": return { bg: "#FEE2E2", color: "#DC2626" };
      default: return { bg: "#F3F4F6", color: "#6B7280" };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <FaClock />;
      case "Approved": return <FaCircleCheck />;
      case "Completed": return <FaCircleCheck />;
      case "Rejected": return <FaCircleXmark />;
      case "Cancelled": return <FaCircleXmark />;
      default: return <FaTriangleExclamation />;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filterStatus === "All") return true;
    return appointment.status === filterStatus;
  });

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:FONT }}>
      {/* Sidebar */}
      <aside style={{
        width:w, background:SIDEBAR_COL, color:WHITE,
        display:"flex", flexDirection:"column", transition:"width 0.3s ease",
        position:"fixed", height:"100vh", zIndex:1000
      }}>
        <div style={{
          padding: sidebarCollapsed ? "0 16px" : "0 24px",
          height:64, display:"flex", alignItems:"center", justifyContent:"space-between",
          borderBottom:"1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            color:WHITE, fontWeight:700, fontSize:"1.1rem"
          }}>
            <FaDroplet style={{ color:RED, fontSize:"1.4rem" }} />
            {!sidebarCollapsed && <span>Patient Portal</span>}
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
            background:"none", border:"none", color:WHITE,
            cursor:"pointer", padding:4, borderRadius:4
          }}>
            <FaBars />
          </button>
        </div>

        <nav style={{ flex:1, padding:"16px 12px", overflowY:"auto" }}>
          {nav.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              style={{
                width:"100%",
                display:"flex",
                alignItems:"center",
                gap:12,
                padding:"12px 16px",
                borderRadius:8,
                border:"none",
                background: active === item.key ? RED : "transparent",
                color:WHITE,
                cursor:"pointer",
                marginBottom:4,
                transition:"all 0.2s",
                fontSize: "0.9rem"
              }}
              onMouseEnter={e => {
                if (active !== item.key) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={e => {
                if (active !== item.key) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize:"1.1rem", minWidth:20 }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding:"16px 12px", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          <SignOutButton>
            <button style={{
              width:"100%",
              display:"flex",
              alignItems:"center",
              gap:12,
              padding:"12px 16px",
              borderRadius:8,
              border:"none",
              background:"transparent",
              color:WHITE,
              cursor:"pointer",
              fontSize:"0.9rem",
              transition:"all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize:"1.1rem" }}><FaRightFromBracket /></span>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft:w, flex:1, minHeight:"100vh", background:SMOKE }}>
        <div style={{ padding:"24px 32px" }}>
          {/* Header */}
          <div style={{ marginBottom:32, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <h1 style={{ fontSize:"1.8rem", fontWeight:800, color:NAVY2, margin:"0 0 8px 0" }}>
                My Appointments
              </h1>
              <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
                View and manage your appointment history
              </p>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              style={{
                background:RED,
                color:WHITE,
                border:"none",
                padding:"12px 24px",
                borderRadius:8,
                fontSize:"0.95rem",
                fontWeight:600,
                cursor:"pointer",
                display:"flex",
                alignItems:"center",
                gap:8
              }}
            >
              <FaCalendarDays /> Book New Appointment
            </button>
          </div>

          {/* Filters */}
          <div style={{
            background:WHITE,
            padding:"16px 24px",
            borderRadius:12,
            marginBottom:24,
            border:`1px solid ${BORDER}`,
            display:"flex",
            gap:16,
            alignItems:"center"
          }}>
            <span style={{ fontSize:"0.9rem", fontWeight:600, color:NAVY2 }}>Filter by Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding:"8px 16px",
                border:`1px solid ${BORDER}`,
                borderRadius:8,
                fontSize:"0.9rem",
                outline:"none",
                cursor:"pointer"
              }}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Appointments Table */}
          {loading ? (
            <div style={{ textAlign:"center", padding:"48px", color:SLATE_L }}>
              Loading appointments...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div style={{
              background:WHITE,
              padding:"48px",
              borderRadius:12,
              border:`1px solid ${BORDER}`,
              textAlign:"center"
            }}>
              <FaCalendarDays style={{ fontSize:48, color:SLATE_L, marginBottom:16 }} />
              <h3 style={{ fontSize:"1.2rem", fontWeight:600, color:NAVY2, margin:"0 0 8px 0" }}>
                No Appointments Found
              </h3>
              <p style={{ color:SLATE_L, margin:"0 0 24px" }}>
                {filterStatus === "All" 
                  ? "You haven't booked any appointments yet." 
                  : `No appointments with status "${filterStatus}".`}
              </p>
              <button
                onClick={() => navigate('/appointments')}
                style={{
                  background:RED,
                  color:WHITE,
                  border:"none",
                  padding:"12px 24px",
                  borderRadius:8,
                  fontSize:"0.95rem",
                  fontWeight:600,
                  cursor:"pointer"
                }}
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            <div style={{
              background:WHITE,
              borderRadius:12,
              border:`1px solid ${BORDER}`,
              overflow:"hidden"
            }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:SMOKE, borderBottom:`1px solid ${BORDER}` }}>
                    <th style={{ padding:"16px", textAlign:"left", fontSize:"0.85rem", fontWeight:600, color:SLATE }}>ID</th>
                    <th style={{ padding:"16px", textAlign:"left", fontSize:"0.85rem", fontWeight:600, color:SLATE }}>Doctor</th>
                    <th style={{ padding:"16px", textAlign:"left", fontSize:"0.85rem", fontWeight:600, color:SLATE }}>Hospital</th>
                    <th style={{ padding:"16px", textAlign:"left", fontSize:"0.85rem", fontWeight:600, color:SLATE }}>Department</th>
                    <th style={{ padding:"16px", textAlign:"left", fontSize:"0.85rem", fontWeight:600, color:SLATE }}>Date</th>
                    <th style={{ padding:"16px", textAlign:"left", fontSize:"0.85rem", fontWeight:600, color:SLATE }}>Time</th>
                    <th style={{ padding:"16px", textAlign:"left", fontSize:"0.85rem", fontWeight:600, color:SLATE }}>Status</th>
                    <th style={{ padding:"16px", textAlign:"left", fontSize:"0.85rem", fontWeight:600, color:SLATE }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => {
                    const statusColor = getStatusColor(appointment.status);
                    const statusIcon = getStatusIcon(appointment.status);
                    
                    return (
                      <tr key={appointment._id} style={{ borderBottom:`1px solid ${BORDER}` }}>
                        <td style={{ padding:"16px", fontSize:"0.9rem", color:NAVY2, fontWeight:600 }}>
                          #{appointment.appointmentNumber}
                        </td>
                        <td style={{ padding:"16px", fontSize:"0.9rem", color:NAVY2 }}>
                          {appointment.doctorName || "Not Assigned"}
                        </td>
                        <td style={{ padding:"16px", fontSize:"0.9rem", color:NAVY2 }}>
                          {appointment.hospitalName}
                        </td>
                        <td style={{ padding:"16px", fontSize:"0.9rem", color:NAVY2 }}>
                          {appointment.department}
                        </td>
                        <td style={{ padding:"16px", fontSize:"0.9rem", color:NAVY2 }}>
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding:"16px", fontSize:"0.9rem", color:NAVY2 }}>
                          {appointment.appointmentTime}
                        </td>
                        <td style={{ padding:"16px" }}>
                          <span style={{
                            padding:"4px 10px",
                            borderRadius:6,
                            background:statusColor.bg,
                            color:statusColor.color,
                            fontSize:"0.75rem",
                            fontWeight:600,
                            display:"inline-flex",
                            alignItems:"center",
                            gap:4
                          }}>
                            {statusIcon} {appointment.status}
                          </span>
                        </td>
                        <td style={{ padding:"16px" }}>
                          <div style={{ display:"flex", gap:8 }}>
                            <button
                              onClick={() => handleViewClick(appointment)}
                              style={{
                                background:WHITE,
                                border:`1px solid ${BORDER}`,
                                padding:"6px 12px",
                                borderRadius:6,
                                fontSize:"0.85rem",
                                cursor:"pointer",
                                display:"flex",
                                alignItems:"center",
                                gap:4
                              }}
                              title="View Details"
                            >
                              <FaEye /> View
                            </button>
                            {appointment.status === "Pending" && (
                              <button
                                onClick={() => handleCancelClick(appointment)}
                                style={{
                                  background:WHITE,
                                  border:`1px solid ${BORDER}`,
                                  padding:"6px 12px",
                                  borderRadius:6,
                                  fontSize:"0.85rem",
                                  cursor:"pointer",
                                  display:"flex",
                                  alignItems:"center",
                                  gap:4,
                                  color:RED
                                }}
                                title="Cancel Appointment"
                              >
                                <FaXmark /> Cancel
                              </button>
                            )}
                            {appointment.status === "Completed" && appointment.prescription && (
                              <button
                                onClick={() => handleDownloadPrescription(appointment)}
                                style={{
                                  background:WHITE,
                                  border:`1px solid ${BORDER}`,
                                  padding:"6px 12px",
                                  borderRadius:6,
                                  fontSize:"0.85rem",
                                  cursor:"pointer",
                                  display:"flex",
                                  alignItems:"center",
                                  gap:4
                                }}
                                title="Download Prescription"
                              >
                                <FaDownload /> Prescription
                              </button>
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
      </main>

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div 
          onClick={() => setShowCancelModal(false)}
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
              boxShadow:'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
            <h2 style={{
              fontSize:'20px',
              fontWeight:700,
              color:NAVY2,
              margin:'0 0 16px'
            }}>
              Cancel Appointment
            </h2>
            <p style={{
              fontSize:'16px',
              color:SLATE_L,
              margin:'0 0 16px',
              lineHeight:'1.5'
            }}>
              Are you sure you want to cancel appointment #{selectedAppointment.appointmentNumber}?
            </p>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                Reason for cancellation (optional):
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
                placeholder="Why are you cancelling this appointment?"
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
                onClick={handleCancelConfirm}
                disabled={modalLoading}
                style={{
                  flex:1,
                  background:RED,
                  color:WHITE,
                  border:"none",
                  padding:"12px 24px",
                  borderRadius:8,
                  fontSize:"1rem",
                  fontWeight:600,
                  cursor:modalLoading ? "not-allowed" : "pointer"
                }}
              >
                {modalLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={modalLoading}
                style={{
                  flex:1,
                  background:WHITE,
                  color:NAVY2,
                  border:`1px solid ${BORDER}`,
                  padding:"12px 24px",
                  borderRadius:8,
                  fontSize:"1rem",
                  fontWeight:600,
                  cursor:modalLoading ? "not-allowed" : "pointer"
                }}
              >
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedAppointment && (
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
              Appointment Details
            </h2>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Appointment ID</p>
              <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                #{selectedAppointment.appointmentNumber}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Hospital</p>
              <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                {selectedAppointment.hospitalName}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Doctor</p>
              <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                {selectedAppointment.doctorName || "Not Assigned"}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Department</p>
              <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                {selectedAppointment.department}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Speciality</p>
              <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                {selectedAppointment.speciality}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Date & Time</p>
              <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                {new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at {selectedAppointment.appointmentTime}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Reason</p>
              <p style={{ fontSize:"1rem", color:NAVY2, margin:0 }}>
                {selectedAppointment.reason}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Symptoms</p>
              <p style={{ fontSize:"1rem", color:NAVY2, margin:0 }}>
                {selectedAppointment.symptoms || "Not specified"}
              </p>
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Priority</p>
              <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                {selectedAppointment.priority}
              </p>
            </div>
            {selectedAppointment.prescription && selectedAppointment.prescription.diagnosis && (
              <div style={{ marginBottom:16, padding:"16px", background:SMOKE, borderRadius:8 }}>
                <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 8px", fontWeight:600 }}>Prescription</p>
                <p style={{ fontSize:"0.9rem", color:NAVY2, margin:"0 0 8px" }}>
                  <strong>Diagnosis:</strong> {selectedAppointment.prescription.diagnosis}
                </p>
                {selectedAppointment.prescription.medicines.length > 0 && (
                  <div>
                    <p style={{ fontSize:"0.9rem", color:NAVY2, margin:"0 0 4px", fontWeight:600 }}>Medicines:</p>
                    {selectedAppointment.prescription.medicines.map((med, index) => (
                      <p key={index} style={{ fontSize:"0.9rem", color:NAVY2, margin:"0 0 4px" }}>
                        • {med.name} - {med.dosage} ({med.duration})
                      </p>
                    ))}
                  </div>
                )}
                {selectedAppointment.prescription.notes && (
                  <p style={{ fontSize:"0.9rem", color:NAVY2, margin:"8px 0 0 0" }}>
                    <strong>Notes:</strong> {selectedAppointment.prescription.notes}
                  </p>
                )}
              </div>
            )}
            {selectedAppointment.followUpDate && (
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px" }}>Follow-up Date</p>
                <p style={{ fontSize:"1rem", color:NAVY2, fontWeight:600, margin:0 }}>
                  {new Date(selectedAppointment.followUpDate).toLocaleDateString()}
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
}

export default MyAppointments;
