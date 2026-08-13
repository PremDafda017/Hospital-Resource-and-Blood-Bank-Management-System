import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaClipboardList,
    FaFileMedical,
    FaDownload,
    FaEye,
    FaHospital,
    FaChartBar,
    FaDroplet,
    FaUserDoctor
} from "react-icons/fa6";
import DashboardLayout from '../../../components/DashboardLayout';
import { bloodBankDatabase, states, getHospitalsByState } from '../../../data/hospitalData';

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

// Enhanced reports with hospital integration
const MOCK_REPORTS = [
    { id: 1, name: "Blood Inventory Report - Apollo Hospital", type: "blood", date: "2024-01-20", author: "System", size: "2.4 MB", hospitalId: 6, category: "inventory" },
    { id: 2, name: "Patient Statistics Report - J.J. Hospital", type: "patient", date: "2024-01-19", author: "Dr. Johnson", size: "1.8 MB", hospitalId: 13, category: "statistics" },
    { id: 3, name: "Monthly Donation Summary - KEM Hospital", type: "blood", date: "2024-01-18", author: "System", size: "3.1 MB", hospitalId: 19, category: "donation" },
    { id: 4, name: "Doctor Performance Report - Victoria Hospital", type: "patient", date: "2024-01-17", author: "Admin", size: "2.0 MB", hospitalId: 27, category: "performance" },
    { id: 5, name: "Emergency Response Report - AIIMS", type: "blood", date: "2024-01-16", author: "System", size: "1.5 MB", hospitalId: 1, category: "emergency" },
    { id: 6, name: "Quarterly Patient Analysis - All Hospitals", type: "patient", date: "2024-01-15", author: "Admin", size: "4.2 MB", hospitalId: null, category: "analysis" },
    { id: 7, name: "Blood Stock Analysis - Maharashtra", type: "blood", date: "2024-01-14", author: "System", size: "2.8 MB", hospitalId: null, category: "inventory" },
    { id: 8, name: "Donor Registration Report - Gujarat", type: "blood", date: "2024-01-13", author: "Admin", size: "1.9 MB", hospitalId: null, category: "donation" },
];

