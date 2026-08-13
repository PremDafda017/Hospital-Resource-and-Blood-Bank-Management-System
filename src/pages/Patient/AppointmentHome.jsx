import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarDays,
  FaMagnifyingGlass,
  FaFilter,
  FaHospital,
  FaUserDoctor,
  FaBars,
  FaRightFromBracket,
  FaChartLine,
  FaHeartPulse,
  FaFileMedical,
  FaMapLocationDot,
  FaBell,
  FaUser,
  FaDroplet,
  FaHouse,
  FaStethoscope,
  FaBone,
  FaBrain,
  FaBaby,
  FaEye,
  FaEarListen,
  FaChild,
  FaMicroscope,
  FaLocationCrosshairs,
  FaBuildingColumns,
  FaBuilding,
  FaStar,
  FaClock,
  FaPhone,
  FaRegClock,
  FaSpinner,
  FaCircleXmark,
  FaChevronDown,
  FaHeart,
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

const SPECIALITIES = [
  { id: 1, name: "Cardiology", icon: <FaHeartPulse />, description: "Heart Specialist", doctors: 120, color: "#FEE2E2", iconColor: "#DC2626" },
  { id: 2, name: "Orthopedic", icon: <FaBone />, description: "Bone Specialist", doctors: 85, color: "#FEF3C7", iconColor: "#D97706" },
  { id: 3, name: "Pediatric", icon: <FaBaby />, description: "Child Specialist", doctors: 40, color: "#DCFCE7", iconColor: "#16A34A" },
  { id: 4, name: "Neurology", icon: <FaBrain />, description: "Brain Specialist", doctors: 30, color: "#DBEAFE", iconColor: "#2563EB" },
  { id: 5, name: "General Physician", icon: <FaStethoscope />, description: "General Health", doctors: 150, color: "#F3E8FF", iconColor: "#9333EA" },
  { id: 6, name: "Dermatology", icon: <FaUser />, description: "Skin Specialist", doctors: 45, color: "#FEE2E2", iconColor: "#DC2626" },
  { id: 7, name: "ENT", icon: <FaEarListen />, description: "Ear Nose Throat", doctors: 35, color: "#FEF3C7", iconColor: "#D97706" },
  { id: 8, name: "Dentist", icon: <FaUser />, description: "Dental Care", doctors: 60, color: "#DCFCE7", iconColor: "#16A34A" },
  { id: 9, name: "Gynecology", icon: <FaUser />, description: "Women's Health", doctors: 50, color: "#DBEAFE", iconColor: "#2563EB" },
  { id: 10, name: "Psychiatry", icon: <FaBrain />, description: "Mental Health", doctors: 25, color: "#F3E8FF", iconColor: "#9333EA" },
  { id: 11, name: "Ophthalmology", icon: <FaEye />, description: "Eye Specialist", doctors: 40, color: "#FEE2E2", iconColor: "#DC2626" },
  { id: 12, name: "Urology", icon: <FaMicroscope />, description: "Urinary System", doctors: 30, color: "#FEF3C7", iconColor: "#D97706" },
];

