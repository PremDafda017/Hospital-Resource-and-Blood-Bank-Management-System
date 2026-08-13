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
  FaEye,
  FaDownload,
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

function HospitalReports() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  const active = "hospital-reports";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    // Load all reports from MongoDB
    const loadReports = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/patient/all`);
        if (response.ok) {
          const data = await response.json();
          // Flatten all reports from all patients
          const allReports = [];
          data.forEach(patient => {
            if (patient.reports && Array.isArray(patient.reports)) {
              patient.reports.forEach(report => {
                allReports.push({
                  ...report,
                  patientName: patient.profile?.fullName || "Unknown",
                  patientEmail: patient.email,
                  patientId: patient._id
                });
              });
            }
          });
          setReports(allReports);
        }
      } catch (error) {
        console.error('Error loading reports:', error);
      }
      setLoading(false);
    };
    loadReports();
  }, []);

  const filteredReports = reports.filter(report => 
    report.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.hospital?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading reports...</p>
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
                Hospital Reports
              </h1>
              <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
                View and manage medical reports
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
                  placeholder="Search reports..."
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
            </div>
          </div>

          {/* Reports Table */}
          <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>All Reports ({filteredReports.length})</h2>
            </div>
            {filteredReports.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:SLATE_L }}>
                <FaFileMedical style={{ fontSize:"3rem", marginBottom:16, opacity:0.3 }} />
                <p style={{ fontSize:"1rem", marginBottom:16 }}>No reports found</p>
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:SMOKE, borderBottom:`1px solid ${BORDER}` }}>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Report ID</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Patient</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Type</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Date</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Hospital</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Doctor</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id} style={{ borderBottom:`1px solid ${BORDER}`, transition:"background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = SMOKE} onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2, fontWeight:600 }}>#{report.id}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{report.patientName}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{report.type}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>{report.date}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>{report.hospital}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{report.doctor}</td>
                        <td style={{ padding:"16px 24px" }}>
                          <div style={{ display:"flex", gap:8 }}>
                            <button
                              style={{
                                background:WHITE,
                                border:`1px solid ${BORDER}`,
                                padding:"6px 12px",
                                borderRadius:6,
                                cursor:"pointer",
                                fontSize:"0.85rem",
                                color:NAVY2,
                                display:"flex",
                                alignItems:"center",
                                gap:4
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                              onMouseLeave={e => e.currentTarget.style.background = WHITE}
                            >
                              <FaEye /> View
                            </button>
                            <button
                              style={{
                                background:WHITE,
                                border:`1px solid ${BORDER}`,
                                padding:"6px 12px",
                                borderRadius:6,
                                cursor:"pointer",
                                fontSize:"0.85rem",
                                color:NAVY2,
                                display:"flex",
                                alignItems:"center",
                                gap:4
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                              onMouseLeave={e => e.currentTarget.style.background = WHITE}
                            >
                              <FaDownload /> Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

export default HospitalReports;
