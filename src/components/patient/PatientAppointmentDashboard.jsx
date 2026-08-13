import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { generateInvoicePDF, generatePrescriptionPDF } from "../pdf/PDFGenerator";
import {
  FaCalendarDays,
  FaCircleCheck,
  FaCircleXmark,
  FaClock,
  FaFileMedical,
  FaDownload,
  FaEye,
  FaFilter,
  FaMagnifyingGlass,
  FaIndianRupeeSign,
  FaStethoscope,
  FaHospital,
  FaRegCalendar,
  FaUserDoctor,
} from "react-icons/fa6";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const NAVY = "#0F172A";
const NAVY2 = "#1E293B";
const SLATE = "#334155";
const SLATE_L = "#64748B";
const BORDER = "#E2E8F0";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";

function PatientAppointmentDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all"); // all, upcoming, completed, cancelled
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    try {
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/patient/${user.id}?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "upcoming" && appointment.status === "Scheduled") ||
      (filter === "completed" && appointment.status === "Completed") ||
      (filter === "cancelled" && appointment.status === "Cancelled");

    const matchesSearch =
      searchQuery === "" ||
      appointment.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.hospital?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.type?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "#2563EB";
      case "Completed":
        return "#16A34A";
      case "Cancelled":
        return "#DC2626";
      case "Pending":
        return "#F59E0B";
      default:
        return "#64748B";
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleDownloadInvoice = (appointment) => {
    // Generate PDF invoice using jsPDF
    generateInvoicePDF(appointment, user);
  };

  const handleDownloadPrescription = (appointment) => {
    // Generate PDF prescription using jsPDF
    generatePrescriptionPDF(appointment, user);
  };

  const generateInvoicePDF = (appointment) => {
    // This would typically use a PDF library like jsPDF or react-pdf
    // For now, we'll create a simple text-based invoice
    const invoiceContent = `
INVOICE
=======
Appointment ID: ${appointment.id}
Date: ${new Date().toLocaleDateString()}

Patient Information:
-------------------
Name: ${user?.fullName || "Patient"}
Email: ${user?.emailAddresses?.[0]?.emailAddress || ""}

Appointment Details:
-------------------
Doctor: ${appointment.doctor}
Hospital: ${appointment.hospital}
Date: ${appointment.date}
Time: ${appointment.time}
Type: ${appointment.type}

Payment Details:
----------------
Consultation Fee: ₹500
Payment Status: Paid
Payment Method: Online

Total: ₹500

Thank you for choosing HemoCare!
    `;

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${appointment.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePrescriptionPDF = (appointment) => {
    // This would typically use a PDF library
    // For now, we'll create a simple text-based prescription
    const prescriptionContent = `
PRESCRIPTION
============
Appointment ID: ${appointment.id}
Date: ${appointment.date}

Patient Information:
-------------------
Name: ${user?.fullName || "Patient"}

Doctor: ${appointment.doctor}
Hospital: ${appointment.hospital}

Prescription:
------------
${appointment.prescription?.diagnosis || "No diagnosis recorded"}

Medicines:
---------
${appointment.prescription?.medicines?.map(med => `- ${med.name}: ${med.dosage} (${med.duration})`).join('\n') || "No medicines prescribed"}

Notes:
------
${appointment.prescription?.notes || "No additional notes"}

Follow-up Date: ${appointment.followUpDate || "Not scheduled"}

---
This is a computer-generated prescription.
    `;

    const blob = new Blob([prescriptionContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prescription_${appointment.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid #E2E8F0", borderTopColor: RED, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading appointments...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: NAVY2, marginBottom: "8px" }}>
          My Appointments
        </h2>
        <p style={{ fontSize: "1rem", color: SLATE_L }}>
          Manage your appointments and view prescriptions
        </p>
      </div>

      {/* Filters and Search */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ position: "relative" }}>
            <FaMagnifyingGlass style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: SLATE_L }} />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                borderRadius: "10px",
                border: `1px solid ${BORDER}`,
                fontSize: "0.95rem",
                outline: "none",
                fontFamily: FONT,
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {["all", "upcoming", "completed", "cancelled"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: `1px solid ${filter === filterType ? RED : BORDER}`,
                background: filter === filterType ? `${RED}10` : WHITE,
                color: filter === filterType ? RED : SLATE,
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {filterType}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: WHITE,
            borderRadius: "12px",
            border: `1px solid ${BORDER}`,
          }}
        >
          <FaCalendarDays style={{ fontSize: "3rem", color: SLATE_L, marginBottom: "16px" }} />
          <h3 style={{ fontSize: "1.2rem", color: NAVY2, marginBottom: "8px" }}>No appointments found</h3>
          <p style={{ color: SLATE_L, marginBottom: "24px" }}>
            {searchQuery || filter !== "all" ? "Try adjusting your search or filters" : "Book your first appointment to get started"}
          </p>
          {(!searchQuery && filter === "all") && (
            <button
              onClick={() => navigate('/appointments')}
              style={{
                padding: "12px 24px",
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
              Book Appointment
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              style={{
                background: WHITE,
                borderRadius: "12px",
                padding: "20px",
                border: `1px solid ${BORDER}`,
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "12px", background: `${RED}10`, display: "flex", alignItems: "center", justifyContent: "center", color: RED, fontSize: "1.5rem" }}>
                    <FaStethoscope />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: NAVY2, marginBottom: "4px" }}>
                      {appointment.type}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: SLATE_L, fontSize: "0.9rem" }}>
                      <FaUserDoctor />
                      Dr. {appointment.doctor}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: SLATE_L, fontSize: "0.9rem", marginTop: "4px" }}>
                      <FaHospital />
                      {appointment.hospital}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      background: `${getStatusColor(appointment.status)}15`,
                      color: getStatusColor(appointment.status),
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px", paddingBottom: "16px", borderBottom: `1px solid ${BORDER}` }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: SLATE_L, marginBottom: "4px" }}>Date</div>
                  <div style={{ fontSize: "0.95rem", color: NAVY2, fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaRegCalendar />
                    {appointment.date}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: SLATE_L, marginBottom: "4px" }}>Time</div>
                  <div style={{ fontSize: "0.95rem", color: NAVY2, fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaClock />
                    {appointment.time}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: SLATE_L, marginBottom: "4px" }}>Consultation Fee</div>
                  <div style={{ fontSize: "0.95rem", color: NAVY2, fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaIndianRupeeSign />
                    500
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleViewDetails(appointment)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: `${NAVY}10`,
                    color: NAVY,
                    border: "none",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  <FaEye />
                  View Details
                </button>

                {appointment.status === "Completed" && (
                  <>
                    <button
                      onClick={() => handleDownloadPrescription(appointment)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        borderRadius: "8px",
                        background: `${RED}10`,
                        color: RED,
                        border: "none",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.2s",
                      }}
                    >
                      <FaFileMedical />
                      Prescription
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(appointment)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        borderRadius: "8px",
                        background: `${RED}10`,
                        color: RED,
                        border: "none",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.2s",
                      }}
                    >
                      <FaDownload />
                      Invoice
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            style={{
              background: WHITE,
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "32px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: NAVY2 }}>Appointment Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: SLATE_L }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: 64, height: 64, borderRadius: "12px", background: `${RED}10`, display: "flex", alignItems: "center", justifyContent: "center", color: RED, fontSize: "1.8rem" }}>
                  <FaStethoscope />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 600, color: NAVY2 }}>{selectedAppointment.type}</h3>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      background: `${getStatusColor(selectedAppointment.status)}15`,
                      color: getStatusColor(selectedAppointment.status),
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 600, color: NAVY2, marginBottom: "12px" }}>Doctor Information</h4>
              <div style={{ background: SMOKE, borderRadius: "8px", padding: "16px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ color: SLATE_L, fontSize: "0.9rem" }}>Name:</span>
                  <span style={{ color: NAVY2, fontWeight: 500, marginLeft: "8px" }}>Dr. {selectedAppointment.doctor}</span>
                </div>
                <div>
                  <span style={{ color: SLATE_L, fontSize: "0.9rem" }}>Hospital:</span>
                  <span style={{ color: NAVY2, fontWeight: 500, marginLeft: "8px" }}>{selectedAppointment.hospital}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 600, color: NAVY2, marginBottom: "12px" }}>Appointment Schedule</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: SMOKE, borderRadius: "8px", padding: "16px" }}>
                  <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: "4px" }}>Date</div>
                  <div style={{ fontSize: "1rem", color: NAVY2, fontWeight: 500 }}>{selectedAppointment.date}</div>
                </div>
                <div style={{ background: SMOKE, borderRadius: "8px", padding: "16px" }}>
                  <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: "4px" }}>Time</div>
                  <div style={{ fontSize: "1rem", color: NAVY2, fontWeight: 500 }}>{selectedAppointment.time}</div>
                </div>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 600, color: NAVY2, marginBottom: "12px" }}>Notes</h4>
                <div style={{ background: SMOKE, borderRadius: "8px", padding: "16px" }}>
                  <p style={{ color: NAVY2, fontSize: "0.95rem", lineHeight: 1.6 }}>{selectedAppointment.notes}</p>
                </div>
              </div>
            )}

            {selectedAppointment.status === "Completed" && selectedAppointment.prescription && (
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 600, color: NAVY2, marginBottom: "12px" }}>Prescription</h4>
                <div style={{ background: SMOKE, borderRadius: "8px", padding: "16px" }}>
                  {selectedAppointment.prescription.diagnosis && (
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: "4px" }}>Diagnosis</div>
                      <div style={{ color: NAVY2 }}>{selectedAppointment.prescription.diagnosis}</div>
                    </div>
                  )}
                  {selectedAppointment.prescription.medicines && selectedAppointment.prescription.medicines.length > 0 && (
                    <div>
                      <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: "8px" }}>Medicines</div>
                      {selectedAppointment.prescription.medicines.map((med, index) => (
                        <div key={index} style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: index < selectedAppointment.prescription.medicines.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                          <div style={{ fontWeight: 500, color: NAVY2 }}>{med.name}</div>
                          <div style={{ fontSize: "0.85rem", color: SLATE_L }}>{med.dosage} - {med.duration}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: "10px",
                  background: NAVY,
                  color: WHITE,
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Close
              </button>
              {selectedAppointment.status === "Completed" && (
                <button
                  onClick={() => {
                    handleDownloadPrescription(selectedAppointment);
                    handleDownloadInvoice(selectedAppointment);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
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
                  Download All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientAppointmentDashboard;