import React, { useState } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaDroplet,
  FaPlus,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaTimeline,
  FaHeartPulse,
  FaUsers,
  FaFileMedical,
  FaBell,
  FaUser,
  FaBuilding,
  FaAward,
  FaCalendarCheck,
  FaXmark
} from "react-icons/fa6";
import { useBloodBank } from "../../contexts/BloodBankContext";
import { useNotification } from "../../contexts/NotificationContext";
import { breakpoints, animationVariants, useResponsive } from "../../utils/responsiveDesign";

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

function BloodBankAddStock() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const screenSize = useResponsive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { triggerRefresh, addStockHistoryEntry, addNotification } = useBloodBank();

  // Auto-collapse sidebar on mobile
  const isMobile = screenSize === 'xs' || screenSize === 'sm';
  const isTablet = screenSize === 'md';
  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 68 : SIDEBAR_W);

  const [formData, setFormData] = useState({
    bloodGroup: "",
    units: "",
    donorName: "",
    collectionDate: "",
    expiryDate: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
    email: "",
    notes: "",
    image: ""
  });
  const [imagePreview, setImagePreview] = useState("");

  const nav = [
    { key:"bloodbank-dashboard", icon:<FaChartLine/>, label:"Dashboard", path:"/bloodbank-dashboard" },
    { key:"bloodbank-inventory", icon:<FaDroplet/>, label:"Blood Inventory", path:"/bloodbank-inventory" },
    { key:"bloodbank-add-stock", icon:<FaPlus/>, label:"Add Blood Stock", path:"/bloodbank-add-stock" },
    { key:"bloodbank-stock-history", icon:<FaTimeline/>, label:"Stock History", path:"/bloodbank-stock-history" },
    { key:"bloodbank-requests", icon:<FaHeartPulse/>, label:"Blood Requests", path:"/bloodbank-requests" },
    { key:"donation-requests", icon:<FaHeartPulse/>, label:"Donation Requests", path:"/donation-requests" },
    { key:"campaign-management", icon:<FaAward/>, label:"Campaign Management", path:"/campaign-management" },
    { key:"appointment-management", icon:<FaCalendarCheck/>, label:"Appointments", path:"/appointment-management" },
    { key:"bloodbank-donors", icon:<FaUsers/>, label:"Donor List", path:"/bloodbank-donors" },
    { key:"bloodbank-details", icon:<FaBuilding/>, label:"Blood Bank Details", path:"/bloodbank-details" },
    { key:"bloodbank-reports", icon:<FaFileMedical/>, label:"Reports", path:"/bloodbank-reports" },
    { key:"bloodbank-notifications", icon:<FaBell/>, label:"Notifications", path:"/bloodbank-notifications" },
    { key:"bloodbank-profile", icon:<FaUser/>, label:"Profile", path:"/bloodbank-profile" },
  ];

  const active = "bloodbank-add-stock";

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, image: reader.result});
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // First, try to find existing inventory for this blood group
      const findResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/blood-inventory`);
      if (findResponse.ok) {
        const inventoryData = await findResponse.json();
        const existingInventory = inventoryData.find(
          item => item.bloodGroup === formData.bloodGroup
        );

        if (existingInventory) {
          // Update existing inventory (don't send image to avoid payload size issues)
          const updateResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/blood-inventory/${existingInventory._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              units: parseInt(existingInventory.units) + parseInt(formData.units)
            })
          });

          if (updateResponse.ok) {
            // Add stock history entry with full details
            await addStockHistoryEntry({
              date: new Date().toISOString().split('T')[0],
              bloodGroup: formData.bloodGroup,
              units: parseInt(formData.units),
              type: "Added",
              donor: formData.donorName,
              donorPhone: formData.phone,
              donorEmail: formData.email,
              donorPhoto: formData.image,
              city: formData.city,
              state: formData.state,
              pinCode: formData.pinCode,
              collectionDate: formData.collectionDate,
              expiryDate: formData.expiryDate,
              notes: formData.notes,
              bloodBank: "City General Hospital"
            });

            // Add notification
            await addNotification({
              type: "Stock Added",
              message: `${formData.units} units of ${formData.bloodGroup} blood added by ${formData.donorName}`,
              date: new Date().toISOString(),
              priority: "info"
            });

            // Show popup notification
            showNotification({
              type: 'success',
              title: 'Blood Stock Updated',
              message: `${formData.bloodGroup} now has ${parseInt(existingInventory.units) + parseInt(formData.units)} units.`,
              duration: 5000,
              playSound: true
            });

            // Trigger refresh to update all components
            triggerRefresh();
          } else {
            showNotification({
              type: 'error',
              title: 'Update Failed',
              message: 'Failed to update blood inventory.',
              duration: 4000,
              playSound: true
            });
            return;
          }
        } else {
          // Add new inventory record (don't send image to avoid payload size issues)
          const addResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/blood-inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inventory: {
                bloodGroup: formData.bloodGroup,
                units: parseInt(formData.units),
                hospital: "City General Hospital",
                expiryDate: formData.expiryDate,
                lastUpdated: new Date().toISOString().split('T')[0]
              }
            })
          });

          if (addResponse.ok) {
            // Add stock history entry with full details
            await addStockHistoryEntry({
              date: new Date().toISOString().split('T')[0],
              bloodGroup: formData.bloodGroup,
              units: parseInt(formData.units),
              type: "Added",
              donor: formData.donorName,
              donorPhone: formData.phone,
              donorEmail: formData.email,
              donorPhoto: formData.image,
              city: formData.city,
              state: formData.state,
              pinCode: formData.pinCode,
              collectionDate: formData.collectionDate,
              expiryDate: formData.expiryDate,
              notes: formData.notes,
              bloodBank: "City General Hospital"
            });

            // Add notification
            await addNotification({
              type: "Stock Added",
              message: `${formData.units} units of ${formData.bloodGroup} blood added by ${formData.donorName}`,
              date: new Date().toISOString(),
              priority: "info"
            });

            // Show popup notification
            showNotification({
              type: 'success',
              title: 'Blood Stock Added',
              message: `${formData.bloodGroup}: ${formData.units} units added successfully.`,
              duration: 5000,
              playSound: true
            });

            // Trigger refresh to update all components
            triggerRefresh();
          } else {
            showNotification({
              type: 'error',
              title: 'Add Failed',
              message: 'Failed to add blood inventory.',
              duration: 4000,
              playSound: true
            });
            return;
          }
        }
      }

      navigate("/bloodbank-inventory");
    } catch (error) {
      console.error('Error adding blood stock:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error occurred while adding blood stock.',
        duration: 4000,
        playSound: true
      });
    }
  };

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
                color:"#F87171",
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
              Add Blood Stock
            </h1>
            <div style={{ width:32 }} />
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
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div>
              <h1 style={{ fontSize:"1.4rem", fontWeight:700, color:NAVY2, margin:0 }}>Add Blood Stock</h1>
              <p style={{ fontSize:"0.85rem", color:SLATE_L, margin:"4px 0 0 0" }}>Add new blood units to inventory</p>
            </div>
          </div>
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

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ padding:isMobile ? "16px" : isTablet ? "20px" : "32px", display:"flex", justifyContent:"center" }}
        >
          <div style={{
            background:WHITE, borderRadius:12, padding:isMobile ? "20px" : isTablet ? "24px" : "32px",
            border:`1px solid ${BORDER}`, boxShadow:"0 1px 3px rgba(0,0,0,0.1)",
            width:"100%", maxWidth:600
          }}>
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:isMobile ? 16 : 20 }}>
              <div>
                <label style={{ display:"block", fontSize:isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Blood Group *</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  required
                  style={{ width:"100%", padding:isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2, background:WHITE }}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Units *</label>
                <input
                  type="number"
                  value={formData.units}
                  onChange={(e) => setFormData({...formData, units: e.target.value})}
                  required
                  min="1"
                  style={{ width:"100%", padding:isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}
                />
              </div>
              <div>
                <label style={{ display:"block", fontSize:isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Donor Name *</label>
                <input
                  type="text"
                  value={formData.donorName}
                  onChange={(e) => setFormData({...formData, donorName: e.target.value})}
                  required
                  style={{ width:"100%", padding:isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}
                />
              </div>
              <div>
                <label style={{ display:"block", fontSize:isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Collection Date *</label>
                <input
                  type="date"
                  value={formData.collectionDate}
                  onChange={(e) => setFormData({...formData, collectionDate: e.target.value})}
                  required
                  style={{ width:"100%", padding:isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}
                />
              </div>
              <div>
                <label style={{ display:"block", fontSize:isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Expiry Date *</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  required
                  style={{ width:"100%", padding:isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}
                />
              </div>
              <div>
                <label style={{ display:"block", fontSize:isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                  style={{ width:"100%", padding:isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}
                />
              </div>
              <div>
                <label style={{ display:"block", fontSize:isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  required
                  style={{ width:"100%", padding:isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}
                />
              </div>
              <div>
                <label style={{ display:"block", fontSize:isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>PIN Code *</label>
                <input
                  type="text"
                  value={formData.pinCode}
                  onChange={(e) => setFormData({...formData, pinCode: e.target.value})}
                  required
                  style={{ width:"100%", padding:isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}
                />
              </div>
              <div>
                <label style={{ display:"block", fontSize:isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  style={{ width:"100%", padding:isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}
                />
              </div>
              <div>
                <label style={{ display:"block", fontSize:isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  style={{ width:"100%", padding:isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}
                />
              </div>
              <div>
                <label style={{ display:"block", fontSize:isMobile ? "0.8rem" : "0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Donor Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ width:"100%", padding:isMobile ? "10px" : "12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:isMobile ? "0.85rem" : "0.9rem", color:NAVY2 }}
                />
                {imagePreview && (
                  <div style={{ marginTop:12 }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width:isMobile ? 80 : 100, height:isMobile ? 80 : 100, borderRadius:8, objectFit:"cover", border:`1px solid ${BORDER}` }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>Notes</label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${BORDER}`, fontSize:"0.9rem", color:NAVY2, resize:"vertical" }}
                />
              </div>
              <div style={{ display:"flex", gap:12, marginTop:8 }}>
                <button
                  type="submit"
                  style={{
                    flex:1,
                    background:RED,
                    border:"none",
                    padding:"12px 24px",
                    borderRadius:8,
                    cursor:"pointer",
                    color:WHITE,
                    fontSize:"0.9rem",
                    fontWeight:600,
                    transition:"all 0.2s"
                  }}
                >
                  Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/bloodbank-inventory")}
                  style={{
                    flex:1,
                    background:"transparent",
                    border:`1px solid ${BORDER}`,
                    padding:"12px 24px",
                    borderRadius:8,
                    cursor:"pointer",
                    color:NAVY2,
                    fontSize:"0.9rem",
                    fontWeight:600,
                    transition:"all 0.2s"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default BloodBankAddStock;
