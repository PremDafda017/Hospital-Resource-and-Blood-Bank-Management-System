import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa6';
import './NotificationBell.css';

function NotificationBell({ count = 0, notifications = [], onMarkAsRead, onNotificationClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    setIsOpen(false);
  };

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell"
        onClick={handleToggle}
        aria-label={`Notifications (${count})`}
      >
        <FaBell />
        {count > 0 && (
          <span className="notification-badge">{count > 99 ? '99+' : count}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            {count > 0 && (
              <button 
                className="mark-read-btn"
                onClick={() => {
                  if (onMarkAsRead) onMarkAsRead();
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {notification.icon}
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  {!notification.read && <div className="notification-indicator" />}
                </div>
              ))
            ) : (
              <div className="notification-empty">
                <p>No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;