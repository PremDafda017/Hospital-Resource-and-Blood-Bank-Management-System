import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaUserDoctor,
    FaHospital,
    FaCalendar,
    FaDroplet,
    FaFileMedical,
    FaCircleCheck,
    FaCircleExclamation
} from "react-icons/fa6";
import DashboardLayout from "../../../components/DashboardLayout";
import { bloodBankDatabase, doctorDatabase, states, getHospitalsByState, bloodGroups } from "../../../data/hospitalData";

/* Design Tokens matching Dashboard */
const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const RED_DARK = "#8B0000";
const RED_GLOW = "rgba(196,18,48,0.15)";
const SLATE = "#1E293B";
const SLATE_MD = "#334155";
const SLATE_LT = "#64748B";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";
const BORDER = "#E2E8F0";

function AddAppointment() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        patientName: "",
        patientPhone: "",
        bloodGroup: "",
        hospitalId: "",
        doctorId: "",
        date: "",
        time: "",
        type: "Consultation",
        notes: "",
    });

    const [filterState, setFilterState] = useState("All States");

    const filteredDoctors = useMemo(() => {
        if (!formData.hospitalId || formData.hospitalId === "") return doctorDatabase;
        return doctorDatabase.filter(d => d.hospitalId === parseInt(formData.hospitalId));
    }, [formData.hospitalId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        if (!formData.patientName || !formData.patientPhone || !formData.hospitalId || !formData.doctorId || !formData.date || !formData.time) {
            setError("Please fill in all required fields");
            setLoading(false);
            return;
        }

        const hospital = bloodBankDatabase.find(h => h.id === parseInt(formData.hospitalId));
        const doctor = doctorDatabase.find(d => d.id === parseInt(formData.doctorId));

        const newAppointment = {
            id: Date.now(),
            patient: formData.patientName,
            patientPhone: formData.patientPhone,
            bloodGroup: formData.bloodGroup,
            doctorId: parseInt(formData.doctorId),
            hospitalId: parseInt(formData.hospitalId),
            date: formData.date,
            time: formData.time,
            type: formData.type,
            notes: formData.notes,
            status: "Scheduled",
            hospitalName: hospital?.name || "Unknown Hospital",
            doctorName: doctor?.name || "Unknown Doctor"
        };

        const existing = JSON.parse(localStorage.getItem("appointments") || "[]");
        localStorage.setItem("appointments", JSON.stringify([newAppointment, ...existing]));

        await new Promise((r) => setTimeout(r, 500));
        setSuccess(true);
        setLoading(false);
        setTimeout(() => navigate("/appointments"), 1500);
    };

    const appointmentTypes = ["Consultation", "Blood Donation", "Follow-up", "Emergency", "Check-up"];

    return (
        <DashboardLayout activeTab="appointments" title="Schedule Appointment" subtitle="Book a new appointment with hospital and doctor">
            <div style={{ fontFamily:FONT }}>
                {/* Back Button */}
                <button 
                    onClick={() => navigate("/appointments")}
                    style={{
                        display:"inline-flex", alignItems:"center", gap:8,
                        background:"transparent", border:`1px solid ${BORDER}`,
                        color:SLATE_MD, padding:"8px 16px", borderRadius:12,
                        fontFamily:FONT, fontSize:"0.85rem", fontWeight:600,
                        cursor:"pointer", marginBottom:24, transition:"all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.borderColor = RED; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = BORDER; }}
                >
                    <FaArrowLeft /> Back to Appointments
                </button>

                {/* Alerts */}
                {error && (
                    <div style={{
                        display:"flex", alignItems:"center", gap:12, padding:"14px 18px",
                        borderRadius:14, background:"rgba(239,68,68,0.08)",
                        border:"1px solid rgba(239,68,68,0.25)", color:"#EF4444",
                        marginBottom:24, fontSize:"0.9rem"
                    }}>
                        <FaCircleExclamation /><span>{error}</span>
                    </div>
                )}
                {success && (
                    <div style={{
                        display:"flex", alignItems:"center", gap:12, padding:"14px 18px",
                        borderRadius:14, background:"rgba(34,197,94,0.08)",
                        border:"1px solid rgba(34,197,94,0.25)", color:"#22C55E",
                        marginBottom:24, fontSize:"0.9rem"
                    }}>
                        <FaCircleCheck /><span>Appointment scheduled successfully! Redirecting…</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:900 }}>

                    {/* Patient Information */}
                    <div style={{ background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`, padding:28 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                            <FaUserDoctor style={{ fontSize:"1.2rem", color:RED }} />
                            <h2 style={{ fontFamily:FONT, fontWeight:700, fontSize:"1.1rem", color:SLATE, margin:0 }}>Patient Information</h2>
                        </div>
                        <p style={{ fontFamily:FONT, fontSize:"0.85rem", color:SLATE_LT, marginBottom:24 }}>Enter patient details</p>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:16 }}>
                            <div>
                                <label style={{ display:"block", fontFamily:FONT, fontSize:"0.85rem", fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Patient Name *</label>
                                <input 
                                    type="text" 
                                    value={formData.patientName}
                                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                    required
                                    style={{ 
                                        width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${BORDER}`,
                                        fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none",
                                        background:SMOKE, transition:"border-color 0.2s"
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = RED}
                                    onBlur={e => e.currentTarget.style.borderColor = BORDER}
                                    placeholder="Enter patient name"
                                />
                            </div>
                            <div>
                                <label style={{ display:"block", fontFamily:FONT, fontSize:"0.85rem", fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Phone Number *</label>
                                <input 
                                    type="tel" 
                                    value={formData.patientPhone}
                                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                                    required
                                    style={{ 
                                        width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${BORDER}`,
                                        fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none",
                                        background:SMOKE, transition:"border-color 0.2s"
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = RED}
                                    onBlur={e => e.currentTarget.style.borderColor = BORDER}
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div>
                                <label style={{ display:"block", fontFamily:FONT, fontSize:"0.85rem", fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Blood Group</label>
                                <select 
                                    value={formData.bloodGroup}
                                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                    style={{ 
                                        width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${BORDER}`,
                                        fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none",
                                        background:SMOKE, cursor:"pointer"
                                    }}
                                >
                                    <option value="">Select Blood Group</option>
                                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Hospital & Doctor Selection */}
                    <div style={{ background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`, padding:28 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                            <FaHospital style={{ fontSize:"1.2rem", color:RED }} />
                            <h2 style={{ fontFamily:FONT, fontWeight:700, fontSize:"1.1rem", color:SLATE, margin:0 }}>Hospital & Doctor</h2>
                        </div>
                        <p style={{ fontFamily:FONT, fontSize:"0.85rem", color:SLATE_LT, marginBottom:24 }}>Select hospital and attending doctor</p>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:16 }}>
                            <div>
                                <label style={{ display:"block", fontFamily:FONT, fontSize:"0.85rem", fontWeight:600, color:SLATE_MD, marginBottom:8 }}>State</label>
                                <select 
                                    value={filterState}
                                    onChange={(e) => {
                                        setFilterState(e.target.value);
                                        setFormData({ ...formData, hospitalId: "", doctorId: "" });
                                    }}
                                    style={{ 
                                        width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${BORDER}`,
                                        fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none",
                                        background:SMOKE, cursor:"pointer"
                                    }}
                                >
                                    <option value="All States">Select State</option>
                                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display:"block", fontFamily:FONT, fontSize:"0.85rem", fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Hospital *</label>
                                <select 
                                    value={formData.hospitalId}
                                    onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value, doctorId: "" })}
                                    required
                                    disabled={filterState === "All States"}
                                    style={{ 
                                        width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${BORDER}`,
                                        fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none",
                                        background:SMOKE, cursor:"pointer", opacity: filterState === "All States" ? 0.5 : 1
                                    }}
                                >
                                    <option value="">Select Hospital</option>
                                    {filterState !== "All States" && getHospitalsByState(filterState).map(h => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display:"block", fontFamily:FONT, fontSize:"0.85rem", fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Doctor *</label>
                                <select 
                                    value={formData.doctorId}
                                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                    required
                                    disabled={!formData.hospitalId}
                                    style={{ 
                                        width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${BORDER}`,
                                        fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none",
                                        background:SMOKE, cursor:"pointer", opacity: !formData.hospitalId ? 0.5 : 1
                                    }}
                                >
                                    <option value="">Select Doctor</option>
                                    {filteredDoctors.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div style={{ background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`, padding:28 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                            <FaCalendar style={{ fontSize:"1.2rem", color:RED }} />
                            <h2 style={{ fontFamily:FONT, fontWeight:700, fontSize:"1.1rem", color:SLATE, margin:0 }}>Date & Time</h2>
                        </div>
                        <p style={{ fontFamily:FONT, fontSize:"0.85rem", color:SLATE_LT, marginBottom:24 }}>Schedule the appointment slot</p>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:16 }}>
                            <div>
                                <label style={{ display:"block", fontFamily:FONT, fontSize:"0.85rem", fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Date *</label>
                                <input 
                                    type="date" 
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                    style={{ 
                                        width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${BORDER}`,
                                        fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none",
                                        background:SMOKE, transition:"border-color 0.2s"
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = RED}
                                    onBlur={e => e.currentTarget.style.borderColor = BORDER}
                                />
                            </div>
                            <div>
                                <label style={{ display:"block", fontFamily:FONT, fontSize:"0.85rem", fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Time *</label>
                                <input 
                                    type="time" 
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    required
                                    style={{ 
                                        width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${BORDER}`,
                                        fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none",
                                        background:SMOKE, transition:"border-color 0.2s"
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = RED}
                                    onBlur={e => e.currentTarget.style.borderColor = BORDER}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Appointment Details */}
                    <div style={{ background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`, padding:28 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                            <FaFileMedical style={{ fontSize:"1.2rem", color:RED }} />
                            <h2 style={{ fontFamily:FONT, fontWeight:700, fontSize:"1.1rem", color:SLATE, margin:0 }}>Appointment Details</h2>
                        </div>
                        <p style={{ fontFamily:FONT, fontSize:"0.85rem", color:SLATE_LT, marginBottom:24 }}>Type and any additional notes</p>
                        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                            <div>
                                <label style={{ display:"block", fontFamily:FONT, fontSize:"0.85rem", fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Appointment Type *</label>
                                <select 
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    style={{ 
                                        width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${BORDER}`,
                                        fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none",
                                        background:SMOKE, cursor:"pointer"
                                    }}
                                >
                                    {appointmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display:"block", fontFamily:FONT, fontSize:"0.85rem", fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={4}
                                    placeholder="Any additional notes or special requirements…"
                                    style={{ 
                                        width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${BORDER}`,
                                        fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none",
                                        background:SMOKE, resize:"vertical", transition:"border-color 0.2s"
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = RED}
                                    onBlur={e => e.currentTarget.style.borderColor = BORDER}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
                        <button
                            type="button"
                            onClick={() => navigate("/appointments")}
                            disabled={loading}
                            style={{
                                padding:"12px 24px", borderRadius:12, border:`1px solid ${BORDER}`,
                                background:WHITE, color:SLATE, fontFamily:FONT, fontSize:"0.9rem",
                                fontWeight:600, cursor:"pointer", transition:"all 0.2s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.borderColor = RED; }}
                            onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                background:`linear-gradient(135deg,${RED},${RED_DARK})`,
                                color:WHITE, border:"none", borderRadius:12, padding:"12px 24px",
                                fontFamily:FONT, fontSize:"0.9rem", fontWeight:700, cursor:"pointer",
                                boxShadow:`0 4px 16px ${RED_GLOW}`, transition:"all 0.25s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${RED_GLOW}`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 16px ${RED_GLOW}`; }}
                        >
                            {loading ? "Scheduling…" : "Schedule Appointment"}
                        </button>
                    </div>

                </form>
            </div>
        </DashboardLayout>
    );
}

export default AddAppointment;
