import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { FaCheck, FaXmark, FaTriangleExclamation, FaCircleInfo } from 'react-icons/fa6';

const NotificationPopup = () => {
  const { toasts, dismissNotification } = useNotification();
  const displayItems = Array.isArray(toasts) ? toasts : [];

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheck />;
      case 'error':
      case 'critical':
        return <FaXmark />;
      case 'warning':
      case 'alert':
        return <FaTriangleExclamation />;
      case 'info':
      default:
        return <FaCircleInfo />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return { bg: '#DCFCE7', border: '#16A34A', text: '#16A34A', glow: 'rgba(22, 163, 74, 0.15)' };
      case 'error':
      case 'critical':
        return { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626', glow: 'rgba(220, 38, 38, 0.15)' };
      case 'warning':
      case 'alert':
        return { bg: '#FEF3C7', border: '#D97706', text: '#D97706', glow: 'rgba(217, 119, 6, 0.15)' };
      case 'info':
      default:
        return { bg: '#DBEAFE', border: '#2563EB', text: '#2563EB', glow: 'rgba(37, 99, 235, 0.15)' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      maxWidth: 420,
      pointerEvents: 'none',
    }}>
      {displayItems.map((notification) => {
        const colors = getColors(notification.type);
        return (
          <div
            key={notification.id}
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              border: `1.5px solid ${colors.border}`,
              borderLeft: `5px solid ${colors.border}`,
              boxShadow: `0 12px 36px rgba(0, 0, 0, 0.16), 0 0 20px ${colors.glow}`,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              minWidth: 320,
              pointerEvents: 'auto',
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: colors.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: colors.text,
              fontSize: '1.1rem',
            }}>
              {getIcon(notification.type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                margin: '0 0 3px 0',
                fontSize: '0.92rem',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.01em',
              }}>
                {notification.title}
              </h4>
              <p style={{
                margin: 0,
                fontSize: '0.82rem',
                color: '#475569',
                lineHeight: 1.45,
                wordBreak: 'break-word',
              }}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              aria-label="Close notification"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F1F5F9';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              <FaXmark />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(110%);
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
