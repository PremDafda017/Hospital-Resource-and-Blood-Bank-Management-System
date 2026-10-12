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
  FaXmark,
  FaLocationDot,
  FaPhone,
  FaHeartPulse,
  FaShieldHalved,
  FaCalendarCheck,
  FaUserCheck,
  FaArrowRight,
  FaClock,
  FaCircleCheck,
  FaStar,
  FaKitMedical,
  FaTruckMedical
} from "react-icons/fa6";

/* ─────────────────────────────────────────────
   DESIGN SYSTEM & CONSTANTS (Squarespace-Inspired)
   Palette: Crimson #E11D48 · Deep Maroon #881337 · Slate #0F172A
            Pearl #F8FAFC · Border #E2E8F0
   Type: Plus Jakarta Sans / Inter fallback
───────────────────────────────────────────── */

const FONT = "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const RED = "#E11D48";
const RED_DARK = "#9F1239";
const RED_GLOW = "rgba(225,29,72,0.18)";
const SLATE = "#0F172A";
const SLATE_MD = "#334155";
const SLATE_LT = "#64748B";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";
const BORDER = "#E2E8F0";

// Animated Counter
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.max(1, Math.ceil(target / 60));
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

// Blood Group Badge Color
const BG_COLOR = {
  "A+": "#16A34A", "A-": "#15803D",
  "B+": "#2563EB", "B-": "#1D4ED8",
  "AB+": "#7C3AED", "AB-": "#6D28D9",
  "O+": RED, "O-": RED_DARK
};

// Section Wrapper
function Section({ children, bg = WHITE, id, theme = "light", style = {} }) {
  const bgColor = theme === "dark" ? (bg === WHITE ? "#0F172A" : bg === SMOKE ? "#1E293B" : bg) : bg;
  return (
    <section id={id} style={{ background: bgColor, padding: "110px 0", position: "relative", ...style }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px" }}>{children}</div>
    </section>
  );
}

function SectionLabel({ text, light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 28, height: 3, background: light ? "#FDA4AF" : `linear-gradient(90deg, ${RED}, ${RED_DARK})`, borderRadius: 2 }} />
      <span style={{ color: light ? "#FECDD3" : RED, fontWeight: 800, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: FONT }}>{text}</span>
    </div>
  );
}

function SectionTitle({ children, light = false, theme = "light", style = {} }) {
  const color = light ? WHITE : (theme === "dark" ? WHITE : SLATE);
  return (
    <h2 style={{
      fontFamily: FONT,
      fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)",
      fontWeight: 800,
      color: color,
      lineHeight: 1.12,
      letterSpacing: "-0.03em",
      marginBottom: 18,
      ...style
    }}>
      {children}
    </h2>
  );
}

// Squarespace Card
function Card({ children, style = {}, hover = true, theme = "light" }) {
  const [hovered, setHovered] = useState(false);
  const bgColor = theme === "dark" ? "#1E293B" : WHITE;
  const borderColor = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: bgColor,
        borderRadius: 24,
        border: `1px solid ${borderColor}`,
        padding: "32px",
        boxShadow: hovered ? "0 25px 60px -15px rgba(0,0,0,0.12), 0 10px 25px -5px rgba(0,0,0,0.04)" : "0 4px 24px -2px rgba(0,0,0,0.04)",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        ...style
      }}
    >
      {children}
    </div>
  );
}

