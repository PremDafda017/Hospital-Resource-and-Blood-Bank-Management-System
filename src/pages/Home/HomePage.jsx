import React, { useState, useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
    FaRightFromBracket,
    FaDroplet,
    FaChartLine,
    FaHandHoldingMedical,
    FaMagnifyingGlass,
    FaBell,
    FaSun,
    FaMoon,
    FaHospital,
    FaBars,
    FaXmark
} from "react-icons/fa6";

/* ─────────────────────────────────────────────
   INLINE STYLES (no external CSS required)
   Palette: Crimson #C41230 · Deep #8B0000 · Slate #1E293B
            Smoke #F8FAFC · Mist #EFF6FF · Pure #FFFFFF
   Type: Inter (system-stack fallback)
───────────────────────────────────────────── */

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED      = "#C41230";
const RED_DARK = "#8B0000";
const RED_GLOW = "rgba(196,18,48,0.15)";
const SLATE    = "#1E293B";
const SLATE_MD = "#334155";
const SLATE_LT = "#64748B";
const SMOKE    = "#F8FAFC";
const WHITE    = "#FFFFFF";
const BORDER   = "#E2E8F0";

// ── Animated Counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.ceil(target / 60);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(start);
          }, 25);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Blood Group Badge ─────────────────────────────────────────────────────────
const BG_COLOR = { "A+":"#16A34A","A-":"#15803D","B+":"#2563EB","B-":"#1D4ED8","AB+":"#7C3AED","AB-":"#6D28D9","O+":RED,"O-":RED_DARK };

// ── Section Wrapper ───────────────────────────────────────────────────────────
function Section({ children, bg = WHITE, id, theme = "light" }) {
  const bgColor = theme === "dark" ? (bg === WHITE ? "#0F172A" : bg) : bg;
  return (
    <section id={id} style={{ background:bgColor, padding:"96px 0", position:"relative" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px" }}>{children}</div>
    </section>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
      <div style={{ width:32, height:3, background:`linear-gradient(90deg,${RED},${RED_DARK})`, borderRadius:2 }}/>
      <span style={{ color:RED, fontWeight:700, fontSize:"0.8rem", textTransform:"uppercase", letterSpacing:"0.1em" }}>{text}</span>
    </div>
  );
}

function SectionTitle({ children, light = false, theme = "light" }) {
  const color = light ? WHITE : (theme === "dark" ? WHITE : SLATE);
  return (
    <h2 style={{ fontFamily:FONT, fontSize:"clamp(2rem,4vw,2.8rem)", fontWeight:800, color:color, lineHeight:1.15, marginBottom:16 }}>
      {children}
    </h2>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ children, style = {}, hover = true, theme = "light" }) {
  const [hovered, setHovered] = useState(false);
  const bgColor = theme === "dark" ? "#1E293B" : WHITE;
  const borderColor = theme === "dark" ? "#334155" : BORDER;
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background:bgColor, borderRadius:20, border:`1px solid ${borderColor}`,
        padding:"28px 28px", boxShadow: hovered ? "0 20px 60px rgba(0,0,0,0.12)" : "0 4px 20px rgba(0,0,0,0.06)",
        transition:"all 0.3s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        ...style
      }}
    >
      {children}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
function Input({ placeholder, type = "text", style = {}, theme = "light", name, required, value, onChange, defaultValue }) {
  const [focused, setFocused] = useState(false);
  const bgColor = theme === "dark" ? "#1E293B" : WHITE;
  const textColor = theme === "dark" ? WHITE : SLATE;
  const borderColor = focused ? RED : (theme === "dark" ? "#334155" : BORDER);
  return (
    <input
      type={type}
      name={name}
      required={required}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width:"100%", padding:"14px 18px", borderRadius:12, border:`2px solid ${borderColor}`,
        fontFamily:FONT, fontSize:"0.95rem", color:textColor, outline:"none", background:bgColor,
        transition:"border-color 0.2s", boxSizing:"border-box", ...style
      }}
    />
  );
}

