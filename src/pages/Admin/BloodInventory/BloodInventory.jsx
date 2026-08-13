import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaDroplet,
    FaHeartPulse,
    FaCircleCheck,
    FaMagnifyingGlass,
    FaHospital,
    FaFilter,
    FaArrowRight,
} from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import { BloodBadge } from '../../../components/DashboardLayout';
import { bloodBankDatabase, bloodGroups, states, getHospitalsByState } from '../../../data/hospitalData';

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

const BG_COLOR = { "A+":"#16A34A","A-":"#15803D","B+":"#2563EB","B-":"#1D4ED8","AB+":"#7C3AED","AB-":"#6D28D9","O+":RED,"O-":RED_DK };

// Enhanced emergency requests with hospital integration
const EMERGENCY_REQUESTS = [
    { id: "req-1", patientName: "Rahul Patel", group: "O-", units: 2, hospitalId: 6, hospital: "Apollo Hospital Blood Bank", timeAgo: "2 mins ago", severity: "critical" },
    { id: "req-2", patientName: "Aanya Sharma", group: "AB-", units: 3, hospitalId: 19, hospital: "Apollo Hospital Blood Bank", timeAgo: "15 mins ago", severity: "high" },
    { id: "req-3", patientName: "Vikram Malhotra", group: "A-", units: 2, hospitalId: 13, hospital: "J.J. Hospital Blood Bank", timeAgo: "28 mins ago", severity: "medium" },
    { id: "req-4", patientName: "Priyanka Joshi", group: "B-", units: 1, hospitalId: 27, hospital: "Victoria Hospital Blood Bank", timeAgo: "45 mins ago", severity: "medium" },
];

