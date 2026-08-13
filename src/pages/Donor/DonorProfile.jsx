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
  FaHandHoldingHeart,
  FaCertificate,
  FaCalendar,
  FaBell,
  FaDroplet,
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaIdCard,
  FaTransgender,
  FaWeightScale,
  FaHeartPulse,
  FaHouse,
  FaGear,
  FaAward,
  FaClockRotateLeft,
  FaBullhorn,
  FaSyringe,
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

function DonorProfile() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    phone: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    bloodGroup: "",
    weight: "",
    lastDonation: "",
    medicalConditions: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const nav = [
    { key: "dashboard", icon: <FaHouse />, label: "Dashboard", path: "/donor-dashboard" },
    { key: "eligibility", icon: <FaHeartPulse />, label: "Eligibility Checker", path: "/donor-dashboard" },
    { key: "campaigns", icon: <FaBullhorn />, label: "Campaigns", path: "/donor-dashboard" },
    { key: "appointments", icon: <FaCalendar />, label: "My Appointments", path: "/donor-dashboard" },
    { key: "history", icon: <FaClockRotateLeft />, label: "Donation History", path: "/donor-dashboard" },
    { key: "certificates", icon: <FaCertificate />, label: "Certificates", path: "/donor-dashboard" },
    { key: "notifications", icon: <FaBell />, label: "Notifications", path: "/donor-dashboard" },
    { key: "profile", icon: <FaUser />, label: "My Profile", path: "/donor-profile" },
  ];

  const active = "profile";

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    if (user?.id) {
      const loadProfile = async () => {
        try {
          const email = user?.emailAddresses?.[0]?.emailAddress;
          const response = await fetch(`http://localhost:5000/api/donor/${user.id}?email=${email}`);
          if (response.ok) {
            const data = await response.json();
            if (data.profile && Object.keys(data.profile).length > 0) {
              setFormData(data.profile);
            } else {
              setFormData({
                firstName: user?.firstName || "",
                lastName: user?.lastName || "",
                fullName: user?.fullName || "",
                phone: "",
                dateOfBirth: "",
                gender: "",
                bloodGroup: "",
                weight: "",
                lastDonation: "",
                medicalConditions: "",
                address: "",
                city: "",
                state: "",
                pincode: "",
                emergencyContact: "",
                emergencyPhone: "",
              });
            }
            
            const imageKey = `donor_profile_image_${user.id}`;
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
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setProfileImage(compressedDataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/donor/${user.id}/profile`, {
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

      if (profileImage) {
        const imageKey = `donor_profile_image_${user.id}`;
        try {
          localStorage.setItem(imageKey, profileImage);
        } catch (quotaError) {
          console.warn('localStorage quota exceeded, image not saved locally:', quotaError.message);
          showNotification({
            type: 'warning',
            title: 'Image Saved to Server',
            message: 'Profile image saved to server but not cached locally due to storage limits.',
            duration: 4000,
            playSound: true
          });
        }
      }

      // Trigger eligibility checker to reload data
      localStorage.setItem('donor_profile_updated', Date.now().toString());

      showNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your donor profile has been updated successfully',
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
    if (user?.id) {
      try {
        const email = user?.emailAddresses?.[0]?.emailAddress;
        const response = await fetch(`http://localhost:5000/api/donor/${user.id}?email=${email}`);
        if (response.ok) {
          const data = await response.json();
          if (data.profile && Object.keys(data.profile).length > 0) {
            setFormData(data.profile);
          } else {
            setFormData({
              firstName: user?.firstName || "",
              lastName: user?.lastName || "",
              fullName: user?.fullName || "",
              phone: "",
              dateOfBirth: "",
              gender: "",
              bloodGroup: "",
              weight: "",
              lastDonation: "",
              medicalConditions: "",
              address: "",
              city: "",
              state: "",
              pincode: "",
              emergencyContact: "",
              emergencyPhone: "",
            });
          }
          
          const imageKey = `donor_profile_image_${user.id}`;
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
            {!sidebarCollapsed && <span>Donor Portal</span>}
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
                Donor Profile
              </h1>
              <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
                Manage your donor information
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
                    {formData.firstName} {formData.lastName}
                  </h2>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                    <BloodBadge group={formData.bloodGroup} />
                    <span style={{ fontSize:"0.9rem", color:SLATE_L }}>
                      <FaEnvelope style={{ marginRight:4 }} /> {user?.emailAddresses?.[0]?.emailAddress || "donor@example.com"}
                    </span>
                  </div>
                  <p style={{ fontSize:"0.85rem", color:SLATE_L, margin:0 }}>
                    Donor ID: {user?.id || "DON-001"}
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
                      gap:8,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = RED_DK}
                    onMouseLeave={e => e.currentTarget.style.background = RED}
                  >
                    <FaPencil /> Edit Profile
                  </button>
                ) : (
                  <div style={{ display:"flex", gap:12 }}>
                    <button
                      onClick={handleCancel}
                      style={{
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
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
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
                        gap:8,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = RED_DK}
                      onMouseLeave={e => e.currentTarget.style.background = RED}
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
              
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Email (Cannot be changed)
                  </label>
                  <div style={{
                    width:"100%",
                    padding:"12px 16px",
                    borderRadius:8,
                    background:SMOKE,
                    color:SLATE_L,
                    fontSize:"0.95rem",
                  }}>
                    {user?.emailAddresses?.[0]?.emailAddress || "donor@example.com"}
                  </div>
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => {
                      const newDateOfBirth = e.target.value;
                      setFormData({
                        ...formData,
                        dateOfBirth: newDateOfBirth,
                        age: newDateOfBirth ? new Date().getFullYear() - new Date(newDateOfBirth).getFullYear() : ""
                      });
                    }}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Age (Auto-calculated)
                  </label>
                  <div style={{
                    width:"100%",
                    padding:"12px 16px",
                    borderRadius:8,
                    background:SMOKE,
                    color:SLATE_L,
                    fontSize:"0.95rem",
                  }}>
                    {formData.age ? `${formData.age} years` : "Not set"}
                  </div>
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                      cursor: editing ? "pointer" : "default",
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <h3 style={{ fontSize:"1.2rem", fontWeight:700, color:NAVY2, margin:"0 0 24px 0", paddingTop:24, borderTop:`1px solid ${BORDER}` }}>
                Health Information
              </h3>
              
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                      cursor: editing ? "pointer" : "default",
                    }}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Last Donation
                  </label>
                  <select
                    value={formData.lastDonation}
                    onChange={(e) => setFormData({...formData, lastDonation: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                      cursor: editing ? "pointer" : "default",
                    }}
                  >
                    <option value="">Last Donation</option>
                    <option value="Never donated">Never donated</option>
                    <option value="Within 3 months">Within 3 months</option>
                    <option value="Within 6 months">Within 6 months</option>
                    <option value="Over 6 months ago">Over 6 months ago</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Medical Conditions
                  </label>
                  <select
                    value={formData.medicalConditions}
                    onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                      cursor: editing ? "pointer" : "default",
                    }}
                  >
                    <option value="">Any medical conditions?</option>
                    <option value="None">None</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Hypertension">Hypertension</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <h3 style={{ fontSize:"1.2rem", fontWeight:700, color:NAVY2, margin:"0 0 24px 0", paddingTop:24, borderTop:`1px solid ${BORDER}` }}>
                Address Information
              </h3>
              
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>
              </div>

              <h3 style={{ fontSize:"1.2rem", fontWeight:700, color:NAVY2, margin:"0 0 24px 0", paddingTop:24, borderTop:`1px solid ${BORDER}` }}>
                Emergency Contact
              </h3>
              
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE, marginBottom:8 }}>
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                    disabled={!editing}
                    style={{
                      width:"100%",
                      padding:"12px 16px",
                      borderRadius:8,
                      border:`1px solid ${editing ? BORDER : "transparent"}`,
                      background: editing ? WHITE : SMOKE,
                      color:NAVY2,
                      fontSize:"0.95rem",
                      outline:"none",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DonorProfile;
