import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
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
  FaPen,
  FaBox,
} from "react-icons/fa6";

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

function HospitalBloodInventory() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBloodGroup, setFilterBloodGroup] = useState("All");
  const [filterStockStatus, setFilterStockStatus] = useState("All");
  const [lowStockThreshold] = useState(10);

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

  const active = "hospital-blood-inventory";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    // Load blood inventory from localStorage or API
    const loadInventory = async () => {
      try {
        const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/blood-inventory`);
        if (response.ok) {
          const data = await response.json();
          setInventory(data || []);
        } else {
          // Fallback to localStorage
          const savedInventory = JSON.parse(localStorage.getItem('bloodInventory') || '[]');
          setInventory(savedInventory);
        }
      } catch (error) {
        // Fallback to localStorage
        const savedInventory = JSON.parse(localStorage.getItem('bloodInventory') || '[]');
        setInventory(savedInventory);
      }
      setLoading(false);
    };
    loadInventory();
  }, []);

  const filteredInventory = inventory.filter(item => 
    (item.bloodGroup?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.hospital?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterBloodGroup === "All" || item.bloodGroup === filterBloodGroup) &&
    (filterStockStatus === "All" || 
      (filterStockStatus === "Low Stock" && item.units <= lowStockThreshold) ||
      (filterStockStatus === "In Stock" && item.units > lowStockThreshold) ||
      (filterStockStatus === "Critical" && item.units <= 5))
  );

  const getStockStatus = (units) => {
    if (units <= 5) return { status: "Critical", color: "#DC2626", bg: "#FEE2E2" };
    if (units <= lowStockThreshold) return { status: "Low Stock", color: "#D97706", bg: "#FEF3C7" };
    return { status: "In Stock", color: "#16A34A", bg: "#DCFCE7" };
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { status: "N/A", color: "#64748B", bg: "#F3F4F6" };
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0) return { status: "Expired", color: "#DC2626", bg: "#FEE2E2" };
    if (daysUntilExpiry <= 7) return { status: "Expiring Soon", color: "#D97706", bg: "#FEF3C7" };
    if (daysUntilExpiry <= 30) return { status: "Expiring This Month", color: "#2563EB", bg: "#DBEAFE" };
    return { status: "Good", color: "#16A34A", bg: "#DCFCE7" };
  };

  const handleUpdate = async (id, newUnits) => {
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/blood-inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ units: newUnits })
      });
      
      if (response.ok) {
        // Reload inventory
        const reloadResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/blood-inventory`);
        if (reloadResponse.ok) {
          const data = await reloadResponse.json();
          setInventory(data || []);
        }
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  const BloodBadge = ({ group }) => (
    <span style={{
      padding: "6px 14px",
      borderRadius: 8,
      background: `${BG_COLOR[group] || RED}15`,
      color: BG_COLOR[group] || RED,
      fontSize: "0.85rem",
      fontWeight: 600
    }}>
      {group}
    </span>
  );

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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading blood inventory...</p>
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
                Hospital Blood Inventory
              </h1>
              <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
                View and manage blood inventory
              </p>
            </div>
            <div style={{ display:"flex", gap:12 }}>
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
                  placeholder="Search inventory..."
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
                value={filterBloodGroup}
                onChange={(e) => setFilterBloodGroup(e.target.value)}
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
              <select
                value={filterStockStatus}
                onChange={(e) => setFilterStockStatus(e.target.value)}
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
                <option value="All">All Stock Status</option>
                <option value="Critical">Critical (≤5 units)</option>
                <option value="Low Stock">Low Stock (≤10 units)</option>
                <option value="In Stock">In Stock (10 units)</option>
              </select>
            </div>
          </div>

          {/* Inventory Table */}
          <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>Blood Inventory ({filteredInventory.length})</h2>
            </div>
            {filteredInventory.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:SLATE_L }}>
                <FaBox style={{ fontSize:"3rem", marginBottom:16, opacity:0.3 }} />
                <p style={{ fontSize:"1rem", marginBottom:16 }}>No inventory data found</p>
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:SMOKE, borderBottom:`1px solid ${BORDER}` }}>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>ID</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Blood Group</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Units Available</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Hospital</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Expiry Date</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Stock Status</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Expiry Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => {
                      const stockStatus = getStockStatus(item.units);
                      const expiryStatus = getExpiryStatus(item.expiryDate);
                      return (
                        <tr key={item._id} style={{ borderBottom:`1px solid ${BORDER}`, transition:"background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = SMOKE} onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                          <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2, fontWeight:600 }}>{item._id}</td>
                          <td style={{ padding:"16px 24px" }}><BloodBadge group={item.bloodGroup} /></td>
                          <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2, fontWeight:600 }}>{item.units}</td>
                          <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>{item.hospital}</td>
                          <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>{item.expiryDate || "N/A"}</td>
                          <td style={{ padding:"16px 24px" }}>
                            <span style={{
                              padding:"4px 10px",
                              borderRadius:6,
                              fontSize:"0.75rem",
                              fontWeight:600,
                              background: stockStatus.bg,
                              color: stockStatus.color
                            }}>
                              {stockStatus.status}
                            </span>
                          </td>
                          <td style={{ padding:"16px 24px" }}>
                            <span style={{
                              padding:"4px 10px",
                              borderRadius:6,
                              fontSize:"0.75rem",
                              fontWeight:600,
                              background: expiryStatus.bg,
                              color: expiryStatus.color
                            }}>
                              {expiryStatus.status}
                            </span>
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
    </div>
  );
}

export default HospitalBloodInventory;
