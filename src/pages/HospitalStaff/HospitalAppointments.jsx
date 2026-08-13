import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHeartPulse,
  FaFileMedical,
  FaCalendarDays,
  FaMapLocationDot,
  FaBell,
  FaUser,
  FaDroplet,
  FaPlus,
  FaArrowRight,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaHouse,
  FaUsers,
  FaStethoscope,
  FaMagnifyingGlass,
  FaEye,
  FaPen,
  FaTrash,
  FaCheck,
  FaXmark,
  FaClock,
  FaUserDoctor,
  FaHospital,
  FaPhone,
  FaEnvelope,
  FaFilePdf,
  FaFileImage,
  FaCircleExclamation,
  FaSpinner,
  FaFilter,
  FaCalendarCheck,
  FaHourglassHalf,
  FaBan,
  FaCircleCheck,
  FaIndianRupeeSign,
} from "react-icons/fa6";
import { useNotification } from "../../contexts/NotificationContext";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const RED_DK = "#8B0000";
const RED_GL = "rgba(196,18,48,0.12)";
const NAVY = "#0F172A";
const NAVY2 = "#1E293B";
const SLATE = "#334155";
const SLATE_L = "#64748B";
const BORDER = "#E2E8F0";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";
const SIDEBAR_W = 260;
const SIDEBAR_COL = NAVY;

