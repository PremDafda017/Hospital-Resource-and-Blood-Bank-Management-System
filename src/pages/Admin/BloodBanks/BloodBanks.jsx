import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBuilding,
  FaPlus,
  FaMagnifyingGlass,
  FaLocationDot,
  FaPhone,
  FaClock,
  FaEye,
  FaPencil,
  FaFilter,
  FaDroplet,
  FaMapLocationDot,
  FaCertificate,
  FaWarehouse
} from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import { StatusPill } from '../../../components/DashboardLayout';
import { bloodBankDatabase, bloodGroups, states, citiesByState, getHospitalsByState, getHospitalsByType } from '../../../data/hospitalData';

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

function BloodBanks() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('All States');
  const [filterCity, setFilterCity] = useState('All Cities');
  const [filterType, setFilterType] = useState('All');

  const filteredBloodBanks = useMemo(() => {
    return bloodBankDatabase.filter(bank => {
      const matchSearch = 
        bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchState = filterState === 'All States' || bank.state === filterState;
      const matchCity = filterCity === 'All Cities' || bank.city === filterCity;
      const matchType = filterType === 'All' || bank.type === filterType;
      return matchSearch && matchState && matchCity && matchType;
    });
  }, [searchTerm, filterState, filterCity, filterType]);

  const handleStateChange = (state) => {
    setFilterState(state);
    setFilterCity('All Cities');
  };

  const getBloodStockSummary = (stock) => {
    const total = Object.values(stock).reduce((sum, val) => sum + val, 0);
    const critical = Object.values(stock).filter(val => val < 10).length;
    return { total, critical };
  };

  const getUtilizationColor = (utilization) => {
    if (utilization > 80) return '#16A34A';
    if (utilization > 50) return '#F59E0B';
    return '#DC2626';
  };

  return (
    <DashboardLayout activeTab="blood-banks" title="Blood Banks" subtitle="National Blood Bank Registry - e-Raktkosh Style">
      <div style={{ fontFamily:FONT }}>
        {/* Page Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div>
            <h2 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.5rem', color:SLATE, lineHeight:1.2 }}>National Blood Bank Registry</h2>
            <p style={{ fontFamily:FONT, fontSize:'0.9rem', color:SLATE_L, marginTop:4 }}>
              {filteredBloodBanks.length} registered blood banks across {states.length} states
            </p>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button 
              onClick={() => navigate('/blood-banks/map')}
              style={{ 
                background:WHITE, border:`1px solid ${BORDER}`, borderRadius:12, padding:'12px 20px',
                fontFamily:FONT, fontSize:'0.9rem', fontWeight:600, cursor:'pointer',
                display:'flex', alignItems:'center', gap:8, color:SLATE,
                transition:'all 0.25s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.borderColor = RED; }}
              onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; }}
            >
              <FaMapLocationDot /> View Map
            </button>
            <button 
              onClick={() => navigate('/blood-banks/add')}
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
              <FaPlus /> Add Blood Bank
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:12, marginBottom:28, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:SMOKE, border:`1px solid ${BORDER}`, borderRadius:14, padding:'10px 16px', flex:1, minWidth:280 }}>
            <FaMagnifyingGlass style={{ color:SLATE_L, fontSize:'0.95rem' }} />
            <input
              type="text"
              placeholder="Search blood banks by name, city, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border:'none', background:'transparent', fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', width:'100%' }}
            />
          </div>
          <select
            value={filterState}
            onChange={(e) => handleStateChange(e.target.value)}
            style={{ padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
          >
            <option value="All States">All States</option>
            {states.map(state => <option key={state} value={state}>{state}</option>)}
          </select>
          {filterState !== 'All States' && (
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              style={{ padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
            >
              <option value="All Cities">All Cities</option>
              {citiesByState[filterState]?.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          )}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
          >
            <option value="All">All Types</option>
            <option value="government">Government</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Statistics Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:28 }}>
          <div style={{ background:WHITE, borderRadius:16, border:`1px solid ${BORDER}`, padding:20, display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:'#E0F2FE', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FaBuilding style={{ color:'#0284C7', fontSize:'1.4rem' }} />
            </div>
            <div>
              <div style={{ fontFamily:FONT, fontSize:'1.5rem', fontWeight:800, color:SLATE }}>{filteredBloodBanks.length}</div>
              <div style={{ fontFamily:FONT, fontSize:'0.8rem', color:SLATE_L }}>Total Blood Banks</div>
            </div>
          </div>
          <div style={{ background:WHITE, borderRadius:16, border:`1px solid ${BORDER}`, padding:20, display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FaDroplet style={{ color:'#16A34A', fontSize:'1.4rem' }} />
            </div>
            <div>
              <div style={{ fontFamily:FONT, fontSize:'1.5rem', fontWeight:800, color:SLATE }}>
                {filteredBloodBanks.reduce((sum, bank) => sum + Object.values(bank.bloodStock).reduce((a, b) => a + b, 0), 0).toLocaleString()}
              </div>
              <div style={{ fontFamily:FONT, fontSize:'0.8rem', color:SLATE_L }}>Total Units</div>
            </div>
          </div>
          <div style={{ background:WHITE, borderRadius:16, border:`1px solid ${BORDER}`, padding:20, display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FaWarehouse style={{ color:'#F59E0B', fontSize:'1.4rem' }} />
            </div>
            <div>
              <div style={{ fontFamily:FONT, fontSize:'1.5rem', fontWeight:800, color:SLATE }}>
                {filteredBloodBanks.reduce((sum, bank) => sum + bank.capacity, 0).toLocaleString()}
              </div>
              <div style={{ fontFamily:FONT, fontSize:'0.8rem', color:SLATE_L }}>Total Capacity</div>
            </div>
          </div>
          <div style={{ background:WHITE, borderRadius:16, border:`1px solid ${BORDER}`, padding:20, display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:'#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FaCertificate style={{ color:'#DC2626', fontSize:'1.4rem' }} />
            </div>
            <div>
              <div style={{ fontFamily:FONT, fontSize:'1.5rem', fontWeight:800, color:SLATE }}>
                {getHospitalsByType('government').length}
              </div>
              <div style={{ fontFamily:FONT, fontSize:'0.8rem', color:SLATE_L }}>Government</div>
            </div>
          </div>
        </div>

        {/* Blood Banks Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(380px,1fr))', gap:20 }}>
          {filteredBloodBanks.length > 0 ? (
            filteredBloodBanks.map(bank => {
              const { total, critical } = getBloodStockSummary(bank.bloodStock);
              const utilization = bank.capacity > 0 ? ((total / bank.capacity) * 100).toFixed(0) : 0;
              
              return (
                <div key={bank.id} style={{
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
                      background:bank.type === 'government' ? '#E0F2FE' : '#F0FDF4',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:bank.type === 'government' ? '#0284C7' : '#16A34A', fontSize:'1.4rem'
                    }}>
                      <FaBuilding />
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <span style={{ 
                        padding:'4px 12px', borderRadius:20, fontSize:'0.75rem', fontWeight:700,
                        background:bank.type === 'government' ? '#E0F2FE' : '#F0FDF4',
                        color:bank.type === 'government' ? '#0284C7' : '#16A34A'
                      }}>
                        {bank.type === 'government' ? 'Govt' : 'Private'}
                      </span>
                      <span style={{ 
                        padding:'4px 10px', borderRadius:8, background:RED, color:WHITE, 
                        fontSize:'0.7rem', fontWeight:700 
                      }}>
                        {bank.licenseNo}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ marginBottom:16 }}>
                    <h3 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.1rem', color:SLATE, lineHeight:1.2, marginBottom:8 }}>{bank.name}</h3>
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.85rem', color:SLATE, marginBottom:4 }}>
                      <FaLocationDot style={{ color:SLATE_L, fontSize:'0.9rem' }} />
                      <span>{bank.address}, {bank.city}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.85rem', color:SLATE }}>
                      <span style={{ color:SLATE_L }}>{bank.state}</span>
                    </div>
                  </div>

                  {/* Stock Summary */}
                  <div style={{ padding:'16px', background:SMOKE, borderRadius:14, marginBottom:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                      <span style={{ fontFamily:FONT, fontSize:'0.8rem', color:SLATE_L }}>Blood Stock</span>
                      <span style={{ fontFamily:FONT, fontSize:'0.85rem', fontWeight:700, color:SLATE }}>{total} units</span>
                    </div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {bloodGroups.slice(0, 4).map(bg => (
                        <span key={bg} style={{ 
                          padding:'4px 8px', borderRadius:6, background:WHITE, 
                          fontSize:'0.75rem', fontWeight:600, color:SLATE,
                          border:`1px solid ${BORDER}`
                        }}>
                          {bg}: {bank.bloodStock[bg] || 0}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Utilization */}
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontFamily:FONT, fontSize:'0.8rem', color:SLATE_L }}>Capacity Utilization</span>
                      <span style={{ fontFamily:FONT, fontSize:'0.85rem', fontWeight:700, color:getUtilizationColor(utilization) }}>{utilization}%</span>
                    </div>
                    <div style={{ height:8, background:'#E2E8F0', borderRadius:4, overflow:'hidden' }}>
                      <div style={{ 
                        height:'100%', width:`${utilization}%`, 
                        background:getUtilizationColor(utilization), 
                        borderRadius:4, transition:'width 0.3s'
                      }} />
                    </div>
                  </div>

                  {/* Contact */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.85rem', color:SLATE, marginBottom:16 }}>
                    <FaPhone style={{ color:SLATE_L, fontSize:'0.9rem' }} />
                    <span>{bank.phone}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:8 }}>
                    <button 
                      onClick={() => navigate(`/blood-banks/${bank.id}`)}
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
                      onClick={() => navigate(`/blood-banks/${bank.id}/edit`)}
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
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:60, color:SLATE_L }}>
              <FaBuilding style={{ fontSize:'3rem', marginBottom:16, opacity:0.5 }} />
              <p style={{ fontSize:'1.1rem', fontWeight:600 }}>No blood banks found</p>
              <p style={{ fontSize:'0.9rem' }}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default BloodBanks;
