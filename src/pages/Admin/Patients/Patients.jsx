import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaPlus,
  FaMagnifyingGlass,
  FaFilter,
  FaPencil,
  FaEye,
  FaCalendar,
  FaDroplet,
  FaPhone,
  FaEnvelope,
  FaHospital,
  FaTrash
} from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout.jsx';
import { bloodBankDatabase, states, getHospitalsByState } from '../../../data/hospitalData.js';

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

function StatusPill({ status }) {
  const colors = {
    "Active": { bg:"rgba(22,163,74,0.12)", text:"#16A34A" },
    "Discharged": { bg:"rgba(245,158,11,0.12)", text:"#F59E0B" },
    "Deceased": { bg:"rgba(239,68,68,0.12)", text:"#EF4444" },
  };
  const c = colors[status] || { bg:SMOKE, text:SLATE_LT };
  return (
    <span style={{ background:c.bg, color:c.text, fontWeight:700, fontSize:"0.72rem", padding:"4px 10px", borderRadius:12, whiteSpace:"nowrap" }}>
      {status}
    </span>
  );
}

function Patients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterState, setFilterState] = useState('All States');
  const [filterHospital, setFilterHospital] = useState('All');
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Load patients from localStorage first, then merge with database
    const storedPatients = localStorage.getItem('patients');
    const localPatients = storedPatients ? JSON.parse(storedPatients) : [];
    
    // Combine local patients with database patients
    const allPatients = [...localPatients];
    setPatients(allPatients);
  }, []);

  // Mock patients with hospital integration
  const mockPatients = useMemo(() => [
    { id: 1, name: 'John Smith', age: 45, bloodType: 'A+', condition: 'Critical', phone: '555-0101', email: 'john.smith@email.com', admissionDate: '2024-01-15', status: 'Active', hospitalId: 6 },
    { id: 2, name: 'Sarah Johnson', age: 32, bloodType: 'O-', condition: 'Stable', phone: '555-0102', email: 'sarah.j@email.com', admissionDate: '2024-01-18', status: 'Active', hospitalId: 13 },
    { id: 3, name: 'Michael Brown', age: 58, bloodType: 'B+', condition: 'Recovering', phone: '555-0103', email: 'm.brown@email.com', admissionDate: '2024-01-20', status: 'Discharged', hospitalId: 19 },
    { id: 4, name: 'Emily Davis', age: 28, bloodType: 'AB+', condition: 'Critical', phone: '555-0104', email: 'emily.d@email.com', admissionDate: '2024-01-22', status: 'Active', hospitalId: 27 },
    { id: 5, name: 'Robert Wilson', age: 52, bloodType: 'O+', condition: 'Stable', phone: '555-0105', email: 'r.wilson@email.com', admissionDate: '2024-01-23', status: 'Active', hospitalId: 31 },
  ], []);

  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const hospital = bloodBankDatabase.find(h => h.id === patient.hospitalId);
      const hospitalName = hospital ? hospital.name : '';
      const hospitalState = hospital ? hospital.state : '';
      
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hospitalName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
      const matchesState = filterState === 'All States' || hospitalState === filterState;
      const matchesHospital = filterHospital === 'All' || patient.hospitalId === parseInt(filterHospital);
      
      return matchesSearch && matchesStatus && matchesState && matchesHospital;
    });
  }, [searchTerm, filterStatus, filterState, filterHospital, patients]);

  const getConditionColor = (condition) => {
    switch (condition.toLowerCase()) {
      case 'critical': return RED;
      case 'stable': return '#16A34A';
      case 'recovering': return '#F59E0B';
      default: return SLATE_LT;
    }
  };

  const handleDeletePatient = (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      const storedPatients = localStorage.getItem('patients');
      if (storedPatients) {
        const localPatients = JSON.parse(storedPatients);
        const updatedPatients = localPatients.filter(p => p.id !== patientId);
        localStorage.setItem('patients', JSON.stringify(updatedPatients));
        
        // Update state
        setPatients(updatedPatients);
      }
    }
  };

  return (
    <DashboardLayout activeTab="patients" title="Patients Operations" subtitle="Manage clinical logs, admissions, and status updates">
      {/* Header Actions */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <h2 style={{ fontFamily:FONT, fontWeight:800, fontSize:"1.3rem", color:SLATE, marginBottom:4 }}>Clinical Patient Registry</h2>
          <p style={{ color:SLATE_LT, fontSize:"0.85rem" }}>{filteredPatients.length} patients in system</p>
        </div>
        <button 
          onClick={() => navigate('/patients/add')}
          style={{
            background:RED, color:WHITE, border:"none", borderRadius:12,
            padding:"12px 24px", fontFamily:FONT, fontSize:"0.9rem", fontWeight:700,
            cursor:"pointer", display:"flex", alignItems:"center", gap:10,
            transition:"all 0.25s", boxShadow:`0 4px 14px ${RED_GLOW}`
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${RED_GLOW}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 14px ${RED_GLOW}`; }}
        >
          <FaPlus /> Add Patient
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, background:SMOKE, border:`1px solid ${BORDER}`, borderRadius:14, padding:"10px 16px", flex:1, minWidth:280 }}>
          <FaMagnifyingGlass style={{ color:SLATE_LT, fontSize:"0.95rem" }}/>
          <input
            type="text"
            placeholder="Search patients, email, or hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border:"none", background:"transparent", fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none", width:"100%" }}
          />
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10, background:SMOKE, border:`1px solid ${BORDER}`, borderRadius:14, padding:"10px 16px" }}>
          <FaFilter style={{ color:SLATE_LT, fontSize:"0.95rem" }}/>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ border:"none", background:"transparent", fontFamily:FONT, fontSize:"0.9rem", color:SLATE, outline:"none", cursor:"pointer" }}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Discharged">Discharged</option>
            <option value="Deceased">Deceased</option>
          </select>
        </div>

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

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(360px,1fr))", gap:20 }}>
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => {
            const hospital = bloodBankDatabase.find(h => h.id === patient.hospitalId);
            const hospitalName = hospital ? hospital.name : 'Unknown Hospital';
            const hospitalCity = hospital ? hospital.city : '';
            
            return (
              <div key={patient.id} style={{
                background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`,
                padding:"24px", boxShadow:"0 4px 20px rgba(0,0,0,0.06)",
                transition:"all 0.3s", cursor:"pointer"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}
              >
                {/* Header */}
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
                  {patient.profileImage ? (
                    <img 
                      src={patient.profileImage} 
                      alt={patient.name}
                      style={{ 
                        width:52, height:52, borderRadius:14, 
                        objectFit:'cover', flexShrink:0
                      }}
                    />
                  ) : (
                    <div style={{ 
                      width:52, height:52, borderRadius:14, 
                      background:`linear-gradient(135deg,${RED},${RED_DARK})`, 
                      display:"flex", alignItems:"center", justifyContent:"center", 
                      color:WHITE, fontWeight:800, fontSize:"1.2rem" 
                    }}>
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontFamily:FONT, fontWeight:800, fontSize:"1.05rem", color:SLATE, marginBottom:6 }}>{patient.name}</h3>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      <StatusPill status={patient.status} />
                      <span style={{ color:getConditionColor(patient.condition), fontWeight:700, fontSize:"0.72rem", padding:"4px 10px", borderRadius:12, background:`rgba(${parseInt(getConditionColor(patient.condition).slice(1,3),16)},${parseInt(getConditionColor(patient.condition).slice(3,5),16)},${parseInt(getConditionColor(patient.condition).slice(5,7),16)},0.12)` }}>
                        {patient.condition}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hospital Info */}
                <div style={{ padding:'12px 16px', background:SMOKE, borderRadius:14, marginBottom:18 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <FaHospital style={{ color:SLATE_LT, fontSize:'1rem' }} />
                    <div>
                      <div style={{ fontFamily:FONT, fontSize:'0.85rem', fontWeight:700, color:SLATE }}>{hospitalName}</div>
                      <div style={{ fontFamily:FONT, fontSize:'0.75rem', color:SLATE_LT }}>{hospitalCity}</div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, color:SLATE_LT, fontSize:"0.85rem" }}>
                    <FaDroplet style={{ color:SLATE_MD }}/>
                    <span>Blood Type: <strong style={{ color:SLATE }}>{patient.bloodType}</strong></span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, color:SLATE_LT, fontSize:"0.85rem" }}>
                    <FaCalendar style={{ color:SLATE_MD }}/>
                    <span>Age: <strong style={{ color:SLATE }}>{patient.age}</strong></span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, color:SLATE_LT, fontSize:"0.85rem" }}>
                    <FaPhone style={{ color:SLATE_MD }}/>
                    <span>{patient.phone}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, color:SLATE_LT, fontSize:"0.85rem" }}>
                    <FaEnvelope style={{ color:SLATE_MD }}/>
                    <span>{patient.email}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, color:SLATE_LT, fontSize:"0.85rem" }}>
                    <FaCalendar style={{ color:SLATE_MD }}/>
                    <span>Admitted: {patient.admissionDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:10, paddingTop:16, borderTop:`1px solid ${BORDER}` }}>
                  <button 
                    onClick={() => navigate(`/patients/${patient.id}`)}
                    style={{
                      flex:1, background:SMOKE, color:SLATE, border:`1px solid ${BORDER}`, borderRadius:10,
                      padding:"10px 16px", fontFamily:FONT, fontSize:"0.85rem", fontWeight:600,
                      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                      transition:"all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = BORDER; }}
                    onMouseLeave={e => { e.currentTarget.style.background = SMOKE; }}
                  >
                    <FaEye /> View
                  </button>
                  <button 
                    onClick={() => navigate(`/patients/${patient.id}/edit`)}
                    style={{
                      flex:1, background:SMOKE, color:SLATE, border:`1px solid ${BORDER}`, borderRadius:10,
                      padding:"10px 16px", fontFamily:FONT, fontSize:"0.85rem", fontWeight:600,
                      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                      transition:"all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = BORDER; }}
                    onMouseLeave={e => { e.currentTarget.style.background = SMOKE; }}
                  >
                    <FaPencil /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeletePatient(patient.id)}
                    style={{
                      padding:"10px 16px", borderRadius:10, border:`1px solid ${BORDER}`,
                      background:WHITE, color:'#EF4444', fontFamily:FONT, fontSize:"0.85rem",
                      fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center",
                      justifyContent:"center", gap:6, transition:"all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.borderColor = '#EF4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn:"1 / -1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, gap:16 }}>
            <div style={{ width:80, height:80, borderRadius:20, background:SMOKE, display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_LT, fontSize:"2.5rem" }}>
              <FaUsers />
            </div>
            <h3 style={{ fontFamily:FONT, fontWeight:800, fontSize:"1.2rem", color:SLATE }}>No patients found</h3>
            <p style={{ color:SLATE_LT, fontSize:"0.9rem" }}>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Patients;