function Select({ options, style = {}, theme = "light", name, value, onChange, required }) {
  const [focused, setFocused] = useState(false);
  const bgColor = theme === "dark" ? "#1E293B" : WHITE;
  const textColor = theme === "dark" ? WHITE : SLATE;
  const borderColor = focused ? RED : (theme === "dark" ? "#334155" : BORDER);
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width:"100%", padding:"14px 18px", borderRadius:12, border:`2px solid ${borderColor}`,
        fontFamily:FONT, fontSize:"0.95rem", color:textColor, outline:"none", background:bgColor,
        transition:"border-color 0.2s", boxSizing:"border-box", appearance:"none", cursor:"pointer", ...style
      }}
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function PrimaryBtn({ children, style = {}, onClick, type = "button", disabled = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: disabled ? SLATE_LT : (hovered ? `linear-gradient(135deg,${RED_DARK},${RED})` : `linear-gradient(135deg,${RED},${RED_DARK})`),
        color:WHITE, border:"none", borderRadius:12, padding:"14px 28px", fontFamily:FONT,
        fontSize:"0.95rem", fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: hovered && !disabled ? `0 12px 32px ${RED_GLOW}` : `0 4px 16px ${RED_GLOW}`,
        transform: hovered && !disabled ? "translateY(-2px)" : "translateY(0)",
        transition:"all 0.25s cubic-bezier(.4,0,.2,1)", whiteSpace:"nowrap", opacity: disabled ? 0.7 : 1, ...style
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, style = {}, onClick, dark = false, type = "button" }) {
  const [hovered, setHovered] = useState(false);
  const base = dark ? "rgba(255,255,255,0.12)" : "transparent";
  const hov  = dark ? "rgba(255,255,255,0.2)" : SMOKE;
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? hov : base,
        color: dark ? WHITE : SLATE, border:`2px solid ${dark?"rgba(255,255,255,0.3)":BORDER}`,
        borderRadius:12, padding:"13px 28px", fontFamily:FONT, fontSize:"0.95rem",
        fontWeight:600, cursor:"pointer",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition:"all 0.25s", whiteSpace:"nowrap", ...style
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [userProfile, setUserProfile] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("dashboard-theme") || "light");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [nearbyBloodBanks, setNearbyBloodBanks] = useState([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [emergencySubmitting, setEmergencySubmitting] = useState(false);
  const [emergencySuccess, setEmergencySuccess] = useState(false);
  const [donorSuccess, setDonorSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState("");
  const [donorForm, setDonorForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", dob: "",
    bloodGroup: "Select Blood Group", weight: "", lastDonation: "Last Donation", conditions: "Any medical conditions?",
    preferredDate: "", preferredTime: "Preferred Time", preferredLocation: "Preferred Location", city: ""
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("dashboard-theme", newTheme);
  };

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDashboardNavigation = () => {
    const userRole = userProfile?.role || localStorage.getItem("userRole") || "donor";
    setMobileMenuOpen(false);

    // Route based on user role
    switch (userRole) {
      case "administrator":
        navigate("/admin-dashboard");
        break;
      case "patient":
        navigate("/patient-dashboard");
        break;
      case "donor":
        navigate("/donor-dashboard");
        break;
      case "hospital_staff":
        navigate("/hospital-dashboard");
        break;
      case "blood_bank_staff":
        navigate("/bloodbank-dashboard");
        break;
      default:
        navigate("/patient-dashboard");
    }
  };

  // Comprehensive blood bank database (simulating ERaktkosh data)
  const bloodBankDatabase = [
    // DELHI - Government Hospitals
    { id: 1, name: "AIIMS Blood Bank", state: "Delhi", city: "New Delhi", address: "AIIMS Campus, Ansari Nagar", phone: "011-26588500", lat: 28.5672, lng: 77.2100, bloodStock: { "A+": 45, "A-": 12, "B+": 38, "B-": 8, "AB+": 22, "AB-": 5, "O+": 67, "O-": 15 } },
    { id: 2, name: "Safdarjung Hospital Blood Bank", state: "Delhi", city: "New Delhi", address: "Safdarjung Hospital Campus", phone: "011-26702700", lat: 28.5734, lng: 77.1901, bloodStock: { "A+": 32, "A-": 8, "B+": 28, "B-": 6, "AB+": 18, "AB-": 4, "O+": 52, "O-": 12 } },
    { id: 3, name: "LHMC Blood Bank", state: "Delhi", city: "New Delhi", address: "Lady Hardinge Medical College", phone: "011-23364104", lat: 28.6268, lng: 77.2106, bloodStock: { "A+": 28, "A-": 10, "B+": 25, "B-": 7, "AB+": 15, "AB-": 3, "O+": 48, "O-": 11 } },
    { id: 4, name: "GTB Hospital Blood Bank", state: "Delhi", city: "Delhi", address: "GTB Hospital, Dilshad Garden", phone: "011-22143111", lat: 28.6789, lng: 77.3178, bloodStock: { "A+": 35, "A-": 9, "B+": 31, "B-": 5, "AB+": 20, "AB-": 6, "O+": 55, "O-": 13 } },
    { id: 5, name: "Ram Manohar Lohia Hospital Blood Bank", state: "Delhi", city: "New Delhi", address: "RML Hospital, New Delhi", phone: "011-23363212", lat: 28.6333, lng: 77.2089, bloodStock: { "A+": 30, "A-": 9, "B+": 27, "B-": 6, "AB+": 17, "AB-": 4, "O+": 50, "O-": 12 } },
      
    // DELHI - Private Hospitals
    { id: 6, name: "Apollo Hospital Blood Bank", state: "Delhi", city: "New Delhi", address: "Apollo Hospital, Sarita Vihar", phone: "011-26825858", lat: 28.6375, lng: 77.2733, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 22 } },
    { id: 7, name: "Fortis Hospital Blood Bank", state: "Delhi", city: "New Delhi", address: "Fortis Hospital, Shalimar Bagh", phone: "011-47077777", lat: 28.7167, lng: 77.1583, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 19 } },
    { id: 8, name: "Max Healthcare Blood Bank", state: "Delhi", city: "New Delhi", address: "Max Hospital, Saket", phone: "011-26515650", lat: 28.5319, lng: 77.2189, bloodStock: { "A+": 52, "A-": 16, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 80, "O-": 20 } },
    { id: 9, name: "Medanta Hospital Blood Bank", state: "Delhi", city: "Gurgaon", address: "Medanta Hospital, Sector 38", phone: "0124-4141414", lat: 28.4289, lng: 77.0464, bloodStock: { "A+": 58, "A-": 19, "B+": 51, "B-": 15, "AB+": 35, "AB-": 11, "O+": 90, "O-": 24 } },
    { id: 10, name: "Sir Ganga Ram Hospital Blood Bank", state: "Delhi", city: "New Delhi", address: "SGRH, Rajinder Nagar", phone: "011-25725424", lat: 28.6503, lng: 77.1867, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    { id: 11, name: "BLK Hospital Blood Bank", state: "Delhi", city: "New Delhi", address: "BLK Hospital, Pusa Road", phone: "011-23663636", lat: 28.6425, lng: 77.1833, bloodStock: { "A+": 38, "A-": 11, "B+": 33, "B-": 9, "AB+": 21, "AB-": 6, "O+": 62, "O-": 15 } },
    { id: 12, name: "Indraprastha Apollo Hospital Blood Bank", state: "Delhi", city: "New Delhi", address: "Apollo Hospital, Sarita Vihar", phone: "011-26825858", lat: 28.6375, lng: 77.2733, bloodStock: { "A+": 50, "A-": 16, "B+": 44, "B-": 12, "AB+": 29, "AB-": 9, "O+": 78, "O-": 20 } },
    
    // MAHARASHTRA - Government Hospitals
    { id: 13, name: "J.J. Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "J.J. Hospital, Byculla", phone: "022-23735555", lat: 18.9696, lng: 72.8333, bloodStock: { "A+": 52, "A-": 15, "B+": 45, "B-": 12, "AB+": 28, "AB-": 8, "O+": 78, "O-": 18 } },
    { id: 14, name: "KEM Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "KEM Hospital, Parel", phone: "022-24138113", lat: 19.0066, lng: 72.8533, bloodStock: { "A+": 48, "A-": 14, "B+": 42, "B-": 11, "AB+": 25, "AB-": 7, "O+": 72, "O-": 16 } },
    { id: 15, name: "Nair Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "Nair Hospital, Mumbai Central", phone: "022-23074126", lat: 18.9667, lng: 72.8217, bloodStock: { "A+": 38, "A-": 11, "B+": 34, "B-": 9, "AB+": 21, "AB-": 6, "O+": 62, "O-": 14 } },
    { id: 16, name: "Sion Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "Sion Hospital, Sion", phone: "022-24076381", lat: 19.0414, lng: 72.8667, bloodStock: { "A+": 41, "A-": 13, "B+": 37, "B-": 10, "AB+": 23, "AB-": 7, "O+": 68, "O-": 15 } },
    { id: 17, name: "Sassoon Hospital Blood Bank", state: "Maharashtra", city: "Pune", address: "Sassoon Hospital, Pune", phone: "020-26058280", lat: 18.5184, lng: 73.8567, bloodStock: { "A+": 35, "A-": 12, "B+": 32, "B-": 8, "AB+": 19, "AB-": 5, "O+": 58, "O-": 13 } },
    { id: 18, name: "GMCH Nagpur Blood Bank", state: "Maharashtra", city: "Nagpur", address: "Government Medical College, Nagpur", phone: "0712-2545678", lat: 21.1498, lng: 79.0821, bloodStock: { "A+": 28, "A-": 9, "B+": 25, "B-": 7, "AB+": 16, "AB-": 4, "O+": 48, "O-": 11 } },
    
    // MAHARASHTRA - Private Hospitals
    { id: 19, name: "Apollo Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "Apollo Hospital, Mumbai", phone: "022-24223333", lat: 19.0825, lng: 72.8812, bloodStock: { "A+": 65, "A-": 22, "B+": 58, "B-": 18, "AB+": 38, "AB-": 12, "O+": 95, "O-": 28 } },
    { id: 20, name: "Fortis Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "Fortis Hospital, Mulund", phone: "022-25335678", lat: 19.1667, lng: 72.9417, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 22 } },
    { id: 21, name: "Kokilaben Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "Kokilaben Hospital, Andheri", phone: "022-26967579", lat: 19.1156, lng: 72.8406, bloodStock: { "A+": 58, "A-": 19, "B+": 51, "B-": 15, "AB+": 34, "AB-": 11, "O+": 88, "O-": 24 } },
    { id: 22, name: "Jaslok Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "Jaslok Hospital, Peddar Road", phone: "022-22094444", lat: 18.9642, lng: 72.8167, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 27, "AB-": 8, "O+": 75, "O-": 19 } },
    { id: 23, name: "Breach Candy Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "Breach Candy Hospital, Mumbai", phone: "022-23668888", lat: 18.9833, lng: 72.8317, bloodStock: { "A+": 45, "A-": 14, "B+": 40, "B-": 11, "AB+": 26, "AB-": 7, "O+": 72, "O-": 18 } },
    { id: 24, name: "Ruby Hall Clinic Blood Bank", state: "Maharashtra", city: "Pune", address: "Ruby Hall Clinic, Pune", phone: "020-26122111", lat: 18.5194, lng: 73.8711, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    { id: 25, name: "Jehangir Hospital Blood Bank", state: "Maharashtra", city: "Pune", address: "Jehangir Hospital, Pune", phone: "020-26156677", lat: 18.5114, lng: 73.8722, bloodStock: { "A+": 38, "A-": 12, "B+": 34, "B-": 9, "AB+": 22, "AB-": 6, "O+": 62, "O-": 15 } },
    { id: 26, name: "Wockhardt Hospital Blood Bank", state: "Maharashtra", city: "Nagpur", address: "Wockhardt Hospital, Nagpur", phone: "0712-2545678", lat: 21.1589, lng: 79.0922, bloodStock: { "A+": 35, "A-": 11, "B+": 31, "B-": 8, "AB+": 20, "AB-": 5, "O+": 58, "O-": 14 } },
    
    // KARNATAKA - Government Hospitals
    { id: 27, name: "Victoria Hospital Blood Bank", state: "Karnataka", city: "Bangalore", address: "Victoria Hospital, Bangalore", phone: "080-26700880", lat: 12.9716, lng: 77.5946, bloodStock: { "A+": 44, "A-": 14, "B+": 39, "B-": 11, "AB+": 24, "AB-": 7, "O+": 71, "O-": 17 } },
    { id: 28, name: "Bowring Hospital Blood Bank", state: "Karnataka", city: "Bangalore", address: "Bowring Hospital, Bangalore", phone: "080-22867069", lat: 12.9914, lng: 77.6041, bloodStock: { "A+": 36, "A-": 10, "B+": 33, "B-": 9, "AB+": 20, "AB-": 6, "O+": 63, "O-": 14 } },
    { id: 29, name: "Mysore Medical College Blood Bank", state: "Karnataka", city: "Mysore", address: "MMC, Mysore", phone: "0821-2548350", lat: 12.3167, lng: 76.6467, bloodStock: { "A+": 28, "A-": 8, "B+": 25, "B-": 7, "AB+": 16, "AB-": 4, "O+": 49, "O-": 11 } },
    { id: 30, name: "KMC Manipal Blood Bank", state: "Karnataka", city: "Manipal", address: "KMC, Manipal", phone: "0820-2571919", lat: 13.3538, lng: 74.7926, bloodStock: { "A+": 32, "A-": 9, "B+": 28, "B-": 8, "AB+": 18, "AB-": 5, "O+": 54, "O-": 12 } },
    
    // KARNATAKA - Private Hospitals
    { id: 31, name: "Apollo Hospital Blood Bank", state: "Karnataka", city: "Bangalore", address: "Apollo Hospital, Bangalore", phone: "080-26860555", lat: 12.9356, lng: 77.6061, bloodStock: { "A+": 60, "A-": 20, "B+": 52, "B-": 16, "AB+": 35, "AB-": 11, "O+": 92, "O-": 25 } },
    { id: 32, name: "Fortis Hospital Blood Bank", state: "Karnataka", city: "Bangalore", address: "Fortis Hospital, Bannerghatta", phone: "080-22221212", lat: 12.8956, lng: 77.5956, bloodStock: { "A+": 52, "A-": 17, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 80, "O-": 21 } },
    { id: 33, name: "Manipal Hospital Blood Bank", state: "Karnataka", city: "Bangalore", address: "Manipal Hospital, Old Airport Road", phone: "080-22220333", lat: 12.9417, lng: 77.6142, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 19 } },
    { id: 34, name: "Narayana Health Blood Bank", state: "Karnataka", city: "Bangalore", address: "Narayana Health, HSR Layout", phone: "080-66224444", lat: 12.9189, lng: 77.6489, bloodStock: { "A+": 45, "A-": 14, "B+": 40, "B-": 11, "AB+": 26, "AB-": 7, "O+": 72, "O-": 18 } },
    { id: 35, name: "Columbia Asia Hospital Blood Bank", state: "Karnataka", city: "Bangalore", address: "Columbia Asia, Yelahanka", phone: "080-43443333", lat: 13.1017, lng: 77.5817, bloodStock: { "A+": 38, "A-": 12, "B+": 34, "B-": 9, "AB+": 22, "AB-": 6, "O+": 62, "O-": 15 } },
    { id: 36, name: "Aster Hospital Blood Bank", state: "Karnataka", city: "Mysore", address: "Aster Hospital, Mysore", phone: "0821-4255555", lat: 12.3089, lng: 76.6544, bloodStock: { "A+": 35, "A-": 11, "B+": 31, "B-": 8, "AB+": 20, "AB-": 5, "O+": 58, "O-": 13 } },
    
    // TAMIL NADU - Government Hospitals
    { id: 37, name: "Rajiv Gandhi Government Hospital Blood Bank", state: "Tamil Nadu", city: "Chennai", address: "RGGGH, Chennai", phone: "044-25305305", lat: 13.0827, lng: 80.2707, bloodStock: { "A+": 55, "A-": 16, "B+": 48, "B-": 13, "AB+": 30, "AB-": 9, "O+": 82, "O-": 19 } },
    { id: 38, name: "Government General Hospital Blood Bank", state: "Tamil Nadu", city: "Chennai", address: "GH, Chennai", phone: "044-25303437", lat: 13.0754, lng: 80.2625, bloodStock: { "A+": 47, "A-": 13, "B+": 41, "B-": 11, "AB+": 26, "AB-": 8, "O+": 75, "O-": 17 } },
    { id: 39, name: "Madurai Medical College Blood Bank", state: "Tamil Nadu", city: "Madurai", address: "MMC, Madurai", phone: "0452-2532530", lat: 9.9252, lng: 78.1198, bloodStock: { "A+": 32, "A-": 9, "B+": 29, "B-": 8, "AB+": 18, "AB-": 5, "O+": 56, "O-": 12 } },
    { id: 40, name: "CMCH Coimbatore Blood Bank", state: "Tamil Nadu", city: "Coimbatore", address: "CMCH, Coimbatore", phone: "0422-2300200", lat: 10.9817, lng: 76.9656, bloodStock: { "A+": 30, "A-": 8, "B+": 27, "B-": 7, "AB+": 17, "AB-": 4, "O+": 52, "O-": 11 } },
    
    // TAMIL NADU - Private Hospitals
    { id: 41, name: "Apollo Hospital Blood Bank", state: "Tamil Nadu", city: "Chennai", address: "Apollo Hospital, Chennai", phone: "044-28297777", lat: 13.0567, lng: 80.2567, bloodStock: { "A+": 70, "A-": 24, "B+": 62, "B-": 20, "AB+": 42, "AB-": 14, "O+": 105, "O-": 32 } },
    { id: 42, name: "Fortis Hospital Blood Bank", state: "Tamil Nadu", city: "Chennai", address: "Fortis Malar Hospital, Chennai", phone: "044-42898888", lat: 13.0467, lng: 80.2467, bloodStock: { "A+": 58, "A-": 19, "B+": 51, "B-": 15, "AB+": 35, "AB-": 11, "O+": 88, "O-": 24 } },
    { id: 43, name: "MIOT Hospital Blood Bank", state: "Tamil Nadu", city: "Chennai", address: "MIOT Hospital, Chennai", phone: "044-42494567", lat: 13.0667, lng: 80.2367, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 33, "AB-": 10, "O+": 85, "O-": 23 } },
    { id: 44, name: "KG Hospital Blood Bank", state: "Tamil Nadu", city: "Coimbatore", address: "KG Hospital, Coimbatore", phone: "0422-2214000", lat: 10.9917, lng: 76.9756, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 25, "AB-": 7, "O+": 68, "O-": 17 } },
    { id: 45, name: "Ganga Hospital Blood Bank", state: "Tamil Nadu", city: "Coimbatore", address: "Ganga Hospital, Coimbatore", phone: "0422-2474444", lat: 10.9967, lng: 76.9706, bloodStock: { "A+": 38, "A-": 12, "B+": 34, "B-": 9, "AB+": 23, "AB-": 6, "O+": 62, "O-": 15 } },
    { id: 46, name: "Meenakshi Hospital Blood Bank", state: "Tamil Nadu", city: "Madurai", address: "Meenakshi Hospital, Madurai", phone: "0452-2525252", lat: 9.9312, lng: 78.1248, bloodStock: { "A+": 35, "A-": 11, "B+": 31, "B-": 8, "AB+": 20, "AB-": 5, "O+": 58, "O-": 13 } },
    
    // WEST BENGAL - Government Hospitals
    { id: 47, name: "IPGMER Blood Bank", state: "West Bengal", city: "Kolkata", address: "IPGMER, Kolkata", phone: "033-22235313", lat: 22.5587, lng: 88.3955, bloodStock: { "A+": 51, "A-": 15, "B+": 46, "B-": 12, "AB+": 27, "AB-": 8, "O+": 76, "O-": 18 } },
    { id: 48, name: "Medical College Hospital Blood Bank", state: "West Bengal", city: "Kolkata", address: "MCH, Kolkata", phone: "033-22415072", lat: 22.5726, lng: 88.3639, bloodStock: { "A+": 43, "A-": 12, "B+": 38, "B-": 10, "AB+": 23, "AB-": 7, "O+": 68, "O-": 15 } },
    { id: 49, name: "NRS Medical College Blood Bank", state: "West Bengal", city: "Kolkata", address: "NRS Medical College, Kolkata", phone: "033-23574461", lat: 22.5626, lng: 88.3756, bloodStock: { "A+": 35, "A-": 10, "B+": 31, "B-": 8, "AB+": 20, "AB-": 5, "O+": 58, "O-": 13 } },
    
    // WEST BENGAL - Private Hospitals
    { id: 50, name: "Apollo Hospital Blood Bank", state: "West Bengal", city: "Kolkata", address: "Apollo Hospital, Kolkata", phone: "033-24336363", lat: 22.5456, lng: 88.3856, bloodStock: { "A+": 58, "A-": 19, "B+": 51, "B-": 15, "AB+": 34, "AB-": 11, "O+": 88, "O-": 24 } },
    { id: 51, name: "Fortis Hospital Blood Bank", state: "West Bengal", city: "Kolkata", address: "Fortis Hospital, Kolkata", phone: "033-22875555", lat: 22.5556, lng: 88.3756, bloodStock: { "A+": 52, "A-": 17, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 82, "O-": 22 } },
    { id: 52, name: "Medica Hospital Blood Bank", state: "West Bengal", city: "Kolkata", address: "Medica Hospital, Kolkata", phone: "033-33214567", lat: 22.5656, lng: 88.3656, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 27, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 53, name: "Peerless Hospital Blood Bank", state: "West Bengal", city: "Kolkata", address: "Peerless Hospital, Kolkata", phone: "033-22432222", lat: 22.5756, lng: 88.3956, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    
    // GUJARAT - Government Hospitals
    { id: 54, name: "Civil Hospital Blood Bank", state: "Gujarat", city: "Ahmedabad", address: "Civil Hospital, Ahmedabad", phone: "079-22603456", lat: 23.0302, lng: 72.5801, bloodStock: { "A+": 39, "A-": 11, "B+": 35, "B-": 9, "AB+": 22, "AB-": 6, "O+": 64, "O-": 14 } },
    { id: 55, name: "V.S. Hospital Blood Bank", state: "Gujarat", city: "Ahmedabad", address: "V.S. Hospital, Ahmedabad", phone: "079-26560480", lat: 23.0225, lng: 72.5714, bloodStock: { "A+": 34, "A-": 10, "B+": 31, "B-": 8, "AB+": 19, "AB-": 5, "O+": 59, "O-": 13 } },
    { id: 56, name: "GMCH Surat Blood Bank", state: "Gujarat", city: "Surat", address: "Government Medical College, Surat", phone: "0261-2345678", lat: 21.1702, lng: 72.8310, bloodStock: { "A+": 32, "A-": 9, "B+": 28, "B-": 7, "AB+": 17, "AB-": 4, "O+": 52, "O-": 11 } },
    
    // GUJARAT - Private Hospitals
    { id: 57, name: "Apollo Hospital Blood Bank", state: "Gujarat", city: "Ahmedabad", address: "Apollo Hospital, Ahmedabad", phone: "079-26869898", lat: 23.0356, lng: 72.5901, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 22 } },
    { id: 58, name: "Zydus Hospital Blood Bank", state: "Gujarat", city: "Ahmedabad", address: "Zydus Hospital, Ahmedabad", phone: "079-66443333", lat: 23.0406, lng: 72.6001, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 19 } },
    { id: 59, name: "Sterling Hospital Blood Bank", state: "Gujarat", city: "Ahmedabad", address: "Sterling Hospital, Ahmedabad", phone: "079-26765432", lat: 23.0456, lng: 72.6101, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    { id: 60, name: "Mahavir Hospital Blood Bank", state: "Gujarat", city: "Surat", address: "Mahavir Hospital, Surat", phone: "0261-2224567", lat: 21.1856, lng: 72.8410, bloodStock: { "A+": 38, "A-": 11, "B+": 34, "B-": 9, "AB+": 22, "AB-": 6, "O+": 62, "O-": 15 } },
    
    // RAJASTHAN - Government Hospitals
    { id: 61, name: "SMS Hospital Blood Bank", state: "Rajasthan", city: "Jaipur", address: "SMS Hospital, Jaipur", phone: "0141-2545678", lat: 26.9124, lng: 75.7873, bloodStock: { "A+": 37, "A-": 11, "B+": 33, "B-": 9, "AB+": 21, "AB-": 6, "O+": 61, "O-": 14 } },
    { id: 62, name: "RNT Medical College Blood Bank", state: "Rajasthan", city: "Udaipur", address: "RNT Medical College, Udaipur", phone: "0294-2424500", lat: 24.5854, lng: 73.7125, bloodStock: { "A+": 29, "A-": 8, "B+": 26, "B-": 7, "AB+": 17, "AB-": 4, "O+": 51, "O-": 11 } },
    { id: 63, name: "SP Medical College Blood Bank", state: "Rajasthan", city: "Bikaner", address: "SP Medical College, Bikaner", phone: "0151-2234567", lat: 28.0156, lng: 73.3156, bloodStock: { "A+": 25, "A-": 7, "B+": 22, "B-": 6, "AB+": 14, "AB-": 3, "O+": 45, "O-": 10 } },
    
    // RAJASTHAN - Private Hospitals
    { id: 64, name: "Fortis Hospital Blood Bank", state: "Rajasthan", city: "Jaipur", address: "Fortis Hospital, Jaipur", phone: "0141-4155777", lat: 26.9256, lng: 75.8056, bloodStock: { "A+": 52, "A-": 16, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 80, "O-": 21 } },
    { id: 65, name: "SDMH Hospital Blood Bank", state: "Rajasthan", city: "Jaipur", address: "SDMH Hospital, Jaipur", phone: "0141-2745321", lat: 26.9056, lng: 75.7956, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 66, name: "Apex Hospital Blood Bank", state: "Rajasthan", city: "Udaipur", address: "Apex Hospital, Udaipur", phone: "0294-2412345", lat: 24.5956, lng: 73.7225, bloodStock: { "A+": 35, "A-": 11, "B+": 31, "B-": 8, "AB+": 20, "AB-": 5, "O+": 58, "O-": 13 } },
    
    // UTTAR PRADESH - Government Hospitals
    { id: 67, name: "KGMC Blood Bank", state: "Uttar Pradesh", city: "Lucknow", address: "KGMC, Lucknow", phone: "0522-2258530", lat: 26.8467, lng: 80.9462, bloodStock: { "A+": 42, "A-": 12, "B+": 38, "B-": 10, "AB+": 24, "AB-": 7, "O+": 69, "O-": 16 } },
    { id: 68, name: "SGPGIMS Blood Bank", state: "Uttar Pradesh", city: "Lucknow", address: "SGPGIMS, Lucknow", phone: "0522-2494188", lat: 26.8368, lng: 80.9312, bloodStock: { "A+": 46, "A-": 13, "B+": 41, "B-": 11, "AB+": 26, "AB-": 8, "O+": 73, "O-": 17 } },
    { id: 69, name: "KGMU Blood Bank", state: "Uttar Pradesh", city: "Kanpur", address: "KGMU, Kanpur", phone: "0512-2560301", lat: 26.4499, lng: 80.3319, bloodStock: { "A+": 35, "A-": 10, "B+": 31, "B-": 8, "AB+": 20, "AB-": 5, "O+": 58, "O-": 13 } },
    { id: 70, name: "GSVM Medical College Blood Bank", state: "Uttar Pradesh", city: "Kanpur", address: "GSVM Medical College, Kanpur", phone: "0512-2545678", lat: 26.4599, lng: 80.3419, bloodStock: { "A+": 32, "A-": 9, "B+": 28, "B-": 7, "AB+": 18, "AB-": 4, "O+": 52, "O-": 11 } },
    
    // UTTAR PRADESH - Private Hospitals
    { id: 71, name: "Apollo Hospital Blood Bank", state: "Uttar Pradesh", city: "Lucknow", address: "Apollo Hospital, Lucknow", phone: "0522-2612444", lat: 26.8567, lng: 80.9562, bloodStock: { "A+": 58, "A-": 19, "B+": 51, "B-": 15, "AB+": 34, "AB-": 11, "O+": 88, "O-": 24 } },
    { id: 72, name: "Medanta Hospital Blood Bank", state: "Uttar Pradesh", city: "Lucknow", address: "Medanta Hospital, Lucknow", phone: "0522-6621444", lat: 26.8467, lng: 80.9362, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 23 } },
    { id: 73, name: "Fortis Hospital Blood Bank", state: "Uttar Pradesh", city: "Kanpur", address: "Fortis Hospital, Kanpur", phone: "0512-6666888", lat: 26.4699, lng: 80.3419, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 74, name: "Regency Hospital Blood Bank", state: "Uttar Pradesh", city: "Kanpur", address: "Regency Hospital, Kanpur", phone: "0512-2741234", lat: 26.4799, lng: 80.3519, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    
    // TELANGANA - Government Hospitals
    { id: 75, name: "Gandhi Hospital Blood Bank", state: "Telangana", city: "Hyderabad", address: "Gandhi Hospital, Hyderabad", phone: "040-24612543", lat: 17.4375, lng: 78.4936, bloodStock: { "A+": 40, "A-": 11, "B+": 36, "B-": 9, "AB+": 22, "AB-": 6, "O+": 66, "O-": 15 } },
    { id: 76, name: "Osmania Hospital Blood Bank", state: "Telangana", city: "Hyderabad", address: "Osmania Hospital, Hyderabad", phone: "040-24654321", lat: 17.3850, lng: 78.4867, bloodStock: { "A+": 44, "A-": 12, "B+": 39, "B-": 10, "AB+": 24, "AB-": 7, "O+": 70, "O-": 16 } },
    { id: 77, name: "NIMS Hospital Blood Bank", state: "Telangana", city: "Hyderabad", address: "NIMS Hospital, Hyderabad", phone: "040-23485678", lat: 17.4150, lng: 78.4967, bloodStock: { "A+": 48, "A-": 14, "B+": 42, "B-": 11, "AB+": 27, "AB-": 8, "O+": 75, "O-": 18 } },
    
    // TELANGANA - Private Hospitals
    { id: 78, name: "Apollo Hospital Blood Bank", state: "Telangana", city: "Hyderabad", address: "Apollo Hospital, Hyderabad", phone: "040-23339292", lat: 17.4250, lng: 78.3867, bloodStock: { "A+": 65, "A-": 22, "B+": 58, "B-": 18, "AB+": 40, "AB-": 13, "O+": 98, "O-": 28 } },
    { id: 79, name: "Yashoda Hospital Blood Bank", state: "Telangana", city: "Hyderabad", address: "Yashoda Hospital, Hyderabad", phone: "040-45678901", lat: 17.4350, lng: 78.3967, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 23 } },
    { id: 80, name: "Care Hospital Blood Bank", state: "Telangana", city: "Hyderabad", address: "Care Hospital, Hyderabad", phone: "040-23456789", lat: 17.4450, lng: 78.4067, bloodStock: { "A+": 52, "A-": 17, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 80, "O-": 22 } },
    { id: 81, name: "Star Hospital Blood Bank", state: "Telangana", city: "Hyderabad", address: "Star Hospital, Hyderabad", phone: "040-44556677", lat: 17.4550, lng: 78.4167, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    
    // KERALA - Government Hospitals
    { id: 82, name: "Medical College Hospital Blood Bank", state: "Kerala", city: "Thiruvananthapuram", address: "MCH, Thiruvananthapuram", phone: "0471-2545430", lat: 8.5061, lng: 76.9648, bloodStock: { "A+": 33, "A-": 9, "B+": 30, "B-": 8, "AB+": 19, "AB-": 5, "O+": 57, "O-": 13 } },
    { id: 83, name: "Government Medical College Blood Bank", state: "Kerala", city: "Kochi", address: "GMC, Kochi", phone: "0484-2345678", lat: 9.9312, lng: 76.2673, bloodStock: { "A+": 31, "A-": 8, "B+": 28, "B-": 7, "AB+": 18, "AB-": 4, "O+": 54, "O-": 12 } },
    { id: 84, name: "Kozhikode Medical College Blood Bank", state: "Kerala", city: "Kozhikode", address: "Medical College, Kozhikode", phone: "0495-2345678", lat: 11.2587, lng: 75.7804, bloodStock: { "A+": 29, "A-": 8, "B+": 26, "B-": 7, "AB+": 17, "AB-": 4, "O+": 50, "O-": 11 } },
    
    // KERALA - Private Hospitals
    { id: 85, name: "Aster Hospital Blood Bank", state: "Kerala", city: "Kochi", address: "Aster Hospital, Kochi", phone: "0484-2655555", lat: 9.9412, lng: 76.2773, bloodStock: { "A+": 52, "A-": 16, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 80, "O-": 21 } },
    { id: 86, name: "VPS Lakeshore Hospital Blood Bank", state: "Kerala", city: "Kochi", address: "VPS Lakeshore, Kochi", phone: "0484-2704567", lat: 9.9512, lng: 76.2873, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 87, name: "Baby Memorial Hospital Blood Bank", state: "Kerala", city: "Kozhikode", address: "Baby Memorial Hospital, Kozhikode", phone: "0495-2367890", lat: 11.2687, lng: 75.7904, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    { id: 88, name: "Ananthapuri Hospital Blood Bank", state: "Kerala", city: "Thiruvananthapuram", address: "Ananthapuri Hospital, Trivandrum", phone: "0471-2456789", lat: 8.5161, lng: 76.9748, bloodStock: { "A+": 38, "A-": 12, "B+": 34, "B-": 9, "AB+": 22, "AB-": 6, "O+": 62, "O-": 15 } },
    
    // PUNJAB - Government Hospitals
    { id: 89, name: "Government Medical College Blood Bank", state: "Punjab", city: "Chandigarh", address: "GMC, Chandigarh", phone: "0172-2745678", lat: 30.7333, lng: 76.7794, bloodStock: { "A+": 38, "A-": 10, "B+": 34, "B-": 9, "AB+": 21, "AB-": 6, "O+": 63, "O-": 14 } },
    { id: 90, name: "PGIMER Blood Bank", state: "Punjab", city: "Chandigarh", address: "PGIMER, Chandigarh", phone: "0172-2747585", lat: 30.7673, lng: 76.7802, bloodStock: { "A+": 52, "A-": 14, "B+": 47, "B-": 12, "AB+": 29, "AB-": 8, "O+": 79, "O-": 18 } },
    { id: 91, name: "DMC Ludhiana Blood Bank", state: "Punjab", city: "Ludhiana", address: "DMC, Ludhiana", phone: "0161-2345678", lat: 30.9010, lng: 75.8573, bloodStock: { "A+": 35, "A-": 10, "B+": 31, "B-": 8, "AB+": 20, "AB-": 5, "O+": 58, "O-": 13 } },
    
    // PUNJAB - Private Hospitals
    { id: 92, name: "Fortis Hospital Blood Bank", state: "Punjab", city: "Mohali", address: "Fortis Hospital, Mohali", phone: "0172-5088888", lat: 30.7056, lng: 76.7000, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 22 } },
    { id: 93, name: "Max Hospital Blood Bank", state: "Punjab", city: "Mohali", address: "Max Hospital, Mohali", phone: "0172-4655555", lat: 30.7156, lng: 76.7100, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 94, name: "Dayanand Hospital Blood Bank", state: "Punjab", city: "Ludhiana", address: "Dayanand Hospital, Ludhiana", phone: "0161-2445566", lat: 30.9110, lng: 75.8673, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    
    // HARYANA - Government Hospitals
    { id: 95, name: "PGIMS Blood Bank", state: "Haryana", city: "Rohtak", address: "PGIMS, Rohtak", phone: "01262-254321", lat: 28.8954, lng: 76.6066, bloodStock: { "A+": 35, "A-": 10, "B+": 32, "B-": 8, "AB+": 20, "AB-": 5, "O+": 60, "O-": 13 } },
    { id: 96, name: "GMCH Karnal Blood Bank", state: "Haryana", city: "Karnal", address: "GMCH, Karnal", phone: "0184-2345678", lat: 29.6856, lng: 76.9856, bloodStock: { "A+": 28, "A-": 8, "B+": 25, "B-": 7, "AB+": 16, "AB-": 4, "O+": 48, "O-": 11 } },
    
    // HARYANA - Private Hospitals
    { id: 97, name: "Medanta Hospital Blood Bank", state: "Haryana", city: "Gurgaon", address: "Medanta Hospital, Gurgaon", phone: "0124-4141414", lat: 28.4289, lng: 77.0464, bloodStock: { "A+": 58, "A-": 19, "B+": 51, "B-": 15, "AB+": 35, "AB-": 11, "O+": 90, "O-": 24 } },
    { id: 98, name: "Artemis Hospital Blood Bank", state: "Haryana", city: "Gurgaon", address: "Artemis Hospital, Gurgaon", phone: "0124-4555000", lat: 28.4389, lng: 77.0564, bloodStock: { "A+": 52, "A-": 17, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 82, "O-": 22 } },
    { id: 99, name: "Paras Hospital Blood Bank", state: "Haryana", city: "Gurgaon", address: "Paras Hospital, Gurgaon", phone: "0124-4888888", lat: 28.4489, lng: 77.0664, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    
    // ANDHRA PRADESH - Government Hospitals
    { id: 100, name: "Government General Hospital Blood Bank", state: "Andhra Pradesh", city: "Visakhapatnam", address: "GH, Visakhapatnam", phone: "0891-2545678", lat: 17.7231, lng: 83.2856, bloodStock: { "A+": 36, "A-": 10, "B+": 33, "B-": 9, "AB+": 21, "AB-": 6, "O+": 62, "O-": 14 } },
    { id: 101, name: "Sri Venkateswara Hospital Blood Bank", state: "Andhra Pradesh", city: "Tirupati", address: "SV Hospital, Tirupati", phone: "0877-2234567", lat: 13.6152, lng: 79.4199, bloodStock: { "A+": 28, "A-": 8, "B+": 25, "B-": 7, "AB+": 16, "AB-": 4, "O+": 49, "O-": 11 } },
    { id: 102, name: "GMC Guntur Blood Bank", state: "Andhra Pradesh", city: "Guntur", address: "GMC, Guntur", phone: "0863-2345678", lat: 16.3067, lng: 80.4367, bloodStock: { "A+": 30, "A-": 9, "B+": 27, "B-": 7, "AB+": 18, "AB-": 5, "O+": 52, "O-": 12 } },
    
    // ANDHRA PRADESH - Private Hospitals
    { id: 103, name: "Apollo Hospital Blood Bank", state: "Andhra Pradesh", city: "Hyderabad", address: "Apollo Hospital, Hyderabad", phone: "040-23339292", lat: 17.4250, lng: 78.3867, bloodStock: { "A+": 65, "A-": 22, "B+": 58, "B-": 18, "AB+": 40, "AB-": 13, "O+": 98, "O-": 28 } },
    { id: 104, name: "Manipal Hospital Blood Bank", state: "Andhra Pradesh", city: "Visakhapatnam", address: "Manipal Hospital, Vizag", phone: "0891-2893456", lat: 17.7331, lng: 83.2956, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 105, name: "Seven Hills Hospital Blood Bank", state: "Andhra Pradesh", city: "Visakhapatnam", address: "Seven Hills Hospital, Vizag", phone: "0891-2789012", lat: 17.7431, lng: 83.3056, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    
    // MADHYA PRADESH - Government Hospitals
    { id: 106, name: "Hamidia Hospital Blood Bank", state: "Madhya Pradesh", city: "Bhopal", address: "Hamidia Hospital, Bhopal", phone: "0755-2545678", lat: 23.2599, lng: 77.4126, bloodStock: { "A+": 34, "A-": 9, "B+": 31, "B-": 8, "AB+": 19, "AB-": 5, "O+": 58, "O-": 13 } },
    { id: 107, name: "Gandhi Medical College Blood Bank", state: "Madhya Pradesh", city: "Bhopal", address: "GMC, Bhopal", phone: "0755-2745678", lat: 23.2492, lng: 77.4028, bloodStock: { "A+": 37, "A-": 10, "B+": 34, "B-": 9, "AB+": 22, "AB-": 6, "O+": 64, "O-": 15 } },
    { id: 108, name: "MC Indore Blood Bank", state: "Madhya Pradesh", city: "Indore", address: "MGMMC, Indore", phone: "0731-2545678", lat: 22.7196, lng: 75.8577, bloodStock: { "A+": 32, "A-": 9, "B+": 28, "B-": 7, "AB+": 18, "AB-": 4, "O+": 52, "O-": 11 } },
    
    // MADHYA PRADESH - Private Hospitals
    { id: 109, name: "Apollo Hospital Blood Bank", state: "Madhya Pradesh", city: "Indore", address: "Apollo Hospital, Indore", phone: "0731-2545678", lat: 22.7296, lng: 75.8677, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 22 } },
    { id: 110, name: "Bombay Hospital Blood Bank", state: "Madhya Pradesh", city: "Indore", address: "Bombay Hospital, Indore", phone: "0731-2745678", lat: 22.7396, lng: 75.8777, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 111, name: "Choithram Hospital Blood Bank", state: "Madhya Pradesh", city: "Indore", address: "Choithram Hospital, Indore", phone: "0731-2478901", lat: 22.7496, lng: 75.8877, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    
    // BIHAR - Government Hospitals
    { id: 112, name: "PMCH Blood Bank", state: "Bihar", city: "Patna", address: "PMCH, Patna", phone: "0612-2545678", lat: 25.6127, lng: 85.1444, bloodStock: { "A+": 32, "A-": 9, "B+": 29, "B-": 8, "AB+": 18, "AB-": 5, "O+": 55, "O-": 12 } },
    { id: 113, name: "NMCH Blood Bank", state: "Bihar", city: "Patna", address: "NMCH, Patna", phone: "0612-2678901", lat: 25.5941, lng: 85.1345, bloodStock: { "A+": 29, "A-": 8, "B+": 26, "B-": 7, "AB+": 16, "AB-": 4, "O+": 51, "O-": 11 } },
    { id: 114, name: "IGIMS Patna Blood Bank", state: "Bihar", city: "Patna", address: "IGIMS, Patna", phone: "0612-2678902", lat: 25.6041, lng: 85.1445, bloodStock: { "A+": 35, "A-": 10, "B+": 31, "B-": 8, "AB+": 20, "AB-": 5, "O+": 58, "O-": 13 } },
    
    // BIHAR - Private Hospitals
    { id: 115, name: "Paras Hospital Blood Bank", state: "Bihar", city: "Patna", address: "Paras Hospital, Patna", phone: "0612-2545679", lat: 25.6227, lng: 85.1544, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 116, name: "Kurji Holy Family Hospital Blood Bank", state: "Bihar", city: "Patna", address: "Kurji Hospital, Patna", phone: "0612-2678903", lat: 25.6327, lng: 85.1644, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    { id: 117, name: "Magadh Hospital Blood Bank", state: "Bihar", city: "Gaya", address: "Magadh Hospital, Gaya", phone: "0631-2223456", lat: 24.7914, lng: 85.0014, bloodStock: { "A+": 38, "A-": 12, "B+": 34, "B-": 9, "AB+": 22, "AB-": 6, "O+": 62, "O-": 15 } },
    
    // ODISHA - Government Hospitals
    { id: 118, name: "SCB Medical College Blood Bank", state: "Odisha", city: "Cuttack", address: "SCB Medical College, Cuttack", phone: "0671-2545678", lat: 20.4625, lng: 85.8830, bloodStock: { "A+": 30, "A-": 8, "B+": 27, "B-": 7, "AB+": 17, "AB-": 4, "O+": 50, "O-": 11 } },
    { id: 119, name: "MKCG Medical College Blood Bank", state: "Odisha", city: "Berhampur", address: "MKCG Medical College, Berhampur", phone: "0680-2245678", lat: 19.3056, lng: 84.7886, bloodStock: { "A+": 25, "A-": 7, "B+": 22, "B-": 6, "AB+": 14, "AB-": 3, "O+": 45, "O-": 10 } },
    
    // ODISHA - Private Hospitals
    { id: 120, name: "Apollo Hospital Blood Bank", state: "Odisha", city: "Bhubaneswar", address: "Apollo Hospital, Bhubaneswar", phone: "0674-2545678", lat: 20.2961, lng: 85.8245, bloodStock: { "A+": 52, "A-": 16, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 80, "O-": 21 } },
    { id: 121, name: "AMRI Hospital Blood Bank", state: "Odisha", city: "Bhubaneswar", address: "AMRI Hospital, Bhubaneswar", phone: "0674-2545679", lat: 20.3061, lng: 85.8345, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 122, name: "KIMS Hospital Blood Bank", state: "Odisha", city: "Bhubaneswar", address: "KIMS Hospital, Bhubaneswar", phone: "0674-2545680", lat: 20.3161, lng: 85.8445, bloodStock: { "A+": 45, "A-": 14, "B+": 40, "B-": 11, "AB+": 26, "AB-": 7, "O+": 72, "O-": 19 } },
    
    // CHHATTISGARH - Government Hospitals
    { id: 123, name: "Medical College Blood Bank", state: "Chhattisgarh", city: "Raipur", address: "Medical College, Raipur", phone: "0771-2545678", lat: 21.2514, lng: 81.6296, bloodStock: { "A+": 28, "A-": 8, "B+": 25, "B-": 7, "AB+": 16, "AB-": 4, "O+": 48, "O-": 11 } },
    
    // CHHATTISGARH - Private Hospitals
    { id: 124, name: "Ramkrishna Hospital Blood Bank", state: "Chhattisgarh", city: "Raipur", address: "Ramkrishna Hospital, Raipur", phone: "0771-2545679", lat: 21.2614, lng: 81.6396, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    { id: 125, name: "Shri Narayana Hospital Blood Bank", state: "Chhattisgarh", city: "Raipur", address: "Shri Narayana Hospital, Raipur", phone: "0771-2545680", lat: 21.2714, lng: 81.6496, bloodStock: { "A+": 38, "A-": 12, "B+": 34, "B-": 9, "AB+": 22, "AB-": 6, "O+": 62, "O-": 15 } },
    
    // JHARKHAND - Government Hospitals
    { id: 126, name: "RIMS Ranchi Blood Bank", state: "Jharkhand", city: "Ranchi", address: "RIMS, Ranchi", phone: "0651-2545678", lat: 23.3441, lng: 85.3096, bloodStock: { "A+": 26, "A-": 7, "B+": 23, "B-": 6, "AB+": 15, "AB-": 3, "O+": 45, "O-": 10 } },
    
    // JHARKHAND - Private Hospitals
    { id: 127, name: "Apollo Hospital Blood Bank", state: "Jharkhand", city: "Ranchi", address: "Apollo Hospital, Ranchi", phone: "0651-2545679", lat: 23.3541, lng: 85.3196, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 128, name: "Bokaro General Hospital Blood Bank", state: "Jharkhand", city: "Bokaro", address: "Bokaro General Hospital, Bokaro", phone: "0654-2224567", lat: 23.6641, lng: 86.1444, bloodStock: { "A+": 35, "A-": 11, "B+": 31, "B-": 8, "AB+": 20, "AB-": 5, "O+": 58, "O-": 13 } },
    
    // ASSAM - Government Hospitals
    { id: 129, name: "GMCH Guwahati Blood Bank", state: "Assam", city: "Guwahati", address: "GMCH, Guwahati", phone: "0361-2545678", lat: 26.1445, lng: 91.7362, bloodStock: { "A+": 24, "A-": 7, "B+": 21, "B-": 6, "AB+": 13, "AB-": 3, "O+": 42, "O-": 9 } },
    
    // ASSAM - Private Hospitals
    { id: 130, name: "Apollo Hospital Blood Bank", state: "Assam", city: "Guwahati", address: "Apollo Hospital, Guwahati", phone: "0361-2545679", lat: 26.1545, lng: 91.7462, bloodStock: { "A+": 45, "A-": 14, "B+": 40, "B-": 11, "AB+": 26, "AB-": 7, "O+": 72, "O-": 19 } },
    { id: 131, name: "Guwahati Medical College Blood Bank", state: "Assam", city: "Guwahati", address: "GMC, Guwahati", phone: "0361-2545680", lat: 26.1645, lng: 91.7562, bloodStock: { "A+": 38, "A-": 12, "B+": 34, "B-": 9, "AB+": 22, "AB-": 6, "O+": 62, "O-": 15 } },
    
    // HIMACHAL PRADESH - Government Hospitals
    { id: 132, name: "IGMC Shimla Blood Bank", state: "Himachal Pradesh", city: "Shimla", address: "IGMC, Shimla", phone: "0177-2655678", lat: 31.1048, lng: 77.1734, bloodStock: { "A+": 22, "A-": 6, "B+": 19, "B-": 5, "AB+": 12, "AB-": 3, "O+": 38, "O-": 8 } },
    
    // HIMACHAL PRADESH - Private Hospitals
    { id: 133, name: "Indira Gandhi Hospital Blood Bank", state: "Himachal Pradesh", city: "Shimla", address: "IGMH, Shimla", phone: "0177-2655679", lat: 31.1148, lng: 77.1834, bloodStock: { "A+": 35, "A-": 11, "B+": 31, "B-": 8, "AB+": 20, "AB-": 5, "O+": 58, "O-": 13 } },
    
    // UTTARAKHAND - Government Hospitals
    { id: 134, name: "Doon Medical College Blood Bank", state: "Uttarakhand", city: "Dehradun", address: "DMC, Dehradun", phone: "0135-2655678", lat: 30.3165, lng: 78.0322, bloodStock: { "A+": 25, "A-": 7, "B+": 22, "B-": 6, "AB+": 14, "AB-": 3, "O+": 43, "O-": 9 } },
    
    // UTTARAKHAND - Private Hospitals
    { id: 135, name: "Max Hospital Blood Bank", state: "Uttarakhand", city: "Dehradun", address: "Max Hospital, Dehradun", phone: "0135-2655679", lat: 30.3265, lng: 78.0422, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    { id: 136, name: "Shri Mahant Hospital Blood Bank", state: "Uttarakhand", city: "Dehradun", address: "Shri Mahant Hospital, Dehradun", phone: "0135-2655680", lat: 30.3365, lng: 78.0522, bloodStock: { "A+": 38, "A-": 12, "B+": 34, "B-": 9, "AB+": 22, "AB-": 6, "O+": 62, "O-": 15 } },
    
    // GOA - Government Hospitals
    { id: 137, name: "GMC Goa Blood Bank", state: "Goa", city: "Panaji", address: "GMC, Panaji", phone: "0832-2545678", lat: 15.4989, lng: 73.8282, bloodStock: { "A+": 20, "A-": 5, "B+": 18, "B-": 4, "AB+": 11, "AB-": 2, "O+": 35, "O-": 7 } },
    
    // GOA - Private Hospitals
    { id: 138, name: "Manipal Hospital Blood Bank", state: "Goa", city: "Panaji", address: "Manipal Hospital, Panaji", phone: "0832-2545679", lat: 15.5089, lng: 73.8382, bloodStock: { "A+": 35, "A-": 11, "B+": 31, "B-": 8, "AB+": 20, "AB-": 5, "O+": 58, "O-": 13 } },
    { id: 139, name: "Healthway Hospital Blood Bank", state: "Goa", city: "Panaji", address: "Healthway Hospital, Panaji", phone: "0832-2545680", lat: 15.5189, lng: 73.8482, bloodStock: { "A+": 32, "A-": 10, "B+": 28, "B-": 7, "AB+": 18, "AB-": 4, "O+": 52, "O-": 12 } },
    
    // JAMMU & KASHMIR - Government Hospitals
    { id: 140, name: "GMC Jammu Blood Bank", state: "Jammu & Kashmir", city: "Jammu", address: "GMC, Jammu", phone: "0191-2545678", lat: 32.7266, lng: 74.8570, bloodStock: { "A+": 18, "A-": 5, "B+": 16, "B-": 4, "AB+": 10, "AB-": 2, "O+": 32, "O-": 7 } },
    { id: 141, name: "SKIMS Srinagar Blood Bank", state: "Jammu & Kashmir", city: "Srinagar", address: "SKIMS, Srinagar", phone: "0194-2545678", lat: 34.0837, lng: 74.7973, bloodStock: { "A+": 20, "A-": 6, "B+": 18, "B-": 5, "AB+": 12, "AB-": 3, "O+": 35, "O-": 8 } },
    
    // JAMMU & KASHMIR - Private Hospitals
    { id: 142, name: "Apollo Hospital Blood Bank", state: "Jammu & Kashmir", city: "Jammu", address: "Apollo Hospital, Jammu", phone: "0191-2545679", lat: 32.7366, lng: 74.8670, bloodStock: { "A+": 38, "A-": 12, "B+": 34, "B-": 9, "AB+": 22, "AB-": 6, "O+": 62, "O-": 15 } },
  ];

  const states = [...new Set(bloodBankDatabase.map(bank => bank.state))].sort();
  const citiesByState = {};
  bloodBankDatabase.forEach(bank => {
    if (!citiesByState[bank.state]) {
      citiesByState[bank.state] = [];
    }
    if (!citiesByState[bank.state].includes(bank.city)) {
      citiesByState[bank.state].push(bank.city);
    }
  });

  // Get user's current location
  const getUserLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setIsGettingLocation(false);
          setSearchResults([]);
          setHasSearched(false);
          findNearbyBloodBanks(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enable location services or search manually.");
          setIsGettingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser. Please search manually.");
      setIsGettingLocation(false);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Find nearby blood banks based on user location
  const findNearbyBloodBanks = (userLat, userLng) => {
    const banksWithDistance = bloodBankDatabase.map(bank => ({
      ...bank,
      distance: calculateDistance(userLat, userLng, bank.lat, bank.lng)
    })).sort((a, b) => a.distance - b.distance);

    setNearbyBloodBanks(banksWithDistance.slice(0, 10)); // Show top 10 nearest
  };

  // Search blood banks by location and blood group
  const handleBloodSearch = () => {
    setIsSearching(true);
    setHasSearched(true);
    
    // Filter blood banks based on selected criteria
    let results = bloodBankDatabase;
    
    if (selectedState) {
      results = results.filter(bank => bank.state === selectedState);
    }
    
    if (selectedCity) {
      results = results.filter(bank => bank.city === selectedCity);
    }
    
    if (bloodGroup) {
      results = results.filter(bank => bank.bloodStock && bank.bloodStock[bloodGroup] > 0);
    }
    
    setNearbyBloodBanks(results);
    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setHasSearched(false);
    setNearbyBloodBanks([]);
    setSelectedState("");
    setSelectedCity("");
    setBloodGroup("");
    setUserLocation(null);
  };

  const handleProtectedAction = () => {
    setMobileMenuOpen(false);
    if (!isSignedIn) {
      setLoginModalMessage("Please login first to access dashboard.");
      setShowLoginModal(true);
      return;
    }
    handleDashboardNavigation();
  };

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('[data-profile-dropdown]')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  useEffect(() => {
    if (isSignedIn) {
      const fullName = localStorage.getItem("userFullName") || user?.fullName || "";
      const email = localStorage.getItem("userEmail") || user?.primaryEmailAddress?.emailAddress || "";
      const role = localStorage.getItem("userRole") || "donor";
      setUserProfile({ fullName, email, role });
    } else {
      setUserProfile(null);
    }
  }, [isSignedIn, user]);

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("userFullName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleEmergencySubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    if (!payload.bloodGroup || payload.bloodGroup === "Blood Group Required") {
      setLoginModalMessage("Please select the blood group required.");
      setShowLoginModal(true);
      return;
    }
    setEmergencySubmitting(true);
    // Simulate request dispatch — replace with a real API call when available
    setTimeout(() => {
      setEmergencySubmitting(false);
      setEmergencySuccess(true);
      e.target.reset();
      setTimeout(() => setEmergencySuccess(false), 6000);
    }, 900);
  };

  const updateDonorField = (field, value) => {
    setDonorForm(prev => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = donorForm.firstName && donorForm.lastName && donorForm.email && donorForm.phone && donorForm.dob;
  const isStep2Valid = donorForm.bloodGroup !== "Select Blood Group" && donorForm.weight;
  const isStep3Valid = donorForm.preferredDate && donorForm.preferredTime !== "Preferred Time" && donorForm.city;

  const handleDonorRegistration = async (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      setLoginModalMessage("Please login first to register as a donor.");
      setShowLoginModal(true);
      return;
    }
    if (!isStep3Valid) return;
    
    try {
      // Set user role to donor
      localStorage.setItem("userRole", "donor");
      localStorage.setItem("userFullName", user?.fullName || "");
      localStorage.setItem("userEmail", user?.primaryEmailAddress?.emailAddress || "");
      
      // Create donor record in backend
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/${user.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...donorForm,
          clerkId: user.id,
          email: user?.primaryEmailAddress?.emailAddress || "",
          fullName: user?.fullName || "",
        }),
      });

      if (response.ok) {
        // Update user profile state
        setUserProfile({
          fullName: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          role: "donor",
        });
        
        // Redirect to donor dashboard
        navigate("/donor-dashboard");
      } else {
        console.error("Failed to register donor");
        alert("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Donor registration error:", error);
      alert("Registration failed. Please try again.");
    }
  };

  const navItems = [
    { key:"home",           icon:<FaChartLine/>,        label:"Home"           },
    { key:"blood-search",   icon:<FaMagnifyingGlass/>,  label:"Blood Search"   },
    { key:"donate",         icon:<FaHandHoldingMedical/>,label:"Donate"         },
    { key:"hospitals",      icon:<FaHospital/>,         label:"Hospitals"      },
  ];

  const loggedInNavItems = [
    { key:"dashboard",      icon:<FaChartLine/>,        label:"Dashboard"      },
  ];

  const initials = user?.firstName ? `${user.firstName[0]}${user.lastName?.[0]||""}` : "U";
  const displayName = userProfile?.fullName || user?.fullName || "User";
  const displayRole = userProfile?.role || "donor";

  return (
    <div style={{ fontFamily:FONT, color:SLATE, overflowX:"hidden", background: theme === "dark" ? "#0F172A" : WHITE, minHeight: "100vh" }}>

      {/* ── Global CSS ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${theme === "dark" ? "#0F172A" : WHITE}; color: ${theme === "dark" ? WHITE : SLATE}; }
        input::placeholder { color: ${SLATE_LT}; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.5;} }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
        @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-up { animation: fadeUp 0.7s cubic-bezier(.4,0,.2,1) both; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .desktop-nav, .desktop-actions { display:flex; }
        .mobile-toggle { display:none; }
        .mobile-menu { display:none; }
        .search-grid { grid-template-columns: repeat(4,1fr); }
        .results-grid { grid-template-columns: repeat(2,1fr); }
        
        /* Tablet styles */
        @media(max-width:1024px){
          .search-grid{grid-template-columns:repeat(2,1fr);}
          .results-grid{grid-template-columns:repeat(2,1fr);}
          .hero-stats{gap:24px;}
        }
        
        @media(max-width:900px){
          .desktop-nav{display:none!important;}
          .mobile-toggle{display:flex!important;}
          .mobile-menu.open{display:flex!important;}
          .search-grid{grid-template-columns:repeat(2,1fr);}
          .results-grid{grid-template-columns:repeat(2,1fr);}
        }
        
        @media(max-width:768px){
          .hero-buttons{flex-direction:column!important;align-items:stretch!important;}
          .hero-stats{flex-wrap:wrap!important;gap:16px!important;justify-content:center!important;}
          .two-col{grid-template-columns:1fr!important;gap:32px!important;}
          .three-col{grid-template-columns:1fr!important;}
          .four-col{grid-template-columns:1fr 1fr!important;}
          .search-grid{grid-template-columns:1fr 1fr!important;}
          .results-grid{grid-template-columns:1fr!important;}
        }
        
        @media(max-width:640px){
          .four-col{grid-template-columns:1fr!important;}
          .search-grid{grid-template-columns:1fr!important;}
          .hero-stats{flex-direction:column!important;align-items:center!important;text-align:center!important;}
        }
        
        @media(max-width:480px){
          nav{padding:0 16px!important;}
          .mobile-menu{padding:12px 0 16px!important;}
          section{padding:64px 16px!important;}
          .hero-buttons{gap:10px!important;}
          .hero-stats{gap:20px!important;}
        }
        
        /* Mobile-specific improvements */
        @media(max-width:768px){
          header{min-height:auto!important;padding-top:100px!important;padding-bottom:60px!important;}
          .hero-buttons button{padding:14px 24px!important;font-size:0.95rem!important;}
          .four-col > div{border-right:none!important;border-bottom:1px solid rgba(255,255,255,0.08)!important;padding:20px 12px!important;}
          .four-col > div:last-child{border-bottom:none!important;}
          .search-grid > div{margin-bottom:8px;}
          form{padding:24px!important;}
          .two-col{gap:32px!important;}
          .four-col{grid-template-columns:1fr!important;gap:32px!important;}
          .four-col > div:last-child{margin-bottom:0!important;}
          .mobile-menu{position:fixed;top:72px;left:0;right:0;z-index:999;max-height:calc(100vh - 72px);overflow-y:auto;}
        }
      `}</style>

      {/* ════════════════════════════════════════════════
          NAV (Dashboard-style)
      ════════════════════════════════════════════════ */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:1000,
        background: navScrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: navScrolled ? "blur(20px)" : "none",
        borderBottom: navScrolled ? `1px solid ${BORDER}` : "none",
        boxShadow: navScrolled ? "0 4px 30px rgba(0,0,0,0.08)" : "none",
        transition:"all 0.4s cubic-bezier(.4,0,.2,1)",
        padding:"0 24px"
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:72 }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={(e) => handleSmoothScroll(e, "home")}>
            <div style={{
                width:40, height:40, borderRadius:12,
                background:`linear-gradient(135deg,${RED},${RED_DARK})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                color:WHITE, fontSize:"1.2rem"
            }}>
                <FaDroplet/>
            </div>
            <span style={{ fontWeight:900, fontSize:"1.25rem", color: navScrolled ? SLATE : WHITE, letterSpacing:"-0.02em", transition:"color 0.3s" }}>
              Hemo<span style={{ color:RED }}>Care</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div style={{ display:"flex", gap:8, alignItems:"center" }} className="desktop-nav">
            {navItems.map(({ key, icon, label }) => (
                <a key={key} href={`#${key}`}
                    onClick={(e) => handleSmoothScroll(e, key)}
                    style={{
                        display:"flex", alignItems:"center", gap:8,
                        padding:"10px 16px", borderRadius:12,
                        color: navScrolled ? SLATE_MD : "rgba(255,255,255,0.85)",
                        fontWeight:500, fontSize:"0.9rem",
                        textDecoration:"none", transition:"all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = navScrolled ? SMOKE : "rgba(255,255,255,0.1)"; e.currentTarget.style.color = RED; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = navScrolled ? SLATE_MD : "rgba(255,255,255,0.85)"; }}
                >
                    <span style={{ fontSize:"1rem" }}>{icon}</span>
                    <span>{label}</span>
                </a>
            ))}
            {/* Dashboard link - only show when logged in */}
            {isSignedIn && userProfile && loggedInNavItems.map(({ key, icon, label }) => (
                <button key={key} onClick={() => handleDashboardNavigation()}
                    style={{
                        display:"flex", alignItems:"center", gap:8,
                        padding:"10px 16px", borderRadius:12,
                        color: navScrolled ? SLATE_MD : "rgba(255,255,255,0.85)",
                        fontWeight:500, fontSize:"0.9rem",
                        textDecoration:"none", transition:"all 0.2s", cursor:"pointer",
                        background:"none", border:"none"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = navScrolled ? SMOKE : "rgba(255,255,255,0.1)"; e.currentTarget.style.color = RED; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = navScrolled ? SLATE_MD : "rgba(255,255,255,0.85)"; }}
                >
                    <span style={{ fontSize:"1rem" }}>{icon}</span>
                    <span>{label}</span>
                </button>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Search - desktop only */}
            <div className="desktop-actions" style={{ alignItems:"center", gap:10, background:navScrolled ? SMOKE : "rgba(255,255,255,0.1)", border:navScrolled ? `1px solid ${BORDER}` : "1px solid rgba(255,255,255,0.2)", borderRadius:14, padding:"10px 16px", transition:"all 0.25s" }}>
                <FaMagnifyingGlass style={{ color:navScrolled ? SLATE_LT : "rgba(255,255,255,0.7)", fontSize:"0.95rem" }}/>
                <input placeholder="Search..." style={{ border:"none", background:"transparent", fontFamily:FONT, fontSize:"0.9rem", color:navScrolled ? SLATE : WHITE, outline:"none", width:100 }}/>
            </div>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} style={{ width:42, height:42, borderRadius:12, border:navScrolled ? `1px solid ${BORDER}` : "1px solid rgba(255,255,255,0.2)", background:navScrolled ? SMOKE : "rgba(255,255,255,0.1)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:navScrolled ? SLATE_MD : "rgba(255,255,255,0.85)", fontSize:"1rem", transition:"all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = navScrolled ? BORDER : "rgba(255,255,255,0.2)"; e.currentTarget.style.color = navScrolled ? SLATE_MD : "rgba(255,255,255,0.85)"; }}
            >
                {theme === "dark" ? <FaSun/> : <FaMoon/>}
            </button>

            {/* Notification - desktop only */}
            <button className="desktop-actions" style={{ width:42, height:42, borderRadius:12, border:navScrolled ? `1px solid ${BORDER}` : "1px solid rgba(255,255,255,0.2)", background:navScrolled ? SMOKE : "rgba(255,255,255,0.1)", cursor:"pointer", alignItems:"center", justifyContent:"center", color:navScrolled ? SLATE_MD : "rgba(255,255,255,0.85)", fontSize:"1rem", position:"relative", transition:"all 0.25s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = RED}
                onMouseLeave={e => e.currentTarget.style.borderColor = navScrolled ? BORDER : "rgba(255,255,255,0.2)"}
            >
                <FaBell/>
                <span style={{ position:"absolute", top:-2, right:-2, background:RED, color:WHITE, fontSize:"0.65rem", fontWeight:800, minWidth:18, height:18, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>3</span>
            </button>

            {/* Auth Buttons or Profile - desktop only */}
            <div className="desktop-actions" style={{ alignItems:"center", gap:12 }}>
              {isSignedIn && userProfile ? (
                  <div style={{ position:"relative" }} data-profile-dropdown>
                      <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                          style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,${RED},${RED_DARK})`, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:WHITE, fontWeight:800, fontSize:"0.95rem", transition:"all 0.25s" }}
                          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >
                          {initials}
                      </button>
                      {profileDropdownOpen && (
                          <div style={{ position:"absolute", right:0, top:52, width:300, background:WHITE, border:`1px solid ${BORDER}`, borderRadius:18, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", zIndex:300, overflow:"hidden" }}>
                              <div style={{ padding:"20px 22px", borderBottom:`1px solid ${BORDER}`, background:SMOKE }}>
                                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                                      <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${RED},${RED_DARK})`, display:"flex", alignItems:"center", justifyContent:"center", color:WHITE, fontWeight:800, fontSize:"1.2rem" }}>
                                          {initials}
                                      </div>
                                      <div style={{ flex:1 }}>
                                          <p style={{ fontWeight:800, color:SLATE, fontSize:"1rem", lineHeight:1.2 }}>{displayName}</p>
                                          <span style={{ background:RED_GLOW, color:RED, fontWeight:700, fontSize:"0.72rem", padding:"4px 12px", borderRadius:14, marginTop:6, display:"inline-block", textTransform:"capitalize" }}>{displayRole.replace("_"," ")}</span>
                                      </div>
                                  </div>
                                  <p style={{ color:SLATE_LT, fontSize:"0.85rem", marginTop:10, wordBreak:"break-all" }}>{userProfile.email || user?.primaryEmailAddress?.emailAddress}</p>
                              </div>

                              <div style={{ padding:"10px 0" }}>
                                  <div onClick={handleDashboardNavigation} style={{ padding:"16px 22px", cursor:"pointer", color:SLATE, fontSize:"0.9rem", fontWeight:500, display:"flex", alignItems:"center", gap:12, transition:"background 0.15s" }}
                                      onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                                      onMouseLeave={e => e.currentTarget.style.background = WHITE}
                                  >📊 Dashboard</div>
                                  <div onClick={() => navigate("/settings")} style={{ padding:"16px 22px", cursor:"pointer", color:SLATE, fontSize:"0.9rem", fontWeight:500, display:"flex", alignItems:"center", gap:12, transition:"background 0.15s" }}
                                      onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                                      onMouseLeave={e => e.currentTarget.style.background = WHITE}
                                  >⚙️ Settings</div>
                              </div>

                              <div style={{ borderTop:`1px solid ${BORDER}`, padding:"14px 22px" }}>
                                  <div onClick={handleLogout} style={{ color:RED, fontWeight:700, fontSize:"0.9rem", cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
                                      <FaRightFromBracket /> Logout
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              ) : (
                  <>
                      <GhostBtn dark={!navScrolled} onClick={handleLoginClick} style={{ padding:"10px 20px", fontSize:"0.88rem" }}>Log In</GhostBtn>
                      <PrimaryBtn onClick={handleProtectedAction} style={{ padding:"10px 20px", fontSize:"0.88rem" }}>Donate Now</PrimaryBtn>
                  </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Toggle menu"
              style={{ width:42, height:42, borderRadius:12, border:navScrolled ? `1px solid ${BORDER}` : "1px solid rgba(255,255,255,0.2)", background:navScrolled ? SMOKE : "rgba(255,255,255,0.1)", cursor:"pointer", alignItems:"center", justifyContent:"center", color:navScrolled ? SLATE_MD : WHITE, fontSize:"1.05rem" }}
            >
              {mobileMenuOpen ? <FaXmark/> : <FaBars/>}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div className={`mobile-menu${mobileMenuOpen ? " open" : ""}`} style={{
          flexDirection:"column", gap:4, maxWidth:1200, margin:"0 auto", padding:"12px 0 20px",
          background: navScrolled ? "rgba(255,255,255,0.98)" : "rgba(30,41,59,0.97)",
          backdropFilter:"blur(20px)", borderTop:`1px solid ${navScrolled ? BORDER : "rgba(255,255,255,0.15)"}`,
          animation:"slideDown 0.25s ease"
        }}>
          {navItems.map(({ key, icon, label }) => (
            <a key={key} href={`#${key}`} onClick={(e) => handleSmoothScroll(e, key)}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", color: navScrolled ? SLATE_MD : "rgba(255,255,255,0.9)", fontWeight:600, fontSize:"0.95rem", textDecoration:"none" }}
            >
              <span>{icon}</span><span>{label}</span>
            </a>
          ))}
          {isSignedIn && userProfile ? (
            <>
              <button onClick={() => { setMobileMenuOpen(false); handleDashboardNavigation(); }} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", color: navScrolled ? SLATE_MD : "rgba(255,255,255,0.9)", fontWeight:600, fontSize:"0.95rem", background:"none", border:"none", textAlign:"left", cursor:"pointer" }}>
                <FaChartLine/><span>Dashboard</span>
              </button>
              <button onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", color:RED, fontWeight:700, fontSize:"0.95rem", background:"none", border:"none", textAlign:"left", cursor:"pointer" }}>
                <FaRightFromBracket/><span>Logout</span>
              </button>
            </>
          ) : (
            <div style={{ display:"flex", gap:10, padding:"12px 20px 0" }}>
              <GhostBtn dark={!navScrolled} onClick={handleLoginClick} style={{ flex:1, justifyContent:"center", display:"flex" }}>Log In</GhostBtn>
              <PrimaryBtn onClick={handleProtectedAction} style={{ flex:1, justifyContent:"center", display:"flex" }}>Donate Now</PrimaryBtn>
            </div>
          )}
        </div>
      </nav>

      {/* ════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════ */}
      <header id="home" style={{
        minHeight:"100vh", position:"relative", display:"flex", alignItems:"center",
        background:`linear-gradient(135deg, ${RED_DARK} 0%, #3B0000 40%, #1E293B 100%)`,
        overflow:"hidden"
      }}>
        {/* Background pattern */}
        <div style={{ position:"absolute", inset:0, opacity:0.06 }}
          dangerouslySetInnerHTML={{__html:`<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><path d="M30 5 C30 5 20 20 20 28 C20 36 24 40 30 40 C36 40 40 36 40 28 C40 20 30 5 30 5Z" fill="white"/></svg>`}}
        />
        {/* Decorative blobs */}
        <div style={{ position:"absolute", top:-100, right:-100, width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(196,18,48,0.3) 0%,transparent 70%)" }}/>
        <div style={{ position:"absolute", bottom:-150, left:-100, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,0,0,0.25) 0%,transparent 70%)" }}/>

        {/* Floating blood drop decorations */}
        <div className="animate-float" style={{ position:"absolute", right:"8%", top:"20%", fontSize:"6rem", opacity:0.12 }}>🩸</div>
        <div className="animate-float" style={{ position:"absolute", right:"18%", bottom:"25%", fontSize:"4rem", opacity:0.08, animationDelay:"1.5s" }}>🩸</div>

        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", width:"100%", paddingTop:96 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }} className="two-col">

            {/* Left */}
            <div className="animate-fade-up">
              {isSignedIn && userProfile && (
                <div style={{ background:"rgba(255,255,255,0.15)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:16, padding:"16px 20px", marginBottom:24 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:48, height:48, borderRadius:12, background:`linear-gradient(135deg,${RED},${RED_DARK})`, display:"flex", alignItems:"center", justifyContent:"center", color:WHITE, fontWeight:800, fontSize:"1.2rem" }}>
                      {userProfile.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ color:WHITE, fontWeight:800, fontSize:"1rem", lineHeight:1.2 }}>{userProfile.fullName || "User"}</p>
                      <p style={{ color:"rgba(255,255,255,0.75)", fontSize:"0.8rem", marginTop:2 }}>{userProfile.email || ""}</p>
                      <span style={{ background:RED, color:WHITE, fontWeight:700, fontSize:"0.7rem", padding:"2px 10px", borderRadius:12, marginTop:4, display:"inline-block", textTransform:"capitalize" }}>{userProfile.role?.replace("_"," ") || "Donor"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.12)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:40, padding:"6px 16px", marginBottom:24 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#4ADE80", boxShadow:"0 0 0 3px rgba(74,222,128,0.3)", animation:"pulse 2s infinite" }}/>
                <span style={{ color:"rgba(255,255,255,0.9)", fontSize:"0.8rem", fontWeight:600 }}>Live: 3 Emergency Requests Active</span>
              </div>

              <h1 style={{ fontFamily:FONT, fontSize:"clamp(2.8rem,6vw,4.5rem)", fontWeight:900, color:WHITE, lineHeight:1.05, letterSpacing:"-0.03em", marginBottom:24 }}>
                Donate Blood,<br/>
                <span style={{ background:`linear-gradient(90deg,#FCA5A5,#FECACA)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Save Lives</span>
              </h1>

              <p style={{ color:"rgba(255,255,255,0.7)", fontSize:"1.1rem", lineHeight:1.7, marginBottom:36, maxWidth:480 }}>
                Every donation matters. Connect with blood banks, find donors, and manage emergency requests — all in one trusted platform used by 200+ hospitals.
              </p>

              <div className="hero-buttons" style={{ display:"flex", gap:12, marginBottom:48 }}>
                <PrimaryBtn onClick={handleProtectedAction} style={{ padding:"16px 36px", fontSize:"1rem", borderRadius:14 }}>🩸 Donate Now</PrimaryBtn>
                <GhostBtn dark onClick={(e) => handleSmoothScroll(e, "blood-search")} style={{ padding:"16px 36px", fontSize:"1rem", borderRadius:14 }}>🔍 Find Blood</GhostBtn>
              </div>

              {/* Mini stats */}
              <div className="hero-stats" style={{ display:"flex", gap:32, borderTop:"1px solid rgba(255,255,255,0.15)", paddingTop:28 }}>
                {[["48K+","Registered Donors"],["12K+","Lives Saved"],["200+","Partner Hospitals"]].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ color:WHITE, fontWeight:800, fontSize:"1.6rem", lineHeight:1 }}>{n}</div>
                    <div style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.8rem", marginTop:4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Glassmorphism panel */}
            <div style={{ display:"flex", justifyContent:"center" }}>
              <div className="animate-float" style={{
                background:"rgba(255,255,255,0.1)", backdropFilter:"blur(20px)",
                border:"1px solid rgba(255,255,255,0.2)", borderRadius:28,
                padding:32, width:"100%", maxWidth:380,
                boxShadow:"0 32px 80px rgba(0,0,0,0.3)"
              }}>
                <div style={{ fontWeight:800, color:WHITE, fontSize:"1.05rem", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
                  <span>🏥</span> Blood Availability
                </div>
                {[["O+","124 units","Available"],["A+","89 units","Available"],["B+","42 units","Low"],["AB-","8 units","Critical"],["O-","5 units","Critical"]].map(([g,u,s]) => {
                  const sc = s==="Critical"?RED:s==="Low"?"#F59E0B":"#22C55E";
                  return (
                    <div key={g} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"rgba(255,255,255,0.08)", borderRadius:10, marginBottom:6, border:"1px solid rgba(255,255,255,0.1)" }}>
                      <span style={{ background:BG_COLOR[g]||RED, color:WHITE, fontWeight:700, fontSize:"0.78rem", padding:"3px 9px", borderRadius:16 }}>{g}</span>
                      <span style={{ color:"rgba(255,255,255,0.8)", fontWeight:600, fontSize:"0.85rem" }}>{u}</span>
                      <span style={{ color:sc, fontWeight:700, fontSize:"0.75rem" }}>{s}</span>
                    </div>
                  );
                })}
                <PrimaryBtn onClick={(e) => handleSmoothScroll(e, "blood-search")} style={{ width:"100%", marginTop:16, borderRadius:12, justifyContent:"center", display:"block" }}>Check Full Availability</PrimaryBtn>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.75rem", letterSpacing:"0.1em" }}>SCROLL</span>
          <div style={{ width:1, height:36, background:"rgba(255,255,255,0.2)", borderRadius:1 }}/>
        </div>
      </header>

      {/* ════════════════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════════════════ */}
      <div style={{ background:SLATE, padding:"48px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0 }} className="four-col">
          {[
            ["🧑‍🤝‍🧑","48,250","Registered Donors"],
            ["🩸","12,840","Blood Units Available"],
            ["❤️","12,300","Lives Saved"],
            ["🏥","214","Partner Hospitals"]
          ].map(([icon,target,label],i) => (
            <div key={label} style={{ textAlign:"center", padding:"24px 16px", borderRight: i<3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <div style={{ fontSize:"2rem", marginBottom:8 }}>{icon}</div>
              <div style={{ fontFamily:FONT, fontWeight:900, fontSize:"2.2rem", color:WHITE, lineHeight:1 }}>
                <Counter target={parseInt(target.replace(/,/g,""))} suffix={target.includes("+")?"+":""} />
              </div>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.83rem", marginTop:6, fontWeight:500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          BLOOD SEARCH
      ════════════════════════════════════════════════ */}
      <Section bg={SMOKE} id="blood-search" theme={theme}>
        <SectionLabel text="Blood Availability" />
        <SectionTitle theme={theme}>Find Blood Near You</SectionTitle>
        <p style={{ color:SLATE_LT, fontSize:"1rem", lineHeight:1.7, marginBottom:48, maxWidth:520 }}>
          Search our real-time database across all blood groups and locations to find available units when you need them most.
        </p>

        {/* Location-based Search */}
        <div style={{ background:theme === "dark" ? "#1E293B" : WHITE, borderRadius:20, padding:32, boxShadow:"0 8px 40px rgba(0,0,0,0.08)", border:`1px solid ${theme === "dark" ? "#334155" : BORDER}`, marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <span style={{ fontSize:"2rem" }}>📍</span>
            <div>
              <h3 style={{ fontWeight:800, color:theme === "dark" ? WHITE : SLATE, fontSize:"1.1rem", marginBottom:4 }}>Location-Based Search</h3>
              <p style={{ color:SLATE_LT, fontSize:"0.85rem" }}>Find blood banks near your current location or search by state/city</p>
            </div>
          </div>

          {/* Current Location Button */}
          <div style={{ marginBottom:24 }}>
            <PrimaryBtn onClick={getUserLocation} disabled={isGettingLocation} style={{ padding:"16px 24px", borderRadius:12 }}>
              {isGettingLocation ? "🔄 Getting Location..." : "📍 Use My Current Location"}
            </PrimaryBtn>
            {userLocation && (
              <div style={{ marginTop:12, color:SLATE_LT, fontSize:"0.85rem" }}>
                📍 Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </div>
            )}
          </div>

          {/* Manual Search */}
          <div style={{ height:1, background:theme === "dark" ? "#334155" : BORDER, margin:"24px 0" }}></div>
          <div style={{ marginBottom:16 }}>
            <h4 style={{ fontWeight:700, color:theme === "dark" ? WHITE : SLATE, fontSize:"0.95rem", marginBottom:16 }}>Or Search Manually</h4>
          </div>

          <div className="search-grid" style={{ display:"grid", gap:16, marginBottom:24 }}>
            <div>
              <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE_MD, marginBottom:8 }}>State</label>
              <select
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(""); }}
                style={{
                  width:"100%", padding:"14px 18px", borderRadius:12, border:`2px solid ${theme === "dark" ? "#334155" : BORDER}`,
                  fontFamily:FONT, fontSize:"0.95rem", color:theme === "dark" ? WHITE : SLATE, outline:"none", background:theme === "dark" ? "#1E293B" : WHITE,
                  transition:"border-color 0.2s", boxSizing:"border-box", appearance:"none", cursor:"pointer"
                }}
              >
                <option value="">All States</option>
                {states.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE_MD, marginBottom:8 }}>City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState}
                style={{
                  width:"100%", padding:"14px 18px", borderRadius:12, border:`2px solid ${theme === "dark" ? "#334155" : BORDER}`,
                  fontFamily:FONT, fontSize:"0.95rem", color:theme === "dark" ? WHITE : SLATE, outline:"none", background:theme === "dark" ? "#1E293B" : WHITE,
                  transition:"border-color 0.2s", boxSizing:"border-box", appearance:"none", cursor: selectedState ? "pointer" : "not-allowed", opacity: selectedState ? 1 : 0.6
                }}
              >
                <option value="">All Cities</option>
                {selectedState && citiesByState[selectedState]?.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontWeight:600, fontSize:"0.85rem", color:SLATE_MD, marginBottom:8 }}>Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                style={{
                  width:"100%", padding:"14px 18px", borderRadius:12, border:`2px solid ${theme === "dark" ? "#334155" : BORDER}`,
                  fontFamily:FONT, fontSize:"0.95rem", color:theme === "dark" ? WHITE : SLATE, outline:"none", background:theme === "dark" ? "#1E293B" : WHITE,
                  transition:"border-color 0.2s", boxSizing:"border-box", appearance:"none", cursor:"pointer"
                }}
              >
                <option value="">All Blood Groups</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(group => <option key={group} value={group}>{group}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"flex-end" }}>
              <PrimaryBtn onClick={handleBloodSearch} disabled={isSearching} style={{ width:"100%", height:50, padding:"0 32px", borderRadius:12 }}>
                {isSearching ? "Searching..." : "🔍 Search"}
              </PrimaryBtn>
            </div>
          </div>

          {(hasSearched || nearbyBloodBanks.length > 0) && (
            <GhostBtn onClick={handleClearSearch} style={{ padding:"10px 20px", fontSize:"0.85rem" }}>✕ Clear Results</GhostBtn>
          )}
        </div>

        {/* Nearby Blood Banks Results */}
        {nearbyBloodBanks.length > 0 && (
          <div style={{ marginBottom:40 }}>
            <h3 style={{ fontWeight:800, color:theme === "dark" ? WHITE : SLATE, fontSize:"1.3rem", marginBottom:24 }}>
              🏥 Nearby Blood Banks (10 closest)
            </h3>
            <div className="results-grid" style={{ display:"grid", gap:20 }}>
              {nearbyBloodBanks.map(bank => (
                <Card key={bank.id} style={{ padding:24 }} theme={theme}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:16 }}>
                    <div>
                      <h4 style={{ fontWeight:800, color:theme === "dark" ? WHITE : SLATE, fontSize:"1rem", marginBottom:4 }}>{bank.name}</h4>
                      <p style={{ color:SLATE_LT, fontSize:"0.85rem", marginBottom:2 }}>{bank.address}</p>
                      <p style={{ color:SLATE_LT, fontSize:"0.8rem" }}>{bank.city}, {bank.state}</p>
                    </div>
                    <div style={{ background:`${RED}12`, color:RED, padding:"6px 12px", borderRadius:20, fontWeight:700, fontSize:"0.8rem" }}>
                      {bank.distance.toFixed(1)} km
                    </div>
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <p style={{ fontWeight:600, color:theme === "dark" ? WHITE : SLATE, fontSize:"0.85rem", marginBottom:8 }}>📞 {bank.phone}</p>
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <p style={{ fontWeight:600, color:theme === "dark" ? WHITE : SLATE, fontSize:"0.85rem", marginBottom:8 }}>Blood Stock:</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {Object.entries(bank.bloodStock).map(([group, units]) => (
                        <div key={group} style={{
                          background:BG_COLOR[group]||RED,
                          color:WHITE,
                          padding:"4px 10px",
                          borderRadius:12,
                          fontSize:"0.75rem",
                          fontWeight:700,
                          minWidth: "45px",
                          textAlign: "center"
                        }}>
                          {group}: {units}
                        </div>
                      ))}
                    </div>
                  </div>
                  <PrimaryBtn onClick={() => window.location.href = `tel:${bank.phone}`} style={{ width:"100%", padding:"12px", borderRadius:10, fontSize:"0.9rem", justifyContent:"center", display:"flex" }}>
                    📞 Contact Hospital
                  </PrimaryBtn>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div>
            <h3 style={{ fontWeight:800, color:theme === "dark" ? WHITE : SLATE, fontSize:"1.3rem", marginBottom:24 }}>
              🔍 Search Results ({searchResults.length} blood bank{searchResults.length !== 1 ? "s" : ""} found)
            </h3>
            {searchResults.length === 0 ? (
              <Card style={{ textAlign:"center", padding:40 }} theme={theme}>
                <p style={{ color:SLATE_LT, fontSize:"0.95rem" }}>No blood banks match your filters. Try widening your search.</p>
              </Card>
            ) : (
              <div className="results-grid" style={{ display:"grid", gap:20 }}>
                {searchResults.map(bank => (
                  <Card key={bank.id} style={{ padding:24 }} theme={theme}>
                    <div style={{ marginBottom:16 }}>
                      <h4 style={{ fontWeight:800, color:theme === "dark" ? WHITE : SLATE, fontSize:"1rem", marginBottom:4 }}>{bank.name}</h4>
                      <p style={{ color:SLATE_LT, fontSize:"0.85rem", marginBottom:2 }}>{bank.address}</p>
                      <p style={{ color:SLATE_LT, fontSize:"0.8rem" }}>{bank.city}, {bank.state}</p>
                    </div>
                    <div style={{ marginBottom:16 }}>
                      <p style={{ fontWeight:600, color:theme === "dark" ? WHITE : SLATE, fontSize:"0.85rem", marginBottom:8 }}>📞 {bank.phone}</p>
                    </div>
                    <div style={{ marginBottom:16 }}>
                      <p style={{ fontWeight:600, color:theme === "dark" ? WHITE : SLATE, fontSize:"0.85rem", marginBottom:8 }}>Blood Stock:</p>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                        {Object.entries(bank.bloodStock).map(([group, units]) => (
                          <div key={group} style={{
                            background:BG_COLOR[group]||RED,
                            color:WHITE,
                            padding:"4px 10px",
                            borderRadius:12,
                            fontSize:"0.75rem",
                            fontWeight:700,
                            minWidth: "45px",
                            textAlign: "center"
                          }}>
                            {group}: {units}
                          </div>
                        ))}
                      </div>
                    </div>
                    <PrimaryBtn onClick={() => window.location.href = `tel:${bank.phone}`} style={{ width:"100%", padding:"12px", borderRadius:10, fontSize:"0.9rem", justifyContent:"center", display:"flex" }}>
                      📞 Contact Hospital
                    </PrimaryBtn>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Default Blood Group Availability */}
        {!hasSearched && nearbyBloodBanks.length === 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }} className="four-col">
            {[["A+","89","Available",82],["B+","42","Low",38],["O+","124","Available",95],["AB+","67","Available",60],["A-","31","Low",28],["B-","15","Low",12],["O-","5","Critical",5],["AB-","8","Critical",7]].map(([g,u,s,pct]) => {
              const sc = s==="Critical"?RED:s==="Low"?"#D97706":"#16A34A";
              return (
                <Card key={g} style={{ textAlign:"center", padding:"24px 20px" }} theme={theme}>
                  <div style={{ width:56, height:56, borderRadius:16, background:BG_COLOR[g]||RED, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", boxShadow:`0 8px 20px ${BG_COLOR[g]||RED}40` }}>
                    <span style={{ color:WHITE, fontWeight:900, fontSize:"1rem" }}>{g}</span>
                  </div>
                  <div style={{ fontWeight:800, fontSize:"1.8rem", color:theme === "dark" ? WHITE : SLATE, lineHeight:1 }}>{u}</div>
                  <div style={{ color:SLATE_LT, fontSize:"0.8rem", marginTop:2, marginBottom:10 }}>units available</div>
                  <div style={{ height:6, background:theme === "dark" ? "#334155" : BORDER, borderRadius:3, marginBottom:10 }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:sc, borderRadius:3, transition:"width 1s ease" }}/>
                  </div>
                  <span style={{ color:sc, fontWeight:700, fontSize:"0.78rem", background:`${sc}15`, padding:"3px 10px", borderRadius:16 }}>{s}</span>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* ════════════════════════════════════════════════
          EMERGENCY REQUEST
      ════════════════════════════════════════════════ */}
      <section style={{ background:`linear-gradient(135deg,${RED_DARK},${RED})`, padding:"80px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }}/>
        <div style={{ position:"absolute", bottom:-80, left:-40, width:250, height:250, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }}/>
        <div style={{ maxWidth:900, margin:"0 auto", position:"relative" }}>

          {/* Urgent Banner */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:"rgba(255,255,255,0.15)", borderRadius:12, padding:"12px 24px", marginBottom:36, backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.2)" }}>
            <span style={{ animation:"pulse 1.5s infinite", fontSize:"1.2rem" }}>🚨</span>
            <span style={{ color:WHITE, fontWeight:700, fontSize:"0.95rem" }}>EMERGENCY REQUEST — Response within 30 minutes guaranteed</span>
          </div>

          <SectionTitle light>Emergency Blood Request</SectionTitle>
          <p style={{ color:"rgba(255,255,255,0.75)", marginBottom:36, fontSize:"0.95rem" }}>Fill this form and our team will match you with available donors and hospitals immediately.</p>

          {emergencySuccess && (
            <div style={{ background:"rgba(255,255,255,0.95)", color:"#166534", borderRadius:14, padding:"16px 20px", marginBottom:24, fontWeight:700, display:"flex", alignItems:"center", gap:10 }}>
              ✅ Request submitted! Our team will contact you within 30 minutes.
            </div>
          )}

          <div style={{ background:"rgba(255,255,255,0.1)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:24, padding:36 }}>
            <form onSubmit={handleEmergencySubmit}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }} className="two-col">
                <Input name="patientName" placeholder="Patient Full Name" required style={{ background:"rgba(255,255,255,0.95)" }} />
                <Input name="contactNumber" placeholder="Contact Number" type="tel" required style={{ background:"rgba(255,255,255,0.95)" }} />
                <Select name="bloodGroup" options={["Blood Group Required","A+","A-","B+","B-","AB+","AB-","O+","O-"]} style={{ background:"rgba(255,255,255,0.95)" }} />
                <Input name="hospitalName" placeholder="Hospital Name" required style={{ background:"rgba(255,255,255,0.95)" }} />
                <Input name="unitsRequired" placeholder="Units Required" type="number" min="1" required style={{ background:"rgba(255,255,255,0.95)" }} />
                <Input name="location" placeholder="City / Location" required style={{ background:"rgba(255,255,255,0.95)" }} />
              </div>
              <textarea name="additionalInfo" placeholder="Additional information (optional)…" style={{ width:"100%", padding:"14px 18px", borderRadius:12, border:`2px solid ${BORDER}`, fontFamily:FONT, fontSize:"0.95rem", color:SLATE, outline:"none", background:"rgba(255,255,255,0.95)", resize:"vertical", minHeight:80, boxSizing:"border-box", marginBottom:20 }} />
              <button type="submit" disabled={emergencySubmitting} style={{ width:"100%", background:WHITE, color:RED, border:"none", borderRadius:12, padding:"16px", fontFamily:FONT, fontSize:"1rem", fontWeight:800, cursor: emergencySubmitting ? "not-allowed" : "pointer", opacity: emergencySubmitting ? 0.75 : 1, transition:"all 0.2s", boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }}
                onMouseEnter={e => { if(!emergencySubmitting){ e.target.style.background = "#FFF5F5"; e.target.style.transform = "translateY(-2px)"; } }}
                onMouseLeave={e => { e.target.style.background = WHITE; e.target.style.transform = "translateY(0)"; }}
              >{emergencySubmitting ? "Sending..." : "🚨 Submit Emergency Request"}</button>
            </form>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          DONOR REGISTRATION (multi-step)
      ════════════════════════════════════════════════ */}
      <Section bg={WHITE} id="donate" theme={theme}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"start" }} className="two-col">
          <div>
            <SectionLabel text="Become a Donor" />
            <SectionTitle theme={theme}>Register as a Blood Donor</SectionTitle>
            <p style={{ color:SLATE_LT, fontSize:"0.95rem", lineHeight:1.7, marginBottom:32 }}>
              Joining takes less than 5 minutes. One donation can save up to 3 lives. Your blood group, health, and schedule — we handle the rest.
            </p>
            {[["Why donate?","One unit of blood can save up to 3 lives. Donors also receive free health screenings."],["Who can donate?","Anyone aged 18–65, weighing 50kg+, in general good health can donate every 56 days."],["What to expect?","Registration → Health check → Donation (8–10 min) → Refreshments → Certificate"]].map(([t,d]) => (
              <div key={t} style={{ display:"flex", gap:14, marginBottom:20 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:RED, flexShrink:0, marginTop:7 }}/>
                <div>
                  <div style={{ fontWeight:700, color:theme === "dark" ? WHITE : SLATE, marginBottom:3 }}>{t}</div>
                  <div style={{ color:SLATE_LT, fontSize:"0.88rem", lineHeight:1.6 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>

          <Card style={{ padding:36 }} hover={false} theme={theme}>
            {donorSuccess && (
              <div style={{ background:"#DCFCE7", color:"#166534", borderRadius:14, padding:"16px 20px", marginBottom:24, fontWeight:700, display:"flex", alignItems:"center", gap:10 }}>
                ✅ Donor registration successful! Thank you for saving lives.
              </div>
            )}
            <form onSubmit={handleDonorRegistration}>
              {/* Step progress */}
              <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:32 }}>
                {[1,2,3].map((s,i) => (
                  <React.Fragment key={s}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background: step>=s ? RED : (theme === "dark" ? "#334155" : BORDER), color: step>=s ? WHITE : SLATE_LT, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"0.85rem", transition:"all 0.3s", flexShrink:0 }}>{s}</div>
                    {i<2 && <div style={{ flex:1, height:2, background: step>s+1 ? RED : (theme === "dark" ? "#334155" : BORDER), transition:"background 0.3s" }}/>}
                  </React.Fragment>
                ))}
              </div>
              <div style={{ fontWeight:700, fontSize:"0.8rem", color:SLATE_LT, marginBottom:20, letterSpacing:"0.05em" }}>
                {step===1?"PERSONAL INFO":step===2?"HEALTH DETAILS":"SCHEDULE"}
              </div>

              {step===1 && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <Input placeholder="First Name" required theme={theme} value={donorForm.firstName} onChange={e => updateDonorField("firstName", e.target.value)} />
                    <Input placeholder="Last Name" required theme={theme} value={donorForm.lastName} onChange={e => updateDonorField("lastName", e.target.value)} />
                  </div>
                  <Input placeholder="Email Address" type="email" required theme={theme} value={donorForm.email} onChange={e => updateDonorField("email", e.target.value)} />
                  <Input placeholder="Phone Number" type="tel" required theme={theme} value={donorForm.phone} onChange={e => updateDonorField("phone", e.target.value)} />
                  <Input placeholder="Date of Birth" type="date" required theme={theme} value={donorForm.dob} onChange={e => updateDonorField("dob", e.target.value)} />
                </div>
              )}
              {step===2 && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <Select options={["Select Blood Group","A+","A-","B+","B-","AB+","AB-","O+","O-"]} theme={theme} value={donorForm.bloodGroup} onChange={e => updateDonorField("bloodGroup", e.target.value)} />
                  <Input placeholder="Weight (kg)" type="number" required theme={theme} value={donorForm.weight} onChange={e => updateDonorField("weight", e.target.value)} />
                  <Select options={["Last Donation","Never donated","Within 3 months","Within 6 months","Over 6 months ago"]} theme={theme} value={donorForm.lastDonation} onChange={e => updateDonorField("lastDonation", e.target.value)} />
                  <Select options={["Any medical conditions?","None","Diabetes","Hypertension","Other"]} theme={theme} value={donorForm.conditions} onChange={e => updateDonorField("conditions", e.target.value)} />
                </div>
              )}
              {step===3 && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <Input placeholder="Preferred Date" type="date" required theme={theme} value={donorForm.preferredDate} onChange={e => updateDonorField("preferredDate", e.target.value)} />
                  <Select options={["Preferred Time","Morning (9 AM–12 PM)","Afternoon (12–4 PM)","Evening (4–7 PM)"]} theme={theme} value={donorForm.preferredTime} onChange={e => updateDonorField("preferredTime", e.target.value)} />
                  <Select options={["Preferred Location","City Blood Bank","Apollo Hospital","Fortis Healthcare","AIIMS"]} theme={theme} value={donorForm.preferredLocation} onChange={e => updateDonorField("preferredLocation", e.target.value)} />
                  <Input placeholder="City" required theme={theme} value={donorForm.city} onChange={e => updateDonorField("city", e.target.value)} />
                </div>
              )}

              <div style={{ display:"flex", justifyContent:"space-between", marginTop:24 }}>
                {step>1 ? <GhostBtn type="button" onClick={() => setStep(s=>s-1)} style={{ flex:1, marginRight:10 }}>← Back</GhostBtn> : <div/>}
                {step<3
                  ? <PrimaryBtn
                      type="button"
                      disabled={(step===1 && !isStep1Valid) || (step===2 && !isStep2Valid)}
                      onClick={() => setStep(s=>s+1)}
                      style={{ flex:1 }}
                    >Next →</PrimaryBtn>
                  : <PrimaryBtn type="submit" disabled={!isStep3Valid} style={{ flex:1 }}>✓ Register Donor</PrimaryBtn>
                }
              </div>
            </form>
          </Card>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          DONATION PROCESS
      ════════════════════════════════════════════════ */}
      <Section bg={SMOKE} id="process" theme={theme}>
        <div style={{ textAlign:"center", marginBottom:60 }}>
          <SectionLabel text="How It Works" />
          <SectionTitle theme={theme}>Simple 4-Step Process</SectionTitle>
          <p style={{ color:SLATE_LT, maxWidth:480, margin:"0 auto", fontSize:"0.95rem", lineHeight:1.7 }}>From registration to saving a life — the entire process takes under 90 minutes.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:24, position:"relative" }} className="four-col">
          {/* Connector line */}
          <div style={{ position:"absolute", top:40, left:"12.5%", right:"12.5%", height:2, background:`linear-gradient(90deg,${RED},${RED_DARK})`, zIndex:0, opacity:0.3 }}/>

          {[
            ["01","📝","Register","Create your donor profile with basic health details and blood group in 5 minutes."],
            ["02","📅","Schedule","Pick a convenient time slot at any of our 200+ partner donation centers."],
            ["03","🩸","Donate","The actual blood draw takes only 8–10 minutes. Relax with refreshments after."],
            ["04","❤️","Save Lives","Your donation is tested, processed, and dispatched to patients within 24 hours."]
          ].map(([num,icon,title,desc]) => (
            <Card key={num} style={{ textAlign:"center", position:"relative", zIndex:1, padding:"32px 24px" }} theme={theme}>
              <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:`linear-gradient(135deg,${RED},${RED_DARK})`, color:WHITE, fontWeight:800, fontSize:"0.7rem", padding:"3px 10px", borderRadius:20, letterSpacing:"0.08em" }}>{num}</div>
              <div style={{ fontSize:"2.5rem", marginBottom:12, marginTop:8 }}>{icon}</div>
              <div style={{ fontWeight:800, color:theme === "dark" ? WHITE : SLATE, fontSize:"1.05rem", marginBottom:8 }}>{title}</div>
              <div style={{ color:SLATE_LT, fontSize:"0.85rem", lineHeight:1.65 }}>{desc}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          PARTNER HOSPITALS
      ════════════════════════════════════════════════ */}
      <Section bg={WHITE} id="hospitals" theme={theme}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <SectionLabel text="Trusted Network" />
          <SectionTitle theme={theme}>Partner Hospitals</SectionTitle>
          <p style={{ color:SLATE_LT, maxWidth:460, margin:"0 auto", fontSize:"0.95rem" }}>Partnered with India's top healthcare institutions for seamless blood supply chain management.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:40 }} className="three-col">
          {[
            ["🏥","Apollo Hospitals","Mumbai, Delhi, Bangalore","NABH Accredited","400+ Beds"],
            ["🏥","Fortis Healthcare","Pan India (36 facilities)","JCI Certified","500+ Beds"],
            ["🏥","AIIMS","New Delhi","Govt. Premier Institute","2,500+ Beds"],
            ["🏥","Narayana Health","Bengaluru, Kolkata","ISO 9001:2015","350+ Beds"],
            ["🏥","Max Healthcare","Delhi NCR","NABH Accredited","480+ Beds"],
            ["🏥","Kokilaben Hospital","Mumbai","JCI Certified","750+ Beds"]
          ].map(([icon,name,loc,cert,beds]) => (
            <Card key={name} style={{ display:"flex", gap:16, alignItems:"flex-start", padding:"24px 20px" }} theme={theme}>
              <div style={{ fontSize:"2rem", flexShrink:0 }}>{icon}</div>
              <div>
                <div style={{ fontWeight:800, color:theme === "dark" ? WHITE : SLATE, fontSize:"0.95rem", marginBottom:3 }}>{name}</div>
                <div style={{ color:SLATE_LT, fontSize:"0.8rem", marginBottom:6 }}>{loc}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <span style={{ background:`${RED}12`, color:RED, fontSize:"0.72rem", fontWeight:700, padding:"2px 8px", borderRadius:12 }}>{cert}</span>
                  <span style={{ background:`${SLATE}0A`, color:SLATE_MD, fontSize:"0.72rem", fontWeight:600, padding:"2px 8px", borderRadius:12 }}>{beds}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust badges */}
        <div style={{ display:"flex", justifyContent:"center", gap:32, flexWrap:"wrap" }}>
          {["✅ NABH Certified","🔒 HIPAA Compliant","🏅 ISO 27001","⭐ 4.9/5 Rating","🔬 WHO Guidelines"].map(b => (
            <div key={b} style={{ color:theme === "dark" ? WHITE : SLATE_MD, fontWeight:600, fontSize:"0.85rem" }}>{b}</div>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════ */}
      <Section bg={SMOKE} theme={theme}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <SectionLabel text="Real Stories" />
          <SectionTitle theme={theme}>Lives Changed by Donors</SectionTitle>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }} className="three-col">
          {[
            ["Priya Sharma","Blood Recipient","My daughter needed emergency surgery. HemoCare connected us with a donor in under 20 minutes. I cannot put into words what that means to our family.","⭐⭐⭐⭐⭐","Mumbai","PS"],
            ["Dr. Arjun Mehta","Cardiologist, Apollo","As a physician, I've seen firsthand how HemoCare's real-time inventory system has transformed emergency care. Blood is available when we need it, every time.","⭐⭐⭐⭐⭐","Delhi","AM"],
            ["Sunita Patil","Regular Donor (12× donated)","I've been donating through HemoCare for 3 years. The scheduling is effortless and I love knowing exactly when my donation has been used to help a patient.","⭐⭐⭐⭐⭐","Pune","SP"]
          ].map(([name,role,quote,stars,city,init]) => (
            <Card key={name} style={{ padding:28 }} theme={theme}>
              <div style={{ color:RED, fontSize:"1.5rem", marginBottom:12 }}>❝</div>
              <p style={{ color:theme === "dark" ? WHITE : SLATE_MD, fontSize:"0.9rem", lineHeight:1.75, marginBottom:20, fontStyle:"italic" }}>"{quote}"</p>
              <div style={{ fontSize:"0.8rem", marginBottom:16 }}>{stars}</div>
              <div style={{ display:"flex", alignItems:"center", gap:12, borderTop:`1px solid ${theme === "dark" ? "#334155" : BORDER}`, paddingTop:16 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${RED},${RED_DARK})`, color:WHITE, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.85rem", flexShrink:0 }}>{init}</div>
                <div>
                  <div style={{ fontWeight:700, color:theme === "dark" ? WHITE : SLATE, fontSize:"0.9rem" }}>{name}</div>
                  <div style={{ color:SLATE_LT, fontSize:"0.78rem" }}>{role} · {city}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          CAMPAIGNS
      ════════════════════════════════════════════════ */}
      <Section bg={WHITE} theme={theme}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:40, flexWrap:"wrap", gap:16 }}>
          <div>
            <SectionLabel text="Upcoming Events" />
            <SectionTitle theme={theme}>Blood Donation Campaigns</SectionTitle>
          </div>
          <GhostBtn onClick={handleProtectedAction}>View All Events →</GhostBtn>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }} className="three-col">
          {[
            ["🌅","July 15, 2026","World Blood Donor Day Drive","AIIMS, New Delhi","Target: 500 units","Open Registration"],
            ["🏢","July 22, 2026","Corporate Blood Camp","Infosys Campus, Bengaluru","Target: 200 units","Limited Spots"],
            ["🏫","Aug 3, 2026","College Donation Drive","IIT Bombay","Target: 300 units","Open Registration"]
          ].map(([icon,date,title,loc,target,status]) => {
            const limited = status==="Limited Spots";
            return (
              <Card key={title} style={{ padding:0, overflow:"hidden" }} theme={theme}>
                <div style={{ background:`linear-gradient(135deg,${limited?RED_DARK:"#1E40AF"},${limited?RED:"#3B82F6"})`, padding:"20px 24px" }}>
                  <div style={{ fontSize:"2rem", marginBottom:4 }}>{icon}</div>
                  <div style={{ color:"rgba(255,255,255,0.75)", fontSize:"0.8rem", fontWeight:600 }}>{date}</div>
                </div>
                <div style={{ padding:"20px 24px" }}>
                  <div style={{ fontWeight:800, color:theme === "dark" ? WHITE : SLATE, marginBottom:6 }}>{title}</div>
                  <div style={{ color:SLATE_LT, fontSize:"0.85rem", marginBottom:12 }}>📍 {loc}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ color:theme === "dark" ? WHITE : SLATE_MD, fontSize:"0.82rem", fontWeight:600 }}>🎯 {target}</span>
                    <span style={{ background:limited?`${RED}12`:"#DCFCE7", color:limited?RED:"#16A34A", fontSize:"0.75rem", fontWeight:700, padding:"3px 10px", borderRadius:16 }}>{status}</span>
                  </div>
                  <PrimaryBtn onClick={handleProtectedAction} style={{ width:"100%", marginTop:16, padding:"11px", borderRadius:10, display:"block" }}>Register Free</PrimaryBtn>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════ */}
      <section style={{ background:`linear-gradient(135deg,${SLATE},#0F172A)`, padding:"80px 24px", textAlign:"center" }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <div style={{ fontSize:"3rem", marginBottom:16 }}>🩸</div>
          <h2 style={{ fontFamily:FONT, fontWeight:900, fontSize:"clamp(2rem,5vw,3rem)", color:WHITE, lineHeight:1.1, marginBottom:16 }}>
            Every Drop Counts
          </h2>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"1rem", lineHeight:1.7, marginBottom:36 }}>
            It costs you nothing but an hour. It could mean everything to someone in need. Join 48,000+ donors today.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <PrimaryBtn onClick={handleProtectedAction} style={{ padding:"16px 40px", fontSize:"1rem", borderRadius:14 }}>🩸 Start Donating</PrimaryBtn>
            <GhostBtn dark onClick={(e) => handleSmoothScroll(e, "process")} style={{ padding:"16px 40px", fontSize:"1rem", borderRadius:14 }}>Learn More</GhostBtn>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════ */}
      <footer style={{ background:"#0F172A", color:"rgba(255,255,255,0.55)", padding:"64px 24px 32px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }} className="four-col">

            {/* Brand */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${RED},${RED_DARK})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem" }}>🩸</div>
                <span style={{ fontWeight:900, fontSize:"1.2rem", color:WHITE }}>Hemo<span style={{ color:RED }}>Care</span></span>
              </div>
              <p style={{ fontSize:"0.88rem", lineHeight:1.7, maxWidth:280, marginBottom:20 }}>
                India's most trusted Blood Bank Management System — connecting donors, hospitals, and patients since 2019.
              </p>
              <div style={{ display:"flex", gap:12 }}>
                {["𝕏","in","f","📧"].map(s => (
                  <div key={s} style={{ width:36, height:36, borderRadius:8, background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"0.85rem", transition:"background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = RED}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  >{s}</div>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              ["Quick Links",["Home","Find Blood","Donate Now","Campaigns","About Us","Careers"]],
              ["Services",["Blood Search","Emergency Request","Donor Registration","Hospital Portal","Reports","API Access"]],
              ["Support",["Help Center","Contact Us","Privacy Policy","Terms of Service","Cookie Policy","Accessibility"]]
            ].map(([title,links]) => (
              <div key={title}>
                <div style={{ fontWeight:700, color:WHITE, fontSize:"0.9rem", marginBottom:16 }}>{title}</div>
                {links.map(l => (
                  <button key={l} style={{ display:"block", color:"rgba(255,255,255,0.5)", fontSize:"0.85rem", marginBottom:9, textDecoration:"none", transition:"color 0.2s", background:"none", border:"none", cursor:"pointer", textAlign:"left", padding:0 }}
                    onMouseEnter={e => e.target.style.color = WHITE}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
                  >{l}</button>
                ))}
              </div>
            ))}
          </div>

          {/* Emergency bar */}
          <div style={{ background:`${RED}20`, border:`1px solid ${RED}40`, borderRadius:12, padding:"16px 24px", marginBottom:32, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:"1.3rem" }}>🚨</span>
              <span style={{ color:WHITE, fontWeight:700 }}>24/7 Emergency Helpline</span>
            </div>
            <a href="tel:+9118002566631" style={{ color:"#FCA5A5", fontWeight:800, fontSize:"1.05rem", textDecoration:"none" }}>+91 1800-BLOOD-1 (25663-1)</a>
          </div>

          {/* Bottom bar */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:24, borderTop:"1px solid rgba(255,255,255,0.08)", flexWrap:"wrap", gap:12 }}>
            <span style={{ fontSize:"0.82rem" }}>© 2026 HemoCare. All rights reserved.</span>
            <span style={{ fontSize:"0.82rem" }}>Made with ❤️ for patients, by donors.</span>
          </div>
        </div>
      </footer>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }}>
          <div style={{ background:WHITE, borderRadius:16, width:"100%", maxWidth:400, padding:32, boxShadow:"0 20px 60px rgba(0,0,0,0.3)", margin:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:`${RED}15`, display:"flex", alignItems:"center", justifyContent:"center", color:RED, fontSize:"1.5rem" }}>
                🔒
              </div>
              <div>
                <h3 style={{ fontSize:"1.2rem", fontWeight:800, color:SLATE, margin:0 }}>Login Required</h3>
                <p style={{ fontSize:"0.9rem", color:SLATE_LT, margin:0 }}>Authentication needed</p>
              </div>
            </div>
            <p style={{ fontSize:"0.95rem", color:SLATE_MD, lineHeight:1.6, marginBottom:24 }}>
              {loginModalMessage || "Please login to access this feature and save lives."}
            </p>
            <div style={{ display:"flex", gap:12 }}>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{
                  flex:1,
                  padding:"12px 20px",
                  borderRadius:10,
                  background:SMOKE,
                  color:SLATE,
                  border:`1px solid ${BORDER}`,
                  fontSize:"0.95rem",
                  fontWeight:600,
                  cursor:"pointer",
                  transition:"all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = BORDER}
                onMouseLeave={e => e.currentTarget.style.background = SMOKE}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate("/login");
                }}
                style={{
                  flex:1,
                  padding:"12px 20px",
                  borderRadius:10,
                  background:RED,
                  color:WHITE,
                  border:"none",
                  fontSize:"0.95rem",
                  fontWeight:600,
                  cursor:"pointer",
                  transition:"all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = RED_DARK}
                onMouseLeave={e => e.currentTarget.style.background = RED}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}