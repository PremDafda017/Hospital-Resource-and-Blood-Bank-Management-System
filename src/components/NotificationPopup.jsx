import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useNotification } from '../contexts/NotificationContext';
import {
  FaCheck,
  FaXmark,
  FaTriangleExclamation,
  FaCircleInfo,
  FaDroplet,
  FaCalendarDays,
  FaCommentDots,
  FaArrowRight,
  FaShieldHalved
} from 'react-icons/fa6';

const NotificationPopup = () => {
  const { toasts, dismissNotification, markAsRead, openConversation } = useNotification();
  const navigate = useNavigate();
  const { user } = useUser();

  const userRole = (user?.unsafeMetadata?.role || localStorage.getItem("userRole") || "patient").toLowerCase().trim();
  const displayItems = Array.isArray(toasts) ? toasts : [];

  if (displayItems.length === 0) return null;

  const getIcon = (type, priority, entityType) => {
    if (priority === 'Critical' || type === 'critical' || type === 'error') {
      return <FaTriangleExclamation />;
    }
    if (priority === 'High' || type === 'warning' || type === 'alert') {
      return <FaTriangleExclamation />;
    }
    if (entityType === 'Message' || type?.includes('Message')) {
      return <FaCommentDots />;
    }
    if (entityType === 'BloodRequest' || type?.includes('Blood') || type?.includes('Stock')) {
      return <FaDroplet />;
    }
    if (entityType === 'Appointment' || type?.includes('Appointment')) {
      return <FaCalendarDays />;
    }
    if (type === 'success') {
      return <FaCheck />;
    }
    return <FaCircleInfo />;
  };

  const getDesign = (type, priority) => {
    if (priority === 'Critical' || type === 'critical' || type === 'error') {
      return {
        bg: '#FEF2F2',
        border: '#DC2626',
        iconBg: '#FEE2E2',
        iconColor: '#DC2626',
        glow: 'rgba(220, 38, 38, 0.2)',
        badge: 'Critical Alert',
        badgeBg: '#FEE2E2',
        badgeColor: '#B91C1C',
      };
    }
    if (priority === 'High' || type === 'warning' || type === 'alert') {
      return {
        bg: '#FFFBEB',
        border: '#D97706',
        iconBg: '#FEF3C7',
        iconColor: '#D97706',
        glow: 'rgba(217, 119, 6, 0.18)',
        badge: 'Priority Update',
        badgeBg: '#FEF3C7',
        badgeColor: '#92400E',
      };
    }
    if (type === 'success') {
      return {
        bg: '#F0FDF4',
        border: '#16A34A',
        iconBg: '#DCFCE7',
        iconColor: '#16A34A',
        glow: 'rgba(22, 163, 74, 0.15)',
        badge: 'Confirmed',
        badgeBg: '#DCFCE7',
        badgeColor: '#15803D',
      };
    }
    return {
      bg: '#F8FAFC',
      border: '#2563EB',
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
      glow: 'rgba(37, 99, 235, 0.15)',
      badge: 'Information',
      badgeBg: '#DBEAFE',
      badgeColor: '#1E40AF',
    };
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Just now';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return 'Just now';
    }
  };

  const handleViewDetails = (item) => {
    dismissNotification(item.id);
    if (item._id) {
      markAsRead(item._id);
    }

    // Direct message thread modal
    if (item.relatedEntityType === 'Message' && item.requestId) {
      openConversation({
        requestId: item.requestId,
        requestNumber: item.requestId,
        recipientRole: item.senderRole || '',
        recipientUserId: item.senderUserId || '',
        recipientName: item.senderName || '',
      });
      return;
    }

    // Explicit custom actionUrl
    if (item.actionUrl) {
      navigate(item.actionUrl);
      return;
    }

    // Role-aware default destination
    if (item.relatedEntityType === 'BloodRequest' || item.requestId) {
      if (userRole === 'patient') navigate('/blood-requests');
      else if (userRole.includes('hospital')) navigate('/hospital-blood-requests');
      else if (userRole.includes('blood_bank') || userRole.includes('bloodbank')) navigate('/bloodbank-requests');
      else navigate('/admin');
      return;
    }

    if (item.relatedEntityType === 'Appointment') {
      if (userRole === 'patient') navigate('/my-appointments');
      else if (userRole === 'donor') navigate('/donor/appointments');
      else if (userRole.includes('hospital')) navigate('/hospital-appointments');
      else if (userRole.includes('blood_bank') || userRole.includes('bloodbank')) navigate('/appointment-management');
      else navigate('/admin');
      return;
    }

    if (item.relatedEntityType === 'Report') {
      if (userRole === 'patient') navigate('/my-reports');
      else if (userRole.includes('hospital')) navigate('/hospital-reports');
      else navigate('/admin');
      return;
    }

    // Fallback to role notifications center
    if (userRole === 'patient') navigate('/notifications');
    else if (userRole.includes('hospital')) navigate('/hospital-notifications');
    else if (userRole.includes('blood_bank') || userRole.includes('bloodbank')) navigate('/bloodbank-notifications');
    else if (userRole === 'donor') navigate('/donor-notifications');
    else navigate('/admin');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 440,
        width: 'calc(100% - 40px)',
        pointerEvents: 'none',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {displayItems.map((notification) => {
        const design = getDesign(notification.type, notification.priority);
        const icon = getIcon(notification.type, notification.priority, notification.relatedEntityType);
        const timeStr = formatTimestamp(notification.createdAt);

        return (
          <div
            key={notification.id}
            role="alert"
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              border: `1.5px solid ${design.border}`,
              borderLeft: `5px solid ${design.border}`,
              boxShadow: `0 14px 40px rgba(15, 23, 42, 0.14), 0 0 20px ${design.glow}`,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'auto',
              position: 'relative',
              transition: 'transform 0.2s ease',
            }}
          >
            {/* Top Row: Icon + Badge + Title + Time + Close */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: design.iconBg,
                  color: design.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.05rem',
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      background: design.badgeBg,
                      color: design.badgeColor,
                      padding: '2px 7px',
                      borderRadius: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {design.badge}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{timeStr}</span>
                </div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}
                >
                  {notification.title}
                </h4>
              </div>

              <button
                onClick={() => dismissNotification(notification.id)}
                aria-label="Dismiss notification"
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
                  fontSize: '0.95rem',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
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

            {/* Message Body */}
            <p
              style={{
                margin: '0 0 0 48px',
                fontSize: '0.84rem',
                color: '#334155',
                lineHeight: 1.45,
                wordBreak: 'break-word',
              }}
            >
              {notification.message}
            </p>

            {/* Bottom Meta & Actions Row */}
            <div
              style={{
                marginLeft: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                paddingTop: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {notification.requestId && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: '#F1F5F9',
                      color: '#475569',
                      padding: '2px 7px',
                      borderRadius: 6,
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    Ref: {notification.requestId}
                  </span>
                )}
                {notification.senderName && (
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    From: <strong>{notification.senderName}</strong>
                  </span>
                )}
              </div>

              <button
                onClick={() => handleViewDetails(notification)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: design.border,
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = design.iconBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>View Details</span>
                <FaArrowRight style={{ fontSize: '0.7rem' }} />
              </button>
            </div>
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
        @media (max-width: 600px) {
          @keyframes slideInRight {
            from {
              transform: translateY(-50px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationPopup;
