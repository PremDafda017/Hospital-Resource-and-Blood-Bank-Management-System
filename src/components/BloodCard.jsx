import React from 'react';
import { FaDroplet } from 'react-icons/fa6';
import './BloodCard.css';

function BloodCard({ 
  bloodType, 
  units, 
  status = 'normal',
  onClick,
  compact = false
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return '#EF4444';
      case 'low':
        return '#F59E0B';
      case 'normal':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'critical':
        return 'Critical';
      case 'low':
        return 'Low Stock';
      case 'normal':
        return 'Normal';
      default:
        return 'Unknown';
    }
  };

  return (
    <div 
      className={`blood-card ${compact ? 'blood-card-compact' : ''} ${onClick ? 'blood-card-clickable' : ''}`}
      onClick={onClick}
      style={{ borderColor: getStatusColor() }}
    >
      <div 
        className="blood-type-badge"
        style={{ backgroundColor: getStatusColor() }}
      >
        <span className="blood-type-text">{bloodType}</span>
      </div>
      
      <div className="blood-info">
        <div className="blood-units">
          <span className="blood-units-value">{units}</span>
          <span className="blood-units-label">units</span>
        </div>
        
        {!compact && (
          <div className="blood-status" style={{ color: getStatusColor() }}>
            <span className="blood-status-dot" style={{ backgroundColor: getStatusColor() }} />
            <span className="blood-status-text">{getStatusLabel()}</span>
          </div>
        )}
      </div>
      
      <div className="blood-icon">
        <FaDroplet style={{ color: getStatusColor() }} />
      </div>
    </div>
  );
}

export default BloodCard;