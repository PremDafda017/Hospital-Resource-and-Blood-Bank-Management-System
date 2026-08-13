import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FaFileMedical,
  FaDownload,
  FaEye,
  FaFilter,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaHeartPulse,
  FaCalendarDays,
  FaMapLocationDot,
  FaBell,
  FaUser,
  FaDroplet,
} from "react-icons/fa6";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const NAVY = "#0F172A";
const NAVY2 = "#1E293B";
const SLATE_L = "#64748B";
const BORDER = "#E2E8F0";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";
const SIDEBAR_W = 260;
const SIDEBAR_COL = NAVY;

function PatientReports() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

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

  const active = "my-reports";

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  const loadPatientData = async () => {
    try {
      // Load blood requests from backend
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const bloodRequestsResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}?email=${email}`);
      let bloodRequestsData = [];
      
      if (bloodRequestsResponse.ok) {
        const data = await bloodRequestsResponse.json();
        bloodRequestsData = data.bloodRequests || [];
      }
      
      // Generate reports from blood requests
      const generatedReports = bloodRequestsData.map((request, index) => ({
        id: index + 1,
        type: "Blood Request",
        date: request.requestDate || new Date().toISOString().split('T')[0],
        status: request.status || "Pending",
        bloodGroup: request.bloodGroup || "Unknown",
        hospital: request.hospitalName || "Unknown Hospital",
        units: request.unitsRequired || 1,
      }));
      
      setReports(generatedReports);
      setLoading(false);
    } catch (error) {
      console.error('Error loading patient data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadPatientData();
    }
  }, [user, loadPatientData]);

  const filteredReports = filterType === "all" ? reports : reports.filter(r => r.type === filterType);

  const reportTypes = [...new Set(reports.map(r => r.type))];

  const StatusBadge = ({ status }) => {
    const colors = {
      "Available": "#16A34A",
      "Pending": "#F59E0B",
      "Processing": "#2563EB",
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

  const TypeBadge = ({ type }) => {
    const colors = {
      "Blood Request": "#C41230",
      "Blood Test": "#DC2626",
      "Biochemistry": "#7C3AED",
      "Hormone Test": "#2563EB",
      "Imaging": "#16A34A",
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
        {type}
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading your reports...</p>
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
                My Reports
              </h1>
              <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
                View your medical reports
              </p>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding:"0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  style={{
                    background:WHITE,
                    border:`1px solid ${BORDER}`,
                    padding:"8px 16px",
                    borderRadius:8,
                    fontSize:"0.9rem",
                    cursor:"pointer",
                    display:"flex",
                    alignItems:"center",
                    gap:8
                  }}
                >
                  <FaFilter /> Filter
                </button>
                {showFilter && (
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{
                      padding:"8px 16px",
                      border:`1px solid ${BORDER}`,
                      borderRadius:8,
                      fontSize:"0.9rem",
                      cursor:"pointer"
                    }}
                  >
                    <option value="all">All Types</option>
                    {reportTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Reports List */}
            {filteredReports.length === 0 ? (
              <div style={{ textAlign:"center", padding:"48px", color:SLATE_L }}>
                <FaFileMedical style={{ fontSize:48, marginBottom:16 }} />
                <h3 style={{ fontSize:"1.2rem", fontWeight:600, color:NAVY2, margin:"0 0 8px 0" }}>
                  No Reports Found
                </h3>
                <p>You don't have any medical reports yet.</p>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:20 }}>
                {filteredReports.map((report) => (
                  <div key={report.id} style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding:"20px", display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <h3 style={{ fontSize:"1rem", fontWeight:700, color:NAVY2, margin:"0 0 4px 0" }}>{report.name}</h3>
                        <p style={{ fontSize:"0.8rem", color:SLATE_L, margin:0 }}>{report.date ? new Date(report.date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <StatusBadge status={report.status} />
                    </div>
                    <div>
                      <TypeBadge type={report.type} />
                    </div>
                    {report.type === "Blood Request" && (
                      <div style={{ fontSize:"0.8rem", color:SLATE_L, marginTop:4 }}>
                        <div style={{ marginBottom:2 }}><strong>Blood Group:</strong> {report.bloodGroup}</div>
                        <div style={{ marginBottom:2 }}><strong>Units:</strong> {report.units}</div>
                        <div style={{ marginBottom:2 }}><strong>Hospital:</strong> {report.hospital}</div>
                        {report.amount > 0 && <div><strong>Amount:</strong> ₹{report.amount}</div>}
                      </div>
                    )}
                    <div style={{ display:"flex", gap:8, marginTop:"auto" }}>
                      <button
                        onClick={() => alert("View report: " + report.name)}
                        style={{
                          flex:1,
                          background:SMOKE,
                          color:NAVY2,
                          border:`1px solid ${BORDER}`,
                          padding:"8px 12px",
                          borderRadius:6,
                          fontSize:"0.85rem",
                          fontWeight:600,
                          cursor:"pointer",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          gap:4
                        }}
                      >
                        <FaEye /> View
                      </button>
                      <button
                        onClick={() => alert("Download report: " + report.name)}
                        style={{
                          flex:1,
                          background:SMOKE,
                          color:NAVY2,
                          border:`1px solid ${BORDER}`,
                          padding:"8px 12px",
                          borderRadius:6,
                          fontSize:"0.85rem",
                          fontWeight:600,
                          cursor:"pointer",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          gap:4
                        }}
                      >
                        <FaDownload /> Download
                      </button>
                    </div>
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

export default PatientReports;
