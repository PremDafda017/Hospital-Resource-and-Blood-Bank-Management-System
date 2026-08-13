import {
  FaChartLine,
  FaUsers,
  FaUserDoctor,
  FaHandHoldingMedical,
  FaDroplet,
  FaHeartPulse,
  FaBuilding,
  FaCalendarDays,
  FaClipboardList,
  FaGear,
  FaBell,
  FaFileMedical,
  FaMapLocationDot,
  FaUser,
  FaRightFromBracket,
} from 'react-icons/fa6';

// Role-based navigation configuration
export const ROLE_MENUS = {
  patient: [
    { path: '/patient-dashboard', icon: <FaChartLine />, label: 'Dashboard' },
    { path: '/appointments', icon: <FaCalendarDays />, label: 'Appointments' },
    { path: '/blood-requests', icon: <FaHeartPulse />, label: 'My Blood Requests' },
    { path: '/my-appointments', icon: <FaCalendarDays />, label: 'My Appointments' },
    { path: '/nearby-blood-banks', icon: <FaMapLocationDot />, label: 'Nearby Blood Banks' },
    { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
    { path: '/my-reports', icon: <FaFileMedical />, label: 'My Reports' },
    { path: '/profile', icon: <FaUser />, label: 'My Profile' },
    { path: '/logout', icon: <FaRightFromBracket />, label: 'Logout', isLogout: true },
  ],
  donor: [
    { path: '/dashboard', icon: <FaChartLine />, label: 'Dashboard' },
    { path: '/donate-blood', icon: <FaHandHoldingMedical />, label: 'Donate Blood' },
    { path: '/donation-history', icon: <FaClipboardList />, label: 'Donation History' },
    { path: '/appointments', icon: <FaCalendarDays />, label: 'Appointments' },
    { path: '/blood-banks', icon: <FaMapLocationDot />, label: 'Nearby Blood Banks' },
    { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
    { path: '/logout', icon: <FaRightFromBracket />, label: 'Logout', isLogout: true },
  ],
  blood_bank_staff: [
    { path: '/dashboard', icon: <FaChartLine />, label: 'Dashboard' },
    { path: '/blood-inventory', icon: <FaDroplet />, label: 'Blood Inventory' },
    { path: '/blood-requests', icon: <FaHeartPulse />, label: 'Blood Requests' },
    { path: '/donors', icon: <FaHandHoldingMedical />, label: 'Donors' },
    { path: '/reports', icon: <FaClipboardList />, label: 'Reports' },
    { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
    { path: '/settings', icon: <FaGear />, label: 'Settings' },
    { path: '/logout', icon: <FaRightFromBracket />, label: 'Logout', isLogout: true },
  ],
  hospital_staff: [
    { path: '/hospital-dashboard', icon: <FaChartLine />, label: 'Dashboard' },
    { path: '/hospital-patients', icon: <FaUsers />, label: 'Patients' },
    { path: '/hospital-doctors', icon: <FaUserDoctor />, label: 'Doctors' },
    { path: '/hospital-appointments', icon: <FaCalendarDays />, label: 'Appointments' },
    { path: '/hospital-blood-requests', icon: <FaHeartPulse />, label: 'Blood Requests' },
    { path: '/hospital-blood-inventory', icon: <FaDroplet />, label: 'Blood Inventory' },
    { path: '/hospital-reports', icon: <FaClipboardList />, label: 'Reports' },
    { path: '/hospital-notifications', icon: <FaBell />, label: 'Notifications' },
    { path: '/logout', icon: <FaRightFromBracket />, label: 'Logout', isLogout: true },
  ],
  administrator: [
    { path: '/dashboard', icon: <FaChartLine />, label: 'Dashboard' },
    { path: '/patients', icon: <FaUsers />, label: 'Patients' },
    { path: '/doctors', icon: <FaUserDoctor />, label: 'Doctors' },
    { path: '/donors', icon: <FaHandHoldingMedical />, label: 'Donors' },
    { path: '/blood-banks', icon: <FaBuilding />, label: 'Blood Banks' },
    { path: '/blood-inventory', icon: <FaDroplet />, label: 'Blood Inventory' },
    { path: '/blood-requests', icon: <FaHeartPulse />, label: 'Blood Requests' },
    { path: '/appointments', icon: <FaCalendarDays />, label: 'Appointments' },
    { path: '/analytics', icon: <FaChartLine />, label: 'Analytics' },
    { path: '/reports', icon: <FaClipboardList />, label: 'Reports' },
    { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
    { path: '/settings', icon: <FaGear />, label: 'Settings' },
    { path: '/logout', icon: <FaRightFromBracket />, label: 'Logout', isLogout: true },
  ],
};

// Get navigation menu for a specific role
export const getNavigationForRole = (role) => {
  return ROLE_MENUS[role] || ROLE_MENUS.donor;
};

// Check if a role has access to a specific path
export const hasAccessToPath = (role, path) => {
  const menu = ROLE_MENUS[role] || ROLE_MENUS.donor;
  return menu.some(item => item.path === path);
};

// Get all accessible paths for a role
export const getAccessiblePaths = (role) => {
  const menu = ROLE_MENUS[role] || ROLE_MENUS.donor;
  return menu.map(item => item.path);
};
