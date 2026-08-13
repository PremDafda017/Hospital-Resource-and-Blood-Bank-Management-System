import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartLine } from 'react-icons/fa6';
import './Analytics.css';

function BloodPrediction() {
  const navigate = useNavigate();

  return (
    <div className="blood-prediction-page">
      <div className="page-header">
        <button className="btn-outline" onClick={() => navigate('/analytics')}>
          <FaArrowLeft /> Back to Analytics
        </button>
        <h1>Blood Demand Prediction</h1>
        <div></div>
      </div>

      <div className="prediction-content">
        <div className="prediction-overview">
          <div className="prediction-card">
            <h3>Predicted Demand</h3>
            <p className="prediction-value">High</p>
            <p className="prediction-detail">Next 7 days</p>
          </div>
          <div className="prediction-card">
            <h3>Confidence</h3>
            <p className="prediction-value">94%</p>
            <p className="prediction-detail">AI Model</p>
          </div>
          <div className="prediction-card">
            <h3>Recommended Action</h3>
            <p className="prediction-value">Stock Up</p>
            <p className="prediction-detail">O+, A- types</p>
          </div>
        </div>

        <div className="prediction-chart">
          <h2><FaChartLine /> Demand Forecast</h2>
          <div className="chart-placeholder">
            <p>Demand forecast chart would appear here</p>
          </div>
        </div>

        <div className="prediction-factors">
          <h2>Key Factors</h2>
          <div className="factors-list">
            <div className="factor-item">
              <span className="factor-name">Seasonal Trends</span>
              <span className="factor-impact">High Impact</span>
            </div>
            <div className="factor-item">
              <span className="factor-name">Historical Data</span>
              <span className="factor-impact">Medium Impact</span>
            </div>
            <div className="factor-item">
              <span className="factor-name">Local Events</span>
              <span className="factor-impact">Low Impact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BloodPrediction;