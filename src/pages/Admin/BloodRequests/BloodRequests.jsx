import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeartPulse, FaPlus, FaCalendar, FaUser, FaEye, FaTrash, FaCheck, FaXmark, FaMagnifyingGlass, FaHospital, FaFilter } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import { bloodBankDatabase, states, citiesByState, getHospitalsByState } from '../../../data/hospitalData';

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

function BloodRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [filterState, setFilterState] = useState('All States');
  const [filterCity, setFilterCity] = useState('All Cities');
  const [filterHospital, setFilterHospital] = useState('All');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    try {
      const storedRequests = localStorage.getItem('bloodRequests');

      if (storedRequests) {
        setRequests(JSON.parse(storedRequests));
      } else {
        const mockRequests = [
          { id: 1, bloodType: 'O+', units: 2, patient: 'Prem Dafda', urgency: 'Critical', date: '2024-01-20', status: 'Pending', hospitalId: 6, hospital: 'Safdarjung Hospital', state: 'Delhi', city: 'New Delhi' },
          { id: 2, bloodType: 'A-', units: 1, patient: 'Mary Johnson', urgency: 'High', date: '2024-01-19', status: 'Approved', hospitalId: 13, hospital: 'Apollo Hospital', state: 'Delhi', city: 'New Delhi' },
          { id: 3, bloodType: 'B+', units: 3, patient: 'Rahul Sharma', urgency: 'Normal', date: '2024-01-18', status: 'Pending', hospitalId: 19, hospital: 'Lilavati Hospital', state: 'Maharashtra', city: 'Mumbai' },
          { id: 4, bloodType: 'AB+', units: 2, patient: 'Anita Patel', urgency: 'Critical', date: '2024-01-17', status: 'Rejected', hospitalId: 27, hospital: 'Fortis Hospital', state: 'Maharashtra', city: 'Mumbai' },
        ];
        setRequests(mockRequests);
        localStorage.setItem('bloodRequests', JSON.stringify(mockRequests));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
    }
  };

  const handleUpdateStatus = (id, newStatus) => {
    const updated = requests.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus };
      }
      return req;
    });
    setRequests(updated);
    localStorage.setItem('bloodRequests', JSON.stringify(updated));
  };

  const handleDelete = (id) => {
    const updated = requests.filter(req => req.id !== id);
    setRequests(updated);
    localStorage.setItem('bloodRequests', JSON.stringify(updated));
  };

  const filteredRequests = requests.filter(req => {
    const hospital = bloodBankDatabase.find(h => h.id === req.hospitalId);
    const hospitalName = hospital ? hospital.name : '';
    const hospitalState = hospital ? hospital.state : '';
    const hospitalCity = hospital ? hospital.city : '';
    const reqState = req.state || hospitalState;
    const reqCity = req.city || hospitalCity;
    
    const matchesSearch = req.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospitalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = filterUrgency === 'all' || req.urgency === filterUrgency;
    const matchesState = filterState === 'All States' || reqState === filterState;
    const matchesCity = filterCity === 'All Cities' || reqCity === filterCity;
    const matchesHospital = filterHospital === 'All' || req.hospitalId === parseInt(filterHospital);
    
    return matchesSearch && matchesUrgency && matchesState && matchesCity && matchesHospital;
  });

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'critical': return RED;
      case 'high': return '#D97706';
      default: return '#16A34A';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#16A34A';
      case 'rejected': return RED;
      default: return '#D97706';
    }
  };

  return (
    <DashboardLayout activeTab="blood-requests" title="Blood Requests Console" subtitle="Track and coordinate emergency blood requests, allocations, and approvals">
      <div style={{ fontFamily:FONT }}>
        {/* Page Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <h2 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.5rem', color:SLATE, lineHeight:1.2 }}>Clinical Request Registry</h2>
          <button 
            onClick={() => navigate('/blood-requests/create')}
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
            <FaPlus /> Create Request
          </button>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:12, marginBottom:28, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:SMOKE, border:`1px solid ${BORDER}`, borderRadius:14, padding:'10px 16px', flex:1, minWidth:280 }}>
            <FaMagnifyingGlass style={{ color:SLATE_LT, fontSize:'0.95rem' }} />
            <input
              type="text"
              placeholder="Search by patient or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border:'none', background:'transparent', fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', width:'100%' }}
            />
          </div>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            style={{
              padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`,
              fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none',
              background:SMOKE, cursor:'pointer'
            }}
          >
            <option value="all">All Urgency Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
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

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:12 }}>
            <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${BORDER}`, borderTopColor:RED, animation:'spin 0.9s linear infinite' }} />
            <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
            <p style={{ color:SLATE_LT, fontWeight:600 }}>Loading blood requests...</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))', gap:20 }}>
            {filteredRequests.length > 0 ? (
              filteredRequests.map(req => {
                const hospital = bloodBankDatabase.find(h => h.id === req.hospitalId);
                const hospitalName = hospital ? hospital.name : 'Unknown Hospital';
                const hospitalCity = hospital ? hospital.city : '';
                const hospitalType = hospital ? hospital.type : '';
                
                return (
                  <div key={req.id} style={{
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
                        background:RED, display:'flex', alignItems:'center', justifyContent:'center',
                        color:WHITE, fontWeight:800, fontSize:'1.2rem',
                        boxShadow:`0 8px 20px ${RED_GLOW}`
                      }}>
                        {req.bloodType}
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <div style={{ 
                          padding:'4px 10px', borderRadius:12, fontSize:'0.75rem', fontWeight:700,
                          background:`${getUrgencyColor(req.urgency)}15`,
                          color:getUrgencyColor(req.urgency)
                        }}>
                          {req.urgency}
                        </div>
                        <div style={{ 
                          padding:'4px 10px', borderRadius:12, fontSize:'0.75rem', fontWeight:700,
                          background:`${getStatusColor(req.status)}15`,
                          color:getStatusColor(req.status)
                        }}>
                          {req.status}
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ marginBottom:16 }}>
                      <h3 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.1rem', color:SLATE, lineHeight:1.2, marginBottom:12 }}>{req.units} units requested</h3>
                      <div style={{ display:'flex', flexDirection:'column', gap:8, padding:'16px', background:SMOKE, borderRadius:14 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.85rem', color:SLATE_MD }}>
                          <FaUser style={{ color:SLATE_LT, fontSize:'0.9rem' }} />
                          <span>Patient: <strong>{req.patient}</strong></span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.85rem', color:SLATE_MD }}>
                          <FaHospital style={{ color:SLATE_LT, fontSize:'0.9rem' }} />
                          <span>{hospitalName}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.85rem', color:SLATE_MD }}>
                          <span style={{ color:SLATE_LT }}>{hospitalCity}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.85rem', color:SLATE_MD }}>
                          <FaCalendar style={{ color:SLATE_LT, fontSize:'0.9rem' }} />
                          <span>Date: {req.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', gap:8 }}>
                      <button 
                        onClick={() => navigate(`/blood-requests/${req.id}`)}
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
                      {req.status?.toLowerCase() === 'pending' && (
                        <>
                          <button 
                            title="Approve"
                            onClick={() => handleUpdateStatus(req.id, 'Approved')}
                            style={{ 
                              padding:'10px 16px', borderRadius:10, border:`1px solid #16A34A`,
                              background:`#16A34A10`, color:'#16A34A', fontFamily:FONT, fontSize:'0.85rem',
                              fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                              justifyContent:'center', gap:6, transition:'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#16A34A'; e.currentTarget.style.color = WHITE; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#16A34A10'; e.currentTarget.style.color = '#16A34A'; }}
                          >
                            <FaCheck />
                          </button>
                          <button 
                            title="Reject"
                            onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                            style={{ 
                              padding:'10px 16px', borderRadius:10, border:`1px solid ${RED}`,
                              background:`${RED}10`, color:RED, fontFamily:FONT, fontSize:'0.85rem',
                              fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                              justifyContent:'center', gap:6, transition:'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = WHITE; }}
                            onMouseLeave={e => { e.currentTarget.style.background = `${RED}10`; e.currentTarget.style.color = RED; }}
                          >
                            <FaXmark />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDelete(req.id)}
                        style={{ 
                          padding:'10px 16px', borderRadius:10, border:`1px solid ${RED}`,
                          background:`${RED}10`, color:RED, fontFamily:FONT, fontSize:'0.85rem',
                          fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center',
                          justifyContent:'center', gap:6, transition:'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = WHITE; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${RED}10`; e.currentTarget.style.color = RED; }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:16 }}>
                <FaHeartPulse style={{ fontSize:'4rem', color:SLATE_LT }} />
                <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.2rem', color:SLATE }}>No requests found</h3>
                <p style={{ color:SLATE_LT, fontSize:'0.9rem' }}>Try adjusting your search filters or create a new request</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default BloodRequests;
