import React from 'react';
import { FaDroplet, FaHeart, FaShieldHalved } from 'react-icons/fa6';
import './styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <FaDroplet />
            <span>HRBMS</span>
          </div>
          <p className="footer-description">
            Hospital Resource and Blood Bank Management System - 
            Streamlining healthcare operations and saving lives.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/blood-inventory">Blood Inventory</a></li>
            <li><a href="/blood-requests">Blood Requests</a></li>
            <li><a href="/analytics">Analytics</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul className="footer-links">
            <li><a href="/reports">Reports</a></li>
            <li><a href="/appointments">Appointments</a></li>
            <li><a href="/settings">Settings</a></li>
            <li><a href="/notifications">Notifications</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul className="footer-links">
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/hipaa">HIPAA Compliance</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-features">
          <span className="footer-feature">
            <FaHeart /> Life-Saving Technology
          </span>
          <span className="footer-feature">
            <FaShieldHalved /> HIPAA Compliant
          </span>
        </div>
        <div className="footer-copyright">
          © {new Date().getFullYear()} HRBMS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;