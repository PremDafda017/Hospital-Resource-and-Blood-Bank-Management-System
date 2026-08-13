import React, { useState, useEffect } from "react";
import { useAuth, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FaMapLocationDot,
  FaMagnifyingGlass,
  FaFilter,
  FaPhone,
  FaLocationDot,
  FaClock,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaHeartPulse,
  FaFileMedical,
  FaCalendarDays,
  FaBell,
  FaUser,
  FaDroplet,
  FaBuilding,
  FaHouse,
  FaLocationCrosshairs,
  FaRoute,
} from "react-icons/fa6";
import { bloodBankDatabase } from "../../data/hospitalData";

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

function PatientBloodBanks() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [sortByDistance, setSortByDistance] = useState(false);

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

  const active = "blood-banks";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  const states = ["all", ...new Set(bloodBankDatabase.map(b => b.state))];

  useEffect(() => {
    setBloodBanks(bloodBankDatabase);
    setLoading(false);
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setLocationInput(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
          setSortByDistance(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter it manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const openGoogleMaps = (bank) => {
    const destination = `${bank.name}, ${bank.address}, ${bank.city}`;
    const url = userLocation 
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(destination)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  };

  const filteredBanks = bloodBanks.filter(bank => {
    const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bank.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bank.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState === "all" || bank.state === filterState;
    const matchesType = filterType === "all" || bank.type === filterType;
    return matchesSearch && matchesState && matchesType;
  }).map(bank => {
    if (userLocation && bank.lat && bank.lng) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        bank.lat,
        bank.lng
      );
      return { ...bank, distance };
    }
    return { ...bank, distance: null };
  }).sort((a, b) => {
    if (sortByDistance && a.distance !== null && b.distance !== null) {
      return a.distance - b.distance;
    }
    return 0;
  });

  const BloodStockBadge = ({ group, count }) => {
    const isLow = count < 10;
    return (
      <div style={{
        padding: "4px 8px",
        borderRadius: 4,
        background: isLow ? `${RED}15` : `${BG_COLOR[group] || RED}15`,
        color: isLow ? RED : BG_COLOR[group] || RED,
        fontSize: "0.7rem",
        fontWeight: 700,
        textAlign: "center",
      }}>
        {group}: {count}
      </div>
    );
  };

  const TypeBadge = ({ type }) => {
    const colors = {
      "government": "#16A34A",
      "private": "#7C3AED",
    };
    return (
      <span style={{
        padding: "4px 10px",
        borderRadius: 6,
        background: `${colors[type] || "#64748B"}15`,
        color: colors[type] || "#64748B",
        fontSize: "0.75rem",
        fontWeight: 600,
      }}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading blood banks...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
                Nearby Blood Banks
              </h1>
              <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
                Find blood banks near you
              </p>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding:"0" }}>
            {/* Search Bar and Location */}
            <div style={{ marginBottom:32 }}>
              <div style={{ display:"flex", gap:16, marginBottom:16 }}>
                <div style={{ flex:1, position:"relative" }}>
                  <FaMagnifyingGlass style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:SLATE_L, fontSize:"1.1rem" }} />
                  <input
                    type="text"
                    placeholder="Search blood banks by name, city, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width:"100%",
                      padding:"14px 16px 14px 48px",
                      borderRadius:12,
                      border:`1px solid ${BORDER}`,
                      fontSize:"0.95rem",
                      color:NAVY2,
                      background:WHITE,
                      outline:"none",
                      transition:"border-color 0.2s",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = RED}
                    onBlur={(e) => e.currentTarget.style.borderColor = BORDER}
                  />
                </div>
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  style={{
                    background:WHITE,
                    border:`1px solid ${BORDER}`,
                    padding:"14px 20px",
                    borderRadius:12,
                    fontSize:"0.85rem",
                    fontWeight:600,
                    cursor:"pointer",
                    display:"flex",
                    alignItems:"center",
                    gap:8,
                    transition:"all 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = SMOKE}
                  onMouseLeave={(e) => e.currentTarget.style.background = WHITE}
                >
                  <FaFilter /> Filter
                </button>
              </div>
              
              {/* Location Input */}
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ flex:1, position:"relative" }}>
                  <FaLocationCrosshairs style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:SLATE_L, fontSize:"1rem" }} />
                  <input
                    type="text"
                    placeholder="Enter your location or use current location"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    style={{
                      width:"100%",
                      padding:"12px 16px 12px 48px",
                      borderRadius:10,
                      border:`1px solid ${BORDER}`,
                      fontSize:"0.9rem",
                      color:NAVY2,
                      background:WHITE,
                      outline:"none",
                    }}
                  />
                </div>
                <button
                  onClick={getUserLocation}
                  style={{
                    background:RED,
                    color:WHITE,
                    border:"none",
                    padding:"12px 20px",
                    borderRadius:10,
                    fontSize:"0.85rem",
                    fontWeight:600,
                    cursor:"pointer",
                    display:"flex",
                    alignItems:"center",
                    gap:8,
                    transition:"all 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = RED_DK}
                  onMouseLeave={(e) => e.currentTarget.style.background = RED}
                >
                  <FaLocationCrosshairs /> Use Current Location
                </button>
                {userLocation && (
                  <button
                    onClick={() => {
                      setUserLocation(null);
                      setLocationInput("");
                      setSortByDistance(false);
                    }}
                    style={{
                      background:WHITE,
                      color:RED,
                      border:`1px solid ${BORDER}`,
                      padding:"12px 16px",
                      borderRadius:10,
                      fontSize:"0.85rem",
                      fontWeight:600,
                      cursor:"pointer",
                      transition:"all 0.2s",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {userLocation && (
                <div style={{ marginTop:12, fontSize:"0.85rem", color:SLATE_L }}>
                  Showing blood banks sorted by distance from your location
                </div>
              )}
            </div>

            {/* Filter Panel */}
            {showFilter && (
              <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding:"20px", marginBottom:24 }}>
                <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <label style={{ fontSize:"0.85rem", fontWeight:600, color:NAVY2 }}>State:</label>
                    <select
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                      style={{ padding:"8px 12px", borderRadius:6, border:`1px solid ${BORDER}`, fontSize:"0.85rem", color:NAVY2, background:WHITE }}
                    >
                      {states.map(state => (
                        <option key={state} value={state}>{state === "all" ? "All States" : state}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <label style={{ fontSize:"0.85rem", fontWeight:600, color:NAVY2 }}>Type:</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      style={{ padding:"8px 12px", borderRadius:6, border:`1px solid ${BORDER}`, fontSize:"0.85rem", color:NAVY2, background:WHITE }}
                    >
                      <option value="all">All Types</option>
                      <option value="government">Government</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Blood Banks Grid */}
            {filteredBanks.length === 0 ? (
              <div style={{ textAlign:"center", padding:"48px", color:SLATE_L }}>
                <FaBuilding style={{ fontSize:48, marginBottom:16 }} />
                <h3 style={{ fontSize:"1.2rem", fontWeight:600, color:NAVY2, margin:"0 0 8px 0" }}>
                  No Blood Banks Found
                </h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(350px, 1fr))", gap:24 }}>
                {filteredBanks.map((bank) => (
                  <div key={bank.id} style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding:"24px", display:"flex", flexDirection:"column", gap:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ width:48, height:48, borderRadius:10, background:`${RED}15`, display:"flex", alignItems:"center", justifyContent:"center", color:RED, fontSize:"1.2rem" }}>
                        <FaBuilding />
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                        <TypeBadge type={bank.type} />
                        {bank.distance !== null && (
                          <div style={{ fontSize:"0.8rem", fontWeight:600, color:RED, background:`${RED}15`, padding:"4px 8px", borderRadius:6 }}>
                            {bank.distance < 1 ? `${(bank.distance * 1000).toFixed(0)}m` : `${bank.distance.toFixed(1)}km`} away
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:"0 0 8px 0" }}>{bank.name}</h3>
                    <div style={{ fontSize:"0.85rem", color:SLATE_L, marginBottom:4 }}>
                      <FaLocationDot style={{ marginRight:4 }} /> {bank.address}, {bank.city}
                    </div>
                    <div style={{ fontSize:"0.85rem", color:SLATE_L, marginBottom:4 }}>
                      <FaPhone style={{ marginRight:4 }} /> {bank.phone}
                    </div>
                    <div style={{ fontSize:"0.85rem", color:SLATE_L, marginBottom:16 }}>
                      <FaClock style={{ marginRight:4 }} /> {bank.timings}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:4, marginBottom:16 }}>
                      {Object.entries(bank.bloodStock || {}).map(([group, count]) => (
                        <BloodStockBadge key={group} group={group} count={count} />
                      ))}
                    </div>
                    <button
                      onClick={() => openGoogleMaps(bank)}
                      style={{
                        background:RED,
                        color:WHITE,
                        border:"none",
                        padding:"12px 16px",
                        borderRadius:8,
                        fontSize:"0.9rem",
                        fontWeight:600,
                        cursor:"pointer",
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        gap:8,
                        transition:"all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = RED_DK;
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = RED;
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <FaRoute /> Get Directions
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PatientBloodBanks;
