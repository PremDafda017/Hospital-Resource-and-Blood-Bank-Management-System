import React, { useState } from 'react';
import { FaUser, FaBell, FaShield, FaPalette, FaDatabase, FaFloppyDisk, FaHospital, FaDroplet } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import { bloodBankDatabase, states } from '../../../data/hospitalData';

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

function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    darkMode: false,
    language: 'en',
    dataRetention: '90',
    twoFactorAuth: false,
    defaultHospital: '6',
    emergencyAlerts: true,
    lowStockThreshold: '10',
    autoBackup: true
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <DashboardLayout activeTab="settings" title="Settings" subtitle="Manage your account and system preferences">
      <div style={{ fontFamily:FONT }}>
        {/* Page Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <h2 style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.5rem', color:SLATE, lineHeight:1.2 }}>System Settings</h2>
          <button 
            onClick={handleSave}
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
            <FaFloppyDisk /> Save Changes
          </button>
        </div>

        {/* Settings Sections */}
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {/* Profile Settings */}
          <div style={{ background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`, padding:24 }}>
            <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.1rem', color:SLATE, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <FaUser style={{ color:RED }} /> Profile Settings
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:20 }}>
              <div>
                <label style={{ display:'block', fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Display Name</label>
                <input type="text" defaultValue="Administrator" style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', transition:'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = RED}
                  onBlur={e => e.currentTarget.style.borderColor = BORDER}
                />
              </div>
              <div>
                <label style={{ display:'block', fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Email</label>
                <input type="email" defaultValue="admin@bloodbank.gov.in" style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', transition:'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = RED}
                  onBlur={e => e.currentTarget.style.borderColor = BORDER}
                />
              </div>
              <div>
                <label style={{ display:'block', fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Phone</label>
                <input type="tel" defaultValue="+91-11-23456789" style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', transition:'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = RED}
                  onBlur={e => e.currentTarget.style.borderColor = BORDER}
                />
              </div>
            </div>
          </div>

          {/* Hospital Settings */}
          <div style={{ background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`, padding:24 }}>
            <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.1rem', color:SLATE, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <FaHospital style={{ color:RED }} /> Hospital Configuration
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:20 }}>
              <div>
                <label style={{ display:'block', fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Default Hospital</label>
                <select
                  value={settings.defaultHospital}
                  onChange={(e) => handleChange('defaultHospital', e.target.value)}
                  style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
                >
                  {bloodBankDatabase.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Default State</label>
                <select
                  defaultValue="Maharashtra"
                  style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
                >
                  {states.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Blood Bank Settings */}
          <div style={{ background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`, padding:24 }}>
            <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.1rem', color:SLATE, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <FaDroplet style={{ color:RED }} /> Blood Bank Configuration
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:20 }}>
              <div>
                <label style={{ display:'block', fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Low Stock Threshold (units)</label>
                <input
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => handleChange('lowStockThreshold', e.target.value)}
                  style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', transition:'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = RED}
                  onBlur={e => e.currentTarget.style.borderColor = BORDER}
                />
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:16, marginTop:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:SMOKE, borderRadius:14 }}>
                <div>
                  <div style={{ fontFamily:FONT, fontWeight:600, fontSize:'0.95rem', color:SLATE, marginBottom:4 }}>Emergency Alerts</div>
                  <div style={{ fontFamily:FONT, fontSize:'0.85rem', color:SLATE_LT }}>Receive alerts for critical blood shortages</div>
                </div>
                <div style={{ position:'relative', width:50, height:26 }}>
                  <input
                    type="checkbox"
                    checked={settings.emergencyAlerts}
                    onChange={(e) => handleChange('emergencyAlerts', e.target.checked)}
                    style={{ opacity:0, width:'100%', height:'100%', position:'absolute', cursor:'pointer', zIndex:2 }}
                  />
                  <div style={{ position:'absolute', width:50, height:26, borderRadius:13, background:settings.emergencyAlerts ? RED : BORDER, transition:'background 0.3s' }} />
                  <div style={{ position:'absolute', top:3, left:settings.emergencyAlerts ? 27 : 3, width:20, height:20, borderRadius:10, background:WHITE, transition:'left 0.3s' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div style={{ background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`, padding:24 }}>
            <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.1rem', color:SLATE, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <FaBell style={{ color:RED }} /> Notification Preferences
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:SMOKE, borderRadius:14 }}>
                <div>
                  <div style={{ fontFamily:FONT, fontWeight:600, fontSize:'0.95rem', color:SLATE, marginBottom:4 }}>Push Notifications</div>
                  <div style={{ fontFamily:FONT, fontSize:'0.85rem', color:SLATE_LT }}>Receive notifications on your device</div>
                </div>
                <div style={{ position:'relative', width:50, height:26 }}>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleChange('notifications', e.target.checked)}
                    style={{ opacity:0, width:'100%', height:'100%', position:'absolute', cursor:'pointer', zIndex:2 }}
                  />
                  <div style={{ position:'absolute', width:50, height:26, borderRadius:13, background:settings.notifications ? RED : BORDER, transition:'background 0.3s' }} />
                  <div style={{ position:'absolute', top:3, left:settings.notifications ? 27 : 3, width:20, height:20, borderRadius:10, background:WHITE, transition:'left 0.3s' }} />
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:SMOKE, borderRadius:14 }}>
                <div>
                  <div style={{ fontFamily:FONT, fontWeight:600, fontSize:'0.95rem', color:SLATE, marginBottom:4 }}>Email Alerts</div>
                  <div style={{ fontFamily:FONT, fontSize:'0.85rem', color:SLATE_LT }}>Receive critical alerts via email</div>
                </div>
                <div style={{ position:'relative', width:50, height:26 }}>
                  <input
                    type="checkbox"
                    checked={settings.emailAlerts}
                    onChange={(e) => handleChange('emailAlerts', e.target.checked)}
                    style={{ opacity:0, width:'100%', height:'100%', position:'absolute', cursor:'pointer', zIndex:2 }}
                  />
                  <div style={{ position:'absolute', width:50, height:26, borderRadius:13, background:settings.emailAlerts ? RED : BORDER, transition:'background 0.3s' }} />
                  <div style={{ position:'absolute', top:3, left:settings.emailAlerts ? 27 : 3, width:20, height:20, borderRadius:10, background:WHITE, transition:'left 0.3s' }} />
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:SMOKE, borderRadius:14 }}>
                <div>
                  <div style={{ fontFamily:FONT, fontWeight:600, fontSize:'0.95rem', color:SLATE, marginBottom:4 }}>SMS Alerts</div>
                  <div style={{ fontFamily:FONT, fontSize:'0.85rem', color:SLATE_LT }}>Receive urgent alerts via SMS</div>
                </div>
                <div style={{ position:'relative', width:50, height:26 }}>
                  <input
                    type="checkbox"
                    checked={settings.smsAlerts}
                    onChange={(e) => handleChange('smsAlerts', e.target.checked)}
                    style={{ opacity:0, width:'100%', height:'100%', position:'absolute', cursor:'pointer', zIndex:2 }}
                  />
                  <div style={{ position:'absolute', width:50, height:26, borderRadius:13, background:settings.smsAlerts ? RED : BORDER, transition:'background 0.3s' }} />
                  <div style={{ position:'absolute', top:3, left:settings.smsAlerts ? 27 : 3, width:20, height:20, borderRadius:10, background:WHITE, transition:'left 0.3s' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div style={{ background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`, padding:24 }}>
            <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.1rem', color:SLATE, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <FaShield style={{ color:RED }} /> Security Settings
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:SMOKE, borderRadius:14 }}>
                <div>
                  <div style={{ fontFamily:FONT, fontWeight:600, fontSize:'0.95rem', color:SLATE, marginBottom:4 }}>Two-Factor Authentication</div>
                  <div style={{ fontFamily:FONT, fontSize:'0.85rem', color:SLATE_LT }}>Add an extra layer of security</div>
                </div>
                <div style={{ position:'relative', width:50, height:26 }}>
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                    style={{ opacity:0, width:'100%', height:'100%', position:'absolute', cursor:'pointer', zIndex:2 }}
                  />
                  <div style={{ position:'absolute', width:50, height:26, borderRadius:13, background:settings.twoFactorAuth ? RED : BORDER, transition:'background 0.3s' }} />
                  <div style={{ position:'absolute', top:3, left:settings.twoFactorAuth ? 27 : 3, width:20, height:20, borderRadius:10, background:WHITE, transition:'left 0.3s' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div style={{ background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`, padding:24 }}>
            <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.1rem', color:SLATE, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <FaPalette style={{ color:RED }} /> Appearance
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:20 }}>
              <div>
                <label style={{ display:'block', fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Theme</label>
                <select
                  value={settings.darkMode ? 'dark' : 'light'}
                  onChange={(e) => handleChange('darkMode', e.target.value === 'dark')}
                  style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', background:SMOKE, cursor:'pointer' }}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div style={{ background:WHITE, borderRadius:20, border:`1px solid ${BORDER}`, padding:24 }}>
            <h3 style={{ fontFamily:FONT, fontWeight:700, fontSize:'1.1rem', color:SLATE, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <FaDatabase style={{ color:RED }} /> Data Management
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:20 }}>
              <div>
                <label style={{ display:'block', fontFamily:FONT, fontSize:'0.85rem', fontWeight:600, color:SLATE_MD, marginBottom:8 }}>Data Retention (days)</label>
                <input
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => handleChange('dataRetention', e.target.value)}
                  style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:`1px solid ${BORDER}`, fontFamily:FONT, fontSize:'0.9rem', color:SLATE, outline:'none', transition:'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = RED}
                  onBlur={e => e.currentTarget.style.borderColor = BORDER}
                />
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:16, marginTop:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:SMOKE, borderRadius:14 }}>
                <div>
                  <div style={{ fontFamily:FONT, fontWeight:600, fontSize:'0.95rem', color:SLATE, marginBottom:4 }}>Auto Backup</div>
                  <div style={{ fontFamily:FONT, fontSize:'0.85rem', color:SLATE_LT }}>Automatically backup data daily</div>
                </div>
                <div style={{ position:'relative', width:50, height:26 }}>
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => handleChange('autoBackup', e.target.checked)}
                    style={{ opacity:0, width:'100%', height:'100%', position:'absolute', cursor:'pointer', zIndex:2 }}
                  />
                  <div style={{ position:'absolute', width:50, height:26, borderRadius:13, background:settings.autoBackup ? RED : BORDER, transition:'background 0.3s' }} />
                  <div style={{ position:'absolute', top:3, left:settings.autoBackup ? 27 : 3, width:20, height:20, borderRadius:10, background:WHITE, transition:'left 0.3s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;