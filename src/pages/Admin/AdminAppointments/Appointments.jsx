import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCalendarDays,
    FaPlus,
    FaMagnifyingGlass,
    FaClock,
    FaCircleXmark,
    FaEye,
    FaHospital,
    FaUserDoctor,
    FaFilter,
} from "react-icons/fa6";
import DashboardLayout from '../../../components/DashboardLayout';
import { StatusPill } from '../../../components/DashboardLayout';
import { bloodBankDatabase, doctorDatabase, states, getDoctorsByHospital, getHospitalsByState } from '../../../data/hospitalData';

/* Design Tokens matching Dashboard */
const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const RED_DK = "#8B0000";
const RED_GL = "rgba(196,18,48,0.12)";
const SLATE = "#334155";
const SLATE_L = "#64748B";
const BORDER = "#E2E8F0";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";

// Enhanced appointment data with hospital and doctor integration
const MOCK_APPOINTMENTS = [
    { id: 1, patient: "John Smith", doctorId: 6, hospitalId: 6, date: "2024-01-25", time: "10:00 AM", type: "Check-up", status: "Scheduled", bloodGroup: "A+" },
    { id: 2, patient: "Mary Johnson", doctorId: 9, hospitalId: 8, date: "2024-01-26", time: "2:30 PM", type: "Follow-up", status: "Scheduled", bloodGroup: "B+" },
    { id: 3, patient: "Robert Davis", doctorId: 12, hospitalId: 13, date: "2024-01-27", time: "11:00 AM", type: "Consultation", status: "Completed", bloodGroup: "O+" },
    { id: 4, patient: "Sarah Williams", doctorId: 17, hospitalId: 19, date: "2024-01-28", time: "3:00 PM", type: "Emergency", status: "Scheduled", bloodGroup: "AB+" },
    { id: 5, patient: "Michael Brown", doctorId: 26, hospitalId: 31, date: "2024-01-29", time: "9:30 AM", type: "Check-up", status: "Cancelled", bloodGroup: "A-" },
];

const getTypeColor = (type) => {
    const colors = { "Check-up": "#2563EB", "Follow-up": "#34D399", Consultation: "#A855F7", Emergency: RED };
    return colors[type] || SLATE_L;
};

