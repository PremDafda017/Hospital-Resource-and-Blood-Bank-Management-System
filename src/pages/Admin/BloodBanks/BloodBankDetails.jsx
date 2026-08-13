import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBuilding, FaPhone, FaEnvelope, FaClock, FaDroplet, FaPencil } from 'react-icons/fa6';
import './BloodBanks.css';

function BloodBankDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bloodBank, setBloodBank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBloodBankDetails = async () => {
      try {
        const mockBloodBank = {
          id: id,
          name: 'Central Blood Bank',
          address: '123 Medical Center Dr',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          phone: '555-0401',
          email: 'central@bloodbank.com',
          hours: '24/7',
          totalStock: 150,
          status: 'Active',
          manager: 'Dr. John Smith',
          licenseNumber: 'BB-NY-001'
        };

        setTimeout(() => {
          setBloodBank(mockBloodBank);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching blood bank details:', error);
        setLoading(false);
      }
    };
    fetchBloodBankDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading blood bank details...</p>
      </div>
    );
  }

  if (!bloodBank) {
    return (
      <div className="empty-state">
        <h3>Blood bank not found</h3>
        <button className="btn-primary" onClick={() => navigate('/blood-banks')}>
          Back to Blood Banks
        </button>
      </div>
    );
  }

  return (
    <div className="blood-bank-details-page">
      <div className="page-header">
        <button className="btn-outline" onClick={() => navigate('/blood-banks')}>
          <FaArrowLeft /> Back to Blood Banks
        </button>
        <h1>Blood Bank Details</h1>
        <button className="btn-secondary" onClick={() => navigate(`/blood-banks/${id}/edit`)}>
          <FaPencil /> Edit
        </button>
      </div>

      <div className="blood-bank-details-container">
        <div className="detail-card blood-bank-header-card">
          <div className="blood-bank-icon-large">
            <FaBuilding />
          </div>
          <div className="blood-bank-header-info">
            <h2>{bloodBank.name}</h2>
            <div className="blood-bank-status badge-success">{bloodBank.status}</div>
            <div className="blood-bank-basic-info">
              <span><FaDroplet /> {bloodBank.totalStock} units in stock</span>
              <span><FaClock /> {bloodBank.hours}</span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3><FaBuilding /> Location Information</h3>
          <div className="detail-grid">
            <div className="detail-row"><label>Address</label><span>{bloodBank.address}</span></div>
            <div className="detail-row"><label>City</label><span>{bloodBank.city}</span></div>
            <div className="detail-row"><label>State</label><span>{bloodBank.state}</span></div>
            <div className="detail-row"><label>ZIP Code</label><span>{bloodBank.zipCode}</span></div>
          </div>
        </div>

        <div className="detail-card">
          <h3><FaPhone /> Contact Information</h3>
          <div className="detail-grid">
            <div className="detail-row"><label>Phone</label><span><FaPhone /> {bloodBank.phone}</span></div>
            <div className="detail-row"><label>Email</label><span><FaEnvelope /> {bloodBank.email}</span></div>
          </div>
        </div>

        <div className="detail-card">
          <h3><FaBuilding /> Management Information</h3>
          <div className="detail-grid">
            <div className="detail-row"><label>Manager</label><span>{bloodBank.manager}</span></div>
            <div className="detail-row"><label>License Number</label><span>{bloodBank.licenseNumber}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BloodBankDetails;