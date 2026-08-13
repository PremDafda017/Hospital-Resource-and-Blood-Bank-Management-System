import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHandHoldingMedical,
  FaPlus,
  FaMagnifyingGlass,
  FaDroplet,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaPencil,
  FaEye,
  FaTrash,
  FaHospital,
  FaFilter
} from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import { bloodBankDatabase, bloodGroups, states, getHospitalsByState } from '../../../data/hospitalData';

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

const BG_COLOR = { "A+":"#16A34A","A-":"#15803D","B+":"#2563EB","B-":"#1D4ED8","AB+":"#7C3AED","AB-":"#6D28D9","O+":RED,"O-":RED_DARK };

function Donors() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('all');
  const [filterState, setFilterState] = useState('All States');
  const [filterHospital, setFilterHospital] = useState('All');

  // Mock donors with hospital integration
  const mockDonors = [
    { id: 1, name: 'Robert Davis', bloodType: 'O+', email: 'robert.davis@email.com', phone: '555-0301', dateOfBirth: '1985-08-12', lastDonation: '2024-01-10', totalDonations: 12, status: 'Active', hospitalId: 6 },
    { id: 2, name: 'Lisa Thompson', bloodType: 'A-', email: 'lisa.t@email.com', phone: '555-0302', dateOfBirth: '1990-03-25', lastDonation: '2023-12-15', totalDonations: 8, status: 'Active', hospitalId: 13 },
    { id: 3, name: 'James Wilson', bloodType: 'B+', email: 'j.wilson@email.com', phone: '555-0303', dateOfBirth: '1988-11-08', lastDonation: '2024-01-20', totalDonations: 5, status: 'Active', hospitalId: 19 },
    { id: 4, name: 'Sarah Johnson', bloodType: 'AB+', email: 'sarah.j@email.com', phone: '555-0304', dateOfBirth: '1992-06-18', lastDonation: '2024-01-05', totalDonations: 15, status: 'Active', hospitalId: 27 },
  { id: 5, name: 'Michael Brown', bloodType: 'O-', email: 'm.brown@email.com', phone: '555-0305', dateOfBirth: '1987-09-30', lastDonation: '2023-11-20', totalDonations: 20, status: 'Active', hospitalId: 31 },
  ];

  const filteredDonors = useMemo(() => {
    return mockDonors.filter(donor => {
      const hospital = bloodBankDatabase.find(h => h.id === donor.hospitalId);
      const hospitalName = hospital ? hospital.name : '';
      const hospitalState = hospital ? hospital.state : '';
      
      const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hospitalName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBloodType = filterBloodType === 'all' || donor.bloodType === filterBloodType;
      const matchesState = filterState === 'All States' || hospitalState === filterState;
      const matchesHospital = filterHospital === 'All' || donor.hospitalId === parseInt(filterHospital);
      
      return matchesSearch && matchesBloodType && matchesState && matchesHospital;
    });
  }, [searchTerm, filterBloodType, filterState, filterHospital]);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const getStatusColor = (status) => {
    return status === 'Active' ? '#16A34A' : '#D97706';
  };

  return (
    <DashboardLayout activeTab="donors" title="Donors Registry" subtitle="Manage blood donor registry and donation history logs">
      <div style={{ fontFamily:FONT }}>
        {/* Page Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <h2 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.5rem', color:SLATE, lineHeight:1.2 }}>Registered Donors</h2>
          <button 
            onClick={() => navigate('/donors/add')}
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
            <FaPlus /> Add Donor
          </button>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:12, marginBottom:28, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:SMOKE, border:`1px solid ${BORDER}`, borderRadius:14, padding:'10px 16px', flex:1, minWidth:280 }}>
            <FaMagnifyingGlass style={{ color:SLATE_LT, fontSize:'0.95rem' }} />
            <input
              type="text"
              placeholder="Search donors, email, or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border:'none', background:'transparent', fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', width:'100%' }}
            />
          </div>

          <select
            value={filterBloodType}
            onChange={(e) => setFilterBloodType(e.target.value)}
            style={{
              padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`,
              fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none',
              background:SMOKE, cursor:'pointer'
            }}
          >
            <option value="all">All Blood Types</option>
            {bloodGroups.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
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

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))', gap:20 }}>
          {filteredDonors.length > 0 ? (
            filteredDonors.map(donor => {
              const hospital = bloodBankDatabase.find(h => h.id === donor.hospitalId);
              const hospitalName = hospital ? hospital.name : 'Unknown Hospital';
              const hospitalCity = hospital ? hospital.city : '';
              
              return (
                <div key={donor.id} style={{
                  background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`,
                  padding:24, boxShadow:'0 4px 20px rgba(0,0,0,0.06)',
                  transition:'all 0.3s', cursor:'pointer'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
                >
                  {/* Header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <div style={{ 
                      width:56, height:56, borderRadius:16, 
                      background:BG_COLOR[donor.bloodType]||RED,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:WHITE, fontWeight:800, fontSize:'1.2rem',
                      boxShadow:`0 8px 20px ${(BG_COLOR[donor.bloodType]||RED)}40`
                    }}>
                      {donor.bloodType}
                    </div>
                    <div style={{ 
                      padding:'4px 10px', borderRadius:12, fontSize:'0.75rem', fontWeight:700,
                      background:`${getStatusColor(donor.status)}15`,
                      color:getStatusColor(donor.status)
                    }}>
                      {donor.status}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ marginBottom:16 }}>
                    <h3 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.1rem', color:SLATE, lineHeight:1.2, marginBottom:8 }}>{donor.name}</h3>
                    <div style={{ display:'flex', gap:16, fontSize:'0.85rem', color:SLATE_MD }}>
                      <span style={{ display:'flex', alignItems:'center', gap:6 }}><FaDroplet style={{ color:RED }} /> {donor.totalDonations} donations</span>
                      <span style={{ display:'flex', alignItems:'center', gap:6 }}><FaCalendar style={{ color:SLATE_LT }} /> Last: {donor.lastDonation}</span>
                    </div>
                  </div>

                  {/* Hospital Info */}
                  <div style={{ padding:'12px 16px', background:SMOKE, borderRadius:14, marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <FaHospital style={{ color:SLATE_LT, fontSize:'1rem' }} />
                      <div>
                        <div style={{ fontFamily:FONT, fontSize:'0.85rem', fontWeight:700, color:SLATE }}>{hospitalName}</div>
                        <div style={{ fontFamily:FONT, fontSize:'0.75rem', color:SLATE_LT }}>{hospitalCity}</div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16, padding:'16px', background:SMOKE, borderRadius:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.85rem', color:SLATE_MD }}>
                      <FaEnvelope style={{ color:SLATE_LT, fontSize:'0.9rem' }} />
                      <span>{donor.email}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.85rem', color:SLATE_MD }}>
                      <FaPhone style={{ color:SLATE_LT, fontSize:'0.9rem' }} />
                      <span>{donor.phone}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.85rem', color:SLATE_MD }}>
                      <FaCalendar style={{ color:SLATE_LT, fontSize:'0.9rem' }} />
                      <span>DOB: {donor.dateOfBirth}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:8 }}>
                    <button 
                      onClick={() => navigate(`/donors/${donor.id}`)}
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
                      onClick={() => navigate(`/donors/${donor.id}/edit`)}
                      style={{ 
                        flex:1, padding:'10px 16px', borderRadius:10, border:`1px solid ${BORDER}`,
                        background:WHITE, color:SLATE, fontFamily:FONT, fontSize:'0.85rem',
                        fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                        justifyContent:'center', gap:6, transition:'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.borderColor = RED; }}
                      onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; }}
                    >
                      <FaPencil /> Edit
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:16 }}>
              <FaHandHoldingMedical style={{ fontSize:'4rem', color:SLATE_LT }} />
              <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.2rem', color:SLATE }}>No donors found</h3>
              <p style={{ color:SLATE_LT, fontSize:'0.9rem' }}>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Donors;
