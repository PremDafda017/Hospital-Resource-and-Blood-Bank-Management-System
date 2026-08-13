import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaHeartPulse,
  FaFileMedical,
  FaCalendarDays,
  FaMapLocationDot,
  FaBell,
  FaUser,
  FaDroplet,
  FaArrowLeft,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaUsers,
  FaStethoscope,
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaCalendar,
  FaIdCard,
  FaTransgender,
  FaCakeCandles,
  FaHouse,
} from "react-icons/fa6";

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

function HospitalPatientDetails() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [patient, setPatient] = useState(null);

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

  const active = "hospital-patients";

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/all`);
        if (response.ok) {
          const data = await response.json();
          const foundPatient = data.find(p => p._id === patientId || p.clerkId === patientId);
          setPatient(foundPatient || null);
        }
      } catch (error) {
        console.error('Error loading patient:', error);
      }
      setLoading(false);
    };
    loadPatient();
  }, [patientId]);

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

  const StatusPill = ({ status }) => {
    const colors = {
      "Pending": "#F59E0B",
      "Approved": "#16A34A",
      "Rejected": "#DC2626",
      "Completed": "#16A34A",
      "In Progress": "#2563EB",
      "Cancelled": "#DC2626",
      "Scheduled": "#2563EB",
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading patient details...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ fontFamily: FONT, background: SMOKE, minHeight: "100vh", display: "flex" }}>
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
              {!sidebarCollapsed && <span>BloodBank</span>}
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
              }}>
                <span style={{ fontSize:"1.1rem", minWidth:20 }}><FaRightFromBracket /></span>
                {!sidebarCollapsed && <span>Logout</span>}
              </button>
            </SignOutButton>
          </div>
        </aside>

        <main style={{ marginLeft:w, flex:1, minHeight:"100vh" }}>
          <div style={{ padding:"24px 32px" }}>
            <button
              onClick={() => navigate("/hospital-patients")}
              style={{
                background:WHITE,
                border:`1px solid ${BORDER}`,
                padding:"10px 20px",
                borderRadius:8,
                cursor:"pointer",
                fontSize:"0.9rem",
                color:NAVY2,
                display:"flex",
                alignItems:"center",
                gap:8,
                marginBottom:24
              }}
            >
              <FaArrowLeft /> Back to Patients
            </button>
            <div style={{ textAlign:"center", padding:"60px 20px", color:SLATE_L }}>
              <FaUsers style={{ fontSize:"3rem", marginBottom:16, opacity:0.3 }} />
              <p style={{ fontSize:"1rem" }}>Patient not found</p>
            </div>
          </div>
        </main>
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
            }}>
              <span style={{ fontSize:"1.1rem", minWidth:20 }}><FaRightFromBracket /></span>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft:w, flex:1, minHeight:"100vh" }}>
        <div style={{ padding:"24px 32px" }}>
          {/* Header */}
          <div style={{ marginBottom:32 }}>
            <button
              onClick={() => navigate("/hospital-patients")}
              style={{
                background:WHITE,
                border:`1px solid ${BORDER}`,
                padding:"10px 20px",
                borderRadius:8,
                cursor:"pointer",
                fontSize:"0.9rem",
                color:NAVY2,
                display:"flex",
                alignItems:"center",
                gap:8,
                marginBottom:24
              }}
            >
              <FaArrowLeft /> Back to Patients
            </button>
            <h1 style={{ fontSize:"1.8rem", fontWeight:800, color:NAVY2, margin:"0 0 8px 0" }}>
              Patient Details
            </h1>
            <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
              View comprehensive patient information
            </p>
          </div>

          {/* Patient Profile Card */}
          <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding:"24px", marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:24, marginBottom:24 }}>
              <div style={{
                width:80,
                height:80,
                borderRadius:"50%",
                background:`linear-gradient(135deg,${RED},${RED_DK})`,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                fontSize:"2rem",
                color:WHITE,
                fontWeight:700
              }}>
                {patient.profile?.fullName?.charAt(0) || "P"}
              </div>
              <div style={{ flex:1 }}>
                <h2 style={{ fontSize:"1.5rem", fontWeight:700, color:NAVY2, margin:"0 0 8px 0" }}>
                  {patient.profile?.fullName || "N/A"}
                </h2>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:8 }}>
                  <span style={{ display:"flex", alignItems:"center", gap:6, color:SLATE_L, fontSize:"0.9rem" }}>
                    <FaEnvelope /> {patient.email}
                  </span>
                  {patient.profile?.phone && (
                    <span style={{ display:"flex", alignItems:"center", gap:6, color:SLATE_L, fontSize:"0.9rem" }}>
                      <FaPhone /> {patient.profile.phone}
                    </span>
                  )}
                  {patient.profile?.bloodGroup && (
                    <BloodBadge group={patient.profile.bloodGroup} />
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",
              gap:20,
              borderTop:`1px solid ${BORDER}`,
              paddingTop:20
            }}>
              <div style={{ padding:16, background:SMOKE, borderRadius:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <FaIdCard style={{ color:RED }} />
                  <span style={{ fontSize:"0.8rem", color:SLATE_L, fontWeight:600 }}>Patient ID</span>
                </div>
                <div style={{ fontSize:"1rem", color:NAVY2, fontWeight:600 }}>{patient._id}</div>
              </div>
              {patient.profile?.dateOfBirth && (
                <div style={{ padding:16, background:SMOKE, borderRadius:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <FaCakeCandles style={{ color:RED }} />
                    <span style={{ fontSize:"0.8rem", color:SLATE_L, fontWeight:600 }}>Date of Birth</span>
                  </div>
                  <div style={{ fontSize:"1rem", color:NAVY2, fontWeight:600 }}>{patient.profile.dateOfBirth}</div>
                </div>
              )}
              {patient.profile?.gender && (
                <div style={{ padding:16, background:SMOKE, borderRadius:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <FaTransgender style={{ color:RED }} />
                    <span style={{ fontSize:"0.8rem", color:SLATE_L, fontWeight:600 }}>Gender</span>
                  </div>
                  <div style={{ fontSize:"1rem", color:NAVY2, fontWeight:600 }}>{patient.profile.gender}</div>
                </div>
              )}
              {patient.profile?.city && (
                <div style={{ padding:16, background:SMOKE, borderRadius:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <FaLocationDot style={{ color:RED }} />
                    <span style={{ fontSize:"0.8rem", color:SLATE_L, fontWeight:600 }}>Location</span>
                  </div>
                  <div style={{ fontSize:"1rem", color:NAVY2, fontWeight:600 }}>{patient.profile.city}, {patient.profile.state}</div>
                </div>
              )}
              {patient.profile?.pincode && (
                <div style={{ padding:16, background:SMOKE, borderRadius:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <FaHouse style={{ color:RED }} />
                    <span style={{ fontSize:"0.8rem", color:SLATE_L, fontWeight:600 }}>Pincode</span>
                  </div>
                  <div style={{ fontSize:"1rem", color:NAVY2, fontWeight:600 }}>{patient.profile.pincode}</div>
                </div>
              )}
              {patient.profile?.emergencyContact && (
                <div style={{ padding:16, background:SMOKE, borderRadius:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <FaPhone style={{ color:RED }} />
                    <span style={{ fontSize:"0.8rem", color:SLATE_L, fontWeight:600 }}>Emergency Contact</span>
                  </div>
                  <div style={{ fontSize:"1rem", color:NAVY2, fontWeight:600 }}>{patient.profile.emergencyContact}</div>
                </div>
              )}
            </div>
          </div>

          {/* Blood Requests */}
          <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden", marginBottom:24 }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BORDER}` }}>
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>Blood Requests ({patient.bloodRequests?.length || 0})</h2>
            </div>
            {patient.bloodRequests?.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px", color:SLATE_L }}>
                <FaHeartPulse style={{ fontSize:"2rem", marginBottom:12, opacity:0.3 }} />
                <p style={{ fontSize:"0.9rem" }}>No blood requests</p>
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:SMOKE, borderBottom:`1px solid ${BORDER}` }}>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>ID</th>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>Blood Group</th>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>Units</th>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>Hospital</th>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>Date</th>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.bloodRequests.map((req) => (
                      <tr key={req.id} style={{ borderBottom:`1px solid ${BORDER}` }}>
                        <td style={{ padding:"12px 16px", fontSize:"0.85rem", color:NAVY2, fontWeight:600 }}>#{req.id}</td>
                        <td style={{ padding:"12px 16px" }}><BloodBadge group={req.bloodGroup} /></td>
                        <td style={{ padding:"12px 16px", fontSize:"0.85rem", color:NAVY2 }}>{req.units}</td>
                        <td style={{ padding:"12px 16px", fontSize:"0.85rem", color:SLATE_L }}>{req.hospital}</td>
                        <td style={{ padding:"12px 16px", fontSize:"0.85rem", color:SLATE_L }}>{req.date}</td>
                        <td style={{ padding:"12px 16px" }}><StatusPill status={req.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Appointments */}
          <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BORDER}` }}>
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>Appointments ({patient.appointments?.length || 0})</h2>
            </div>
            {patient.appointments?.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px", color:SLATE_L }}>
                <FaCalendarDays style={{ fontSize:"2rem", marginBottom:12, opacity:0.3 }} />
                <p style={{ fontSize:"0.9rem" }}>No appointments</p>
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:SMOKE, borderBottom:`1px solid ${BORDER}` }}>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>ID</th>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>Type</th>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>Date</th>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>Time</th>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>Hospital</th>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>Doctor</th>
                      <th style={{ padding:"12px 16px", textAlign:"left", fontSize:"0.75rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.appointments.map((apt) => (
                      <tr key={apt.id} style={{ borderBottom:`1px solid ${BORDER}` }}>
                        <td style={{ padding:"12px 16px", fontSize:"0.85rem", color:NAVY2, fontWeight:600 }}>#{apt.id}</td>
                        <td style={{ padding:"12px 16px", fontSize:"0.85rem", color:NAVY2 }}>{apt.type}</td>
                        <td style={{ padding:"12px 16px", fontSize:"0.85rem", color:SLATE_L }}>{apt.date}</td>
                        <td style={{ padding:"12px 16px", fontSize:"0.85rem", color:NAVY2 }}>{apt.time}</td>
                        <td style={{ padding:"12px 16px", fontSize:"0.85rem", color:SLATE_L }}>{apt.hospital}</td>
                        <td style={{ padding:"12px 16px", fontSize:"0.85rem", color:NAVY2 }}>{apt.doctor}</td>
                        <td style={{ padding:"12px 16px" }}><StatusPill status={apt.status} /></td>
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

export default HospitalPatientDetails;
