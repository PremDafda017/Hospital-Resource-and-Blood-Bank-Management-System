import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaClockRotateLeft,
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaFilter,
  FaCalendar
} from 'react-icons/fa6';
import './BloodInventory.css';

function StockHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const mockHistory = [
        {
          id: 1,
          bloodType: 'O+',
          action: 'Added',
          units: 5,
          date: '2024-01-20',
          donorName: 'Robert Davis',
          storageLocation: 'Bank A-1'
        },
        {
          id: 2,
          bloodType: 'A-',
          action: 'Used',
          units: 2,
          date: '2024-01-19',
          patientName: 'John Smith',
          hospital: 'Main Hospital'
        },
        {
          id: 3,
          bloodType: 'B+',
          action: 'Added',
          units: 3,
          date: '2024-01-18',
          donorName: 'Lisa Thompson',
          storageLocation: 'Bank B-2'
        }
      ];
      
      setTimeout(() => {
        setHistory(mockHistory);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching history:', error);
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(record => {
    if (filterType === 'all') return true;
    return record.action.toLowerCase() === filterType;
  });

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading stock history...</p>
      </div>
    );
  }

  return (
    <div className="stock-history-page">
      <div className="page-header">
        <button className="btn-outline" onClick={() => navigate('/blood-inventory')}>
          <FaArrowLeft /> Back to Inventory
        </button>
        <div className="page-title-section">
          <div className="page-icon">
            <FaClockRotateLeft />
          </div>
          <div>
            <h1>Stock History</h1>
            <p>Track blood stock movements and transactions</p>
          </div>
        </div>
        <div></div>
      </div>

      <div className="page-filters">
        <div className="filter-dropdown">
          <FaFilter className="filter-icon" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Actions</option>
            <option value="added">Added</option>
            <option value="used">Used</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.length > 0 ? (
          filteredHistory.map(record => (
            <div key={record.id} className="history-item">
              <div className={`history-action-icon ${record.action.toLowerCase()}`}>
                {record.action === 'Added' ? <FaPlus /> : <FaMinus />}
              </div>
              <div className="history-details">
                <div className="history-header">
                  <h3>
                    {record.action} {record.units} units of {record.bloodType}
                  </h3>
                  <span className={`badge ${record.action === 'Added' ? 'badge-success' : 'badge-warning'}`}>
                    {record.action}
                  </span>
                </div>
                <div className="history-info">
                  <span><FaCalendar /> {record.date}</span>
                  {record.donorName && <span>Donor: {record.donorName}</span>}
                  {record.patientName && <span>Patient: {record.patientName}</span>}
                  {record.storageLocation && <span>Location: {record.storageLocation}</span>}
                  {record.hospital && <span>Hospital: {record.hospital}</span>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FaClockRotateLeft className="empty-icon" />
            <h3>No history found</h3>
            <p>No stock movements match your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StockHistory;