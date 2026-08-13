import React, { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { FaBars, FaBell, FaSun, FaMoon, FaUser, FaRightFromBracket } from 'react-icons/fa6';
import './styles/Navbar.css';

function Navbar({ onToggleSidebar, theme, onToggleTheme }) {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowDropdown(false);
  };

  const getInitials = () => {
    if (user?.firstName) {
      return `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ''}`;
    }
    return 'U';
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <FaBars />
        </button>
        <h1 className="navbar-title">Hospital Resource & Blood Bank Management</h1>
      </div>

      <div className="navbar-right">
        <button 
          className="navbar-action" 
          onClick={onToggleTheme} 
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>

        <button className="navbar-action notification-wrapper" aria-label="Notifications">
          <FaBell />
          <span className="notification-badge">3</span>
        </button>

        <div className="user-avatar-container">
          <button 
            className="user-avatar" 
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="User menu"
          >
            {getInitials()}
          </button>

          {showDropdown && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-dropdown-name">
                  {user?.fullName || user?.firstName || 'User'}
                </div>
                <div className="user-dropdown-email">
                  {user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
                </div>
              </div>

              <div className="user-dropdown-body">
                <div className="user-dropdown-item">
                  <FaUser />
                  <span>Profile</span>
                </div>
                <div className="user-dropdown-item" onClick={handleLogout}>
                  <FaRightFromBracket />
                  <span>Sign Out</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;