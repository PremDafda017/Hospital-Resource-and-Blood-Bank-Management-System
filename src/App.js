import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { BloodBankProvider } from "./contexts/BloodBankContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationPopup from "./components/NotificationPopup";

import HomePage from "./pages/Home/HomePage";
import Login from "./pages/Home/Login";
import Register from "./pages/Home/Register";
import VerifyOTP from "./pages/Home/VerifyOTP";
import PatientDashboard from "./pages/Patient/PatientDashboard";

// Patient Pages
import PatientBloodRequests from "./pages/Patient/PatientBloodRequests";
import PatientReports from "./pages/Patient/PatientReports";
import PatientAppointments from "./pages/Patient/PatientAppointments";
import AppointmentHome from "./pages/Patient/AppointmentHome";
import BookAppointment from "./pages/Patient/BookAppointment";
import MyAppointments from "./pages/Patient/MyAppointments";
import PatientBloodBanks from "./pages/Patient/PatientBloodBanks";
import PatientNotifications from "./pages/Patient/PatientNotifications";
import PatientProfile from "./pages/Patient/PatientProfile";
import AppointmentWizard from "./components/appointment/AppointmentWizard";

// Donor Pages
import DonorDashboard from "./pages/Donor/DonorDashboard";
import DonorProfile from "./pages/Donor/DonorProfile";
import DonorAppointmentManagement from "./pages/Donor/AppointmentManagement";

// Hospital Staff Pages
import HospitalDashboard from "./pages/HospitalStaff/HospitalDashboard";
import HospitalPatients from "./pages/HospitalStaff/HospitalPatients";
import HospitalPatientDetails from "./pages/HospitalStaff/HospitalPatientDetails";
import HospitalDoctors from "./pages/HospitalStaff/HospitalDoctors";
import HospitalAppointments from "./pages/HospitalStaff/HospitalAppointments";
import HospitalBloodRequests from "./pages/HospitalStaff/HospitalBloodRequests";
import HospitalBloodInventory from "./pages/HospitalStaff/HospitalBloodInventory";
import HospitalReports from "./pages/HospitalStaff/HospitalReports";
import HospitalNotifications from "./pages/HospitalStaff/HospitalNotifications";

// Blood Bank Staff Pages
import BloodBankDashboard from "./pages/BloodBankStaff/BloodBankDashboard";
import BloodBankInventory from "./pages/BloodBankStaff/BloodBankInventory";
import BloodBankAddStock from "./pages/BloodBankStaff/BloodBankAddStock";
import BloodBankStockHistory from "./pages/BloodBankStaff/BloodBankStockHistory";
import BloodBankRequests from "./pages/BloodBankStaff/BloodBankRequests";
import DonationRequests from "./pages/BloodBankStaff/DonationRequests";
import CampaignManagement from "./pages/BloodBankStaff/CampaignManagement";
import AppointmentManagement from "./pages/BloodBankStaff/AppointmentManagement";
import BloodBankDonors from "./pages/BloodBankStaff/BloodBankDonors";
import BloodBankDetails from "./pages/BloodBankStaff/BloodBankDetails";
import BloodBankReports from "./pages/BloodBankStaff/BloodBankReports";
import BloodBankNotifications from "./pages/BloodBankStaff/BloodBankNotifications";
import BloodBankProfile from "./pages/BloodBankStaff/BloodBankProfile";

// Admin Pages
import AdminDashboard from "./pages/Admin/Dashboard";

