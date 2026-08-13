import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserDoctor,
  FaPlus,
  FaMagnifyingGlass,
  FaStethoscope,
  FaEnvelope,
  FaPhone,
  FaStar,
  FaClock,
  FaPencil,
  FaEye,
  FaTrash,
  FaHospital,
  FaFilter
} from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import { doctorDatabase, bloodBankDatabase, states, citiesByState, getHospitalsByState, getDoctorsByHospital } from '../../../data/hospitalData';

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

function Doctors() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterState, setFilterState] = useState('All States');
  const [filterCity, setFilterCity] = useState('All Cities');
  const [filterHospital, setFilterHospital] = useState('All');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    // Load doctors from localStorage first, then merge with database
    const storedDoctors = localStorage.getItem('doctors');
    const localDoctors = storedDoctors ? JSON.parse(storedDoctors) : [];
    
    // Combine local doctors with database doctors
    const allDoctors = [...localDoctors, ...doctorDatabase];
    setDoctors(allDoctors);
  }, []);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const hospital = bloodBankDatabase.find(h => h.id === doctor.hospitalId);
      const hospitalName = hospital ? hospital.name : doctor.hospital || '';
      const hospitalState = hospital ? hospital.state : '';
      const hospitalCity = hospital ? hospital.city : '';
      
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hospitalName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = filterSpecialty === 'all' || doctor.specialization === filterSpecialty;
      const matchesState = filterState === 'All States' || hospitalState === filterState;
      const matchesCity = filterCity === 'All Cities' || hospitalCity === filterCity;
      const matchesHospital = filterHospital === 'All' || doctor.hospitalId === parseInt(filterHospital);
      
      return matchesSearch && matchesSpecialty && matchesState && matchesCity && matchesHospital;
    });
  }, [searchTerm, filterSpecialty, filterState, filterCity, filterHospital, doctors]);

  const specialties = [...new Set(doctors.map(d => d.specialization))];

  const handleDeleteDoctor = (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      const storedDoctors = localStorage.getItem('doctors');
      if (storedDoctors) {
        const localDoctors = JSON.parse(storedDoctors);
        const updatedDoctors = localDoctors.filter(d => d.id !== doctorId);
        localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
        
        // Update state
        const remainingDoctors = updatedDoctors.concat(doctorDatabase);
        setDoctors(remainingDoctors);
      }
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available': return '#16A34A';
      case 'In Surgery': return '#D97706';
      case 'On Leave': return RED;
      default: return SLATE_LT;
    }
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const val = rating || 5.0;
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(val)) {
        stars.push(<FaStar key={i} className="star-filled" style={{ color: '#FBBF24', marginRight: '2px' }} />);
      } else if (i - 0.5 <= val) {
        stars.push(<FaStar key={i} className="star-half" style={{ color: '#FBBF24', marginRight: '2px' }} />);
      } else {
        stars.push(<FaStar key={i} className="star-empty" style={{ color: '#CBD5E1', marginRight: '2px' }} />);
      }
    }
    return stars;
  };

  return (
    <DashboardLayout activeTab="doctors" title="Doctors Console" subtitle="Manage medical staff schedules, rosters, and dossiers">
      <div style={{ fontFamily:FONT }}>
        {/* Page Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <h2 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.5rem', color:SLATE, lineHeight:1.2 }}>Medical Staff Roster</h2>
          <button 
            onClick={() => navigate('/doctors/add')}
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
            <FaPlus /> Add Doctor
          </button>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:12, marginBottom:28, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:SMOKE, border:`1px solid ${BORDER}`, borderRadius:14, padding:'10px 16px', flex:1, minWidth:280 }}>
            <FaMagnifyingGlass style={{ color:SLATE_LT, fontSize:'0.95rem' }} />
            <input
              type="text"
              placeholder="Search doctors, specialization, or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border:'none', background:'transparent', fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', width:'100%' }}
            />
          </div>

          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            style={{
              padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`,
              fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none',
              background:SMOKE, cursor:'pointer'
            }}
          >
            <option value="all">All Specialties</option>
            {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
          </select>

          <select
            value={filterState}
            onChange={(e) => {
              setFilterState(e.target.value);
              setFilterCity('All Cities');
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
              value={filterCity}
              onChange={(e) => {
                setFilterCity(e.target.value);
                setFilterHospital('All');
              }}
              style={{
                padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`,
                fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none',
                background:SMOKE, cursor:'pointer'
              }}
            >
              <option value="All Cities">All Cities</option>
              {citiesByState[filterState]?.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          )}

          {filterState !== 'All States' && filterCity !== 'All Cities' && (
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
              {getHospitalsByState(filterState).filter(h => h.city === filterCity).map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))', gap:20 }}>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map(doctor => {
              const hospital = bloodBankDatabase.find(h => h.id === doctor.hospitalId);
              const hospitalName = hospital ? hospital.name : 'Unknown Hospital';
              const hospitalCity = hospital ? hospital.city : '';
              const hospitalType = hospital ? hospital.type : '';
              
              return (
                <div key={doctor.id} style={{
                  background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`,
                  padding:24, boxShadow:'0 4px 20px rgba(0,0,0,0.06)',
                  transition:'all 0.3s', cursor:'pointer'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
                >
                  {/* Header */}
                  <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:16 }}>
                    {doctor.profileImage ? (
                      <img 
                        src={doctor.profileImage} 
                        alt={doctor.name}
                        style={{ 
                          width:56, height:56, borderRadius:16, 
                          objectFit:'cover', flexShrink:0
                        }}
                      />
                    ) : (
                      <div style={{ 
                        width:56, height:56, borderRadius:16, 
                        background:`linear-gradient(135deg,${RED},${RED_DARK})`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:WHITE, fontWeight:800, fontSize:'1.4rem', flexShrink:0
                      }}>
                        {doctor.name.split(' ').slice(-1)[0]?.charAt(0) || 'D'}
                      </div>
                    )}
                    <div style={{ flex:1 }}>
                      <h3 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.1rem', color:SLATE, lineHeight:1.2, marginBottom:4 }}>{doctor.name}</h3>
                      <div style={{ color:SLATE_LT, fontSize:'0.85rem', fontWeight:500, marginBottom:6 }}>{doctor.specialization}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        {getRatingStars(doctor.rating || 4.8)}
                        <span style={{ color:SLATE_LT, fontSize:'0.8rem' }}>({doctor.rating || 4.8})</span>
                      </div>
                    </div>
                    <div style={{ 
                      padding:'4px 10px', borderRadius:12, fontSize:'0.75rem', fontWeight:700,
                      background:'#16A34A15', color:'#16A34A'
                    }}>
                      {doctor.status || 'Available'}
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
                  <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16, padding:'16px', background:SMOKE, borderRadius:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.85rem', color:SLATE_MD }}>
                      <FaStethoscope style={{ color:RED, fontSize:'0.9rem' }} />
                      <span><strong>{doctor.qualifications || doctor.qualification}</strong></span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.85rem', color:SLATE_MD }}>
                      <FaClock style={{ color:SLATE_LT, fontSize:'0.9rem' }} />
                      <span>{doctor.experience} years experience</span>
                    </div>
                    {doctor.email && (
                      <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.85rem', color:SLATE_MD }}>
                        <FaEnvelope style={{ color:SLATE_LT, fontSize:'0.9rem' }} />
                        <span>{doctor.email}</span>
                      </div>
                    )}
                    <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.85rem', color:SLATE_MD }}>
                      <FaPhone style={{ color:SLATE_LT, fontSize:'0.9rem' }} />
                      <span>{doctor.phone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:8 }}>
                    <button 
                      onClick={() => navigate(`/doctors/${doctor.id}`)}
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
                      onClick={() => navigate(`/doctors/${doctor.id}/edit`)}
                      style={{ 
                        padding:'10px 16px', borderRadius:10, border:`1px solid ${BORDER}`,
                        background:WHITE, color:SLATE, fontFamily:FONT, fontSize:'0.85rem',
                        fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                        justifyContent:'center', gap:6, transition:'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.borderColor = RED; }}
                      onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; }}
                    >
                      <FaPencil />
                    </button>
                    <button 
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      style={{ 
                        padding:'10px 16px', borderRadius:10, border:`1px solid ${BORDER}`,
                        background:WHITE, color:'#EF4444', fontFamily:FONT, fontSize:'0.85rem',
                        fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                        justifyContent:'center', gap:6, transition:'all 0.2s'
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
            <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:16 }}>
              <FaUserDoctor style={{ fontSize:'4rem', color:SLATE_LT }} />
              <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.2rem', color:SLATE }}>No doctors found</h3>
              <p style={{ color:SLATE_LT, fontSize:'0.9rem' }}>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Doctors;