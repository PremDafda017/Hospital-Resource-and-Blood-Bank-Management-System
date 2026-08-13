import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaHandHoldingMedical, FaDroplet, FaPhone } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout.jsx';
import './Donors.css';

function AddDonor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    lastDonation: '',
    totalDonations: 0
  });

  useEffect(() => {
    if (isEditMode) {
      const storedDonors = localStorage.getItem('donors');
      if (storedDonors) {
        const donorsList = JSON.parse(storedDonors);
        const donor = donorsList.find(item => String(item.id) === String(id));
        if (donor) {
          const nameParts = donor.name ? donor.name.split(' ') : ['', ''];
          setFormData({
            firstName: donor.firstName || nameParts[0] || '',
            lastName: donor.lastName || nameParts.slice(1).join(' ') || '',
            dateOfBirth: donor.dateOfBirth || '',
            gender: donor.gender || '',
            bloodType: donor.bloodType || '',
            email: donor.email || '',
            phone: donor.phone || '',
            address: donor.address || '',
            emergencyContact: donor.emergencyContact || '',
            emergencyPhone: donor.emergencyPhone || '',
            medicalConditions: donor.medicalConditions || '',
            lastDonation: donor.lastDonation || '',
            totalDonations: donor.totalDonations || 0
          });
        }
      }
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.firstName || !formData.lastName || !formData.bloodType || !formData.phone) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const existingDonors = JSON.parse(localStorage.getItem('donors') || '[]');

      if (isEditMode) {
        const updatedDonors = existingDonors.map(d => {
          if (String(d.id) === String(id)) {
            return {
              ...d,
              name: `${formData.firstName} ${formData.lastName}`,
              firstName: formData.firstName,
              lastName: formData.lastName,
              bloodType: formData.bloodType,
              email: formData.email,
              phone: formData.phone,
              dateOfBirth: formData.dateOfBirth,
              gender: formData.gender,
              address: formData.address,
              emergencyContact: formData.emergencyContact,
              emergencyPhone: formData.emergencyPhone,
              medicalConditions: formData.medicalConditions,
              lastDonation: formData.lastDonation,
              totalDonations: parseInt(formData.totalDonations) || 0
            };
          }
          return d;
        });
        localStorage.setItem('donors', JSON.stringify(updatedDonors));
      } else {
        const newDonor = {
          id: Date.now(),
          name: `${formData.firstName} ${formData.lastName}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          bloodType: formData.bloodType,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          medicalConditions: formData.medicalConditions,
          lastDonation: formData.lastDonation,
          totalDonations: parseInt(formData.totalDonations) || 0,
          status: 'Active'
        };
        const updatedDonors = [newDonor, ...existingDonors];
        localStorage.setItem('donors', JSON.stringify(updatedDonors));
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/donors');
    } catch (err) {
      setError('Failed to save donor details. Please try again.');
      setLoading(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];

  return (
    <DashboardLayout 
      title={isEditMode ? "Modify Donor Dossier" : "Donor Intake Registration"} 
      subtitle="Input donor credential profile details to save" 
      activeTab="/donors"
    >
      <div className="add-donor-page">
        <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => navigate('/donors')}>
            <FaArrowLeft /> Back to Donors
          </button>
          <h2>{isEditMode ? "Modify Donor File" : "New Donor Admission"}</h2>
          <div />
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="donor-form">
          <div className="form-section">
            <h2><FaHandHoldingMedical /> Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  {genders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Blood Type *</label>
                <select name="bloodType" value={formData.bloodType} onChange={handleChange} required>
                  <option value="">Select Blood Type</option>
                  {bloodTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2><FaPhone /> Emergency Contact</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2><FaDroplet /> Donation Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Last Donation Date</label>
                <input type="date" name="lastDonation" value={formData.lastDonation} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Total Donations</label>
                <input type="number" name="totalDonations" value={formData.totalDonations} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Medical Conditions</label>
                <input type="text" name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={() => navigate('/donors')} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update Donor' : 'Add Donor')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default AddDonor;
