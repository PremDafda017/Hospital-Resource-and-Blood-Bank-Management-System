import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaArrowLeft,
  FaCheck,
  FaHospital,
  FaUserDoctor,
  FaCalendarDays,
  FaClock,
  FaCreditCard,
  FaCircleCheck,
  FaStethoscope,
  FaHeartPulse,
  FaBone,
  FaBrain,
  FaBaby,
  FaEye,
  FaEarListen,
  FaUser,
  FaMicroscope,
  FaTooth,
  FaSpinner,
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

const SPECIALITIES = [
  { id: 1, name: "Cardiology", icon: <FaHeartPulse />, description: "Heart Specialist" },
  { id: 2, name: "Orthopedic", icon: <FaBone />, description: "Bone Specialist" },
  { id: 3, name: "Pediatric", icon: <FaBaby />, description: "Child Specialist" },
  { id: 4, name: "Neurology", icon: <FaBrain />, description: "Brain Specialist" },
  { id: 5, name: "General Physician", icon: <FaStethoscope />, description: "General Health" },
  { id: 6, name: "Dermatology", icon: <FaUser />, description: "Skin Specialist" },
  { id: 7, name: "ENT", icon: <FaEarListen />, description: "Ear Nose Throat" },
  { id: 8, name: "Dentist", icon: <FaTooth />, description: "Dental Care" },
  { id: 9, name: "Gynecology", icon: <FaUser />, description: "Women's Health" },
  { id: 10, name: "Psychiatry", icon: <FaBrain />, description: "Mental Health" },
  { id: 11, name: "Ophthalmology", icon: <FaEye />, description: "Eye Specialist" },
  { id: 12, name: "Urology", icon: <FaMicroscope />, description: "Urinary System" },
];

const PROBLEMS = [
  "Fever",
  "Cough & Cold",
  "Headache",
  "Stomach Pain",
  "Body Pain",
  "Skin Issues",
  "Eye Problems",
  "Ear Pain",
  "Dental Pain",
  "Heart Issues",
  "Joint Pain",
  "Mental Health",
  "Women's Health",
  "Child Health",
  "Other",
];

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
];

