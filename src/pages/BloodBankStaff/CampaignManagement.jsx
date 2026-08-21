import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useResponsive } from "../../utils/responsiveDesign";
import {
  FaAward,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaDroplet,
  FaPlus,
  FaTimeline,
  FaUsers,
  FaCalendarCheck,
  FaBell,
  FaUser,
  FaMagnifyingGlass,
  FaPen,
  FaTrash,
  FaClock,
  FaCircleInfo,
  FaLocationDot,
  FaCalendar,
  FaCheck,
  FaXmark,
  FaHeartPulse,
  FaFileMedical,
  FaBuilding,
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
const SIDEBAR_W = 260;
const SIDEBAR_COL = NAVY;

function CampaignManagement() {
  const { user } = useUser();
  const navigate = useNavigate();
  const screenSize = useResponsive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    targetDonations: "",
    bloodGroups: [],
    status: "Active",
  });

  const isMobile = screenSize === 'xs' || screenSize === 'sm';
  const isTablet = screenSize === 'md';
  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 68 : SIDEBAR_W);

  const nav = [
    { key:"bloodbank-dashboard", icon:<FaChartLine/>, label:"Dashboard", path:"/bloodbank-dashboard" },
    { key:"bloodbank-inventory", icon:<FaDroplet/>, label:"Blood Inventory", path:"/bloodbank-inventory" },
    { key:"bloodbank-add-stock", icon:<FaPlus/>, label:"Add Blood Stock", path:"/bloodbank-add-stock" },
    { key:"bloodbank-stock-history", icon:<FaClock/>, label:"Stock History", path:"/bloodbank-stock-history" },
    { key:"bloodbank-requests", icon:<FaHeartPulse/>, label:"Blood Requests", path:"/bloodbank-requests" },
    { key:"donation-requests", icon:<FaHeartPulse/>, label:"Donation Requests", path:"/donation-requests" },
    { key:"campaign-management", icon:<FaAward/>, label:"Campaign Management", path:"/campaign-management" },
    { key:"appointment-management", icon:<FaCalendarCheck/>, label:"Appointments", path:"/appointment-management" },
    { key:"bloodbank-donors", icon:<FaUsers/>, label:"Donor List", path:"/bloodbank-donors" },
    { key:"bloodbank-details", icon:<FaLocationDot/>, label:"Blood Bank Details", path:"/bloodbank-details" },
    { key:"bloodbank-reports", icon:<FaCircleInfo/>, label:"Reports", path:"/bloodbank-reports" },
    { key:"bloodbank-notifications", icon:<FaBell/>, label:"Notifications", path:"/bloodbank-notifications" },
    { key:"bloodbank-profile", icon:<FaUser/>, label:"Profile", path:"/bloodbank-profile" },
  ];

  const active = "campaign-management";

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/bloodbank/campaigns`);
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/bloodbank/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          createdBy: user?.id,
          createdAt: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        setShowModal(false);
        setFormData({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          location: "",
          targetDonations: "",
          bloodGroups: [],
          status: "Active",
        });
        loadCampaigns();
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  const handleUpdateCampaign = async () => {
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/bloodbank/campaigns/${editingCampaign._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setShowModal(false);
        setEditingCampaign(null);
        setFormData({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          location: "",
          targetDonations: "",
          bloodGroups: [],
          status: "Active",
        });
        loadCampaigns();
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/bloodbank/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCampaigns(campaigns.filter(c => c._id !== campaignId));
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  const handleEditClick = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      location: campaign.location,
      targetDonations: campaign.targetDonations,
      bloodGroups: campaign.bloodGroups || [],
      status: campaign.status,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (campaignId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/bloodbank/campaigns/${campaignId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setCampaigns(campaigns.map(c => 
          c._id === campaignId ? { ...c, status: newStatus } : c
        ));
      }
    } catch (error) {
      console.error("Error toggling campaign status:", error);
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      Active: { bg: `${GREEN}15`, color: GREEN, icon: <FaCheck /> },
      Inactive: { bg: `${SLATE}15`, color: SLATE, icon: <FaClock /> },
      Completed: { bg: `${BLUE}15`, color: BLUE, icon: <FaCircleInfo /> },
    };
    const style = styles[status] || styles.Active;

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

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading campaigns...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT, background: SMOKE, minHeight: "100vh", display: "flex" }}>
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && (
        <aside style={{
          width:sidebarWidth, minHeight:"100vh", background:SIDEBAR_COL,
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
              {!sidebarCollapsed && <span>Blood Bank Staff</span>}
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
                  transition:"all 0.2s",
                  fontSize:"0.9rem",
                  fontWeight:500
                }}
                onMouseEnter={e => {
                  if (active !== item.key) {
                    e.currentTarget.style.background = `${SLATE}22`;
                  }
                }}
                onMouseLeave={e => {
                  if (active !== item.key) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span style={{ fontSize:"1.1rem" }}>{item.icon}</span>
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
                fontSize:"0.9rem",
                fontWeight:500
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${SLATE}22`}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize:"1.1rem" }}><FaRightFromBracket /></span>
                {!sidebarCollapsed && <span>Logout</span>}
              </button>
            </SignOutButton>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main style={{ flex:1, marginLeft:sidebarWidth, transition:"margin-left 0.3s ease" }}>
        {/* Mobile Header */}
        {isMobile && (
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              background:WHITE,
              padding: "12px 16px",
              borderBottom:`1px solid ${BORDER}`,
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
              position:"sticky",
              top:0,
              zIndex:50
            }}
          >
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background:"none",
                border:"none",
                cursor:"pointer",
                padding:8,
                borderRadius:4,
                color:NAVY2
              }}
            >
              <FaBars style={{ fontSize:"1.2rem" }} />
            </button>
            <h1 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>
              Campaigns
            </h1>
            <button
              onClick={() => {
                setEditingCampaign(null);
                setFormData({
                  name: "",
                  description: "",
                  startDate: "",
                  endDate: "",
                  location: "",
                  targetDonations: "",
                  bloodGroups: [],
                  status: "Active",
                });
                setShowModal(true);
              }}
              style={{
                background:RED,
                border:"none",
                borderRadius:6,
                padding:"8px 12px",
                cursor:"pointer",
                color:WHITE,
                fontSize:"0.85rem",
                fontWeight:600
              }}
            >
              <FaPlus />
            </button>
          </motion.header>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              background:WHITE,
              padding: isTablet ? "12px 20px" : "16px 32px",
              borderBottom:`1px solid ${BORDER}`,
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
              position:"sticky",
              top:0,
              zIndex:50
            }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div>
                <h1 style={{ fontSize:isTablet ? "1.2rem" : "1.4rem", fontWeight:700, color:NAVY2, margin:0 }}>Campaign Management</h1>
                <p style={{ fontSize:isTablet ? "0.8rem" : "0.85rem", color:SLATE_L, margin:"4px 0 0 0" }}>Create and manage blood donation campaigns</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingCampaign(null);
                setFormData({
                  name: "",
                  description: "",
                  startDate: "",
                  endDate: "",
                  location: "",
                  targetDonations: "",
                  bloodGroups: [],
                  status: "Active",
                });
                setShowModal(true);
              }}
              style={{
                padding: isTablet ? "10px 20px" : "12px 24px",
                background: RED,
                color: WHITE,
                border: "none",
                borderRadius: 8,
                fontSize: isTablet ? "0.9rem" : "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FaPlus /> Create Campaign
            </button>
          </motion.header>
        )}

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position:"fixed",
                top:0,
                left:0,
                right:0,
                bottom:0,
                background:"rgba(0,0,0,0.5)",
                zIndex:1000
              }}
            >
              <motion.div
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width:260,
                  height:"100%",
                  background:SIDEBAR_COL,
                  padding:"16px"
                }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, color:WHITE, fontWeight:700 }}>
                    <FaDroplet style={{ color:RED }} />
                    <span>Blood Bank</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} style={{ background:"none", border:"none", color:WHITE, cursor:"pointer" }}>
                    <FaXmark />
                  </button>
                </div>
                {nav.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                    style={{
                      width:"100%",
                      display:"flex",
                      alignItems:"center",
                      gap:12,
                      padding:"12px 16px",
                      borderRadius:8,
                      border:"none",
                      background:active === item.key ? `${RED}22` : "transparent",
                      color:active === item.key ? RED : WHITE,
                      cursor:"pointer",
                      marginBottom:8,
                      fontSize:"0.9rem"
                    }}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
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
                    color:"#F87171",
                    cursor:"pointer",
                    marginTop:16
                  }}>
                    <FaRightFromBracket /> Logout
                  </button>
                </SignOutButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ padding:isMobile ? "16px" : isTablet ? "20px" : "32px" }}>
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(200px, 1fr))",
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
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: GREEN, marginBottom: 8 }}>
                {campaigns.filter(c => c.status === "Active").length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Active Campaigns
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
                {campaigns.filter(c => c.status === "Completed").length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Completed Campaigns
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
                {campaigns.reduce((sum, c) => sum + (c.participants?.length || 0), 0)}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Total Participants
              </div>
            </div>
            <div style={{
              background: WHITE,
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              padding: "24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: RED, marginBottom: 8 }}>
                {campaigns.length}
              </div>
              <div style={{ fontSize: "0.9rem", color: SLATE_L, fontWeight: 500 }}>
                Total Campaigns
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
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: SLATE_L,
              }} />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 40px",
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                fontSize: "0.95rem",
                background: WHITE,
                color: NAVY2,
                cursor: "pointer",
              }}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Completed">Completed</option>
            </select>
          </motion.div>

          {/* Campaign List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {filteredCampaigns.length === 0 ? (
              <div style={{
                background: WHITE,
                borderRadius: 12,
                border: `1px solid ${BORDER}`,
                padding: "60px 20px",
                textAlign: "center",
                color: SLATE_L,
              }}>
                <FaAward style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.3 }} />
                <p style={{ fontSize: "1rem" }}>No campaigns found</p>
                <p style={{ fontSize: "0.9rem", marginTop: 8 }}>Create a new campaign to get started</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 20 }}>
                {filteredCampaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      background: WHITE,
                      borderRadius: 12,
                      border: `1px solid ${BORDER}`,
                      padding: "24px",
                      transition: "all 0.3s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: NAVY2, marginBottom: 8 }}>
                          {campaign.name}
                        </h3>
                        <StatusBadge status={campaign.status} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleEditClick(campaign)}
                          style={{
                            padding: "8px",
                            background: `${BLUE}15`,
                            color: BLUE,
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          <FaPen />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign._id)}
                          style={{
                            padding: "8px",
                            background: `${RED}15`,
                            color: RED,
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: "0.9rem", color: SLATE, marginBottom: 16, lineHeight: 1.5 }}>
                      {campaign.description}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", color: SLATE_L }}>
                        <FaCalendar />
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", color: SLATE_L }}>
                        <FaLocationDot />
                        {campaign.location}
                      </div>
                    </div>

                    <div style={{
                      padding: "12px",
                      background: SMOKE,
                      borderRadius: 8,
                      marginBottom: 16,
                    }}>
                      <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: 4 }}>Progress</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 8, background: BORDER, borderRadius: 4, overflow: "hidden" }}>
                          <div style={{
                            width: `${Math.min((campaign.participants?.length || 0) / campaign.targetDonations * 100, 100)}%`,
                            height: "100%",
                            background: GREEN,
                          }} />
                        </div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: NAVY2 }}>
                          {campaign.participants?.length || 0} / {campaign.targetDonations}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(campaign._id, campaign.status)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: campaign.status === "Active" ? `${YELLOW}15` : `${GREEN}15`,
                        color: campaign.status === "Active" ? YELLOW : GREEN,
                        border: "none",
                        borderRadius: 8,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {campaign.status === "Active" ? "Deactivate Campaign" : "Activate Campaign"}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: WHITE,
              borderRadius: 16,
              maxWidth: 500,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "32px",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, marginBottom: 24 }}>
              {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: SLATE, marginBottom: 8 }}>
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    fontSize: "0.95rem",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: SLATE, marginBottom: 8 }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    fontSize: "0.95rem",
                    minHeight: 80,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: SLATE, marginBottom: 8 }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      fontSize: "0.95rem",
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: SLATE, marginBottom: 8 }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      fontSize: "0.95rem",
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: SLATE, marginBottom: 8 }}>
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    fontSize: "0.95rem",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: SLATE, marginBottom: 8 }}>
                  Target Donations *
                </label>
                <input
                  type="number"
                  value={formData.targetDonations}
                  onChange={(e) => setFormData({ ...formData, targetDonations: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    fontSize: "0.95rem",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: SLATE, marginBottom: 8 }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    fontSize: "0.95rem",
                    background: WHITE,
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingCampaign(null);
                    setFormData({
                      name: "",
                      description: "",
                      startDate: "",
                      endDate: "",
                      location: "",
                      targetDonations: "",
                      bloodGroups: [],
                      status: "Active",
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: SMOKE,
                    color: NAVY2,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: RED,
                    color: WHITE,
                    border: "none",
                    borderRadius: 8,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {editingCampaign ? "Update Campaign" : "Create Campaign"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default CampaignManagement;
