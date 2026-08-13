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
  FaPen,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaStar,
  FaDownload,
  FaUserDoctor,
  FaClock,
  FaHospital,
  FaBuilding,
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

function HospitalDoctors() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("All");
  const [filterAvailability, setFilterAvailability] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDoctorDetailModal, setShowDoctorDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'table'
  const [isSaving, setIsSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    hospital: "",
    department: "",
    phone: "",
    email: "",
    availability: "Available",
    consultationFee: "",
    patientsTreated: "",
    rating: "",
    photo: "",
    availabilitySchedule: {
      monday: { available: true, startTime: "09:00", endTime: "17:00" },
      tuesday: { available: true, startTime: "09:00", endTime: "17:00" },
      wednesday: { available: true, startTime: "09:00", endTime: "17:00" },
      thursday: { available: true, startTime: "09:00", endTime: "17:00" },
      friday: { available: true, startTime: "09:00", endTime: "17:00" },
      saturday: { available: false, startTime: "", endTime: "" },
      sunday: { available: false, startTime: "", endTime: "" }
    }
  });

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

  const active = "hospital-doctors";

  const handleLogout = () => {
    // Clerk will handle the sign out via SignOutButton
  };

  const w = sidebarCollapsed ? 68 : SIDEBAR_W;

  useEffect(() => {
    // Load doctors from localStorage or API
    const loadDoctors = async () => {
      try {
        const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/doctors`);
        if (response.ok) {
          const data = await response.json();
          console.log('API returned doctors:', data);
          if (data && data.length > 0) {
            setDoctors(data);
          } else {
            // API returned empty, use sample data
            console.log('API returned empty, using sample data');
            setDoctors(getIndianDoctors());
          }
        } else {
          // Fallback to localStorage or sample data
          console.log('API request failed, checking localStorage');
          const savedDoctors = JSON.parse(localStorage.getItem('doctors') || '[]');
          if (savedDoctors.length === 0) {
            console.log('localStorage empty, using sample data');
            setDoctors(getIndianDoctors());
          } else {
            console.log('Using localStorage data');
            setDoctors(savedDoctors);
          }
        }
      } catch (error) {
        // Fallback to localStorage or sample data
        console.log('API error, checking localStorage:', error);
        const savedDoctors = JSON.parse(localStorage.getItem('doctors') || '[]');
        if (savedDoctors.length === 0) {
          console.log('localStorage empty, using sample data');
          setDoctors(getIndianDoctors());
        } else {
          console.log('Using localStorage data');
          setDoctors(savedDoctors);
        }
      }
      setLoading(false);
    };
    loadDoctors();
  }, []);

  const getIndianDoctors = () => [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      specialization: "Cardiology",
      hospital: "AIIMS, New Delhi",
      department: "Cardiac Care",
      phone: "+91-9876543210",
      email: "rajesh.kumar@aiims.gov.in",
      availability: "Available",
      consultationFee: "500",
      patientsTreated: 1250,
      rating: 4.8,
      photo: "https://randomuser.me/api/portraits/men/1.jpg",
      availabilitySchedule: {
        monday: { available: true, startTime: "09:00", endTime: "17:00" },
        tuesday: { available: true, startTime: "09:00", endTime: "17:00" },
        wednesday: { available: true, startTime: "09:00", endTime: "17:00" },
        thursday: { available: true, startTime: "09:00", endTime: "17:00" },
        friday: { available: true, startTime: "09:00", endTime: "17:00" },
        saturday: { available: true, startTime: "09:00", endTime: "14:00" },
        sunday: { available: false, startTime: "", endTime: "" }
      },
      assignedPatients: [
        { id: 1, name: "Amit Sharma", condition: "Hypertension", lastVisit: "2024-01-15" },
        { id: 2, name: "Priya Singh", condition: "Arrhythmia", lastVisit: "2024-01-14" },
        { id: 3, name: "Vikram Patel", condition: "Heart Failure", lastVisit: "2024-01-13" }
      ],
      todayAppointments: 8,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      specialization: "Neurology",
      hospital: "Apollo Hospital, Delhi",
      department: "Neurology",
      phone: "+91-9876543211",
      email: "priya.sharma@apollo.com",
      availability: "Available",
      consultationFee: "600",
      patientsTreated: 980,
      rating: 4.7,
      photo: "https://randomuser.me/api/portraits/women/2.jpg",
      availabilitySchedule: {
        monday: { available: true, startTime: "08:00", endTime: "16:00" },
        tuesday: { available: true, startTime: "08:00", endTime: "16:00" },
        wednesday: { available: true, startTime: "08:00", endTime: "16:00" },
        thursday: { available: true, startTime: "08:00", endTime: "16:00" },
        friday: { available: true, startTime: "08:00", endTime: "16:00" },
        saturday: { available: false, startTime: "", endTime: "" },
        sunday: { available: false, startTime: "", endTime: "" }
      },
      assignedPatients: [
        { id: 1, name: "Rahul Verma", condition: "Migraine", lastVisit: "2024-01-15" },
        { id: 2, name: "Anita Gupta", condition: "Epilepsy", lastVisit: "2024-01-14" }
      ],
      todayAppointments: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      name: "Dr. Amit Verma",
      specialization: "Orthopedics",
      hospital: "Fortis Hospital, Mumbai",
      department: "Orthopedics",
      phone: "+91-9876543212",
      email: "amit.verma@fortis.com",
      availability: "On Leave",
      consultationFee: "550",
      patientsTreated: 1100,
      rating: 4.6,
      photo: "https://randomuser.me/api/portraits/men/3.jpg",
      availabilitySchedule: {
        monday: { available: false, startTime: "", endTime: "" },
        tuesday: { available: false, startTime: "", endTime: "" },
        wednesday: { available: false, startTime: "", endTime: "" },
        thursday: { available: false, startTime: "", endTime: "" },
        friday: { available: false, startTime: "", endTime: "" },
        saturday: { available: false, startTime: "", endTime: "" },
        sunday: { available: false, startTime: "", endTime: "" }
      },
      assignedPatients: [
        { id: 1, name: "Suresh Kumar", condition: "Fracture", lastVisit: "2024-01-10" },
        { id: 2, name: "Meena Devi", condition: "Arthritis", lastVisit: "2024-01-08" }
      ],
      todayAppointments: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      name: "Dr. Sunita Gupta",
      specialization: "Pediatrics",
      hospital: "Lilavati Hospital, Mumbai",
      department: "Pediatrics",
      phone: "+91-9876543213",
      email: "sunita.gupta@lilavati.com",
      availability: "Available",
      consultationFee: "400",
      patientsTreated: 1500,
      rating: 4.9,
      photo: "https://randomuser.me/api/portraits/women/4.jpg",
      availabilitySchedule: {
        monday: { available: true, startTime: "09:00", endTime: "18:00" },
        tuesday: { available: true, startTime: "09:00", endTime: "18:00" },
        wednesday: { available: true, startTime: "09:00", endTime: "18:00" },
        thursday: { available: true, startTime: "09:00", endTime: "18:00" },
        friday: { available: true, startTime: "09:00", endTime: "18:00" },
        saturday: { available: true, startTime: "09:00", endTime: "13:00" },
        sunday: { available: false, startTime: "", endTime: "" }
      },
      assignedPatients: [
        { id: 1, name: "Baby Aarav", condition: "Fever", lastVisit: "2024-01-15" },
        { id: 2, name: "Baby Diya", condition: "Cold", lastVisit: "2024-01-14" },
        { id: 3, name: "Kabir Singh", condition: "Vaccination", lastVisit: "2024-01-13" },
        { id: 4, name: "Ananya Roy", condition: "Growth Check", lastVisit: "2024-01-12" }
      ],
      todayAppointments: 12,
      createdAt: new Date().toISOString()
    },
    {
      id: 5,
      name: "Dr. Vikram Singh",
      specialization: "General Medicine",
      hospital: "Max Hospital, Delhi",
      department: "General Medicine",
      phone: "+91-9876543214",
      email: "vikram.singh@max.com",
      availability: "In Surgery",
      consultationFee: "350",
      patientsTreated: 2000,
      rating: 4.5,
      photo: "https://randomuser.me/api/portraits/men/5.jpg",
      availabilitySchedule: {
        monday: { available: true, startTime: "08:00", endTime: "20:00" },
        tuesday: { available: true, startTime: "08:00", endTime: "20:00" },
        wednesday: { available: true, startTime: "08:00", endTime: "20:00" },
        thursday: { available: true, startTime: "08:00", endTime: "20:00" },
        friday: { available: true, startTime: "08:00", endTime: "20:00" },
        saturday: { available: true, startTime: "09:00", endTime: "17:00" },
        sunday: { available: true, startTime: "09:00", endTime: "17:00" }
      },
      assignedPatients: [
        { id: 1, name: "Ramesh Iyer", condition: "Diabetes", lastVisit: "2024-01-15" },
        { id: 2, name: "Lakshmi Nair", condition: "Hypertension", lastVisit: "2024-01-14" },
        { id: 3, name: "Krishnan Raj", condition: "Thyroid", lastVisit: "2024-01-13" }
      ],
      todayAppointments: 15,
      createdAt: new Date().toISOString()
    },
    {
      id: 6,
      name: "Dr. Anjali Desai",
      specialization: "Dermatology",
      hospital: "Jaslok Hospital, Mumbai",
      department: "Dermatology",
      phone: "+91-9876543215",
      email: "anjali.desai@jaslok.com",
      availability: "Available",
      consultationFee: "450",
      patientsTreated: 850,
      rating: 4.7,
      photo: "https://randomuser.me/api/portraits/women/6.jpg",
      availabilitySchedule: {
        monday: { available: true, startTime: "10:00", endTime: "19:00" },
        tuesday: { available: true, startTime: "10:00", endTime: "19:00" },
        wednesday: { available: true, startTime: "10:00", endTime: "19:00" },
        thursday: { available: true, startTime: "10:00", endTime: "19:00" },
        friday: { available: true, startTime: "10:00", endTime: "19:00" },
        saturday: { available: true, startTime: "10:00", endTime: "15:00" },
        sunday: { available: false, startTime: "", endTime: "" }
      },
      assignedPatients: [
        { id: 1, name: "Pooja Mehta", condition: "Acne", lastVisit: "2024-01-15" },
        { id: 2, name: "Rajesh Kothari", condition: "Eczema", lastVisit: "2024-01-14" }
      ],
      todayAppointments: 7,
      createdAt: new Date().toISOString()
    },
    {
      id: 7,
      name: "Dr. Deepak Mehta",
      specialization: "Oncology",
      hospital: "Tata Memorial Hospital, Mumbai",
      department: "Oncology",
      phone: "+91-9876543216",
      email: "deepak.mehta@tata.com",
      availability: "Available",
      consultationFee: "800",
      patientsTreated: 750,
      rating: 4.9,
      photo: "https://randomuser.me/api/portraits/men/7.jpg",
      availabilitySchedule: {
        monday: { available: true, startTime: "09:00", endTime: "18:00" },
        tuesday: { available: true, startTime: "09:00", endTime: "18:00" },
        wednesday: { available: true, startTime: "09:00", endTime: "18:00" },
        thursday: { available: true, startTime: "09:00", endTime: "18:00" },
        friday: { available: true, startTime: "09:00", endTime: "18:00" },
        saturday: { available: false, startTime: "", endTime: "" },
        sunday: { available: false, startTime: "", endTime: "" }
      },
      assignedPatients: [
        { id: 1, name: "Sunil Kumar", condition: "Lymphoma", lastVisit: "2024-01-15" },
        { id: 2, name: "Kavita Singh", condition: "Breast Cancer", lastVisit: "2024-01-14" }
      ],
      todayAppointments: 6,
      createdAt: new Date().toISOString()
    },
    {
      id: 8,
      name: "Dr. Meera Nair",
      specialization: "Gynecology",
      hospital: "Columbia Asia Hospital, Bangalore",
      department: "Gynecology",
      phone: "+91-9876543217",
      email: "meera.nair@columbia.com",
      availability: "Available",
      consultationFee: "500",
      patientsTreated: 1300,
      rating: 4.8,
      photo: "https://randomuser.me/api/portraits/women/8.jpg",
      availabilitySchedule: {
        monday: { available: true, startTime: "08:00", endTime: "17:00" },
        tuesday: { available: true, startTime: "08:00", endTime: "17:00" },
        wednesday: { available: true, startTime: "08:00", endTime: "17:00" },
        thursday: { available: true, startTime: "08:00", endTime: "17:00" },
        friday: { available: true, startTime: "08:00", endTime: "17:00" },
        saturday: { available: true, startTime: "09:00", endTime: "14:00" },
        sunday: { available: false, startTime: "", endTime: "" }
      },
      assignedPatients: [
        { id: 1, name: "Rebecca Thomas", condition: "Pregnancy", lastVisit: "2024-01-15" },
        { id: 2, name: "Anjum Begum", condition: "PCOD", lastVisit: "2024-01-14" },
        { id: 3, name: "Lakshmi Devi", condition: "Menopause", lastVisit: "2024-01-13" }
      ],
      todayAppointments: 10,
      createdAt: new Date().toISOString()
    },
    {
      id: 9,
      name: "Dr. Ravi Chandra",
      specialization: "Cardiology",
      hospital: "Narayana Health, Bangalore",
      department: "Cardiology",
      phone: "+91-9876543218",
      email: "ravi.chandra@narayana.com",
      availability: "On Leave",
      consultationFee: "600",
      patientsTreated: 1100,
      rating: 4.6,
      photo: "https://randomuser.me/api/portraits/men/9.jpg",
      availabilitySchedule: {
        monday: { available: false, startTime: "", endTime: "" },
        tuesday: { available: false, startTime: "", endTime: "" },
        wednesday: { available: false, startTime: "", endTime: "" },
        thursday: { available: false, startTime: "", endTime: "" },
        friday: { available: false, startTime: "", endTime: "" },
        saturday: { available: false, startTime: "", endTime: "" },
        sunday: { available: false, startTime: "", endTime: "" }
      },
      assignedPatients: [
        { id: 1, name: "Mohan Das", condition: "Heart Attack", lastVisit: "2024-01-05" },
        { id: 2, name: "Sita Devi", condition: "Angina", lastVisit: "2024-01-03" }
      ],
      todayAppointments: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 10,
      name: "Dr. Kavita Reddy",
      specialization: "Pediatrics",
      hospital: "Rainbow Hospital, Hyderabad",
      department: "Pediatrics",
      phone: "+91-9876543219",
      email: "kavita.reddy@rainbow.com",
      availability: "Available",
      consultationFee: "400",
      patientsTreated: 1450,
      rating: 4.9,
      photo: "https://randomuser.me/api/portraits/women/10.jpg",
      availabilitySchedule: {
        monday: { available: true, startTime: "09:00", endTime: "18:00" },
        tuesday: { available: true, startTime: "09:00", endTime: "18:00" },
        wednesday: { available: true, startTime: "09:00", endTime: "18:00" },
        thursday: { available: true, startTime: "09:00", endTime: "18:00" },
        friday: { available: true, startTime: "09:00", endTime: "18:00" },
        saturday: { available: true, startTime: "09:00", endTime: "13:00" },
        sunday: { available: false, startTime: "", endTime: "" }
      },
      assignedPatients: [
        { id: 1, name: "Baby Arjun", condition: "Vaccination", lastVisit: "2024-01-15" },
        { id: 2, name: "Baby Ishaan", condition: "Fever", lastVisit: "2024-01-14" },
        { id: 3, name: "Baby Aadhya", condition: "Growth Check", lastVisit: "2024-01-13" },
        { id: 4, name: "Baby Vihaan", condition: "Cold", lastVisit: "2024-01-12" }
      ],
      todayAppointments: 14,
      createdAt: new Date().toISOString()
    }
  ];

  const filteredDoctors = doctors.filter(doctor => 
    (doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.hospital?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterSpecialization === "All" || doctor.specialization === filterSpecialization) &&
    (filterAvailability === "All" || doctor.availability === filterAvailability)
  );

  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const newDoctor = {
        ...formData,
        consultationFee: parseInt(formData.consultationFee) || 0,
        patientsTreated: parseInt(formData.patientsTreated) || 0,
        rating: parseFloat(formData.rating) || 0,
        assignedPatients: [],
        todayAppointments: 0,
        createdAt: new Date().toISOString()
      };
      
      console.log('Adding doctor to database:', newDoctor);
      
      // Try to save to database first
      const response = await fetch('https://hospital-resource-and-blood-bank.onrender.com/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doctor: newDoctor })
      });
      
      if (response.ok) {
        const savedDoctor = await response.json();
        const updatedDoctors = [...doctors, savedDoctor];
        setDoctors(updatedDoctors);
        localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
      } else {
        // Fallback to localStorage if API fails
        const updatedDoctors = [...doctors, newDoctor];
        setDoctors(updatedDoctors);
        localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
      }
      
      setShowAddModal(false);
      setPhotoPreview(null);
      setFormData({
        name: "",
        specialization: "",
        hospital: "",
        department: "",
        phone: "",
        email: "",
        availability: "Available",
        consultationFee: "",
        patientsTreated: "",
        rating: "",
        photo: "",
        availabilitySchedule: {
          monday: { available: true, startTime: "09:00", endTime: "17:00" },
          tuesday: { available: true, startTime: "09:00", endTime: "17:00" },
          wednesday: { available: true, startTime: "09:00", endTime: "17:00" },
          thursday: { available: true, startTime: "09:00", endTime: "17:00" },
          friday: { available: true, startTime: "09:00", endTime: "17:00" },
          saturday: { available: false, startTime: "", endTime: "" },
          sunday: { available: false, startTime: "", endTime: "" }
        }
      });
    } catch (error) {
      console.error('Error adding doctor:', error);
      // Fallback to localStorage on error
      const newDoctor = {
        id: Date.now(),
        ...formData,
        patientsTreated: parseInt(formData.patientsTreated) || 0,
        rating: parseFloat(formData.rating) || 0,
        assignedPatients: [],
        todayAppointments: 0,
        createdAt: new Date().toISOString()
      };
      const updatedDoctors = [...doctors, newDoctor];
      setDoctors(updatedDoctors);
      localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
      setShowAddModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCallDoctor = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailDoctor = (email) => {
    window.open(`mailto:${email}`, '_self');
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      hospital: doctor.hospital || "",
      department: doctor.department || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
      availability: doctor.availability || "Available",
      consultationFee: doctor.consultationFee || "",
      patientsTreated: doctor.patientsTreated?.toString() || "",
      rating: doctor.rating?.toString() || "",
      photo: doctor.photo || "",
      availabilitySchedule: doctor.availabilitySchedule || {
        monday: { available: true, startTime: "09:00", endTime: "17:00" },
        tuesday: { available: true, startTime: "09:00", endTime: "17:00" },
        wednesday: { available: true, startTime: "09:00", endTime: "17:00" },
        thursday: { available: true, startTime: "09:00", endTime: "17:00" },
        friday: { available: true, startTime: "09:00", endTime: "17:00" },
        saturday: { available: false, startTime: "", endTime: "" },
        sunday: { available: false, startTime: "", endTime: "" }
      }
    });
    setShowEditModal(true);
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedDoctor = {
        ...selectedDoctor,
        ...formData,
        consultationFee: parseInt(formData.consultationFee) || 0,
        patientsTreated: parseInt(formData.patientsTreated) || 0,
        rating: parseFloat(formData.rating) || 0,
        updatedAt: new Date().toISOString()
      };
      
      // Try to update in database
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/doctors/${selectedDoctor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDoctor)
      });
      
      if (response.ok) {
        const savedDoctor = await response.json();
        const updatedDoctors = doctors.map(doc => 
          doc.id === selectedDoctor.id ? savedDoctor : doc
        );
        setDoctors(updatedDoctors);
        localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
      } else {
        // Fallback to localStorage
        const updatedDoctors = doctors.map(doc => 
          doc.id === selectedDoctor.id ? updatedDoctor : doc
        );
        setDoctors(updatedDoctors);
        localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
      }
      
      setShowEditModal(false);
      setSelectedDoctor(null);
    } catch (error) {
      console.error('Error updating doctor:', error);
      // Fallback to localStorage
      const updatedDoctor = {
        ...selectedDoctor,
        ...formData,
        patientsTreated: parseInt(formData.patientsTreated) || 0,
        rating: parseFloat(formData.rating) || 0,
        updatedAt: new Date().toISOString()
      };
      const updatedDoctors = doctors.map(doc => 
        doc.id === selectedDoctor.id ? updatedDoctor : doc
      );
      setDoctors(updatedDoctors);
      localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
      setShowEditModal(false);
      setSelectedDoctor(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadProfile = (doctor) => {
    const profileContent = `
DOCTOR PROFILE
=============

Name: ${doctor.name}
Specialization: ${doctor.specialization}
Hospital: ${doctor.hospital}
Department: ${doctor.department || 'N/A'}
Phone: ${doctor.phone}
Email: ${doctor.email}
Consultation Fee: ₹${doctor.consultationFee}
Patients Treated: ${doctor.patientsTreated || 0}
Rating: ${doctor.rating || 'N/A'}/5
Availability: ${doctor.availability}

Weekly Schedule:
Monday: ${doctor.availabilitySchedule?.monday?.available ? `${doctor.availabilitySchedule.monday.startTime} - ${doctor.availabilitySchedule.monday.endTime}` : 'Not Available'}
Tuesday: ${doctor.availabilitySchedule?.tuesday?.available ? `${doctor.availabilitySchedule.tuesday.startTime} - ${doctor.availabilitySchedule.tuesday.endTime}` : 'Not Available'}
Wednesday: ${doctor.availabilitySchedule?.wednesday?.available ? `${doctor.availabilitySchedule.wednesday.startTime} - ${doctor.availabilitySchedule.wednesday.endTime}` : 'Not Available'}
Thursday: ${doctor.availabilitySchedule?.thursday?.available ? `${doctor.availabilitySchedule.thursday.startTime} - ${doctor.availabilitySchedule.thursday.endTime}` : 'Not Available'}
Friday: ${doctor.availabilitySchedule?.friday?.available ? `${doctor.availabilitySchedule.friday.startTime} - ${doctor.availabilitySchedule.friday.endTime}` : 'Not Available'}
Saturday: ${doctor.availabilitySchedule?.saturday?.available ? `${doctor.availabilitySchedule.saturday.startTime} - ${doctor.availabilitySchedule.saturday.endTime}` : 'Not Available'}
Sunday: ${doctor.availabilitySchedule?.sunday?.available ? `${doctor.availabilitySchedule.sunday.startTime} - ${doctor.availabilitySchedule.sunday.endTime}` : 'Not Available'}

Generated on: ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([profileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doctor.name.replace(/\s+/g, '_')}_profile.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} style={{ color: "#F59E0B", fontSize: "0.85rem" }} />);
      } else {
        stars.push(<FaStar key={i} style={{ color: "#E5E7EB", fontSize: "0.85rem" }} />);
      }
    }
    return stars;
  };

  const renderAvailabilityCalendar = (schedule) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginTop: 12 }}>
        {days.map((day, index) => {
          const daySchedule = schedule?.[day];
          const isAvailable = daySchedule?.available;
          return (
            <div
              key={day}
              style={{
                padding: '8px 4px',
                borderRadius: 6,
                background: isAvailable ? '#DCFCE7' : '#FEE2E2',
                color: isAvailable ? '#16A34A' : '#DC2626',
                textAlign: 'center',
                fontSize: '0.7rem',
                fontWeight: 600
              }}
            >
              <div>{dayNames[index]}</div>
              <div style={{ fontSize: '0.6rem', marginTop: 2 }}>
                {isAvailable ? '✓' : '✗'}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleUpdateAvailability = async (doctorId, newAvailability) => {
    try {
      const doctorToUpdate = doctors.find(doc => doc.id === doctorId);
      if (doctorToUpdate) {
        // Try to update in database
        const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/doctors/${doctorId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...doctorToUpdate, availability: newAvailability })
        });
        
        if (response.ok) {
          const updatedDoctor = await response.json();
          const updatedDoctors = doctors.map(doc => 
            doc.id === doctorId ? updatedDoctor : doc
          );
          setDoctors(updatedDoctors);
          localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
        } else {
          // Fallback to localStorage
          const updatedDoctors = doctors.map(doc => 
            doc.id === doctorId ? { ...doc, availability: newAvailability } : doc
          );
          setDoctors(updatedDoctors);
          localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
        }
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      // Fallback to localStorage
      const updatedDoctors = doctors.map(doc => 
        doc.id === doctorId ? { ...doc, availability: newAvailability } : doc
      );
      setDoctors(updatedDoctors);
      localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        // Try to delete from database
        const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/doctors/${doctorId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const updatedDoctors = doctors.filter(doc => doc.id !== doctorId);
          setDoctors(updatedDoctors);
          localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
        } else {
          // Fallback to localStorage
          const updatedDoctors = doctors.filter(doc => doc.id !== doctorId);
          setDoctors(updatedDoctors);
          localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
        }
      } catch (error) {
        console.error('Error deleting doctor:', error);
        // Fallback to localStorage
        const updatedDoctors = doctors.filter(doc => doc.id !== doctorId);
        setDoctors(updatedDoctors);
        localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
      }
    }
  };

  const AvailabilityBadge = ({ availability }) => {
    const colors = {
      "Available": "#DCFCE7",
      "Unavailable": "#FEE2E2",
      "On Leave": "#FEF3C7",
      "In Surgery": "#DBEAFE"
    };
    const textColors = {
      "Available": "#16A34A",
      "Unavailable": "#DC2626",
      "On Leave": "#D97706",
      "In Surgery": "#2563EB"
    };
    const icons = {
      "Available": "🟢",
      "Unavailable": "🔴",
      "On Leave": "🟡",
      "In Surgery": "🔵"
    };
    return (
      <span style={{
        padding: "4px 10px",
        borderRadius: 6,
        background: colors[availability] || "#F3F4F6",
        color: textColors[availability] || "#6B7280",
        fontSize: "0.75rem",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 4
      }}>
        {icons[availability]} {availability}
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
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading doctors...</p>
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
                Hospital Doctors
              </h1>
              <p style={{ color:SLATE_L, fontSize:"1rem", margin:0 }}>
                Manage hospital doctors and staff
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
                  placeholder="Search doctors..."
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
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                style={{
                  background:WHITE,
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  padding:"8px 16px",
                  fontSize:"0.9rem",
                  color:NAVY2,
                  cursor:"pointer"
                }}
              >
                <option value="All">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                style={{
                  background:WHITE,
                  border:`1px solid ${BORDER}`,
                  borderRadius:8,
                  padding:"8px 16px",
                  fontSize:"0.9rem",
                  color:NAVY2,
                  cursor:"pointer"
                }}
              >
                <option value="All">All Availability</option>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="On Leave">On Leave</option>
                <option value="In Surgery">In Surgery</option>
              </select>
              <div style={{ display:"flex", gap:8 }}>
                <button
                  onClick={() => setViewMode(viewMode === "card" ? "table" : "card")}
                  style={{
                    background:WHITE,
                    border:`1px solid ${BORDER}`,
                    borderRadius:8,
                    padding:"10px 16px",
                    fontSize:"0.9rem",
                    fontWeight:600,
                    cursor:"pointer",
                    display:"flex",
                    alignItems:"center",
                    gap:8
                  }}
                >
                  {viewMode === "card" ? <FaStethoscope /> : <FaUsers />}
                  {viewMode === "card" ? "Table View" : "Card View"}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    background:RED,
                    color:WHITE,
                    border:"none",
                    borderRadius:8,
                    padding:"10px 20px",
                    fontSize:"0.9rem",
                    fontWeight:600,
                    cursor:"pointer",
                    display:"flex",
                    alignItems:"center",
                    gap:8
                  }}
                >
                  <FaPlus /> Add Doctor
                </button>
              </div>
            </div>
          </div>

          {/* Doctors Display */}
          <div style={{ background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize:"1.1rem", fontWeight:700, color:NAVY2, margin:0 }}>All Doctors ({filteredDoctors.length})</h2>
            </div>
            {filteredDoctors.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:SLATE_L }}>
                <FaStethoscope style={{ fontSize:"3rem", marginBottom:16, opacity:0.3 }} />
                <p style={{ fontSize:"1rem", marginBottom:16 }}>No doctors found</p>
              </div>
            ) : viewMode === "card" ? (
              <div style={{ padding:"24px", display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(350px, 1fr))", gap:24 }}>
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} style={{
                    background:WHITE,
                    borderRadius:12,
                    border:`1px solid ${BORDER}`,
                    padding:"24px",
                    display:"flex",
                    flexDirection:"column",
                    gap:16,
                    transition:"all 0.2s",
                    cursor:"pointer"
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setShowDoctorDetailModal(true);
                  }}
                  >
                    {/* Doctor Header */}
                    <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                      <div style={{
                        width:64,
                        height:64,
                        borderRadius:12,
                        background:`${RED}15`,
                        overflow:"hidden",
                        flexShrink:0
                      }}>
                        {doctor.photo ? (
                          <img src={doctor.photo} alt={doctor.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        ) : (
                          <div style={{
                            width:"100%",
                            height:"100%",
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            color:RED,
                            fontSize:"2rem"
                          }}>
                            <FaUserDoctor />
                          </div>
                        )}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <h3 style={{ fontSize:"1rem", fontWeight:700, color:NAVY2, margin:"0 0 4px 0" }}>{doctor.name}</h3>
                        <p style={{ fontSize:"0.85rem", color:SLATE_L, margin:"0 0 8px 0" }}>{doctor.specialization}</p>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <AvailabilityBadge availability={doctor.availability || "Available"} />
                          <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                            {renderStars(doctor.rating || 0)}
                            <span style={{ fontSize:"0.75rem", color:SLATE_L, marginLeft:4 }}>({doctor.rating || 0})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:"0.85rem", color:SLATE_L }}>
                        <FaHospital style={{ color:RED }} />
                        <span>{doctor.hospital}</span>
                      </div>
                      {doctor.department && (
                        <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:"0.85rem", color:SLATE_L }}>
                          <FaBuilding style={{ color:RED }} />
                          <span>{doctor.department}</span>
                        </div>
                      )}
                      <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:"0.85rem", color:SLATE_L }}>
                        <FaUsers style={{ color:RED }} />
                        <span>{doctor.patientsTreated || 0} patients treated</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:"0.85rem", color:SLATE_L }}>
                        <FaClock style={{ color:RED }} />
                        <span>{doctor.todayAppointments || 0} appointments today</span>
                      </div>
                    </div>

                    {/* Weekly Availability */}
                    <div>
                      <div style={{ fontSize:"0.75rem", fontWeight:600, color:SLATE_L, marginBottom:8 }}>Weekly Availability</div>
                      {renderAvailabilityCalendar(doctor.availabilitySchedule)}
                    </div>

                    {/* Actions */}
                    <div style={{ display:"flex", gap:8, marginTop:"auto" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallDoctor(doctor.phone);
                        }}
                        style={{
                          flex:1,
                          background:`${RED}15`,
                          color:RED,
                          border:"none",
                          padding:"10px 12px",
                          borderRadius:8,
                          fontSize:"0.85rem",
                          fontWeight:600,
                          cursor:"pointer",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          gap:6
                        }}
                      >
                        <FaPhone /> Call
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEmailDoctor(doctor.email);
                        }}
                        style={{
                          flex:1,
                          background:`${RED}15`,
                          color:RED,
                          border:"none",
                          padding:"10px 12px",
                          borderRadius:8,
                          fontSize:"0.85rem",
                          fontWeight:600,
                          cursor:"pointer",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          gap:6
                        }}
                      >
                        <FaEnvelope /> Email
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditDoctor(doctor);
                        }}
                        style={{
                          flex:1,
                          background:WHITE,
                          border:`1px solid ${BORDER}`,
                          color:NAVY2,
                          padding:"10px 12px",
                          borderRadius:8,
                          fontSize:"0.85rem",
                          fontWeight:600,
                          cursor:"pointer",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          gap:6
                        }}
                      >
                        <FaPen /> Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:SMOKE, borderBottom:`1px solid ${BORDER}` }}>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Doctor</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Specialization</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Hospital</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Patients</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Rating</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Availability</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Today's Appts</th>
                      <th style={{ padding:"16px 24px", textAlign:"left", fontSize:"0.8rem", fontWeight:600, color:SLATE_L, textTransform:"uppercase", letterSpacing:"0.05em" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((doctor) => (
                      <tr key={doctor.id} style={{ borderBottom:`1px solid ${BORDER}`, transition:"background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = SMOKE} onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                        <td style={{ padding:"16px 24px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{
                              width:40,
                              height:40,
                              borderRadius:8,
                              background:`${RED}15`,
                              overflow:"hidden",
                              flexShrink:0
                            }}>
                              {doctor.photo ? (
                                <img src={doctor.photo} alt={doctor.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                              ) : (
                                <div style={{
                                  width:"100%",
                                  height:"100%",
                                  display:"flex",
                                  alignItems:"center",
                                  justifyContent:"center",
                                  color:RED,
                                  fontSize:"1.2rem"
                                }}>
                                  <FaUserDoctor />
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize:"0.9rem", color:NAVY2, fontWeight:600 }}>{doctor.name}</div>
                              <div style={{ fontSize:"0.75rem", color:SLATE_L }}>{doctor.department || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2 }}>{doctor.specialization}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:SLATE_L }}>{doctor.hospital}</td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2, fontWeight:600 }}>{doctor.patientsTreated || 0}</td>
                        <td style={{ padding:"16px 24px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                            {renderStars(doctor.rating || 0)}
                            <span style={{ fontSize:"0.75rem", color:SLATE_L, marginLeft:4 }}>({doctor.rating || 0})</span>
                          </div>
                        </td>
                        <td style={{ padding:"16px 24px" }}><AvailabilityBadge availability={doctor.availability || "Available"} /></td>
                        <td style={{ padding:"16px 24px", fontSize:"0.9rem", color:NAVY2, fontWeight:600 }}>{doctor.todayAppointments || 0}</td>
                        <td style={{ padding:"16px 24px" }}>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCallDoctor(doctor.phone);
                              }}
                              style={{
                                background:`${RED}15`,
                                color:RED,
                                border:"none",
                                padding:"6px 10px",
                                borderRadius:6,
                                cursor:"pointer",
                                fontSize:"0.8rem",
                                display:"flex",
                                alignItems:"center",
                                gap:4
                              }}
                            >
                              <FaPhone />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEmailDoctor(doctor.email);
                              }}
                              style={{
                                background:`${RED}15`,
                                color:RED,
                                border:"none",
                                padding:"6px 10px",
                                borderRadius:6,
                                cursor:"pointer",
                                fontSize:"0.8rem",
                                display:"flex",
                                alignItems:"center",
                                gap:4
                              }}
                            >
                              <FaEnvelope />
                            </button>
                            <select
                              value={doctor.availability || "Available"}
                              onChange={(e) => handleUpdateAvailability(doctor.id, e.target.value)}
                              style={{
                                padding:"4px 8px",
                                borderRadius:4,
                                border:`1px solid ${BORDER}`,
                                fontSize:"0.8rem",
                                cursor:"pointer"
                              }}
                            >
                              <option value="Available">Available</option>
                              <option value="Unavailable">Unavailable</option>
                              <option value="On Leave">On Leave</option>
                              <option value="In Surgery">In Surgery</option>
                            </select>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDoctor(doctor);
                              }}
                              style={{
                                background:WHITE,
                                border:`1px solid ${BORDER}`,
                                padding:"6px 10px",
                                borderRadius:6,
                                cursor:"pointer",
                                fontSize:"0.8rem",
                                color:NAVY2,
                                display:"flex",
                                alignItems:"center",
                                gap:4
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                              onMouseLeave={e => e.currentTarget.style.background = WHITE}
                            >
                              <FaPen />
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(doctor.id)}
                              style={{
                                background:WHITE,
                                border:`1px solid ${BORDER}`,
                                padding:"6px 12px",
                                borderRadius:6,
                                cursor:"pointer",
                                fontSize:"0.85rem",
                                color:"#DC2626",
                                display:"flex",
                                alignItems:"center",
                                gap:4
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                              onMouseLeave={e => e.currentTarget.style.background = WHITE}
                            >
                              <FaTrash />
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

          {/* Doctor Detail Modal */}
          {showDoctorDetailModal && selectedDoctor && (
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
              zIndex:1000
            }}>
              <div style={{
                background:WHITE,
                borderRadius:12,
                padding:"32px",
                width:"100%",
                maxWidth:"700px",
                maxHeight:"90vh",
                overflowY:"auto"
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
                  <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                    <div style={{
                      width:100,
                      height:100,
                      borderRadius:16,
                      background:`${RED}15`,
                      overflow:"hidden"
                    }}>
                      {selectedDoctor.photo ? (
                        <img src={selectedDoctor.photo} alt={selectedDoctor.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      ) : (
                        <div style={{
                          width:"100%",
                          height:"100%",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          color:RED,
                          fontSize:"3rem"
                        }}>
                          <FaUserDoctor />
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 style={{ fontSize:"1.5rem", fontWeight:700, color:NAVY2, margin:"0 0 8px 0" }}>{selectedDoctor.name}</h2>
                      <p style={{ fontSize:"1rem", color:SLATE_L, margin:"0 0 8px 0" }}>{selectedDoctor.specialization}</p>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <AvailabilityBadge availability={selectedDoctor.availability || "Available"} />
                        <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                          {renderStars(selectedDoctor.rating || 0)}
                          <span style={{ fontSize:"0.85rem", color:SLATE_L, marginLeft:4 }}>({selectedDoctor.rating || 0})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDoctorDetailModal(false)}
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

                {/* Doctor Details Grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:20, marginBottom:24 }}>
                  <div style={{ padding:16, background:SMOKE, borderRadius:8 }}>
                    <div style={{ fontSize:"0.75rem", color:SLATE_L, marginBottom:4 }}>Hospital</div>
                    <div style={{ fontSize:"0.95rem", fontWeight:600, color:NAVY2 }}>{selectedDoctor.hospital}</div>
                  </div>
                  <div style={{ padding:16, background:SMOKE, borderRadius:8 }}>
                    <div style={{ fontSize:"0.75rem", color:SLATE_L, marginBottom:4 }}>Department</div>
                    <div style={{ fontSize:"0.95rem", fontWeight:600, color:NAVY2 }}>{selectedDoctor.department || 'N/A'}</div>
                  </div>
                  <div style={{ padding:16, background:SMOKE, borderRadius:8 }}>
                    <div style={{ fontSize:"0.75rem", color:SLATE_L, marginBottom:4 }}>Phone</div>
                    <div style={{ fontSize:"0.95rem", fontWeight:600, color:NAVY2 }}>{selectedDoctor.phone}</div>
                  </div>
                  <div style={{ padding:16, background:SMOKE, borderRadius:8 }}>
                    <div style={{ fontSize:"0.75rem", color:SLATE_L, marginBottom:4 }}>Email</div>
                    <div style={{ fontSize:"0.95rem", fontWeight:600, color:NAVY2 }}>{selectedDoctor.email}</div>
                  </div>
                  <div style={{ padding:16, background:SMOKE, borderRadius:8 }}>
                    <div style={{ fontSize:"0.75rem", color:SLATE_L, marginBottom:4 }}>Consultation Fee</div>
                    <div style={{ fontSize:"0.95rem", fontWeight:600, color:NAVY2 }}>₹{selectedDoctor.consultationFee}</div>
                  </div>
                  <div style={{ padding:16, background:SMOKE, borderRadius:8 }}>
                    <div style={{ fontSize:"0.75rem", color:SLATE_L, marginBottom:4 }}>Patients Treated</div>
                    <div style={{ fontSize:"0.95rem", fontWeight:600, color:NAVY2 }}>{selectedDoctor.patientsTreated || 0}</div>
                  </div>
                </div>

                {/* Weekly Availability */}
                <div style={{ marginBottom:24 }}>
                  <h3 style={{ fontSize:"1rem", fontWeight:700, color:NAVY2, margin:"0 0 16px 0" }}>Weekly Availability</h3>
                  {renderAvailabilityCalendar(selectedDoctor.availabilitySchedule)}
                </div>

                {/* Assigned Patients */}
                <div style={{ marginBottom:24 }}>
                  <h3 style={{ fontSize:"1rem", fontWeight:700, color:NAVY2, margin:"0 0 16px 0" }}>Assigned Patients ({selectedDoctor.assignedPatients?.length || 0})</h3>
                  {selectedDoctor.assignedPatients && selectedDoctor.assignedPatients.length > 0 ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {selectedDoctor.assignedPatients.map((patient) => (
                        <div key={patient.id} style={{
                          padding:12,
                          background:SMOKE,
                          borderRadius:8,
                          display:"flex",
                          justifyContent:"space-between",
                          alignItems:"center"
                        }}>
                          <div>
                            <div style={{ fontSize:"0.9rem", fontWeight:600, color:NAVY2 }}>{patient.name}</div>
                            <div style={{ fontSize:"0.8rem", color:SLATE_L }}>{patient.condition}</div>
                          </div>
                          <div style={{ fontSize:"0.8rem", color:SLATE_L }}>Last visit: {patient.lastVisit}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding:20, textAlign:"center", color:SLATE_L, background:SMOKE, borderRadius:8 }}>
                      No assigned patients
                    </div>
                  )}
                </div>

                {/* Today's Appointments */}
                <div style={{ marginBottom:24 }}>
                  <h3 style={{ fontSize:"1rem", fontWeight:700, color:NAVY2, margin:"0 0 16px 0" }}>Today's Appointments</h3>
                  <div style={{ padding:16, background:SMOKE, borderRadius:8, textAlign:"center" }}>
                    <div style={{ fontSize:"2rem", fontWeight:700, color:RED }}>{selectedDoctor.todayAppointments || 0}</div>
                    <div style={{ fontSize:"0.85rem", color:SLATE_L }}>appointments scheduled today</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
                  <button
                    onClick={() => handleCallDoctor(selectedDoctor.phone)}
                    style={{
                      background:`${RED}15`,
                      color:RED,
                      border:"none",
                      padding:"12px 24px",
                      borderRadius:8,
                      fontSize:"0.9rem",
                      fontWeight:600,
                      cursor:"pointer",
                      display:"flex",
                      alignItems:"center",
                      gap:8
                    }}
                  >
                    <FaPhone /> Call
                  </button>
                  <button
                    onClick={() => handleEmailDoctor(selectedDoctor.email)}
                    style={{
                      background:`${RED}15`,
                      color:RED,
                      border:"none",
                      padding:"12px 24px",
                      borderRadius:8,
                      fontSize:"0.9rem",
                      fontWeight:600,
                      cursor:"pointer",
                      display:"flex",
                      alignItems:"center",
                      gap:8
                    }}
                  >
                    <FaEnvelope /> Email
                  </button>
                  <button
                    onClick={() => handleDownloadProfile(selectedDoctor)}
                    style={{
                      background:WHITE,
                      border:`1px solid ${BORDER}`,
                      padding:"12px 24px",
                      borderRadius:8,
                      fontSize:"0.9rem",
                      fontWeight:600,
                      cursor:"pointer",
                      display:"flex",
                      alignItems:"center",
                      gap:8
                    }}
                  >
                    <FaDownload /> Download Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Doctor Modal */}
          {showEditModal && (
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
              zIndex:1000
            }}>
              <div style={{
                background:WHITE,
                borderRadius:12,
                padding:"24px",
                width:"100%",
                maxWidth:"500px",
                maxHeight:"90vh",
                overflowY:"auto"
              }}>
                <h2 style={{ fontSize:"1.3rem", fontWeight:700, color:NAVY2, margin:"0 0 20px 0" }}>Edit Doctor</h2>
                <form onSubmit={handleUpdateDoctor}>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>

                  {/* Weekly Availability */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Weekly Availability</label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:8 }}>
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <div key={day} style={{ textAlign:"center" }}>
                          <div style={{ fontSize:"0.7rem", fontWeight:600, color:SLATE_L, marginBottom:4 }}>
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.availabilitySchedule[day].available}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                availabilitySchedule: {
                                  ...formData.availabilitySchedule,
                                  [day]: {
                                    ...formData.availabilitySchedule[day],
                                    available: e.target.checked,
                                    startTime: e.target.checked ? "09:00" : "",
                                    endTime: e.target.checked ? "17:00" : ""
                                  }
                                }
                              });
                            }}
                            style={{ cursor:"pointer" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Consultation Fee</label>
                    <input
                      type="text"
                      value={formData.consultationFee}
                      onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Patients Treated</label>
                    <input
                      type="number"
                      value={formData.patientsTreated}
                      onChange={(e) => setFormData({...formData, patientsTreated: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Rating (0-5)</label>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData({...formData, rating: e.target.value})}
                        style={{
                          flex:1,
                          height:6,
                          borderRadius:3,
                          background:`${RED}20`,
                          outline:"none",
                          cursor:"pointer"
                        }}
                      />
                      <span style={{ 
                        minWidth:"50px", 
                        textAlign:"center", 
                        fontSize:"0.9rem", 
                        fontWeight:600, 
                        color:NAVY2 
                      }}>
                        {formData.rating || 0}
                      </span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:24 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedDoctor(null);
                      }}
                      style={{
                        background:WHITE,
                        border:`1px solid ${BORDER}`,
                        padding:"10px 20px",
                        borderRadius:6,
                        cursor:"pointer",
                        fontSize:"0.9rem",
                        color:NAVY2
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      style={{
                        background:RED,
                        color:WHITE,
                        border:"none",
                        padding:"10px 20px",
                        borderRadius:6,
                        cursor:isSaving ? "not-allowed" : "pointer",
                        fontSize:"0.9rem",
                        fontWeight:600,
                        opacity: isSaving ? 0.6 : 1
                      }}
                    >
                      {isSaving ? "Saving..." : "Update Doctor"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Doctor Modal */}
          {showAddModal && (
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
              zIndex:1000
            }}>
              <div style={{
                background:WHITE,
                borderRadius:12,
                padding:"24px",
                width:"100%",
                maxWidth:"500px",
                maxHeight:"90vh",
                overflowY:"auto"
              }}>
                <h2 style={{ fontSize:"1.3rem", fontWeight:700, color:NAVY2, margin:"0 0 20px 0" }}>Add New Doctor</h2>
                <form onSubmit={handleAddDoctor}>
                  {/* Profile Photo Upload */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Profile Photo</label>
                    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                      <div style={{
                        width:80,
                        height:80,
                        borderRadius:12,
                        background:`${RED}15`,
                        overflow:"hidden",
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        border:`2px dashed ${BORDER}`
                      }}>
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        ) : (
                          <FaUserDoctor style={{ color:RED, fontSize:"2rem" }} />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPhotoPreview(reader.result);
                                setFormData({...formData, photo: reader.result});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ display:"none" }}
                          id="add-photo-upload"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('add-photo-upload').click()}
                          style={{
                            background:WHITE,
                            border:`1px solid ${BORDER}`,
                            padding:"8px 16px",
                            borderRadius:6,
                            cursor:"pointer",
                            fontSize:"0.85rem",
                            color:NAVY2
                          }}
                        >
                          Choose Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Specialization *</label>
                    <input
                      type="text"
                      required
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Hospital *</label>
                    <input
                      type="text"
                      required
                      value={formData.hospital}
                      onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>

                  {/* Weekly Availability */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Weekly Availability</label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:8 }}>
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <div key={day} style={{ textAlign:"center" }}>
                          <div style={{ fontSize:"0.7rem", fontWeight:600, color:SLATE_L, marginBottom:4 }}>
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.availabilitySchedule[day].available}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                availabilitySchedule: {
                                  ...formData.availabilitySchedule,
                                  [day]: {
                                    ...formData.availabilitySchedule[day],
                                    available: e.target.checked,
                                    startTime: e.target.checked ? "09:00" : "",
                                    endTime: e.target.checked ? "17:00" : ""
                                  }
                                }
                              });
                            }}
                            style={{ cursor:"pointer" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Availability</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    >
                      <option value="Available">Available</option>
                      <option value="Unavailable">Unavailable</option>
                      <option value="On Leave">On Leave</option>
                      <option value="In Surgery">In Surgery</option>
                    </select>
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Consultation Fee</label>
                    <input
                      type="text"
                      value={formData.consultationFee}
                      onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Patients Treated</label>
                    <input
                      type="number"
                      value={formData.patientsTreated}
                      onChange={(e) => setFormData({...formData, patientsTreated: e.target.value})}
                      style={{
                        width:"100%",
                        padding:"10px 12px",
                        border:`1px solid ${BORDER}`,
                        borderRadius:6,
                        fontSize:"0.9rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:"0.85rem", fontWeight:600, color:NAVY2, marginBottom:6 }}>Rating (0-5)</label>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData({...formData, rating: e.target.value})}
                        style={{
                          flex:1,
                          height:6,
                          borderRadius:3,
                          background:`${RED}20`,
                          outline:"none",
                          cursor:"pointer"
                        }}
                      />
                      <span style={{ 
                        minWidth:"50px", 
                        textAlign:"center", 
                        fontSize:"0.9rem", 
                        fontWeight:600, 
                        color:NAVY2 
                      }}>
                        {formData.rating || 0}
                      </span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:24 }}>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      style={{
                        background:WHITE,
                        border:`1px solid ${BORDER}`,
                        padding:"10px 20px",
                        borderRadius:6,
                        cursor:"pointer",
                        fontSize:"0.9rem",
                        color:NAVY2
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        background:RED,
                        color:WHITE,
                        border:"none",
                        padding:"10px 20px",
                        borderRadius:6,
                        cursor:"pointer",
                        fontSize:"0.9rem",
                        fontWeight:600
                      }}
                    >
                      Add Doctor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default HospitalDoctors;
