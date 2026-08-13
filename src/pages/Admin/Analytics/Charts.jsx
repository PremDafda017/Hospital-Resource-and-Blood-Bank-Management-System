import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartBar, FaChartLine, FaChartPie } from 'react-icons/fa6';
import './Analytics.css';

function Charts() {
  const navigate = useNavigate();

  return (
    <div className="charts-page">
      <div className="page-header">
        <button className="btn-outline" onClick={() => navigate('/analytics')}>
          <FaArrowLeft /> Back to Analytics
        </button>
        <h1>Interactive Charts</h1>
        <div></div>
      </div>

      <div className="charts-grid">
        <div className="chart-section">
          <h2><FaChartBar /> Blood Type Distribution</h2>
          <div className="chart-placeholder">
            <p>Bar chart showing blood type distribution</p>
          </div>
        </div>

        <div className="chart-section">
          <h2><FaChartLine /> Monthly Trends</h2>
          <div className="chart-placeholder">
            <p>Line chart showing monthly donation trends</p>
          </div>
        </div>

        <div className="chart-section">
          <h2><FaChartPie /> Request Status</h2>
          <div className="chart-placeholder">
            <p>Pie chart showing request status breakdown</p>
          </div>
        </div>

        <div className="chart-section">
          <h2><FaChartBar /> Department Performance</h2>
          <div className="chart-placeholder">
            <p>Bar chart showing department performance metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Charts;