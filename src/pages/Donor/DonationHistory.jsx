import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  FaClockRotateLeft,
  FaMagnifyingGlass,
  FaFilter,
  FaDownload,
  FaCalendar,
  FaLocationDot,
  FaDroplet,
  FaCertificate,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCircleInfo,
} from "react-icons/fa6";

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

const DonationHistory = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    if (user?.id) {
      loadDonationHistory();
    }
  }, [user]);

  const loadDonationHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/donor/${user.id}/donations`);
      if (response.ok) {
        const data = await response.json();
        // Filter to show only completed donations
        const completedDonations = data.filter(d => d.status === "Completed");
        setDonations(completedDonations);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading donation history:", error);
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Date", "Location", "Blood Group", "Amount (ml)", "Status", "Certificate"],
      ...filteredDonations.map(d => [
        new Date(d.date).toLocaleDateString(),
        d.bloodBankName || d.location,
        d.bloodGroup,
        d.amount || "450",
        d.status,
        d.certificateId ? "Yes" : "No",
      ]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donation-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      (donation.bloodBankName || donation.location)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || donation.status === filterStatus;
    
    const matchesYear = filterYear === "all" || new Date(donation.date).getFullYear().toString() === filterYear;
    
    return matchesSearch && matchesStatus && matchesYear;
  }).sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === "date") {
      comparison = new Date(a.date) - new Date(b.date);
    } else if (sortBy === "amount") {
      comparison = (a.amount || 450) - (b.amount || 450);
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const years = [...new Set(donations.map(d => new Date(d.date).getFullYear()))].sort((a, b) => b - a);

  const StatusBadge = ({ status }) => {
    const styles = {
      Completed: { bg: "#D1FAE5", color: "#059669" },
      InProgress: { bg: "#DBEAFE", color: "#2563EB" },
      Cancelled: { bg: "#FEE2E2", color: "#DC2626" },
      Pending: { bg: "#FEF3C7", color: "#D97706" },
    };
    const style = styles[status] || styles.Pending;

    return (
      <span style={{
        padding: "6px 12px",
        borderRadius: 20,
        background: style.bg,
        color: style.color,
        fontSize: "0.85rem",
        fontWeight: 600,
      }}>
        {status}
      </span>
    );
  };

  const SortIcon = ({ field }) => {
    if (sortBy.field !== field) return <FaSort />;
    return sortBy.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading donation history...</p>
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
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}
        >
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: NAVY2, marginBottom: 8 }}>
              <FaClockRotateLeft style={{ marginRight: 12, color: RED }} />
              Donation History
            </h1>
            <p style={{ fontSize: "1rem", color: SLATE_L }}>
              View and manage your blood donation records
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={filteredDonations.length === 0}
            style={{
              padding: "14px 24px",
              background: filteredDonations.length === 0 ? SLATE : GREEN,
              color: WHITE,
              border: "none",
              borderRadius: 10,
              fontSize: "1rem",
              fontWeight: 600,
              cursor: filteredDonations.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
          >
            <FaDownload />
            Export CSV
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div style={{
            background: WHITE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            padding: "24px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: RED, marginBottom: 8 }}>
              {donations.length}
            </div>
            <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
              Total Donations
            </div>
          </div>
          <div style={{
            background: WHITE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            padding: "24px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: GREEN, marginBottom: 8 }}>
              {donations.filter(d => d.status === "Completed").length}
            </div>
            <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
              Successful Donations
            </div>
          </div>
          <div style={{
            background: WHITE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            padding: "24px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: BLUE, marginBottom: 8 }}>
              {donations.filter(d => d.certificateId).length}
            </div>
            <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
              Certificates Earned
            </div>
          </div>
          <div style={{
            background: WHITE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            padding: "24px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: YELLOW, marginBottom: 8 }}>
              {donations.length * 3}
            </div>
            <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
              Lives Saved
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: WHITE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            padding: "20px",
            marginBottom: 24,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, minWidth: 250, position: "relative" }}>
            <FaMagnifyingGlass style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: SLATE_L,
            }} />
            <input
              type="text"
              placeholder="Search by location or blood group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 48px",
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                fontSize: "0.95rem",
              }}
            />
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
            <option value="Completed">Completed</option>
            <option value="InProgress">In Progress</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending">Pending</option>
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            style={{
              padding: "12px 16px",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              fontSize: "0.95rem",
              background: WHITE,
              cursor: "pointer",
            }}
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </motion.div>

        {/* Donation List */}
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
          {filteredDonations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: SLATE_L }}>
              <FaClockRotateLeft style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.3 }} />
              <p style={{ fontSize: "1rem" }}>No donation records found</p>
              <p style={{ fontSize: "0.9rem", marginTop: 8 }}>
                {donations.length === 0 ? "Start your donation journey today!" : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr)) 140px 100px",
                gap: 16,
                padding: "16px 24px",
                background: SMOKE,
                borderBottom: `1px solid ${BORDER}`,
                fontSize: "0.85rem",
                fontWeight: 600,
                color: SLATE_L,
                textTransform: "uppercase",
              }}>
                <button
                  onClick={() => handleSort("date")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: SLATE_L,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  Date <SortIcon field="date" />
                </button>
                <span>Blood Bank</span>
                <span>Blood Group</span>
                <span>Units Collected</span>
                <span>Donation ID</span>
                <span>Status</span>
              </div>

              {/* Table Body */}
              {filteredDonations.map((donation, index) => (
                <motion.div
                  key={donation._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr)) 140px 100px",
                    gap: 16,
                    padding: "20px 24px",
                    borderBottom: index < filteredDonations.length - 1 ? `1px solid ${BORDER}` : "none",
                    alignItems: "center",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = SMOKE}
                  onMouseLeave={(e) => e.currentTarget.style.background = WHITE}
                >
                  <div style={{ fontSize: "0.95rem", color: NAVY2, fontWeight: 500 }}>
                    {new Date(donation.date).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: "0.95rem", color: NAVY2, display: "flex", alignItems: "center", gap: 6 }}>
                    <FaLocationDot style={{ color: SLATE_L, fontSize: "0.8rem" }} />
                    {donation.bloodBankName || donation.location}
                  </div>
                  <div style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: `${RED}15`,
                    color: RED,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    width: "fit-content",
                  }}>
                    {donation.bloodGroup}
                  </div>
                  <div style={{ fontSize: "0.95rem", color: NAVY2 }}>
                    {donation.unitsCollected || donation.amount || "1"} unit(s)
                  </div>
                  <div style={{ fontSize: "0.9rem", color: SLATE_L, fontFamily: "monospace" }}>
                    {donation.donationId || donation._id?.slice(-8).toUpperCase()}
                  </div>
                  <div style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: `${GREEN}15`,
                    color: GREEN,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    width: "fit-content",
                  }}>
                    Completed
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 24,
            padding: "24px",
            background: `${BLUE}10`,
            borderRadius: 12,
            border: `1px solid ${BLUE}30`,
          }}
        >
          <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <FaCircleInfo style={{ color: BLUE }} />
            About Your Donation History
          </h4>
          <ul style={{ color: SLATE, fontSize: "0.95rem", lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Each donation can save up to 3 lives</li>
            <li>Certificates are issued for successful donations</li>
            <li>You can export your history as a CSV file for your records</li>
            <li>Regular donations help maintain stable blood supply in hospitals</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default DonationHistory;
