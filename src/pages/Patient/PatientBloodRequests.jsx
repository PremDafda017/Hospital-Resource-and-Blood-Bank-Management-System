import React, { useState, useEffect, useRef } from "react";
import { useAuth as useClerkAuth, useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { bloodBankDatabase, states, citiesByState, getHospitalsByState } from "../../data/hospitalData";
import BloodRequestPayment from "../../components/payment/BloodRequestPayment";
import { generateBloodRequestPDF } from "../../components/pdf/PDFGenerator";
import {
  FaHeartPulse,
  FaPlus,
  FaEye,
  FaPencil,
  FaTrash,
  FaArrowRight,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaFileMedical,
  FaCalendarDays,
  FaMapLocationDot,
  FaBell,
  FaUser,
  FaDroplet,
  FaHouse,
  FaDownload,
  FaCreditCard,
  FaCheckDouble,
  FaCircleCheck,
  FaXmark,
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

const BG_COLOR = {
  "A+": "#16A34A",
  "A-": "#15803D",
  "B+": "#2563EB",
  "B-": "#1D4ED8",
  "AB+": "#7C3AED",
  "AB-": "#6D28D9",
  "O+": RED,
  "O-": RED_DK
};

function PatientBloodRequests() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBloodReadyNotification, setShowBloodReadyNotification] = useState(false);
  const [notificationRequest, setNotificationRequest] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [previousRequests, setPreviousRequests] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const audioRef = useRef(null);

  // Responsive breakpoints
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [formData, setFormData] = useState({
    bloodType: '',
    units: '',
    urgency: 'Normal',
    state: 'All States',
    city: 'All Cities',
    hospitalId: 'All'
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

  const active = "blood-requests";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    if (user?.id) {
      // Load blood requests from MongoDB
      const loadRequests = async () => {
        try {
          const email = user?.emailAddresses?.[0]?.emailAddress;
          const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}?email=${email}`);
          if (response.ok) {
            const data = await response.json();
            setRequests(data.bloodRequests || []);
            setPatientProfile(data.profile || null);
          }
        } catch (error) {
          console.error('Error loading blood requests:', error);
        }
        setLoading(false);
      };
      loadRequests();

      // Auto-refresh every 30 seconds to get status updates
      const interval = setInterval(loadRequests, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user]);

  // Check for blood ready status changes and show notification
  useEffect(() => {
    if (previousRequests.length > 0 && requests.length > 0) {
      requests.forEach(request => {
        const prevRequest = previousRequests.find(r => (r._id || r.id) === (request._id || request.id));
        if (prevRequest && prevRequest.status !== 'Blood Ready' && request.status === 'Blood Ready') {
          setNotificationRequest(request);
          setShowBloodReadyNotification(true);
          
          // Play notification sound
          if (!audioRef.current) {
            audioRef.current = new Audio('/notification.mp3');
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(err => console.log('Audio play error:', err));
          }
        }
      });
    }
    setPreviousRequests([...requests]);
  }, [requests]);

  // Debug: Log when requests state changes
  useEffect(() => {
    console.log('Requests state updated:', requests);
    console.log('Requests length:', requests.length);
  }, [requests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      // Validate required fields
      if (!formData.bloodType || !formData.units) {
        setModalError('Please fill in all required fields');
        setModalLoading(false);
        return;
      }

      // Validate state, city, and hospital selection
      if (formData.state === 'All States' || formData.city === 'All Cities' || formData.hospitalId === 'All') {
        setModalError('Please select state, city, and hospital');
        setModalLoading(false);
        return;
      }

      // Get hospital details
      console.log('Hospital ID:', formData.hospitalId);
      const hospital = bloodBankDatabase.find(h => h.id === parseInt(formData.hospitalId));
      console.log('Hospital found:', hospital);
      
      // Create new request
      const newRequest = {
        id: Date.now(),
        bloodGroup: formData.bloodType,
        units: parseInt(formData.units),
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        hospital: hospital ? hospital.name : 'Unknown Hospital',
        state: formData.state,
        city: formData.city,
        urgency: formData.urgency,
        reason: 'Patient Request'
      };
      console.log('New request created:', newRequest);
      console.log('State being sent:', formData.state);
      console.log('City being sent:', formData.city);

      // Add to MongoDB
      try {
        console.log('User ID:', user?.id);
        console.log('User email:', user?.emailAddresses?.[0]?.emailAddress);
        console.log('Request data:', newRequest);
        
        const email = user?.emailAddresses?.[0]?.emailAddress;
        const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}/blood-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ request: newRequest, email }),
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to add blood request');
        }
        
        console.log('Blood request saved to MongoDB successfully');

        // Show success notification
        showNotification({
          type: 'success',
          title: 'Blood Request Submitted',
          message: `${formData.units} units of ${formData.bloodType} blood requested successfully`,
          duration: 5000,
          playSound: true
        });

        // Reload blood requests from MongoDB to get updated list
        const userEmail = user?.emailAddresses?.[0]?.emailAddress;
        console.log('Reloading blood requests from MongoDB...');
        const reloadResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}?email=${userEmail}`);
        console.log('Reload response status:', reloadResponse.status);
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json();
          console.log('Reloaded data:', reloadData);
          setRequests(reloadData.bloodRequests || []);
          console.log('Updated requests state:', reloadData.bloodRequests || []);
          console.log('Current requests state after set:', reloadData.bloodRequests || []);
        } else {
          console.error('Failed to reload blood requests');
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
        showNotification({
          type: 'error',
          title: 'Submission Failed',
          message: 'Failed to save to database. Please try again.',
          duration: 4000,
          playSound: true
        });
        setModalError('Failed to save to database. Please try again.');
        setModalLoading(false);
        return;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Close modal and reset form
      setShowCreateModal(false);
      setFormData({
        bloodType: '',
        units: '',
        urgency: 'Normal',
        state: 'All States',
        city: 'All Cities',
        hospitalId: 'All'
      });
      setModalLoading(false);
    } catch (err) {
      console.error('Error creating request:', err);
      setModalError('Failed to create request. Please try again.');
      setModalLoading(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleView = (request) => {
    console.log('Viewing request:', request);
    console.log('Request state:', request.state);
    console.log('Request city:', request.city);
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setFormData({
      bloodType: request.bloodGroup,
      units: request.units,
      urgency: request.urgency,
      state: 'All States',
      city: 'All Cities',
      hospitalId: 'All'
    });
    setShowEditModal(true);
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this blood request?')) {
      // Delete from MongoDB
      try {
        const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}/blood-requests/${requestId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Remove from local state immediately
          setRequests(requests.filter(r => (r._id || r.id) !== requestId));
          
          // Also reload from server to ensure consistency
          const email = user?.emailAddresses?.[0]?.emailAddress;
          const reloadResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}?email=${email}`);
          if (reloadResponse.ok) {
            const reloadData = await reloadResponse.json();
            setRequests(reloadData.bloodRequests || []);
          }
        } else {
          const errorData = await response.json();
          console.error('Delete error:', errorData);
          alert(errorData.message || 'Failed to delete request. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('Failed to delete request. Please try again.');
      }
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/reports/${reportId}/pdf`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BloodIssueReport_${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  const handlePayment = (request) => {
    setSelectedRequest(request);
    setShowPaymentModal(true);
  };

  const handleBloodReadyNotificationClose = () => {
    setShowBloodReadyNotification(false);
    setNotificationRequest(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  const handlePayNow = () => {
    if (notificationRequest) {
      handlePayment(notificationRequest);
      handleBloodReadyNotificationClose();
    }
  };

  const handlePaymentSuccess = async (updatedRequest) => {
    // Update the request in local state using _id
    setRequests(requests.map(r => r._id === updatedRequest._id ? updatedRequest : r));
    setShowPaymentModal(false);
    
    // Show payment success notification
    showNotification({
      type: 'success',
      title: 'Payment Successful',
      message: `Payment of ₹${updatedRequest.paymentAmount || 0} completed successfully for blood request #${updatedRequest.requestNumber}`,
      duration: 5000,
      playSound: true
    });

    // Prepare receipt data
    const receipt = {
      patientInfo: {
        fullName: patientProfile?.fullName || user?.fullName || 'N/A',
        phone: patientProfile?.phone || 'N/A',
        dateOfBirth: patientProfile?.dateOfBirth || 'N/A',
        email: user?.emailAddresses?.[0]?.emailAddress || 'N/A',
        gender: patientProfile?.gender || 'N/A'
      },
      requestDetails: {
        requestId: updatedRequest.requestNumber || updatedRequest._id,
        date: updatedRequest.createdAt || new Date().toISOString(),
        status: updatedRequest.status
      },
      bloodInfo: {
        bloodGroup: updatedRequest.bloodGroup,
        units: updatedRequest.units,
        urgency: updatedRequest.urgency
      },
      hospitalInfo: {
        hospital: updatedRequest.hospitalName || updatedRequest.hospital || 'N/A',
        bloodBank: updatedRequest.bloodBankName || 'N/A'
      },
      paymentInfo: {
        paymentStatus: updatedRequest.paymentStatus || 'Paid',
        amountPaid: updatedRequest.paymentAmount || 0,
        delivery: updatedRequest.homeDelivery ? 'Home Delivery' : 'Hospital Pickup',
        deliveryAddress: updatedRequest.homeDelivery ? updatedRequest.deliveryAddress : 'N/A'
      }
    };

    setReceiptData(receipt);
    setShowReceiptModal(true);
    setSelectedRequest(null);

    // Store report in MongoDB
    try {
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const reportData = {
        id: Date.now(),
        title: `Blood Request Receipt - ${updatedRequest.bloodGroup}`,
        date: new Date().toISOString(),
        description: `Payment receipt for blood request #${updatedRequest.requestNumber}`,
        fileUrl: '',
        bloodGroup: updatedRequest.bloodGroup,
        units: updatedRequest.units,
        hospital: updatedRequest.hospitalName || updatedRequest.hospital,
        amount: updatedRequest.paymentAmount || 0,
        requestId: updatedRequest._id
      };

      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ report: reportData, email }),
      });

      if (response.ok) {
        showNotification({
          type: 'success',
          title: 'Report Saved',
          message: 'Your blood request receipt has been saved to My Reports',
          duration: 4000,
          playSound: true
        });
      }
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
  };

  const handleDownloadReceipt = (request) => {
    generateBloodRequestPDF(request, user);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      // Validate required fields
      if (!formData.bloodType || !formData.units) {
        setModalError('Please fill in all required fields');
        setModalLoading(false);
        return;
      }

      // Get hospital details if selected
      const hospital = formData.hospitalId !== 'All' 
        ? bloodBankDatabase.find(h => h.id === parseInt(formData.hospitalId))
        : null;
      
      // Update request
      const updatedRequest = {
        ...selectedRequest,
        bloodGroup: formData.bloodType,
        units: parseInt(formData.units),
        urgency: formData.urgency,
        hospital: hospital ? hospital.name : selectedRequest.hospital,
      };

      // Update in MongoDB
      try {
        const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}/blood-requests/${selectedRequest.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ request: updatedRequest }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update blood request');
        }
        
        // Update local state
        setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
        
        // Reload blood requests from MongoDB to get updated list
        const email = user?.emailAddresses?.[0]?.emailAddress;
        const reloadResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}?email=${email}`);
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json();
          setRequests(reloadData.bloodRequests || []);
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
        setModalError('Failed to update request. Please try again.');
        setModalLoading(false);
        return;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Close modal and reset form
      setShowEditModal(false);
      setSelectedRequest(null);
      setFormData({
        bloodType: '',
        units: '',
        urgency: 'Normal',
        state: 'All States',
        city: 'All Cities',
        hospitalId: 'All'
      });
      setModalLoading(false);
    } catch (err) {
      console.error('Error updating request:', err);
      setModalError('Failed to update request. Please try again.');
      setModalLoading(false);
    }
  };

  const BloodBadge = ({ group }) => (
    <span style={{
      padding: "4px 10px",
      borderRadius: 6,
      background: `${BG_COLOR[group] || RED}15`,
      color: BG_COLOR[group] || RED,
      fontSize: "0.75rem",
      fontWeight: 700,
    }}>
      {group}
    </span>
  );

  const StatusPill = ({ status }) => {
    const colors = {
      "Pending": "#F59E0B",
      "Under Verification": "#4F46E5",
      "Forwarded": "#2563EB",
      "Blood Ready": "#16A34A",
      "Rejected": "#DC2626",
      "Completed": "#16A34A",
      "In Progress": "#2563EB",
      "Cancelled": "#DC2626",
      "Urgent": "#DC2626",
    };
    return (
      <span style={{
        padding: "4px 10px",
        borderRadius: 6,
        background: `${colors[status] || "#64748B"}15`,
        color: colors[status] || "#64748B",
        fontSize: "0.75rem",
        fontWeight: 600,
      }}>
        {status}
      </span>
    );
  };

  const UrgencyBadge = ({ urgency }) => {
    const colors = {
      "Normal": "#16A34A",
      "Urgent": "#F59E0B",
      "Critical": "#DC2626",
    };
    return (
      <span style={{
        padding: "4px 10px",
        borderRadius: 6,
        background: `${colors[urgency] || "#64748B"}15`,
        color: colors[urgency] || "#64748B",
        fontSize: "0.75rem",
        fontWeight: 600,
      }}>
        {urgency}
      </span>
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading your blood requests...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", width:"100vw" }}>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 999
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? (mobileMenuOpen ? 260 : 0) : w,
        background:SIDEBAR_COL, color:WHITE,
        display:"flex", flexDirection:"column", transition:"width 0.3s ease",
        position: isMobile ? "fixed" : "fixed", height:"100vh", zIndex:1000,
        overflowX: "hidden"
      }}>
        <div style={{
          padding: isMobile ? "0 20px" : (sidebarCollapsed ? "0 16px" : "0 24px"),
          height:64, display:"flex", alignItems:"center", justifyContent:"space-between",
          borderBottom:"1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            color:WHITE, fontWeight:700, fontSize: isMobile ? "1rem" : "1.1rem"
          }}>
            <FaDroplet style={{ color:RED, fontSize: isMobile ? "1.2rem" : "1.4rem" }} />
            {(!sidebarCollapsed || isMobile) && <span>Patient Portal</span>}
          </div>
          {!isMobile && (
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
              background:"none", border:"none", color:WHITE,
              cursor:"pointer", padding:4, borderRadius:4
            }}>
              <FaBars />
            </button>
          )}
          {isMobile && (
            <button onClick={() => setMobileMenuOpen(false)} style={{
              background:"none", border:"none", color:WHITE,
              cursor:"pointer", padding:4, borderRadius:4
            }}>
              <FaXmark />
            </button>
          )}
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
      <main style={{ marginLeft: isMobile ? 0 : w, flex:1, minHeight:"100vh", background:SMOKE, overflowX:"hidden" }}>
        <div style={{ padding: isMobile ? "16px" : "24px 32px", maxWidth:"100%", overflowX:"hidden" }}>
          {/* Mobile Header */}
          {isMobile && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  padding: "10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FaBars style={{ fontSize: "1.2rem", color: NAVY2 }} />
              </button>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: NAVY2,
                fontWeight: 700,
                fontSize: "1rem"
              }}>
                <FaDroplet style={{ color: RED, fontSize: "1.2rem" }} />
                <span>HRBMS</span>
              </div>
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom: isMobile ? 24 : 32, display:"flex", justifyContent:"space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 16 : 0 }}>
            <div>
              <h1 style={{ fontSize: isMobile ? "1.5rem" : "1.8rem", fontWeight:800, color:NAVY2, margin:"0 0 8px 0" }}>
                My Blood Requests
              </h1>
              <p style={{ color:SLATE_L, fontSize: isMobile ? "0.9rem" : "1rem", margin:0 }}>
                Manage your blood requests
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background:RED,
                color:WHITE,
                border:"none",
                padding: isMobile ? "12px 20px" : "12px 24px",
                borderRadius:8,
                fontSize: isMobile ? "0.9rem" : "0.95rem",
                fontWeight:600,
                cursor:"pointer",
                display:"flex",
                alignItems:"center",
                gap:8,
                width: isMobile ? "100%" : "auto",
                justifyContent: "center"
              }}
            >
              <FaPlus /> Create Request
            </button>
          </div>

          {/* Content */}
          <div style={{ padding:"0", width:"100%", overflowX:"hidden" }}>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 16 : 20, marginBottom:32 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding: isMobile ? "16px" : "20px", display:"flex", alignItems:"center", gap: isMobile ? 12 : 16 }}
            >
              <div style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius:12, background:`${RED}15`, display:"flex", alignItems:"center", justifyContent:"center", color:RED, fontSize: isMobile ? "1.1rem" : "1.3rem" }}>
                <FaHeartPulse />
              </div>
              <div>
                <div style={{ fontSize: isMobile ? "1.5rem" : "1.8rem", fontWeight:800, color:NAVY2, lineHeight:1 }}>{requests.length}</div>
                <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:500 }}>Total Requests</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding: isMobile ? "16px" : "20px", display:"flex", alignItems:"center", gap: isMobile ? 12 : 16 }}
            >
              <div style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius:12, background:`${"#16A34A"}15`, display:"flex", alignItems:"center", justifyContent:"center", color:"#16A34A", fontSize: isMobile ? "1.1rem" : "1.3rem" }}>
                <FaDroplet />
              </div>
              <div>
                <div style={{ fontSize: isMobile ? "1.5rem" : "1.8rem", fontWeight:800, color:NAVY2, lineHeight:1 }}>{requests.filter(r => r.status === "Completed").length}</div>
                <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:500 }}>Completed</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding: isMobile ? "16px" : "20px", display:"flex", alignItems:"center", gap: isMobile ? 12 : 16 }}
            >
              <div style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius:12, background:`${"#F59E0B"}15`, display:"flex", alignItems:"center", justifyContent:"center", color:"#F59E0B", fontSize: isMobile ? "1.1rem" : "1.3rem" }}>
                <FaDroplet />
              </div>
              <div>
                <div style={{ fontSize: isMobile ? "1.5rem" : "1.8rem", fontWeight:800, color:NAVY2, lineHeight:1 }}>{requests.filter(r => r.status === "Pending" || r.status === "Under Verification" || r.status === "Forwarded").length}</div>
                <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:500 }}>In Progress</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding: isMobile ? "16px" : "20px", display:"flex", alignItems:"center", gap: isMobile ? 12 : 16 }}
            >
              <div style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius:12, background:`${"#2563EB"}15`, display:"flex", alignItems:"center", justifyContent:"center", color:"#2563EB", fontSize: isMobile ? "1.1rem" : "1.3rem" }}>
                <FaDroplet />
              </div>
              <div>
                <div style={{ fontSize: isMobile ? "1.5rem" : "1.8rem", fontWeight:800, color:NAVY2, lineHeight:1 }}>{requests.reduce((sum, r) => sum + r.units, 0)}</div>
                <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color:SLATE_L, fontWeight:500 }}>Total Units</div>
              </div>
            </motion.div>
          </div>

          {/* Requests Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}
          >
            <div style={{ padding: isMobile ? "16px 20px" : "20px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>All Requests</h2>
            </div>
            {requests.length === 0 ? (
              <div style={{ textAlign:"center", padding: isMobile ? "40px 20px" : "60px 20px", color:SLATE_L }}>
                <FaHeartPulse style={{ fontSize: isMobile ? "2.5rem" : "3rem", marginBottom:16, opacity:0.3 }} />
                <p style={{ fontSize: isMobile ? "0.9rem" : "1rem", marginBottom:16 }}>No blood requests yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    background:RED,
                    color:WHITE,
                    border:"none",
                    borderRadius:8,
                    padding: isMobile ? "12px 20px" : "12px 24px",
                    fontSize: isMobile ? "0.85rem" : "0.9rem",
                    fontWeight:600,
                    cursor:"pointer",
                  }}
                >
                  <FaPlus style={{ marginRight:8 }} /> Create First Request
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                {isMobile ? (
                  <div style={{ padding: isMobile ? "16px" : "20px" }}>
                    {requests.map((request) => (
                      <motion.div
                        key={request._id || request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: SMOKE,
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 16,
                          border: `1px solid ${BORDER}`
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <BloodBadge group={request.bloodGroup} />
                            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: NAVY2 }}>#{request.requestNumber || request.id}</span>
                          </div>
                          <StatusPill status={request.status} />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: 4 }}>Hospital</div>
                          <div style={{ fontSize: "0.9rem", color: NAVY2, fontWeight: 500 }}>{request.hospitalName || request.hospital}</div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: "0.8rem", color: SLATE_L, marginBottom: 4 }}>Units</div>
                            <div style={{ fontSize: "0.9rem", color: NAVY2, fontWeight: 600 }}>{request.units}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.8rem", color: SLATE_L, marginBottom: 4 }}>Urgency</div>
                            <UrgencyBadge urgency={request.urgency} />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.8rem", color: SLATE_L, marginBottom: 4 }}>Date</div>
                            <div style={{ fontSize: "0.85rem", color: NAVY2 }}>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : request.date}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.8rem", color: SLATE_L, marginBottom: 4 }}>Payment</div>
                            {request.paymentStatus === 'Paid' ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#16A34A", fontWeight: 600, fontSize: "0.85rem" }}>
                                <FaCheckDouble /> Paid
                              </div>
                            ) : (
                              <span style={{ color: SLATE_L, fontSize: "0.85rem" }}>Unpaid</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button 
                            onClick={() => handleView(request)}
                            style={{ flex: 1, padding: "10px", borderRadius: 6, border: `1px solid ${BORDER}`, background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "0.85rem", fontWeight: 500, color: NAVY2 }}
                          >
                            <FaEye /> View
                          </button>
                          {(request.status === "Pending" || (request.status === "Blood Ready" && request.paymentStatus !== "Paid")) && (
                            <button 
                              onClick={() => handlePayment(request)}
                              style={{ flex: 1, padding: "10px", borderRadius: 6, border: "none", background: RED, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "0.85rem", fontWeight: 500, color: WHITE }}
                            >
                              <FaCreditCard /> Pay
                            </button>
                          )}
                          <button 
                            onClick={() => handleEdit(request)}
                            style={{ padding: "10px", borderRadius: 6, border: `1px solid ${BORDER}`, background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: SLATE_L }}
                          >
                            <FaPencil />
                          </button>
                          <button 
                            onClick={() => handleDelete(request._id || request.id)}
                            style={{ padding: "10px", borderRadius: 6, border: `1px solid ${BORDER}`, background: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: SLATE_L }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{ overflowX:"auto", width:"100%" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"900px" }}>
                      <thead>
                        <tr style={{ background:SMOKE, borderBottom:`1px solid ${BORDER}` }}>
                          <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Request ID</th>
                          <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Blood Group</th>
                          <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Units</th>
                          <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Hospital</th>
                          <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>State</th>
                          <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>City</th>
                          <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Date</th>
                          <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Completed Date</th>
                          <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Urgency</th>
                          <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Status</th>
                          <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Payment</th>
                          <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request) => (
                          <tr key={request._id || request.id} style={{ borderBottom:`1px solid ${BORDER}`, transition:"background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = SMOKE} onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                            <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2, fontWeight:600 }}>#{request.requestNumber || request.id}</td>
                            <td style={{ padding:"16px 24px" }}><BloodBadge group={request.bloodGroup} /></td>
                            <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{request.units}</td>
                            <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{request.hospitalName || request.hospital}</td>
                            <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{request.state || "-"}</td>
                            <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{request.city || "-"}</td>
                            <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : request.date}</td>
                            <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>
                              {request.status === "Completed" ? (request.completedDate || request.issuedDate || "N/A") : "-"}
                            </td>
                            <td style={{ padding:"16px 24px" }}><UrgencyBadge urgency={request.urgency} /></td>
                            <td style={{ padding:"16px 24px" }}><StatusPill status={request.status} /></td>
                            <td style={{ padding:"16px 24px" }}>
                              {request.paymentStatus === 'Paid' ? (
                                <div style={{ display:"flex", alignItems:"center", gap:4, color:"#16A34A", fontWeight:600 }}>
                                  <FaCheckDouble /> Paid
                                </div>
                              ) : (
                                <span style={{ color:SLATE_L, fontSize:"0.85rem" }}>Unpaid</span>
                              )}
                            </td>
                            <td style={{ padding:"16px 24px" }}>
                          <div style={{ display:"flex", gap:8 }}>
                            <button 
                              onClick={() => handleView(request)}
                              style={{ width:32, height:32, borderRadius:6, border:`1px solid ${BORDER}`, background:WHITE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_L, transition:"all 0.2s" }} 
                              onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.color = NAVY2; }} 
                              onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.color = SLATE_L; }}
                            >
                              <FaEye />
                            </button>
                            {(request.status === "Pending" || (request.status === "Blood Ready" && request.paymentStatus !== "Paid")) && (
                              <button 
                                onClick={() => handlePayment(request)}
                                style={{ width:32, height:32, borderRadius:6, border:`1px solid ${BORDER}`, background:WHITE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_L, transition:"all 0.2s" }} 
                                onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.color = RED; }} 
                                onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.color = SLATE_L; }}
                                title={request.status === "Blood Ready" ? "Pay to collect blood" : "Pay for Delivery"}
                              >
                                <FaCreditCard />
                              </button>
                            )}
                            {request.status === "Completed" && request.reportId && (
                              <button 
                                onClick={() => handleDownloadReport(request.reportId)}
                                style={{ width:32, height:32, borderRadius:6, border:`1px solid ${BORDER}`, background:WHITE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_L, transition:"all 0.2s" }} 
                                onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.color = "#16A34A"; }} 
                                onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.color = SLATE_L; }}
                                title="Download Report"
                              >
                                <FaDownload />
                              </button>
                            )}
                            {request.paymentStatus === "Paid" && (
                              <button 
                                onClick={() => handleDownloadReceipt(request)}
                                style={{ width:32, height:32, borderRadius:6, border:`1px solid ${BORDER}`, background:WHITE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_L, transition:"all 0.2s" }} 
                                onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.color = "#16A34A"; }} 
                                onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.color = SLATE_L; }}
                                title="Download Receipt"
                              >
                                <FaDownload />
                              </button>
                            )}
                            <button 
                              onClick={() => handleEdit(request)}
                              style={{ width:32, height:32, borderRadius:6, border:`1px solid ${BORDER}`, background:WHITE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_L, transition:"all 0.2s" }} 
                              onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.color = NAVY2; }} 
                              onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.color = SLATE_L; }}
                            >
                              <FaPencil />
                            </button>
                            <button 
                              onClick={() => handleDelete(request._id || request.id)}
                              style={{ width:32, height:32, borderRadius:6, border:`1px solid ${BORDER}`, background:WHITE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_L, transition:"all 0.2s" }} 
                              onMouseEnter={e => { e.currentTarget.style.background = `${RED}10`; e.currentTarget.style.color = RED; }} 
                              onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.color = SLATE_L; }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
        </div>

      {/* Create Request Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ background:WHITE, borderRadius:16, width:"100%", maxWidth: isMobile ? "95%" : 600, padding: isMobile ? 24 : 32, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto", margin: isMobile ? 16 : 0 }}
            >
              <h2 style={{ fontSize: isMobile ? "1.2rem" : "1.4rem", fontWeight:800, color:NAVY2, margin:"0 0 24px 0" }}>New Blood Request</h2>
            
            {modalError && (
              <div style={{ background:"#FEE2E2", border:"1px solid #FCA5A5", borderRadius:8, padding:"12px", marginBottom:16, color:"#DC2626", fontSize:"0.9rem" }}>
                {modalError}
              </div>
            )}

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div>
                  <label style={{ display:"block", fontSize: isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Blood Type *</label>
                  <select 
                    value={formData.bloodType} 
                    onChange={(e) => setFormData({...formData, bloodType: e.target.value})} 
                    required
                    style={{ width:"100%", padding: isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize: isMobile ? "0.85rem" : "0.9rem", color:NAVY2, background:WHITE }}
                  >
                    <option value="">Select Blood Type</option>
                    {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", fontSize: isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Units Required *</label>
                  <input 
                    type="number" 
                    value={formData.units} 
                    onChange={(e) => setFormData({...formData, units: e.target.value})} 
                    required 
                    min="1"
                    style={{ width:"100%", padding: isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize: isMobile ? "0.85rem" : "0.9rem", color:NAVY2, background:WHITE }}
                  />
                </div>
                <div>
                  <label style={{ display:"block", fontSize: isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Urgency *</label>
                  <select 
                    value={formData.urgency} 
                    onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                    style={{ width:"100%", padding: isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize: isMobile ? "0.85rem" : "0.9rem", color:NAVY2, background:WHITE }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", fontSize: isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>State *</label>
                  <select 
                    value={formData.state} 
                    onChange={(e) => {
                      setFormData({...formData, state: e.target.value, city: 'All Cities', hospitalId: 'All'});
                    }}
                    required
                    style={{ width:"100%", padding: isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize: isMobile ? "0.85rem" : "0.9rem", color:NAVY2, background:WHITE }}
                  >
                    <option value="All States">Select State</option>
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
                {formData.state !== 'All States' && (
                  <div>
                    <label style={{ display:"block", fontSize: isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>City *</label>
                    <select 
                      value={formData.city} 
                      onChange={(e) => {
                        setFormData({...formData, city: e.target.value, hospitalId: 'All'});
                      }}
                      required
                      style={{ width:"100%", padding: isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize: isMobile ? "0.85rem" : "0.9rem", color:NAVY2, background:WHITE }}
                    >
                      <option value="All Cities">Select City</option>
                      {citiesByState[formData.state]?.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                )}
                {formData.state !== 'All States' && formData.city !== 'All Cities' && (
                  <div>
                    <label style={{ display:"block", fontSize: isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Hospital *</label>
                    <select 
                      value={formData.hospitalId} 
                      onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                      required
                      style={{ width:"100%", padding: isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize: isMobile ? "0.85rem" : "0.9rem", color:NAVY2, background:WHITE }}
                    >
                      <option value="All">Select Hospital</option>
                      {getHospitalsByState(formData.state).filter(h => h.city === formData.city).map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div style={{ display:"flex", gap:12, marginTop:8 }}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({
                        bloodType: '',
                        units: '',
                        urgency: 'Normal',
                        state: 'All States',
                        city: 'All Cities',
                        hospitalId: 'All'
                      });
                      setModalError('');
                    }} 
                    style={{ flex:1, padding: isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, background:WHITE, color:NAVY2, fontSize: isMobile ? "0.85rem" : "0.9rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s" }} 
                    onMouseEnter={e => e.currentTarget.style.background = SMOKE} 
                    onMouseLeave={e => e.currentTarget.style.background = WHITE}
                    disabled={modalLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{ flex:1, padding: isMobile ? "10px" : "12px", borderRadius:8, border:"none", background:RED, color:WHITE, fontSize: isMobile ? "0.85rem" : "0.9rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s" }} 
                    onMouseEnter={e => e.currentTarget.style.background = RED_DK} 
                    onMouseLeave={e => e.currentTarget.style.background = RED}
                    disabled={modalLoading}
                  >
                    {modalLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Request Modal */}
      <AnimatePresence>
        {showViewModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ background:WHITE, borderRadius:16, width:"100%", maxWidth: isMobile ? "95%" : 500, padding: isMobile ? 24 : 32, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", margin: isMobile ? 16 : 0 }}
            >
            <h2 style={{ fontSize:"1.4rem", fontWeight:800, color:NAVY2, margin:"0 0 24px 0" }}>Blood Request Details</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px", background:SMOKE, borderRadius:8 }}>
                <span style={{ fontSize:"0.85rem", color:SLATE_L }}>Request ID</span>
                <span style={{ fontSize:"0.9rem", fontWeight:600, color:NAVY2 }}>#{selectedRequest.requestNumber || selectedRequest._id || selectedRequest.id}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px", background:SMOKE, borderRadius:8 }}>
                <span style={{ fontSize:"0.85rem", color:SLATE_L }}>Blood Group</span>
                <BloodBadge group={selectedRequest.bloodGroup} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px", background:SMOKE, borderRadius:8 }}>
                <span style={{ fontSize:"0.85rem", color:SLATE_L }}>Units</span>
                <span style={{ fontSize:"0.9rem", fontWeight:600, color:NAVY2 }}>{selectedRequest.units}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px", background:SMOKE, borderRadius:8 }}>
                <span style={{ fontSize:"0.85rem", color:SLATE_L }}>Hospital</span>
                <span style={{ fontSize:"0.9rem", fontWeight:600, color:NAVY2 }}>{selectedRequest.hospitalName || selectedRequest.hospital}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px", background:SMOKE, borderRadius:8 }}>
                <span style={{ fontSize:"0.85rem", color:SLATE_L }}>State</span>
                <span style={{ fontSize:"0.9rem", fontWeight:600, color:NAVY2 }}>{selectedRequest.state || "-"}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px", background:SMOKE, borderRadius:8 }}>
                <span style={{ fontSize:"0.85rem", color:SLATE_L }}>City</span>
                <span style={{ fontSize:"0.9rem", fontWeight:600, color:NAVY2 }}>{selectedRequest.city || "-"}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px", background:SMOKE, borderRadius:8 }}>
                <span style={{ fontSize:"0.85rem", color:SLATE_L }}>Date</span>
                <span style={{ fontSize:"0.9rem", fontWeight:600, color:NAVY2 }}>{selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString() : selectedRequest.date}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px", background:SMOKE, borderRadius:8 }}>
                <span style={{ fontSize:"0.85rem", color:SLATE_L }}>Urgency</span>
                <UrgencyBadge urgency={selectedRequest.urgency} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px", background:SMOKE, borderRadius:8 }}>
                <span style={{ fontSize:"0.85rem", color:SLATE_L }}>Status</span>
                <StatusPill status={selectedRequest.status} />
              </div>
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRequest(null);
                }}
                style={{ width:"100%", padding: isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, background:WHITE, color:NAVY2, fontSize: isMobile ? "0.85rem" : "0.9rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s" }} 
                onMouseEnter={e => e.currentTarget.style.background = SMOKE} 
                onMouseLeave={e => e.currentTarget.style.background = WHITE}
              >
                Close
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Request Modal */}
      <AnimatePresence>
        {showEditModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ background:WHITE, borderRadius:16, width:"100%", maxWidth: isMobile ? "95%" : 600, padding: isMobile ? 24 : 32, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto", margin: isMobile ? 16 : 0 }}
            >
              <h2 style={{ fontSize: isMobile ? "1.2rem" : "1.4rem", fontWeight:800, color:NAVY2, margin:"0 0 24px 0" }}>Edit Blood Request</h2>
            
            {modalError && (
              <div style={{ background:"#FEE2E2", border:"1px solid #FCA5A5", borderRadius:8, padding:"12px", marginBottom:16, color:"#DC2626", fontSize:"0.9rem" }}>
                {modalError}
              </div>
            )}

              <form onSubmit={handleEditSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Blood Type *</label>
                <select 
                  value={formData.bloodType} 
                  onChange={(e) => setFormData({...formData, bloodType: e.target.value})} 
                  required
                  style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                >
                  {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Units Required *</label>
                <input 
                  type="number" 
                  value={formData.units} 
                  onChange={(e) => setFormData({...formData, units: e.target.value})} 
                  required 
                  min="1"
                  style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                />
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Urgency *</label>
                <select 
                  value={formData.urgency} 
                  onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>State (Optional)</label>
                <select 
                  value={formData.state} 
                  onChange={(e) => {
                    setFormData({...formData, state: e.target.value, city: 'All Cities', hospitalId: 'All'});
                  }}
                  style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                >
                  <option value="All States">Select State</option>
                  {states.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              {formData.state !== 'All States' && (
                <div>
                  <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>City (Optional)</label>
                  <select 
                    value={formData.city} 
                    onChange={(e) => {
                      setFormData({...formData, city: e.target.value, hospitalId: 'All'});
                    }}
                    style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                  >
                    <option value="All Cities">Select City</option>
                    {citiesByState[formData.state]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              )}
              {formData.state !== 'All States' && formData.city !== 'All Cities' && (
                <div>
                  <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Hospital (Optional)</label>
                  <select 
                    value={formData.hospitalId} 
                    onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                    style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                  >
                    <option value="All">Select Hospital</option>
                    {getHospitalsByState(formData.state).filter(h => h.city === formData.city).map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display:"flex", gap:12, marginTop:8 }}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedRequest(null);
                      setFormData({
                        bloodType: '',
                        units: '',
                        urgency: 'Normal',
                        state: 'All States',
                        city: 'All Cities',
                        hospitalId: 'All'
                      });
                      setModalError('');
                    }} 
                    style={{ flex:1, padding: isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, background:WHITE, color:NAVY2, fontSize: isMobile ? "0.85rem" : "0.9rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s" }} 
                    onMouseEnter={e => e.currentTarget.style.background = SMOKE} 
                    onMouseLeave={e => e.currentTarget.style.background = WHITE}
                    disabled={modalLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{ flex:1, padding: isMobile ? "10px" : "12px", borderRadius:8, border:"none", background:RED, color:WHITE, fontSize: isMobile ? "0.85rem" : "0.9rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s" }} 
                    onMouseEnter={e => e.currentTarget.style.background = RED_DK} 
                    onMouseLeave={e => e.currentTarget.style.background = RED}
                    disabled={modalLoading}
                  >
                    {modalLoading ? 'Updating...' : 'Update Request'}
                  </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blood Ready Notification Modal */}
      <AnimatePresence>
        {showBloodReadyNotification && notificationRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ background:WHITE, borderRadius:16, width:"100%", maxWidth: isMobile ? "95%" : 450, padding: isMobile ? 24 : 32, boxShadow:"0 20px 60px rgba(0,0,0,0.3)", textAlign:"center", margin: isMobile ? 16 : 0 }}
            >
            <div style={{ width:80, height:80, borderRadius:"50%", background:`${RED}15`, display:"flex", alignItems:"center", justifyContent:"center", color:RED, fontSize:"2.5rem", margin:"0 auto 20px" }}>
              <FaCircleCheck />
            </div>
            <h2 style={{ fontSize:"1.5rem", fontWeight:800, color:NAVY2, margin:"0 0 12px 0" }}>Blood is Ready!</h2>
            <p style={{ fontSize:"0.95rem", color:SLATE_L, marginBottom:8, lineHeight:1.5 }}>
              Your blood request for <strong>{notificationRequest.bloodGroup}</strong> ({notificationRequest.units} units) is now ready at <strong>{notificationRequest.hospitalName || notificationRequest.hospital}</strong>.
            </p>
            <p style={{ fontSize:"0.9rem", color:SLATE_L, marginBottom:24 }}>
              Please complete payment to collect your blood units.
            </p>
            <div style={{ display:"flex", gap:12, flexDirection:"column" }}>
              <button
                onClick={handlePayNow}
                style={{
                  width:"100%",
                  padding:"14px 24px",
                  borderRadius:10,
                  background:RED,
                  color:WHITE,
                  border:"none",
                  fontSize:"1rem",
                  fontWeight:600,
                  cursor:"pointer",
                  transition:"all 0.2s",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  gap:8
                }}
                onMouseEnter={e => e.currentTarget.style.background = RED_DK}
                onMouseLeave={e => e.currentTarget.style.background = RED}
              >
                <FaCreditCard /> Pay Now
              </button>
              <button
                onClick={handleBloodReadyNotificationClose}
                style={{
                  width:"100%",
                  padding:"12px 24px",
                  borderRadius:10,
                  background:WHITE,
                  color:NAVY2,
                  border:`1px solid ${BORDER}`,
                  fontSize:"0.95rem",
                  fontWeight:500,
                  cursor:"pointer",
                  transition:"all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                onMouseLeave={e => e.currentTarget.style.background = WHITE}
              >
                Close
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ background:WHITE, borderRadius:16, width:"100%", maxWidth: isMobile ? "95%" : 500, padding: isMobile ? 24 : 32, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto", margin: isMobile ? 16 : 0 }}
            >
            <h2 style={{ fontSize: isMobile ? "1.2rem" : "1.4rem", fontWeight:800, color:NAVY2, margin:"0 0 8px 0" }}>Payment for Blood Delivery</h2>
            <p style={{ fontSize: isMobile ? "0.85rem" : "0.9rem", color:SLATE_L, marginBottom:24 }}>Complete payment for home delivery of blood units</p>

            <BloodRequestPayment
              bloodRequest={selectedRequest}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
              onCancel={() => {
                setShowPaymentModal(false);
                setSelectedRequest(null);
              }}
            />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceiptModal && receiptData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ background:WHITE, borderRadius:16, width:"100%", maxWidth: isMobile ? "95%" : 550, padding: isMobile ? 24 : 32, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto", margin: isMobile ? 16 : 0 }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <h2 style={{ fontSize: isMobile ? "1.2rem" : "1.4rem", fontWeight:800, color:NAVY2, margin:0 }}>Payment Receipt</h2>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  style={{ background:"none", border:"none", color:SLATE_L, cursor:"pointer", fontSize:"1.5rem" }}
                >
                  <FaXmark />
                </button>
              </div>

              <div style={{ background:SMOKE, borderRadius:12, padding:20, marginBottom:20 }}>
                <div style={{ marginBottom:16 }}>
                  <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:RED, margin:"0 0 12px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>Patient Information</h3>
                  <div style={{ fontSize:"0.85rem", color:SLATE, lineHeight:1.8 }}>
                    <div><strong>Full Name:</strong> {receiptData.patientInfo.fullName}</div>
                    <div><strong>Phone Number:</strong> {receiptData.patientInfo.phone}</div>
                    <div><strong>Date of Birth:</strong> {receiptData.patientInfo.dateOfBirth}</div>
                    <div><strong>Email:</strong> {receiptData.patientInfo.email}</div>
                    <div><strong>Gender:</strong> {receiptData.patientInfo.gender}</div>
                  </div>
                </div>

                <div style={{ marginBottom:16, paddingTop:16, borderTop:`1px solid ${BORDER}` }}>
                  <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:RED, margin:"0 0 12px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>Request Details</h3>
                  <div style={{ fontSize:"0.85rem", color:SLATE, lineHeight:1.8 }}>
                    <div><strong>Request ID:</strong> {receiptData.requestDetails.requestId}</div>
                    <div><strong>Date:</strong> {new Date(receiptData.requestDetails.date).toLocaleDateString()}</div>
                    <div><strong>Status:</strong> {receiptData.requestDetails.status}</div>
                  </div>
                </div>

                <div style={{ marginBottom:16, paddingTop:16, borderTop:`1px solid ${BORDER}` }}>
                  <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:RED, margin:"0 0 12px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>Blood Information</h3>
                  <div style={{ fontSize:"0.85rem", color:SLATE, lineHeight:1.8 }}>
                    <div><strong>Blood Group:</strong> {receiptData.bloodInfo.bloodGroup}</div>
                    <div><strong>Units Required:</strong> {receiptData.bloodInfo.units}</div>
                    <div><strong>Urgency:</strong> {receiptData.bloodInfo.urgency}</div>
                  </div>
                </div>

                <div style={{ marginBottom:16, paddingTop:16, borderTop:`1px solid ${BORDER}` }}>
                  <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:RED, margin:"0 0 12px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>Hospital Information</h3>
                  <div style={{ fontSize:"0.85rem", color:SLATE, lineHeight:1.8 }}>
                    <div><strong>Hospital:</strong> {receiptData.hospitalInfo.hospital}</div>
                    {receiptData.hospitalInfo.bloodBank && <div><strong>Blood Bank:</strong> {receiptData.hospitalInfo.bloodBank}</div>}
                  </div>
                </div>

                <div style={{ paddingTop:16, borderTop:`1px solid ${BORDER}` }}>
                  <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:RED, margin:"0 0 12px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>Payment Information</h3>
                  <div style={{ fontSize:"0.85rem", color:SLATE, lineHeight:1.8 }}>
                    <div><strong>Payment Status:</strong> <span style={{ color:"#16A34A", fontWeight:600 }}>{receiptData.paymentInfo.paymentStatus}</span></div>
                    <div><strong>Amount Paid:</strong> <span style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2 }}>₹{receiptData.paymentInfo.amountPaid}</span></div>
                    <div><strong>Delivery:</strong> {receiptData.paymentInfo.delivery}</div>
                    {receiptData.paymentInfo.deliveryAddress && <div><strong>Delivery Address:</strong> {receiptData.paymentInfo.deliveryAddress}</div>}
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", gap:12 }}>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  style={{
                    flex:1,
                    padding:"12px 24px",
                    borderRadius:10,
                    background:WHITE,
                    color:NAVY2,
                    border:`1px solid ${BORDER}`,
                    fontSize:"0.95rem",
                    fontWeight:600,
                    cursor:"pointer",
                    transition:"all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                  onMouseLeave={e => e.currentTarget.style.background = WHITE}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownloadReceipt(selectedRequest);
                    showNotification({
                      type: 'success',
                      title: 'Receipt Downloaded',
                      message: 'Your payment receipt has been downloaded',
                      duration: 4000
                    });
                  }}
                  style={{
                    flex:1,
                    padding:"12px 24px",
                    borderRadius:10,
                    background:RED,
                    color:WHITE,
                    border:"none",
                    fontSize:"0.95rem",
                    fontWeight:600,
                    cursor:"pointer",
                    transition:"all 0.2s",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    gap:8
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = RED_DK}
                  onMouseLeave={e => e.currentTarget.style.background = RED}
                >
                  <FaDownload /> Download Receipt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
}

export default PatientBloodRequests;
