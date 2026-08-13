import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLocationDot, FaBuilding } from 'react-icons/fa6';
import './BloodBanks.css';

function BloodBankMap() {
  const navigate = useNavigate();
  const [bloodBanks, setBloodBanks] = useState([]);

  useEffect(() => {
    const mockBloodBanks = [
      { id: 1, name: 'Central Blood Bank', lat: 40.7128, lng: -74.0060, city: 'New York' },
      { id: 2, name: 'Riverside Blood Center', lat: 40.6782, lng: -73.9442, city: 'Brooklyn' }
    ];
    setBloodBanks(mockBloodBanks);
  }, []);

  return (
    <div className="blood-bank-map-page">
      <div className="page-header">
        <button className="btn-outline" onClick={() => navigate('/blood-banks')}>
          <FaArrowLeft /> Back to Blood Banks
        </button>
        <h1>Blood Bank Map</h1>
        <div></div>
      </div>

      <div className="map-container">
        <div className="map-placeholder">
          <FaLocationDot className="map-icon" />
          <h2>Interactive Map</h2>
          <p>Showing {bloodBanks.length} blood bank locations</p>
        </div>

        <div className="map-sidebar">
          <h3>Blood Bank Locations</h3>
          <div className="location-list">
            {bloodBanks.map(bank => (
              <div key={bank.id} className="location-item">
                <div className="location-icon">
                  <FaBuilding />
                </div>
                <div className="location-info">
                  <h4>{bank.name}</h4>
                  <p>{bank.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BloodBankMap;