function AppointmentHome() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterHospital, setFilterHospital] = useState("All");
  const [filterSpeciality, setFilterSpeciality] = useState("All");
  const [filterAvailability, setFilterAvailability] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [filterHospitalType, setFilterHospitalType] = useState("All");
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteHospitals');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHospitalForDetails, setSelectedHospitalForDetails] = useState(null);
  const searchTimeoutRef = useRef(null);

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

  const active = "appointments";

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
    "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  // Calculate distance between two coordinates using Haversine formula
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

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteHospitals', JSON.stringify(favorites));
  }, [favorites]);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    setGettingLocation(true);
    setLocationError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGettingLocation(false);
        },
        (error) => {
          setLocationError("Unable to retrieve your location. Please enable location services.");
          setGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setGettingLocation(false);
    }
  }, []);

  // Toggle favorite hospital
  const toggleFavorite = useCallback((hospitalId) => {
    setFavorites(prev => 
      prev.includes(hospitalId) 
        ? prev.filter(id => id !== hospitalId)
        : [...prev, hospitalId]
    );
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilterState("All");
    setFilterHospitalType("All");
    setFilterHospital("All");
    setFilterSpeciality("All");
    setFilterAvailability("All");
    setSearchQuery("");
  }, []);

  useEffect(() => {
    // Load hospitals and doctors
    const loadData = async () => {
      try {
        // Use local hospital data with coordinates
        setHospitals(bloodBankDatabase);

        // Load doctors
        const doctorResponse = await fetch('http://localhost:5000/api/doctors');
        if (doctorResponse.ok) {
          const doctorData = await doctorResponse.json();
          setDoctors(doctorData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSpecialityClick = (speciality) => {
    setSelectedSpeciality(speciality);
    setFilterSpeciality(speciality.name);
    navigate('/book-appointment', { state: { speciality: speciality.name } });
  };

  const handleHospitalClick = (hospital) => {
    setSelectedHospital(hospital);
    navigate('/book-appointment', { state: { hospital: hospital.name, hospitalId: hospital._id } });
  };

  const handleDoctorClick = (doctor) => {
    navigate('/book-appointment', { state: { doctor: doctor.name, doctorId: doctor._id, hospital: doctor.hospital } });
  };

  // Memoized filtered hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter(hospital => {
      const matchesSearch = hospital.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           hospital.hospital?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesSpeciality = filterSpeciality === "All" || true;
      const matchesState = filterState === "All" || hospital.state === filterState;
      const matchesType = filterHospitalType === "All" || hospital.type === filterHospitalType.toLowerCase();
      return matchesSearch && matchesSpeciality && matchesState && matchesType;
    }).map(hospital => {
      // Add distance if user location is available
      if (userLocation && hospital.lat && hospital.lng) {
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          hospital.lat, hospital.lng
        );
        return { ...hospital, distance };
      }
      return { ...hospital, distance: null };
    }).sort((a, b) => {
      // Sort by distance if available, then by favorites
      if (a.distance !== null && b.distance !== null) {
        const aFav = favorites.includes(a.id);
        const bFav = favorites.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.distance - b.distance;
      }
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return 0;
    });
  }, [hospitals, debouncedSearchQuery, filterState, filterHospitalType, filterSpeciality, userLocation, favorites]);

  // Memoized filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           doctor.specialization?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesHospital = filterHospital === "All" || doctor.hospital === filterHospital;
      const matchesSpeciality = filterSpeciality === "All" || doctor.specialization === filterSpeciality;
      return matchesSearch && matchesHospital && matchesSpeciality;
    });
  }, [doctors, debouncedSearchQuery, filterHospital, filterSpeciality]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(350px, 1fr))", gap:20 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{
          background:WHITE,
          padding:"24px",
          borderRadius:12,
          border:`1px solid ${BORDER}`,
          animation:"pulse 1.5s ease-in-out infinite"
        }}>
          <div style={{ display:"flex", gap:16, marginBottom:16 }}>
            <div style={{
              width:64, height:64, borderRadius:12,
              background:SMOKE, animation:"pulse 1.5s ease-in-out infinite"
            }} />
            <div style={{ flex:1 }}>
              <div style={{ height:20, width:"70%", background:SMOKE, borderRadius:4, marginBottom:8 }} />
              <div style={{ height:16, width:"50%", background:SMOKE, borderRadius:4, marginBottom:8 }} />
              <div style={{ height:14, width:"60%", background:SMOKE, borderRadius:4 }} />
            </div>
          </div>
          <div style={{ height:40, width:"100%", background:SMOKE, borderRadius:8 }} />
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = ({ message, icon }) => (
    <div style={{
      textAlign:"center",
      padding:"60px 20px",
      background:WHITE,
      borderRadius:12,
      border:`1px solid ${BORDER}`
    }}>
      <div style={{ fontSize:"4rem", color:SLATE_L, marginBottom:16 }}>
        {icon}
      </div>
      <h3 style={{ fontSize:"1.2rem", fontWeight:600, color:NAVY2, marginBottom:8 }}>
        {message}
      </h3>
      <p style={{ color:SLATE_L, marginBottom:20 }}>
        Try adjusting your filters or search terms
      </p>
      <button
        onClick={resetFilters}
        style={{
          background:RED,
          color:WHITE,
          border:"none",
          padding:"12px 24px",
          borderRadius:8,
          fontSize:"0.95rem",
          fontWeight:600,
          cursor:"pointer"
        }}
      >
        Reset Filters
      </button>
    </div>
  );

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
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontSize:"1.8rem", fontWeight:800, color:NAVY2, margin:"0 0 8px 0" }}>
              Book Appointment
            </h1>
            <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
              Find and book appointments with specialists
            </p>
          </div>

          {/* Search and Filters */}
          <div style={{
            background:WHITE,
            padding:"24px",
            borderRadius:12,
            marginBottom:32,
            border:`1px solid ${BORDER}`
          }}>
            {/* Location Detection */}
            <div style={{ marginBottom:20, padding:"16px", background:SMOKE, borderRadius:8, border:`1px solid ${BORDER}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <FaLocationCrosshairs style={{ fontSize:"1.5rem", color:RED }} />
                  <div>
                    <div style={{ fontWeight:600, color:NAVY2, fontSize:"1rem" }}>Find Hospitals Near You</div>
                    <div style={{ fontSize:"0.85rem", color:SLATE_L }}>
                      {userLocation ? `Location detected: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : "Enable location to see nearby hospitals"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  style={{
                    background:RED,
                    color:WHITE,
                    border:"none",
                    padding:"10px 20px",
                    borderRadius:8,
                    fontSize:"0.9rem",
                    fontWeight:600,
                    cursor:gettingLocation ? "not-allowed" : "pointer",
                    opacity:gettingLocation ? 0.6 : 1,
                    display:"flex",
                    alignItems:"center",
                    gap:8
                  }}
                >
                  <FaLocationCrosshairs />
                  {gettingLocation ? "Detecting..." : userLocation ? "Update Location" : "Detect My Location"}
                </button>
              </div>
              {locationError && (
                <div style={{ marginTop:12, padding:"10px", background:"#FEE2E2", color:"#DC2626", borderRadius:6, fontSize:"0.85rem" }}>
                  {locationError}
                </div>
              )}
            </div>

            <div style={{ display:"flex", gap:16, marginBottom:16, flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ position:"relative" }}>
                  <FaMagnifyingGlass style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:SLATE_L }} />
                  <input
                    type="text"
                    placeholder="Search by hospital, doctor, or speciality..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width:"100%",
                      padding:"12px 12px 12px 40px",
                      border:`1px solid ${BORDER}`,
                      borderRadius:8,
                      fontSize:"0.95rem",
                      outline:"none"
                    }}
                  />
                </div>
              </div>
              <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                <FaFilter style={{ color:SLATE_L }} />
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  style={{
                    padding:"12px 16px",
                    border:`1px solid ${BORDER}`,
                    borderRadius:8,
                    fontSize:"0.95rem",
                    outline:"none",
                    cursor:"pointer"
                  }}
                >
                  <option value="All">All States</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <select
                  value={filterHospitalType}
                  onChange={(e) => setFilterHospitalType(e.target.value)}
                  style={{
                    padding:"12px 16px",
                    border:`1px solid ${BORDER}`,
                    borderRadius:8,
                    fontSize:"0.95rem",
                    outline:"none",
                    cursor:"pointer"
                  }}
                >
                  <option value="All">All Types</option>
                  <option value="government">Government</option>
                  <option value="private">Private</option>
                </select>
                <select
                  value={filterHospital}
                  onChange={(e) => setFilterHospital(e.target.value)}
                  style={{
                    padding:"12px 16px",
                    border:`1px solid ${BORDER}`,
                    borderRadius:8,
                    fontSize:"0.95rem",
                    outline:"none",
                    cursor:"pointer"
                  }}
                >
                  <option value="All">All Hospitals</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.id} value={hospital.name}>{hospital.name}</option>
                  ))}
                </select>
                <select
                  value={filterSpeciality}
                  onChange={(e) => setFilterSpeciality(e.target.value)}
                  style={{
                    padding:"12px 16px",
                    border:`1px solid ${BORDER}`,
                    borderRadius:8,
                    fontSize:"0.95rem",
                    outline:"none",
                    cursor:"pointer"
                  }}
                >
                  <option value="All">All Specialities</option>
                  {SPECIALITIES.map(speciality => (
                    <option key={speciality.id} value={speciality.name}>{speciality.name}</option>
                  ))}
                </select>
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  style={{
                    padding:"12px 16px",
                    border:`1px solid ${BORDER}`,
                    borderRadius:8,
                    fontSize:"0.95rem",
                    outline:"none",
                    cursor:"pointer"
                  }}
                >
                  <option value="All">All Times</option>
                  <option value="today">Available Today</option>
                  <option value="tomorrow">Available Tomorrow</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Specialities Section */}
          {!loading && (
            <div style={{ marginBottom:32 }}>
              <h2 style={{ fontSize:"1.4rem", fontWeight:700, color:NAVY2, margin:"0 0 20px 0" }}>
                Browse by Speciality
              </h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:20 }}>
                {SPECIALITIES.map((speciality) => (
                  <div
                    key={speciality.id}
                    onClick={() => handleSpecialityClick(speciality)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleSpecialityClick(speciality)}
                    style={{
                      background:WHITE,
                      padding:"24px",
                      borderRadius:12,
                      border:`1px solid ${BORDER}`,
                      cursor:"pointer",
                      transition:"all 0.2s",
                      display:"flex",
                      flexDirection:"column",
                      gap:12
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{
                      width:56,
                      height:56,
                      borderRadius:12,
                      background:speciality.color,
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center"
                    }}>
                      <span style={{ fontSize:24, color:speciality.iconColor }}>{speciality.icon}</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:"0 0 4px 0" }}>
                        {speciality.name}
                      </h3>
                      <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 8px 0" }}>
                        {speciality.description}
                      </p>
                      <p style={{ fontSize:"0.85rem", color:SLATE, margin:0 }}>
                        {speciality.doctors} Doctors Available
                      </p>
                    </div>
                    <button
                      style={{
                        background:RED,
                        color:WHITE,
                        border:"none",
                        padding:"10px 16px",
                        borderRadius:8,
                        fontSize:"0.9rem",
                        fontWeight:600,
                        cursor:"pointer",
                        marginTop:"auto"
                      }}
                    >
                      Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hospitals Section */}
          {loading ? (
            <div style={{ marginBottom:32 }}>
              <h2 style={{ fontSize:"1.4rem", fontWeight:700, color:NAVY2, margin:"0 0 20px 0" }}>
                Available Hospitals
              </h2>
              <LoadingSkeleton />
            </div>
          ) : filteredHospitals.length > 0 ? (
            <div style={{ marginBottom:32 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <h2 style={{ fontSize:"1.4rem", fontWeight:700, color:NAVY2, margin:0 }}>
                  {userLocation ? "Nearby Hospitals" : "Available Hospitals"}
                  {userLocation && <span style={{ fontSize:"0.9rem", fontWeight:400, color:SLATE_L, marginLeft:8 }}>(Sorted by distance)</span>}
                </h2>
                <span style={{ fontSize:"0.9rem", color:SLATE_L }}>
                  {filteredHospitals.length} hospitals found
                </span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(350px, 1fr))", gap:20 }}>
                {filteredHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    style={{
                      background:WHITE,
                      padding:"24px",
                      borderRadius:12,
                      border:favorites.includes(hospital.id) ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                      cursor:"pointer",
                      transition:"all 0.2s",
                      position:"relative"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(hospital.id);
                      }}
                      style={{
                        position:"absolute",
                        top:16,
                        right:16,
                        background:"none",
                        border:"none",
                        cursor:"pointer",
                        fontSize:"1.2rem",
                        color:favorites.includes(hospital.id) ? RED : SLATE_L,
                        transition:"color 0.2s"
                      }}
                      aria-label={favorites.includes(hospital.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <FaHeart />
                    </button>
                    <div style={{ display:"flex", gap:16, marginBottom:16 }}>
                      <div style={{
                        width:64,
                        height:64,
                        borderRadius:12,
                        background:SMOKE,
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center"
                      }}>
                        {hospital.type === "government" ? (
                          <FaBuildingColumns style={{ fontSize:32, color:NAVY2 }} />
                        ) : (
                          <FaBuilding style={{ fontSize:32, color:RED }} />
                        )}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                          <h3 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>
                            {hospital.name || hospital.hospital}
                          </h3>
                          <span style={{
                            padding:"4px 8px",
                            borderRadius:4,
                            fontSize:"0.75rem",
                            fontWeight:600,
                            textTransform:"uppercase",
                            background:hospital.type === "government" ? "#DBEAFE" : "#FEE2E2",
                            color:hospital.type === "government" ? "#1E40AF" : "#DC2626"
                          }}>
                            {hospital.type === "government" ? "Government" : "Private"}
                          </span>
                        </div>
                        <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px 0" }}>
                          {hospital.city}, {hospital.state}
                        </p>
                        <p style={{ fontSize:"0.85rem", color:SLATE, margin:0 }}>
                          {hospital.address}
                        </p>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:16, marginBottom:16, fontSize:"0.9rem", color:SLATE, flexWrap:"wrap" }}>
                      <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <FaStar style={{ color:"#F59E0B" }} />
                        4.5 Rating
                      </span>
                      <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <FaUserDoctor />
                        {doctors.filter(d => d.hospital === hospital.name).length} Doctors
                      </span>
                      <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <FaClock />
                        24/7 Emergency
                      </span>
                      {hospital.distance !== null && (
                        <span style={{ display:"flex", alignItems:"center", gap:4, color:RED, fontWeight:600 }}>
                          <FaLocationCrosshairs />
                          {hospital.distance < 1 ? `${(hospital.distance * 1000).toFixed(0)}m` : `${hospital.distance.toFixed(1)}km`} away
                        </span>
                      )}
                    </div>
                    <div style={{ display:"flex", gap:12 }}>
                      <button
                        onClick={() => handleHospitalClick(hospital)}
                        style={{
                          flex:1,
                          background:RED,
                          color:WHITE,
                          border:"none",
                          padding:"10px 16px",
                          borderRadius:8,
                          fontSize:"0.9rem",
                          fontWeight:600,
                          cursor:"pointer"
                        }}
                      >
                        Book Appointment
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHospitalForDetails(hospital);
                        }}
                        style={{
                          flex:1,
                          background:WHITE,
                          color:NAVY2,
                          border:`1px solid ${BORDER}`,
                          padding:"10px 16px",
                          borderRadius:8,
                          fontSize:"0.9rem",
                          fontWeight:600,
                          cursor:"pointer"
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom:32 }}>
              <EmptyState 
                message="No hospitals found matching your criteria" 
                icon={<FaCircleXmark />}
              />
            </div>
          )}

          {/* Doctors Section */}
          {!loading && filteredDoctors.length > 0 && (
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <h2 style={{ fontSize:"1.4rem", fontWeight:700, color:NAVY2, margin:0 }}>
                  Available Doctors
                </h2>
                <span style={{ fontSize:"0.9rem", color:SLATE_L }}>
                  {filteredDoctors.length} doctors found
                </span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(350px, 1fr))", gap:20 }}>
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    onClick={() => handleDoctorClick(doctor)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleDoctorClick(doctor)}
                    style={{
                      background:WHITE,
                      padding:"24px",
                      borderRadius:12,
                      border:`1px solid ${BORDER}`,
                      cursor:"pointer",
                      transition:"all 0.2s"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ display:"flex", gap:16, marginBottom:16 }}>
                      <div style={{
                        width:64,
                        height:64,
                        borderRadius:12,
                        background:SMOKE,
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center"
                      }}>
                        <FaUserDoctor style={{ fontSize:32, color:NAVY2 }} />
                      </div>
                      <div style={{ flex:1 }}>
                        <h3 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:"0 0 4px 0" }}>
                          {doctor.name}
                        </h3>
                        <p style={{ fontSize:"0.9rem", color:SLATE_L, margin:"0 0 4px 0" }}>
                          {doctor.specialization}
                        </p>
                        <p style={{ fontSize:"0.85rem", color:SLATE, margin:0 }}>
                          {doctor.hospital}
                        </p>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:16, marginBottom:16, fontSize:"0.9rem", color:SLATE, flexWrap:"wrap" }}>
                      <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <FaStar style={{ color:"#F59E0B" }} />
                        4.8 Rating
                      </span>
                      <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                        💰 ₹{doctor.consultationFee || 500}
                      </span>
                    </div>
                    <div style={{ display:"flex", gap:8, marginBottom:16, fontSize:"0.85rem", color:SLATE }}>
                      <span style={{ background:SMOKE, padding:"4px 8px", borderRadius:4, display:"flex", alignItems:"center", gap:4 }}>
                        <FaRegClock />
                        Mon-Fri
                      </span>
                      <span style={{ background:SMOKE, padding:"4px 8px", borderRadius:4 }}>9AM-5PM</span>
                    </div>
                    <button
                      style={{
                        width:"100%",
                        background:RED,
                        color:WHITE,
                        border:"none",
                        padding:"10px 16px",
                        borderRadius:8,
                        fontSize:"0.9rem",
                        fontWeight:600,
                        cursor:"pointer"
                      }}
                    >
                      Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hospital Details Modal */}
          {selectedHospitalForDetails && (
            <div style={{
              position:"fixed",
              top:0,
              left:0,
              right:0,
              bottom:0,
              background:"rgba(0,0,0,0.5)",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              zIndex:2000,
              padding:20
            }}
            onClick={() => setSelectedHospitalForDetails(null)}
            >
              <div
                style={{
                  background:WHITE,
                  borderRadius:16,
                  maxWidth:600,
                  width:"100%",
                  maxHeight:"90vh",
                  overflowY:"auto",
                  padding:32
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
                  <div>
                    <h2 style={{ fontSize:"1.5rem", fontWeight:700, color:NAVY2, margin:"0 0 8px 0" }}>
                      {selectedHospitalForDetails.name || selectedHospitalForDetails.hospital}
                    </h2>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{
                        padding:"4px 8px",
                        borderRadius:4,
                        fontSize:"0.75rem",
                        fontWeight:600,
                        textTransform:"uppercase",
                        background:selectedHospitalForDetails.type === "government" ? "#DBEAFE" : "#FEE2E2",
                        color:selectedHospitalForDetails.type === "government" ? "#1E40AF" : "#DC2626"
                      }}>
                        {selectedHospitalForDetails.type === "government" ? "Government" : "Private"}
                      </span>
                      <span style={{ display:"flex", alignItems:"center", gap:4, color:SLATE }}>
                        <FaStar style={{ color:"#F59E0B" }} />
                        4.5 Rating
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedHospitalForDetails(null)}
                    style={{
                      background:"none",
                      border:"none",
                      fontSize:"1.5rem",
                      cursor:"pointer",
                      color:SLATE_L
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ marginBottom:24 }}>
                  <h3 style={{ fontSize:"1rem", fontWeight:600, color:NAVY2, marginBottom:12 }}>Contact Information</h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:8, color:SLATE }}>
                    <p style={{ margin:0, display:"flex", alignItems:"center", gap:8 }}>
                      <FaMapLocationDot style={{ color:RED }} />
                      {selectedHospitalForDetails.address}, {selectedHospitalForDetails.city}, {selectedHospitalForDetails.state}
                    </p>
                    <p style={{ margin:0, display:"flex", alignItems:"center", gap:8 }}>
                      <FaPhone style={{ color:RED }} />
                      {selectedHospitalForDetails.phone || "Contact hospital for phone number"}
                    </p>
                  </div>
                </div>

                {selectedHospitalForDetails.distance !== null && (
                  <div style={{ marginBottom:24 }}>
                    <h3 style={{ fontSize:"1rem", fontWeight:600, color:NAVY2, marginBottom:12 }}>Distance</h3>
                    <p style={{ margin:0, color:SLATE }}>
                      {selectedHospitalForDetails.distance < 1 
                        ? `${(selectedHospitalForDetails.distance * 1000).toFixed(0)} meters away`
                        : `${selectedHospitalForDetails.distance.toFixed(1)} km away`
                      }
                    </p>
                  </div>
                )}

                <div style={{ marginBottom:24 }}>
                  <h3 style={{ fontSize:"1rem", fontWeight:600, color:NAVY2, marginBottom:12 }}>Available Services</h3>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    <span style={{ background:SMOKE, padding:"6px 12px", borderRadius:6, fontSize:"0.85rem" }}>24/7 Emergency</span>
                    <span style={{ background:SMOKE, padding:"6px 12px", borderRadius:6, fontSize:"0.85rem" }}>Blood Bank</span>
                    <span style={{ background:SMOKE, padding:"6px 12px", borderRadius:6, fontSize:"0.85rem" }}>Pathology Lab</span>
                    <span style={{ background:SMOKE, padding:"6px 12px", borderRadius:6, fontSize:"0.85rem" }}>Radiology</span>
                    <span style={{ background:SMOKE, padding:"6px 12px", borderRadius:6, fontSize:"0.85rem" }}>Pharmacy</span>
                  </div>
                </div>

                <div style={{ display:"flex", gap:12 }}>
                  <button
                    onClick={() => {
                      handleHospitalClick(selectedHospitalForDetails);
                      setSelectedHospitalForDetails(null);
                    }}
                    style={{
                      flex:1,
                      background:RED,
                      color:WHITE,
                      border:"none",
                      padding:"12px 24px",
                      borderRadius:8,
                      fontSize:"1rem",
                      fontWeight:600,
                      cursor:"pointer"
                    }}
                  >
                    Book Appointment
                  </button>
                  <button
                    onClick={() => {
                      toggleFavorite(selectedHospitalForDetails.id);
                    }}
                    style={{
                      background:WHITE,
                      color:favorites.includes(selectedHospitalForDetails.id) ? RED : NAVY2,
                      border:`1px solid ${BORDER}`,
                      padding:"12px 24px",
                      borderRadius:8,
                      fontSize:"1rem",
                      fontWeight:600,
                      cursor:"pointer",
                      display:"flex",
                      alignItems:"center",
                      gap:8
                    }}
                  >
                    <FaHeart />
                    {favorites.includes(selectedHospitalForDetails.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Add CSS animation for loading skeleton
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
if (!document.head.querySelector('style[data-skeleton-animation]')) {
  style.setAttribute('data-skeleton-animation', 'true');
  document.head.appendChild(style);
}

export default AppointmentHome;
