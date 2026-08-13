import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHeartPulse, FaHospital } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import { bloodBankDatabase, states, citiesByState, getHospitalsByState } from '../../../data/hospitalData';
import './BloodRequests.css';

function CreateRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    bloodType: '', 
    units: '', 
    patientName: '', 
    urgency: 'Normal', 
    state: 'All States',
    city: 'All Cities',
    hospitalId: 'All'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.bloodType || !formData.units || !formData.patientName || formData.hospitalId === 'All') {
        setError('Please fill in all required fields including hospital selection');
        setLoading(false);
        return;
      }

      // Get existing requests from localStorage
      const existingRequests = JSON.parse(localStorage.getItem('bloodRequests') || '[]');

      // Get hospital details
      const hospital = bloodBankDatabase.find(h => h.id === parseInt(formData.hospitalId));
      
      // Create new request
      const newRequest = {
        id: Date.now(),
        bloodType: formData.bloodType,
        units: parseInt(formData.units),
        patient: formData.patientName,
        urgency: formData.urgency,
        hospitalId: parseInt(formData.hospitalId),
        hospital: hospital ? hospital.name : 'Unknown Hospital',
        state: hospital ? hospital.state : '',
        city: hospital ? hospital.city : '',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
      };

      // Add to existing requests
      const updatedRequests = [newRequest, ...existingRequests];
      localStorage.setItem('bloodRequests', JSON.stringify(updatedRequests));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate back to list
      navigate('/blood-requests');
    } catch (err) {
      setError('Failed to create request. Please try again.');
      setLoading(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <DashboardLayout title="Request Intake Ledger" subtitle="Lodge an emergency blood allocation order" activeTab="/blood-requests">
      <div className="create-request-page">
        <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => navigate('/blood-requests')}>
            <FaArrowLeft /> Back to Requests
          </button>
          <h2>New Allocation Request</h2>
          <div />
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-section">
            <h2><FaHeartPulse /> Allocation Entry Profile</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Blood Type *</label>
                <select value={formData.bloodType} onChange={(e) => setFormData({...formData, bloodType: e.target.value})} required>
                  <option value="">Select Blood Type</option>
                  {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Units *</label>
                <input type="number" value={formData.units} onChange={(e) => setFormData({...formData, units: e.target.value})} required min="1" />
              </div>
              <div className="form-group">
                <label>Patient Name *</label>
                <input type="text" value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Urgency *</label>
                <select value={formData.urgency} onChange={(e) => setFormData({...formData, urgency: e.target.value})}>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label>State *</label>
                <select 
                  value={formData.state} 
                  onChange={(e) => {
                    setFormData({...formData, state: e.target.value, city: 'All Cities', hospitalId: 'All'});
                  }}
                  required
                >
                  <option value="All States">Select State</option>
                  {states.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              {formData.state !== 'All States' && (
                <div className="form-group">
                  <label>City *</label>
                  <select 
                    value={formData.city} 
                    onChange={(e) => {
                      setFormData({...formData, city: e.target.value, hospitalId: 'All'});
                    }}
                    required
                  >
                    <option value="All Cities">Select City</option>
                    {citiesByState[formData.state]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              )}
              {formData.state !== 'All States' && formData.city !== 'All Cities' && (
                <div className="form-group">
                  <label>Hospital *</label>
                  <select 
                    value={formData.hospitalId} 
                    onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                    required
                  >
                    <option value="All">Select Hospital</option>
                    {getHospitalsByState(formData.state).filter(h => h.city === formData.city).map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={() => navigate('/blood-requests')} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting Request...' : 'Lodge Request'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default CreateRequest;