// Premium Clinical Global Loader
const GlobalLoader = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#060B16",
    color: "#F4F7FD",
    fontFamily: "'Inter', sans-serif"
  }}>
    <div style={{
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "20px"
    }}>
      <div style={{
        position: "absolute",
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        border: "3px solid #FB7185",
        opacity: 0.3,
        animation: "pulseRing 1.8s cubic-bezier(0.215, 0.610, 0.355, 1) infinite"
      }} />
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        border: "3px solid transparent",
        borderTopColor: "#FB7185",
        borderRightColor: "#FB7185",
        animation: "spin 1s linear infinite"
      }} />
      <div style={{
        position: "absolute",
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        backgroundColor: "#FB7185",
        boxShadow: "0 0 15px #FB7185"
      }} />
    </div>
    
    <h3 style={{
      fontSize: "15px",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#9AABC9",
      margin: "0 0 8px 0"
    }}>
      HRBMS Secure Console
    </h3>
    <p style={{
      fontSize: "13px",
      color: "#64748B",
      margin: 0
    }}>
      Initializing session authorization...
    </p>

    <style>{`
      @keyframes pulseRing {
        0% { transform: scale(0.65); opacity: 0.8; }
        100% { transform: scale(1.3); opacity: 0; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Protected Route Component (Requires Clerk Sign In)
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <GlobalLoader />;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};



function App() {
  return (
    <BloodBankProvider>
      <NotificationProvider>
        <Router>
          <Routes>
        {/* Default Route - Home Page (Public) */}
        <Route path="/" element={<HomePage />} />

        {/* Login Page (Public) */}
        <Route path="/login" element={<Login />} />

        {/* Register Page (Public) */}
        <Route path="/register" element={<Register />} />

        {/* Verify OTP Page (Public) */}
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Dashboard redirect (Admin was removed, redirect to home) */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        {/* Patient Dashboard */}
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        {/* Patient Pages */}
        <Route
          path="/blood-requests"
          element={
            <ProtectedRoute>
              <PatientBloodRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-reports"
          element={
            <ProtectedRoute>
              <PatientReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <AppointmentHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-appointment"
          element={
            <ProtectedRoute>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-appointment-wizard"
          element={
            <ProtectedRoute>
              <AppointmentWizard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nearby-blood-banks"
          element={
            <ProtectedRoute>
              <PatientBloodBanks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <PatientNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PatientProfile />
            </ProtectedRoute>
          }
        />

        {/* Donor Dashboard */}
        <Route
          path="/donor-dashboard"
          element={
            <ProtectedRoute>
              <DonorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Donor Pages */}
        <Route
          path="/donor-profile"
          element={
            <ProtectedRoute>
              <DonorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/appointments"
          element={
            <ProtectedRoute>
              <DonorAppointmentManagement />
            </ProtectedRoute>
          }
        />

        {/* Hospital Staff Dashboard */}
        <Route
          path="/hospital-dashboard"
          element={
            <ProtectedRoute>
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />

        {/* Hospital Staff Pages */}
        <Route
          path="/hospital-patients"
          element={
            <ProtectedRoute>
              <HospitalPatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-patient-details/:patientId"
          element={
            <ProtectedRoute>
              <HospitalPatientDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-doctors"
          element={
            <ProtectedRoute>
              <HospitalDoctors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-appointments"
          element={
            <ProtectedRoute>
              <HospitalAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-blood-requests"
          element={
            <ProtectedRoute>
              <HospitalBloodRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-blood-inventory"
          element={
            <ProtectedRoute>
              <HospitalBloodInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-reports"
          element={
            <ProtectedRoute>
              <HospitalReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-notifications"
          element={
            <ProtectedRoute>
              <HospitalNotifications />
            </ProtectedRoute>
          }
        />

        {/* Blood Bank Staff Routes */}
        <Route
          path="/bloodbank-dashboard"
          element={
            <ProtectedRoute>
              <BloodBankDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bloodbank-inventory"
          element={
            <ProtectedRoute>
              <BloodBankInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bloodbank-add-stock"
          element={
            <ProtectedRoute>
              <BloodBankAddStock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bloodbank-stock-history"
          element={
            <ProtectedRoute>
              <BloodBankStockHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bloodbank-requests"
          element={
            <ProtectedRoute>
              <BloodBankRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donation-requests"
          element={
            <ProtectedRoute>
              <DonationRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign-management"
          element={
            <ProtectedRoute>
              <CampaignManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointment-management"
          element={
            <ProtectedRoute>
              <AppointmentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bloodbank-donors"
          element={
            <ProtectedRoute>
              <BloodBankDonors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bloodbank-details"
          element={
            <ProtectedRoute>
              <BloodBankDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bloodbank-reports"
          element={
            <ProtectedRoute>
              <BloodBankReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bloodbank-notifications"
          element={
            <ProtectedRoute>
              <BloodBankNotifications />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bloodbank-profile"
          element={
            <ProtectedRoute>
              <BloodBankProfile />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
    <NotificationPopup />
    </NotificationProvider>
    </BloodBankProvider>
  );
}

export default App;