function Appointments() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [filterState, setFilterState] = useState("all");
    const [filterHospital, setFilterHospital] = useState("all");

    useEffect(() => {
        setTimeout(() => {
            const stored = localStorage.getItem("appointments");
            if (stored) {
                setAppointments(JSON.parse(stored));
            } else {
                localStorage.setItem("appointments", JSON.stringify(MOCK_APPOINTMENTS));
                setAppointments(MOCK_APPOINTMENTS);
            }
            setLoading(false);
        }, 500);
    }, []);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this appointment?")) {
            const updated = appointments.filter((a) => a.id !== id);
            setAppointments(updated);
            localStorage.setItem("appointments", JSON.stringify(updated));
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="appointments" title="Appointments" subtitle="Manage patient appointments and schedules">
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:12 }}>
                    <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${BORDER}`, borderTopColor:RED, animation:'spin 0.9s linear infinite' }} />
                    <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
                    <p style={{ color:SLATE_L, fontWeight:600 }}>Loading appointments...</p>
                </div>
            </DashboardLayout>
        );
    }

    const filteredAppointments = appointments.filter((a) => {
        const doctor = doctorDatabase.find(d => d.id === a.doctorId);
        const hospital = bloodBankDatabase.find(h => h.id === a.hospitalId);
        const doctorName = doctor ? doctor.name : "Unknown Doctor";
        const hospitalName = hospital ? hospital.name : "Unknown Hospital";
        const hospitalState = hospital ? hospital.state : "";
        
        const matchSearch =
            a.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hospitalName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === "all" || a.status === filterStatus;
        const matchType = filterType === "all" || a.type === filterType;
        const matchState = filterState === "all" || hospitalState === filterState;
        const matchHospital = filterHospital === "all" || a.hospitalId === parseInt(filterHospital);
        
        return matchSearch && matchStatus && matchType && matchState && matchHospital;
    });

    const statuses = ["Scheduled", "Completed", "Cancelled"];
    const types = ["Check-up", "Follow-up", "Consultation", "Emergency"];

    return (
        <DashboardLayout activeTab="appointments" title="Appointments" subtitle="Manage patient appointments and schedules">
            <div style={{ fontFamily:FONT }}>
                {/* Page Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
                    <h2 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.5rem', color:SLATE, lineHeight:1.2 }}>Appointments Database</h2>
                    <button 
                        onClick={() => navigate("/appointments/add")}
                        style={{ 
                            background:`linear-gradient(135deg,${RED},${RED_DK})`,
                            color:WHITE, border:'none', borderRadius:12, padding:'12px 24px',
                            fontFamily:FONT, fontSize:'0.9rem', fontWeight:700, cursor:'pointer',
                            display:'flex', alignItems:'center', gap:8,
                            boxShadow:`0 4px 16px ${RED_GL}`,
                            transition:'all 0.25s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${RED_GL}`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${RED_GL}`; }}
                    >
                        <FaPlus /> Schedule New
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display:'flex', gap:12, marginBottom:28, flexWrap:'wrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, background:SMOKE, border:`1px solid ${BORDER}`, borderRadius:14, padding:'10px 16px', flex:1, minWidth:250 }}>
                        <FaMagnifyingGlass style={{ color:SLATE_L, fontSize:'0.95rem' }} />
                        <input
                            type="text"
                            placeholder="Search patient, doctor, or hospital…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border:'none', background:'transparent', fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', width:'100%' }}
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
                    >
                        <option value="all">All Statuses</option>
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
                    >
                        <option value="all">All Types</option>
                        {types.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select
                        value={filterState}
                        onChange={(e) => {
                            setFilterState(e.target.value);
                            setFilterHospital("all");
                        }}
                        style={{ padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
                    >
                        <option value="all">All States</option>
                        {states.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {filterState !== "all" && (
                        <select
                            value={filterHospital}
                            onChange={(e) => setFilterHospital(e.target.value)}
                            style={{ padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
                        >
                            <option value="all">All Hospitals</option>
                            {getHospitalsByState(filterState).map((h) => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Appointments Grid */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(400px,1fr))', gap:20 }}>
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((apt) => {
                            const doctor = doctorDatabase.find(d => d.id === apt.doctorId);
                            const hospital = bloodBankDatabase.find(h => h.id === apt.hospitalId);
                            const doctorName = doctor ? doctor.name : "Unknown Doctor";
                            const doctorSpecialization = doctor ? doctor.specialization : "";
                            const hospitalName = hospital ? hospital.name : "Unknown Hospital";
                            const hospitalCity = hospital ? hospital.city : "";
                            const hospitalType = hospital ? hospital.type : "";
                            
                            return (
                                <div key={apt.id} style={{
                                    background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`,
                                    padding:24, boxShadow:'0 4px 20px rgba(0,0,0,0.06)',
                                    transition:'all 0.3s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.12)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
                                >
                                    {/* Header */}
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                                        <div style={{ 
                                            width:56, height:56, borderRadius:16, 
                                            background:getTypeColor(apt.type),
                                            display:'flex', alignItems:'center', justifyContent:'center',
                                            color:WHITE, fontSize:'1.4rem'
                                        }}>
                                            <FaCalendarDays />
                                        </div>
                                        <StatusPill status={apt.status} />
                                    </div>

                                    {/* Patient Info */}
                                    <div style={{ marginBottom:16 }}>
                                        <h3 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.1rem', color:SLATE, lineHeight:1.2, marginBottom:8 }}>{apt.patient}</h3>
                                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                                            <span style={{ 
                                                padding:'4px 10px', borderRadius:8, background:RED, color:WHITE, 
                                                fontSize:'0.75rem', fontWeight:700 
                                            }}>
                                                {apt.bloodGroup}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Doctor Info */}
                                    <div style={{ padding:'12px 16px', background:SMOKE, borderRadius:14, marginBottom:12 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                                            <FaUserDoctor style={{ color:SLATE_L, fontSize:'1rem' }} />
                                            <div>
                                                <div style={{ fontFamily:FONT, fontSize:'0.85rem', fontWeight:700, color:SLATE }}>{doctorName}</div>
                                                <div style={{ fontFamily:FONT, fontSize:'0.75rem', color:SLATE_L }}>{doctorSpecialization}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hospital Info */}
                                    <div style={{ padding:'12px 16px', background:`${hospitalType === 'government' ? '#E0F2FE' : '#F0FDF4'}`, borderRadius:14, marginBottom:12 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                            <FaHospital style={{ color:SLATE_L, fontSize:'1rem' }} />
                                            <div>
                                                <div style={{ fontFamily:FONT, fontSize:'0.85rem', fontWeight:700, color:SLATE }}>{hospitalName}</div>
                                                <div style={{ fontFamily:FONT, fontSize:'0.75rem', color:SLATE_L }}>{hospitalCity}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date & Time */}
                                    <div style={{ display:'flex', gap:16, fontSize:'0.85rem', color:SLATE, marginBottom:16 }}>
                                        <span style={{ display:'flex', alignItems:'center', gap:6 }}><FaCalendarDays style={{ color:SLATE_L }} /> {apt.date}</span>
                                        <span style={{ display:'flex', alignItems:'center', gap:6 }}><FaClock style={{ color:SLATE_L }} /> {apt.time}</span>
                                    </div>

                                    {/* Type Badge */}
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:SMOKE, borderRadius:14, marginBottom:16 }}>
                                        <span style={{ fontFamily:FONT, fontSize:'0.8rem', color:SLATE_L }}>Type</span>
                                        <span style={{ fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, color:getTypeColor(apt.type) }}>{apt.type}</span>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display:'flex', gap:8 }}>
                                        <button 
                                            onClick={() => navigate(`/appointments/${apt.id}`)}
                                            style={{ 
                                                flex:1, padding:'10px 16px', borderRadius:10, border:`1px solid ${BORDER}`,
                                                background:WHITE, color:SLATE, fontFamily:FONT, fontSize:'0.85rem',
                                                fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                                                justifyContent:'center', gap:6, transition:'all 0.2s'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.borderColor = RED; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; }}
                                        >
                                            <FaEye /> View
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(apt.id)}
                                            style={{ 
                                                padding:'10px 16px', borderRadius:10, border:`1px solid ${BORDER}`,
                                                background:WHITE, color:SLATE, fontFamily:FONT, fontSize:'0.85rem',
                                                fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                                                justifyContent:'center', gap:6, transition:'all 0.2s'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = SLATE; }}
                                        >
                                            <FaCircleXmark />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ gridColumn:'1/-1', textAlign:'center', padding:60, color:SLATE_L }}>
                            <FaCalendarDays style={{ fontSize:'3rem', marginBottom:16, opacity:0.5 }} />
                            <p style={{ fontSize:'1.1rem', fontWeight:600 }}>No appointments found</p>
                            <p style={{ fontSize:'0.9rem' }}>Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Appointments;
