import React, { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { FaCheck, FaXmark, FaTriangleExclamation, FaCircleInfo, FaBell } from 'react-icons/fa6';

const NotificationPopup = () => {
  const { notifications, dismissNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheck />;
      case 'error':
        return <FaXmark />;
      case 'warning':
        return <FaTriangleExclamation />;
      case 'info':
      default:
        return <FaCircleInfo />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return { bg: '#DCFCE7', border: '#16A34A', text: '#16A34A' };
      case 'error':
        return { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626' };
      case 'warning':
        return { bg: '#FEF3C7', border: '#D97706', text: '#D97706' };
      case 'info':
      default:
        return { bg: '#DBEAFE', border: '#2563EB', text: '#2563EB' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      maxWidth: 400,
    }}>
      {notifications.map((notification) => {
        const colors = getColors(notification.type);
        return (
          <div
            key={notification.id}
            style={{
              background: 'white',
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              padding: 16,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              animation: 'slideIn 0.3s ease-out',
              minWidth: 300,
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: colors.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: colors.text,
              fontSize: '1.2rem',
            }}>
              {getIcon(notification.type)}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{
                margin: '0 0 4px 0',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#1E293B',
              }}>
                {notification.title}
              </h4>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: '#64748B',
                lineHeight: 1.4,
              }}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FaXmark />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationPopup;