// Input Component
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
        width: "100%", padding: "16px 20px", borderRadius: 14, border: `2px solid ${borderColor}`,
        fontFamily: FONT, fontSize: "0.95rem", color: textColor, outline: "none", background: bgColor,
        transition: "all 0.25s ease", boxSizing: "border-box", ...style
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
        width: "100%", padding: "16px 20px", borderRadius: 14, border: `2px solid ${borderColor}`,
        fontFamily: FONT, fontSize: "0.95rem", color: textColor, outline: "none", background: bgColor,
        transition: "all 0.25s ease", boxSizing: "border-box", appearance: "none", cursor: "pointer", ...style
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
        background: disabled ? SLATE_LT : (hovered ? `linear-gradient(135deg, ${RED_DARK}, ${RED})` : `linear-gradient(135deg, ${RED}, ${RED_DARK})`),
        color: WHITE, border: "none", borderRadius: 14, padding: "16px 32px", fontFamily: FONT,
        fontSize: "0.95rem", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: hovered && !disabled ? `0 14px 32px ${RED_GLOW}` : `0 6px 20px ${RED_GLOW}`,
        transform: hovered && !disabled ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", whiteSpace: "nowrap", opacity: disabled ? 0.7 : 1,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, ...style
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, style = {}, onClick, dark = false, type = "button" }) {
  const [hovered, setHovered] = useState(false);
  const base = dark ? "rgba(255,255,255,0.08)" : "transparent";
  const hov = dark ? "rgba(255,255,255,0.18)" : SMOKE;
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? hov : base,
        color: dark ? WHITE : SLATE, border: `2px solid ${dark ? "rgba(255,255,255,0.25)" : BORDER}`,
        borderRadius: 14, padding: "15px 30px", fontFamily: FONT, fontSize: "0.95rem",
        fontWeight: 700, cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", whiteSpace: "nowrap",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, ...style
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

    switch (userRole) {
      case "patient":
        navigate("/patient-dashboard");
        break;
      case "donor":
        navigate("/dashboard");
        break;
      case "hospital_staff":
        navigate("/hospital-dashboard");
        break;
      case "blood_bank_staff":
        navigate("/dashboard");
        break;
      case "administrator":
        navigate("/dashboard");
        break;
      default:
        navigate("/dashboard");
    }
  };

  // Comprehensive blood bank database
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
    { id: 121, name: "AMRI Hospital Blood Bank", state: "Odisha", city: "Bhubaneswar", address: "AMRI Hospital, Bhubaneswar", phone: "0674-6666666", lat: 20.3061, lng: 85.8345, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 122, name: "SUM Hospital Blood Bank", state: "Odisha", city: "Bhubaneswar", address: "SUM Hospital, Bhubaneswar", phone: "0674-2384123", lat: 20.3161, lng: 85.8445, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },

    // ASSAM - Government Hospitals
    { id: 123, name: "GMCH Guwahati Blood Bank", state: "Assam", city: "Guwahati", address: "GMCH, Guwahati", phone: "0361-2529457", lat: 26.1445, lng: 91.7362, bloodStock: { "A+": 28, "A-": 8, "B+": 25, "B-": 7, "AB+": 16, "AB-": 4, "O+": 48, "O-": 11 } },
    { id: 124, name: "AMCH Dibrugarh Blood Bank", state: "Assam", city: "Dibrugarh", address: "AMCH, Dibrugarh", phone: "0373-2300080", lat: 27.4728, lng: 94.9120, bloodStock: { "A+": 22, "A-": 6, "B+": 20, "B-": 5, "AB+": 13, "AB-": 3, "O+": 40, "O-": 9 } },

    // ASSAM - Private Hospitals
    { id: 125, name: "Apollo Hospital Blood Bank", state: "Assam", city: "Guwahati", address: "Apollo Hospital, Guwahati", phone: "0361-2345678", lat: 26.1545, lng: 91.7462, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 126, name: "GNRC Hospital Blood Bank", state: "Assam", city: "Guwahati", address: "GNRC Hospital, Guwahati", phone: "0361-2678901", lat: 26.1645, lng: 91.7562, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    { id: 127, name: "Excelcare Hospital Blood Bank", state: "Assam", city: "Guwahati", address: "Excelcare Hospital, Guwahati", phone: "0361-2789012", lat: 26.1745, lng: 91.7662, bloodStock: { "A+": 38, "A-": 12, "B+": 34, "B-": 9, "AB+": 22, "AB-": 6, "O+": 62, "O-": 15 } },

    // JHARKHAND - Government Hospitals
    { id: 128, name: "RIMS Blood Bank", state: "Jharkhand", city: "Ranchi", address: "RIMS, Ranchi", phone: "0651-2545678", lat: 23.3441, lng: 85.3096, bloodStock: { "A+": 30, "A-": 9, "B+": 27, "B-": 7, "AB+": 17, "AB-": 4, "O+": 52, "O-": 12 } },
    { id: 129, name: "MGM Medical College Blood Bank", state: "Jharkhand", city: "Jamshedpur", address: "MGM Medical College, Jamshedpur", phone: "0657-2345678", lat: 22.8046, lng: 86.2029, bloodStock: { "A+": 25, "A-": 7, "B+": 22, "B-": 6, "AB+": 14, "AB-": 3, "O+": 45, "O-": 10 } },

    // JHARKHAND - Private Hospitals
    { id: 130, name: "Apollo Hospital Blood Bank", state: "Jharkhand", city: "Ranchi", address: "Apollo Hospital, Ranchi", phone: "0651-2545679", lat: 23.3541, lng: 85.3196, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
    { id: 131, name: "Medica Hospital Blood Bank", state: "Jharkhand", city: "Ranchi", address: "Medica Hospital, Ranchi", phone: "0651-2678901", lat: 23.3641, lng: 85.3296, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
    { id: 132, name: "TMH Hospital Blood Bank", state: "Jharkhand", city: "Jamshedpur", address: "Tata Main Hospital, Jamshedpur", phone: "0657-2224567", lat: 22.8146, lng: 86.2129, bloodStock: { "A+": 45, "A-": 14, "B+": 40, "B-": 11, "AB+": 26, "AB-": 7, "O+": 72, "O-": 18 } },

    // CHHATTISGARH - Government Hospitals
    { id: 133, name: "Dr. BRAM Hospital Blood Bank", state: "Chhattisgarh", city: "Raipur", address: "Dr. BRAM Hospital, Raipur", phone: "0771-2545678", lat: 21.2514, lng: 81.6296, bloodStock: { "A+": 28, "A-": 8, "B+": 25, "B-": 7, "AB+": 16, "AB-": 4, "O+": 48, "O-": 11 } },

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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearbyBloodBanks = (userLat, userLng) => {
    const banksWithDistance = bloodBankDatabase.map(bank => ({
      ...bank,
      distance: calculateDistance(userLat, userLng, bank.lat, bank.lng)
    })).sort((a, b) => a.distance - b.distance);

    setNearbyBloodBanks(banksWithDistance.slice(0, 10));
  };

  const handleBloodSearch = () => {
    setIsSearching(true);
    setHasSearched(true);

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

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setHasSearched(false);
    setSearchResults([]);
    setNearbyBloodBanks([]);
    setSelectedState("");
    setSelectedCity("");
    setBloodGroup("");
    setUserLocation(null);
  };

  const handleProtectedAction = () => {
    setMobileMenuOpen(false);
    if (!isSignedIn) {
      setLoginModalMessage("Please login first to access this feature.");
      setShowLoginModal(true);
      return;
    }
    navigate("/dashboard");
  };

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const handleDonorRegistration = (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      setLoginModalMessage("Please login first to register as a donor.");
      setShowLoginModal(true);
      return;
    }
    if (!isStep3Valid) return;
    setDonorSuccess(true);
    setStep(1);
    setDonorForm({
      firstName: "", lastName: "", email: "", phone: "", dob: "",
      bloodGroup: "Select Blood Group", weight: "", lastDonation: "Last Donation", conditions: "Any medical conditions?",
      preferredDate: "", preferredTime: "Preferred Time", preferredLocation: "Preferred Location", city: ""
    });
    setTimeout(() => setDonorSuccess(false), 6000);
  };

  const navItems = [
    { key: "home", icon: <FaChartLine />, label: "Home" },
    { key: "blood-search", icon: <FaMagnifyingGlass />, label: "Blood Search" },
    { key: "donate", icon: <FaHandHoldingMedical />, label: "Donate" },
    { key: "hospitals", icon: <FaHospital />, label: "Hospitals" },
  ];

  const loggedInNavItems = [
    { key: "dashboard", icon: <FaChartLine />, label: "Dashboard" },
  ];

  const initials = user?.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ""}` : "U";
  const displayName = userProfile?.fullName || user?.fullName || "User";
  const displayRole = userProfile?.role || "donor";

  return (
    <div style={{
      fontFamily: FONT,
      color: theme === "dark" ? WHITE : SLATE,
      overflowX: "hidden",
      background: theme === "dark" ? "#0F172A" : WHITE,
      minHeight: "100vh"
    }}>

      {/* ── Global Styles & Animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${theme === "dark" ? "#0F172A" : WHITE}; color: ${theme === "dark" ? WHITE : SLATE}; font-family: ${FONT}; }
        input::placeholder, select::placeholder { color: ${SLATE_LT}; }
        
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        @keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
        @keyframes floatUp { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        .marquee-track { display: flex; width: 200%; animation: marquee 30s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-float { animation: floatUp 5s ease-in-out infinite; }
        
        .desktop-nav, .desktop-actions { display: flex; }
        .mobile-toggle { display: none; }
        .mobile-menu { display: none; }
        .search-grid { grid-template-columns: repeat(4, 1fr); }
        .results-grid { grid-template-columns: repeat(2, 1fr); }

        @media(max-width:960px){
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
          .mobile-menu.open { display: flex !important; }
          .hero-split { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media(max-width:768px){
          .hero-buttons { flex-direction: column !important; align-items: stretch !important; }
          .two-col { grid-template-columns: 1fr !important; }
          .three-col { grid-template-columns: 1fr !important; }
          .four-col { grid-template-columns: 1fr 1fr !important; }
          .search-grid { grid-template-columns: 1fr 1fr !important; }
          .results-grid { grid-template-columns: 1fr !important; }
        }
        @media(max-width:480px){
          .four-col { grid-template-columns: 1fr !important; }
          .search-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════
          NAVBAR (High-Contrast Glassmorphism Header)
      ════════════════════════════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: navScrolled
          ? (theme === "dark" ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.96)")
          : (theme === "dark" ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.92)"),
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${theme === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"}`,
        boxShadow: navScrolled
          ? "0 10px 30px rgba(0,0,0,0.12)"
          : "0 4px 20px rgba(0,0,0,0.06)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        padding: "0 28px"
      }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 80 }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={(e) => handleSmoothScroll(e, "home")}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: WHITE, fontSize: "1.3rem", boxShadow: `0 8px 20px ${RED_GLOW}`
            }}>
              <FaDroplet />
            </div>
            <span style={{
              fontWeight: 900, fontSize: "1.35rem",
              color: theme === "dark" ? WHITE : SLATE,
              letterSpacing: "-0.03em", transition: "color 0.3s"
            }}>
              Hemo<span style={{ color: RED }}>Care</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }} className="desktop-nav">
            {navItems.map(({ key, icon, label }) => (
              <a key={key} href={`#${key}`}
                onClick={(e) => handleSmoothScroll(e, key)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 12,
                  color: theme === "dark" ? WHITE : SLATE,
                  fontWeight: 700, fontSize: "0.92rem",
                  textDecoration: "none", transition: "all 0.25s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = theme === "dark" ? "rgba(255,255,255,0.15)" : "#F1F5F9";
                  e.currentTarget.style.color = RED;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = theme === "dark" ? WHITE : SLATE;
                }}
              >
                <span style={{ fontSize: "0.95rem" }}>{icon}</span>
                <span>{label}</span>
              </a>
            ))}

            {isSignedIn && userProfile && loggedInNavItems.map(({ key, icon, label }) => (
              <button key={key} onClick={() => handleDashboardNavigation()}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 12,
                  color: theme === "dark" ? WHITE : SLATE,
                  fontWeight: 700, fontSize: "0.92rem",
                  textDecoration: "none", transition: "all 0.25s ease", cursor: "pointer",
                  background: "none", border: "none"
                }}
                onMouseEnter={e => { e.currentTarget.style.color = RED; }}
                onMouseLeave={e => { e.currentTarget.style.color = theme === "dark" ? WHITE : SLATE; }}
              >
                <span style={{ fontSize: "0.95rem" }}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Right Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>

            {/* Theme Toggle */}
            <button onClick={toggleTheme}
              style={{
                width: 44, height: 44, borderRadius: 14,
                border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.2)" : BORDER}`,
                background: theme === "dark" ? "rgba(255,255,255,0.1)" : "#F1F5F9",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: theme === "dark" ? WHITE : SLATE,
                fontSize: "1rem", transition: "all 0.25s ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme === "dark" ? "rgba(255,255,255,0.2)" : BORDER; e.currentTarget.style.color = theme === "dark" ? WHITE : SLATE; }}
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </button>

            {/* Notification Bell (Desktop) */}
            <button className="desktop-actions" style={{
              width: 44, height: 44, borderRadius: 14,
              border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.2)" : BORDER}`,
              background: theme === "dark" ? "rgba(255,255,255,0.1)" : "#F1F5F9",
              cursor: "pointer", alignItems: "center", justifyContent: "center",
              color: theme === "dark" ? WHITE : SLATE,
              fontSize: "1rem", position: "relative", transition: "all 0.25s ease"
            }}>
              <FaBell />
              <span style={{ position: "absolute", top: -2, right: -2, background: RED, color: WHITE, fontSize: "0.68rem", fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
            </button>

            {/* User Profile / Auth Action Buttons */}
            <div className="desktop-actions" style={{ alignItems: "center", gap: 12 }}>
              {isSignedIn && userProfile ? (
                <div style={{ position: "relative" }} data-profile-dropdown>
                  <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`,
                      border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      color: WHITE, fontWeight: 800, fontSize: "0.95rem", transition: "all 0.25s ease"
                    }}
                  >
                    {initials}
                  </button>
                  {profileDropdownOpen && (
                    <div style={{
                      position: "absolute", right: 0, top: 54, width: 300,
                      background: theme === "dark" ? "#1E293B" : WHITE,
                      border: `1px solid ${theme === "dark" ? "#334155" : BORDER}`,
                      borderRadius: 20, boxShadow: "0 25px 60px rgba(0,0,0,0.2)", zIndex: 300, overflow: "hidden"
                    }}>
                      <div style={{ padding: "20px 22px", borderBottom: `1px solid ${theme === "dark" ? "#334155" : BORDER}`, background: theme === "dark" ? "#0F172A" : SMOKE }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontWeight: 800 }}>
                            {initials}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 800, color: theme === "dark" ? WHITE : SLATE, fontSize: "0.98rem" }}>{displayName}</p>
                            <span style={{ background: RED_GLOW, color: RED, fontWeight: 700, fontSize: "0.72rem", padding: "3px 10px", borderRadius: 12, display: "inline-block", textTransform: "capitalize" }}>{displayRole.replace("_", " ")}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: "8px 0" }}>
                        <div onClick={() => navigate("/dashboard")} style={{ padding: "14px 22px", cursor: "pointer", color: theme === "dark" ? WHITE : SLATE, fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 12 }}>
                          📊 Dashboard
                        </div>
                        <div onClick={() => navigate("/settings")} style={{ padding: "14px 22px", cursor: "pointer", color: theme === "dark" ? WHITE : SLATE, fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 12 }}>
                          ⚙️ Settings
                        </div>
                      </div>

                      <div style={{ borderTop: `1px solid ${theme === "dark" ? "#334155" : BORDER}`, padding: "14px 22px" }}>
                        <div onClick={handleLogout} style={{ color: RED, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                          <FaRightFromBracket /> Logout
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={handleLoginClick} style={{
                    background: "transparent",
                    color: RED,
                    border: `2px solid ${RED}`,
                    borderRadius: 12,
                    padding: "11px 22px",
                    fontFamily: FONT,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.25s ease"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${RED}12`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >Log In</button>
                  <PrimaryBtn onClick={handleProtectedAction} style={{ padding: "11px 24px", fontSize: "0.9rem", borderRadius: 12 }}>Donate Now</PrimaryBtn>
                </>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button className="mobile-toggle" onClick={() => setMobileMenuOpen(o => !o)}
              style={{
                width: 44, height: 44, borderRadius: 14,
                border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.2)" : BORDER}`,
                background: theme === "dark" ? "rgba(255,255,255,0.1)" : "#F1F5F9",
                cursor: "pointer", alignItems: "center", justifyContent: "center",
                color: theme === "dark" ? WHITE : SLATE, fontSize: "1.1rem"
              }}
            >
              {mobileMenuOpen ? <FaXmark /> : <FaBars />}
            </button>

          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div className={`mobile-menu${mobileMenuOpen ? " open" : ""}`} style={{
          flexDirection: "column", gap: 4, maxWidth: 1240, margin: "0 auto", padding: "16px 0 24px",
          background: theme === "dark" ? "#0F172A" : WHITE,
          borderTop: `1px solid ${theme === "dark" ? "#334155" : BORDER}`,
          animation: "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          {navItems.map(({ key, icon, label }) => (
            <a key={key} href={`#${key}`} onClick={(e) => handleSmoothScroll(e, key)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", color: theme === "dark" ? WHITE : SLATE, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}
            >
              <span>{icon}</span><span>{label}</span>
            </a>
          ))}
          {isSignedIn && userProfile ? (
            <>
              <button onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", color: theme === "dark" ? WHITE : SLATE, fontWeight: 700, fontSize: "0.95rem", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}>
                <FaChartLine /><span>Dashboard</span>
              </button>
              <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", color: RED, fontWeight: 700, fontSize: "0.95rem", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}>
                <FaRightFromBracket /><span>Logout</span>
              </button>
            </>
          ) : (
            <div style={{ display: "flex", gap: 12, padding: "16px 20px 0" }}>
              <button onClick={handleLoginClick} style={{ flex: 1, padding: "12px", borderRadius: 12, border: `2px solid ${RED}`, color: RED, fontWeight: 700, background: "transparent", cursor: "pointer" }}>Log In</button>
              <PrimaryBtn onClick={handleProtectedAction} style={{ flex: 1 }}>Donate Now</PrimaryBtn>
            </div>
          )}
        </div>
      </nav>

      {/* ════════════════════════════════════════════════
          HERO SECTION (Squarespace High-Impact Showcase)
      ════════════════════════════════════════════════ */}
      <header id="home" style={{
        minHeight: "100vh", position: "relative", display: "flex", alignItems: "center",
        background: `radial-gradient(circle at 80% 20%, ${RED_DARK} 0%, #1E1B4B 45%, #0F172A 100%)`,
        overflow: "hidden", paddingTop: 100, paddingBottom: 80
      }}>
        {/* Subtle Ambient Overlay & Mesh Grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
          backgroundImage: `radial-gradient(circle, #FFFFFF 1px, transparent 1px)`,
          backgroundSize: "32px 32px"
        }} />
        <div style={{ position: "absolute", top: -160, right: -160, width: 650, height: 650, borderRadius: "50%", background: "radial-gradient(circle, rgba(225,29,72,0.35) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -200, left: -100, width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle, rgba(159,18,57,0.3) 0%, transparent 70%)" }} />

        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", width: "100%", position: "relative", zIndex: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 60, alignItems: "center" }} className="hero-split">

            {/* Left Content */}
            <div className="animate-fade-up">
              {isSignedIn && userProfile && (
                <div style={{
                  background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: 20,
                  padding: "16px 22px", marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 14
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                    {userProfile.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p style={{ color: WHITE, fontWeight: 800, fontSize: "0.95rem" }}>Welcome back, {userProfile.fullName}!</p>
                    <span style={{ color: "#FDA4AF", fontSize: "0.78rem", fontWeight: 600, textTransform: "capitalize" }}>{userProfile.role?.replace("_", " ")} Account</span>
                  </div>
                </div>
              )}

              {/* Status Pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.18)", borderRadius: 50,
                padding: "8px 20px", marginBottom: 28
              }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 12px #4ADE80", animation: "pulseDot 2s infinite" }} />
                <span style={{ color: "rgba(255,255,255,0.92)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                  Live Dispatch: 3 Emergency Blood Requests Active
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontFamily: FONT,
                fontSize: "clamp(2.8rem, 5.8vw, 4.8rem)",
                fontWeight: 900,
                color: WHITE,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                marginBottom: 24
              }}>
                Every Drop Matters.<br />
                <span style={{
                  background: `linear-gradient(135deg, #FECDD3 0%, #F43F5E 50%, #FDA4AF 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  Connecting Lives instantly.
                </span>
              </h1>

              {/* Body Subtitle */}
              <p style={{
                color: "rgba(255, 255, 255, 0.72)",
                fontSize: "1.15rem",
                lineHeight: 1.7,
                marginBottom: 40,
                maxWidth: 540,
                fontWeight: 400
              }}>
                India’s premier real-time blood bank logisitics system. Streamlining donor matching, hospital stock synchronization, and 24/7 critical emergency dispatches.
              </p>

              {/* Buttons */}
              <div className="hero-buttons" style={{ display: "flex", gap: 16, marginBottom: 54 }}>
                <PrimaryBtn onClick={handleProtectedAction} style={{ padding: "18px 40px", fontSize: "1.05rem", borderRadius: 16 }}>
                  🩸 Donate Blood Now <FaArrowRight />
                </PrimaryBtn>
                <GhostBtn dark onClick={(e) => handleSmoothScroll(e, "blood-search")} style={{ padding: "18px 36px", fontSize: "1.05rem", borderRadius: 16 }}>
                  🔍 Search Live Availability
                </GhostBtn>
              </div>

              {/* Key Trust Badges */}
              <div style={{ display: "flex", gap: 36, borderTop: "1px solid rgba(255, 255, 255, 0.12)", paddingTop: 32 }}>
                {[["48,000+", "Registered Donors"], ["12,800+", "Units Dispatched"], ["200+", "Partner Hospitals"]].map(([stat, label]) => (
                  <div key={label}>
                    <div style={{ color: WHITE, fontWeight: 900, fontSize: "1.75rem", lineHeight: 1, letterSpacing: "-0.02em" }}>{stat}</div>
                    <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", marginTop: 6, fontWeight: 600 }}>{label}</div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Visual Card Showcase (Squarespace Photo Card) */}
            <div style={{ position: "relative" }} className="animate-float">

              {/* Main Image Container */}
              <div style={{
                borderRadius: 32, overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 35px 90px rgba(0, 0, 0, 0.4)",
                position: "relative", height: 500,
                background: "#1E293B"
              }}>
                <img
                  src="/images/hero_doctor.png"
                  alt="Medical Professional"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)"
                }} />

                {/* Floating Glass Box Overlay */}
                <div style={{
                  position: "absolute", bottom: 24, left: 24, right: 24,
                  background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: 20,
                  padding: "20px 24px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "1.2rem" }}>🏥</span>
                      <span style={{ color: WHITE, fontWeight: 800, fontSize: "0.95rem" }}>Live Inventory Sync</span>
                    </div>
                    <span style={{ background: "#22C55E20", color: "#4ADE80", fontWeight: 700, fontSize: "0.75rem", padding: "3px 10px", borderRadius: 12 }}>
                      Verified Online
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {[["O+", "124 u"], ["A+", "89 u"], ["B+", "42 u"], ["O-", "CRITICAL"]].map(([grp, u]) => (
                      <div key={grp} style={{
                        background: grp === "O-" ? `${RED}30` : "rgba(255,255,255,0.08)",
                        border: grp === "O-" ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12, padding: "8px 6px", textAlign: "center"
                      }}>
                        <div style={{ color: WHITE, fontWeight: 900, fontSize: "0.85rem" }}>{grp}</div>
                        <div style={{ color: grp === "O-" ? "#FCA5A5" : "rgba(255,255,255,0.7)", fontSize: "0.72rem", fontWeight: 700, marginTop: 2 }}>{u}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Shield Badge */}
              <div style={{
                position: "absolute", top: -20, right: -20,
                background: WHITE, borderRadius: 20, padding: "16px 20px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", gap: 12
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${RED}15`, color: RED, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                  <FaShieldHalved />
                </div>
                <div>
                  <div style={{ color: SLATE, fontWeight: 800, fontSize: "0.9rem" }}>NABH Certified</div>
                  <div style={{ color: SLATE_LT, fontSize: "0.78rem" }}>100% Verified Quality</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════
          MARQUEE TICKER (Squarespace Continuous Banner)
      ════════════════════════════════════════════════ */}
      <div style={{
        background: SLATE, borderTop: `1px solid rgba(255,255,255,0.1)`, borderBottom: `1px solid rgba(255,255,255,0.1)`,
        padding: "18px 0", overflow: "hidden", position: "relative"
      }}>
        <div className="marquee-track">
          {[1, 2].map((idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 48, whiteSpace: "nowrap" }}>
              <span style={{ color: WHITE, fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.08em" }}>⚡ 24/7 EMERGENCY BLOOD DISPATCH HELPLINE: TOLL-FREE 1800-BLOOD-1</span>
              <span style={{ color: RED, fontWeight: 900 }}>•</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, fontSize: "0.9rem" }}>48,250+ REGISTERED VOLUNTEER DONORS</span>
              <span style={{ color: RED, fontWeight: 900 }}>•</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, fontSize: "0.9rem" }}>200+ NABH APPROVED HOSPITAL NETWORKS</span>
              <span style={{ color: RED, fontWeight: 900 }}>•</span>
              <span style={{ color: WHITE, fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.08em" }}>❤️ ONE DONATION CAN SAVE UP TO 3 LIVES</span>
              <span style={{ color: RED, fontWeight: 900 }}>•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          LIVE BLOOD SEARCH & INVENTORY HUB
      ════════════════════════════════════════════════ */}
      <Section bg={SMOKE} id="blood-search" theme={theme}>
        <div style={{ textAlign: "center", marginBottom: 54 }}>
          <SectionLabel text="Real-Time Database" />
          <SectionTitle theme={theme}>Search Blood Stocks & Nearby Facilities</SectionTitle>
          <p style={{ color: SLATE_LT, fontSize: "1.05rem", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            Query live inventories across partner hospitals or detect your exact GPS location for immediate blood availability.
          </p>
        </div>

        {/* Search Panel Card */}
        <Card style={{ padding: 40, marginBottom: 40 }} theme={theme} hover={false}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                <FaLocationDot />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, color: theme === "dark" ? WHITE : SLATE, fontSize: "1.15rem" }}>Location-Based Search</h3>
                <p style={{ color: SLATE_LT, fontSize: "0.85rem" }}>Find nearest blood banks within radius</p>
              </div>
            </div>

            <PrimaryBtn onClick={getUserLocation} disabled={isGettingLocation} style={{ borderRadius: 12, padding: "14px 26px" }}>
              {isGettingLocation ? "🔄 Detecting Coordinates..." : "📍 Use My Current Location"}
            </PrimaryBtn>
          </div>

          {userLocation && (
            <div style={{
              background: theme === "dark" ? "#0F172A" : "#EFF6FF",
              border: `1px solid ${theme === "dark" ? "#334155" : "#BFDBFE"}`,
              borderRadius: 14, padding: "14px 20px", marginBottom: 28,
              color: theme === "dark" ? WHITE : "#1E40AF", fontSize: "0.9rem", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 10
            }}>
              <span>📍 GPS Location Pinpoint:</span> Latitude {userLocation.lat.toFixed(4)}, Longitude {userLocation.lng.toFixed(4)}
            </div>
          )}

          <div style={{ height: 1, background: theme === "dark" ? "#334155" : BORDER, margin: "24px 0" }} />

          {/* Search Inputs */}
          <div className="search-grid" style={{ display: "grid", gap: 18, marginBottom: 24 }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: theme === "dark" ? WHITE : SLATE_MD, marginBottom: 8 }}>State</label>
              <select
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(""); }}
                style={{
                  width: "100%", padding: "16px 20px", borderRadius: 14, border: `2px solid ${theme === "dark" ? "#334155" : BORDER}`,
                  fontFamily: FONT, fontSize: "0.95rem", color: theme === "dark" ? WHITE : SLATE, outline: "none", background: theme === "dark" ? "#1E293B" : WHITE,
                  cursor: "pointer"
                }}
              >
                <option value="">All States in India</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: theme === "dark" ? WHITE : SLATE_MD, marginBottom: 8 }}>City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState}
                style={{
                  width: "100%", padding: "16px 20px", borderRadius: 14, border: `2px solid ${theme === "dark" ? "#334155" : BORDER}`,
                  fontFamily: FONT, fontSize: "0.95rem", color: theme === "dark" ? WHITE : SLATE, outline: "none", background: theme === "dark" ? "#1E293B" : WHITE,
                  cursor: selectedState ? "pointer" : "not-allowed", opacity: selectedState ? 1 : 0.6
                }}
              >
                <option value="">All Cities</option>
                {selectedState && citiesByState[selectedState]?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: theme === "dark" ? WHITE : SLATE_MD, marginBottom: 8 }}>Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                style={{
                  width: "100%", padding: "16px 20px", borderRadius: 14, border: `2px solid ${theme === "dark" ? "#334155" : BORDER}`,
                  fontFamily: FONT, fontSize: "0.95rem", color: theme === "dark" ? WHITE : SLATE, outline: "none", background: theme === "dark" ? "#1E293B" : WHITE,
                  cursor: "pointer"
                }}
              >
                <option value="">All Blood Types</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <PrimaryBtn onClick={handleBloodSearch} disabled={isSearching} style={{ width: "100%", height: 56, borderRadius: 14 }}>
                {isSearching ? "Searching..." : "🔍 Search Stock"}
              </PrimaryBtn>
            </div>
          </div>

          {(hasSearched || nearbyBloodBanks.length > 0) && (
            <GhostBtn onClick={handleClearSearch} style={{ padding: "12px 24px", fontSize: "0.88rem" }}>
              ✕ Reset Filters & View Default
            </GhostBtn>
          )}

        </Card>

        {/* Nearby Blood Bank Results */}
        {nearbyBloodBanks.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontWeight: 800, color: theme === "dark" ? WHITE : SLATE, fontSize: "1.35rem", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              🏥 Closest Facilities ({nearbyBloodBanks.length} nearest)
            </h3>
            <div className="results-grid" style={{ display: "grid", gap: 24 }}>
              {nearbyBloodBanks.map(bank => (
                <Card key={bank.id} style={{ padding: 28 }} theme={theme}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 18 }}>
                    <div>
                      <h4 style={{ fontWeight: 800, color: theme === "dark" ? WHITE : SLATE, fontSize: "1.1rem", marginBottom: 4 }}>{bank.name}</h4>
                      <p style={{ color: SLATE_LT, fontSize: "0.88rem", marginBottom: 2 }}>📍 {bank.address}</p>
                      <p style={{ color: SLATE_LT, fontSize: "0.82rem" }}>{bank.city}, {bank.state}</p>
                    </div>
                    <span style={{ background: RED_GLOW, color: RED, padding: "6px 14px", borderRadius: 20, fontWeight: 800, fontSize: "0.82rem" }}>
                      {bank.distance.toFixed(1)} km away
                    </span>
                  </div>
                  <p style={{ fontWeight: 700, color: theme === "dark" ? WHITE : SLATE_MD, fontSize: "0.9rem", marginBottom: 16 }}>
                    📞 Helpline: <a href={`tel:${bank.phone}`} style={{ color: RED, textDecoration: "none" }}>{bank.phone}</a>
                  </p>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: SLATE_LT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Available Units</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {Object.entries(bank.bloodStock).map(([grp, units]) => (
                        <div key={grp} style={{
                          background: BG_COLOR[grp] || RED, color: WHITE,
                          padding: "5px 12px", borderRadius: 12, fontSize: "0.78rem", fontWeight: 800
                        }}>
                          {grp}: {units} u
                        </div>
                      ))}
                    </div>
                  </div>

                  <PrimaryBtn onClick={() => window.location.href = `tel:${bank.phone}`} style={{ width: "100%", padding: "14px", borderRadius: 12, fontSize: "0.92rem" }}>
                    📞 Call Hospital Immediately
                  </PrimaryBtn>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div>
            <h3 style={{ fontWeight: 800, color: theme === "dark" ? WHITE : SLATE, fontSize: "1.35rem", marginBottom: 24 }}>
              🔍 Search Results ({searchResults.length} match{searchResults.length !== 1 ? "es" : ""})
            </h3>
            {searchResults.length === 0 ? (
              <Card style={{ textAlign: "center", padding: 48 }} theme={theme}>
                <p style={{ color: SLATE_LT, fontSize: "1.05rem" }}>No blood banks matched your specific criteria. Please expand your state/city radius.</p>
              </Card>
            ) : (
              <div className="results-grid" style={{ display: "grid", gap: 24 }}>
                {searchResults.map(bank => (
                  <Card key={bank.id} style={{ padding: 28 }} theme={theme}>
                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ fontWeight: 800, color: theme === "dark" ? WHITE : SLATE, fontSize: "1.1rem", marginBottom: 4 }}>{bank.name}</h4>
                      <p style={{ color: SLATE_LT, fontSize: "0.88rem", marginBottom: 2 }}>📍 {bank.address}</p>
                      <p style={{ color: SLATE_LT, fontSize: "0.82rem" }}>{bank.city}, {bank.state}</p>
                    </div>
                    <p style={{ fontWeight: 700, color: theme === "dark" ? WHITE : SLATE_MD, fontSize: "0.9rem", marginBottom: 16 }}>
                      📞 {bank.phone}
                    </p>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: SLATE_LT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Available Units</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {Object.entries(bank.bloodStock).map(([grp, units]) => (
                          <div key={grp} style={{
                            background: BG_COLOR[grp] || RED, color: WHITE,
                            padding: "5px 12px", borderRadius: 12, fontSize: "0.78rem", fontWeight: 800
                          }}>
                            {grp}: {units} u
                          </div>
                        ))}
                      </div>
                    </div>
                    <PrimaryBtn onClick={() => window.location.href = `tel:${bank.phone}`} style={{ width: "100%", padding: "14px", borderRadius: 12, fontSize: "0.92rem" }}>
                      📞 Contact Hospital
                    </PrimaryBtn>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Default Stock Cards */}
        {!hasSearched && nearbyBloodBanks.length === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }} className="four-col">
            {[["O+", "124", "Available", 95], ["A+", "89", "Available", 80], ["B+", "42", "Low Stock", 38], ["AB+", "67", "Available", 60], ["A-", "31", "Low Stock", 28], ["B-", "15", "Low Stock", 15], ["O-", "5", "Critical", 6], ["AB-", "8", "Critical", 8]].map(([grp, u, status, pct]) => {
              const statusColor = status === "Critical" ? RED : status === "Low Stock" ? "#D97706" : "#16A34A";
              return (
                <Card key={grp} style={{ textAlign: "center", padding: "30px 20px" }} theme={theme}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 20, background: BG_COLOR[grp] || RED,
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                    color: WHITE, fontWeight: 900, fontSize: "1.2rem", boxShadow: `0 8px 24px ${BG_COLOR[grp] || RED}40`
                  }}>
                    {grp}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: "2rem", color: theme === "dark" ? WHITE : SLATE, lineHeight: 1 }}>{u}</div>
                  <div style={{ color: SLATE_LT, fontSize: "0.82rem", marginTop: 4, marginBottom: 14 }}>units verified</div>

                  <div style={{ height: 6, background: theme === "dark" ? "#334155" : BORDER, borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: statusColor, borderRadius: 3 }} />
                  </div>
                  <span style={{ color: statusColor, fontWeight: 800, fontSize: "0.78rem", background: `${statusColor}18`, padding: "4px 12px", borderRadius: 20 }}>
                    {status}
                  </span>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* ════════════════════════════════════════════════
          24/7 EMERGENCY BLOOD REQUEST BANNER
      ════════════════════════════════════════════════ */}
      <section style={{
        background: `linear-gradient(135deg, ${RED_DARK} 0%, ${RED} 100%)`,
        padding: "90px 24px", position: "relative", overflow: "hidden"
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 2 }}>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)",
            borderRadius: 40, padding: "8px 22px", marginBottom: 28, border: "1px solid rgba(255,255,255,0.25)"
          }}>
            <span style={{ fontSize: "1.2rem", animation: "pulseDot 1.5s infinite" }}>🚨</span>
            <span style={{ color: WHITE, fontWeight: 800, fontSize: "0.92rem", letterSpacing: "0.02em" }}>
              24/7 CRITICAL EMERGENCY DISPATCH — Response Guaranteed within 30 Mins
            </span>
          </div>

          <SectionTitle light style={{ textAlign: "left" }}>Emergency Blood Request</SectionTitle>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.05rem", marginBottom: 36, maxWidth: 640 }}>
            Submit an urgent hospital requisition. Our automated dispatch algorithm immediately alerts nearby verified donors and hospital blood banks.
          </p>

          {emergencySuccess && (
            <div style={{
              background: WHITE, color: "#15803D", borderRadius: 16,
              padding: "20px 24px", marginBottom: 28, fontWeight: 800, fontSize: "1rem",
              display: "flex", alignItems: "center", gap: 12, boxShadow: "0 15px 40px rgba(0,0,0,0.2)"
            }}>
              <FaCircleCheck style={{ fontSize: "1.4rem" }} /> Emergency request dispatched! Our response team is actively matching donors.
            </div>
          )}

          <div style={{
            background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.25)", borderRadius: 28, padding: 40
          }}>
            <form onSubmit={handleEmergencySubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }} className="two-col">
                <Input name="patientName" placeholder="Patient Full Name" required style={{ background: "rgba(255,255,255,0.95)" }} />
                <Input name="contactNumber" placeholder="Emergency Contact Phone" type="tel" required style={{ background: "rgba(255,255,255,0.95)" }} />
                <Select name="bloodGroup" options={["Blood Group Required", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} style={{ background: "rgba(255,255,255,0.95)" }} />
                <Input name="hospitalName" placeholder="Hospital Name & Ward" required style={{ background: "rgba(255,255,255,0.95)" }} />
                <Input name="unitsRequired" placeholder="Units Required (e.g., 2)" type="number" min="1" required style={{ background: "rgba(255,255,255,0.95)" }} />
                <Input name="location" placeholder="City & Area" required style={{ background: "rgba(255,255,255,0.95)" }} />
              </div>
              <textarea
                name="additionalInfo"
                placeholder="Additional details or medical notes (optional)..."
                style={{
                  width: "100%", padding: "16px 20px", borderRadius: 14, border: `2px solid ${BORDER}`,
                  fontFamily: FONT, fontSize: "0.95rem", color: SLATE, outline: "none",
                  background: "rgba(255,255,255,0.95)", resize: "vertical", minHeight: 90, boxSizing: "border-box", marginBottom: 24
                }}
              />
              <button
                type="submit"
                disabled={emergencySubmitting}
                style={{
                  width: "100%", background: WHITE, color: RED_DARK, border: "none",
                  borderRadius: 14, padding: "18px", fontFamily: FONT, fontSize: "1.05rem",
                  fontWeight: 900, cursor: emergencySubmitting ? "not-allowed" : "pointer",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.25)", transition: "all 0.3s ease"
                }}
              >
                {emergencySubmitting ? "Dispatched Alert..." : "🚨 Dispatch Emergency Requisition Now"}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FEATURE SHOWCASE (Squarespace Split Media Block)
      ════════════════════════════════════════════════ */}
      <Section bg={WHITE} theme={theme}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="two-col">

          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: 32, overflow: "hidden", border: `1px solid ${BORDER}`, boxShadow: "0 30px 80px rgba(0,0,0,0.1)" }}>
              <img src="/images/blood_lab.png" alt="High Tech Blood Bank" style={{ width: "100%", height: 480, objectFit: "cover" }} />
            </div>

            <div style={{
              position: "absolute", bottom: -24, right: -20,
              background: theme === "dark" ? "#1E293B" : WHITE,
              borderRadius: 20, padding: "20px 24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)", border: `1px solid ${BORDER}`
            }}>
              <div style={{ fontWeight: 900, fontSize: "1.8rem", color: RED }}>100%</div>
              <div style={{ color: SLATE_LT, fontSize: "0.85rem", fontWeight: 700 }}>Temperature Tracked Vials</div>
            </div>
          </div>

          <div>
            <SectionLabel text="Modern Healthcare Technology" />
            <SectionTitle theme={theme}>Intelligent Logistics for Life-Saving Blood</SectionTitle>
            <p style={{ color: SLATE_LT, fontSize: "1.05rem", lineHeight: 1.7, marginBottom: 32 }}>
              HemoCare unites donors, hospitals, and blood banks under a unified digital network. With real-time stock sync and automated donor match alerts, we minimize critical wait times.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                ["⚡ Instant SMS & WhatsApp Donor Alerts", "When an emergency requisition is logged, eligible donors nearby are notified immediately."],
                ["🔒 End-to-End Cold Chain Integrity", "All blood units are barcoded, tested, and tracked for temperature safety."],
                ["🏥 Seamless Hospital ERP Integration", "Automated inventory updates directly synced with major hospital EHR systems."]
              ].map(([t, desc]) => (
                <div key={t} style={{ display: "flex", gap: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: `${RED}15`, color: RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <FaCircleCheck />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 800, color: theme === "dark" ? WHITE : SLATE, fontSize: "1rem", marginBottom: 4 }}>{t}</h4>
                    <p style={{ color: SLATE_LT, fontSize: "0.88rem", lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          DONOR REGISTRATION (Multi-Step Form)
      ════════════════════════════════════════════════ */}
      <Section bg={SMOKE} id="donate" theme={theme}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="two-col">

          <div>
            <SectionLabel text="Become A Life Saver" />
            <SectionTitle theme={theme}>Register as a Blood Donor</SectionTitle>
            <p style={{ color: SLATE_LT, fontSize: "1.05rem", lineHeight: 1.7, marginBottom: 36 }}>
              Joining takes under 5 minutes. One donation can save up to 3 lives. Pick your convenient schedule and location — we coordinate the rest.
            </p>

            {[
              ["Why donate blood?", "Red blood cells, platelets, and plasma save trauma patients, cancer patients, and surgical care cases."],
              ["Who is eligible?", "Anyone aged 18–65, weighing 50kg+, in general good health can donate every 56 days."],
              ["What is the process?", "Simple health screening → 8-minute donation → Complimentary refreshments → Lifetime Donor Certificate."]
            ].map(([q, a]) => (
              <div key={q} style={{ marginBottom: 24 }}>
                <h4 style={{ fontWeight: 800, color: theme === "dark" ? WHITE : SLATE, fontSize: "1.02rem", marginBottom: 6 }}>{q}</h4>
                <p style={{ color: SLATE_LT, fontSize: "0.9rem", lineHeight: 1.65 }}>{a}</p>
              </div>
            ))}
          </div>

          <Card style={{ padding: 40 }} hover={false} theme={theme}>
            {donorSuccess && (
              <div style={{ background: "#DCFCE7", color: "#15803D", borderRadius: 16, padding: "18px 20px", marginBottom: 24, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
                <FaCircleCheck /> Donor registration complete! Thank you for pledging to save lives.
              </div>
            )}

            <form onSubmit={handleDonorRegistration}>

              {/* Step indicator */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
                {[1, 2, 3].map((s, i) => (
                  <React.Fragment key={s}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: step >= s ? RED : (theme === "dark" ? "#334155" : BORDER),
                      color: step >= s ? WHITE : SLATE_LT,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: "0.9rem", transition: "all 0.3s ease"
                    }}>
                      {s}
                    </div>
                    {i < 2 && <div style={{ flex: 1, height: 3, background: step > s ? RED : (theme === "dark" ? "#334155" : BORDER), transition: "all 0.3s ease" }} />}
                  </React.Fragment>
                ))}
              </div>

              <div style={{ fontWeight: 800, fontSize: "0.85rem", color: RED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
                {step === 1 ? "Step 1: Personal Details" : step === 2 ? "Step 2: Medical Info" : "Step 3: Preferred Schedule"}
              </div>

              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Input placeholder="First Name" required theme={theme} value={donorForm.firstName} onChange={e => updateDonorField("firstName", e.target.value)} />
                    <Input placeholder="Last Name" required theme={theme} value={donorForm.lastName} onChange={e => updateDonorField("lastName", e.target.value)} />
                  </div>
                  <Input placeholder="Email Address" type="email" required theme={theme} value={donorForm.email} onChange={e => updateDonorField("email", e.target.value)} />
                  <Input placeholder="Phone Number" type="tel" required theme={theme} value={donorForm.phone} onChange={e => updateDonorField("phone", e.target.value)} />
                  <Input placeholder="Date of Birth" type="date" required theme={theme} value={donorForm.dob} onChange={e => updateDonorField("dob", e.target.value)} />
                </div>
              )}

              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Select options={["Select Blood Group", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} theme={theme} value={donorForm.bloodGroup} onChange={e => updateDonorField("bloodGroup", e.target.value)} />
                  <Input placeholder="Weight (kg)" type="number" required theme={theme} value={donorForm.weight} onChange={e => updateDonorField("weight", e.target.value)} />
                  <Select options={["Last Donation", "Never donated", "Within 3 months", "Within 6 months", "Over 6 months ago"]} theme={theme} value={donorForm.lastDonation} onChange={e => updateDonorField("lastDonation", e.target.value)} />
                  <Select options={["Any medical conditions?", "None", "Diabetes", "Hypertension", "Other"]} theme={theme} value={donorForm.conditions} onChange={e => updateDonorField("conditions", e.target.value)} />
                </div>
              )}

              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Input placeholder="Preferred Date" type="date" required theme={theme} value={donorForm.preferredDate} onChange={e => updateDonorField("preferredDate", e.target.value)} />
                  <Select options={["Preferred Time", "Morning (9 AM–12 PM)", "Afternoon (12–4 PM)", "Evening (4–7 PM)"]} theme={theme} value={donorForm.preferredTime} onChange={e => updateDonorField("preferredTime", e.target.value)} />
                  <Select options={["Preferred Location", "City Blood Bank", "Apollo Hospital", "Fortis Healthcare", "AIIMS"]} theme={theme} value={donorForm.preferredLocation} onChange={e => updateDonorField("preferredLocation", e.target.value)} />
                  <Input placeholder="City" required theme={theme} value={donorForm.city} onChange={e => updateDonorField("city", e.target.value)} />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 14 }}>
                {step > 1 ? <GhostBtn type="button" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>← Back</GhostBtn> : <div />}
                {step < 3
                  ? <PrimaryBtn
                    type="button"
                    disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                    onClick={() => setStep(s => s + 1)}
                    style={{ flex: 1 }}
                  >
                    Next Step →
                  </PrimaryBtn>
                  : <PrimaryBtn type="submit" disabled={!isStep3Valid} style={{ flex: 1 }}>✓ Complete Registration</PrimaryBtn>
                }
              </div>

            </form>
          </Card>

        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          PARTNER HOSPITALS NETWORK
      ════════════════════════════════════════════════ */}
      <Section bg={WHITE} id="hospitals" theme={theme}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionLabel text="Trusted Healthcare Network" />
          <SectionTitle theme={theme}>Partner Hospitals & Blood Centers</SectionTitle>
          <p style={{ color: SLATE_LT, fontSize: "1.05rem", maxWidth: 520, margin: "0 auto" }}>
            Integrated with 200+ premier government and private medical institutions across India.
          </p>
        </div>

        {/* Media Feature Banner */}
        <div style={{
          borderRadius: 28, overflow: "hidden", position: "relative", marginBottom: 48,
          border: `1px solid ${BORDER}`, height: 320
        }}>
          <img src="/images/hospital_building.png" alt="Hospital Building" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(15,23,42,0.85) 0%, transparent 80%)" }} />
          <div style={{ position: "absolute", top: "50%", left: 40, transform: "translateY(-50%)", maxWidth: 500 }}>
            <span style={{ background: RED, color: WHITE, fontSize: "0.75rem", fontWeight: 800, padding: "4px 12px", borderRadius: 12 }}>NATIONWIDE NETWORK</span>
            <h3 style={{ color: WHITE, fontWeight: 900, fontSize: "1.8rem", marginTop: 12, marginBottom: 12 }}>Connected Hospital Hubs</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Direct live access to AIIMS, Apollo, Fortis, Narayana Health, and Max Healthcare blood centers.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="three-col">
          {[
            ["Apollo Hospitals", "Pan-India (40+ hubs)", "NABH & JCI Accredited", "500+ Beds"],
            ["Fortis Healthcare", "Pan-India (36 facilities)", "JCI Certified", "450+ Beds"],
            ["AIIMS", "New Delhi Campus", "Govt. Premier Institute", "2,500+ Beds"],
            ["Narayana Health", "Bengaluru, Kolkata", "ISO 9001:2015", "350+ Beds"],
            ["Max Healthcare", "Delhi NCR", "NABH Accredited", "480+ Beds"],
            ["Kokilaben Hospital", "Mumbai", "JCI Certified", "750+ Beds"]
          ].map(([name, loc, cert, beds]) => (
            <Card key={name} style={{ padding: 28 }} theme={theme}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${RED}12`, color: RED, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                  <FaHospital />
                </div>
                <div>
                  <h4 style={{ fontWeight: 800, color: theme === "dark" ? WHITE : SLATE, fontSize: "1.05rem" }}>{name}</h4>
                  <div style={{ color: SLATE_LT, fontSize: "0.82rem" }}>{loc}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ background: `${RED}12`, color: RED, fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: 12 }}>{cert}</span>
                <span style={{ background: theme === "dark" ? "#334155" : SMOKE, color: theme === "dark" ? WHITE : SLATE_MD, fontSize: "0.75rem", fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>{beds}</span>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          CAMPAIGNS & DRIVES (Card Showcase)
      ════════════════════════════════════════════════ */}
      <Section bg={SMOKE} theme={theme}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
          <div>
            <SectionLabel text="Upcoming Initiatives" />
            <SectionTitle theme={theme}>Blood Donation Campaigns</SectionTitle>
          </div>
          <GhostBtn onClick={handleProtectedAction}>View All Events →</GhostBtn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="three-col">
          {[
            ["World Blood Donor Day Drive", "July 15, 2026", "AIIMS Campus, New Delhi", "Target: 500 units"],
            ["Corporate Wellness Donation Drive", "July 22, 2026", "Infosys Park, Bengaluru", "Target: 250 units"],
            ["University Youth Donation Camp", "August 3, 2026", "IIT Bombay Auditorium", "Target: 300 units"]
          ].map(([title, date, loc, target]) => (
            <Card key={title} style={{ padding: 0, overflow: "hidden" }} theme={theme}>
              <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                <img src="/images/campaign_drive.png" alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)" }} />
                <span style={{ position: "absolute", top: 16, right: 16, background: RED, color: WHITE, fontWeight: 800, fontSize: "0.75rem", padding: "4px 12px", borderRadius: 20 }}>
                  Open Drive
                </span>
                <div style={{ position: "absolute", bottom: 16, left: 20, color: WHITE, fontWeight: 800, fontSize: "0.85rem" }}>
                  📅 {date}
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <h4 style={{ fontWeight: 800, color: theme === "dark" ? WHITE : SLATE, fontSize: "1.08rem", marginBottom: 8 }}>{title}</h4>
                <p style={{ color: SLATE_LT, fontSize: "0.88rem", marginBottom: 14 }}>📍 {loc}</p>
                <div style={{ color: RED, fontWeight: 800, fontSize: "0.85rem", marginBottom: 18 }}>🎯 {target}</div>
                <PrimaryBtn onClick={handleProtectedAction} style={{ width: "100%", padding: "12px", borderRadius: 12, fontSize: "0.9rem" }}>
                  Register Free Slot
                </PrimaryBtn>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════ */}
      <Section bg={WHITE} theme={theme}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionLabel text="Community Impact" />
          <SectionTitle theme={theme}>Stories of Lives Saved</SectionTitle>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="three-col">
          {[
            ["Priya Sharma", "Emergency Recipient", "My daughter required critical transfusions during surgery. HemoCare matched a compatible donor in under 20 minutes. Forever grateful!", "⭐⭐⭐⭐⭐"],
            ["Dr. Arjun Mehta", "Chief Cardiologist, Apollo", "The live inventory synchronization has dramatically improved our emergency room response times for rare blood types.", "⭐⭐⭐⭐⭐"],
            ["Sunita Patil", "Regular Donor (14x Donated)", "The donor scheduling process is seamless. I get instant updates when my donated blood has been utilized for a patient.", "⭐⭐⭐⭐⭐"]
          ].map(([name, role, quote, stars]) => (
            <Card key={name} style={{ padding: 32 }} theme={theme}>
              <div style={{ color: RED, fontSize: "1.8rem", marginBottom: 12 }}>“</div>
              <p style={{ color: theme === "dark" ? WHITE : SLATE_MD, fontSize: "0.95rem", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                "{quote}"
              </p>
              <div style={{ fontSize: "0.85rem", marginBottom: 16 }}>{stars}</div>
              <div style={{ borderTop: `1px solid ${theme === "dark" ? "#334155" : BORDER}`, paddingTop: 16 }}>
                <div style={{ fontWeight: 800, color: theme === "dark" ? WHITE : SLATE, fontSize: "0.95rem" }}>{name}</div>
                <div style={{ color: SLATE_LT, fontSize: "0.8rem" }}>{role}</div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          FOOTER (Squarespace Style Multi-Column)
      ════════════════════════════════════════════════ */}
      <footer style={{ background: "#0F172A", color: "rgba(255,255,255,0.6)", padding: "80px 24px 36px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 54 }} className="four-col">

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontSize: "1.2rem" }}>
                  <FaDroplet />
                </div>
                <span style={{ fontWeight: 900, fontSize: "1.3rem", color: WHITE }}>Hemo<span style={{ color: RED }}>Care</span></span>
              </div>
              <p style={{ fontSize: "0.92rem", lineHeight: 1.7, maxWidth: 320, marginBottom: 24 }}>
                India's premier blood bank management and donor logistics platform. Connecting hospitals, donors, and patients in real time.
              </p>
            </div>

            {[
              ["Quick Navigation", ["Home", "Blood Search", "Donate Blood", "Partner Hospitals", "Campaigns"]],
              ["Portals", ["Donor Dashboard", "Patient Dashboard", "Hospital Staff Portal", "Blood Bank Admin", "Emergency Requisition"]],
              ["Support & Legal", ["24/7 Helpline", "Privacy Policy", "Terms of Service", "Quality Standards", "Contact Us"]]
            ].map(([title, links]) => (
              <div key={title}>
                <h4 style={{ color: WHITE, fontWeight: 800, fontSize: "0.98rem", marginBottom: 18 }}>{title}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {links.map(l => (
                    <span key={l} style={{ fontSize: "0.88rem", cursor: "pointer", transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = WHITE}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}

          </div>

          <div style={{
            background: "rgba(225,29,72,0.15)", border: "1px solid rgba(225,29,72,0.3)",
            borderRadius: 16, padding: "18px 28px", marginBottom: 40,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "1.4rem" }}>🚨</span>
              <span style={{ color: WHITE, fontWeight: 800, fontSize: "0.98rem" }}>24/7 Emergency Blood Helpline</span>
            </div>
            <a href="tel:18002566631" style={{ color: "#FDA4AF", fontWeight: 900, fontSize: "1.1rem", textDecoration: "none" }}>
              📞 Toll-Free: 1800-BLOOD-1 (25663-1)
            </a>
          </div>

          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 28,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, fontSize: "0.85rem"
          }}>
            <span>© 2026 HemoCare Blood Management System. All rights reserved.</span>
            <span>Built with ❤️ for saving lives across India.</span>
          </div>

        </div>
      </footer>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: theme === "dark" ? "#1E293B" : WHITE, borderRadius: 24, width: "100%", maxWidth: 420, padding: 36, boxShadow: "0 25px 60px rgba(0,0,0,0.4)", margin: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 50, height: 50, borderRadius: 16, background: `${RED}18`, display: "flex", alignItems: "center", justifyContent: "center", color: RED, fontSize: "1.4rem" }}>
                🔒
              </div>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: theme === "dark" ? WHITE : SLATE }}>Login Required</h3>
                <p style={{ fontSize: "0.88rem", color: SLATE_LT }}>Authentication needed</p>
              </div>
            </div>
            <p style={{ fontSize: "0.95rem", color: theme === "dark" ? WHITE : SLATE_MD, lineHeight: 1.6, marginBottom: 28 }}>
              {loginModalMessage || "Please log in to your HemoCare account to proceed."}
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <GhostBtn onClick={() => setShowLoginModal(false)} style={{ flex: 1, padding: "14px" }}>Cancel</GhostBtn>
              <PrimaryBtn onClick={() => { setShowLoginModal(false); navigate("/login"); }} style={{ flex: 1, padding: "14px" }}>Log In</PrimaryBtn>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}