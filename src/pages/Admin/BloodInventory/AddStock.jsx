import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDroplet, FaUser, FaHospital } from 'react-icons/fa6';
import './BloodInventory.css';

function AddStock() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    bloodType: '',
    units: '',
    donationDate: '',
    donorName: '',
    donorId: '',
    expirationDate: '',
    storageLocation: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.bloodType || !formData.units || !formData.donationDate) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/blood-inventory');
    } catch (err) {
      setError('Failed to add stock. Please try again.');
      setLoading(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="add-stock-page">
      <div className="page-header">
        <button className="btn-outline" onClick={() => navigate('/blood-inventory')}>
          <FaArrowLeft /> Back to Inventory
        </button>
        <h1>Add Blood Stock</h1>
        <div></div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSubmit} className="stock-form">
        <div className="form-section">
          <h2><FaDroplet /> Blood Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Blood Type *</label>
              <select name="bloodType" value={formData.bloodType} onChange={handleChange} required>
                <option value="">Select Blood Type</option>
                {bloodTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Units *</label>
              <input type="number" name="units" value={formData.units} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Donation Date *</label>
              <input type="date" name="donationDate" value={formData.donationDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Expiration Date</label>
              <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2><FaUser /> Donor Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Donor Name</label>
              <input type="text" name="donorName" value={formData.donorName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Donor ID</label>
              <input type="text" name="donorId" value={formData.donorId} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2><FaHospital /> Storage Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Storage Location</label>
              <input type="text" name="storageLocation" value={formData.storageLocation} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={() => navigate('/blood-inventory')} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Adding Stock...' : 'Add Stock'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddStock;