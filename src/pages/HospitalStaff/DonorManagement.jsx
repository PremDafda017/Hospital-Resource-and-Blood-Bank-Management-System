import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaEye,
  FaSearch,
  FaFilter,
  FaCalendar,
  FaDroplet,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaArrowLeft,
  FaArrowRight,
  FaFileAlt,
} from "react-icons/fa";

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

const DonorManagement = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Data
  const [pendingApplications, setPendingApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [verifiedDonors, setVerifiedDonors] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load pending applications
      const pendingResponse = await fetch("https://hospital-resource-and-blood-bank.onrender.com/api/donor/applications/pending");
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingApplications(pendingData);
      }

      // Load all applications (for filtering)
      // This would need a new endpoint, for now using pending
      setAllApplications(pendingApplications);

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  const handleApprove = async (application) => {
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/application/${application._id}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Verified",
          verifiedBy: user?.fullName || user?.firstName || "Staff",
          remarks: "Application approved after review",
        }),
      });

      if (response.ok) {
        alert("Application approved successfully!");
        loadData();
        setShowDetails(false);
      } else {
        alert("Failed to approve application");
      }
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Failed to approve application");
    }
  };

  const handleReject = async (application, reason) => {
    if (!reason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/application/${application._id}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Rejected",
          rejectionReason: reason,
          verifiedBy: user?.fullName || user?.firstName || "Staff",
          remarks: reason,
        }),
      });

      if (response.ok) {
        alert("Application rejected successfully!");
        loadData();
        setShowDetails(false);
      } else {
        alert("Failed to reject application");
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Failed to reject application");
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      "Pending Verification": { bg: "#FEF3C7", color: "#92400E", icon: <FaHourglassHalf /> },
      "Verified": { bg: "#D1FAE5", color: "#065F46", icon: <FaCheckCircle /> },
      "Rejected": { bg: "#FEE2E2", color: "#991B1B", icon: <FaTimesCircle /> },
    };
    const style = styles[status] || styles["Pending Verification"];

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

  const filteredApplications = allApplications.filter((app) => {
    const matchesSearch = 
      app.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.personalInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.medicalInfo?.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || app.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading donor applications...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: SMOKE, fontFamily: FONT, padding: "24px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: NAVY2, marginBottom: 8 }}>
            <FaUsers style={{ marginRight: 12, color: RED }} />
            Donor Management
          </h1>
          <p style={{ fontSize: "1rem", color: SLATE_L }}>
            Review and manage donor applications
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div style={{
            background: WHITE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            padding: "24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: `${YELLOW}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: YELLOW,
              fontSize: "1.5rem",
            }}>
              <FaHourglassHalf />
            </div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: NAVY2 }}>
                {pendingApplications.length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Pending Applications
              </div>
            </div>
          </div>

          <div style={{
            background: WHITE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            padding: "24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: `${GREEN}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: GREEN,
              fontSize: "1.5rem",
            }}>
              <FaUserCheck />
            </div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: NAVY2 }}>
                {allApplications.filter(a => a.status === "Verified").length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Verified Donors
              </div>
            </div>
          </div>

          <div style={{
            background: WHITE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            padding: "24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: `${RED}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: RED,
              fontSize: "1.5rem",
            }}>
              <FaUserTimes />
            </div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: NAVY2 }}>
                {allApplications.filter(a => a.status === "Rejected").length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Rejected Applications
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: WHITE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            padding: "20px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "pending", label: "Pending Applications", icon: <FaHourglassHalf /> },
              { key: "verified", label: "Verified Donors", icon: <FaUserCheck /> },
              { key: "rejected", label: "Rejected", icon: <FaUserTimes /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setFilterStatus(tab.key === "pending" ? "Pending Verification" : tab.key);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: activeTab === tab.key ? RED : "transparent",
                  color: activeTab === tab.key ? WHITE : SLATE,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ position: "relative" }}>
              <FaSearch style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: SLATE_L,
              }} />
              <input
                type="text"
                placeholder="Search by name, email, or blood group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 48px",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "12px 16px",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              fontSize: "0.95rem",
              background: WHITE,
              cursor: "pointer",
            }}
          >
            <option value="all">All Status</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </motion.div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: WHITE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            overflow: "hidden",
          }}
        >
          {filteredApplications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: SLATE_L }}>
              <FaUsers style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.3 }} />
              <p style={{ fontSize: "1rem" }}>No applications found</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filteredApplications.map((application, index) => (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    padding: "20px 24px",
                    borderBottom: index < filteredApplications.length - 1 ? `1px solid ${BORDER}` : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = SMOKE}
                  onMouseLeave={(e) => e.currentTarget.style.background = WHITE}
                  onClick={() => {
                    setSelectedApplication(application);
                    setShowDetails(true);
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: `${RED}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: RED,
                    fontSize: "1.2rem",
                    fontWeight: 700,
                  }}>
                    {application.personalInfo?.firstName?.[0] || "D"}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: NAVY2, fontSize: "1rem", marginBottom: 4 }}>
                      {application.personalInfo?.firstName} {application.personalInfo?.lastName}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: 4 }}>
                      {application.personalInfo?.email}
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: `${RED}15`,
                        color: RED,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}>
                        {application.medicalInfo?.bloodGroup}
                      </span>
                      <span style={{ fontSize: "0.85rem", color: SLATE_L }}>
                        Applied: {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={application.status} />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApplication(application);
                      setShowDetails(true);
                    }}
                    style={{
                      padding: "8px 16px",
                      background: BLUE,
                      color: WHITE,
                      border: "none",
                      borderRadius: 6,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FaEye />
                    Review
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Application Details Modal */}
        <AnimatePresence>
          {showDetails && selectedApplication && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: WHITE,
                  borderRadius: 16,
                  maxWidth: 800,
                  width: "100%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
              >
                {/* Modal Header */}
                <div style={{
                  padding: "24px 32px",
                  borderBottom: `1px solid ${BORDER}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "sticky",
                  top: 0,
                  background: WHITE,
                  zIndex: 10,
                }}>
                  <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, margin: 0 }}>
                      Application Details
                    </h2>
                    <p style={{ color: SLATE_L, fontSize: "0.9rem", margin: "4px 0 0 0" }}>
                      {selectedApplication.personalInfo?.firstName} {selectedApplication.personalInfo?.lastName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      border: "none",
                      background: SMOKE,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: SLATE,
                    }}
                  >
                    <FaTimesCircle />
                  </button>
                </div>

                {/* Modal Content */}
                <div style={{ padding: "32px" }}>
                  {/* Status */}
                  <div style={{ marginBottom: 24 }}>
                    <StatusBadge status={selectedApplication.status} />
                  </div>

                  {/* Personal Information */}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaFileAlt />
                      Personal Information
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Full Name</label>
                        <div style={{ fontSize: "1rem", color: NAVY2, fontWeight: 600 }}>
                          {selectedApplication.personalInfo?.firstName} {selectedApplication.personalInfo?.lastName}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Email</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>{selectedApplication.personalInfo?.email}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Phone</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>{selectedApplication.personalInfo?.phone}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Age</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>{selectedApplication.personalInfo?.age} years</div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Gender</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>{selectedApplication.personalInfo?.gender}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Government ID</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>
                          {selectedApplication.personalInfo?.governmentIdType}: {selectedApplication.personalInfo?.governmentId}
                        </div>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Address</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>
                          {selectedApplication.personalInfo?.address}, {selectedApplication.personalInfo?.city}, {selectedApplication.personalInfo?.state} - {selectedApplication.personalInfo?.pincode}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaDroplet />
                      Medical Information
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Blood Group</label>
                        <div style={{ fontSize: "1rem", color: NAVY2, fontWeight: 600 }}>
                          {selectedApplication.medicalInfo?.bloodGroup}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Weight</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>{selectedApplication.medicalInfo?.weight} kg</div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Height</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>{selectedApplication.medicalInfo?.height} cm</div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Hemoglobin</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>{selectedApplication.medicalInfo?.hemoglobin} g/dL</div>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Medical Conditions</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>
                          {selectedApplication.medicalInfo?.medicalConditions || "None reported"}
                        </div>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Current Medicines</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>
                          {selectedApplication.medicalInfo?.currentMedicines || "None reported"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaUsers />
                      Emergency Contact
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Name</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>{selectedApplication.emergencyContact?.name}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Phone</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>{selectedApplication.emergencyContact?.phone}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: SLATE_L, fontWeight: 500 }}>Relationship</label>
                        <div style={{ fontSize: "1rem", color: NAVY2 }}>{selectedApplication.emergencyContact?.relationship}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedApplication.status === "Pending Verification" && (
                    <div style={{
                      display: "flex",
                      gap: 16,
                      paddingTop: 24,
                      borderTop: `1px solid ${BORDER}`,
                    }}>
                      <button
                        onClick={() => handleApprove(selectedApplication)}
                        style={{
                          flex: 1,
                          padding: "14px 24px",
                          background: GREEN,
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
                        }}
                      >
                        <FaCheckCircle />
                        Approve Application
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Please provide a reason for rejection:");
                          if (reason) handleReject(selectedApplication, reason);
                        }}
                        style={{
                          flex: 1,
                          padding: "14px 24px",
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
                        }}
                      >
                        <FaTimesCircle />
                        Reject Application
                      </button>
                    </div>
                  )}

                  {selectedApplication.status === "Rejected" && (
                    <div style={{
                      padding: 16,
                      background: "#FEE2E2",
                      borderRadius: 8,
                      border: "1px solid #DC2626",
                    }}>
                      <label style={{ fontSize: "0.85rem", color: "#991B1B", fontWeight: 600 }}>Rejection Reason</label>
                      <div style={{ fontSize: "1rem", color: "#B91C1C" }}>
                        {selectedApplication.rejectionReason || "Not specified"}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DonorManagement;