function BloodInventory() {
    const navigate = useNavigate();

    // Interactive operations states
    const [selectedRequest, setSelectedRequest] = useState(EMERGENCY_REQUESTS[0]);
    const [selectedBloodBank, setSelectedBloodBank] = useState(bloodBankDatabase[0]);
    const [dispatchSuccess, setDispatchSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterState, setFilterState] = useState("All States");

    const filteredBloodBanks = useMemo(() => {
        if (filterState === "All States") return bloodBankDatabase;
        return getHospitalsByState(filterState);
    }, [filterState]);

    const availableBloodBanks = useMemo(() => {
        if (!selectedRequest) return filteredBloodBanks;
        return filteredBloodBanks.filter(bank => 
            (bank.bloodStock[selectedRequest.group] || 0) >= selectedRequest.units
        );
    }, [filteredBloodBanks, selectedRequest]);

    // Calculate local blood stock from all hospitals
    const localBloodStock = useMemo(() => {
        const stock = {};
        bloodGroups.forEach(bg => {
            stock[bg] = bloodBankDatabase.reduce((sum, bank) => sum + (bank.bloodStock[bg] || 0), 0);
        });
        return bloodGroups.map(group => {
            const units = stock[group];
            let status = "good";
            let label = "Available";
            if (units < 10) { status = "critical"; label = "Critical"; }
            else if (units < 50) { status = "low"; label = "Low Stock"; }
            return { group, units, status, label };
        });
    }, []);

    const handleRequestSelect = (req) => {
        setSelectedRequest(req);
        const matchedBank = bloodBankDatabase.find(bank => 
            (bank.bloodStock[req.group] || 0) >= req.units
        ) || bloodBankDatabase[0];
        setSelectedBloodBank(matchedBank);
        setDispatchSuccess(false);
    };

    const handleDispatch = () => {
        setDispatchSuccess(true);
        setTimeout(() => {
            setDispatchSuccess(false);
        }, 4000);
    };

    const filteredStock = localBloodStock.filter(item =>
        item.group.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout activeTab="blood-inventory" title="Blood Inventory Hub" subtitle="Live network coordination console for emergency stock routing">
            <div style={{ fontFamily:FONT }}>
                {/* Page Header with Search and Filter */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
                    <div>
                        <h2 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.5rem', color:SLATE, lineHeight:1.2 }}>National Blood Inventory</h2>
                        <p style={{ fontFamily:FONT, fontSize:'0.85rem', color:SLATE_L, marginTop:4 }}>
                            Real-time stock across {bloodBankDatabase.length} blood banks
                        </p>
                    </div>
                    <div style={{ display:'flex', gap:12 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, background:SMOKE, border:`1px solid ${BORDER}`, borderRadius:14, padding:'10px 16px', flex:1, minWidth:280 }}>
                            <FaMagnifyingGlass style={{ color:SLATE_L, fontSize:'0.95rem' }} />
                            <input
                                type="text"
                                placeholder="Search blood group..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ border:'none', background:'transparent', fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', width:'100%' }}
                            />
                        </div>
                        <select
                            value={filterState}
                            onChange={(e) => setFilterState(e.target.value)}
                            style={{ padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
                        >
                            <option value="All States">All States</option>
                            {states.map(state => <option key={state} value={state}>{state}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:24 }}>
                    {/* LEFT PANEL: Blood Stock Overview */}
                    <div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16, marginBottom:24 }}>
                            {filteredStock.map((item) => (
                                <div key={item.group} style={{
                                    background:WHITE, borderRadius:16, border:`1px solid ${BORDER}`,
                                    padding:20, boxShadow:'0 4px 16px rgba(0,0,0,0.06)',
                                    transition:'all 0.3s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
                                >
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                                        <div style={{ 
                                            width:48, height:48, borderRadius:12, 
                                            background:BG_COLOR[item.group]||RED,
                                            display:'flex', alignItems:'center', justifyContent:'center',
                                            color:WHITE, fontWeight:800, fontSize:'1.1rem',
                                            boxShadow:`0 8px 20px ${(BG_COLOR[item.group]||RED)}40`
                                        }}>
                                            {item.group}
                                        </div>
                                        <div style={{ 
                                            padding:'4px 10px', borderRadius:10, fontSize:'0.7rem', fontWeight:700,
                                            background:item.status === 'critical' ? `${RED}15` : item.status === 'low' ? '#D9770615' : '#16A34A15',
                                            color:item.status === 'critical' ? RED : item.status === 'low' ? '#D97706' : '#16A34A'
                                        }}>
                                            {item.label}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom:8 }}>
                                        <h3 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.8rem', color:SLATE, lineHeight:1 }}>{item.units}</h3>
                                        <span style={{ fontFamily:FONT, fontSize:'0.8rem', color:SLATE_L }}>Units</span>
                                    </div>
                                    <div style={{ height:6, background:SMOKE, borderRadius:3, overflow:'hidden' }}>
                                        <div style={{ 
                                            height:'100%', 
                                            background:BG_COLOR[item.group]||RED, 
                                            width:`${Math.min((item.units/250)*100,100)}%`,
                                            borderRadius:3
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Stock Button */}
                        <button 
                            onClick={() => navigate('/blood-inventory/add')}
                            style={{ 
                                width:'100%', padding:'16px', borderRadius:16, border:'none',
                                background:`linear-gradient(135deg,${RED},${RED_DK})`,
                                color:WHITE, fontFamily:FONT, fontSize:'1rem', fontWeight:700,
                                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                                gap:10, boxShadow:`0 4px 16px ${RED_GL}`, transition:'all 0.3s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${RED_GL}`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${RED_GL}`; }}
                        >
                            <FaDroplet /> Add Blood Stock
                        </button>
                    </div>

                    {/* RIGHT PANEL: Emergency Dispatch */}
                    <div>
                        <div style={{ background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`, padding:24, boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                                <div style={{ 
                                    width:48, height:48, borderRadius:12, 
                                    background:`${RED}15`, display:'flex', alignItems:'center', justifyContent:'center',
                                    color:RED, fontSize:'1.3rem'
                                }}>
                                    <FaHeartPulse />
                                </div>
                                <div>
                                    <h3 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.1rem', color:SLATE, marginBottom:2 }}>Emergency Dispatch</h3>
                                    <p style={{ fontFamily:FONT, fontSize:'0.85rem', color:SLATE_L }}>Critical blood request coordination</p>
                                </div>
                            </div>

                            {/* Emergency Requests List */}
                            <div style={{ marginBottom:20 }}>
                                <h4 style={{ fontFamily:FONT, fontWeight:700, fontSize:'0.9rem', color:SLATE, marginBottom:12 }}>Active Requests</h4>
                                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                    {EMERGENCY_REQUESTS.map((req) => (
                                        <div 
                                            key={req.id}
                                            onClick={() => handleRequestSelect(req)}
                                            style={{
                                                padding:'12px 16px', borderRadius:12, border:`1px solid ${BORDER}`,
                                                background:selectedRequest.id === req.id ? `${RED}08` : SMOKE,
                                                cursor:'pointer', transition:'all 0.2s',
                                                display:'flex', alignItems:'center', gap:12
                                            }}
                                            onMouseEnter={e => { if(selectedRequest.id !== req.id) e.currentTarget.style.background = BORDER; }}
                                            onMouseLeave={e => { if(selectedRequest.id !== req.id) e.currentTarget.style.background = SMOKE; }}
                                        >
                                            <BloodBadge group={req.group} />
                                            <div style={{ flex:1 }}>
                                                <div style={{ fontFamily:FONT, fontWeight:600, fontSize:'0.9rem', color:SLATE }}>{req.patientName}</div>
                                                <div style={{ fontFamily:FONT, fontSize:'0.8rem', color:SLATE_L }}>{req.hospital} • {req.timeAgo}</div>
                                            </div>
                                            <div style={{ 
                                                padding:'4px 8px', borderRadius:8, fontSize:'0.7rem', fontWeight:700,
                                                background:req.severity === 'critical' ? `${RED}15` : req.severity === 'high' ? '#D9770615' : '#16A34A15',
                                                color:req.severity === 'critical' ? RED : req.severity === 'high' ? '#D97706' : '#16A34A'
                                            }}>
                                                {req.severity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Selected Request Details */}
                            <div style={{ padding:16, background:SMOKE, borderRadius:14, marginBottom:20 }}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                                    <div>
                                        <div style={{ fontFamily:FONT, fontSize:'0.8rem', color:SLATE_L, marginBottom:4 }}>Selected Request</div>
                                        <div style={{ fontFamily:FONT, fontWeight:700, fontSize:'1rem', color:SLATE }}>{selectedRequest.patientName}</div>
                                    </div>
                                    <BloodBadge group={selectedRequest.group} size="lg" />
                                </div>
                                <div style={{ display:'flex', gap:24, fontSize:'0.85rem', color:SLATE }}>
                                    <span><strong>{selectedRequest.units}</strong> units needed</span>
                                    <span>•</span>
                                    <span>{selectedRequest.hospital}</span>
                                </div>
                            </div>

                            {/* Blood Bank Selection */}
                            <div style={{ marginBottom:20 }}>
                                <h4 style={{ fontFamily:FONT, fontWeight:700, fontSize:'0.9rem', color:SLATE, marginBottom:12 }}>
                                    Available Blood Banks ({availableBloodBanks.length})
                                </h4>
                                <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:300, overflowY:'auto' }}>
                                    {availableBloodBanks.length > 0 ? (
                                        availableBloodBanks.map((bank) => (
                                            <div 
                                                key={bank.id}
                                                onClick={() => setSelectedBloodBank(bank)}
                                                style={{
                                                    padding:'12px 16px', borderRadius:12, border:`1px solid ${BORDER}`,
                                                    background:selectedBloodBank.id === bank.id ? `${RED}08` : SMOKE,
                                                    cursor:'pointer', transition:'all 0.2s'
                                                }}
                                                onMouseEnter={e => { if(selectedBloodBank.id !== bank.id) e.currentTarget.style.background = BORDER; }}
                                                onMouseLeave={e => { if(selectedBloodBank.id !== bank.id) e.currentTarget.style.background = SMOKE; }}
                                            >
                                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                                                    <div style={{ fontFamily:FONT, fontWeight:600, fontSize:'0.9rem', color:SLATE }}>{bank.name}</div>
                                                    <div style={{ 
                                                        padding:'4px 8px', borderRadius:8, fontSize:'0.7rem', fontWeight:700,
                                                        background:bank.type === 'government' ? '#E0F2FE' : '#F0FDF4',
                                                        color:bank.type === 'government' ? '#0284C7' : '#16A34A'
                                                    }}>
                                                        {bank.type === 'government' ? 'Govt' : 'Private'}
                                                    </div>
                                                </div>
                                                <div style={{ display:'flex', gap:12, fontSize:'0.8rem', color:SLATE }}>
                                                    <span>{bank.city}, {bank.state}</span>
                                                    <span>•</span>
                                                    <span>{bank.bloodStock[selectedRequest.group] || 0} units {selectedRequest.group}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding:'20px', textAlign:'center', color:SLATE_L }}>
                                            <FaHospital style={{ fontSize:'2rem', marginBottom:8, opacity:0.5 }} />
                                            <p style={{ fontSize:'0.85rem' }}>No blood banks with sufficient stock</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dispatch Button */}
                            {dispatchSuccess ? (
                                <div style={{ 
                                    padding:'16px', borderRadius:12, background:'#DCFCE7', border:'1px solid #16A34A',
                                    display:'flex', alignItems:'center', gap:12, color:'#16A34A'
                                }}>
                                    <FaCircleCheck style={{ fontSize:'1.5rem' }} />
                                    <div>
                                        <div style={{ fontFamily:FONT, fontWeight:700, fontSize:'0.95rem' }}>Dispatch Successful!</div>
                                        <div style={{ fontFamily:FONT, fontSize:'0.85rem' }}>Blood units are on the way to {selectedRequest.hospital}</div>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleDispatch}
                                    style={{ 
                                        width:'100%', padding:'16px', borderRadius:12, border:'none',
                                        background:`linear-gradient(135deg,${RED},${RED_DK})`,
                                        color:WHITE, fontFamily:FONT, fontSize:'1rem', fontWeight:700,
                                        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                                        gap:10, boxShadow:`0 4px 16px ${RED_GL}`, transition:'all 0.3s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${RED_GL}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${RED_GL}`; }}
                                >
                                    <FaHeartPulse /> Dispatch Blood Units
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default BloodInventory;
