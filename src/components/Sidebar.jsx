import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRightFromBracket, FaDroplet } from 'react-icons/fa6';
import { useAuth } from '../pages/Admin/context/AuthContext';
import { getNavigationForRole } from '../config/roleNavigation';
import '../styles/Sidebar.css';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();

  const userRole = userProfile?.role || 'donor';
  const menuItems = getNavigationForRole(userRole);

  const handleNavigation = (item) => {
    if (item.isLogout) {
      handleLogout();
    } else {
      navigate(item.path);
      if (onClose) onClose();
    }
  };

  const handleLogout = async () => {
    // This will be handled by Clerk auth
    window.location.href = '/';
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">
            <FaDroplet />
          </span>
          <span>HRBMS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''} ${item.isLogout ? 'logout-item' : ''}`}
              onClick={() => handleNavigation(item)}
            >
              {item.icon}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;