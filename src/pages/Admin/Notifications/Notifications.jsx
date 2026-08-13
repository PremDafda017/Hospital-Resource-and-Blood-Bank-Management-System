import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheckDouble, FaTrash, FaDroplet, FaHospital, FaUserDoctor, FaFilter } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import { bloodBankDatabase, doctorDatabase, bloodGroups } from '../../../data/hospitalData';

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

function Notifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Enhanced notifications with hospital/doctor integration
  const notifications = [
    { id: 1, title: 'Critical Blood Shortage', message: 'Apollo Hospital Blood Bank - O- blood stock critically low (5 units remaining)', time: '2 minutes ago', read: false, type: 'critical', hospitalId: 6, category: 'blood' },
    { id: 2, title: 'New Blood Donation', message: 'J.J. Hospital Blood Bank received 10 units of A+ blood from donor Robert Davis', time: '15 minutes ago', read: false, type: 'success', hospitalId: 13, category: 'blood' },
    { id: 3, title: 'Doctor Availability Update', message: 'Dr. Rajesh Kumar is now available for appointments at Apollo Hospital', time: '30 minutes ago', read: false, type: 'info', hospitalId: 6, doctorId: 1, category: 'doctor' },
    { id: 4, title: 'Emergency Blood Request', message: 'Critical request: 3 units of AB+ needed at Victoria Hospital for emergency surgery', time: '1 hour ago', read: true, type: 'critical', hospitalId: 27, category: 'request' },
    { id: 5, title: 'Blood Bank License Renewal', message: 'AIIMS Blood Bank license expires in 30 days. Please initiate renewal process.', time: '2 hours ago', read: true, type: 'warning', hospitalId: 1, category: 'system' },
    { id: 6, title: 'New Doctor Registration', message: 'Dr. Priya Sharma has been registered at KEM Hospital Blood Bank', time: '3 hours ago', read: true, type: 'success', hospitalId: 19, doctorId: 2, category: 'doctor' },
    { id: 7, title: 'Stock Alert', message: 'Multiple blood banks in Maharashtra reporting low stock for B- blood type', time: '5 hours ago', read: true, type: 'warning', category: 'blood' },
    { id: 8, title: 'System Maintenance', message: 'Scheduled system maintenance tonight at 2:00 AM IST - Expected downtime: 30 minutes', time: '6 hours ago', read: true, type: 'info', category: 'system' },
  ];

  const markAsRead = (id) => {
    // In a real app, this would update the state
    console.log('Mark as read:', id);
  };

  const markAllAsRead = () => {
    console.log('Mark all as read');
  };

  const deleteNotification = (id) => {
    console.log('Delete notification:', id);
  };

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.category === filterType);
    }
    
    return filtered;
  }, [filter, filterType]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'critical': return RED;
      case 'success': return '#16A34A';
      case 'warning': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'blood': return <FaDroplet />;
      case 'doctor': return <FaUserDoctor />;
      case 'request': return <FaHospital />;
      default: return <FaBell />;
    }
  };

  const categories = ['blood', 'doctor', 'request', 'system'];

  return (
    <DashboardLayout activeTab="notifications" title="Notifications Center" subtitle="Real-time alerts and system notifications">
      <div style={{ fontFamily:FONT }}>
        {/* Page Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div>
            <h2 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.5rem', color:SLATE, lineHeight:1.2 }}>Notifications Center</h2>
            <p style={{ fontFamily:FONT, fontSize:'0.85rem', color:SLATE_LT, marginTop:4 }}>
              {notifications.filter(n => !n.read).length} unread notifications
            </p>
          </div>
          <button 
            onClick={markAllAsRead}
            style={{ 
              background:WHITE, border:`1px solid ${BORDER}`, borderRadius:12, padding:'12px 20px',
              fontFamily:FONT, fontSize:'0.9rem', fontWeight:600, cursor:'pointer',
              display:'flex', alignItems:'center', gap:8, color:SLATE,
              transition:'all 0.25s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.borderColor = RED; }}
            onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; }}
          >
            <FaCheckDouble /> Mark All Read
          </button>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:12, marginBottom:28, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:8 }}>
            <button 
              onClick={() => setFilter('all')}
              style={{ 
                padding:'10px 20px', borderRadius:12, border:`1px solid ${BORDER}`,
                background:filter === 'all' ? RED : WHITE, color:filter === 'all' ? WHITE : SLATE,
                fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, cursor:'pointer',
                transition:'all 0.2s'
              }}
              onMouseEnter={e => { if(filter !== 'all') e.currentTarget.style.background = SMOKE; }}
              onMouseLeave={e => { if(filter !== 'all') e.currentTarget.style.background = WHITE; }}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')}
              style={{ 
                padding:'10px 20px', borderRadius:12, border:`1px solid ${BORDER}`,
                background:filter === 'unread' ? RED : WHITE, color:filter === 'unread' ? WHITE : SLATE,
                fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, cursor:'pointer',
                transition:'all 0.2s'
              }}
              onMouseEnter={e => { if(filter !== 'unread') e.currentTarget.style.background = SMOKE; }}
              onMouseLeave={e => { if(filter !== 'unread') e.currentTarget.style.background = WHITE; }}
            >
              Unread
            </button>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
            <FaFilter style={{ color:SLATE_LT, fontSize:'0.9rem' }} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding:'10px 16px', borderRadius:14, border:`1px solid ${BORDER}`,
                fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none',
                background:SMOKE, cursor:'pointer'
              }}
            >
              <option value="all">All Categories</option>
              <option value="blood">Blood Stock</option>
              <option value="doctor">Doctors</option>
              <option value="request">Requests</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => {
              const hospital = notification.hospitalId ? bloodBankDatabase.find(h => h.id === notification.hospitalId) : null;
              const doctor = notification.doctorId ? doctorDatabase.find(d => d.id === notification.doctorId) : null;
              
              return (
                <div key={notification.id} style={{
                  background:WHITE, borderRadius:16, border:`1px solid ${BORDER}`,
                  padding:20, display:'flex', alignItems:'flex-start', gap:16,
                  boxShadow:'0 4px 20px rgba(0,0,0,0.06)',
                  transition:'all 0.3s',
                  borderLeft: `4px solid ${getTypeColor(notification.type)}`
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  {/* Icon */}
                  <div style={{ 
                    width:48, height:48, borderRadius:12, 
                    background:`${getTypeColor(notification.type)}15`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:getTypeColor(notification.type), fontSize:'1.2rem', flexShrink:0
                  }}>
                    {getCategoryIcon(notification.category)}
                  </div>

                  {/* Content */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <div>
                        <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1rem', color:SLATE, marginBottom:4 }}>
                          {notification.title}
                        </h3>
                        <p style={{ fontFamily:FONT, fontSize:'0.85rem', color:SLATE_MD, lineHeight:1.4 }}>
                          {notification.message}
                        </p>
                      </div>
                      <span style={{ fontFamily:FONT, fontSize:'0.75rem', color:SLATE_LT, whiteSpace:'nowrap' }}>
                        {notification.time}
                      </span>
                    </div>

                    {/* Context Info */}
                    {(hospital || doctor) && (
                      <div style={{ display:'flex', gap:16, marginTop:12, paddingTop:12, borderTop:`1px solid ${BORDER}` }}>
                        {hospital && (
                          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem', color:SLATE_LT }}>
                            <FaHospital />
                            <span>{hospital.name}</span>
                          </div>
                        )}
                        {doctor && (
                          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem', color:SLATE_LT }}>
                            <FaUserDoctor />
                            <span>{doctor.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:8 }}>
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        style={{ 
                          padding:'8px 12px', borderRadius:8, border:`1px solid ${BORDER}`,
                          background:WHITE, color:SLATE, cursor:'pointer',
                          display:'flex', alignItems:'center', gap:6, transition:'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = SMOKE; }}
                        onMouseLeave={e => { e.currentTarget.style.background = WHITE; }}
                        title="Mark as read"
                      >
                        <FaCheckDouble />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      style={{ 
                        padding:'8px 12px', borderRadius:8, border:`1px solid ${RED}`,
                        background:`${RED}10`, color:RED, cursor:'pointer',
                        display:'flex', alignItems:'center', gap:6, transition:'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = WHITE; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${RED}10`; e.currentTarget.style.color = RED; }}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:16 }}>
              <FaBell style={{ fontSize:'4rem', color:SLATE_LT }} />
              <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.2rem', color:SLATE }}>No notifications</h3>
              <p style={{ color:SLATE_LT, fontSize:'0.9rem' }}>You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Notifications;