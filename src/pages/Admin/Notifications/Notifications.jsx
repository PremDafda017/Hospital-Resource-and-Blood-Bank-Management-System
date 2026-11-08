import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheckDouble, FaTrash, FaDroplet, FaHospital, FaUserDoctor, FaFilter, FaBullhorn, FaPaperPlane, FaXmark } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import { useNotification } from '../../../contexts/NotificationContext';
import { bloodBankDatabase, doctorDatabase, bloodGroups } from '../../../data/hospitalData';
import { apiFetch } from '../../../utils/apiConfig';

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
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    targetRole: 'all_staff',
    title: '',
    message: ''
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Dynamic notifications state
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, title: 'Critical Blood Shortage', message: 'Apollo Hospital Blood Bank - O- blood stock critically low (5 units remaining)', time: '2 minutes ago', read: false, type: 'critical', hospitalId: 6, category: 'blood' },
    { id: 2, title: 'New Blood Donation', message: 'J.J. Hospital Blood Bank received 10 units of A+ blood from donor Robert Davis', time: '15 minutes ago', read: false, type: 'success', hospitalId: 13, category: 'blood' },
    { id: 3, title: 'Doctor Availability Update', message: 'Dr. Rajesh Kumar is now available for appointments at Apollo Hospital', time: '30 minutes ago', read: false, type: 'info', hospitalId: 6, doctorId: 1, category: 'doctor' },
    { id: 4, title: 'Emergency Blood Request', message: 'Critical request: 3 units of AB+ needed at Victoria Hospital for emergency surgery', time: '1 hour ago', read: true, type: 'critical', hospitalId: 27, category: 'request' },
    { id: 5, title: 'Blood Bank License Renewal', message: 'AIIMS Blood Bank license expires in 30 days. Please initiate renewal process.', time: '2 hours ago', read: true, type: 'warning', hospitalId: 1, category: 'system' },
    { id: 6, title: 'New Doctor Registration', message: 'Dr. Priya Sharma has been registered at KEM Hospital Blood Bank', time: '3 hours ago', read: true, type: 'success', hospitalId: 19, doctorId: 2, category: 'doctor' },
    { id: 7, title: 'Stock Alert', message: 'Multiple blood banks in Maharashtra reporting low stock for B- blood type', time: '5 hours ago', read: true, type: 'warning', category: 'blood' },
    { id: 8, title: 'System Maintenance', message: 'Scheduled system maintenance tonight at 2:00 AM IST - Expected downtime: 30 minutes', time: '6 hours ago', read: true, type: 'info', category: 'system' },
  ]);

  const { showNotification } = useNotification();

  // Load any backend admin alerts
  useEffect(() => {
    apiFetch('/api/notifications/admin?role=admin')
      .then(res => res.json())
      .then(data => {
        if (data.notifications && data.notifications.length > 0) {
          const mapped = data.notifications.map(n => ({
            id: n._id || n.id,
            title: n.title,
            message: n.message,
            time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: n.isRead,
            type: n.priority === 'urgent' ? 'critical' : (n.notificationType === 'blood_stock_alert' ? 'warning' : 'info'),
            category: n.relatedEntityType === 'blood_request' ? 'request' : 'system'
          }));
          setNotificationsList(prev => [...mapped, ...prev]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastData.title.trim() || !broadcastData.message.trim()) {
      showNotification({
        title: "Missing Information",
        message: "Please provide both a subject title and message content for the broadcast.",
        type: "warning"
      });
      return;
    }

    setSendingBroadcast(true);
    try {
      const res = await apiFetch("/api/admin/messages/broadcast-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: "admin",
          adminName: "System Administrator",
          targetRole: broadcastData.targetRole,
          title: broadcastData.title,
          message: broadcastData.message
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotification({
          title: "Announcement Dispatched",
          message: `Broadcast delivered to ${data.recipientCount} staff members with real-time in-app & SMTP email alerts.`,
          type: "success",
          playSound: true
        });

        // Add to local admin log
        setNotificationsList(prev => [
          {
            id: Date.now(),
            title: `Broadcast: ${broadcastData.title}`,
            message: `Dispatched to ${broadcastData.targetRole.replace('_', ' ')}: "${broadcastData.message}"`,
            time: "Just now",
            read: true,
            type: "info",
            category: "system"
          },
          ...prev
        ]);

        setShowBroadcastModal(false);
        setBroadcastData({ targetRole: 'all_staff', title: '', message: '' });
      } else {
        throw new Error(data.error || "Failed to dispatch announcement");
      }
    } catch (err) {
      showNotification({
        title: "Broadcast Failed",
        message: err.message || "Could not deliver staff broadcast.",
        type: "critical"
      });
    } finally {
      setSendingBroadcast(false);
    }
  };

  const markAsRead = (id) => {
    setNotificationsList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    showNotification({
      title: "Notification Acknowledged",
      message: "The notification has been marked as read.",
      type: "info",
      playSound: true
    });
  };

  const markAllAsRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
    showNotification({
      title: "All Notifications Acknowledged",
      message: "All alerts have been marked as read.",
      type: "success",
      playSound: true
    });
  };

  const deleteNotification = (id) => {
    setNotificationsList(prev => prev.filter(n => n.id !== id));
    showNotification({
      title: "Notification Dismissed",
      message: "The notification was removed from your center.",
      type: "warning",
      playSound: true
    });
  };

  const filteredNotifications = useMemo(() => {
    let filtered = notificationsList;
    
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.category === filterType);
    }
    
    return filtered;
  }, [notificationsList, filter, filterType]);

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
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:16 }}>
          <div>
            <h2 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.5rem', color:SLATE, lineHeight:1.2 }}>Notifications Center</h2>
            <p style={{ fontFamily:FONT, fontSize:'0.85rem', color:SLATE_LT, marginTop:4 }}>
              {notificationsList.filter(n => !n.read).length} unread notifications
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button 
              onClick={() => setShowBroadcastModal(true)}
              style={{ 
                background: RED, border: `1px solid ${RED}`, borderRadius: 12, padding: '12px 20px',
                fontFamily: FONT, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, color: WHITE,
                boxShadow: '0 4px 14px rgba(196,18,48,0.25)',
                transition: 'all 0.25s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = RED_DARK; }}
              onMouseLeave={e => { e.currentTarget.style.background = RED; }}
            >
              <FaBullhorn /> Broadcast to Staff
            </button>
            <button 
              onClick={markAllAsRead}
              style={{ 
                background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 20px',
                fontFamily: FONT, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, color: SLATE,
                transition: 'all 0.25s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = SMOKE; e.currentTarget.style.borderColor = RED; }}
              onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; }}
            >
              <FaCheckDouble /> Mark All Read
            </button>
          </div>
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

        {/* Admin Broadcast to Staff Modal */}
        {showBroadcastModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 16
          }}>
            <div style={{
              background: WHITE, borderRadius: 20, width: '100%', maxWidth: 540,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
              border: `1px solid ${BORDER}`, animation: 'fadeIn 0.2s ease-out'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '20px 24px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: 'rgba(196,18,48,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: '1.2rem'
                  }}>
                    <FaBullhorn />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Staff Broadcast Announcement</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8', marginTop: 2 }}>
                      Dispatch real-time notification & SMTP email alert to staff
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  style={{
                    background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer',
                    fontSize: '1.2rem', padding: 4, display: 'flex'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = WHITE}
                  onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                >
                  <FaXmark />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSendBroadcast} style={{ padding: 24 }}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: SLATE, marginBottom: 6 }}>
                    Target Audience
                  </label>
                  <select
                    value={broadcastData.targetRole}
                    onChange={e => setBroadcastData(prev => ({ ...prev, targetRole: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${BORDER}`,
                      fontFamily: FONT, fontSize: '0.9rem', color: SLATE, background: SMOKE, outline: 'none'
                    }}
                  >
                    <option value="all_staff">📢 All Staff (Hospital Staff + Blood Bank Staff)</option>
                    <option value="hospital_staff">🏥 Hospital Staff Only</option>
                    <option value="bloodbank_staff">🩸 Blood Bank Staff Only</option>
                  </select>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: SLATE, marginBottom: 6 }}>
                    Subject / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Critical Blood Inventory Policy Update"
                    value={broadcastData.title}
                    onChange={e => setBroadcastData(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${BORDER}`,
                      fontFamily: FONT, fontSize: '0.9rem', color: SLATE, outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: SLATE, marginBottom: 6 }}>
                    Announcement Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide full details. This message will be sent to their notifications center and delivered directly to their registered email addresses..."
                    value={broadcastData.message}
                    onChange={e => setBroadcastData(prev => ({ ...prev, message: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${BORDER}`,
                      fontFamily: FONT, fontSize: '0.9rem', color: SLATE, outline: 'none', resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    disabled={sendingBroadcast}
                    style={{
                      padding: '10px 18px', borderRadius: 10, border: `1px solid ${BORDER}`,
                      background: WHITE, color: SLATE, fontFamily: FONT, fontSize: '0.9rem',
                      fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingBroadcast}
                    style={{
                      padding: '10px 22px', borderRadius: 10, border: 'none',
                      background: RED, color: WHITE, fontFamily: FONT, fontSize: '0.9rem',
                      fontWeight: 600, cursor: sendingBroadcast ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                      opacity: sendingBroadcast ? 0.7 : 1,
                      boxShadow: '0 4px 14px rgba(196,18,48,0.3)'
                    }}
                  >
                    <FaPaperPlane />
                    {sendingBroadcast ? 'Delivering...' : 'Send Broadcast'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Notifications;