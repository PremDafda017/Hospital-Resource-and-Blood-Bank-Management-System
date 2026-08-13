import React, { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPencil,
  FaCamera,
  FaFloppyDisk,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaHeartPulse,
  FaFileMedical,
  FaCalendarDays,
  FaMapLocationDot,
  FaBell,
  FaDroplet,
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaIdCard,
  FaCalendar,
  FaTransgender,
  FaHouse,
} from "react-icons/fa6";
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

function PatientProfile() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    emergencyContact: "",
    emergencyPhone: "",
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

  const active = "profile";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    if (user?.id) {
      // Load profile from MongoDB
      const loadProfile = async () => {
        try {
          const email = user?.emailAddresses?.[0]?.emailAddress;
          const response = await fetch(`http://localhost:5000/api/patient/${user.id}?email=${email}`);
          if (response.ok) {
            const data = await response.json();
            if (data.profile && Object.keys(data.profile).length > 0) {
              setFormData(data.profile);
            } else {
              // Use default values if no saved profile
              setFormData({
                fullName: user?.firstName + " " + (user?.lastName || "") || "John Doe",
                phone: "",
                dateOfBirth: "",
                gender: "",
                bloodGroup: "",
                address: "",
                city: "",
                state: "",
                pincode: "",
                emergencyContact: "",
                emergencyPhone: "",
              });
            }
            
            // Load profile image from localStorage (images stored separately)
            const imageKey = `patient_profile_image_${user.id}`;
            const savedImage = localStorage.getItem(imageKey);
            if (savedImage) {
              setProfileImage(savedImage);
            }
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
        setLoading(false);
      };
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Resize image to max 300x300 for thumbnail
          const maxSize = 300;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setProfileImage(compressedDataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // Save to MongoDB
    try {
      const response = await fetch(`http://localhost:5000/api/patient/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile: formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      console.log('Profile saved to MongoDB successfully');

      // Save profile image to localStorage (images stored separately)
      if (profileImage) {
        const imageKey = `patient_profile_image_${user.id}`;
        try {
          localStorage.setItem(imageKey, profileImage);
        } catch (quotaError) {
          console.warn('localStorage quota exceeded, image not saved locally:', quotaError.message);
          // Image is still saved to MongoDB, so notify user it's available there
          showNotification({
            type: 'warning',
            title: 'Image Saved to Server',
            message: 'Profile image saved to server but not cached locally due to storage limits.',
            duration: 4000,
            playSound: true
          });
        }
      }

      // Show success notification
      showNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
        duration: 4000,
        playSound: true
      });

      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to save profile. Please try again.',
        duration: 4000,
        playSound: true
      });
    }
  };

  const handleCancel = async () => {
    setEditing(false);
    // Reset form to saved profile values from MongoDB
    if (user?.id) {
      try {
        const email = user?.emailAddresses?.[0]?.emailAddress;
        const response = await fetch(`http://localhost:5000/api/patient/${user.id}?email=${email}`);
        if (response.ok) {
          const data = await response.json();
          if (data.profile && Object.keys(data.profile).length > 0) {
            setFormData(data.profile);
          } else {
            // Reset to default values if no saved profile
            setFormData({
              fullName: user?.firstName + " " + (user?.lastName || "") || "John Doe",
              phone: "",
              dateOfBirth: "",
              gender: "",
              bloodGroup: "",
              address: "",
              city: "",
              state: "",
              pincode: "",
              emergencyContact: "",
              emergencyPhone: "",
            });
          }
          
          // Load profile image from localStorage
          const imageKey = `patient_profile_image_${user.id}`;
          const savedImage = localStorage.getItem(imageKey);
          if (savedImage) {
            setProfileImage(savedImage);
          } else {
            setProfileImage(null);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  };

  const BloodBadge = ({ group }) => (
    <span style={{
      padding: "6px 14px",
      borderRadius: 8,
      background: `${BG_COLOR[group] || RED}15`,
      color: BG_COLOR[group] || RED,
      fontSize: "0.85rem",
      fontWeight: 700,
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading your profile...</p>
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
                My Profile
              </h1>
              <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
                Manage your personal information
              </p>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding:"0" }}>
            <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding:"32px", marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:24 }}>
                <div style={{ position:"relative" }}>
                  <div style={{
                    width:120,
                    height:120,
                    borderRadius:"50%",
                    background: profileImage ? `url(${profileImage}) center/cover` : `${RED}15`,
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    fontSize:"2.5rem",
                    color:RED,
                    border: `4px solid ${RED}20`,
                  }}>
                    {profileImage ? null : <FaUser />}
                  </div>
                  {editing && (
                    <label style={{
                      position:"absolute",
                      bottom:0,
                      right:0,
                      width:36,
                      height:36,
                      borderRadius:"50%",
                      background:RED,
                      color:WHITE,
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      cursor:"pointer",
                      border:"3px solid WHITE",
                    }}>
                      <FaCamera />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display:"none" }}
                      />
                    </label>
                  )}
                </div>
                <div style={{ flex:1 }}>
                  <h2 style={{ fontSize:"1.5rem", fontWeight:800, color:NAVY2, margin:"0 0 8px 0" }}>
                    {formData.fullName}
                  </h2>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                    <BloodBadge group={formData.bloodGroup} />
                    <span style={{ fontSize:"0.9rem", color:SLATE_L }}>
                      <FaEnvelope style={{ marginRight:4 }} /> {user?.emailAddresses?.[0]?.emailAddress || "patient@example.com"}
                    </span>
                  </div>
                  <p style={{ fontSize:"0.85rem", color:SLATE_L, margin:0 }}>
                    Patient ID: {user?.id || "PAT-001"}
                  </p>
                </div>
              </div>

              <div style={{ marginTop:24, paddingTop:24, borderTop:`1px solid ${BORDER}` }}>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      background:RED,
                      color:WHITE,
                      border:"none",
                      borderRadius:8,
                      padding:"10px 16px",
                      fontSize:"0.85rem",
                      fontWeight:600,
                      cursor:"pointer",
                      transition:"all 0.2s",
                      display:"flex",
                      alignItems:"center",
                      gap:8
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = RED_DK}
                    onMouseLeave={(e) => e.currentTarget.style.background = RED}
                  >
                    <FaPencil /> Edit Profile
                  </button>
                ) : (
                  <div style={{ display:"flex", gap:8 }}>
                    <button
                      onClick={handleCancel}
                      style={{
                        display:"flex",
                        alignItems:"center",
                        gap:8,
                        background:SMOKE,
                        color:NAVY2,
                        border:`1px solid ${BORDER}`,
                        borderRadius:8,
                        padding:"10px 16px",
                        fontSize:"0.85rem",
                        fontWeight:600,
                        cursor:"pointer",
                        transition:"all 0.2s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = BORDER}
                      onMouseLeave={(e) => e.currentTarget.style.background = SMOKE}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      style={{
                        display:"flex",
                        alignItems:"center",
                        gap:8,
                        background:RED,
                        color:WHITE,
                        border:"none",
                        borderRadius:8,
                        padding:"10px 16px",
                        fontSize:"0.85rem",
                        fontWeight:600,
                        cursor:"pointer",
                        transition:"all 0.2s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = RED_DK}
                      onMouseLeave={(e) => e.currentTarget.style.background = RED}
                    >
                      <FaFloppyDisk /> Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, padding:"32px" }}>
              <h3 style={{ fontSize:"1.2rem", fontWeight:700, color:NAVY2, margin:"0 0 24px 0" }}>
                Personal Information
              </h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:24 }}>
                <div>
                  <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                    />
                  ) : (
                    <div style={{ padding:"12px", borderRadius:8, background:SMOKE, fontSize:"0.9rem", color:NAVY2 }}>
                      {formData.fullName}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                    Email (Cannot be changed)
                  </label>
                  <div style={{ padding:"12px", borderRadius:8, background:SMOKE, fontSize:"0.9rem", color:SLATE_L }}>
                    {user?.emailAddresses?.[0]?.emailAddress || "patient@example.com"}
                  </div>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                    />
                  ) : (
                    <div style={{ padding:"12px", borderRadius:8, background:SMOKE, fontSize:"0.9rem", color:NAVY2 }}>
                      <FaPhone style={{ marginRight:8 }} /> {formData.phone}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                    Date of Birth
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                  />
                ) : (
                  <div style={{ padding:"12px", borderRadius:8, background:SMOKE, fontSize:"0.9rem", color:NAVY2 }}>
                    <FaCalendar style={{ marginRight:8 }} /> {formData.dateOfBirth}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Gender
                </label>
                {editing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div style={{ padding:"12px", borderRadius:8, background:SMOKE, fontSize:"0.9rem", color:NAVY2 }}>
                    <FaTransgender style={{ marginRight:8 }} /> {formData.gender}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Blood Group
                </label>
                {editing ? (
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <BloodBadge group={formData.bloodGroup} />
                )}
              </div>
            </div>

            <h3 style={{ fontSize:"1.2rem", fontWeight:700, color:NAVY2, margin:"32px 0 24px 0" }}>
              Address Information
            </h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:24 }}>
              <div style={{ gridColumn:"1 / -1" }}>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Address
                </label>
                {editing ? (
                  <textarea
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE, resize:"vertical" }}
                  />
                ) : (
                  <div style={{ padding:"12px", borderRadius:8, background:SMOKE, fontSize:"0.9rem", color:NAVY2 }}>
                    <FaLocationDot style={{ marginRight:8 }} /> {formData.address}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  City
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                  />
                ) : (
                  <div style={{ padding:"12px", borderRadius:8, background:SMOKE, fontSize:"0.9rem", color:NAVY2 }}>
                    {formData.city}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  State
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                  />
                ) : (
                  <div style={{ padding:"12px", borderRadius:8, background:SMOKE, fontSize:"0.9rem", color:NAVY2 }}>
                    {formData.state}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Pincode
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                  />
                ) : (
                  <div style={{ padding:"12px", borderRadius:8, background:SMOKE, fontSize:"0.9rem", color:NAVY2 }}>
                    {formData.pincode}
                  </div>
                )}
              </div>
            </div>

            <h3 style={{ fontSize:"1.2rem", fontWeight:700, color:NAVY2, margin:"32px 0 24px 0" }}>
              Emergency Contact
            </h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:24 }}>
              <div>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Contact Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                  />
                ) : (
                  <div style={{ padding:"12px", borderRadius:8, background:SMOKE, fontSize:"0.9rem", color:NAVY2 }}>
                    <FaUser style={{ marginRight:8 }} /> {formData.emergencyContact}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
                  Contact Phone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                    style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, background:WHITE }}
                  />
                ) : (
                  <div style={{ padding:"12px", borderRadius:8, background:SMOKE, fontSize:"0.9rem", color:NAVY2 }}>
                    <FaPhone style={{ marginRight:8 }} /> {formData.emergencyPhone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}

export default PatientProfile;
