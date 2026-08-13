import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartBar, FaChartLine, FaDroplet, FaUsers, FaHospital, 
  FaMapLocationDot, FaArrowTrendUp, FaArrowTrendDown, FaFilter 
} from 'react-icons/fa6';
import './Analytics.css';
import { bloodBankDatabase, bloodGroups, states, getHospitalsByState, getHospitalsByType } from '../../../data/hospitalData';

function Analytics() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedType, setSelectedType] = useState('All');

  // Calculate aggregate statistics
  const stats = useMemo(() => {
    const filteredHospitals = bloodBankDatabase.filter(h => {
      const stateMatch = selectedState === 'All States' || h.state === selectedState;
      const typeMatch = selectedType === 'All' || h.type === selectedType;
      return stateMatch && typeMatch;
    });

    const totalBloodStock = {};
    bloodGroups.forEach(bg => {
      totalBloodStock[bg] = filteredHospitals.reduce((sum, h) => sum + (h.bloodStock[bg] || 0), 0);
    });

    const totalCapacity = filteredHospitals.reduce((sum, h) => sum + h.capacity, 0);
    const totalStock = Object.values(totalBloodStock).reduce((sum, val) => sum + val, 0);
    const utilizationRate = totalCapacity > 0 ? ((totalStock / totalCapacity) * 100).toFixed(1) : 0;

    const stateWiseData = states.map(state => {
      const stateHospitals = getHospitalsByState(state);
      const stateStock = {};
      bloodGroups.forEach(bg => {
        stateStock[bg] = stateHospitals.reduce((sum, h) => sum + (h.bloodStock[bg] || 0), 0);
      });
      return {
        state,
        totalStock: Object.values(stateStock).reduce((sum, val) => sum + val, 0),
        hospitalCount: stateHospitals.length,
        stock: stateStock
      };
    }).sort((a, b) => b.totalStock - a.totalStock);

    const typeWiseData = {
      government: getHospitalsByType('government'),
      private: getHospitalsByType('private')
    };

    return {
      totalBloodStock,
      totalCapacity,
      totalStock,
      utilizationRate,
      hospitalCount: filteredHospitals.length,
      stateWiseData,
      typeWiseData
    };
  }, [selectedState, selectedType]);

  const getStockColor = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage > 70) return '#16A34A';
    if (percentage > 40) return '#F59E0B';
    return '#DC2626';
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="page-title-section">
          <div className="page-icon"><FaChartBar /></div>
          <div><h1>National Blood Analytics</h1><p>e-Raktkosh style comprehensive blood management analytics</p></div>
        </div>
        <div className="analytics-filters">
          <select 
            className="filter-select"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="All States">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select 
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="government">Government</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Key Statistics Cards */}
      <div className="analytics-overview">
        <div className="analytics-card stat-card">
          <div className="analytics-icon stat-icon-blood"><FaDroplet /></div>
          <div className="analytics-info">
            <h3>Total Blood Stock</h3>
            <p className="stat-value">{stats.totalStock.toLocaleString()} units</p>
            <p className="stat-trend positive"><FaArrowTrendUp /> +12% this month</p>
          </div>
        </div>
        <div className="analytics-card stat-card">
          <div className="analytics-icon stat-icon-hospital"><FaHospital /></div>
          <div className="analytics-info">
            <h3>Total Blood Banks</h3>
            <p className="stat-value">{stats.hospitalCount}</p>
            <p className="stat-trend positive"><FaArrowTrendUp /> +3 new this month</p>
          </div>
        </div>
        <div className="analytics-card stat-card">
          <div className="analytics-icon stat-icon-users"><FaUsers /></div>
          <div className="analytics-info">
            <h3>Storage Capacity</h3>
            <p className="stat-value">{stats.totalCapacity.toLocaleString()} units</p>
            <p className="stat-trend">{stats.utilizationRate}% utilized</p>
          </div>
        </div>
        <div className="analytics-card stat-card">
          <div className="analytics-icon stat-icon-chart"><FaChartLine /></div>
          <div className="analytics-info">
            <h3>Active Donations</h3>
            <p className="stat-value">1,247</p>
            <p className="stat-trend positive"><FaArrowTrendUp /> +15% this month</p>
          </div>
        </div>
      </div>

      {/* Blood Group Distribution */}
      <div className="analytics-grid">
        <div className="analytics-section full-width">
          <h2>Blood Group Distribution</h2>
          <div className="blood-group-chart">
            {bloodGroups.map(bg => {
              const value = stats.totalBloodStock[bg] || 0;
              const maxValue = Math.max(...Object.values(stats.totalBloodStock));
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const color = getStockColor(value, maxValue);
              return (
                <div key={bg} className="blood-group-bar">
                  <div className="bg-label">{bg}</div>
                  <div className="bg-bar-container">
                    <div 
                      className="bg-bar" 
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: color 
                      }}
                    />
                  </div>
                  <div className="bg-value">{value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* State-wise Analysis */}
        <div className="analytics-section full-width">
          <h2>State-wise Blood Stock Analysis</h2>
          <div className="state-analysis-table">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Total Stock</th>
                  <th>Blood Banks</th>
                  <th>Avg per Bank</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.stateWiseData.map((stateData, index) => {
                  const avgPerBank = stateData.hospitalCount > 0 
                    ? Math.round(stateData.totalStock / stateData.hospitalCount) 
                    : 0;
                  const status = avgPerBank > 400 ? 'Good' : avgPerBank > 250 ? 'Moderate' : 'Critical';
                  const statusColor = status === 'Good' ? '#16A34A' : status === 'Moderate' ? '#F59E0B' : '#DC2626';
                  
                  return (
                    <tr key={stateData.state}>
                      <td>
                        <div className="state-cell">
                          <span className="state-rank">{index + 1}</span>
                          {stateData.state}
                        </div>
                      </td>
                      <td className="stock-cell">{stateData.totalStock.toLocaleString()}</td>
                      <td>{stateData.hospitalCount}</td>
                      <td>{avgPerBank}</td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: statusColor }}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Government vs Private Comparison */}
        <div className="analytics-section">
          <h2>Government vs Private</h2>
          <div className="type-comparison">
            <div className="type-card government">
              <h3>Government Hospitals</h3>
              <div className="type-stats">
                <div className="type-stat">
                  <span className="type-label">Hospitals</span>
                  <span className="type-value">{stats.typeWiseData.government.length}</span>
                </div>
                <div className="type-stat">
                  <span className="type-label">Total Stock</span>
                  <span className="type-value">
                    {stats.typeWiseData.government.reduce((sum, h) => 
                      sum + Object.values(h.bloodStock).reduce((a, b) => a + b, 0), 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="type-stat">
                  <span className="type-label">Avg Capacity</span>
                  <span className="type-value">
                    {Math.round(stats.typeWiseData.government.reduce((sum, h) => sum + h.capacity, 0) / 
                      Math.max(stats.typeWiseData.government.length, 1))}
                  </span>
                </div>
              </div>
            </div>
            <div className="type-card private">
              <h3>Private Hospitals</h3>
              <div className="type-stats">
                <div className="type-stat">
                  <span className="type-label">Hospitals</span>
                  <span className="type-value">{stats.typeWiseData.private.length}</span>
                </div>
                <div className="type-stat">
                  <span className="type-label">Total Stock</span>
                  <span className="type-value">
                    {stats.typeWiseData.private.reduce((sum, h) => 
                      sum + Object.values(h.bloodStock).reduce((a, b) => a + b, 0), 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="type-stat">
                  <span className="type-label">Avg Capacity</span>
                  <span className="type-value">
                    {Math.round(stats.typeWiseData.private.reduce((sum, h) => sum + h.capacity, 0) / 
                      Math.max(stats.typeWiseData.private.length, 1))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Hospitals */}
        <div className="analytics-section">
          <h2>Top Performing Blood Banks</h2>
          <div className="top-hospitals">
            {bloodBankDatabase
              .sort((a, b) => {
                const stockA = Object.values(a.bloodStock).reduce((sum, val) => sum + val, 0);
                const stockB = Object.values(b.bloodStock).reduce((sum, val) => sum + val, 0);
                return stockB - stockA;
              })
              .slice(0, 5)
              .map((hospital, index) => {
                const totalStock = Object.values(hospital.bloodStock).reduce((sum, val) => sum + val, 0);
                const utilization = ((totalStock / hospital.capacity) * 100).toFixed(0);
                return (
                  <div key={hospital.id} className="top-hospital-card">
                    <div className="hospital-rank">#{index + 1}</div>
                    <div className="hospital-info">
                      <h4>{hospital.name}</h4>
                      <p>{hospital.city}, {hospital.state}</p>
                    </div>
                    <div className="hospital-metrics">
                      <div className="metric">
                        <span className="metric-label">Stock</span>
                        <span className="metric-value">{totalStock}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Utilization</span>
                        <span className="metric-value">{utilization}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Critical Blood Groups Alert */}
        <div className="analytics-section full-width">
          <h2>Critical Blood Groups Alert</h2>
          <div className="critical-alerts">
            {bloodGroups.map(bg => {
              const value = stats.totalBloodStock[bg] || 0;
              const isCritical = value < 200;
              if (!isCritical) return null;
              
              return (
                <div key={bg} className="critical-alert">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-content">
                    <h4>Blood Group {bg} is Critical</h4>
                    <p>Only {value} units available across all blood banks. Immediate action required.</p>
                  </div>
                  <button className="alert-action">Request Stock</button>
                </div>
              );
            })}
            {bloodGroups.every(bg => stats.totalBloodStock[bg] >= 200) && (
              <div className="no-alerts">
                <div className="success-icon">✓</div>
                <p>All blood groups are at safe levels</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="analytics-section full-width">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => navigate('/analytics/prediction')}>
              <FaChartLine />
              <span>Blood Demand Prediction</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/analytics/charts')}>
              <FaChartBar />
              <span>Interactive Charts</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/blood-inventory')}>
              <FaDroplet />
              <span>Manage Inventory</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/blood-banks')}>
              <FaMapLocationDot />
              <span>Blood Bank Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;