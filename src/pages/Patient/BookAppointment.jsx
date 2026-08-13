import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCalendarDays,
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
  FaUpload,
  FaCheck,
  FaXmark,
  FaStar,
  FaClock,
  FaPhone,
  FaLocationDot,
  FaBuildingColumns,
  FaBuilding,
  FaCircleExclamation,
  FaFilePdf,
  FaFileImage,
  FaTrash,
  FaEye,
  FaSpinner,
  FaRegCalendar,
  FaStethoscope,
  FaIndianRupeeSign,
} from "react-icons/fa6";
import { hospitalDatabase } from "../../data/hospitalData";
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

const SPECIALITIES = [
  { name: "Cardiology", icon: "❤️", description: "Heart Specialist" },
  { name: "Orthopedic", icon: "🦴", description: "Bone Specialist" },
  { name: "Pediatric", icon: "👶", description: "Child Specialist" },
  { name: "Neurology", icon: "🧠", description: "Brain Specialist" },
  { name: "General Physician", icon: "🩺", description: "General Health" },
  { name: "Dermatology", icon: "👤", description: "Skin Specialist" },
  { name: "ENT", icon: "👂", description: "Ear Nose Throat" },
  { name: "Dentist", icon: "🦷", description: "Dental Care" },
  { name: "Gynecology", icon: "👤", description: "Women's Health" },
  { name: "Psychiatry", icon: "🧠", description: "Mental Health" },
  { name: "Ophthalmology", icon: "👁️", description: "Eye Specialist" },
  { name: "Urology", icon: "🔬", description: "Urinary System" },
  { name: "Emergency Medicine", icon: "🚨", description: "Emergency Care" },
];