function AppointmentWizard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);

  const [bookingData, setBookingData] = useState({
    problem: "",
    speciality: "",
    hospital: "",
    hospitalId: "",
    doctor: "",
    doctorId: "",
    date: "",
    time: "",
    paymentMethod: "razorpay",
    consultationFee: 0,
  });

  const steps = [
    { id: 1, title: "Choose Problem", icon: <FaStethoscope /> },
    { id: 2, title: "Select Department", icon: <FaHeartPulse /> },
    { id: 3, title: "Select Hospital", icon: <FaHospital /> },
    { id: 4, title: "Select Doctor", icon: <FaUserDoctor /> },
    { id: 5, title: "Select Date", icon: <FaCalendarDays /> },
    { id: 6, title: "Select Time", icon: <FaClock /> },
    { id: 7, title: "Payment", icon: <FaCreditCard /> },
    { id: 8, title: "Confirmation", icon: <FaCircleCheck /> },
  ];

  useEffect(() => {
    setHospitals(bloodBankDatabase);
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await fetch('https://hospital-resource-and-blood-bank.onrender.com/api/doctors');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProblemSelect = (problem) => {
    setBookingData({ ...bookingData, problem });
    handleNext();
  };

  const handleSpecialitySelect = (speciality) => {
    setBookingData({ ...bookingData, speciality: speciality.name });
    handleNext();
  };

  const handleHospitalSelect = (hospital) => {
    setBookingData({
      ...bookingData,
      hospital: hospital.name,
      hospitalId: hospital.id,
    });
    handleNext();
  };

  const handleDoctorSelect = (doctor) => {
    setBookingData({
      ...bookingData,
      doctor: doctor.name,
      doctorId: doctor._id,
      consultationFee: doctor.consultationFee || 500,
    });
    handleNext();
  };

  const handleDateSelect = (date) => {
    setBookingData({ ...bookingData, date });
    handleNext();
  };

  const handleTimeSelect = (time) => {
    setBookingData({ ...bookingData, time });
    handleNext();
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = async () => {
        const options = {
          key: "rzp_test_YOUR_KEY_ID", // Replace with your Razorpay key
          amount: bookingData.consultationFee * 100, // Amount in paisa
          currency: "INR",
          name: "HemoCare",
          description: `Consultation with ${bookingData.doctor}`,
          image: "https://your-logo-url.com/logo.png",
          handler: async function (response) {
            // Payment successful
            await createAppointment(response);
          },
          prefill: {
            name: user?.fullName || "",
            email: user?.emailAddresses?.[0]?.emailAddress || "",
            contact: "",
          },
          theme: {
            color: RED,
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        alert("Failed to load payment gateway. Please try again.");
        setLoading(false);
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Payment error:', error);
      alert("Payment failed. Please try again.");
      setLoading(false);
    }
  };

  const createAppointment = async (paymentResponse) => {
    try {
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const appointmentData = {
        patientId: user.id,
        patientName: user?.fullName || "Patient",
        patientEmail: email || "",
        hospitalId: bookingData.hospitalId,
        hospitalName: bookingData.hospital,
        doctorId: bookingData.doctorId,
        doctorName: bookingData.doctor,
        department: bookingData.speciality,
        speciality: bookingData.speciality,
        appointmentDate: bookingData.date,
        appointmentTime: bookingData.time,
        reason: bookingData.problem,
        symptoms: bookingData.problem,
        priority: "Normal",
        status: "Confirmed",
        paymentId: paymentResponse.razorpay_payment_id,
        paymentStatus: "Paid",
        amount: bookingData.consultationFee,
      };

      const response = await fetch('https://hospital-resource-and-blood-bank.onrender.com/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const data = await response.json();
        setAppointmentId(data.appointmentNumber || data._id);
        setPaymentSuccess(true);
        setCurrentStep(8);
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert("Failed to create appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderProblemSelection();
      case 2:
        return renderSpecialitySelection();
      case 3:
        return renderHospitalSelection();
      case 4:
        return renderDoctorSelection();
      case 5:
        return renderDateSelection();
      case 6:
        return renderTimeSelection();
      case 7:
        return renderPayment();
      case 8:
        return renderConfirmation();
      default:
        return renderProblemSelection();
    }
  };

  const renderProblemSelection = () => (
    <div style={{ padding: "20px" }}>
      <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, marginBottom: "20px" }}>
        What are you experiencing?
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
        {PROBLEMS.map((problem) => (
          <div
            key={problem}
            onClick={() => handleProblemSelect(problem)}
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: `2px solid ${BORDER}`,
              background: WHITE,
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s",
              fontWeight: 500,
              color: NAVY2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = RED;
              e.currentTarget.style.background = `${RED}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = BORDER;
              e.currentTarget.style.background = WHITE;
            }}
          >
            {problem}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSpecialitySelection = () => (
    <div style={{ padding: "20px" }}>
      <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, marginBottom: "20px" }}>
        Select Department
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        {SPECIALITIES.map((speciality) => (
          <div
            key={speciality.id}
            onClick={() => handleSpecialitySelect(speciality)}
            style={{
              padding: "20px",
              borderRadius: "12px",
              border: `2px solid ${BORDER}`,
              background: WHITE,
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = RED;
              e.currentTarget.style.background = `${RED}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = BORDER;
              e.currentTarget.style.background = WHITE;
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "12px", color: RED }}>
              {speciality.icon}
            </div>
            <div style={{ fontWeight: 600, color: NAVY2, marginBottom: "4px" }}>
              {speciality.name}
            </div>
            <div style={{ fontSize: "0.85rem", color: SLATE_L }}>
              {speciality.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHospitalSelection = () => (
    <div style={{ padding: "20px" }}>
      <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, marginBottom: "20px" }}>
        Select Hospital
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {hospitals.map((hospital) => (
          <div
            key={hospital.id}
            onClick={() => handleHospitalSelect(hospital)}
            style={{
              padding: "20px",
              borderRadius: "12px",
              border: `2px solid ${BORDER}`,
              background: WHITE,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = RED;
              e.currentTarget.style.background = `${RED}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = BORDER;
              e.currentTarget.style.background = WHITE;
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: 48, height: 48, borderRadius: "10px", background: `${RED}15`, display: "flex", alignItems: "center", justifyContent: "center", color: RED, fontSize: "1.2rem" }}>
                <FaHospital />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: NAVY2, fontSize: "1rem" }}>
                  {hospital.name}
                </div>
                <div style={{ fontSize: "0.85rem", color: SLATE_L }}>
                  {hospital.city}, {hospital.state}
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.85rem", color: SLATE_L }}>
              {hospital.address}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDoctorSelection = () => {
    const filteredDoctors = doctors.filter(
      (d) => d.specialization === bookingData.speciality || d.hospital === bookingData.hospital
    );

    return (
      <div style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, marginBottom: "20px" }}>
          Select Doctor
        </h3>
        {filteredDoctors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: SLATE_L }}>
            No doctors available for this selection. Please go back and choose different options.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                onClick={() => handleDoctorSelect(doctor)}
                style={{
                  padding: "20px",
                  borderRadius: "12px",
                  border: `2px solid ${BORDER}`,
                  background: WHITE,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = RED;
                  e.currentTarget.style.background = `${RED}08`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.background = WHITE;
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${RED}15`, display: "flex", alignItems: "center", justifyContent: "center", color: RED, fontSize: "1.2rem" }}>
                    <FaUserDoctor />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: NAVY2, fontSize: "1rem" }}>
                      Dr. {doctor.name}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: SLATE_L }}>
                      {doctor.specialization}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: SLATE_L }}>
                    {doctor.hospital}
                  </span>
                  <span style={{ fontWeight: 600, color: RED }}>
                    ₹{doctor.consultationFee || 500}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDateSelection = () => {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return (
      <div style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, marginBottom: "20px" }}>
          Select Date
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
          {dates.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

            return (
              <div
                key={dateStr}
                onClick={() => handleDateSelect(dateStr)}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: `2px solid ${BORDER}`,
                  background: WHITE,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = RED;
                  e.currentTarget.style.background = `${RED}08`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.background = WHITE;
                }}
              >
                <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: "4px" }}>
                  {dayName}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2 }}>
                  {dayNum}
                </div>
                <div style={{ fontSize: "0.85rem", color: SLATE_L }}>
                  {monthName}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTimeSelection = () => (
    <div style={{ padding: "20px" }}>
      <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, marginBottom: "20px" }}>
        Select Time
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
        {TIME_SLOTS.map((time) => (
          <div
            key={time}
            onClick={() => handleTimeSelect(time)}
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: `2px solid ${BORDER}`,
              background: WHITE,
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s",
              fontWeight: 500,
              color: NAVY2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = RED;
              e.currentTarget.style.background = `${RED}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = BORDER;
              e.currentTarget.style.background = WHITE;
            }}
          >
            {time}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPayment = () => (
    <div style={{ padding: "20px" }}>
      <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2, marginBottom: "20px" }}>
        Payment Details
      </h3>
      <div style={{ background: WHITE, borderRadius: "12px", padding: "24px", border: `1px solid ${BORDER}` }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "0.9rem", color: SLATE_L, marginBottom: "8px" }}>
            Consultation Fee
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: NAVY2 }}>
            ₹{bookingData.consultationFee}
          </div>
        </div>

        <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: "0.9rem", color: SLATE_L, marginBottom: "12px" }}>
            Booking Summary
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: SLATE }}>Doctor</span>
            <span style={{ color: NAVY2, fontWeight: 500 }}>Dr. {bookingData.doctor}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: SLATE }}>Hospital</span>
            <span style={{ color: NAVY2, fontWeight: 500 }}>{bookingData.hospital}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: SLATE }}>Date</span>
            <span style={{ color: NAVY2, fontWeight: 500 }}>{bookingData.date}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: SLATE }}>Time</span>
            <span style={{ color: NAVY2, fontWeight: 500 }}>{bookingData.time}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "10px",
            background: loading ? SLATE : RED,
            color: WHITE,
            border: "none",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "all 0.2s",
          }}
        >
          {loading ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaCreditCard />}
          {loading ? "Processing..." : `Pay ₹${bookingData.consultationFee}`}
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${RED}15`, display: "flex", alignItems: "center", justifyContent: "center", color: RED, fontSize: "2.5rem", margin: "0 auto 24px" }}>
        <FaCircleCheck />
      </div>
      <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: NAVY2, marginBottom: "12px" }}>
        Appointment Confirmed!
      </h2>
      <p style={{ fontSize: "1rem", color: SLATE_L, marginBottom: "32px" }}>
        Your appointment has been successfully booked.
      </p>
      <div style={{ background: WHITE, borderRadius: "12px", padding: "24px", border: `1px solid ${BORDER}`, textAlign: "left", marginBottom: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "0.85rem", color: SLATE_L }}>Appointment ID</span>
          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: NAVY2 }}>
            {appointmentId}
          </div>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "0.85rem", color: SLATE_L }}>Doctor</span>
          <div style={{ fontSize: "1rem", color: NAVY2 }}>Dr. {bookingData.doctor}</div>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "0.85rem", color: SLATE_L }}>Hospital</span>
          <div style={{ fontSize: "1rem", color: NAVY2 }}>{bookingData.hospital}</div>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "0.85rem", color: SLATE_L }}>Date & Time</span>
          <div style={{ fontSize: "1rem", color: NAVY2 }}>
            {bookingData.date} at {bookingData.time}
          </div>
        </div>
        <div>
          <span style={{ fontSize: "0.85rem", color: SLATE_L }}>Amount Paid</span>
          <div style={{ fontSize: "1rem", color: NAVY2, fontWeight: 600 }}>
            ₹{bookingData.consultationFee}
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate('/my-appointments')}
        style={{
          padding: "16px 32px",
          borderRadius: "10px",
          background: RED,
          color: WHITE,
          border: "none",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        View My Appointments
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily: FONT, background: SMOKE, minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Progress Steps */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            {steps.map((step, index) => (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flex: 1,
                  justifyContent: index === 0 ? "flex-start" : index === steps.length - 1 ? "flex-end" : "center",
                }}
              >
                <div
                  style={{
                    width: currentStep >= step.id ? 36 : 28,
                    height: currentStep >= step.id ? 36 : 28,
                    borderRadius: "50%",
                    background: currentStep >= step.id ? RED : `${BORDER}`,
                    color: currentStep >= step.id ? WHITE : SLATE_L,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: currentStep >= step.id ? "0.9rem" : "0.8rem",
                    fontWeight: 600,
                    transition: "all 0.3s",
                  }}
                >
                  {currentStep > step.id ? <FaCheck /> : step.id}
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: currentStep >= step.id ? 600 : 500,
                    color: currentStep >= step.id ? NAVY2 : SLATE_L,
                    display: currentStep >= step.id ? "block" : "none",
                  }}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div style={{ height: "4px", background: BORDER, borderRadius: "2px", position: "relative" }}>
            <div
              style={{
                height: "100%",
                background: RED,
                borderRadius: "2px",
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div style={{ background: WHITE, borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        {currentStep > 1 && currentStep < 7 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
            <button
              onClick={handleBack}
              style={{
                padding: "12px 24px",
                borderRadius: "10px",
                background: WHITE,
                color: NAVY2,
                border: `1px solid ${BORDER}`,
                fontSize: "1rem",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = SMOKE;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = WHITE;
              }}
            >
              <FaArrowLeft />
              Back
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default AppointmentWizard;