function Reports() {
    const navigate = useNavigate();
    const [filterType, setFilterType] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterState, setFilterState] = useState("All States");
    const [filterHospital, setFilterHospital] = useState("All");

    const filteredReports = useMemo(() => {
        return MOCK_REPORTS.filter(report => {
            const hospital = report.hospitalId ? bloodBankDatabase.find(h => h.id === report.hospitalId) : null;
            const hospitalState = hospital ? hospital.state : '';
            
            const matchesType = filterType === "all" || report.type === filterType;
            const matchesCategory = filterCategory === "all" || report.category === filterCategory;
            const matchesState = filterState === "All States" || hospitalState === filterState || !report.hospitalId;
            const matchesHospital = filterHospital === "All" || report.hospitalId === parseInt(filterHospital) || !report.hospitalId;
            
            return matchesType && matchesCategory && matchesState && matchesHospital;
        });
    }, [filterType, filterCategory, filterState, filterHospital]);

    const getCategoryIcon = (category) => {
        switch (category) {
            case "inventory": return <FaDroplet />;
            case "statistics": return <FaChartBar />;
            case "donation": return <FaClipboardList />;
            case "performance": return <FaUserDoctor />;
            case "emergency": return <FaHospital />;
            default: return <FaFileMedical />;
        }
    };

    return (
        <DashboardLayout activeTab="reports" title="Reports" subtitle="Generate, view and export system reports">
            <div style={{ fontFamily:FONT }}>
                {/* Page Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
                    <h2 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.5rem', color:SLATE, lineHeight:1.2 }}>Report Database</h2>
                    <button 
                        onClick={() => navigate("/reports/blood")}
                        style={{ 
                            background:`linear-gradient(135deg,${RED},${RED_DARK})`,
                            color:WHITE, border:'none', borderRadius:12, padding:'12px 24px',
                            fontFamily:FONT, fontSize:'0.9rem', fontWeight:700, cursor:'pointer',
                            display:'flex', alignItems:'center', gap:8,
                            boxShadow:`0 4px 16px ${RED_GLOW}`,
                            transition:'all 0.25s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${RED_GLOW}`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${RED_GLOW}`; }}
                    >
                        <FaDownload /> Generate Report
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display:'flex', gap:12, marginBottom:28, flexWrap:'wrap' }}>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
                    >
                        <option value="all">All Types</option>
                        <option value="blood">Blood Reports</option>
                        <option value="patient">Patient Reports</option>
                    </select>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{ padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
                    >
                        <option value="all">All Categories</option>
                        <option value="inventory">Inventory</option>
                        <option value="statistics">Statistics</option>
                        <option value="donation">Donation</option>
                        <option value="performance">Performance</option>
                        <option value="emergency">Emergency</option>
                        <option value="analysis">Analysis</option>
                    </select>

                    <select
                        value={filterState}
                        onChange={(e) => {
                            setFilterState(e.target.value);
                            setFilterHospital('All');
                        }}
                        style={{
                            padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`,
                            fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none',
                            background:SMOKE, cursor:'pointer'
                        }}
                    >
                        <option value="All States">All States</option>
                        {states.map(state => <option key={state} value={state}>{state}</option>)}
                    </select>

                    {filterState !== 'All States' && (
                        <select
                            value={filterHospital}
                            onChange={(e) => setFilterHospital(e.target.value)}
                            style={{
                                padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`,
                                fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none',
                                background:SMOKE, cursor:'pointer'
                            }}
                        >
                            <option value="All">All Hospitals</option>
                            {getHospitalsByState(filterState).map(h => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Reports Grid */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(380px,1fr))', gap:20 }}>
                    {filteredReports.map((report) => {
                        const hospital = report.hospitalId ? bloodBankDatabase.find(h => h.id === report.hospitalId) : null;
                        const hospitalName = hospital ? hospital.name : 'All Hospitals';
                        
                        return (
                            <div key={report.id} style={{
                                background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`,
                                padding:24, boxShadow:'0 4px 20px rgba(0,0,0,0.06)',
                                transition:'all 0.3s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.12)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
                            >
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                                    <div style={{ 
                                        width:56, height:56, borderRadius:16, 
                                        background:report.type === "blood" ? `${RED}15` : '#2563EB15',
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        color:report.type === "blood" ? RED : '#2563EB', fontSize:'1.4rem'
                                    }}>
                                        {getCategoryIcon(report.category)}
                                    </div>
                                    <div style={{ 
                                        padding:'4px 10px', borderRadius:12, fontSize:'0.75rem', fontWeight:700,
                                        background:report.type === "blood" ? `${RED}15` : '#2563EB15',
                                        color:report.type === "blood" ? RED : '#2563EB'
                                    }}>
                                        {report.type === "blood" ? "Blood" : "Patient"}
                                    </div>
                                </div>

                                <div style={{ marginBottom:16 }}>
                                    <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.1rem', color:SLATE, marginBottom:8 }}>{report.name}</h3>
                                    <div style={{ display:'flex', gap:16, fontSize:'0.85rem', color:SLATE_MD }}>
                                        <span>{report.date}</span>
                                        <span>•</span>
                                        <span>{report.author}</span>
                                    </div>
                                </div>

                                {hospital && (
                                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', background:SMOKE, borderRadius:12, marginBottom:16 }}>
                                        <FaHospital style={{ color:SLATE_LT, fontSize:'0.9rem' }} />
                                        <span style={{ fontFamily:FONT, fontSize:'0.85rem', color:SLATE_MD }}>{hospitalName}</span>
                                    </div>
                                )}

                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:SMOKE, borderRadius:12, marginBottom:16 }}>
                                    <span style={{ fontFamily:FONT, fontSize:'0.8rem', color:SLATE_LT }}>Size</span>
                                    <span style={{ fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, color:SLATE }}>{report.size}</span>
                                </div>

                                <div style={{ display:'flex', gap:8 }}>
                                    <button 
                                        onClick={() => report.type === "blood" ? navigate(`/reports/blood/${report.id}`) : navigate(`/reports/patient/${report.id}`)}
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
                                        style={{ 
                                            padding:'10px 16px', borderRadius:10, border:`1px solid ${BORDER}`,
                                            background:WHITE, color:SLATE, fontFamily:FONT, fontSize:'0.85rem',
                                            fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                                            justifyContent:'center', gap:6, transition:'all 0.2s'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.borderColor = RED; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; }}
                                    >
                                        <FaDownload /> Download
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Generate Section */}
                <div style={{ marginTop:32, padding:24, background:WHITE, borderRadius:20, border:`1px solid ${BORDER}` }}>
                    <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.1rem', color:SLATE, marginBottom:16 }}>Quick Generate</h3>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                        <button 
                            onClick={() => navigate("/reports/blood")}
                            style={{ 
                                padding:'14px 20px', borderRadius:12, border:`1px solid ${BORDER}`,
                                background:SMOKE, color:SLATE, fontFamily:FONT, fontSize:'0.9rem',
                                fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                                justifyContent:'center', gap:8, transition:'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = BORDER; }}
                            onMouseLeave={e => { e.currentTarget.style.background = SMOKE; }}
                        >
                            <FaDroplet /> Blood Inventory
                        </button>
                        <button 
                            onClick={() => navigate("/reports/patient")}
                            style={{ 
                                padding:'14px 20px', borderRadius:12, border:`1px solid ${BORDER}`,
                                background:SMOKE, color:SLATE, fontFamily:FONT, fontSize:'0.9rem',
                                fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                                justifyContent:'center', gap:8, transition:'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = BORDER; }}
                            onMouseLeave={e => { e.currentTarget.style.background = SMOKE; }}
                        >
                            <FaFileMedical /> Patient Statistics
                        </button>
                        <button 
                            onClick={() => navigate("/reports/donation")}
                            style={{ 
                                padding:'14px 20px', borderRadius:12, border:`1px solid ${BORDER}`,
                                background:SMOKE, color:SLATE, fontFamily:FONT, fontSize:'0.9rem',
                                fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                                justifyContent:'center', gap:8, transition:'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = BORDER; }}
                            onMouseLeave={e => { e.currentTarget.style.background = SMOKE; }}
                        >
                            <FaClipboardList /> Donation Summary
                        </button>
                        <button 
                            onClick={() => navigate("/reports/emergency")}
                            style={{ 
                                padding:'14px 20px', borderRadius:12, border:`1px solid ${BORDER}`,
                                background:SMOKE, color:SLATE, fontFamily:FONT, fontSize:'0.9rem',
                                fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                                justifyContent:'center', gap:8, transition:'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = BORDER; }}
                            onMouseLeave={e => { e.currentTarget.style.background = SMOKE; }}
                        >
                            <FaHospital /> Emergency Response
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Reports;