function BookAppointment() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef(null);
  
  // Pre-filled data from navigation
  const prefillData = location.state || {};
  
  const [formData, setFormData] = useState({
    hospitalId: prefillData.hospitalId || "",
    hospitalName: prefillData.hospital || "",
    doctorId: prefillData.doctorId || "",
    doctorName: prefillData.doctor || "",
    speciality: prefillData.speciality || "",
    department: prefillData.speciality || "General Medicine",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    symptoms: "",
    priority: "Normal",
    isEmergency: false,
    medicalReports: []
  });

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

  const active = "appointments";

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Use local hospital data
        setHospitals(hospitalDatabase);

        // Load doctors from API
        const doctorResponse = await fetch('http://localhost:5000/api/doctors');
        if (doctorResponse.ok) {
          const doctorData = await doctorResponse.json();
          setDoctors(doctorData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleHospitalChange = useCallback((e) => {
    const hospitalId = e.target.value;
    const hospital = hospitals.find(h => String(h.id) === String(hospitalId) || h._id === hospitalId);
    const hospitalName = hospital?.name || hospital?.hospital || hospital?.hospitalName || "Unknown Hospital";
    console.log("Selected hospital ID:", hospitalId, "Hospital:", hospital, "Hospital name:", hospitalName);
    setFormData(prev => ({
      ...prev,
      hospitalId,
      hospitalName
    }));
    // Clear validation error for hospital
    setValidationErrors(prev => ({ ...prev, hospitalId: '' }));
  }, [hospitals]);

  const handleDoctorChange = useCallback((e) => {
    const doctorId = e.target.value;
    const doctor = doctors.find(d => d._id === doctorId);
    setFormData({
      ...formData,
      doctorId,
      doctorName: doctor?.name || "",
      speciality: doctor?.specialization || formData.speciality,
      department: doctor?.specialization || "General Medicine"
    });
  }, [doctors, formData]);

  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.hospitalId) errors.hospitalId = 'Please select a hospital';
    if (!formData.speciality) errors.speciality = 'Please select a speciality';
    if (!formData.appointmentDate) errors.appointmentDate = 'Please select appointment date';
    if (!formData.appointmentTime) errors.appointmentTime = 'Please select appointment time';
    if (!formData.reason || formData.reason.trim().length < 10) {
      errors.reason = 'Please provide a reason (minimum 10 characters)';
    }
    
    // Validate date is not in the past
    if (formData.appointmentDate) {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.appointmentDate = 'Appointment date cannot be in the past';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      setError("Please fix the validation errors before submitting");
      return;
    }

    setShowSummaryModal(true);
  };

  const confirmAppointment = async () => {
    setShowSummaryModal(false);
    setLoading(true);

    try {
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const patientData = await fetch(`http://localhost:5000/api/patient/${user.id}?email=${email}`);
      const patient = await patientData.json();

      const appointmentData = {
        patientId: user.id,
        patientName: patient.profile?.fullName || user?.fullName || "Patient",
        patientEmail: email || "",
        patientPhone: patient.profile?.phone || "",
        hospitalId: formData.hospitalId,
        hospitalName: formData.hospitalName || selectedHospital?.name || selectedHospital?.hospital || "",
        doctorId: formData.doctorId,
        doctorName: formData.doctorName,
        department: formData.department,
        speciality: formData.speciality,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
        symptoms: formData.symptoms,
        medicalReports: uploadedFiles.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size
        })),
        priority: formData.isEmergency ? "Emergency" : formData.priority,
        status: "Pending",
        createdBy: user.id
      };

      console.log("Sending appointment data:", appointmentData);

      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to book appointment');
      }

      // Show success notification
      showNotification({
        type: 'success',
        title: 'Appointment Booked Successfully',
        message: `Your appointment with ${formData.doctorName} on ${formatDate(formData.appointmentDate)} at ${formatTime(formData.appointmentTime)} has been booked`,
        duration: 5000,
        playSound: true
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Appointment booking error:", error);
      showNotification({
        type: 'error',
        title: 'Booking Failed',
        message: error.message || "Failed to book appointment. Please try again.",
        duration: 4000,
        playSound: true
      });
      setError(error.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/appointments');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/my-appointments');
  };

  // File upload handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    
    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} is not supported. Please upload PDF, JPG, or PNG files.`);
        return;
      }
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      validFiles.push(file);
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
    setFormData(prev => ({ ...prev, medicalReports: [...prev.medicalReports, ...validFiles] }));
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get selected hospital details
  const selectedHospital = useMemo(() => {
    return hospitals.find(h => h.id === formData.hospitalId || h._id === formData.hospitalId);
  }, [hospitals, formData.hospitalId]);

  // Get selected doctor details
  const selectedDoctor = useMemo(() => {
    return doctors.find(d => d._id === formData.doctorId);
  }, [doctors, formData.doctorId]);

  // Filter doctors based on selected hospital and speciality
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      if (formData.hospitalId && doctor.hospital !== formData.hospitalName) return false;
      if (formData.speciality && doctor.specialization !== formData.speciality) return false;
      return true;
    });
  }, [doctors, formData.hospitalId, formData.hospitalName, formData.speciality]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

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
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontSize:"1.8rem", fontWeight:800, color:NAVY2, margin:"0 0 8px 0" }}>
              Book Appointment
            </h1>
            <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
              Fill in the details to schedule your appointment
            </p>
          </div>

          {/* Form */}
          <div style={{
            background:WHITE,
            padding:"32px",
            borderRadius:12,
            border:`1px solid ${BORDER}`,
            maxWidth:900
          }}>
            {error && (
              <div style={{
                background:"#FEE2E2",
                color:"#DC2626",
                padding:"12px 16px",
                borderRadius:8,
                marginBottom:24,
                fontSize:"0.9rem",
                display:"flex",
                alignItems:"center",
                gap:8
              }}>
                <FaCircleExclamation /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Hospital Selection */}
              <div style={{ marginBottom:24 }}>
                <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Hospital *
                </label>
                <select
                  value={formData.hospitalId}
                  onChange={handleHospitalChange}
                  required
                  style={{
                    width:"100%",
                    padding:"12px 16px",
                    border:validationErrors.hospitalId ? `1px solid #DC2626` : `1px solid ${BORDER}`,
                    borderRadius:8,
                    fontSize:"0.95rem",
                    outline:"none"
                  }}
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.id || hospital._id} value={hospital.id || hospital._id}>
                      {hospital.name || hospital.hospital} - {hospital.city}, {hospital.state}
                    </option>
                  ))}
                </select>
                {validationErrors.hospitalId && (
                  <div style={{ color:"#DC2626", fontSize:"0.85rem", marginTop:4 }}>
                    {validationErrors.hospitalId}
                  </div>
                )}
              </div>

              {/* Hospital Details Card */}
              {selectedHospital && (
                <div style={{
                  background:SMOKE,
                  padding:"20px",
                  borderRadius:8,
                  marginBottom:24,
                  border:`1px solid ${BORDER}`
                }}>
                  <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                    <div style={{
                      width:60,
                      height:60,
                      borderRadius:8,
                      background:WHITE,
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center"
                    }}>
                      {selectedHospital.type === "government" ? (
                        <FaBuildingColumns style={{ fontSize:28, color:NAVY2 }} />
                      ) : (
                        <FaBuilding style={{ fontSize:28, color:RED }} />
                      )}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <h3 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>
                          {selectedHospital.name || selectedHospital.hospital}
                        </h3>
                        <span style={{
                          padding:"4px 8px",
                          borderRadius:4,
                          fontSize:"0.75rem",
                          fontWeight:600,
                          textTransform:"uppercase",
                          background:selectedHospital.type === "government" ? "#DBEAFE" : "#FEE2E2",
                          color:selectedHospital.type === "government" ? "#1E40AF" : "#DC2626"
                        }}>
                          {selectedHospital.type === "government" ? "Government" : "Private"}
                        </span>
                      </div>
                      <div style={{ display:"flex", gap:16, fontSize:"0.9rem", color:SLATE, marginBottom:8 }}>
                        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <FaLocationDot style={{ color:RED }} />
                          {selectedHospital.city}, {selectedHospital.state}
                        </span>
                        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <FaPhone style={{ color:RED }} />
                          {selectedHospital.phone || "Contact for details"}
                        </span>
                      </div>
                      <p style={{ fontSize:"0.85rem", color:SLATE_L, margin:0 }}>
                        {selectedHospital.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Speciality Selection */}
              <div style={{ marginBottom:24 }}>
                <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Speciality *
                </label>
                <select
                  value={formData.speciality}
                  onChange={(e) => {
                    setFormData({...formData, speciality: e.target.value, department: e.target.value});
                    setValidationErrors(prev => ({ ...prev, speciality: '' }));
                  }}
                  required
                  style={{
                    width:"100%",
                    padding:"12px 16px",
                    border:validationErrors.speciality ? `1px solid #DC2626` : `1px solid ${BORDER}`,
                    borderRadius:8,
                    fontSize:"0.95rem",
                    outline:"none"
                  }}
                >
                  <option value="">Select Speciality</option>
                  {SPECIALITIES.map(speciality => (
                    <option key={speciality.name} value={speciality.name}>
                      {speciality.name}
                    </option>
                  ))}
                </select>
                {validationErrors.speciality && (
                  <div style={{ color:"#DC2626", fontSize:"0.85rem", marginTop:4 }}>
                    {validationErrors.speciality}
                  </div>
                )}
              </div>

              {/* Doctor Selection */}
              <div style={{ marginBottom:24 }}>
                <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Doctor (Optional)
                </label>
                <select
                  value={formData.doctorId}
                  onChange={handleDoctorChange}
                  style={{
                    width:"100%",
                    padding:"12px 16px",
                    border:`1px solid ${BORDER}`,
                    borderRadius:8,
                    fontSize:"0.95rem",
                    outline:"none"
                  }}
                >
                  <option value="">Select Doctor (Optional)</option>
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No doctors available for this selection</option>
                  )}
                </select>
              </div>

              {/* Doctor Details Card */}
              {selectedDoctor && (
                <div style={{
                  background:SMOKE,
                  padding:"20px",
                  borderRadius:8,
                  marginBottom:24,
                  border:`1px solid ${BORDER}`
                }}>
                  <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                    <div style={{
                      width:60,
                      height:60,
                      borderRadius:8,
                      background:WHITE,
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center"
                    }}>
                      <FaUserDoctor style={{ fontSize:28, color:NAVY2 }} />
                    </div>
                    <div style={{ flex:1 }}>
                      <h3 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:"0 0 4px 0" }}>
                        Dr. {selectedDoctor.name}
                      </h3>
                      <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 8px 0" }}>
                        {selectedDoctor.specialization}
                      </p>
                      <div style={{ display:"flex", gap:16, fontSize:"0.9rem", color:SLATE }}>
                        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <FaStar style={{ color:"#F59E0B" }} />
                          4.8 Rating
                        </span>
                        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <FaIndianRupeeSign />
                          ₹{selectedDoctor.consultationFee || 500}
                        </span>
                        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <FaClock />
                          Mon-Fri, 9AM-5PM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Date and Time */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
                <div>
                  <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => {
                      setFormData({...formData, appointmentDate: e.target.value});
                      setValidationErrors(prev => ({ ...prev, appointmentDate: '' }));
                    }}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      border:validationErrors.appointmentDate ? `1px solid #DC2626` : `1px solid ${BORDER}`,
                      borderRadius:8,
                      fontSize:"0.95rem",
                      outline:"none"
                    }}
                  />
                  {validationErrors.appointmentDate && (
                    <div style={{ color:"#DC2626", fontSize:"0.85rem", marginTop:4 }}>
                      {validationErrors.appointmentDate}
                    </div>
                  )}
                  {formData.appointmentDate && (
                    <div style={{ fontSize:"0.85rem", color:SLATE_L, marginTop:4 }}>
                      {formatDate(formData.appointmentDate)}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                    Appointment Time *
                  </label>
                  <input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => {
                      setFormData({...formData, appointmentTime: e.target.value});
                      setValidationErrors(prev => ({ ...prev, appointmentTime: '' }));
                    }}
                    required
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      border:validationErrors.appointmentTime ? `1px solid #DC2626` : `1px solid ${BORDER}`,
                      borderRadius:8,
                      fontSize:"0.95rem",
                      outline:"none"
                    }}
                  />
                  {validationErrors.appointmentTime && (
                    <div style={{ color:"#DC2626", fontSize:"0.85rem", marginTop:4 }}>
                      {validationErrors.appointmentTime}
                    </div>
                  )}
                  {formData.appointmentTime && (
                    <div style={{ fontSize:"0.85rem", color:SLATE_L, marginTop:4 }}>
                      {formatTime(formData.appointmentTime)}
                    </div>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div style={{ marginBottom:24 }}>
                <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  style={{
                    width:"100%",
                    padding:"12px 16px",
                    border:`1px solid ${BORDER}`,
                    borderRadius:8,
                    fontSize:"0.95rem",
                    outline:"none"
                  }}
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              {/* Emergency Checkbox */}
              <div style={{ marginBottom:24 }}>
                <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.isEmergency}
                    onChange={(e) => setFormData({...formData, isEmergency: e.target.checked})}
                    style={{ cursor:"pointer" }}
                  />
                  <span style={{ fontSize:"0.9rem", color:NAVY2, fontWeight:600 }}>
                    This is an emergency appointment
                  </span>
                </label>
              </div>

              {/* Reason */}
              <div style={{ marginBottom:24 }}>
                <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Reason for Visit *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => {
                    setFormData({...formData, reason: e.target.value});
                    setValidationErrors(prev => ({ ...prev, reason: '' }));
                  }}
                  required
                  rows={4}
                  placeholder="Describe why you need this appointment..."
                  style={{
                    width:"100%",
                    padding:"12px 16px",
                    border:validationErrors.reason ? `1px solid #DC2626` : `1px solid ${BORDER}`,
                    borderRadius:8,
                    fontSize:"0.95rem",
                    outline:"none",
                    resize:"vertical"
                  }}
                />
                {validationErrors.reason && (
                  <div style={{ color:"#DC2626", fontSize:"0.85rem", marginTop:4 }}>
                    {validationErrors.reason}
                  </div>
                )}
                <div style={{ fontSize:"0.8rem", color:SLATE_L, marginTop:4 }}>
                  {formData.reason.length}/500 characters
                </div>
              </div>

              {/* Symptoms */}
              <div style={{ marginBottom:24 }}>
                <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Symptoms
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  rows={3}
                  placeholder="Describe your symptoms..."
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

              {/* Medical Reports Upload */}
              <div style={{ marginBottom:32 }}>
                <label style={{ display:"block", fontSize:"0.9rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Upload Previous Medical Reports (Optional)
                </label>
                <div
                  ref={fileInputRef}
                  style={{
                    border:dragActive ? `2px dashed ${RED}` : `2px dashed ${BORDER}`,
                    borderRadius:8,
                    padding:"32px",
                    textAlign:"center",
                    cursor:"pointer",
                    background:dragActive ? SMOKE : WHITE,
                    transition:"all 0.2s"
                  }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    style={{ display:"none" }}
                  />
                  <FaUpload style={{ fontSize:32, color:dragActive ? RED : SLATE_L, marginBottom:8 }} />
                  <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:0 }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{ fontSize:"0.8rem", color:SLATE, margin:"4px 0 0 0" }}>
                    PDF, JPG, PNG up to 10MB
                  </p>
                </div>
                
                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div style={{ marginTop:16 }}>
                    <p style={{ fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                      Uploaded Files ({uploadedFiles.length})
                    </p>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} style={{
                          display:"flex",
                          alignItems:"center",
                          gap:12,
                          padding:"12px",
                          background:SMOKE,
                          borderRadius:6,
                          border:`1px solid ${BORDER}`
                        }}>
                          <div style={{
                            width:40,
                            height:40,
                            borderRadius:6,
                            background:WHITE,
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center"
                          }}>
                            {file.type === 'application/pdf' ? (
                              <FaFilePdf style={{ fontSize:20, color:"#DC2626" }} />
                            ) : (
                              <FaFileImage style={{ fontSize:20, color:"#2563EB" }} />
                            )}
                          </div>
                          <div style={{ flex:1 }}>
                            <p style={{ fontSize:"0.9rem", fontWeight:500, color:NAVY2, margin:0 }}>
                              {file.name}
                            </p>
                            <p style={{ fontSize:"0.8rem", color:SLATE_L, margin:0 }}>
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            style={{
                              background:"none",
                              border:"none",
                              color:SLATE_L,
                              cursor:"pointer",
                              padding:8,
                              borderRadius:4,
                              transition:"all 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = RED}
                            onMouseLeave={e => e.currentTarget.style.color = SLATE_L}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display:"flex", gap:16 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex:1,
                    background:RED,
                    color:WHITE,
                    border:"none",
                    padding:"14px 24px",
                    borderRadius:8,
                    fontSize:"1rem",
                    fontWeight:600,
                    cursor:loading ? "not-allowed" : "pointer",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    gap:8,
                    transition:"all 0.2s"
                  }}
                  onMouseEnter={e => {
                    if (!loading) e.currentTarget.style.background = RED_DK;
                  }}
                  onMouseLeave={e => {
                    if (!loading) e.currentTarget.style.background = RED;
                  }}
                >
                  {loading ? <><FaSpinner style={{ animation:"spin 1s linear infinite" }} /> Processing...</> : (
                    <>
                      <FaCheck /> Review Appointment
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  style={{
                    flex:1,
                    background:WHITE,
                    color:NAVY2,
                    border:`1px solid ${BORDER}`,
                    padding:"14px 24px",
                    borderRadius:8,
                    fontSize:"1rem",
                    fontWeight:600,
                    cursor:loading ? "not-allowed" : "pointer",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    gap:8,
                    transition:"all 0.2s"
                  }}
                  onMouseEnter={e => {
                    if (!loading) e.currentTarget.style.background = SMOKE;
                  }}
                  onMouseLeave={e => {
                    if (!loading) e.currentTarget.style.background = WHITE;
                  }}
                >
                  <FaXmark /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Appointment Summary Modal */}
      {showSummaryModal && (
        <div 
          onClick={() => setShowSummaryModal(false)}
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
            <h2 style={{
              fontSize:'1.5rem',
              fontWeight:700,
              color:NAVY2,
              margin:'0 0 24px'
            }}>
              Review Appointment Details
            </h2>
            
            <div style={{ marginBottom:24 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:600, color:NAVY2, marginBottom:12 }}>Hospital Information</h3>
              <div style={{ background:SMOKE, padding:16, borderRadius:8 }}>
                <p style={{ margin:'0 0 8px 0', color:NAVY2, fontWeight:600 }}>
                  {formData.hospitalName}
                </p>
                <p style={{ margin:0, fontSize:'0.9rem', color:SLATE }}>
                  {selectedHospital?.city}, {selectedHospital?.state}
                </p>
              </div>
            </div>
            
            {formData.doctorName && (
              <div style={{ marginBottom:24 }}>
                <h3 style={{ fontSize:'1rem', fontWeight:600, color:NAVY2, marginBottom:12 }}>Doctor Information</h3>
                <div style={{ background:SMOKE, padding:16, borderRadius:8 }}>
                  <p style={{ margin:'0 0 8px 0', color:NAVY2, fontWeight:600 }}>
                    Dr. {formData.doctorName}
                  </p>
                  <p style={{ margin:0, fontSize:'0.9rem', color:SLATE }}>
                    {formData.speciality}
                  </p>
                </div>
              </div>
            )}
            
            <div style={{ marginBottom:24 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:600, color:NAVY2, marginBottom:12 }}>Appointment Details</h3>
              <div style={{ background:SMOKE, padding:16, borderRadius:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ color:SLATE }}>Date:</span>
                  <span style={{ fontWeight:600, color:NAVY2 }}>{formatDate(formData.appointmentDate)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ color:SLATE }}>Time:</span>
                  <span style={{ fontWeight:600, color:NAVY2 }}>{formatTime(formData.appointmentTime)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ color:SLATE }}>Speciality:</span>
                  <span style={{ fontWeight:600, color:NAVY2 }}>{formData.speciality}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:SLATE }}>Priority:</span>
                  <span style={{ 
                    fontWeight:600, 
                    color:formData.isEmergency ? '#DC2626' : NAVY2 
                  }}>
                    {formData.isEmergency ? 'Emergency' : formData.priority}
                  </span>
                </div>
              </div>
            </div>
            
            {formData.reason && (
              <div style={{ marginBottom:24 }}>
                <h3 style={{ fontSize:'1rem', fontWeight:600, color:NAVY2, marginBottom:12 }}>Reason for Visit</h3>
                <div style={{ background:SMOKE, padding:16, borderRadius:8 }}>
                  <p style={{ margin:0, fontSize:'0.9rem', color:SLATE }}>
                    {formData.reason}
                  </p>
                </div>
              </div>
            )}
            
            {uploadedFiles.length > 0 && (
              <div style={{ marginBottom:24 }}>
                <h3 style={{ fontSize:'1rem', fontWeight:600, color:NAVY2, marginBottom:12 }}>
                  Medical Reports ({uploadedFiles.length})
                </h3>
                <div style={{ background:SMOKE, padding:16, borderRadius:8 }}>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} style={{ fontSize:'0.9rem', color:SLATE, marginBottom:4 }}>
                      • {file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ display:'flex', gap:12 }}>
              <button
                onClick={() => setShowSummaryModal(false)}
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
                Edit
              </button>
              <button
                onClick={confirmAppointment}
                style={{
                  flex:1,
                  background:RED,
                  color:WHITE,
                  border:'none',
                  padding:'12px 24px',
                  borderRadius:8,
                  fontSize:'1rem',
                  fontWeight:600,
                  cursor:'pointer'
                }}
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          onClick={handleSuccessModalClose}
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
              maxWidth:'400px',
              width:'90%',
              textAlign:'center',
              boxShadow:'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
            <div style={{
              width:'64px',
              height:'64px',
              borderRadius:'50%',
              background:'rgba(34, 197, 94, 0.1)',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              margin:'0 auto 16px'
            }}>
              <FaCheck style={{ fontSize:'32px', color:'#22c55e' }} />
            </div>
            <h2 style={{
              fontSize:'24px',
              fontWeight:700,
              color:NAVY2,
              margin:'0 0 12px'
            }}>
              Appointment Booked!
            </h2>
            <p style={{
              fontSize:'16px',
              color:SLATE_L,
              margin:'0 0 24px',
              lineHeight:'1.5'
            }}>
              Your appointment has been booked successfully. You will receive a confirmation email shortly.
            </p>
            <button
              onClick={handleSuccessModalClose}
              style={{
                background:'#22c55e',
                color:WHITE,
                border:'none',
                padding:'12px 32px',
                borderRadius:8,
                fontSize:'16px',
                fontWeight:600,
                cursor:'pointer'
              }}
            >
              View My Appointments
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('style[data-spinner-animation]')) {
  style.setAttribute('data-spinner-animation', 'true');
  document.head.appendChild(style);
}

export default BookAppointment;