function HospitalAppointments() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "list" or "calendar"
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [error, setError] = useState("");

  const nav = [
    { key:"hospital-dashboard", icon:<FaChartLine/>, label:"Dashboard", path:"/hospital-dashboard" },
    { key:"hospital-patients", icon:<FaUsers/>, label:"Patients", path:"/hospital-patients" },
    { key:"hospital-doctors", icon:<FaStethoscope/>, label:"Doctors", path:"/hospital-doctors" },
    { key:"hospital-appointments", icon:<FaCalendarDays/>, label:"Appointments", path:"/hospital-appointments" },
    { key:"hospital-blood-requests", icon:<FaHeartPulse/>, label:"Blood Requests", path:"/hospital-blood-requests" },
    { key:"hospital-blood-inventory", icon:<FaDroplet/>, label:"Blood Inventory", path:"/hospital-blood-inventory" },
    { key:"hospital-reports", icon:<FaFileMedical/>, label:"Reports", path:"/hospital-reports" },
    { key:"hospital-notifications", icon:<FaBell/>, label:"Notifications", path:"/hospital-notifications" },
  ];

  const active = "hospital-appointments";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    // Load appointments for this hospital from MongoDB
    const loadAppointments = async () => {
      try {
        // Get hospital staff info to get hospital ID
        const email = user?.emailAddresses?.[0]?.emailAddress;
        const staffResponse = await fetch(`http://localhost:5000/api/hospital-staff/${user.id}?email=${email}`);
        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          const hospitalId = staffData._id;
          const hospitalName = staffData.profile?.hospitalName;
          console.log("Hospital staff data:", staffData);
          console.log("Hospital ID:", hospitalId, "Hospital name:", hospitalName);
          
          // Load all appointments and filter
          const allResponse = await fetch('http://localhost:5000/api/appointments');
          if (allResponse.ok) {
            const allData = await allResponse.json();
            console.log("All appointments:", allData);
            console.log("Appointment details:", allData.map(apt => ({
              id: apt._id,
              hospitalId: apt.hospitalId,
              hospitalName: apt.hospitalName,
              patientName: apt.patientName
            })));
            
            // Since hospital staff doesn't have hospitalName set, show ALL appointments for now
            // In production, hospital staff should have hospitalName set in their profile
            console.log("Showing all appointments since hospitalName is not set in staff profile");
            setAppointments(allData);
          }
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
      }
      setLoading(false);
    };
    loadAppointments();
  }, [user]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'Pending').length,
      approved: appointments.filter(a => a.status === 'Approved').length,
      rejected: appointments.filter(a => a.status === 'Rejected').length,
      completed: appointments.filter(a => a.status === 'Completed').length,
      emergency: appointments.filter(a => a.priority === 'Emergency').length,
      today: appointments.filter(a => {
        const today = new Date().toISOString().split('T')[0];
        return a.appointmentDate === today;
      }).length
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => appointments.filter(apt =>
    apt.status !== 'Approved' && apt.status !== 'Completed' && apt.status !== 'Rejected' &&
    (apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.department?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus === "All" || apt.status === filterStatus) &&
    (filterPriority === "All" || apt.priority === filterPriority) &&
    (filterDate === "" || apt.appointmentDate === filterDate)
  ), [appointments, searchQuery, filterStatus, filterPriority, filterDate]);

  const processedAppointments = useMemo(() => appointments.filter(apt =>
    apt.status === 'Approved' || apt.status === 'Completed' || apt.status === 'Rejected'
  ), [appointments]);

  // Calendar appointments - includes approved appointments to show in calendar
  const calendarAppointments = useMemo(() => appointments.filter(apt =>
    (apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.department?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus === "All" || apt.status === filterStatus) &&
    (filterPriority === "All" || apt.priority === filterPriority) &&
    (filterDate === "" || apt.appointmentDate === filterDate)
  ), [appointments, searchQuery, filterStatus, filterPriority, filterDate]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status/${newStatus}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: user?.id || "",
          approvedByName: user?.fullName || "Hospital Staff"
        })
      });

      if (response.ok) {
        const appointment = appointments.find(a => a._id === appointmentId);

        // Show notification based on status
        if (newStatus === 'Approved') {
          showNotification({
            type: 'success',
            title: 'Appointment Approved',
            message: appointment ? `Appointment for ${appointment.patientName} has been approved` : 'Appointment approved successfully',
            duration: 5000,
            playSound: true
          });
        } else if (newStatus === 'Rejected') {
          showNotification({
            type: 'warning',
            title: 'Appointment Rejected',
            message: appointment ? `Appointment for ${appointment.patientName} has been rejected` : 'Appointment rejected successfully',
            duration: 4000,
            playSound: true
          });
        } else if (newStatus === 'Completed') {
          showNotification({
            type: 'success',
            title: 'Appointment Completed',
            message: appointment ? `Appointment for ${appointment.patientName} marked as completed` : 'Appointment completed successfully',
            duration: 4000,
            playSound: true
          });
        }

        // Reload appointments
        const email = user?.emailAddresses?.[0]?.emailAddress;
        const staffResponse = await fetch(`http://localhost:5000/api/hospital-staff/${user.id}?email=${email}`);
        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          const hospitalId = staffData._id;

          const reloadResponse = await fetch(`http://localhost:5000/api/appointments/hospital/${hospitalId}`);
          if (reloadResponse.ok) {
            const data = await reloadResponse.json();
            setAppointments(data);
          }
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
      } else {
        showNotification({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update appointment status',
          duration: 4000,
          playSound: true
        });
        setError('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      showNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to update appointment status',
        duration: 4000,
        playSound: true
      });
      setError('Failed to update appointment status');
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      handleStatusUpdate(confirmAction.appointmentId, confirmAction.newStatus);
    }
  };

  const openDetailsModal = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setSelectedAppointment(null);
    setShowDetailsModal(false);
  }, []);

  const StatusPill = ({ status }) => {
    const config = {
      "Pending": { bg: "#DBEAFE", color: "#2563EB", icon: <FaHourglassHalf /> },
      "Approved": { bg: "#DCFCE7", color: "#16A34A", icon: <FaCircleCheck /> },
      "Rejected": { bg: "#FEE2E2", color: "#DC2626", icon: <FaBan /> },
      "Completed": { bg: "#DCFCE7", color: "#16A34A", icon: <FaCalendarCheck /> },
      "Cancelled": { bg: "#FEE2E2", color: "#DC2626", icon: <FaBan /> },
      "Scheduled": { bg: "#FEF3C7", color: "#D97706", icon: <FaCalendarCheck /> }
    };
    const { bg, color, icon } = config[status] || { bg: "#F3F4F6", color: "#6B7280", icon: <FaClock /> };
    return (
      <span style={{
        padding:"6px 12px",
        borderRadius:20,
        fontSize:"0.75rem",
        fontWeight:600,
        background:bg,
        color:color,
        display:"inline-flex",
        alignItems:"center",
        gap:6
      }}>
        {icon} {status}
      </span>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const config = {
      "Emergency": { bg: "#FEE2E2", color: "#DC2626", label: "Emergency" },
      "Urgent": { bg: "#FEF3C7", color: "#D97706", label: "Urgent" },
      "Normal": { bg: "#DCFCE7", color: "#16A34A", label: "Normal" }
    };
    const { bg, color, label } = config[priority] || config["Normal"];
    return (
      <span style={{
        padding:"4px 10px",
        borderRadius:12,
        fontSize:"0.7rem",
        fontWeight:700,
        textTransform:"uppercase",
        background:bg,
        color:color,
        letterSpacing:"0.05em"
      }}>
        {label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: SMOKE,
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
    <div style={{ fontFamily: FONT, background: SMOKE, minHeight: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{
        width:w, minHeight:"100vh", background:SIDEBAR_COL,
        position:"fixed", top:0, left:0, zIndex:200,
        display:"flex", flexDirection:"column",
        transition:"width 0.3s ease"
      }}>
        <div style={{
          height:64, borderBottom:`1px solid rgba(255,255,255,0.1)`,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding: sidebarCollapsed ? "0 16px" : "0 24px"
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            color:WHITE, fontWeight:700, fontSize:"1.1rem"
          }}>
            <FaDroplet style={{ color:RED, fontSize:"1.4rem" }} />
            {!sidebarCollapsed && <span>Hospital Staff</span>}
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

        <div style={{ padding:"16px 12px", borderTop:`1px solid rgba(255,255,255,0.1)` }}>
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
              transition:"all 0.2s",
              fontSize: "0.9rem"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize:"1.1rem", minWidth:20 }}><FaRightFromBracket /></span>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft:w, flex:1, minHeight:"100vh" }}>
        <div style={{ padding:"24px 32px" }}>
          <div style={{ marginBottom:32, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <h1 style={{ fontSize:"1.8rem", fontWeight:800, color:NAVY2, margin:"0 0 8px 0" }}>
                Hospital Appointments
              </h1>
              <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
                Manage all hospital appointments
              </p>
            </div>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <div style={{
                background:WHITE,
                border:`1px solid ${BORDER}`,
                borderRadius:8,
                padding:"8px 16px",
                display:"flex",
                alignItems:"center",
                gap:8
              }}>
                <FaMagnifyingGlass style={{ color:SLATE_L }} />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border:"none",
                    outline:"none",
                    fontSize:"0.9rem",
                    width:200
                  }}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  background:WHITE,
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  padding:"8px 16px",
                  fontSize:"0.9rem",
                  color:NAVY2,
                  cursor:"pointer"
                }}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{
                  background:WHITE,
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  padding:"8px 16px",
                  fontSize:"0.9rem",
                  color:NAVY2,
                  cursor:"pointer"
                }}
              >
                <option value="All">All Priority</option>
                <option value="Emergency">Emergency</option>
                <option value="Urgent">Urgent</option>
                <option value="Normal">Normal</option>
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{
                  background:WHITE,
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  padding:"8px 16px",
                  fontSize:"0.9rem",
                  color:NAVY2,
                  cursor:"pointer"
                }}
              />
              <div style={{
                background:WHITE,
                border:`1px solid ${BORDER}`,
                borderRadius:8,
                padding:"8px 16px",
                display:"flex",
                gap:8
              }}>
                <button
                  onClick={() => setViewMode("cards")}
                  style={{
                    background: viewMode === "cards" ? RED : "transparent",
                    border:"none",
                    padding:"6px 12px",
                    borderRadius:4,
                    cursor:"pointer",
                    fontSize:"0.85rem",
                    color: viewMode === "cards" ? WHITE : NAVY2,
                    fontWeight:600
                  }}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    background: viewMode === "list" ? RED : "transparent",
                    border:"none",
                    padding:"6px 12px",
                    borderRadius:4,
                    cursor:"pointer",
                    fontSize:"0.85rem",
                    color: viewMode === "list" ? WHITE : NAVY2,
                    fontWeight:600
                  }}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  style={{
                    background: viewMode === "calendar" ? RED : "transparent",
                    border:"none",
                    padding:"6px 12px",
                    borderRadius:4,
                    cursor:"pointer",
                    fontSize:"0.85rem",
                    color: viewMode === "calendar" ? WHITE : NAVY2,
                    fontWeight:600
                  }}
                >
                  Calendar
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Dashboard */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16, marginBottom:32 }}>
            <div style={{
              background:WHITE,
              padding:"20px",
              borderRadius:12,
              border:`1px solid ${BORDER}`,
              display:"flex",
              alignItems:"center",
              gap:16
            }}>
              <div style={{
                width:48,
                height:48,
                borderRadius:10,
                background:RED_GL,
                display:"flex",
                alignItems:"center",
                justifyContent:"center"
              }}>
                <FaCalendarDays style={{ fontSize:24, color:RED }} />
              </div>
              <div>
                <p style={{ fontSize:"0.85rem", color:SLATE_L, margin:"0 0 4px 0" }}>Total Appointments</p>
                <p style={{ fontSize:"1.5rem", fontWeight:700, color:NAVY2, margin:0 }}>{stats.total}</p>
              </div>
            </div>
            <div style={{
              background:WHITE,
              padding:"20px",
              borderRadius:12,
              border:`1px solid ${BORDER}`,
              display:"flex",
              alignItems:"center",
              gap:16
            }}>
              <div style={{
                width:48,
                height:48,
                borderRadius:10,
                background:"#DBEAFE",
                display:"flex",
                alignItems:"center",
                justifyContent:"center"
              }}>
                <FaHourglassHalf style={{ fontSize:24, color:"#2563EB" }} />
              </div>
              <div>
                <p style={{ fontSize:"0.85rem", color:SLATE_L, margin:"0 0 4px 0" }}>Pending</p>
                <p style={{ fontSize:"1.5rem", fontWeight:700, color:NAVY2, margin:0 }}>{stats.pending}</p>
              </div>
            </div>
            <div style={{
              background:WHITE,
              padding:"20px",
              borderRadius:12,
              border:`1px solid ${BORDER}`,
              display:"flex",
              alignItems:"center",
              gap:16
            }}>
              <div style={{
                width:48,
                height:48,
                borderRadius:10,
                background:"#DCFCE7",
                display:"flex",
                alignItems:"center",
                justifyContent:"center"
              }}>
                <FaCircleCheck style={{ fontSize:24, color:"#16A34A" }} />
              </div>
              <div>
                <p style={{ fontSize:"0.85rem", color:SLATE_L, margin:"0 0 4px 0" }}>Approved</p>
                <p style={{ fontSize:"1.5rem", fontWeight:700, color:NAVY2, margin:0 }}>{stats.approved}</p>
              </div>
            </div>
            <div style={{
              background:WHITE,
              padding:"20px",
              borderRadius:12,
              border:`1px solid ${BORDER}`,
              display:"flex",
              alignItems:"center",
              gap:16
            }}>
              <div style={{
                width:48,
                height:48,
                borderRadius:10,
                background:"#FEE2E2",
                display:"flex",
                alignItems:"center",
                justifyContent:"center"
              }}>
                <FaCircleExclamation style={{ fontSize:24, color:"#DC2626" }} />
              </div>
              <div>
                <p style={{ fontSize:"0.85rem", color:SLATE_L, margin:"0 0 4px 0" }}>Emergency</p>
                <p style={{ fontSize:"1.5rem", fontWeight:700, color:NAVY2, margin:0 }}>{stats.emergency}</p>
              </div>
            </div>
            <div style={{
              background:WHITE,
              padding:"20px",
              borderRadius:12,
              border:`1px solid ${BORDER}`,
              display:"flex",
              alignItems:"center",
              gap:16
            }}>
              <div style={{
                width:48,
                height:48,
                borderRadius:10,
                background:"#FEF3C7",
                display:"flex",
                alignItems:"center",
                justifyContent:"center"
              }}>
                <FaCalendarCheck style={{ fontSize:24, color:"#D97706" }} />
              </div>
              <div>
                <p style={{ fontSize:"0.85rem", color:SLATE_L, margin:"0 0 4px 0" }}>Today</p>
                <p style={{ fontSize:"1.5rem", fontWeight:700, color:NAVY2, margin:0 }}>{stats.today}</p>
              </div>
            </div>
          </div>
          {/* Appointments Content */}
          {viewMode === "cards" ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(350px, 1fr))", gap:20 }}>
              {filteredAppointments.length === 0 ? (
                <div style={{
                  gridColumn:"1 / -1",
                  textAlign:"center",
                  padding:"60px 20px",
                  background:WHITE,
                  borderRadius:12,
                  border:`1px solid ${BORDER}`,
                  color:SLATE_L
                }}>
                  <FaCalendarDays style={{ fontSize:"3rem", marginBottom:16, opacity:0.3 }} />
                  <p style={{ fontSize:"1rem", marginBottom:16 }}>No appointments found</p>
                </div>
              ) : (
                filteredAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    style={{
                      background:WHITE,
                      borderRadius:12,
                      border:apt.priority === "Emergency" ? `2px solid #DC2626` : `1px solid ${BORDER}`,
                      padding:"20px",
                      transition:"all 0.2s",
                      cursor:"pointer"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onClick={() => openDetailsModal(apt)}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                        <div style={{
                          width:48,
                          height:48,
                          borderRadius:10,
                          background:SMOKE,
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center"
                        }}>
                          <FaUser style={{ fontSize:24, color:NAVY2 }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize:"1rem", fontWeight:700, color:NAVY2, margin:"0 0 4px 0" }}>
                            {apt.patientName}
                          </h3>
                          <p style={{ fontSize:"0.85rem", color:SLATE_L, margin:0 }}>
                            #{apt.appointmentNumber || apt._id?.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <PriorityBadge priority={apt.priority} />
                    </div>
                    
                    <div style={{ marginBottom:16 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <FaUserDoctor style={{ color:RED, fontSize:14 }} />
                        <span style={{ fontSize:"0.9rem", color:NAVY2 }}>
                          {apt.doctorName || "Not Assigned"}
                        </span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <FaHospital style={{ color:RED, fontSize:14 }} />
                        <span style={{ fontSize:"0.9rem", color:SLATE }}>
                          {apt.department}
                        </span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <FaClock style={{ color:RED, fontSize:14 }} />
                        <span style={{ fontSize:"0.9rem", color:SLATE }}>
                          {formatDate(apt.appointmentDate)} at {formatTime(apt.appointmentTime)}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:16, borderTop:`1px solid ${BORDER}` }}>
                      <StatusPill status={apt.status} />
                      {apt.status === "Pending" && (
                        <div style={{ display:"flex", gap:8 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmAction({ appointmentId: apt._id, newStatus: "Approved" });
                              setShowConfirmModal(true);
                            }}
                            style={{
                              background:"#DCFCE7",
                              border:"none",
                              padding:"6px 12px",
                              borderRadius:6,
                              cursor:"pointer",
                              fontSize:"0.8rem",
                              color:"#16A34A",
                              fontWeight:600,
                              display:"flex",
                              alignItems:"center",
                              gap:4
                            }}
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmAction({ appointmentId: apt._id, newStatus: "Rejected" });
                              setShowConfirmModal(true);
                            }}
                            style={{
                              background:"#FEE2E2",
                              border:"none",
                              padding:"6px 12px",
                              borderRadius:6,
                              cursor:"pointer",
                              fontSize:"0.8rem",
                              color:"#DC2626",
                              fontWeight:600,
                              display:"flex",
                              alignItems:"center",
                              gap:4
                            }}
                          >
                            <FaXmark /> Reject
                          </button>
                        </div>
                      )}
                      {apt.status === "Approved" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmAction({ appointmentId: apt._id, newStatus: "Completed" });
                            setShowConfirmModal(true);
                          }}
                          style={{
                            background:"#DBEAFE",
                            border:"none",
                            padding:"6px 12px",
                            borderRadius:6,
                            cursor:"pointer",
                            fontSize:"0.8rem",
                            color:"#2563EB",
                            fontWeight:600,
                            display:"flex",
                            alignItems:"center",
                            gap:4
                          }}
                        >
                          <FaCheck /> Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : viewMode === "list" ? (
            <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
              <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h2 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>All Appointments ({filteredAppointments.length})</h2>
              </div>
              {filteredAppointments.length === 0 ? (
                <div style={{ textAlign:"center", padding:"60px 20px", color:SLATE_L }}>
                  <FaCalendarDays style={{ fontSize:"3rem", marginBottom:16, opacity:0.3 }} />
                  <p style={{ fontSize:"1rem", marginBottom:16 }}>No appointments found</p>
                </div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:SMOKE, borderBottom:`1px solid ${BORDER}` }}>
                        <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Appointment ID</th>
                        <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Patient</th>
                        <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Department</th>
                        <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Date</th>
                        <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Time</th>
                        <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Hospital</th>
                        <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Doctor</th>
                        <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Priority</th>
                        <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Status</th>
                        <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((apt) => (
                        <tr key={apt._id} style={{ borderBottom:`1px solid ${BORDER}`, transition:"background 0.2s", cursor:"pointer" }} 
                          onMouseEnter={e => e.currentTarget.style.background = SMOKE} 
                          onMouseLeave={e => e.currentTarget.style.background = WHITE}
                          onClick={() => openDetailsModal(apt)}
                        >
                          <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2, fontWeight:600 }}>#{apt.appointmentNumber}</td>
                          <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{apt.patientName}</td>
                          <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{apt.department}</td>
                          <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                          <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{apt.appointmentTime}</td>
                          <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>{apt.hospitalName}</td>
                          <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{apt.doctorName || "Not Assigned"}</td>
                          <td style={{ padding:"16px 24px" }}><PriorityBadge priority={apt.priority} /></td>
                          <td style={{ padding:"16px 24px" }}><StatusPill status={apt.status} /></td>
                          <td style={{ padding:"16px 24px" }}>
                            <div style={{ display:"flex", gap:8 }}>
                              {apt.status === "Pending" && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmAction({ appointmentId: apt._id, newStatus: "Approved" });
                                      setShowConfirmModal(true);
                                    }}
                                    style={{
                                      background:"#DCFCE7",
                                      border:"none",
                                      padding:"6px 12px",
                                      borderRadius:6,
                                      cursor:"pointer",
                                      fontSize:"0.85rem",
                                      color:"#16A34A",
                                      display:"flex",
                                      alignItems:"center",
                                      gap:4
                                    }}
                                  >
                                    <FaCheck /> Approve
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmAction({ appointmentId: apt._id, newStatus: "Rejected" });
                                      setShowConfirmModal(true);
                                    }}
                                    style={{
                                      background:"#FEE2E2",
                                      border:"none",
                                      padding:"6px 12px",
                                      borderRadius:6,
                                      cursor:"pointer",
                                      fontSize:"0.85rem",
                                      color:"#DC2626",
                                      display:"flex",
                                      alignItems:"center",
                                      gap:4
                                    }}
                                  >
                                    <FaXmark /> Reject
                                  </button>
                                </>
                              )}
                              {apt.status === "Approved" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmAction({ appointmentId: apt._id, newStatus: "Completed" });
                                    setShowConfirmModal(true);
                                  }}
                                  style={{
                                    background:"#DBEAFE",
                                    border:"none",
                                    padding:"6px 12px",
                                    borderRadius:6,
                                    cursor:"pointer",
                                    fontSize:"0.85rem",
                                    color:"#2563EB",
                                    display:"flex",
                                    alignItems:"center",
                                    gap:4
                                  }}
                                >
                                  <FaCheck /> Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding:"24px" }}>
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:"0 0 20px 0" }}>Calendar View</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:8 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} style={{ textAlign:"center", fontWeight:600, color:SLATE_L, fontSize:"0.85rem", padding:8 }}>{day}</div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNum = i - 2;
                  const dayAppointments = calendarAppointments.filter(apt => {
                    const aptDate = new Date(apt.appointmentDate);
                    return aptDate.getDate() === dayNum && aptDate.getMonth() === new Date().getMonth();
                  });
                  return (
                    <div key={i} style={{
                      minHeight:80,
                      border:`1px solid ${BORDER}`,
                      borderRadius:6,
                      padding:8,
                      background: dayNum > 0 && dayNum <= 31 ? WHITE : SMOKE,
                      opacity: dayNum > 0 && dayNum <= 31 ? 1 : 0.5
                    }}>
                      {dayNum > 0 && dayNum <= 31 && (
                        <>
                          <div style={{ fontWeight:600, fontSize:"0.85rem", color:NAVY2, marginBottom:4 }}>{dayNum}</div>
                          {dayAppointments.slice(0, 2).map(apt => (
                            <div 
                              key={apt._id}
                              onClick={() => openDetailsModal(apt)}
                              style={{
                                fontSize:"0.7rem",
                                padding:"2px 4px",
                                borderRadius:3,
                                background: apt.status === "Approved" ? "#DCFCE7" : apt.status === "Rejected" ? "#FEE2E2" : apt.status === "Completed" ? "#DCFCE7" : "#DBEAFE",
                                color: apt.status === "Approved" ? "#16A34A" : apt.status === "Rejected" ? "#DC2626" : apt.status === "Completed" ? "#16A34A" : "#2563EB",
                                marginBottom:2,
                                overflow:"hidden",
                                textOverflow:"ellipsis",
                                whiteSpace:"nowrap",
                                cursor:"pointer"
                              }}
                            >
                              {apt.appointmentTime} - {apt.patientName?.split(' ')[0]}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div style={{ fontSize:"0.65rem", color:SLATE_L }}>+{dayAppointments.length - 2} more</div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Processed Appointments Section */}
          {processedAppointments.length > 0 && (
            <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden", marginTop:24 }}>
              <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h2 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>Processed Appointments ({processedAppointments.length})</h2>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:SMOKE, borderBottom:`1px solid ${BORDER}` }}>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Appointment ID</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Patient</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Department</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Date</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Time</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Hospital</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Doctor</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Priority</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedAppointments.map((apt) => (
                      <tr key={apt._id} style={{ borderBottom:`1px solid ${BORDER}`, transition:"background 0.2s", cursor:"pointer" }} 
                        onMouseEnter={e => e.currentTarget.style.background = SMOKE} 
                        onMouseLeave={e => e.currentTarget.style.background = WHITE}
                        onClick={() => openDetailsModal(apt)}
                      >
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2, fontWeight:600 }}>#{apt.appointmentNumber}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{apt.patientName}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{apt.department}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{apt.appointmentTime}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>{apt.hospitalName}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{apt.doctorName || "Not Assigned"}</td>
                        <td style={{ padding:"16px 24px" }}><PriorityBadge priority={apt.priority} /></td>
                        <td style={{ padding:"16px 24px" }}><StatusPill status={apt.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div 
          onClick={closeDetailsModal}
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
            zIndex:10000,
            padding:20
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background:WHITE,
              padding:'32px',
              borderRadius:16,
              maxWidth:'600px',
              width:'100%',
              maxHeight:'90vh',
              overflowY:'auto',
              boxShadow:'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontSize:'1.5rem', fontWeight:700, color:NAVY2, margin:0 }}>
                Appointment Details
              </h2>
              <button
                onClick={closeDetailsModal}
                style={{
                  background:'none',
                  border:'none',
                  fontSize:'1.5rem',
                  color:SLATE_L,
                  cursor:'pointer'
                }}
              >
                <FaXmark />
              </button>
            </div>
            
            {/* Patient Information */}
            <div style={{ marginBottom:24 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:600, color:NAVY2, marginBottom:12 }}>Patient Information</h3>
              <div style={{ background:SMOKE, padding:16, borderRadius:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
                  <div style={{
                    width:56,
                    height:56,
                    borderRadius:10,
                    background:WHITE,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center'
                  }}>
                    <FaUser style={{ fontSize:28, color:NAVY2 }} />
                  </div>
                  <div>
                    <p style={{ margin:'0 0 4px 0', color:NAVY2, fontWeight:700, fontSize:'1.1rem' }}>
                      {selectedAppointment.patientName}
                    </p>
                    <p style={{ margin:0, fontSize:'0.9rem', color:SLATE_L }}>
                      #{selectedAppointment.appointmentNumber || selectedAppointment._id?.slice(-6)}
                    </p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:16, fontSize:'0.9rem', color:SLATE }}>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <FaEnvelope /> {selectedAppointment.patientEmail || 'N/A'}
                  </span>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <FaPhone /> {selectedAppointment.patientPhone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Appointment Details */}
            <div style={{ marginBottom:24 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:600, color:NAVY2, marginBottom:12 }}>Appointment Details</h3>
              <div style={{ background:SMOKE, padding:16, borderRadius:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ color:SLATE }}>Date:</span>
                  <span style={{ fontWeight:600, color:NAVY2 }}>{formatDate(selectedAppointment.appointmentDate)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ color:SLATE }}>Time:</span>
                  <span style={{ fontWeight:600, color:NAVY2 }}>{formatTime(selectedAppointment.appointmentTime)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ color:SLATE }}>Department:</span>
                  <span style={{ fontWeight:600, color:NAVY2 }}>{selectedAppointment.department}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ color:SLATE }}>Speciality:</span>
                  <span style={{ fontWeight:600, color:NAVY2 }}>{selectedAppointment.speciality}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ color:SLATE }}>Doctor:</span>
                  <span style={{ fontWeight:600, color:NAVY2 }}>{selectedAppointment.doctorName || 'Not Assigned'}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:SLATE }}>Priority:</span>
                  <PriorityBadge priority={selectedAppointment.priority} />
                </div>
              </div>
            </div>
            
            {/* Reason & Symptoms */}
            {selectedAppointment.reason && (
              <div style={{ marginBottom:24 }}>
                <h3 style={{ fontSize:'1rem', fontWeight:600, color:NAVY2, marginBottom:12 }}>Reason for Visit</h3>
                <div style={{ background:SMOKE, padding:16, borderRadius:8 }}>
                  <p style={{ margin:0, fontSize:'0.9rem', color:SLATE }}>
                    {selectedAppointment.reason}
                  </p>
                </div>
              </div>
            )}
            
            {selectedAppointment.symptoms && (
              <div style={{ marginBottom:24 }}>
                <h3 style={{ fontSize:'1rem', fontWeight:600, color:NAVY2, marginBottom:12 }}>Symptoms</h3>
                <div style={{ background:SMOKE, padding:16, borderRadius:8 }}>
                  <p style={{ margin:0, fontSize:'0.9rem', color:SLATE }}>
                    {selectedAppointment.symptoms}
                  </p>
                </div>
              </div>
            )}
            
            {/* Medical Reports */}
            {selectedAppointment.medicalReports && selectedAppointment.medicalReports.length > 0 && (
              <div style={{ marginBottom:24 }}>
                <h3 style={{ fontSize:'1rem', fontWeight:600, color:NAVY2, marginBottom:12 }}>
                  Medical Reports ({selectedAppointment.medicalReports.length})
                </h3>
                <div style={{ background:SMOKE, padding:16, borderRadius:8 }}>
                  {selectedAppointment.medicalReports.map((report, index) => (
                    <div key={index} style={{ 
                      display:'flex', 
                      alignItems:'center', 
                      gap:12, 
                      padding:8, 
                      background:WHITE, 
                      borderRadius:6, 
                      marginBottom:8 
                    }}>
                      <div style={{
                        width:32,
                        height:32,
                        borderRadius:6,
                        background:SMOKE,
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center'
                      }}>
                        {report.type?.includes('pdf') ? (
                          <FaFilePdf style={{ fontSize:16, color:'#DC2626' }} />
                        ) : (
                          <FaFileImage style={{ fontSize:16, color:'#2563EB' }} />
                        )}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0, fontSize:'0.9rem', color:NAVY2, fontWeight:500 }}>
                          {report.name}
                        </p>
                        <p style={{ margin:0, fontSize:'0.8rem', color:SLATE_L }}>
                          {(report.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Status & Actions */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:16, borderTop:`1px solid ${BORDER}` }}>
              <StatusPill status={selectedAppointment.status} />
              {selectedAppointment.status === "Pending" && (
                <div style={{ display:'flex', gap:8 }}>
                  <button
                    onClick={() => {
                      closeDetailsModal();
                      setConfirmAction({ appointmentId: selectedAppointment._id, newStatus: "Approved" });
                      setShowConfirmModal(true);
                    }}
                    style={{
                      background:'#16A34A',
                      color:WHITE,
                      border:'none',
                      padding:'10px 20px',
                      borderRadius:8,
                      fontSize:'0.9rem',
                      fontWeight:600,
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      gap:6
                    }}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    onClick={() => {
                      closeDetailsModal();
                      setConfirmAction({ appointmentId: selectedAppointment._id, newStatus: "Rejected" });
                      setShowConfirmModal(true);
                    }}
                    style={{
                      background:'#DC2626',
                      color:WHITE,
                      border:'none',
                      padding:'10px 20px',
                      borderRadius:8,
                      fontSize:'0.9rem',
                      fontWeight:600,
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      gap:6
                    }}
                  >
                    <FaXmark /> Reject
                  </button>
                </div>
              )}
              {selectedAppointment.status === "Approved" && (
                <button
                  onClick={() => {
                    closeDetailsModal();
                    setConfirmAction({ appointmentId: selectedAppointment._id, newStatus: "Completed" });
                    setShowConfirmModal(true);
                  }}
                  style={{
                    background:'#2563EB',
                    color:WHITE,
                    border:'none',
                    padding:'10px 20px',
                    borderRadius:8,
                    fontSize:'0.9rem',
                    fontWeight:600,
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    gap:6
                  }}
                >
                  <FaCheck /> Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div 
          onClick={() => setShowConfirmModal(false)}
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
              borderRadius:16,
              maxWidth:'400px',
              width:'90%',
              textAlign:'center',
              boxShadow:'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
            <div style={{
              width:'64px',
              height:'64px',
              borderRadius:'50%',
              background:confirmAction?.newStatus === 'Approved' ? 'rgba(22, 163, 74, 0.1)' : confirmAction?.newStatus === 'Rejected' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(37, 99, 235, 0.1)',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              margin:'0 auto 16px'
            }}>
              {confirmAction?.newStatus === 'Approved' ? (
                <FaCircleCheck style={{ fontSize:'32px', color:'#16A34A' }} />
              ) : confirmAction?.newStatus === 'Rejected' ? (
                <FaBan style={{ fontSize:'32px', color:'#DC2626' }} />
              ) : (
                <FaCalendarCheck style={{ fontSize:'32px', color:'#2563EB' }} />
              )}
            </div>
            <h2 style={{
              fontSize:'1.25rem',
              fontWeight:700,
              color:NAVY2,
              margin:'0 0 12px'
            }}>
              Confirm {confirmAction?.newStatus}
            </h2>
            <p style={{
              fontSize:'0.95rem',
              color:SLATE_L,
              margin:'0 0 24px',
              lineHeight:'1.5'
            }}>
              Are you sure you want to {confirmAction?.newStatus?.toLowerCase()} this appointment?
            </p>
            <div style={{ display:'flex', gap:12 }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex:1,
                  background:WHITE,
                  color:NAVY2,
                  border:`1px solid ${BORDER}`,
                  padding:'12px 24px',
                  borderRadius:8,
                  fontSize:'1rem',
                  fontWeight:600,
                  cursor:'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                style={{
                  flex:1,
                  background:confirmAction?.newStatus === 'Approved' ? '#16A34A' : confirmAction?.newStatus === 'Rejected' ? '#DC2626' : '#2563EB',
                  color:WHITE,
                  border:'none',
                  padding:'12px 24px',
                  borderRadius:8,
                  fontSize:'1rem',
                  fontWeight:600,
                  cursor:'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div style={{
          position:'fixed',
          bottom:24,
          right:24,
          background:'#FEE2E2',
          color:'#DC2626',
          padding:'16px 24px',
          borderRadius:8,
          boxShadow:'0 4px 12px rgba(0,0,0,0.15)',
          zIndex:10001,
          display:'flex',
          alignItems:'center',
          gap:8
        }}>
          <FaCircleExclamation /> {error}
          <button
            onClick={() => setError('')}
            style={{
              background:'none',
              border:'none',
              color:'#DC2626',
              cursor:'pointer',
              fontSize:'1.2rem'
            }}
          >
            <FaXmark />
          </button>
        </div>
      )}
    </div>
  );
}

export default HospitalAppointments;
