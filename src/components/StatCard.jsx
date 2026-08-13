import React from 'react';
import './StatCard.css';

function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  color = 'primary',
  onClick 
}) {
  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'var(--accent-green)';
    if (trend === 'down') return 'var(--accent-orange)';
    return 'var(--text-muted)';
  };

  return (
    <div 
      className={`stat-card stat-card-${color} ${onClick ? 'stat-card-clickable' : ''}`}
      onClick={onClick}
    >
      <div className={`stat-icon-wrapper stat-icon-${color}`}>
        {icon}
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
        {trend && (
          <div className="stat-trend" style={{ color: getTrendColor() }}>
            <span className="stat-trend-icon">{getTrendIcon()}</span>
            <span className="stat-trend-value">{trendValue}</span>
            <span className="stat-trend-label">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;